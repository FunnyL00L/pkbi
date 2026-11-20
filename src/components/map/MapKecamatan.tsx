import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  RotateCcw,
  FileBarChart2,
  Map as MapIcon,
  Search,
  X,
  Users,
  ArrowLeft,
  ChevronRight,
  Lock,
  Plus,
  MapPin,
  Pencil,
} from 'lucide-react';
import { DATA_BULELENG_GEOJSON } from '../../data/bulelengGeoJson';
import { DATA_DESA_BULELENG_GEOJSON } from '../../data/bulelengDesaGeoJson';
import { KECAMATAN_LIST } from '../../data/bulelengData';
import { EccdVillageAgendaItem, EccdVillageMarker } from '../../types';
import { EccdVillageDetailDrawer } from './EccdVillageDetailDrawer';
import { AdminAgendaModal } from './AdminAgendaModal';
import { AdminVillageModal } from './AdminVillageModal';
import { LaporanKegiatanPanel } from './LaporanKegiatanPanel';
import { BlogArticleModal, BlogArticleData } from '../ui/BlogArticleModal';
import { useAppTheme } from '../../context/ThemeContext';
import { useAdminAuth } from '../../context/AuthContext';
import { useCmsData } from '../../context/CmsContext';
import { I18N } from '../../constants/i18n';
import {
  BULELENG_CENTER,
  KECAMATAN_COLORS,
  KECAMATAN_ID_TO_CANONICAL,
  BulelengBoundaryData,
  EnrichedVillageDot,
  buildLocalFallbackBoundaryData,
  fetchRealtimeBulelengBoundaries,
  buildVillageDotsForKecamatan,
  getKecamatanColorById,
  computeKabupatenLockBounds,
  shouldAutoZoomOutOnBoundaryPush,
  resolveVillageBoundaryFeature,
  normalizeVillageNameKey,
} from '../../utils/bulelengOsmMap';

interface MapKecamatanProps {
  viewMode?: 'peta' | 'laporan';
  onViewModeChange?: (mode: 'peta' | 'laporan') => void;
  onNavigateToCatin?: () => void;
}

type VillageDotMarker = EnrichedVillageDot;

interface SearchSuggestion {
  type: 'kecamatan' | 'desa';
  id: string;
  title: string;
  subtitle: string;
  kecamatanId: string;
  color: string;
  village?: VillageDotMarker;
}

const SATELLITE_TILE_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

const KEC_LABEL_OFFSETS: Record<string, [number, number]> = {
  buleleng: [-14, -14],
  sawan: [-12, 6],
  kubutambahan: [18, 12],
  sukasada: [0, 8],
  tejakula: [10, -4],
};

export const MapKecamatan: React.FC<MapKecamatanProps> = ({
  viewMode = 'peta',
  onViewModeChange,
}) => {
  const { language } = useAppTheme();
  const { isAdminMode } = useAdminAuth();
  const {
    villages: eccdVillages,
    upsertVillage,
    upsertVillageAgenda,
    removeVillageAgenda,
  } = useCmsData();
  const t = I18N[language];

  const fallbackGalleryImage = useMemo(
    () => eccdVillages[0]?.agendaList[0]?.galleryImages[0] || '',
    [eccdVillages]
  );

  // Authentic OpenStreetMap 9-Kecamatan + 27-Desa boundaries loaded instantly, then enriched live via Overpass OSM
  const [boundaryData, setBoundaryData] = useState<BulelengBoundaryData>(() =>
    buildLocalFallbackBoundaryData(DATA_BULELENG_GEOJSON, DATA_DESA_BULELENG_GEOJSON)
  );

  // Drill-down hierarchy: Kabupaten (null) -> Kecamatan (activeKecId) -> Desa Polygon (activeVillage)
  const [internalMode, setInternalMode] = useState<'peta' | 'laporan'>(viewMode);
  const [activeKecId, setActiveKecId] = useState<string | null>(null);
  const [activeVillage, setActiveVillage] = useState<VillageDotMarker | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showEmptyVillagesInList, setShowEmptyVillagesInList] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [boundaryNotice, setBoundaryNotice] = useState<string | null>(null);

  // Admin Agenda & Village CRUD modal state (used only when isAdminMode === true)
  const [adminAgendaModalOpen, setAdminAgendaModalOpen] = useState(false);
  const [adminAgendaDefaultVillageId, setAdminAgendaDefaultVillageId] = useState<string | undefined>(undefined);
  const [editingAgenda, setEditingAgenda] = useState<EccdVillageAgendaItem | null>(null);
  const [adminVillageModalOpen, setAdminVillageModalOpen] = useState(false);
  const [editingVillage, setEditingVillage] = useState<EccdVillageMarker | null>(null);

  // Report & article modals
  const [reportFilterKecId, setReportFilterKecId] = useState<string>('all');
  const [reportFilterVillageId, setReportFilterVillageId] = useState<string>('all');
  const [activeArticle, setActiveArticle] = useState<BlogArticleData | null>(null);

  // Leaflet refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupsRef = useRef<{
    masking: L.LayerGroup;
    kabupaten: L.LayerGroup;
    kecamatan: L.LayerGroup;
    desaOutlines: L.LayerGroup;
    selectedDesaPolygon: L.LayerGroup;
    desaDots: L.LayerGroup;
    labels: L.LayerGroup;
  } | null>(null);
  const kecamatanLayersMapRef = useRef<Map<string, L.GeoJSON>>(new Map());
  const baseZoomRef = useRef<number>(10);
  const dragPointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const dragPointerLastRef = useRef<{ x: number; y: number } | null>(null);
  const noticeTimerRef = useRef<number | null>(null);

  const lockBounds = useMemo(
    () => computeKabupatenLockBounds(boundaryData.kabupatenGeoJSON, 0.014),
    [boundaryData.kabupatenGeoJSON]
  );
  const lockBoundsRef = useRef(lockBounds);
  lockBoundsRef.current = lockBounds;

  const showBoundaryNotice = useCallback((msg: string) => {
    setBoundaryNotice(msg);
    if (noticeTimerRef.current) {
      window.clearTimeout(noticeTimerRef.current);
    }
    noticeTimerRef.current = window.setTimeout(() => {
      setBoundaryNotice(null);
    }, 2800);
  }, []);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    setInternalMode(viewMode);
  }, [viewMode]);

  const switchMode = (mode: 'peta' | 'laporan') => {
    setInternalMode(mode);
    onViewModeChange?.(mode);
  };

  // Realtime Overpass API (OpenStreetMap) sync in background — keeps all 148 embedded official Buleleng village polygons intact
  useEffect(() => {
    let cancelled = false;
    fetchRealtimeBulelengBoundaries(false)
      .then((liveData) => {
        if (!cancelled && liveData.kecamatanFeatures.length >= 9) {
          setBoundaryData((prev) => {
            // Keep all 148 authentic embedded BPS village polygons as authoritative base,
            // and only append any extra OSM admin_level=7 polygons not already covered.
            const existingKeys = new Set(
              prev.desaFeatures.map(
                (f) => `${f.properties._kecamatanId}::${normalizeVillageNameKey(f.properties._cleanName)}`
              )
            );
            const mergedDesa = [...prev.desaFeatures];
            for (const liveDesa of liveData.desaFeatures) {
              const key = `${liveDesa.properties._kecamatanId}::${normalizeVillageNameKey(liveDesa.properties._cleanName)}`;
              if (!existingKeys.has(key)) {
                mergedDesa.push(liveDesa);
              }
            }
            return {
              ...liveData,
              desaFeatures: mergedDesa,
            };
          });
        }
      })
      .catch(() => {
        // Keep embedded authentic 9-Kecamatan & 148-Desa official administrative polygons seamlessly
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Precompute village dots per Kecamatan
  const villageDotsByKec = useMemo(() => {
    const map = new Map<string, VillageDotMarker[]>();
    for (const kec of KECAMATAN_LIST) {
      map.set(
        kec.id,
        buildVillageDotsForKecamatan(
          kec.id,
          boundaryData.desaFeatures,
          eccdVillages,
          fallbackGalleryImage
        )
      );
    }
    return map;
  }, [boundaryData.desaFeatures, eccdVillages, fallbackGalleryImage]);

  // Village dots are ONLY visible after the user picks a Kecamatan (ALL villages in that Kecamatan are plotted: Blue = has data, Grey = empty)
  const activeVillageDots = useMemo<VillageDotMarker[]>(() => {
    if (!activeKecId) return [];
    const list = villageDotsByKec.get(activeKecId) || [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.kecamatanName.toLowerCase().includes(q)
    );
  }, [activeKecId, villageDotsByKec, searchQuery]);

  const activeBlueDotsCount = useMemo(
    () => activeVillageDots.filter((v) => v.hasData).length,
    [activeVillageDots]
  );
  const activeGreyDotsCount = useMemo(
    () => activeVillageDots.filter((v) => !v.hasData).length,
    [activeVillageDots]
  );

  // Below-map card list hides empty (grey) villages by default unless searching or toggled on
  const listedVillageCards = useMemo<VillageDotMarker[]>(() => {
    if (showEmptyVillagesInList || searchQuery.trim().length > 0) {
      return activeVillageDots;
    }
    return activeVillageDots.filter((v) => v.hasData);
  }, [activeVillageDots, showEmptyVillagesInList, searchQuery]);

  // Keep activeVillage synced with latest Firestore CMS agendas when updated/deleted
  useEffect(() => {
    if (!activeVillage) return;
    const latestDots = villageDotsByKec.get(activeVillage.kecamatanId) || [];
    const refreshed = latestDots.find((v) => v.id === activeVillage.id);
    if (refreshed && refreshed !== activeVillage) {
      setActiveVillage(refreshed);
    }
  }, [villageDotsByKec, activeVillage]);

  // Active village resolved real boundary polygon
  const activeVillagePolygon = useMemo(() => {
    if (!activeVillage) return null;
    return resolveVillageBoundaryFeature(
      activeVillage,
      boundaryData.desaFeatures,
      boundaryData.kecamatanFeatures
    );
  }, [activeVillage, boundaryData.desaFeatures, boundaryData.kecamatanFeatures]);

  // Search autocomplete across Kecamatan & Desa
  const searchSuggestions = useMemo<SearchSuggestion[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const results: SearchSuggestion[] = [];

    for (const kec of KECAMATAN_LIST) {
      const shortName = kec.name.replace('Kecamatan ', '');
      if (shortName.toLowerCase().includes(q) || kec.name.toLowerCase().includes(q)) {
        const count = villageDotsByKec.get(kec.id)?.length || 0;
        results.push({
          type: 'kecamatan',
          id: `kec-${kec.id}`,
          title: `Kecamatan ${shortName}`,
          subtitle: `${count} titik desa · Klik untuk zoom wilayah`,
          kecamatanId: kec.id,
          color: getKecamatanColorById(kec.id),
        });
      }
    }

    for (const kec of KECAMATAN_LIST) {
      const dots = villageDotsByKec.get(kec.id) || [];
      for (const dot of dots) {
        if (dot.name.toLowerCase().includes(q)) {
          results.push({
            type: 'desa',
            id: dot.id,
            title: dot.name,
            subtitle: dot.hasData
              ? `${dot.kecamatanName.replace('Kecamatan ', 'Kec. ')} · ${dot.serviceData.totalRecipients} Layanan (Ada Data)`
              : `${dot.kecamatanName.replace('Kecamatan ', 'Kec. ')} · Belum ada data layanan`,
            kecamatanId: dot.kecamatanId,
            color: dot.hasData ? '#2563eb' : '#94a3b8',
            village: dot,
          });
        }
      }
    }

    return results.slice(0, 12);
  }, [searchQuery, villageDotsByKec]);

  const activeKecMeta = useMemo(
    () => (activeKecId ? KECAMATAN_LIST.find((k) => k.id === activeKecId) || null : null),
    [activeKecId]
  );

  // Fit viewport tightly to Kabupaten Buleleng & update strict minZoom lock
  const fitMapToKabupaten = useCallback(
    (animate = true) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      const lb = lockBoundsRef.current;
      const leafletLock = L.latLngBounds([lb.south, lb.west], [lb.north, lb.east]);
      map.setMaxBounds(leafletLock);

      const fitZoom = map.getBoundsZoom(leafletLock, false, L.point(12, 12));
      const clampedMinZoom = Math.max(8.5, Math.min(11, fitZoom));
      baseZoomRef.current = clampedMinZoom;
      map.setMinZoom(clampedMinZoom);

      map.fitBounds(leafletLock, {
        padding: [12, 12],
        maxZoom: Math.max(10.5, clampedMinZoom),
        animate,
      });
    },
    []
  );

  const handleResetToKabupaten = useCallback(() => {
    setActiveKecId(null);
    setActiveVillage(null);
    setIsDrawerOpen(false);
    setSearchQuery('');
    setIsSearchFocused(false);
    fitMapToKabupaten(true);
  }, [fitMapToKabupaten]);

  const handleResetToKabupatenRef = useRef(handleResetToKabupaten);
  handleResetToKabupatenRef.current = handleResetToKabupaten;

  const selectKecamatan = useCallback((kecId: string) => {
    const normalized = kecId.toLowerCase();
    setActiveKecId(normalized);
    setActiveVillage(null);
    setIsDrawerOpen(false);
    setIsSearchFocused(false);

    const map = mapInstanceRef.current;
    const kecLayer = kecamatanLayersMapRef.current.get(normalized);
    if (map && kecLayer) {
      const bounds = kecLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [34, 34], maxZoom: 13 });
      }
    }
  }, []);

  // Select a village -> highlight its real OSM village polygon & zoom straight into its village boundary!
  const handleSelectVillagePolygon = useCallback((village: VillageDotMarker) => {
    setActiveKecId(village.kecamatanId);
    setActiveVillage(village);
    setIsSearchFocused(false);
  }, []);

  const handleBackToKecamatan = useCallback(() => {
    if (!activeKecId) {
      handleResetToKabupaten();
      return;
    }
    setActiveVillage(null);
    setIsDrawerOpen(false);
    const map = mapInstanceRef.current;
    const kecLayer = kecamatanLayersMapRef.current.get(activeKecId);
    if (map && kecLayer && kecLayer.getBounds().isValid()) {
      map.fitBounds(kecLayer.getBounds(), { padding: [34, 34], maxZoom: 13 });
    }
  }, [activeKecId, handleResetToKabupaten]);

  // 1. Initialize Leaflet Map with Satellite Basemap & Strict Kabupaten Buleleng Boundary Lock
  useEffect(() => {
    if (internalMode !== 'peta') return;
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const lb = lockBoundsRef.current;
    const initialLockBounds = L.latLngBounds([lb.south, lb.west], [lb.north, lb.east]);

    const map = L.map(mapContainerRef.current, {
      center: BULELENG_CENTER,
      zoom: 9.5,
      minZoom: 8.5,
      maxZoom: 17,
      zoomSnap: 0.5,
      zoomDelta: 0.5,
      maxBounds: initialLockBounds,
      maxBoundsViscosity: 1.0,
      bounceAtZoomLimits: true,
      worldCopyJump: false,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.control.scale({ position: 'bottomleft', imperial: false }).addTo(map);

    L.tileLayer(SATELLITE_TILE_URL, {
      attribution: 'Tiles &copy; Esri',
      maxZoom: 18,
    }).addTo(map);

    const groups = {
      masking: L.layerGroup().addTo(map),
      kabupaten: L.layerGroup().addTo(map),
      kecamatan: L.layerGroup().addTo(map),
      desaOutlines: L.layerGroup().addTo(map),
      selectedDesaPolygon: L.layerGroup().addTo(map),
      desaDots: L.layerGroup().addTo(map),
      labels: L.layerGroup().addTo(map),
    };

    layerGroupsRef.current = groups;
    mapInstanceRef.current = map;

    // Track pointer/touch drag vector to detect forced dragging past Buleleng outer boundary
    const containerEl = mapContainerRef.current;
    const onPointerDown = (ev: PointerEvent) => {
      dragPointerStartRef.current = { x: ev.clientX, y: ev.clientY };
      dragPointerLastRef.current = { x: ev.clientX, y: ev.clientY };
    };
    const onPointerMove = (ev: PointerEvent) => {
      if (dragPointerStartRef.current) {
        dragPointerLastRef.current = { x: ev.clientX, y: ev.clientY };
      }
    };
    const onPointerUp = () => {
      window.setTimeout(() => {
        dragPointerStartRef.current = null;
        dragPointerLastRef.current = null;
      }, 60);
    };

    containerEl.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });

    // If user forces a drag outside Buleleng while zoomed in (e.g. east past Tejakula),
    // automatically zoom back out and show the locked Kabupaten Buleleng overview!
    map.on('dragend', () => {
      const startPt = dragPointerStartRef.current;
      const lastPt = dragPointerLastRef.current;
      if (!startPt || !lastPt) return;

      const vb = map.getBounds();
      const pushedPastEdge = shouldAutoZoomOutOnBoundaryPush({
        currentZoom: map.getZoom(),
        baseZoom: baseZoomRef.current,
        viewportBounds: {
          south: vb.getSouth(),
          west: vb.getWest(),
          north: vb.getNorth(),
          east: vb.getEast(),
        },
        lockBounds: lockBoundsRef.current,
        pointerDeltaX: lastPt.x - startPt.x,
        pointerDeltaY: lastPt.y - startPt.y,
      });

      if (pushedPastEdge) {
        handleResetToKabupatenRef.current();
        showBoundaryNotice(
          'Batas peta terkunci di wilayah Kabupaten Buleleng — kembali ke tampilan Kabupaten.'
        );
      }
    });

    const timer = window.setTimeout(() => {
      map.invalidateSize();
      fitMapToKabupaten(false);
    }, 180);

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
      const b = lockBoundsRef.current;
      const leafletLock = L.latLngBounds([b.south, b.west], [b.north, b.east]);
      const nextBase = Math.max(8.5, Math.min(11, map.getBoundsZoom(leafletLock, false, L.point(12, 12))));
      baseZoomRef.current = nextBase;
      map.setMinZoom(nextBase);
    });
    resizeObserver.observe(containerEl);

    return () => {
      window.clearTimeout(timer);
      resizeObserver.disconnect();
      containerEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      map.remove();
      mapInstanceRef.current = null;
      layerGroupsRef.current = null;
      kecamatanLayersMapRef.current.clear();
    };
  }, [internalMode, fitMapToKabupaten, showBoundaryNotice]);

  // 2. Render Dark Focus-Buleleng Masking + Kabupaten Border & Sync Strict Lock Bounds
  useEffect(() => {
    const groups = layerGroupsRef.current;
    const map = mapInstanceRef.current;
    if (!groups || !map) return;

    const leafletLock = L.latLngBounds(
      [lockBounds.south, lockBounds.west],
      [lockBounds.north, lockBounds.east]
    );
    map.setMaxBounds(leafletLock);

    groups.masking.clearLayers();
    if (boundaryData.maskGeoJSON) {
      L.geoJSON(boundaryData.maskGeoJSON, {
        style: {
          fillColor: '#050b16',
          fillOpacity: 0.68,
          stroke: false,
          interactive: false,
        },
      }).addTo(groups.masking);
    }

    groups.kabupaten.clearLayers();
    if (boundaryData.kabupatenGeoJSON) {
      L.geoJSON(boundaryData.kabupatenGeoJSON, {
        style: {
          color: '#0f172a',
          weight: 3.5,
          opacity: 0.85,
          fill: false,
          interactive: false,
        },
      }).addTo(groups.kabupaten);
    }
  }, [boundaryData, lockBounds, internalMode]);

  // 3. Render 9 Color-Coded Organic Kecamatan Boundaries + Dark Glass "KEC. ..." Labels
  useEffect(() => {
    const groups = layerGroupsRef.current;
    if (!groups) return;

    groups.kecamatan.clearLayers();
    groups.labels.clearLayers();
    kecamatanLayersMapRef.current.clear();

    boundaryData.kecamatanFeatures.forEach((feature) => {
      const kecId = feature.properties._kecamatanId;
      const kecName = feature.properties._cleanName;
      const color = KECAMATAN_COLORS[kecName] || '#3b82f6';
      const isAllMode = activeKecId === null;
      const isSelected = activeKecId === kecId;
      const hasFocusedVillage = Boolean(activeVillage);

      const defaultWeight = isSelected ? (hasFocusedVillage ? 2.2 : 3.2) : 2.5;
      const defaultOpacity = isAllMode || isSelected ? (hasFocusedVillage && isSelected ? 0.65 : 0.96) : 0.22;
      const defaultFillOpacity = isSelected
        ? hasFocusedVillage
          ? 0.06
          : 0.14
        : isAllMode
          ? 0.24
          : 0.04;

      const kecLayer = L.geoJSON(feature, {
        style: {
          color,
          weight: defaultWeight,
          opacity: defaultOpacity,
          fillColor: color,
          fillOpacity: defaultFillOpacity,
        },
        onEachFeature: (_feat, lyr) => {
          lyr.on({
            mouseover: (e) => {
              if (hasFocusedVillage && isSelected) return;
              const target = e.target as L.Path;
              target.setStyle({
                fillOpacity: isSelected ? 0.24 : 0.36,
                weight: 3.4,
              });
            },
            mouseout: (e) => {
              if (hasFocusedVillage && isSelected) return;
              const target = e.target as L.Path;
              target.setStyle({
                fillOpacity: defaultFillOpacity,
                weight: defaultWeight,
              });
            },
            click: () => {
              selectKecamatan(kecId);
            },
          });
        },
      });

      kecamatanLayersMapRef.current.set(kecId, kecLayer);
      kecLayer.addTo(groups.kecamatan);

      // Show "KEC. ..." labels on Kabupaten view, or on selected Kecamatan when no specific village is focused
      if (isAllMode || (isSelected && !hasFocusedVillage)) {
        const offsetPair = isAllMode ? KEC_LABEL_OFFSETS[kecId] || [0, 0] : [0, 0];
        const labelTooltip = L.tooltip({
          permanent: true,
          direction: 'center',
          offset: L.point(offsetPair[0], offsetPair[1]),
          className: 'kecamatan-label',
        })
          .setContent(`KEC. ${kecName.toUpperCase()}`)
          .setLatLng([feature.properties._centerLat, feature.properties._centerLng]);

        labelTooltip.addTo(groups.labels);
      }
    });

    const map = mapInstanceRef.current;
    if (map && !activeVillage) {
      if (activeKecId) {
        const target = kecamatanLayersMapRef.current.get(activeKecId);
        if (target && target.getBounds().isValid()) {
          map.fitBounds(target.getBounds(), { padding: [34, 34], maxZoom: 13 });
        }
      } else {
        fitMapToKabupaten(false);
      }
    }
  }, [boundaryData, activeKecId, activeVillage, selectKecamatan, fitMapToKabupaten, internalMode]);

  // 4. Render Village Outlines, Selected Village Boundary POLYGON, and Village Dots ("titik-titik") ONLY after Kecamatan is chosen
  useEffect(() => {
    const groups = layerGroupsRef.current;
    const map = mapInstanceRef.current;
    if (!groups || !map) return;

    groups.desaOutlines.clearLayers();
    groups.selectedDesaPolygon.clearLayers();
    groups.desaDots.clearLayers();

    // Kabupaten-first rule: zero village dots or polygons until user chooses a Kecamatan
    if (!activeKecId) return;

    const kecColor = getKecamatanColorById(activeKecId);

    // 4a. Crisp administrative boundary polygons for ALL villages inside the selected Kecamatan (clickable to select that village!)
    const desaPolysInKec = boundaryData.desaFeatures.filter(
      (d) => d.properties._kecamatanId === activeKecId
    );
    desaPolysInKec.forEach((feat) => {
      const isFocusedPoly =
        activeVillage &&
        (String(feat.properties.villageId || '') === activeVillage.id ||
          normalizeVillageNameKey(feat.properties._cleanName) ===
            normalizeVillageNameKey(activeVillage.name));
      if (isFocusedPoly) return; // drawn prominently in selectedDesaPolygon layer below

      const matchingDot = activeVillageDots.find(
        (v) =>
          v.id === String(feat.properties.villageId || '') ||
          normalizeVillageNameKey(v.name) === normalizeVillageNameKey(feat.properties._cleanName)
      );
      const hasData = Boolean(matchingDot?.hasData);
      const baseStroke = hasData ? '#93c5fd' : '#e2e8f0';
      const baseFill = hasData ? '#2563eb' : kecColor;
      const baseOpacity = activeVillage ? 0.42 : hasData ? 0.9 : 0.78;
      const baseFillOpacity = activeVillage ? 0.04 : hasData ? 0.14 : 0.07;

      L.geoJSON(feat, {
        style: {
          color: baseStroke,
          weight: hasData ? 1.6 : 1.3,
          dashArray: '4, 4',
          opacity: baseOpacity,
          fillColor: baseFill,
          fillOpacity: baseFillOpacity,
        },
        onEachFeature: (_f, lyr) => {
          if (!matchingDot) return;
          lyr.on({
            mouseover: (e) => {
              (e.target as L.Path).setStyle({
                weight: 2.4,
                opacity: 1,
                fillOpacity: 0.24,
              });
            },
            mouseout: (e) => {
              (e.target as L.Path).setStyle({
                weight: hasData ? 1.6 : 1.3,
                opacity: baseOpacity,
                fillOpacity: baseFillOpacity,
              });
            },
            click: (e) => {
              L.DomEvent.stopPropagation(e);
              handleSelectVillagePolygon(matchingDot);
            },
          });
        },
      }).addTo(groups.desaOutlines);
    });

    // 4b. PROMINENT SELECTED VILLAGE ADMINISTRATIVE POLYGON (Blue if hasData, Crisp Slate-White if empty — NEVER radial/circle)
    if (activeVillage && activeVillagePolygon) {
      const highlightStroke = activeVillage.hasData ? '#38bdf8' : '#e2e8f0';
      const highlightFill = activeVillage.hasData ? '#2563eb' : '#64748b';

      // Crisp white halo underneath for maximum readability against satellite imagery
      L.geoJSON(activeVillagePolygon, {
        style: {
          color: '#ffffff',
          weight: activeVillage.hasData ? 6 : 4.5,
          opacity: activeVillage.hasData ? 0.92 : 0.75,
          fill: false,
          interactive: false,
        },
      }).addTo(groups.selectedDesaPolygon);

      const villagePolyLayer = L.geoJSON(activeVillagePolygon, {
        style: {
          color: highlightStroke,
          weight: activeVillage.hasData ? 3.4 : 2.6,
          dashArray: activeVillage.hasData ? undefined : '6, 4',
          opacity: 1,
          fillColor: highlightFill,
          fillOpacity: activeVillage.hasData ? 0.28 : 0.22,
        },
        onEachFeature: (_f, lyr) => {
          lyr.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            if (activeVillage.hasData) {
              setIsDrawerOpen(true);
            }
          });
        },
      }).addTo(groups.selectedDesaPolygon);

      // Permanent village boundary label centered on the village polygon
      L.tooltip({
        permanent: true,
        direction: 'center',
        className: 'kecamatan-label',
      })
        .setContent(activeVillage.name.toUpperCase())
        .setLatLng([
          activeVillagePolygon.properties._centerLat,
          activeVillagePolygon.properties._centerLng,
        ])
        .addTo(groups.selectedDesaPolygon);

      const polyBounds = villagePolyLayer.getBounds();
      if (polyBounds.isValid()) {
        map.fitBounds(polyBounds, { padding: [58, 58], maxZoom: 15 });
      }
    }

    // 4c. Interactive FULL Village DOTS ("titik-titik") for the selected Kecamatan
    //     BLUE (#2563eb) = Desa ada data layanan/agenda
    //     GREY (#94a3b8) = Desa data kosong (tetap bertanda abu-abu di peta)
    activeVillageDots.forEach((village) => {
      const isSelected = activeVillage?.id === village.id;
      const isHarmony = village.id === 'desa-sarimekar';
      const hasData = village.hasData;

      const dotColor = hasData
        ? isSelected
          ? '#1d4ed8'
          : '#2563eb'
        : isSelected
          ? '#64748b'
          : '#94a3b8';

      const dotSize = hasData
        ? isSelected
          ? 18
          : isHarmony
            ? 15
            : 13
        : isSelected
          ? 13
          : 9;

      const showCompactName = !isSelected && hasData;
      const cleanVillageLabel = village.name.replace(/^(Desa|Kelurahan)\s+/i, '');
      const ringShadow = isSelected
        ? hasData
          ? 'box-shadow:0 0 0 5px rgba(59,130,246,0.5);'
          : 'box-shadow:0 0 0 4px rgba(148,163,184,0.45);'
        : hasData
          ? 'box-shadow:0 0 0 2px rgba(37,99,235,0.35);'
          : '';

      const dotIcon = L.divIcon({
        className: 'desa-dot-icon',
        html: `
          <div class="desa-dot-marker flex flex-col items-center -translate-x-1/2 -translate-y-1/2 cursor-pointer group" data-has-data="${hasData ? 'true' : 'false'}" data-village-id="${village.id}">
            <span
              class="block rounded-full border-2 ${hasData ? 'border-white' : 'border-white/75 opacity-85'} shadow-lg transition-transform group-hover:scale-125"
              style="width:${dotSize}px;height:${dotSize}px;background-color:${dotColor};${ringShadow}"
            ></span>
            ${
              showCompactName
                ? `<span class="mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold leading-none whitespace-nowrap shadow-md border bg-blue-700/95 text-white border-sky-200/70">${isHarmony ? '★ ' : ''}${cleanVillageLabel}</span>`
                : ''
            }
          </div>
        `,
        iconSize: [dotSize, dotSize],
        iconAnchor: [dotSize / 2, dotSize / 2],
      });

      const marker = L.marker([village.lat, village.lng], {
        icon: dotIcon,
        zIndexOffset: isSelected ? 650 : hasData ? (isHarmony ? 450 : 300) : 80,
      });

      marker.bindTooltip(
        hasData
          ? `<div>
              <div style="font-weight:700;font-size:12px;">${village.name}</div>
              <div style="font-size:11px;opacity:0.85;color:#60a5fa;">● Ada Data · ${village.serviceData.totalRecipients} Penerima Layanan · Klik detail</div>
            </div>`
          : `<div>
              <div style="font-weight:700;font-size:12px;">${village.name}</div>
              <div style="font-size:11px;opacity:0.8;color:#cbd5e1;">● Belum ada data layanan</div>
            </div>`,
        {
          direction: 'top',
          offset: [0, -8],
          className: 'desa-dot-tooltip',
        }
      );

      marker.on('click', () => {
        if (activeVillage?.id === village.id) {
          if (village.hasData) {
            setIsDrawerOpen(true);
          }
        } else {
          handleSelectVillagePolygon(village);
        }
      });

      marker.addTo(groups.desaDots);
    });
  }, [
    activeKecId,
    activeVillage,
    activeVillagePolygon,
    activeVillageDots,
    boundaryData.desaFeatures,
    handleSelectVillagePolygon,
    internalMode,
  ]);

  const handleOpenAgendaArticle = (
    village: EccdVillageMarker,
    agenda: EccdVillageAgendaItem
  ) => {
    setActiveArticle({
      id: agenda.id,
      category: `${agenda.category} · ${village.name}`,
      title: agenda.title,
      author: agenda.facilitator,
      dateText: `${agenda.displayDate} · ${agenda.time}`,
      location: `${agenda.location}, ${village.kecamatanName}`,
      readTime: '3 menit baca',
      imageUrl: agenda.galleryImages[0] || village.agendaList[0]?.galleryImages[0] || '',
      lead: agenda.summary,
      participantCount: agenda.participants,
      bodyParagraphs: [
        `Kegiatan ${agenda.title} diselenggarakan oleh ${agenda.facilitator} bertempat di ${agenda.location}, ${village.name}, ${village.kecamatanName}.`,
        `Sebanyak ${agenda.participants} peserta mengikuti kegiatan ini. Secara keseluruhan di ${village.name}, Project ECCD PKBI Buleleng telah mencatat ${village.serviceData.totalRecipients} penerima layanan (Laki-laki: ${village.serviceData.genderBreakdown.lakiLaki}, Perempuan: ${village.serviceData.genderBreakdown.perempuan}).`,
        `Seluruh data layanan dan agenda kegiatan desa terintegrasi otomatis dengan dashboard Laporan Kegiatan Kabupaten Buleleng guna memastikan transparansi dampak program.`,
      ],
      highlights: village.serviceData.serviceTypes.map(
        (srv) => `${srv.serviceName}: ${srv.count} layanan tercatat`
      ),
    });
  };

  const handleOpenReportForVillage = (village: EccdVillageMarker) => {
    setIsDrawerOpen(false);
    setReportFilterKecId(village.kecamatanId);
    const isInPrimaryReport = eccdVillages.some((v) => v.id === village.id);
    setReportFilterVillageId(isInPrimaryReport ? village.id : 'all');
    switchMode('laporan');
  };

  const handleSelectVillageFromReport = (villageId: string) => {
    const found = eccdVillages.find((v) => v.id === villageId);
    switchMode('peta');
    if (found) {
      setActiveKecId(found.kecamatanId);
      setActiveVillage({ ...found, isPrimaryEccd: true, hasData: true });
      setIsDrawerOpen(false);
    }
  };

  const totalRecipientsAll = useMemo(
    () => eccdVillages.reduce((sum, v) => sum + v.serviceData.totalRecipients, 0),
    [eccdVillages]
  );

  const activeKecCanonical = activeKecId
    ? KECAMATAN_ID_TO_CANONICAL[activeKecId] || activeKecId
    : null;

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-7 space-y-3 sm:space-y-5 text-slate-900 dark:text-slate-100">
      {/* Rebranded Dashboard Title + Mode Switcher */}
      <section className="pb-3 sm:pb-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2.5 sm:gap-4">
        <div className="space-y-0.5 sm:space-y-1.5 min-w-0 flex-1 max-w-3xl">
          <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-sky-400 truncate">
            {t.sectionTitles.map.kicker}
          </div>
          <h1
            id="map-dashboard-title"
            className="text-base sm:text-3xl font-extrabold font-serif tracking-tight text-slate-900 dark:text-white leading-tight"
          >
            Layanan Mobile Project ECCD di Kabupaten Buleleng
          </h1>
          <p className="text-[11px] sm:text-sm text-slate-600 dark:text-slate-300 leading-snug sm:leading-relaxed tabular-nums">
            <span className="sm:hidden">
              9 Kec. · {totalRecipientsAll.toLocaleString('id-ID')} Penerima Layanan · Ketuk wilayah
            </span>
            <span className="hidden sm:inline">
              9 Kecamatan Kabupaten Buleleng · {totalRecipientsAll.toLocaleString('id-ID')} Penerima
              Layanan Terdata. Pilih kecamatan untuk memunculkan titik desa, lalu pilih desa untuk
              menampilkan batas poligon desa beserta rincian layanan.
            </span>
          </p>
        </div>

        {/* Switcher: Peta Wilayah vs Laporan Kegiatan (+ Admin Add Activity button when logged in) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {isAdminMode && (
            <>
              <button
                id="btn-map-admin-add-village"
                type="button"
                onClick={() => {
                  setEditingVillage(null);
                  setAdminVillageModalOpen(true);
                }}
                aria-label="Tambah Desa atau Kelurahan Buleleng"
                title="Tambah Desa / Kelurahan"
                className="min-h-[36px] min-w-[36px] sm:min-h-[42px] px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <MapPin size={15} />
                <span className="hidden md:inline">+ Desa</span>
              </button>
              <button
                id="btn-map-admin-add-agenda"
                type="button"
                onClick={() => {
                  setEditingAgenda(null);
                  setAdminAgendaDefaultVillageId(activeVillage?.id || eccdVillages[0]?.id);
                  setAdminAgendaModalOpen(true);
                }}
                aria-label="Tambah Kegiatan Desa"
                title="Tambah Kegiatan Desa"
                className="min-h-[36px] min-w-[36px] sm:min-h-[42px] px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Plus size={15} />
                <span className="hidden md:inline">Kegiatan</span>
              </button>
            </>
          )}
          <div className="flex items-center gap-1 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shrink-0">
            <button
              id="btn-mode-peta-eccd"
              type="button"
              onClick={() => switchMode('peta')}
              aria-label="Peta Wilayah"
              title="Peta Wilayah"
              className={`min-h-[36px] min-w-[36px] sm:min-h-[42px] px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                internalMode === 'peta'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MapIcon size={15} />
              <span className="hidden sm:inline">Peta Wilayah</span>
            </button>

            <button
              id="btn-mode-laporan-kegiatan"
              type="button"
              onClick={() => switchMode('laporan')}
              aria-label={t.map.programsButton}
              title={t.map.programsButton}
              className={`min-h-[36px] min-w-[36px] sm:min-h-[42px] px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                internalMode === 'laporan'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileBarChart2 size={15} />
              <span className="hidden sm:inline">{t.map.programsButton}</span>
            </button>
          </div>
        </div>
      </section>

      {internalMode === 'laporan' ? (
        <LaporanKegiatanPanel
          villages={eccdVillages}
          initialKecamatanId={reportFilterKecId}
          initialVillageId={reportFilterVillageId}
          onSelectVillageOnMap={handleSelectVillageFromReport}
          onOpenAgendaArticle={handleOpenAgendaArticle}
        />
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {/* Search + Reset Bar (icon-only Reset on mobile) */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <div className="flex items-center gap-2 px-3 min-h-[38px] sm:min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c162e] text-slate-900 dark:text-slate-100 focus-within:border-blue-600 dark:focus-within:border-sky-400 transition-colors">
                <Search size={15} className="text-slate-400 shrink-0" />
                <input
                  id="input-search-kecamatan"
                  type="text"
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => window.setTimeout(() => setIsSearchFocused(false), 180)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari kecamatan / desa..."
                  aria-label="Cari kecamatan atau nama desa"
                  className="w-full bg-transparent outline-none text-xs sm:text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Hapus pencarian"
                    className="min-h-[32px] min-w-[32px] flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Search Autocomplete Dropdown */}
              {isSearchFocused && searchQuery.trim().length > 0 && (
                <div
                  role="listbox"
                  aria-label="Hasil pencarian wilayah"
                  className="absolute left-0 right-0 top-[calc(100%+6px)] z-[45] max-h-60 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c162e] shadow-xl divide-y divide-slate-100 dark:divide-slate-800"
                >
                  {searchSuggestions.length === 0 ? (
                    <div className="px-3.5 py-2.5 text-xs text-slate-500 dark:text-slate-400">
                      Wilayah &ldquo;{searchQuery}&rdquo; tidak ditemukan di Buleleng.
                    </div>
                  ) : (
                    searchSuggestions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          if (item.type === 'kecamatan') {
                            setSearchQuery('');
                            selectKecamatan(item.kecamatanId);
                          } else if (item.village) {
                            setSearchQuery('');
                            handleSelectVillagePolygon(item.village);
                          }
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-blue-50/70 dark:hover:bg-slate-800/70 flex items-center justify-between gap-2.5 cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                              {item.title}
                            </div>
                            <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {item.subtitle}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wide text-blue-700 dark:text-sky-400 shrink-0">
                          {item.type === 'kecamatan' ? 'Kec.' : 'Desa'}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <button
              id="btn-reset-map-view"
              type="button"
              onClick={handleResetToKabupaten}
              aria-label="Reset ke Kabupaten Buleleng"
              title="Reset ke Kab. Buleleng"
              className="min-h-[38px] min-w-[38px] sm:min-h-[44px] sm:px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c162e] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
            >
              <RotateCcw size={15} className="text-blue-600 dark:text-sky-400" />
              <span className="hidden sm:inline">Kab. Buleleng</span>
            </button>
          </div>

          {/* 9 Kecamatan Selector Strip */}
          <div
            role="tablist"
            aria-label="Filter Wilayah Kecamatan Buleleng"
            className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-0.5"
          >
            <button
              id="pill-kec-all"
              type="button"
              onClick={handleResetToKabupaten}
              className={`min-h-[34px] sm:min-h-[40px] px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold border whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                activeKecId === null
                  ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 border-slate-900 dark:border-sky-400'
                  : 'bg-white dark:bg-[#0c162e] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-500'
              }`}
            >
              Semua (9)
            </button>

            {KECAMATAN_LIST.map((kec) => {
              const isActive = activeKecId === kec.id;
              const label = kec.name.replace('Kecamatan ', '');
              const kecColor = getKecamatanColorById(kec.id);
              return (
                <button
                  key={kec.id}
                  id={`pill-kec-${kec.id}`}
                  type="button"
                  onClick={() => selectKecamatan(kec.id)}
                  className={`min-h-[34px] sm:min-h-[40px] px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold border whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white'
                      : 'bg-white dark:bg-[#0c162e] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-sky-400'
                  }`}
                >
                  <span
                    className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: kecColor }}
                  />
                  <span>{label}</span>
                  {kec.id === 'buleleng' && (
                    <span
                      className={`text-[10px] font-bold ${
                        isActive
                          ? 'text-amber-300 dark:text-amber-600'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      ★
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Clean Satellite Administrative Map Locked Strictly to Kabupaten Buleleng (No Kontrol Peta) */}
          <div
            data-testid="buleleng-map-viewport"
            data-map-level={activeVillage ? 'desa' : activeKecId ? 'kecamatan' : 'kabupaten'}
            data-active-kec={activeKecId || 'none'}
            data-active-village={activeVillage?.id || 'none'}
            data-village-dots={String(activeVillageDots.length)}
            data-blue-dots={String(activeBlueDotsCount)}
            data-grey-dots={String(activeGreyDotsCount)}
            data-village-polygon-rendered={activeVillage && activeVillagePolygon ? 'true' : 'false'}
            data-lock-east={String(lockBounds.east)}
            data-lock-west={String(lockBounds.west)}
            className="relative rounded-xl sm:rounded-2xl overflow-hidden border border-slate-800 bg-[#050b16] shadow-sm h-[46dvh] min-h-[300px] sm:h-[58dvh] lg:h-[600px]"
          >
            <div ref={mapContainerRef} id="map" className="w-full h-full z-10" />

            {/* Top-Left Contextual Navigation Pill + Blue/Grey Dot Legend (Only when zoomed into Kecamatan or Desa) */}
            {activeKecCanonical && (
              <div className="absolute top-3 left-3 z-[35] flex flex-wrap items-center gap-2 max-w-[calc(100%-1.5rem)]">
                {activeVillage ? (
                  <button
                    id="btn-map-back-kecamatan"
                    type="button"
                    onClick={handleBackToKecamatan}
                    className="min-h-[38px] sm:min-h-[40px] px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-950/92 hover:bg-slate-900 text-white border border-white/25 backdrop-blur-md shadow-lg flex items-center gap-2 text-xs font-semibold cursor-pointer"
                  >
                    <ArrowLeft size={14} className="shrink-0" />
                    <span>Kembali ke Kec. {activeKecCanonical}</span>
                  </button>
                ) : (
                  <>
                    <button
                      id="btn-map-back-kabupaten"
                      type="button"
                      onClick={handleResetToKabupaten}
                      className="min-h-[38px] sm:min-h-[40px] px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-950/92 hover:bg-slate-900 text-white border border-white/25 backdrop-blur-md shadow-lg flex items-center gap-2 text-xs font-semibold cursor-pointer"
                    >
                      <ArrowLeft size={14} className="shrink-0" />
                      <span>
                        Kec. {activeKecCanonical} · {activeVillageDots.length} Desa
                      </span>
                    </button>
                    <div
                      id="map-dot-legend"
                      className="px-2.5 py-1.5 rounded-xl bg-slate-950/88 text-white border border-white/20 backdrop-blur-md shadow-lg flex items-center gap-2.5 text-[10px] sm:text-[11px] font-semibold tabular-nums"
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 border border-white" />
                        <span>Ada Data ({activeBlueDotsCount})</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-slate-400 border border-white/70" />
                        <span>Kosong ({activeGreyDotsCount})</span>
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Selected Village Polygon Action Bar (Blue = open detail drawer; Grey = clean empty notice + Admin quick fill) */}
            {activeVillage && (
              <div
                id="map-active-village-bar"
                className="absolute bottom-2.5 left-2.5 right-12 sm:bottom-3 sm:left-3 sm:right-auto sm:max-w-md z-[35] px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl bg-slate-950/92 text-white border border-white/20 backdrop-blur-md shadow-2xl flex items-center justify-between gap-2.5"
              >
                <div className="min-w-0">
                  <div
                    className={`text-[10px] font-bold uppercase tracking-wider truncate ${
                      activeVillage.hasData ? 'text-sky-400' : 'text-slate-400'
                    }`}
                  >
                    {activeVillage.hasData ? '● Ada Data · ' : '● Data Kosong · '}
                    {activeVillage.kecamatanName.replace('Kecamatan ', 'Kec. ')}
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold leading-tight truncate">
                    {activeVillage.name}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-300 tabular-nums mt-0.5 truncate">
                    {activeVillage.hasData
                      ? `${activeVillage.serviceData.totalRecipients} Layanan${
                          activeVillagePolygon?.properties._areaKm2
                            ? ` · ±${activeVillagePolygon.properties._areaKm2} km²`
                            : ''
                        }`
                      : 'Belum ada data layanan atau agenda di desa ini'}
                  </div>
                </div>

                {activeVillage.hasData ? (
                  <button
                    id="btn-open-village-drawer"
                    type="button"
                    onClick={() => setIsDrawerOpen(true)}
                    aria-label={`Buka detail layanan ${activeVillage.name}`}
                    className="min-h-[36px] min-w-[36px] sm:min-h-[40px] px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer shrink-0 transition-colors"
                  >
                    <span className="hidden sm:inline">Data Layanan &amp; Agenda</span>
                    <span className="sm:hidden">Detail</span>
                    <ChevronRight size={14} />
                  </button>
                ) : isAdminMode ? (
                  <button
                    id="btn-admin-fill-empty-village"
                    type="button"
                    onClick={() => {
                      setEditingVillage(activeVillage);
                      setAdminVillageModalOpen(true);
                    }}
                    className="min-h-[36px] sm:min-h-[40px] px-3 py-1.5 rounded-lg sm:rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer shrink-0 transition-colors"
                  >
                    <Plus size={14} />
                    <span>Isi Data</span>
                  </button>
                ) : null}
              </div>
            )}

            {/* Boundary-Lock Feedback Toast when user forces drag outside Buleleng */}
            {boundaryNotice && (
              <div
                role="status"
                className="absolute top-3 right-3 z-[38] max-w-xs px-3 py-2 rounded-xl bg-slate-950/95 text-white border border-sky-400/40 shadow-xl text-[11px] sm:text-xs font-medium flex items-center gap-2"
              >
                <Lock size={13} className="text-sky-400 shrink-0" />
                <span>{boundaryNotice}</span>
              </div>
            )}
          </div>

          {/* Below-Map Progressive Drill-Down Directory — Side-by-Side 2 Columns on Mobile! */}
          {activeKecId === null ? (
            /* STEP 1: Kabupaten Buleleng Overview — Only 9 Kecamatan Cards (2-col side-by-side on mobile) */
            <section id="section-kabupaten-overview" className="space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between gap-2 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400">
                <span className="font-semibold uppercase tracking-wider">
                  9 Kecamatan Buleleng
                </span>
                <span className="hidden sm:inline">
                  Pilih kecamatan di peta atau kartu untuk menampilkan titik desa
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                {KECAMATAN_LIST.map((kec) => {
                  const shortName = kec.name.replace('Kecamatan ', '');
                  const kecColor = getKecamatanColorById(kec.id);
                  const kecDots = villageDotsByKec.get(kec.id) || [];
                  const dotsCount = kecDots.length;
                  const blueCount = kecDots.filter((v) => v.hasData).length;
                  const kecRecipients = eccdVillages
                    .filter((v) => v.kecamatanId === kec.id)
                    .reduce((sum, v) => sum + v.serviceData.totalRecipients, 0);

                  return (
                    <button
                      key={kec.id}
                      id={`card-kec-${kec.id}`}
                      type="button"
                      onClick={() => selectKecamatan(kec.id)}
                      className="text-left p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] hover:border-blue-500 dark:hover:border-sky-400 transition-colors cursor-pointer flex items-center justify-between gap-2 group"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <span
                          className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full shrink-0 ring-2 sm:ring-4 ring-slate-100 dark:ring-slate-800"
                          style={{ backgroundColor: kecColor }}
                        />
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                            <span className="sm:hidden">{shortName}</span>
                            <span className="hidden sm:inline">Kecamatan {shortName}</span>
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 tabular-nums truncate">
                            <span className="text-blue-600 dark:text-sky-400 font-semibold">{blueCount}</span>/{dotsCount} Desa · {kecRecipients}
                          </div>
                        </div>
                      </div>
                      <ChevronRight
                        size={14}
                        className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-sky-400 shrink-0 transition-transform group-hover:translate-x-0.5"
                      />
                    </button>
                  );
                })}
              </div>
            </section>
          ) : (
            /* STEP 2: Kecamatan Selected — Side-by-Side 2-Col Village Cards (Hides empty grey villages by default, toggleable) */
            <section id="section-kecamatan-villages" className="space-y-2.5 sm:space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/60">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0 bg-blue-600" />
                  <div className="min-w-0">
                    <div className="hidden sm:block text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                      Kab. Buleleng / {activeKecMeta?.name || `Kec. ${activeKecCanonical}`}
                      {activeVillage ? ` / ${activeVillage.name}` : ''}
                    </div>
                    <h2 className="text-xs sm:text-base font-bold text-slate-900 dark:text-white leading-snug truncate">
                      Kec. {activeKecCanonical} · {activeBlueDotsCount} Ada Data / {activeVillageDots.length} Total Desa
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap">
                  {activeGreyDotsCount > 0 && (
                    <button
                      id="btn-toggle-empty-villages"
                      type="button"
                      onClick={() => setShowEmptyVillagesInList((prev) => !prev)}
                      className={`min-h-[34px] sm:min-h-[40px] px-2.5 sm:px-3 py-1 rounded-lg sm:rounded-xl border text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                        showEmptyVillagesInList
                          ? 'border-slate-700 bg-slate-800 text-white'
                          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0c162e] text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                      <span>
                        {showEmptyVillagesInList
                          ? 'Sembunyikan Kosong'
                          : `Lihat Kosong (${activeGreyDotsCount})`}
                      </span>
                    </button>
                  )}

                  {isAdminMode && activeVillage && (
                    <button
                      id="btn-map-admin-edit-village"
                      type="button"
                      onClick={() => {
                        setEditingVillage(activeVillage);
                        setAdminVillageModalOpen(true);
                      }}
                      aria-label={`Edit data wilayah ${activeVillage.name}`}
                      title={`Edit ${activeVillage.name}`}
                      className="min-h-[34px] min-w-[34px] sm:min-h-[40px] sm:px-3 py-1 rounded-lg sm:rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Pencil size={13} />
                      <span className="hidden sm:inline">
                        {activeVillage.hasData ? 'Edit Desa' : 'Isi Data Desa'}
                      </span>
                    </button>
                  )}
                  {activeVillage && activeVillage.hasData && (
                    <button
                      type="button"
                      onClick={() => setIsDrawerOpen(true)}
                      aria-label={`Detail ${activeVillage.name}`}
                      className="min-h-[34px] sm:min-h-[40px] px-2.5 sm:px-3.5 py-1 rounded-lg sm:rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] sm:text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Detail</span>
                    </button>
                  )}
                  <button
                    id="btn-back-to-kabupaten"
                    type="button"
                    onClick={handleResetToKabupaten}
                    aria-label="Kembali ke Kabupaten Buleleng"
                    title="Kembali ke Kab. Buleleng"
                    className="min-h-[34px] min-w-[34px] sm:min-h-[40px] sm:px-3.5 rounded-lg sm:rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0c162e] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    <span className="hidden sm:inline">Kembali ke Kab. Buleleng</span>
                  </button>
                </div>
              </div>

              {listedVillageCards.length === 0 ? (
                <div className="p-5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500 dark:text-slate-400">
                  {searchQuery.trim()
                    ? `Tidak ada desa cocok dengan "${searchQuery}".`
                    : `Belum ada desa dengan data layanan di Kecamatan ${activeKecCanonical}. Semua titik desa bertanda abu-abu di peta.`}
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                  {listedVillageCards.map((village) => {
                    const isSelected = activeVillage?.id === village.id;
                    const isHarmony = village.id === 'desa-sarimekar';
                    const hasData = village.hasData;
                    const dotColor = hasData ? '#2563eb' : '#94a3b8';

                    return (
                      <button
                        key={village.id}
                        id={`card-village-${village.id}`}
                        type="button"
                        onClick={() => handleSelectVillagePolygon(village)}
                        className={`text-left p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? hasData
                              ? 'border-blue-600 dark:border-sky-400 bg-blue-50/70 dark:bg-blue-950/35 ring-2 ring-blue-500/20'
                              : 'border-slate-500 bg-slate-100/80 dark:bg-slate-800/70 ring-2 ring-slate-400/25'
                            : hasData
                              ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] hover:border-blue-500'
                              : 'border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-start gap-2 min-w-0">
                          <span
                            className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full mt-1 shrink-0"
                            style={{ backgroundColor: dotColor }}
                          />
                          <div className="min-w-0 space-y-0.5">
                            <div
                              className={`text-[10px] sm:text-[11px] font-semibold truncate ${
                                hasData
                                  ? 'text-blue-700 dark:text-sky-400'
                                  : 'text-slate-500 dark:text-slate-400'
                              }`}
                            >
                              {hasData
                                ? isHarmony
                                  ? '★ Desa Harmony'
                                  : 'Ada Data'
                                : 'Data Kosong'}
                              {village.areaKm2 ? ` · ${village.areaKm2}km²` : ''}
                            </div>
                            <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                              {village.name.replace(/^(Desa|Kelurahan)\s+/i, '')}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          {hasData ? (
                            <div className="text-[11px] sm:text-xs font-bold tabular-nums text-blue-700 dark:text-sky-400 flex items-center justify-end gap-0.5 sm:gap-1">
                              <Users size={11} className="shrink-0" />
                              <span>{village.serviceData.totalRecipients}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] font-medium text-slate-400">
                              —
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </div>
      )}

      {/* Interactive Village Detail Drawer */}
      <EccdVillageDetailDrawer
        village={isDrawerOpen ? activeVillage : null}
        onClose={() => setIsDrawerOpen(false)}
        onOpenReportForVillage={handleOpenReportForVillage}
        onOpenAgendaArticle={handleOpenAgendaArticle}
        isAdminMode={isAdminMode}
        onAddAgenda={(village) => {
          setEditingAgenda(null);
          setAdminAgendaDefaultVillageId(village.id);
          setAdminAgendaModalOpen(true);
        }}
        onEditAgenda={(village, agenda) => {
          setEditingAgenda(agenda);
          setAdminAgendaDefaultVillageId(village.id);
          setAdminAgendaModalOpen(true);
        }}
        onDeleteAgenda={async (village, agenda) => {
          await removeVillageAgenda(agenda.id, village.id);
        }}
      />

      {/* Admin Mode Village Agenda & Village CRUD Modals */}
      {isAdminMode && (
        <>
          <AdminAgendaModal
            isOpen={adminAgendaModalOpen}
            villages={eccdVillages}
            defaultVillageId={adminAgendaDefaultVillageId}
            editingAgenda={editingAgenda}
            onClose={() => {
              setAdminAgendaModalOpen(false);
              setEditingAgenda(null);
            }}
            onSave={upsertVillageAgenda}
          />
          <AdminVillageModal
            isOpen={adminVillageModalOpen}
            editingVillage={editingVillage}
            defaultKecamatanId={activeKecId || undefined}
            onClose={() => {
              setAdminVillageModalOpen(false);
              setEditingVillage(null);
            }}
            onSave={upsertVillage}
          />
        </>
      )}

      {/* Fullscreen Editorial Article Modal */}
      <BlogArticleModal
        article={activeArticle}
        onClose={() => setActiveArticle(null)}
      />
    </div>
  );
};
