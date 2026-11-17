import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  RotateCcw,
  Menu,
  Search,
  X,
} from 'lucide-react';
import { DATA_BULELENG_GEOJSON } from '../../data/bulelengGeoJson';
import {
  KECAMATAN_LIST,
  DESA_SARI_MEKAR_PROFILE,
} from '../../data/bulelengData';
import { KecamatanInfo } from '../../types';
import { LamanKecamatanDetail } from './LamanKecamatanDetail';
import { ProgramTerlaksanaDrawer } from './ProgramTerlaksanaDrawer';
import { MapInspectorPanel } from './MapInspectorPanel';
import { BlogArticleModal, BlogArticleData } from '../ui/BlogArticleModal';
import { useAppTheme } from '../../context/ThemeContext';
import { I18N } from '../../constants/i18n';
import { MEDIA_ASSETS } from '../../constants/mediaAssets';
import {
  filterDistrictsByQuery,
  resolveDistrictHighlightActivity,
} from '../../utils/mapHelpers';

interface MapKecamatanProps {
  onNavigateToProgram?: () => void;
}

export const MapKecamatan: React.FC<MapKecamatanProps> = ({ onNavigateToProgram }) => {
  const { theme, language } = useAppTheme();
  const t = I18N[language];

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const districtPinsGroupRef = useRef<L.LayerGroup | null>(null);

  const [activeKecId, setActiveKecId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSariMekarFocused, setIsSariMekarFocused] = useState<boolean>(false);
  const [isMobileSheetExpanded, setIsMobileSheetExpanded] = useState<boolean>(false);
  const [viewingKecamatan, setViewingKecamatan] = useState<KecamatanInfo | null>(null);
  const [isProgramDrawerOpen, setIsProgramDrawerOpen] = useState<boolean>(false);
  const [activeArticle, setActiveArticle] = useState<BlogArticleData | null>(null);

  const filteredDistricts = useMemo(
    () => filterDistrictsByQuery(KECAMATAN_LIST, searchQuery),
    [searchQuery]
  );

  const selectedKecamatan = useMemo(
    () => KECAMATAN_LIST.find((k) => k.id === activeKecId) || null,
    [activeKecId]
  );

  const selectedActivity = useMemo(
    () =>
      resolveDistrictHighlightActivity(
        selectedKecamatan,
        isSariMekarFocused,
        MEDIA_ASSETS.posyanduSariMekar
      ),
    [selectedKecamatan, isSariMekarFocused]
  );

  // Zero boundary lines on initial load — lines appear ONLY when a district is clicked
  const getHiddenStyle = (): L.PathOptions => ({
    color: 'transparent',
    weight: 0,
    opacity: 0,
    fillColor: '#2563eb',
    fillOpacity: 0,
  });

  const getFocusStyle = (): L.PathOptions => ({
    color: '#e11d48',
    weight: 3,
    dashArray: '6, 4',
    opacity: 1,
    fillColor: '#fb7185',
    fillOpacity: 0.25,
  });

  const renderDistrictMarkers = (selectedId: string | null) => {
    if (!districtPinsGroupRef.current) return;
    const group = districtPinsGroupRef.current;
    group.clearLayers();

    KECAMATAN_LIST.forEach((kec) => {
      const isSelected = kec.id === selectedId;
      const shortName = kec.name.replace('Kecamatan ', '');

      const pinIcon = L.divIcon({
        className: 'custom-leaflet-district',
        html: `
          <div class="flex flex-col items-center -translate-x-1/2 -translate-y-1/2 cursor-pointer">
            <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white shadow-md flex items-center justify-center transition-transform ${
              isSelected
                ? 'bg-rose-600 scale-110 ring-4 ring-rose-500/30'
                : 'bg-blue-700 hover:bg-blue-600'
            }">
              <span class="w-2 h-2 rounded-full bg-white"></span>
            </div>
            <div class="mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm whitespace-nowrap border ${
              isSelected
                ? 'bg-rose-600 text-white border-rose-500'
                : 'bg-white/95 text-slate-900 border-slate-300'
            }">
              ${shortName}
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([kec.lat, kec.lng], { icon: pinIcon });
      marker.on('click', () => {
        handleSelectKecamatanById(kec.id);
      });
      group.addLayer(marker);
    });

    if (selectedId === 'buleleng') {
      const sariMekarIcon = L.divIcon({
        className: 'custom-leaflet-sarimekar',
        html: `
          <div class="flex flex-col items-center -translate-x-1/2 -translate-y-1/2 cursor-pointer">
            <div class="w-8 h-8 rounded-full bg-amber-500 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-extrabold">
              ★
            </div>
            <div class="mt-1 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-extrabold text-[10px] shadow whitespace-nowrap border border-amber-300">
              Desa Sari Mekar
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const sariMarker = L.marker(
        [DESA_SARI_MEKAR_PROFILE.lat, DESA_SARI_MEKAR_PROFILE.lng],
        { icon: sariMekarIcon }
      );
      sariMarker.on('click', () => {
        setIsSariMekarFocused(true);
        setIsMobileSheetExpanded(true);
      });
      group.addLayer(sariMarker);
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const bulelengBounds = L.latLngBounds(
      L.latLng(-8.46, 114.4),
      L.latLng(-8.03, 115.54)
    );

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      minZoom: 9.5,
      maxZoom: 16,
      maxBounds: bulelengBounds,
      maxBoundsViscosity: 1.0,
    }).setView([-8.19, 115.02], 10);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const districtPinsGroup = L.layerGroup().addTo(map);
    districtPinsGroupRef.current = districtPinsGroup;

    const layerKecamatan = L.geoJSON(DATA_BULELENG_GEOJSON as GeoJSON.GeoJsonObject, {
      style: () => getHiddenStyle(),
      onEachFeature: (feature, layer) => {
        layer.bindTooltip(`Kec. ${feature.properties.nama}`, {
          permanent: false,
          direction: 'top',
          className: 'kec-tooltip',
        });

        layer.on('click', () => {
          handleSelectKecamatanById(feature.properties.id, layer as L.Path);
        });
      },
    }).addTo(map);

    geoJsonLayerRef.current = layerKecamatan;
    mapInstanceRef.current = map;

    if (layerKecamatan.getBounds().isValid()) {
      map.fitBounds(layerKecamatan.getBounds(), { padding: [20, 20] });
    }

    renderDistrictMarkers(null);

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 220);

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
      geoJsonLayerRef.current = null;
      districtPinsGroupRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!geoJsonLayerRef.current) return;
    geoJsonLayerRef.current.eachLayer((l: unknown) => {
      const layer = l as L.Path & { feature?: { properties?: { id?: string } } };
      const isSelected = layer.feature?.properties?.id === activeKecId;
      layer.setStyle(isSelected ? getFocusStyle() : getHiddenStyle());
    });
    renderDistrictMarkers(activeKecId);
  }, [theme, activeKecId]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const tId = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 240);
    return () => clearTimeout(tId);
  }, [isMobileSheetExpanded, activeKecId]);

  const handleSelectKecamatanById = (kecId: string, specificLayer?: L.Path) => {
    if (!geoJsonLayerRef.current || !mapInstanceRef.current) return;

    const layerKecamatan = geoJsonLayerRef.current;
    const map = mapInstanceRef.current;

    layerKecamatan.eachLayer((l) => {
      (l as L.Path).setStyle(getHiddenStyle());
    });

    let targetLayer: L.Path | undefined = specificLayer;
    if (!targetLayer) {
      layerKecamatan.eachLayer((l: unknown) => {
        const layer = l as L.Path & { feature?: { properties?: { id?: string } } };
        if (layer.feature?.properties?.id === kecId) {
          targetLayer = layer;
        }
      });
    }

    if (targetLayer) {
      targetLayer.setStyle(getFocusStyle());
      if ((targetLayer as unknown as L.Polygon).getBounds) {
        map.fitBounds((targetLayer as unknown as L.Polygon).getBounds(), {
          padding: [40, 40],
          maxZoom: 12,
        });
      }
    }

    setActiveKecId(kecId);
    setIsSariMekarFocused(false);
    setIsMobileSheetExpanded(false);
    renderDistrictMarkers(kecId);
  };

  const handleResetMap = () => {
    if (!mapInstanceRef.current || !geoJsonLayerRef.current) return;

    geoJsonLayerRef.current.eachLayer((l) => {
      (l as L.Path).setStyle(getHiddenStyle());
    });

    setActiveKecId(null);
    setIsSariMekarFocused(false);
    setIsMobileSheetExpanded(false);
    setSearchQuery('');
    renderDistrictMarkers(null);

    const bounds = geoJsonLayerRef.current.getBounds();
    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
    } else {
      mapInstanceRef.current.setView([-8.19, 115.02], 10);
    }
    mapInstanceRef.current.invalidateSize();
  };

  const handleOpenInspectorArticle = () => {
    if (!selectedKecamatan || !selectedActivity) return;
    setActiveArticle({
      id: selectedActivity.id,
      category: `${selectedActivity.category} · ${selectedKecamatan.name}`,
      title: selectedActivity.title,
      author: `Tim Lapangan PKBI ${selectedKecamatan.name}`,
      dateText: `${selectedActivity.hari}, ${selectedActivity.tanggal}`,
      location: selectedActivity.location,
      readTime: '3 menit baca',
      imageUrl: selectedActivity.imageUrl,
      lead: selectedActivity.description,
      participantCount: selectedActivity.participants,
      bodyParagraphs: [
        `Kegiatan ${selectedActivity.title} diselenggarakan bersama kader kesehatan, tokoh masyarakat, dan bidan wilayah di ${selectedActivity.location}, ${selectedKecamatan.name}.`,
        `Total ${selectedActivity.participants} warga mengikuti rangkaian penyuluhan, pemeriksaan kesehatan terpadu, serta sesi diskusi terbuka untuk keluarga dan remaja di tingkat desa.`,
        `Program ini merupakan bagian dari komitmen PKBI Kabupaten Buleleng memperluas layanan kesehatan reproduksi, pencegahan stunting, dan pendampingan calon pengantin yang mudah diakses di seluruh 9 kecamatan.`,
      ],
      highlights: [
        `Cakupan wilayah ${selectedKecamatan.name} (luas ${selectedKecamatan.areaKm2} km², ${selectedKecamatan.population.toLocaleString('id-ID')} jiwa).`,
        `${selectedActivity.participants} peserta aktif mengikuti sesi penyuluhan & pemeriksaan.`,
        `Terhubung dengan rujukan Puskesmas setempat dan layanan konsultasi rahasia PKBI.`,
      ],
    });
  };

  if (viewingKecamatan) {
    return (
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <LamanKecamatanDetail
          kecamatan={viewingKecamatan}
          onBackToMap={() => setViewingKecamatan(null)}
          onNavigateToQA={onNavigateToProgram}
        />
      </div>
    );
  }

  const hasSelection = Boolean(selectedKecamatan && selectedActivity);

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4">
      {/* External Map Control Bar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex-1 min-w-[210px] flex items-center gap-2 px-3.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c162e] text-slate-900 dark:text-slate-100 focus-within:border-blue-600 dark:focus-within:border-sky-400 transition-colors">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              id="input-search-kecamatan"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.map.searchPlaceholder}
              aria-label={t.map.searchPlaceholder}
              className="w-full bg-transparent outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Hapus pencarian"
                className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-hamburger-program"
              type="button"
              onClick={() => setIsProgramDrawerOpen(true)}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Menu size={16} />
              <span>{t.map.programsButton}</span>
            </button>

            <button
              id="btn-reset-map-view"
              type="button"
              onClick={handleResetMap}
              className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c162e] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <RotateCcw size={15} className="text-blue-600 dark:text-sky-400" />
              <span className="hidden sm:inline">{t.map.resetButton}</span>
            </button>
          </div>
        </div>

        {/* Horizontal Interactive District Filter Chips */}
        <div
          role="tablist"
          aria-label="Pilih Kecamatan Buleleng"
          className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1"
        >
          <button
            type="button"
            onClick={handleResetMap}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold border whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
              activeKecId === null
                ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 border-slate-900 dark:border-sky-400'
                : 'bg-white dark:bg-[#0c162e] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-500'
            }`}
          >
            {t.map.allDistricts}
          </button>

          {filteredDistricts.map((kec) => {
            const isActive = activeKecId === kec.id;
            const label = kec.name.replace('Kecamatan ', '');
            return (
              <button
                key={kec.id}
                id={`pill-kec-${kec.id}`}
                type="button"
                onClick={() => handleSelectKecamatanById(kec.id)}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold border whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-white dark:bg-[#0c162e] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-sky-400'
                }`}
              >
                <MapPin
                  size={13}
                  className={isActive ? 'text-white' : 'text-blue-600 dark:text-sky-400'}
                />
                <span>{label}</span>
                {kec.id === 'buleleng' && (
                  <span
                    className={`text-[10px] font-bold ${
                      isActive ? 'text-amber-200' : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    ★ Sari Mekar
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* INITIAL LOAD: Map ONLY (full width, clean). WHEN CLICKED: Golden Ratio 61.8% / 38.2% Split */}
      <div className={hasSelection ? 'golden-grid-major items-stretch' : 'w-full'}>
        <div
          className={`relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-sm transition-all ${
            hasSelection
              ? isMobileSheetExpanded
                ? 'h-[30dvh] min-h-[200px] lg:h-[620px]'
                : 'h-[38dvh] min-h-[230px] lg:h-[620px]'
              : 'h-[62dvh] min-h-[380px] lg:h-[640px]'
          }`}
        >
          <div ref={mapContainerRef} id="map" className="w-full h-full z-10" />
        </div>

        {hasSelection && selectedKecamatan && selectedActivity && (
          <div className="lg:h-[620px] min-h-0">
            <MapInspectorPanel
              selectedKecamatan={selectedKecamatan}
              selectedActivity={selectedActivity}
              isSariMekarFocused={isSariMekarFocused}
              onToggleSariMekar={() => setIsSariMekarFocused((prev) => !prev)}
              onOpenArticle={handleOpenInspectorArticle}
              onOpenDetail={(kec) => setViewingKecamatan(kec)}
              onClearSelection={handleResetMap}
              isMobileExpanded={isMobileSheetExpanded}
              onToggleMobileExpand={() => setIsMobileSheetExpanded((prev) => !prev)}
            />
          </div>
        )}
      </div>

      {/* Program Drawer */}
      <ProgramTerlaksanaDrawer
        isOpen={isProgramDrawerOpen}
        onClose={() => setIsProgramDrawerOpen(false)}
        onSelectKecamatan={(kecId) => handleSelectKecamatanById(kecId)}
      />

      {/* Blogger Article Modal */}
      <BlogArticleModal
        article={activeArticle}
        onClose={() => setActiveArticle(null)}
      />
    </div>
  );
};
