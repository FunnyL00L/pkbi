import { ChildSex, StuntingChildMonthlyPoint } from '../types';

/**
 * Standar Antropometri Anak WHO 2006 / Permenkes RI No. 2 Tahun 2020 (Buku KIA):
 * Panjang Badan menurut Umur (PB/U: 0–24 bulan) & Tinggi Badan menurut Umur (TB/U: 24–60 bulan)
 * Format tiap entri: [medianCm (0 SD), sdCm (1 SD)]
 *
 * Nilai referensi kunci (0..60 bulan) diinterpolasi linier antar titik bulan bila diperlukan.
 */
interface WhoRefEntry {
  month: number;
  median: number;
  sd: number;
}

const WHO_BOYS_HEIGHT_FOR_AGE: WhoRefEntry[] = [
  { month: 0, median: 49.9, sd: 1.9 },
  { month: 1, median: 54.7, sd: 1.9 },
  { month: 2, median: 58.4, sd: 2.0 },
  { month: 3, median: 61.4, sd: 2.1 },
  { month: 4, median: 63.9, sd: 2.1 },
  { month: 5, median: 65.9, sd: 2.2 },
  { month: 6, median: 67.6, sd: 2.2 },
  { month: 7, median: 69.2, sd: 2.2 },
  { month: 8, median: 70.6, sd: 2.3 },
  { month: 9, median: 72.0, sd: 2.3 },
  { month: 10, median: 73.3, sd: 2.3 },
  { month: 11, median: 74.5, sd: 2.4 },
  { month: 12, median: 75.7, sd: 2.4 },
  { month: 13, median: 76.9, sd: 2.4 },
  { month: 14, median: 78.0, sd: 2.5 },
  { month: 15, median: 79.1, sd: 2.5 },
  { month: 16, median: 80.2, sd: 2.6 },
  { month: 17, median: 81.2, sd: 2.6 },
  { month: 18, median: 82.3, sd: 2.7 },
  { month: 19, median: 83.2, sd: 2.7 },
  { month: 20, median: 84.2, sd: 2.8 },
  { month: 21, median: 85.1, sd: 2.8 },
  { month: 22, median: 86.0, sd: 2.9 },
  { month: 23, median: 86.9, sd: 2.9 },
  { month: 24, median: 87.8, sd: 3.0 },
  { month: 30, median: 91.9, sd: 3.3 },
  { month: 36, median: 96.1, sd: 3.7 },
  { month: 42, median: 99.9, sd: 3.9 },
  { month: 48, median: 103.3, sd: 4.2 },
  { month: 54, median: 106.7, sd: 4.4 },
  { month: 60, median: 110.0, sd: 4.6 },
];

const WHO_GIRLS_HEIGHT_FOR_AGE: WhoRefEntry[] = [
  { month: 0, median: 49.1, sd: 1.9 },
  { month: 1, median: 53.7, sd: 1.9 },
  { month: 2, median: 57.1, sd: 2.0 },
  { month: 3, median: 59.8, sd: 2.1 },
  { month: 4, median: 62.1, sd: 2.2 },
  { month: 5, median: 64.0, sd: 2.2 },
  { month: 6, median: 65.7, sd: 2.3 },
  { month: 7, median: 67.3, sd: 2.3 },
  { month: 8, median: 68.7, sd: 2.4 },
  { month: 9, median: 70.1, sd: 2.4 },
  { month: 10, median: 71.5, sd: 2.5 },
  { month: 11, median: 72.8, sd: 2.5 },
  { month: 12, median: 74.0, sd: 2.6 },
  { month: 13, median: 75.2, sd: 2.6 },
  { month: 14, median: 76.4, sd: 2.7 },
  { month: 15, median: 77.5, sd: 2.7 },
  { month: 16, median: 78.6, sd: 2.8 },
  { month: 17, median: 79.7, sd: 2.8 },
  { month: 18, median: 80.7, sd: 2.9 },
  { month: 19, median: 81.7, sd: 2.9 },
  { month: 20, median: 82.7, sd: 3.0 },
  { month: 21, median: 83.7, sd: 3.0 },
  { month: 22, median: 84.6, sd: 3.1 },
  { month: 23, median: 85.5, sd: 3.1 },
  { month: 24, median: 86.4, sd: 3.2 },
  { month: 30, median: 90.7, sd: 3.5 },
  { month: 36, median: 95.1, sd: 3.8 },
  { month: 42, median: 99.0, sd: 4.0 },
  { month: 48, median: 102.7, sd: 4.3 },
  { month: 54, median: 106.2, sd: 4.5 },
  { month: 60, median: 109.4, sd: 4.7 },
];

export type WhoZScoreCategoryCode =
  | 'severely-stunted'
  | 'stunted'
  | 'normal-watch'
  | 'normal-ideal';

export interface WhoZScoreClassification {
  code: WhoZScoreCategoryCode;
  label: string;
  shortLabel: string;
  rangeText: string;
  clinicalSummary: string;
  actionNote: string;
  colorHex: string;
  badgeClass: string;
}

export interface EnrichedWhoGrowthPoint extends StuntingChildMonthlyPoint {
  zScore: number;
  whoMedianCm: number;
  whoMinus1Cm: number;
  whoMinus2Cm: number;
  whoMinus3Cm: number;
  classification: WhoZScoreClassification;
}

export interface ChildWhoZScoreAnalysis {
  sex: ChildSex;
  points: EnrichedWhoGrowthPoint[];
  firstZScore: number;
  latestZScore: number;
  zScoreDelta: number;
  latestClassification: WhoZScoreClassification;
  firstClassification: WhoZScoreClassification;
  monthsSeverelyStunted: number;
  monthsStunted: number;
  monthsNormalWatch: number;
  monthsNormalIdeal: number;
  latestWhoMedianCm: number;
  latestHeightDeficitCm: number;
}

/**
 * Mengembalikan referensi WHO Median (0 SD) dan 1 SD dalam cm untuk usia bulan (0..60) & jenis kelamin.
 */
export function getWhoHeightForAgeReference(
  ageMonths: number,
  sex: ChildSex = 'L'
): { medianCm: number; sdCm: number } {
  const table = sex === 'P' ? WHO_GIRLS_HEIGHT_FOR_AGE : WHO_BOYS_HEIGHT_FOR_AGE;
  const clamped = Math.max(0, Math.min(60, ageMonths));

  for (let i = 0; i < table.length; i++) {
    if (table[i].month === clamped) {
      return { medianCm: table[i].median, sdCm: table[i].sd };
    }
    if (i < table.length - 1 && clamped > table[i].month && clamped < table[i + 1].month) {
      const lower = table[i];
      const upper = table[i + 1];
      const ratio = (clamped - lower.month) / (upper.month - lower.month);
      const medianCm = Math.round((lower.median + (upper.median - lower.median) * ratio) * 100) / 100;
      const sdCm = Math.round((lower.sd + (upper.sd - lower.sd) * ratio) * 100) / 100;
      return { medianCm, sdCm };
    }
  }

  const last = table[table.length - 1];
  return { medianCm: last.median, sdCm: last.sd };
}

/**
 * Menghitung Z-Score Panjang/Tinggi Badan menurut Umur (PB/U atau TB/U) berdasarkan standar WHO:
 * Z = (Tinggi Aktual - Median WHO) / SD WHO
 */
export function calculateHeightForAgeZScore(
  ageMonths: number,
  heightCm: number,
  sex: ChildSex = 'L'
): number {
  if (!Number.isFinite(heightCm) || heightCm <= 0) return 0;
  const { medianCm, sdCm } = getWhoHeightForAgeReference(ageMonths, sex);
  if (sdCm <= 0) return 0;
  return Math.round(((heightCm - medianCm) / sdCm) * 100) / 100;
}

/**
 * Mengklasifikasikan nilai Z-Score (SD) sesuai standar WHO & Buku KIA:
 * - < -3 SD: Sangat Pendek (Severely Stunted)
 * - -3 SD hingga < -2 SD: Pendek (Stunted)
 * - -2 SD hingga < -1 SD: Normal — Perlu Pantau Rutin
 * - >= -1 SD: Normal (Mendekati / Di Atas Median 0 SD)
 */
export function classifyHeightForAgeZScore(zScore: number): WhoZScoreClassification {
  if (zScore < -3) {
    return {
      code: 'severely-stunted',
      label: 'Sangat Pendek (Severely Stunted)',
      shortLabel: 'Sangat Pendek (<-3 SD)',
      rangeText: 'Di bawah -3 SD',
      clinicalSummary:
        'Terkategori sangat pendek (severely stunted). Menunjukkan gangguan pertumbuhan kronis yang lebih berat dan memerlukan penanganan medis serta gizi yang lebih intensif.',
      actionNote: 'Rujukan evaluasi dokter anak/Puskesmas & intervensi gizi intensif segera.',
      colorHex: '#dc2626',
      badgeClass:
        'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800',
    };
  }

  if (zScore < -2) {
    return {
      code: 'stunted',
      label: 'Pendek (Stunted)',
      shortLabel: 'Pendek (-3 s/d -2 SD)',
      rangeText: 'Di bawah -2 SD (hingga -3 SD)',
      clinicalSummary:
        'Terkategori pendek (stunted). Kondisi ini menandakan adanya risiko atau indikasi kekurangan gizi kronis sehingga perlu evaluasi tenaga kesehatan.',
      actionNote: 'Evaluasi tenaga kesehatan, PMT protein hewani terukur & pantau ketat bulanan.',
      colorHex: '#d97706',
      badgeClass:
        'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    };
  }

  if (zScore < -1) {
    return {
      code: 'normal-watch',
      label: 'Normal — Pantau Rutin',
      shortLabel: 'Normal Pantau (-2 s/d -1 SD)',
      rangeText: 'Antara -2 SD hingga -1 SD',
      clinicalSummary:
        'Masih tergolong normal. Meski sedikit di bawah rata-rata (0 SD), anak belum masuk kategori pendek atau stunting, tetapi perlu dipantau rutin agar tidak turun melewati -2 SD.',
      actionNote: 'Pertahankan asupan protein hewani & pengukuran rutin tiap bulan di Posyandu.',
      colorHex: '#0284c7',
      badgeClass:
        'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800',
    };
  }

  return {
    code: 'normal-ideal',
    label: 'Normal Ideal (≥ -1 SD)',
    shortLabel: 'Normal Ideal (≥ -1 SD)',
    rangeText: '-1 SD hingga 0 SD (Median) atau lebih',
    clinicalSummary:
      'Panjang/tinggi badan anak berada pada kisaran rata-rata (median 0 SD) anak sehat seusianya. Pertumbuhan linier berkembang optimal.',
    actionNote: 'Lanjutkan pola makan bergizi seimbang, imunisasi & stimulasi tumbuh kembang.',
    colorHex: '#059669',
    badgeClass:
      'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
  };
}

export function formatZScore(zScore: number): string {
  const fixed = zScore.toFixed(2);
  return zScore > 0 ? `+${fixed} SD` : `${fixed} SD`;
}

/**
 * Menganalisis seluruh deret pengukuran bulanan anak terhadap standar WHO PB/U & TB/U.
 */
export function analyzeChildMonthlyZScores(
  rawPoints: StuntingChildMonthlyPoint[] | undefined,
  sex: ChildSex = 'L'
): ChildWhoZScoreAnalysis {
  const sorted = [...(rawPoints || [])].sort((a, b) => a.month - b.month);

  const enriched: EnrichedWhoGrowthPoint[] = sorted.map((pt) => {
    const ref = getWhoHeightForAgeReference(pt.month, sex);
    const zScore = calculateHeightForAgeZScore(pt.month, pt.heightCm, sex);
    const classification = classifyHeightForAgeZScore(zScore);
    return {
      ...pt,
      zScore,
      whoMedianCm: Math.round(ref.medianCm * 10) / 10,
      whoMinus1Cm: Math.round((ref.medianCm - ref.sdCm) * 10) / 10,
      whoMinus2Cm: Math.round((ref.medianCm - 2 * ref.sdCm) * 10) / 10,
      whoMinus3Cm: Math.round((ref.medianCm - 3 * ref.sdCm) * 10) / 10,
      classification,
    };
  });

  const first = enriched[0];
  const latest = enriched[enriched.length - 1];
  const firstZScore = first ? first.zScore : 0;
  const latestZScore = latest ? latest.zScore : 0;
  const zScoreDelta = Math.round((latestZScore - firstZScore) * 100) / 100;

  let monthsSeverelyStunted = 0;
  let monthsStunted = 0;
  let monthsNormalWatch = 0;
  let monthsNormalIdeal = 0;

  for (const pt of enriched) {
    if (pt.classification.code === 'severely-stunted') monthsSeverelyStunted++;
    else if (pt.classification.code === 'stunted') monthsStunted++;
    else if (pt.classification.code === 'normal-watch') monthsNormalWatch++;
    else monthsNormalIdeal++;
  }

  return {
    sex,
    points: enriched,
    firstZScore,
    latestZScore,
    zScoreDelta,
    firstClassification: classifyHeightForAgeZScore(firstZScore),
    latestClassification: classifyHeightForAgeZScore(latestZScore),
    monthsSeverelyStunted,
    monthsStunted,
    monthsNormalWatch,
    monthsNormalIdeal,
    latestWhoMedianCm: latest ? latest.whoMedianCm : 0,
    latestHeightDeficitCm: latest
      ? Math.round((latest.heightCm - latest.whoMedianCm) * 10) / 10
      : 0,
  };
}
