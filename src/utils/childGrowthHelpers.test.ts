import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  ADMIN_RELAWAN_NAME,
  buildMonthlyGrowthPoint,
  calculateBmi,
  formatIndonesianDisplayDate,
  mergeFosterFamiliesWithCms,
  mergeVillagesWithCms,
  summarizeChildGrowth,
} from './childGrowthHelpers.ts';
import type { EccdVillageMarker, HarmonyFosterFamily } from '../types.ts';

const SAMPLE_VILLAGE: EccdVillageMarker = {
  id: 'desa-sarimekar',
  name: 'Desa Sari Mekar',
  kecamatanId: 'buleleng',
  kecamatanName: 'Kecamatan Buleleng',
  lat: -8.135,
  lng: 115.095,
  population: 4820,
  posyanduCount: 6,
  stuntingPct: 6.7,
  statusProgram: 'Desa Binaan Utama',
  deskripsi: 'Desa percontohan ECCD',
  serviceData: {
    totalRecipients: 215,
    genderBreakdown: { lakiLaki: 95, perempuan: 120 },
    ageGroups: [{ label: 'Balita (0-5 th)', count: 72 }],
    serviceTypes: [{ serviceName: 'Gizi Balita', count: 80 }],
    lastUpdated: '20 Feb 2025',
  },
  agendaList: [
    {
      id: 'ag-seed-1',
      villageId: 'desa-sarimekar',
      kecamatanId: 'buleleng',
      title: 'Posyandu Balita',
      category: 'Posyandu & Gizi',
      date: '2025-02-12',
      displayDate: 'Rabu, 12 Februari 2025',
      time: '08.00 - 11.30 WITA',
      status: 'Terlaksana',
      location: 'Balai Banjar Sari Mekar',
      facilitator: ADMIN_RELAWAN_NAME,
      participants: 60,
      summary: 'Pemantauan rutin',
      galleryImages: [],
    },
  ],
};

const SAMPLE_FAMILIES: HarmonyFosterFamily[] = [
  {
    id: 'fam-stunting-1',
    codeName: 'Anak Asuh 01',
    category: 'stunting',
    categoryLabel: 'Kasus Stunting',
    guardianOrMotherName: 'An. K.D.R',
    targetName: 'Usia 12 Bulan (1 Tahun)',
    banjar: 'Banjar Dinas Sari Mekar',
    baselineMetric: 'Bln 1: PB 49.5 cm · BB 3.1 kg · IMT 12.7',
    currentMetric: 'Bln 12: TB 74.2 cm · BB 9.2 kg · IMT 16.7',
    progressPct: 86,
    statusLabel: 'Progres Baik',
    interventions: ['PMT Protein Hewani'],
    mentorName: ADMIN_RELAWAN_NAME,
    recordedBy: ADMIN_RELAWAN_NAME,
    childAgeMonths: 12,
    monthlyGrowth: [
      buildMonthlyGrowthPoint(1, 49.5, 3.1),
      buildMonthlyGrowthPoint(12, 74.2, 9.2),
    ],
  },
];

test('calculateBmi computes accurate BMI rounded to 1 decimal place', () => {
  assert.equal(calculateBmi(9.2, 74.2), 16.7);
  assert.equal(calculateBmi(3.1, 49.5), 12.7);
  assert.equal(calculateBmi(0, 70), 0);
  assert.equal(calculateBmi(8, 0), 0);
});

test('buildMonthlyGrowthPoint and summarizeChildGrowth compute 12-month growth deltas accurately', () => {
  const series = [
    buildMonthlyGrowthPoint(1, 49.5, 3.1),
    buildMonthlyGrowthPoint(6, 63.4, 6.7),
    buildMonthlyGrowthPoint(12, 74.2, 9.2),
  ];
  assert.equal(series[0].label, 'Bln 1');
  assert.equal(series[2].bmi, 16.7);

  const summary = summarizeChildGrowth(series);
  assert.equal(summary.totalMonths, 3);
  assert.equal(summary.heightGainCm, 24.7);
  assert.equal(summary.weightGainKg, 6.1);
  assert.equal(summary.bmiDelta, 4.0);
});

test('mergeVillagesWithCms applies added, edited, and deleted seed agendas cleanly', () => {
  const customAgenda = {
    id: 'ag-custom-1',
    villageId: 'desa-sarimekar',
    kecamatanId: 'buleleng',
    title: 'Posyandu Tambahan Relawan',
    category: 'Layanan Mobile ECCD' as const,
    date: '2025-05-01',
    displayDate: 'Kamis, 01 Mei 2025',
    time: '08.30 - 11.30 WITA',
    status: 'Terjadwal' as const,
    location: 'Balai Banjar',
    facilitator: ADMIN_RELAWAN_NAME,
    participants: 45,
    summary: 'Agenda baru ditambahkan via mode admin.',
    galleryImages: [],
  };

  const merged = mergeVillagesWithCms([SAMPLE_VILLAGE], [customAgenda], ['ag-seed-1']);
  const updatedVillage = merged[0];
  assert.equal(updatedVillage.agendaList.some((a) => a.id === 'ag-custom-1'), true);
  assert.equal(updatedVillage.agendaList.some((a) => a.id === 'ag-seed-1'), false);
});

test('mergeFosterFamiliesWithCms overrides seed families and removes soft-deleted entries', () => {
  const target = SAMPLE_FAMILIES[0];
  const merged = mergeFosterFamiliesWithCms(SAMPLE_FAMILIES, [
    { ...target, progressPct: 95, recordedBy: ADMIN_RELAWAN_NAME },
  ]);
  const found = merged.find((f) => f.id === target.id)!;
  assert.equal(found.progressPct, 95);
  assert.equal(found.recordedBy, ADMIN_RELAWAN_NAME);

  const afterDelete = mergeFosterFamiliesWithCms(SAMPLE_FAMILIES, [
    { ...target, isDeleted: true },
  ]);
  assert.equal(afterDelete.some((f) => f.id === target.id), false);
});

test('formatIndonesianDisplayDate formats ISO dates safely', () => {
  const formatted = formatIndonesianDisplayDate('2025-05-18');
  assert.ok(formatted.includes('2025'));
});

test('eccdData.ts uses child/mother initials and Admin Relawan PKBI Buleleng attribution', () => {
  const source = fs.readFileSync('src/data/eccdData.ts', 'utf-8');
  assert.ok(source.includes('An. K.D.R'));
  assert.ok(source.includes('An. P.A.S'));
  assert.ok(source.includes('An. G.W.P'));
  assert.ok(source.includes('Ibu D.Md.R'));
  assert.ok(source.includes('Ibu P.A.N'));
  assert.ok(source.includes('Ibu K.S.W'));
  assert.ok(source.includes('ADMIN_RELAWAN_NAME'));
  assert.ok(source.includes('0813-5373-6085'));
});
