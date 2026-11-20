import test from 'node:test';
import assert from 'node:assert/strict';
import type { FeatureCollection } from 'geojson';
import {
  cleanAdminName,
  normalizeVillageNameKey,
  getKecamatanCanonicalFromName,
  processOsmGeoJson,
  buildLocalFallbackBoundaryData,
  buildMaskPolygon,
  buildVillageDotsForKecamatan,
  KECAMATAN_COLORS,
} from './bulelengOsmMap';
import { DATA_BULELENG_GEOJSON } from '../data/bulelengGeoJson';
import type { EccdVillageMarker } from '../types';

const MOCK_ECCD_VILLAGES: EccdVillageMarker[] = [
  {
    id: 'desa-sarimekar',
    name: 'Desa Sari Mekar',
    kecamatanId: 'buleleng',
    kecamatanName: 'Kecamatan Buleleng',
    lat: -8.135,
    lng: 115.095,
    population: 4850,
    posyanduCount: 6,
    stuntingPct: 6.4,
    statusProgram: 'Desa Binaan Utama',
    deskripsi: 'Desa binaan utama ECCD.',
    serviceData: {
      totalRecipients: 194,
      genderBreakdown: { lakiLaki: 88, perempuan: 106 },
      ageGroups: [{ label: 'Balita (0-5 th)', count: 72 }],
      serviceTypes: [{ serviceName: 'Gizi Balita', count: 100 }],
      lastUpdated: '2025',
    },
    agendaList: [],
  },
  {
    id: 'desa-lovina',
    name: 'Desa Kalibukbuk',
    kecamatanId: 'buleleng',
    kecamatanName: 'Kecamatan Buleleng',
    lat: -8.155,
    lng: 115.03,
    population: 5200,
    posyanduCount: 5,
    stuntingPct: 7.1,
    statusProgram: 'Aktif ECCD Mobile',
    deskripsi: 'Desa pesisir.',
    serviceData: {
      totalRecipients: 140,
      genderBreakdown: { lakiLaki: 62, perempuan: 78 },
      ageGroups: [{ label: 'Balita (0-5 th)', count: 50 }],
      serviceTypes: [{ serviceName: 'Konseling KIA', count: 70 }],
      lastUpdated: '2025',
    },
    agendaList: [],
  },
];

const MOCK_OSM_GEOJSON: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    // Kecamatan Buleleng polygon (admin_level 6)
    {
      type: 'Feature',
      id: 'relation/100',
      properties: { admin_level: '6', name: 'Kecamatan Buleleng' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [115.05, -8.1],
            [115.13, -8.1],
            [115.13, -8.16],
            [115.05, -8.16],
            [115.05, -8.1],
          ],
        ],
      },
    },
    // Kecamatan Gerokgak polygon (admin_level 6)
    {
      type: 'Feature',
      id: 'relation/101',
      properties: { admin_level: '6', name: 'Gerokgak' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [114.43, -8.11],
            [114.78, -8.11],
            [114.78, -8.25],
            [114.43, -8.25],
            [114.43, -8.11],
          ],
        ],
      },
    },
    // Desa inside Buleleng matching ECCD seed ("Sari Mekar")
    {
      type: 'Feature',
      id: 'relation/201',
      properties: { admin_level: '7', name: 'Sari Mekar' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [115.08, -8.12],
            [115.11, -8.12],
            [115.11, -8.14],
            [115.08, -8.14],
            [115.08, -8.12],
          ],
        ],
      },
    },
    // Extra real OSM desa inside Buleleng ("Kelurahan Banyuning")
    {
      type: 'Feature',
      id: 'relation/202',
      properties: { admin_level: '7', name: 'Kelurahan Banyuning', place: 'suburb' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [115.09, -8.105],
            [115.12, -8.105],
            [115.12, -8.118],
            [115.09, -8.118],
            [115.09, -8.105],
          ],
        ],
      },
    },
    // Village OUTSIDE Buleleng (e.g., Tabanan) — must be filtered out!
    {
      type: 'Feature',
      id: 'relation/999',
      properties: { admin_level: '7', name: 'Desa Pupuan' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [114.95, -8.45],
            [115.05, -8.45],
            [115.05, -8.55],
            [114.95, -8.55],
            [114.95, -8.45],
          ],
        ],
      },
    },
  ],
};

test('cleanAdminName strips Kecamatan and Kabupaten prefixes', () => {
  assert.equal(cleanAdminName('Kecamatan Buleleng'), 'Buleleng');
  assert.equal(cleanAdminName('Kabupaten Buleleng'), 'Buleleng');
  assert.equal(cleanAdminName('  Seririt '), 'Seririt');
  assert.equal(cleanAdminName(''), 'Tanpa Nama');
});

test('normalizeVillageNameKey matches Desa/Kelurahan variants cleanly', () => {
  assert.equal(normalizeVillageNameKey('Desa Sari Mekar'), 'sarimekar');
  assert.equal(normalizeVillageNameKey('Sari Mekar'), 'sarimekar');
  assert.equal(normalizeVillageNameKey('Kelurahan Banyuning'), 'banyuning');
  assert.equal(normalizeVillageNameKey('Kel. Banyuning'), 'banyuning');
});

test('getKecamatanCanonicalFromName resolves all 9 Buleleng districts', () => {
  assert.equal(Object.keys(KECAMATAN_COLORS).length, 9);
  assert.equal(getKecamatanCanonicalFromName('Kecamatan Gerokgak'), 'Gerokgak');
  assert.equal(getKecamatanCanonicalFromName('tejakula'), 'Tejakula');
  assert.equal(getKecamatanCanonicalFromName('Denpasar'), null);
});

test('processOsmGeoJson unions kabupaten when level 5 missing, joins desa to parent kecamatan, and drops outside villages', () => {
  const processed = processOsmGeoJson(MOCK_OSM_GEOJSON, 'overpass-osm');

  assert.equal(processed.kecamatanFeatures.length, 2);
  assert.ok(processed.kabupatenGeoJSON, 'kabupatenGeoJSON should be synthesized from kecamatan union');
  assert.ok(processed.maskGeoJSON, 'maskGeoJSON should be generated using turf v7 difference');

  // Desa Pupuan (outside Buleleng) must be filtered out; Sari Mekar + Banyuning retained under buleleng
  assert.equal(processed.desaFeatures.length, 2);
  const desaNames = processed.desaFeatures.map((d) => d.properties._cleanName);
  assert.ok(desaNames.includes('Sari Mekar'));
  assert.ok(desaNames.includes('Kelurahan Banyuning'));
  assert.ok(!desaNames.includes('Desa Pupuan'));
  for (const desa of processed.desaFeatures) {
    assert.equal(desa.properties._kecamatanId, 'buleleng');
    assert.ok(desa.properties._areaKm2 > 0);
  }
});

test('buildLocalFallbackBoundaryData builds 9 kecamatan polygons, county union, and focus mask', () => {
  const fallback = buildLocalFallbackBoundaryData(DATA_BULELENG_GEOJSON);
  assert.equal(fallback.source, 'local-fallback');
  assert.equal(fallback.kecamatanFeatures.length, 9);
  assert.ok(fallback.kabupatenGeoJSON);
  assert.ok(fallback.maskGeoJSON);
  assert.equal(buildMaskPolygon(null), null);
});

test('buildVillageDotsForKecamatan renders full 148 Buleleng villages with hasData (blue) vs empty (grey) separation', async () => {
  const { BULELENG_ALL_VILLAGES } = await import('../data/bulelengAllVillages');
  assert.equal(BULELENG_ALL_VILLAGES.length, 148, 'Kabupaten Buleleng must have all 148 official Desa/Kelurahan');

  const processed = processOsmGeoJson(MOCK_OSM_GEOJSON, 'overpass-osm');
  const dots = buildVillageDotsForKecamatan(
    'buleleng',
    processed.desaFeatures,
    MOCK_ECCD_VILLAGES
  );

  // Kecamatan Buleleng has 29 official Desa & Kelurahan — all must appear as map dots!
  assert.equal(dots.length, 29);

  // Villages WITH data come first and have hasData === true (Blue marker)
  assert.equal(dots[0].id, 'desa-sarimekar');
  assert.equal(dots[0].hasData, true);
  assert.equal(dots[0].serviceData.totalRecipients, 194);

  const kalibukbuk = dots.find((d) => d.id === 'desa-lovina');
  assert.ok(kalibukbuk, 'Unmatched ECCD seed in selected kecamatan should remain present');
  assert.equal(kalibukbuk.hasData, true);

  // Empty villages (e.g. Kelurahan Banyuning without ECCD data) stay mapped as GREY dots with 0 data (no fabricated stats)
  const banyuning = dots.find((d) => d.name === 'Kelurahan Banyuning');
  assert.ok(banyuning, 'Kelurahan Banyuning must be present in full Kecamatan Buleleng map');
  assert.equal(banyuning.hasData, false);
  assert.equal(banyuning.serviceData.totalRecipients, 0);
  assert.equal(banyuning.agendaList.length, 0);

  // Tejakula must have all 10 official villages
  const tejakulaDots = buildVillageDotsForKecamatan('tejakula', [], []);
  assert.equal(tejakulaDots.length, 10);
  assert.ok(tejakulaDots.every((d) => d.hasData === false));
});

test('computeKabupatenLockBounds and shouldAutoZoomOutOnBoundaryPush lock map to Buleleng and trigger zoom-out when pushing past Tejakula', async () => {
  const {
    computeKabupatenLockBounds,
    shouldAutoZoomOutOnBoundaryPush,
    resolveVillageBoundaryFeature,
  } = await import('./bulelengOsmMap');

  const fallback = buildLocalFallbackBoundaryData(DATA_BULELENG_GEOJSON);
  const lockBounds = computeKabupatenLockBounds(fallback.kabupatenGeoJSON);

  // Eastern border must stay right around Tejakula (~115.46) and Western around Gerokgak (~114.42)
  assert.ok(lockBounds.east > 115.3 && lockBounds.east < 115.6);
  assert.ok(lockBounds.west > 114.3 && lockBounds.west < 114.6);

  // Forcing drag East past Tejakula while zoomed in (zoom 13 > base 10) -> must auto zoom out
  const pushedEast = shouldAutoZoomOutOnBoundaryPush({
    currentZoom: 13,
    baseZoom: 10,
    viewportBounds: {
      south: -8.22,
      west: 115.25,
      north: -8.08,
      east: lockBounds.east - 0.005,
    },
    lockBounds,
    pointerDeltaX: -80, // dragging map left to force camera EAST past Tejakula
    pointerDeltaY: 0,
  });
  assert.equal(pushedEast, true);

  // Normal pan inside middle of Buleleng -> must NOT trigger auto zoom out
  const normalPan = shouldAutoZoomOutOnBoundaryPush({
    currentZoom: 13,
    baseZoom: 10,
    viewportBounds: {
      south: -8.22,
      west: 114.85,
      north: -8.08,
      east: 115.15,
    },
    lockBounds,
    pointerDeltaX: -80,
    pointerDeltaY: 0,
  });
  assert.equal(normalPan, false);

  // Already at Kabupaten overview zoom -> must NOT trigger redundant zoom out
  const atBaseZoom = shouldAutoZoomOutOnBoundaryPush({
    currentZoom: 10,
    baseZoom: 10,
    viewportBounds: { ...lockBounds },
    lockBounds,
    pointerDeltaX: -120,
    pointerDeltaY: 0,
  });
  assert.equal(atBaseZoom, false);

  // resolveVillageBoundaryFeature returns exact OSM polygon when available, or clean clipped fallback
  const processed = processOsmGeoJson(MOCK_OSM_GEOJSON, 'overpass-osm');
  const sariMekarPoly = resolveVillageBoundaryFeature(
    MOCK_ECCD_VILLAGES[0],
    processed.desaFeatures,
    processed.kecamatanFeatures
  );
  assert.equal(sariMekarPoly.properties._cleanName, 'Sari Mekar');
  assert.ok(sariMekarPoly.geometry.type === 'Polygon' || sariMekarPoly.geometry.type === 'MultiPolygon');

  const fallbackPoly = resolveVillageBoundaryFeature(
    MOCK_ECCD_VILLAGES[1],
    processed.desaFeatures,
    processed.kecamatanFeatures
  );
  assert.equal(fallbackPoly.properties._cleanName, 'Desa Kalibukbuk');
  assert.ok(fallbackPoly.geometry.type === 'Polygon' || fallbackPoly.geometry.type === 'MultiPolygon');
});

test('all 148 Buleleng villages have real sharp administrative polygons (including Desa Tukadsumaga) and zero circles', async () => {
  const { DATA_DESA_BULELENG_GEOJSON } = await import('../data/bulelengDesaGeoJson');
  const { BULELENG_ALL_VILLAGES } = await import('../data/bulelengAllVillages');
  const { resolveVillageBoundaryFeature } = await import('./bulelengOsmMap');

  assert.equal(
    DATA_DESA_BULELENG_GEOJSON.features.length,
    148,
    'DATA_DESA_BULELENG_GEOJSON must include all 148 official villages of Buleleng'
  );

  const localData = buildLocalFallbackBoundaryData(DATA_BULELENG_GEOJSON, DATA_DESA_BULELENG_GEOJSON);
  assert.equal(localData.desaFeatures.length, 148);

  // Specifically assert Desa Tukadsumaga in Gerokgak matches its official administrative polygon
  const tukadsumaga = BULELENG_ALL_VILLAGES.find((v) => v.name === 'Desa Tukadsumaga');
  assert.ok(tukadsumaga, 'Desa Tukadsumaga must exist in master list');
  const tukadPoly = resolveVillageBoundaryFeature(
    tukadsumaga,
    localData.desaFeatures,
    localData.kecamatanFeatures
  );
  assert.equal(tukadPoly.properties.villageId, tukadsumaga.id);
  assert.ok(tukadPoly.properties._areaKm2 > 1, 'Desa Tukadsumaga polygon must have valid real area');

  // Verify ALL 148 villages resolve directly by villageId to real administrative polygons
  for (const v of BULELENG_ALL_VILLAGES) {
    const resolved = resolveVillageBoundaryFeature(
      v,
      localData.desaFeatures,
      localData.kecamatanFeatures
    );
    assert.equal(resolved.properties.villageId, v.id, `Missing real polygon for ${v.name}`);
    assert.ok(resolved.properties._areaKm2 > 0, `Polygon area must be > 0 for ${v.name}`);
  }
});


