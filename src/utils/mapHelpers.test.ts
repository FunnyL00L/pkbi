import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateGoldenSplit, getGoldenTypeScale } from './goldenRatio';
import {
  computeBulelengSummary,
  filterDistrictsByQuery,
  resolveDistrictHighlightActivity,
} from './mapHelpers';
import type { KecamatanInfo } from '../types';

const SAMPLE_DISTRICTS: KecamatanInfo[] = [
  {
    id: 'buleleng',
    name: 'Kecamatan Buleleng',
    capital: 'Singaraja',
    areaKm2: 46.94,
    population: 152890,
    lat: -8.1215,
    lng: 115.0931,
    positionCategory: 'center',
    color: '#1d4ed8',
    stuntingRate: 6.7,
    desaList: ['Desa Sari Mekar', 'Desa Pemaron'],
    activities: [
      {
        id: 'act-bul-1',
        title: 'Posyandu Sari Mekar',
        category: 'Kesehatan',
        hari: 'Senin',
        tanggal: '07 Okt 2024',
        imageUrl: '/img/a.jpg',
        description: 'Kegiatan rutin posyandu.',
        participants: 165,
        location: 'Desa Sari Mekar',
      },
    ],
  },
  {
    id: 'tejakula',
    name: 'Kecamatan Tejakula',
    capital: 'Tejakula',
    areaKm2: 143.71,
    population: 62480,
    lat: -8.1632,
    lng: 115.3421,
    positionCategory: 'right',
    color: '#1e40af',
    stuntingRate: 5.2,
    desaList: ['Desa Les', 'Desa Julah'],
    activities: [
      {
        id: 'act-tej-1',
        title: 'Konseling Remaja',
        category: 'Kespro',
        hari: 'Rabu',
        tanggal: '13 Nov 2024',
        imageUrl: '/img/b.jpg',
        description: 'Edukasi kesehatan reproduksi.',
        participants: 85,
        location: 'Desa Julah',
      },
    ],
  },
];

test('calculateGoldenSplit maintains 61.8 / 38.2 proportion', () => {
  const split = calculateGoldenSplit(1024, 24);
  assert.equal(split.majorPx + split.minorPx, 1000);
  assert.equal(split.majorPx, 618);
  assert.equal(split.minorPx, 382);
});

test('getGoldenTypeScale scales monotonically', () => {
  const scale = getGoldenTypeScale(16);
  assert.ok(scale.sm < scale.base);
  assert.ok(scale.base < scale.md);
  assert.ok(scale.md < scale.lg);
  assert.ok(scale.lg < scale.xl);
});

test('computeBulelengSummary totals population, area, and average stunting', () => {
  const stats = computeBulelengSummary(SAMPLE_DISTRICTS);
  assert.equal(stats.totalDistricts, 2);
  assert.equal(stats.totalPopulation, 215370);
  assert.equal(stats.totalAreaKm2, 190.65);
  assert.equal(stats.averageStuntingPct, 6.0);
});

test('filterDistrictsByQuery finds by district name, capital, and Sari Mekar', () => {
  assert.equal(filterDistrictsByQuery(SAMPLE_DISTRICTS, 'Singaraja').length, 1);
  assert.equal(filterDistrictsByQuery(SAMPLE_DISTRICTS, 'Sari Mekar')[0].id, 'buleleng');
  assert.equal(filterDistrictsByQuery(SAMPLE_DISTRICTS, 'Julah')[0].id, 'tejakula');
  assert.equal(filterDistrictsByQuery(SAMPLE_DISTRICTS, '').length, 2);
});

test('resolveDistrictHighlightActivity returns Sari Mekar focus override when enabled', () => {
  const focused = resolveDistrictHighlightActivity(SAMPLE_DISTRICTS[0], true, '/local.jpg');
  assert.equal(focused?.id, 'sm-focus-special');
  assert.equal(focused?.imageUrl, '/local.jpg');

  const normal = resolveDistrictHighlightActivity(SAMPLE_DISTRICTS[0], false, '/local.jpg');
  assert.equal(normal?.id, 'act-bul-1');
});
