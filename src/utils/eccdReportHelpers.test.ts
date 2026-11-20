import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  buildActivityReportRows,
  filterActivityReportRows,
  computeAggregatedReportSummary,
  filterEccdVillages,
  validateCatinNarasiForm,
  validateQnaSubmission,
  generatePamphletSvgBlobContent,
  paginateSlice,
} from './eccdReportHelpers.ts';
import type { CatinPamphletItem, EccdVillageMarker } from '../types.ts';

const SAMPLE_VILLAGES: EccdVillageMarker[] = [
  {
    id: 'desa-sumberkima',
    name: 'Desa Sumberkima',
    kecamatanId: 'gerokgak',
    kecamatanName: 'Kecamatan Gerokgak',
    lat: -8.148,
    lng: 114.615,
    population: 8240,
    posyanduCount: 8,
    stuntingPct: 6.1,
    statusProgram: 'Aktif ECCD Mobile',
    deskripsi: 'Wilayah pesisir Gerokgak',
    serviceData: {
      totalRecipients: 198,
      genderBreakdown: { lakiLaki: 86, perempuan: 112 },
      ageGroups: [{ label: 'Balita (0-5 th)', count: 67 }],
      serviceTypes: [{ serviceName: 'Gizi Balita', count: 87 }],
      lastUpdated: '15 Feb 2025',
    },
    agendaList: [
      {
        id: 'ag-1',
        villageId: 'desa-sumberkima',
        kecamatanId: 'gerokgak',
        title: 'Layanan Mobile ECCD Sumberkima',
        category: 'Layanan Mobile ECCD',
        date: '2025-01-18',
        displayDate: 'Sabtu, 18 Januari 2025',
        time: '08.30 - 12.30 WITA',
        status: 'Terlaksana',
        location: 'Balai Banjar Sumberkima',
        facilitator: 'Tim ECCD',
        participants: 95,
        summary: 'Pelayanan terpadu',
        galleryImages: [],
      },
      {
        id: 'ag-2',
        villageId: 'desa-sumberkima',
        kecamatanId: 'gerokgak',
        title: 'Posyandu Terpadu Sumberkima',
        category: 'Pendampingan Berkala',
        date: '2025-03-08',
        displayDate: 'Sabtu, 08 Maret 2025',
        time: '09.00 - 12.00 WITA',
        status: 'Terjadwal',
        location: 'Pustu Sumberkima',
        facilitator: 'Kader',
        participants: 83,
        summary: 'Agenda berikutnya',
        galleryImages: [],
      },
    ],
  },
  {
    id: 'desa-sarimekar',
    name: 'Desa Sari Mekar',
    kecamatanId: 'buleleng',
    kecamatanName: 'Kecamatan Buleleng',
    lat: -8.1518,
    lng: 115.1165,
    population: 4180,
    posyanduCount: 4,
    stuntingPct: 6.7,
    statusProgram: 'Desa Binaan Utama',
    deskripsi: 'Pusat percontohan Desa Harmony PKBI Buleleng',
    serviceData: {
      totalRecipients: 260,
      genderBreakdown: { lakiLaki: 112, perempuan: 148 },
      ageGroups: [{ label: 'Balita (0-5 th)', count: 88 }],
      serviceTypes: [{ serviceName: 'Keluarga Asuh & Posyandu', count: 115 }],
      lastUpdated: '15 Feb 2025',
    },
    agendaList: [
      {
        id: 'ag-3',
        villageId: 'desa-sarimekar',
        kecamatanId: 'buleleng',
        title: 'Pendampingan Keluarga Asuh Sari Mekar',
        category: 'Desa Harmony',
        date: '2025-02-12',
        displayDate: 'Rabu, 12 Februari 2025',
        time: '08.30 - 12.00 WITA',
        status: 'Terlaksana',
        location: 'Balai Desa Sari Mekar',
        facilitator: 'Bidan Astini',
        participants: 125,
        summary: 'Pendampingan 6 keluarga asuh',
        galleryImages: [],
      },
    ],
  },
];

test('buildActivityReportRows and computeAggregatedReportSummary reconcile totals accurately', () => {
  const allRows = buildActivityReportRows(SAMPLE_VILLAGES);
  assert.equal(allRows.length, 3);
  assert.equal(allRows[0].agendaId, 'ag-2'); // newest-first sort (2025-03-08)

  const bulelengRows = filterActivityReportRows(allRows, { kecamatanId: 'buleleng' });
  assert.equal(bulelengRows.length, 1);
  assert.equal(bulelengRows[0].villageName, 'Desa Sari Mekar');

  const completedOnly = filterActivityReportRows(allRows, { status: 'Terlaksana' });
  assert.equal(completedOnly.length, 2);

  const summary = computeAggregatedReportSummary(SAMPLE_VILLAGES, bulelengRows, 'buleleng');
  assert.equal(summary.totalVillages, 1);
  assert.equal(summary.totalRecipients, 260);
  assert.equal(summary.totalMale + summary.totalFemale, 260);
  assert.equal(summary.completedAgendas, 1);
  assert.equal(summary.scheduledAgendas, 0);
});

test('filterEccdVillages narrows markers by district and village keyword', () => {
  const sariMekarOnly = filterEccdVillages(SAMPLE_VILLAGES, 'Harmony');
  assert.equal(sariMekarOnly.length, 1);
  assert.equal(sariMekarOnly[0].id, 'desa-sarimekar');

  const gerokgakOnly = filterEccdVillages(SAMPLE_VILLAGES, '', 'gerokgak');
  assert.equal(gerokgakOnly.length, 1);
  assert.equal(gerokgakOnly[0].id, 'desa-sumberkima');
});

test('eccdData.ts covers 9 districts, 27 villages, 6 foster families (3+3), and 4 QnA topics', () => {
  const src = fs.readFileSync(new URL('../data/eccdData.ts', import.meta.url), 'utf8');
  const kecIds = [...src.matchAll(/kecamatanId:\s*'([^']+)'/g)].map((m) => m[1]);
  assert.equal(new Set(kecIds).size, 9);
  assert.equal(kecIds.length, 27);

  const stuntingMatches = src.match(/category:\s*'stunting'/g) || [];
  const kekMatches = src.match(/category:\s*'ibu-hamil-kek'/g) || [];
  assert.equal(stuntingMatches.length, 3);
  assert.equal(kekMatches.length, 3);

  assert.ok(src.includes('Konsultasi terkait permasalahan kesehatan reproduksi'));
  assert.ok(src.includes('Konsultasi terkait kesehatan mental'));
  assert.ok(src.includes('Konsultasi terkait layanan dan skrining calon pengantin'));
  assert.ok(src.includes('Pertanyaan lainnya'));
});

test('validateQnaSubmission validates required category and minimum question length', () => {
  assert.equal(validateQnaSubmission({ categoryId: '', question: 'Halo konselor' }).valid, false);
  assert.equal(
    validateQnaSubmission({
      categoryId: 'kesehatan-mental',
      question: 'Saya sering merasa cemas menjelang pernikahan, bagaimana cara mengatasinya?',
    }).valid,
    true
  );
});

test('Catin Narasi form validation catches incomplete fields and accepts valid input', () => {
  const invalid = validateCatinNarasiForm({
    namaPasangan: 'AB',
    noHp: '123',
    kecamatan: '',
    narasiKeluhan: 'pendek',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.namaPasangan);
  assert.ok(invalid.errors.noHp);
  assert.ok(invalid.errors.narasiKeluhan);

  const valid = validateCatinNarasiForm({
    namaPasangan: 'Putu Adi & Made Sari',
    noHp: '081234567890',
    kecamatan: 'Buleleng',
    narasiKeluhan: 'Kami ingin menjadwalkan pemeriksaan Hb darah dan skrining KEK bulan depan.',
  });
  assert.equal(valid.valid, true);
});

test('generatePamphletSvgBlobContent outputs valid SVG for Catin pamphlets', () => {
  const samplePamphlet: CatinPamphletItem = {
    id: 'anemia',
    title: 'Pamflet Pencegahan Anemia Catin',
    subtitle: 'Wujudkan Hb >= 12 g/dL',
    category: 'Pamflet #01',
    imageUrl: '',
    summary: 'Ringkasan pencegahan anemia pada calon pengantin.',
    keyPoints: ['Cek Hb gratis di Puskesmas', 'Minum TTD rutin setiap minggu'],
    recommendedAction: 'Periksa di Puskesmas terdekat',
  };
  const svg = generatePamphletSvgBlobContent(samplePamphlet);
  assert.ok(svg.startsWith('<?xml version="1.0"'));
  assert.ok(svg.includes('<svg'));
  assert.ok(svg.includes('PROJECT ECCD'));
});

test('paginateSlice limits items to 5 per slide with safe page clamping', () => {
  const rows = Array.from({ length: 54 }, (_, i) => ({ id: i + 1 }));

  const page1 = paginateSlice(rows, 1, 5);
  assert.equal(page1.items.length, 5);
  assert.equal(page1.currentPage, 1);
  assert.equal(page1.totalPages, 11);
  assert.equal(page1.startIndex, 1);
  assert.equal(page1.endIndex, 5);
  assert.equal(page1.hasPrev, false);
  assert.equal(page1.hasNext, true);
  assert.deepEqual(
    page1.items.map((r) => r.id),
    [1, 2, 3, 4, 5]
  );

  const page2 = paginateSlice(rows, 2, 5);
  assert.equal(page2.startIndex, 6);
  assert.equal(page2.endIndex, 10);
  assert.equal(page2.hasPrev, true);
  assert.equal(page2.hasNext, true);

  const lastPage = paginateSlice(rows, 99, 5);
  assert.equal(lastPage.currentPage, 11);
  assert.equal(lastPage.items.length, 4);
  assert.equal(lastPage.startIndex, 51);
  assert.equal(lastPage.endIndex, 54);
  assert.equal(lastPage.hasNext, false);

  const empty = paginateSlice([], 1, 5);
  assert.equal(empty.items.length, 0);
  assert.equal(empty.totalPages, 1);
  assert.equal(empty.startIndex, 0);
  assert.equal(empty.endIndex, 0);
});

