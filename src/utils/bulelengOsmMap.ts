import * as turf from '@turf/turf';
import osmtogeojson from 'osmtogeojson';
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import type { EccdVillageMarker } from '../types';
import type { BulelengGeoJsonObject } from '../data/bulelengGeoJson';
import { BULELENG_ALL_VILLAGES } from '../data/bulelengAllVillages';

export type BasemapType = 'clean' | 'osm' | 'satellite';

export const BULELENG_CENTER: [number, number] = [-8.18, 115.02];

export const BULELENG_DEFAULT_BOUNDS: [[number, number], [number, number]] = [
  [-8.39, 114.42],
  [-8.06, 115.46],
];

export const KECAMATAN_COLORS: Record<string, string> = {
  Gerokgak: '#ef4444',
  Seririt: '#f97316',
  Busungbiu: '#eab308',
  Banjar: '#22c55e',
  Sukasada: '#14b8a6',
  Buleleng: '#3b82f6',
  Sawan: '#6366f1',
  Kubutambahan: '#a855f7',
  Tejakula: '#ec4899',
};

export const KECAMATAN_ID_TO_CANONICAL: Record<string, string> = {
  gerokgak: 'Gerokgak',
  seririt: 'Seririt',
  busungbiu: 'Busungbiu',
  banjar: 'Banjar',
  sukasada: 'Sukasada',
  buleleng: 'Buleleng',
  sawan: 'Sawan',
  kubutambahan: 'Kubutambahan',
  tejakula: 'Tejakula',
};

export const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

export interface OsmAdminProperties {
  name?: string;
  'name:id'?: string;
  admin_level?: string | number;
  'ref:bps'?: string;
  kode_bps?: string;
  'ISO3166-2'?: string;
  place?: string;
  id?: string;
  _cleanName: string;
  _kecamatanId: string;
  _kecamatanName?: string;
  _centerLat: number;
  _centerLng: number;
  _areaKm2: number;
  [key: string]: unknown;
}

export type AdminPolygonFeature = Feature<Polygon | MultiPolygon, OsmAdminProperties>;

export interface BulelengBoundaryData {
  source: 'local-fallback' | 'overpass-osm';
  kabupatenGeoJSON: Feature<Polygon | MultiPolygon> | null;
  maskGeoJSON: Feature<Polygon | MultiPolygon> | null;
  kecamatanFeatures: AdminPolygonFeature[];
  desaFeatures: AdminPolygonFeature[];
  fetchedAt: number;
}

export function cleanAdminName(name?: string | null): string {
  if (!name) return 'Tanpa Nama';
  return name
    .replace(/^Kecamatan\s+/i, '')
    .replace(/^Kabupaten\s+/i, '')
    .trim();
}

export function normalizeVillageNameKey(name?: string | null): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/^(desa|kelurahan|kel\.?)\s+/i, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

export function getKecamatanCanonicalFromName(rawName?: string | null): string | null {
  const cleaned = cleanAdminName(rawName).toLowerCase();
  return KECAMATAN_ID_TO_CANONICAL[cleaned] ?? null;
}

export function getKecamatanIdFromName(rawName?: string | null): string | null {
  const canonical = getKecamatanCanonicalFromName(rawName);
  return canonical ? canonical.toLowerCase() : null;
}

export function getKecamatanColorById(kecId: string): string {
  const canonical = KECAMATAN_ID_TO_CANONICAL[kecId.toLowerCase()];
  return (canonical && KECAMATAN_COLORS[canonical]) || '#3b82f6';
}

export function buildOverpassQuery(): string {
  return `
    [out:json][timeout:45];
    relation["boundary"="administrative"]["admin_level"="5"]["name"~"Buleleng",i]->.kab;
    .kab map_to_area->.area_buleleng;
    (
      relation.kab;
      relation(area.area_buleleng)["boundary"="administrative"]["admin_level"="6"];
      relation(area.area_buleleng)["boundary"="administrative"]["admin_level"="7"];
    );
    out geom;
  `;
}

export function buildFallbackBboxQuery(): string {
  return `
    [out:json][timeout:30];
    (
      relation["boundary"="administrative"]["admin_level"~"5|6|7"](-8.40,114.42,-8.05,115.46);
    );
    out geom;
  `;
}

export function computeFeatureCenterAndArea(feature: Feature<Polygon | MultiPolygon>): {
  lat: number;
  lng: number;
  areaKm2: number;
} {
  let lat = BULELENG_CENTER[0];
  let lng = BULELENG_CENTER[1];
  let areaKm2 = 0;

  try {
    let targetForCenter: Feature<Polygon | MultiPolygon> = feature;
    if (feature.geometry.type === 'MultiPolygon' && feature.geometry.coordinates.length > 1) {
      let maxArea = -1;
      for (const polyCoords of feature.geometry.coordinates) {
        const singlePoly = turf.polygon(polyCoords);
        const a = turf.area(singlePoly);
        if (a > maxArea) {
          maxArea = a;
          targetForCenter = singlePoly;
        }
      }
    }
    const pt = turf.pointOnFeature(targetForCenter);
    lng = pt.geometry.coordinates[0];
    lat = pt.geometry.coordinates[1];
  } catch {
    // Fallback to center
  }

  try {
    areaKm2 = Number((turf.area(feature) / 1_000_000).toFixed(2));
  } catch {
    areaKm2 = 0;
  }

  return { lat, lng, areaKm2 };
}

export function buildMaskPolygon(
  kabupatenGeoJSON: Feature<Polygon | MultiPolygon> | null
): Feature<Polygon | MultiPolygon> | null {
  if (!kabupatenGeoJSON) return null;
  try {
    const worldPoly = turf.polygon([
      [
        [-180, -90],
        [180, -90],
        [180, 90],
        [-180, 90],
        [-180, -90],
      ],
    ]);
    const diff = turf.difference(turf.featureCollection([worldPoly, kabupatenGeoJSON]));
    return diff ?? null;
  } catch {
    return null;
  }
}

export function unionPolygons(
  features: Array<Feature<Polygon | MultiPolygon>>
): Feature<Polygon | MultiPolygon> | null {
  if (features.length === 0) return null;
  if (features.length === 1) return features[0];
  try {
    const merged = turf.union(turf.featureCollection(features));
    return merged ?? features[0];
  } catch {
    let acc: Feature<Polygon | MultiPolygon> = features[0];
    for (let i = 1; i < features.length; i++) {
      try {
        const step = turf.union(turf.featureCollection([acc, features[i]]));
        if (step) acc = step;
      } catch {
        // skip invalid topology pair
      }
    }
    return acc;
  }
}

function isPolygonFeature(
  feature: Feature
): feature is Feature<Polygon | MultiPolygon, Record<string, unknown>> {
  return Boolean(
    feature.geometry &&
      (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon')
  );
}

/**
 * Pure GeoJSON processor implementing the OSM Overpass admin_level 5/6/7 pipeline:
 * separates Kabupaten Buleleng (level 5), 9 Kecamatan (level 6), and Desa/Kelurahan (level 7),
 * unions kecamatan if level 5 is missing, filters out neighboring regencies via spatial join,
 * and computes polygon center + area + outside-Buleleng masking polygon.
 */
export function processOsmGeoJson(
  geojson: FeatureCollection,
  source: 'overpass-osm' | 'local-fallback' = 'overpass-osm'
): BulelengBoundaryData {
  let kabupatenGeoJSON: Feature<Polygon | MultiPolygon> | null = null;
  const kecamatanFeatures: AdminPolygonFeature[] = [];
  const rawDesaFeatures: Array<Feature<Polygon | MultiPolygon, Record<string, unknown>>> = [];
  const seenKecIds = new Set<string>();

  for (const feature of geojson.features || []) {
    if (!isPolygonFeature(feature)) continue;
    const props = feature.properties || {};
    const level = String(props.admin_level || '');
    const rawName = String(props.name || props['name:id'] || '');

    if (level === '5' && /buleleng/i.test(rawName)) {
      kabupatenGeoJSON = feature;
    } else if (level === '6') {
      const canonical = getKecamatanCanonicalFromName(rawName);
      if (canonical && !seenKecIds.has(canonical.toLowerCase())) {
        seenKecIds.add(canonical.toLowerCase());
        const { lat, lng, areaKm2 } = computeFeatureCenterAndArea(feature);
        kecamatanFeatures.push({
          ...feature,
          properties: {
            ...props,
            _cleanName: canonical,
            _kecamatanId: canonical.toLowerCase(),
            _kecamatanName: `Kecamatan ${canonical}`,
            _centerLat: lat,
            _centerLng: lng,
            _areaKm2: areaKm2,
          },
        });
      }
    } else if (level === '7' && rawName.trim().length > 0) {
      rawDesaFeatures.push(feature);
    }
  }

  if (!kabupatenGeoJSON && kecamatanFeatures.length > 0) {
    kabupatenGeoJSON = unionPolygons(kecamatanFeatures);
  }

  const desaFeatures: AdminPolygonFeature[] = [];
  const seenDesaKeys = new Set<string>();

  for (const desa of rawDesaFeatures) {
    const props = desa.properties || {};
    const rawName = String(props.name || props['name:id'] || '').trim();
    if (!rawName) continue;

    try {
      const center = turf.pointOnFeature(desa);
      if (kabupatenGeoJSON && !turf.booleanPointInPolygon(center, kabupatenGeoJSON)) {
        continue;
      }

      let matchedKecCanonical: string | null = null;
      for (const kec of kecamatanFeatures) {
        if (turf.booleanPointInPolygon(center, kec)) {
          matchedKecCanonical = kec.properties._cleanName;
          break;
        }
      }

      if (!matchedKecCanonical) continue;

      const dedupeKey = `${matchedKecCanonical.toLowerCase()}::${normalizeVillageNameKey(rawName)}`;
      if (seenDesaKeys.has(dedupeKey)) continue;
      seenDesaKeys.add(dedupeKey);

      const { lat, lng, areaKm2 } = computeFeatureCenterAndArea(desa);
      desaFeatures.push({
        ...desa,
        properties: {
          ...props,
          _cleanName: rawName,
          _kecamatanId: matchedKecCanonical.toLowerCase(),
          _kecamatanName: matchedKecCanonical,
          _centerLat: lat,
          _centerLng: lng,
          _areaKm2: areaKm2,
        },
      });
    } catch {
      // Skip malformed geometry
    }
  }

  desaFeatures.sort((a, b) => a.properties._cleanName.localeCompare(b.properties._cleanName, 'id'));

  return {
    source,
    kabupatenGeoJSON,
    maskGeoJSON: buildMaskPolygon(kabupatenGeoJSON),
    kecamatanFeatures,
    desaFeatures,
    fetchedAt: Date.now(),
  };
}

export interface BulelengBoundsBox {
  south: number;
  west: number;
  north: number;
  east: number;
}

export interface LocalDesaGeoJsonLike {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    properties: {
      villageId: string;
      nama: string;
      kecamatanId: string;
      kecamatanName: string;
      source?: string;
    };
    geometry: {
      type: 'Polygon' | 'MultiPolygon';
      coordinates: number[][][] | number[][][][];
    };
  }>;
}

export function computeKabupatenLockBounds(
  kabupatenGeoJSON: Feature<Polygon | MultiPolygon> | null,
  paddingDeg = 0.015
): BulelengBoundsBox {
  if (kabupatenGeoJSON) {
    try {
      const [minLng, minLat, maxLng, maxLat] = turf.bbox(kabupatenGeoJSON);
      if (
        Number.isFinite(minLng) &&
        Number.isFinite(minLat) &&
        Number.isFinite(maxLng) &&
        Number.isFinite(maxLat)
      ) {
        return {
          south: Number((minLat - paddingDeg).toFixed(5)),
          west: Number((minLng - paddingDeg).toFixed(5)),
          north: Number((maxLat + paddingDeg).toFixed(5)),
          east: Number((maxLng + paddingDeg).toFixed(5)),
        };
      }
    } catch {
      // fallback below
    }
  }
  return {
    south: BULELENG_DEFAULT_BOUNDS[0][0],
    west: BULELENG_DEFAULT_BOUNDS[0][1],
    north: BULELENG_DEFAULT_BOUNDS[1][0],
    east: BULELENG_DEFAULT_BOUNDS[1][1],
  };
}

export function isCoordinateOutsideBounds(
  lat: number,
  lng: number,
  bounds: BulelengBoundsBox,
  marginDeg = 0
): boolean {
  return (
    lat < bounds.south + marginDeg ||
    lat > bounds.north - marginDeg ||
    lng < bounds.west + marginDeg ||
    lng > bounds.east - marginDeg
  );
}

/**
 * Pure boundary-push detector:
 * When the user is zoomed in (e.g. inspecting a Kecamatan or Desa) and forces a pan/drag
 * past the locked outer boundary of Kabupaten Buleleng (e.g., pushing east past Tejakula
 * or west past Gerokgak), returns true so the map smoothly zooms out to show Kabupaten Buleleng.
 */
export function shouldAutoZoomOutOnBoundaryPush(params: {
  currentZoom: number;
  baseZoom: number;
  viewportBounds: BulelengBoundsBox;
  lockBounds: BulelengBoundsBox;
  pointerDeltaX: number; // positive = dragged map content right (moving camera WEST), negative = moving camera EAST
  pointerDeltaY: number; // positive = moving camera NORTH, negative = moving camera SOUTH
  edgeToleranceDeg?: number;
  minForcePx?: number;
}): boolean {
  const {
    currentZoom,
    baseZoom,
    viewportBounds,
    lockBounds,
    pointerDeltaX,
    pointerDeltaY,
    edgeToleranceDeg = 0.025,
    minForcePx = 48,
  } = params;

  // Only zoom out if user is currently zoomed in deeper than Kabupaten overview
  if (currentZoom <= baseZoom + 0.35) {
    return false;
  }

  const pushingEastPastTejakula =
    viewportBounds.east >= lockBounds.east - edgeToleranceDeg && pointerDeltaX <= -minForcePx;
  const pushingWestPastGerokgak =
    viewportBounds.west <= lockBounds.west + edgeToleranceDeg && pointerDeltaX >= minForcePx;
  const pushingNorthPastCoast =
    viewportBounds.north >= lockBounds.north - edgeToleranceDeg && pointerDeltaY >= minForcePx;
  const pushingSouthPastBorder =
    viewportBounds.south <= lockBounds.south + edgeToleranceDeg && pointerDeltaY <= -minForcePx;

  return (
    pushingEastPastTejakula ||
    pushingWestPastGerokgak ||
    pushingNorthPastCoast ||
    pushingSouthPastBorder
  );
}

/**
 * Resolves the crisp administrative boundary polygon feature for ANY village in Buleleng.
 * NEVER uses a circle or radial shape!
 * Priority:
 * 1. Exact official administrative polygon matched by villageId.
 * 2. Exact official administrative polygon matched by normalized name in the same Kecamatan.
 * 3. Spatial containment match (point-in-polygon) against official village polygons in the same Kecamatan.
 * 4. Clipped Voronoi territorial polygon strictly bounded by parent Kecamatan polygon (zero circles/radials).
 */
export function resolveVillageBoundaryFeature(
  village: Pick<EccdVillageMarker, 'id' | 'name' | 'kecamatanId' | 'kecamatanName' | 'lat' | 'lng'>,
  desaFeatures: AdminPolygonFeature[],
  kecamatanFeatures: AdminPolygonFeature[]
): AdminPolygonFeature {
  const normTarget = normalizeVillageNameKey(village.name);
  const normKec = village.kecamatanId.toLowerCase();

  // 1. Direct villageId match
  const byId = desaFeatures.find(
    (f) => String(f.properties.villageId || '') === village.id
  );
  if (byId) return byId;

  // 2. Same Kecamatan + normalized village name match
  const byNameInKec = desaFeatures.find(
    (f) =>
      f.properties._kecamatanId.toLowerCase() === normKec &&
      normalizeVillageNameKey(f.properties._cleanName) === normTarget
  );
  if (byNameInKec) return byNameInKec;

  // 3. Spatial containment match: if coordinates fall inside an official village polygon in same Kecamatan
  const pt = turf.point([village.lng, village.lat]);
  const desaInSameKec = desaFeatures.filter(
    (f) => f.properties._kecamatanId.toLowerCase() === normKec
  );
  for (const candidate of desaInSameKec) {
    try {
      if (turf.booleanPointInPolygon(pt, candidate)) {
        return {
          ...candidate,
          properties: {
            ...candidate.properties,
            villageId: village.id,
            name: village.name,
            _cleanName: village.name,
          },
        };
      }
    } catch {
      // skip invalid geometry
    }
  }

  // 4. Non-radial polygonal fallback: Voronoi territorial cell clipped to parent Kecamatan boundary
  const parentKec = kecamatanFeatures.find(
    (k) => k.properties._kecamatanId.toLowerCase() === normKec
  );

  let finalPoly: Feature<Polygon | MultiPolygon> | null = null;
  if (parentKec) {
    try {
      const kecBbox = turf.bbox(parentKec);
      const pad = 0.02;
      const expandedBbox: [number, number, number, number] = [
        kecBbox[0] - pad,
        kecBbox[1] - pad,
        kecBbox[2] + pad,
        kecBbox[3] + pad,
      ];

      const seedPoints = [
        turf.point([village.lng, village.lat], { target: true }),
        ...BULELENG_ALL_VILLAGES.filter(
          (m) =>
            m.kecamatanId === normKec &&
            normalizeVillageNameKey(m.name) !== normTarget
        ).map((m) => turf.point([m.lng, m.lat], { target: false })),
      ];

      const voronoiFc = turf.voronoi(turf.featureCollection(seedPoints), {
        bbox: expandedBbox,
      });
      const targetCell = voronoiFc?.features?.[0];
      if (targetCell) {
        const clipped = turf.intersect(turf.featureCollection([targetCell, parentKec]));
        if (clipped) {
          finalPoly = clipped;
        }
      }
    } catch {
      // fallback to parentKec polygon below
    }
  }

  if (!finalPoly) {
    if (parentKec) {
      finalPoly = parentKec;
    } else {
      // Sharp rectangular administrative bounding box (never a circle/radial)
      const d = 0.008;
      finalPoly = turf.polygon([
        [
          [village.lng - d, village.lat - d],
          [village.lng + d, village.lat - d],
          [village.lng + d, village.lat + d],
          [village.lng - d, village.lat + d],
          [village.lng - d, village.lat - d],
        ],
      ]);
    }
  }

  const { lat, lng, areaKm2 } = computeFeatureCenterAndArea(finalPoly);
  return {
    ...finalPoly,
    properties: {
      villageId: village.id,
      name: village.name,
      admin_level: '7',
      _cleanName: village.name,
      _kecamatanId: normKec,
      _kecamatanName: village.kecamatanName.replace(/^Kecamatan\s+/i, ''),
      _centerLat: lat,
      _centerLng: lng,
      _areaKm2: areaKm2,
    },
  };
}

/**
 * Builds an instant zero-latency OpenStreetMap administrative boundary dataset from DATA_BULELENG_GEOJSON
 * (and optional real OSM DATA_DESA_BULELENG_GEOJSON) so Kabupaten Buleleng, all 9 Kecamatan,
 * real village polygons, and focus masking render immediately.
 */
export function buildLocalFallbackBoundaryData(
  localGeoJson: BulelengGeoJsonObject,
  localDesaGeoJson?: LocalDesaGeoJsonLike
): BulelengBoundaryData {
  const kecamatanFeatures: AdminPolygonFeature[] = localGeoJson.features.map((feat) => {
    const canonical =
      KECAMATAN_ID_TO_CANONICAL[feat.properties.id.toLowerCase()] || feat.properties.nama;
    const polyFeature: Feature<Polygon | MultiPolygon> = {
      type: 'Feature',
      properties: { ...feat.properties, admin_level: '6', name: canonical },
      geometry: feat.geometry as Polygon | MultiPolygon,
    };
    const { lat, lng, areaKm2 } = computeFeatureCenterAndArea(polyFeature);
    return {
      ...polyFeature,
      properties: {
        name: canonical,
        admin_level: '6',
        id: feat.properties.id,
        _cleanName: canonical,
        _kecamatanId: feat.properties.id.toLowerCase(),
        _kecamatanName: `Kecamatan ${canonical}`,
        _centerLat: lat,
        _centerLng: lng,
        _areaKm2: areaKm2,
      },
    };
  });

  const desaFeatures: AdminPolygonFeature[] = (localDesaGeoJson?.features || []).map((feat) => {
    const polyFeature: Feature<Polygon | MultiPolygon> = {
      type: 'Feature',
      properties: { ...feat.properties, admin_level: '7', name: feat.properties.nama },
      geometry: feat.geometry as Polygon | MultiPolygon,
    };
    const { lat, lng, areaKm2 } = computeFeatureCenterAndArea(polyFeature);
    return {
      ...polyFeature,
      properties: {
        villageId: feat.properties.villageId,
        name: feat.properties.nama,
        admin_level: '7',
        _cleanName: feat.properties.nama,
        _kecamatanId: feat.properties.kecamatanId.toLowerCase(),
        _kecamatanName: feat.properties.kecamatanName,
        _centerLat: lat,
        _centerLng: lng,
        _areaKm2: areaKm2,
      },
    };
  });

  const kabupatenGeoJSON = unionPolygons(kecamatanFeatures);
  return {
    source: 'local-fallback',
    kabupatenGeoJSON,
    maskGeoJSON: buildMaskPolygon(kabupatenGeoJSON),
    kecamatanFeatures,
    desaFeatures,
    fetchedAt: Date.now(),
  };
}

function deterministicHash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * Determines whether a village has real ECCD service or agenda data.
 * True  -> Marker renders BLUE (#2563eb) and opens Data Layanan & Agenda.
 * False -> Marker renders GREY (#94a3b8) with empty data (no fabricated stats).
 */
export function hasVillageServiceData(
  village: Pick<EccdVillageMarker, 'serviceData' | 'agendaList'>
): boolean {
  const recipients = Number(village.serviceData?.totalRecipients || 0);
  const agendas = Array.isArray(village.agendaList) ? village.agendaList.length : 0;
  return recipients > 0 || agendas > 0;
}

export type EnrichedVillageDot = EccdVillageMarker & {
  isPrimaryEccd: boolean;
  hasData: boolean;
  areaKm2?: number;
  osmId?: string;
};

function createEmptyVillageDot(params: {
  id: string;
  name: string;
  kecamatanId: string;
  canonicalKec: string;
  lat: number;
  lng: number;
  areaKm2?: number;
  osmId?: string;
}): EnrichedVillageDot {
  const { id, name, kecamatanId, canonicalKec, lat, lng, areaKm2, osmId } = params;
  return {
    id,
    name,
    kecamatanId,
    kecamatanName: `Kecamatan ${canonicalKec}`,
    lat,
    lng,
    population: 0,
    posyanduCount: 0,
    stuntingPct: 0,
    statusProgram: 'Siaga Layanan',
    deskripsi: `Wilayah administratif ${name} di Kecamatan ${canonicalKec}. Belum ada data layanan ECCD atau agenda kegiatan tercatat.`,
    serviceData: {
      totalRecipients: 0,
      genderBreakdown: { lakiLaki: 0, perempuan: 0 },
      ageGroups: [],
      serviceTypes: [],
      lastUpdated: 'Belum ada data',
    },
    agendaList: [],
    isPrimaryEccd: false,
    hasData: false,
    areaKm2,
    osmId,
  };
}

/**
 * Builds the FULL list of village dot markers (seluruh desa/kelurahan di kecamatan terpilih).
 * - Merges all ECCD/Firebase villages, real OSM admin_level=7 polygons, and the complete
 *   148-village Buleleng master directory without duplicates.
 * - Villages WITH real service/agenda data get `hasData: true` (rendered BLUE on map).
 * - Villages WITHOUT data get `hasData: false` (rendered GREY on map, zero fabricated numbers).
 */
export function buildVillageDotsForKecamatan(
  kecId: string,
  osmDesaFeatures: AdminPolygonFeature[],
  eccdVillages: EccdVillageMarker[],
  _fallbackImageUrl = ''
): EnrichedVillageDot[] {
  const normalizedKecId = kecId.toLowerCase();
  const canonicalKec = KECAMATAN_ID_TO_CANONICAL[normalizedKecId] || kecId;

  const eccdInKec = eccdVillages.filter((v) => v.kecamatanId.toLowerCase() === normalizedKecId);
  const osmInKec = osmDesaFeatures.filter(
    (d) => d.properties._kecamatanId.toLowerCase() === normalizedKecId
  );
  const masterInKec = BULELENG_ALL_VILLAGES.filter((v) => v.kecamatanId === normalizedKecId);

  const eccdByNormName = new Map<string, EccdVillageMarker>();
  for (const v of eccdInKec) {
    eccdByNormName.set(normalizeVillageNameKey(v.name), v);
  }

  const osmByNormName = new Map<string, AdminPolygonFeature>();
  for (const osmDesa of osmInKec) {
    const normKey = normalizeVillageNameKey(osmDesa.properties._cleanName);
    if (normKey && !osmByNormName.has(normKey)) {
      osmByNormName.set(normKey, osmDesa);
    }
  }

  const resultsByNormKey = new Map<string, EnrichedVillageDot>();

  // 1. Add all ECCD / Firebase villages first (preserving real data & snapping to OSM center if available)
  for (const eccdVillage of eccdInKec) {
    const normKey = normalizeVillageNameKey(eccdVillage.name) || eccdVillage.id;
    const osmMatch = osmByNormName.get(normKey);
    const hasData = hasVillageServiceData(eccdVillage);
    resultsByNormKey.set(normKey, {
      ...eccdVillage,
      lat: osmMatch?.properties._centerLat || eccdVillage.lat,
      lng: osmMatch?.properties._centerLng || eccdVillage.lng,
      isPrimaryEccd: hasData,
      hasData,
      areaKm2: osmMatch?.properties._areaKm2,
      osmId: osmMatch ? String(osmMatch.id || osmMatch.properties.id || '') : undefined,
    });
  }

  // 2. Add every official Desa/Kelurahan from the 148-village Buleleng master list (empty = grey dot)
  for (const master of masterInKec) {
    const normKey = normalizeVillageNameKey(master.name);
    if (resultsByNormKey.has(normKey)) continue;

    const osmMatch = osmByNormName.get(normKey);
    resultsByNormKey.set(
      normKey,
      createEmptyVillageDot({
        id: master.id,
        name: master.name,
        kecamatanId: normalizedKecId,
        canonicalKec,
        lat: osmMatch?.properties._centerLat || master.lat,
        lng: osmMatch?.properties._centerLng || master.lng,
        areaKm2: osmMatch?.properties._areaKm2,
        osmId: osmMatch ? String(osmMatch.id || osmMatch.properties.id || '') : undefined,
      })
    );
  }

  // 3. Add any extra real OSM admin_level=7 villages not yet covered (empty = grey dot)
  for (const osmDesa of osmInKec) {
    const rawName = osmDesa.properties._cleanName;
    const normKey = normalizeVillageNameKey(rawName);
    if (!normKey || resultsByNormKey.has(normKey)) continue;

    const isKelurahan = /^kelurahan\b/i.test(rawName) || osmDesa.properties.place === 'suburb';
    const displayName = /^(desa|kelurahan)\s+/i.test(rawName)
      ? rawName
      : `${isKelurahan ? 'Kelurahan' : 'Desa'} ${rawName}`;
    const villageId = `osm-${normalizedKecId}-${normKey || deterministicHash(`${normalizedKecId}-${rawName}`)}`;

    resultsByNormKey.set(
      normKey,
      createEmptyVillageDot({
        id: villageId,
        name: displayName,
        kecamatanId: normalizedKecId,
        canonicalKec,
        lat: osmDesa.properties._centerLat,
        lng: osmDesa.properties._centerLng,
        areaKm2: osmDesa.properties._areaKm2,
        osmId: String(osmDesa.id || osmDesa.properties.id || ''),
      })
    );
  }

  const results = Array.from(resultsByNormKey.values());

  // Villages WITH data (Blue) first (Desa Sari Mekar prioritized), then empty villages (Grey) alphabetically
  results.sort((a, b) => {
    if (a.id === 'desa-sarimekar' && a.hasData) return -1;
    if (b.id === 'desa-sarimekar' && b.hasData) return 1;
    if (a.hasData !== b.hasData) return a.hasData ? -1 : 1;
    return a.name.localeCompare(b.name, 'id');
  });

  return results;
}

// =========================================================================
// REALTIME OVERPASS API FETCH WITH MIRROR FALLBACK & IN-MEMORY CACHE
// =========================================================================

let cachedOsmData: BulelengBoundaryData | null = null;
let inflightOsmPromise: Promise<BulelengBoundaryData> | null = null;

async function fetchWithFallbackOverpass(query: string): Promise<unknown> {
  let lastError: unknown = null;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 22000);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        body: 'data=' + encodeURIComponent(query),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = (await response.json()) as { elements?: unknown[] };
      if (data && Array.isArray(data.elements) && data.elements.length > 0) {
        return data;
      }
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Server Overpass API sedang sibuk.');
}

export async function fetchRealtimeBulelengBoundaries(
  forceRefresh = false
): Promise<BulelengBoundaryData> {
  if (!forceRefresh && cachedOsmData) {
    return cachedOsmData;
  }
  if (!forceRefresh && inflightOsmPromise) {
    return inflightOsmPromise;
  }

  const runFetch = async (): Promise<BulelengBoundaryData> => {
    let osmRaw: unknown;
    try {
      osmRaw = await fetchWithFallbackOverpass(buildOverpassQuery());
    } catch {
      osmRaw = await fetchWithFallbackOverpass(buildFallbackBboxQuery());
    }

    const geojson = osmtogeojson(osmRaw);
    const processed = processOsmGeoJson(geojson, 'overpass-osm');

    if (processed.kecamatanFeatures.length === 0) {
      throw new Error('Data batas kecamatan tidak ditemukan dari respons Overpass OSM.');
    }

    cachedOsmData = processed;
    return processed;
  };

  inflightOsmPromise = runFetch().finally(() => {
    inflightOsmPromise = null;
  });

  return inflightOsmPromise;
}
