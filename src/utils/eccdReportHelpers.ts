import type {
  CatinPamphletItem,
  EccdActivityReportRow,
  EccdAggregatedReportSummary,
  EccdVillageMarker,
  QnaCategoryId,
} from '../types';

export interface ActivityReportFilterOptions {
  kecamatanId?: string; // 'all' or specific district id
  villageId?: string; // 'all' or specific village id
  status?: 'all' | 'Terlaksana' | 'Terjadwal';
  query?: string;
}

/**
 * Flattens village agendas into a normalized array of report rows sorted newest-first.
 */
export function buildActivityReportRows(
  villages: EccdVillageMarker[]
): EccdActivityReportRow[] {
  const rows: EccdActivityReportRow[] = [];

  villages.forEach((village) => {
    village.agendaList.forEach((agenda) => {
      rows.push({
        agendaId: agenda.id,
        villageId: village.id,
        villageName: village.name,
        kecamatanId: village.kecamatanId,
        kecamatanName: village.kecamatanName,
        title: agenda.title,
        category: agenda.category,
        date: agenda.date,
        displayDate: agenda.displayDate,
        status: agenda.status,
        participants: agenda.participants,
        villageTotalRecipients: village.serviceData.totalRecipients,
        lakiLaki: village.serviceData.genderBreakdown.lakiLaki,
        perempuan: village.serviceData.genderBreakdown.perempuan,
        location: agenda.location,
      });
    });
  });

  return rows.sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Filters normalized activity report rows by kecamatan, village, status, and keyword.
 */
export function filterActivityReportRows(
  rows: EccdActivityReportRow[],
  filters: ActivityReportFilterOptions
): EccdActivityReportRow[] {
  const normalizedQuery = (filters.query || '').trim().toLowerCase();
  const targetKec = filters.kecamatanId && filters.kecamatanId !== 'all' ? filters.kecamatanId : null;
  const targetVillage = filters.villageId && filters.villageId !== 'all' ? filters.villageId : null;
  const targetStatus = filters.status && filters.status !== 'all' ? filters.status : null;

  return rows.filter((row) => {
    if (targetKec && row.kecamatanId !== targetKec) return false;
    if (targetVillage && row.villageId !== targetVillage) return false;
    if (targetStatus && row.status !== targetStatus) return false;

    if (normalizedQuery) {
      const hay = `${row.villageName} ${row.kecamatanName} ${row.title} ${row.category} ${row.location}`.toLowerCase();
      if (!hay.includes(normalizedQuery)) return false;
    }

    return true;
  });
}

/**
 * Computes live aggregate KPI metrics connecting village beneficiary demographics and filtered agendas.
 */
export function computeAggregatedReportSummary(
  villages: EccdVillageMarker[],
  filteredRows: EccdActivityReportRow[],
  kecamatanId: string = 'all',
  villageId: string = 'all'
): EccdAggregatedReportSummary {
  const scopedVillages = villages.filter((v) => {
    if (kecamatanId !== 'all' && v.kecamatanId !== kecamatanId) return false;
    if (villageId !== 'all' && v.id !== villageId) return false;
    return true;
  });

  const totalRecipients = scopedVillages.reduce(
    (sum, v) => sum + v.serviceData.totalRecipients,
    0
  );
  const totalMale = scopedVillages.reduce(
    (sum, v) => sum + v.serviceData.genderBreakdown.lakiLaki,
    0
  );
  const totalFemale = scopedVillages.reduce(
    (sum, v) => sum + v.serviceData.genderBreakdown.perempuan,
    0
  );

  const completedAgendas = filteredRows.filter((r) => r.status === 'Terlaksana').length;
  const scheduledAgendas = filteredRows.filter((r) => r.status === 'Terjadwal').length;
  const totalAgendaParticipants = filteredRows.reduce(
    (sum, r) => sum + r.participants,
    0
  );

  return {
    totalVillages: scopedVillages.length,
    totalRecipients,
    totalMale,
    totalFemale,
    totalAgendas: filteredRows.length,
    completedAgendas,
    scheduledAgendas,
    totalAgendaParticipants,
  };
}

/**
 * Filters map villages by district ID and search query (matches village or kecamatan name).
 */
export function filterEccdVillages(
  villages: EccdVillageMarker[],
  query: string,
  kecamatanId: string | null = null
): EccdVillageMarker[] {
  const normalized = query.trim().toLowerCase();

  return villages.filter((v) => {
    if (kecamatanId && v.kecamatanId !== kecamatanId) return false;
    if (!normalized) return true;
    return (
      v.name.toLowerCase().includes(normalized) ||
      v.kecamatanName.toLowerCase().includes(normalized) ||
      v.deskripsi.toLowerCase().includes(normalized)
    );
  });
}

export interface CatinNarasiValidationInput {
  namaPasangan: string;
  noHp: string;
  kecamatan: string;
  narasiKeluhan: string;
}

export function validateCatinNarasiForm(input: CatinNarasiValidationInput): {
  valid: boolean;
  errors: Partial<Record<keyof CatinNarasiValidationInput, string>>;
} {
  const errors: Partial<Record<keyof CatinNarasiValidationInput, string>> = {};

  if (!input.namaPasangan.trim() || input.namaPasangan.trim().length < 3) {
    errors.namaPasangan = 'Masukkan nama Anda atau nama pasangan (minimal 3 karakter).';
  }

  const digits = input.noHp.replace(/[^\d+]/g, '');
  if (!/^(\+?62|0)8\d{7,12}$/.test(digits)) {
    errors.noHp = 'Masukkan nomor WhatsApp aktif yang valid (contoh: 081234567890).';
  }

  if (!input.kecamatan.trim()) {
    errors.kecamatan = 'Pilih kecamatan domisili Anda.';
  }

  if (!input.narasiKeluhan.trim() || input.narasiKeluhan.trim().length < 15) {
    errors.narasiKeluhan = 'Tuliskan narasi pertanyaan atau kebutuhan skrining minimal 15 karakter.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateQnaSubmission(input: {
  categoryId: QnaCategoryId | '';
  question: string;
}): {
  valid: boolean;
  error?: string;
} {
  if (!input.categoryId) {
    return { valid: false, error: 'Pilih kategori topik konsultasi terlebih dahulu.' };
  }
  const trimmed = input.question.trim();
  if (trimmed.length < 10) {
    return {
      valid: false,
      error: 'Tuliskan pertanyaan atau keluhan Anda minimal 10 karakter agar konselor dapat memahami konteksnya.',
    };
  }
  return { valid: true };
}

/**
 * Generates a self-contained, printable SVG educational pamphlet for offline viewing & download.
 */
export function generatePamphletSvgBlobContent(pamphlet: CatinPamphletItem): string {
  const escapeXml = (str: string): string =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const wrapLine = (text: string, maxChars = 62): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let current = '';
    for (const w of words) {
      if ((current + ' ' + w).trim().length <= maxChars) {
        current = (current + ' ' + w).trim();
      } else {
        if (current) lines.push(current);
        current = w;
      }
    }
    if (current) lines.push(current);
    return lines;
  };

  let cursorY = 235;
  const summaryLines = wrapLine(pamphlet.summary, 66);
  const summarySvg = summaryLines
    .map((line, idx) => {
      const y = cursorY + idx * 24;
      return `<text x="64" y="${y}" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="16" fill="#334155">${escapeXml(line)}</text>`;
    })
    .join('\n');

  cursorY += summaryLines.length * 24 + 34;

  const pointsSvg = pamphlet.keyPoints
    .map((pt, i) => {
      const ptLines = wrapLine(`${i + 1}. ${pt}`, 62);
      const block = ptLines
        .map((line, lineIdx) => {
          const y = cursorY + lineIdx * 23;
          return `<text x="72" y="${y}" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="15.5" font-weight="${lineIdx === 0 ? '600' : '400'}" fill="#0f172a">${escapeXml(line)}</text>`;
        })
        .join('\n');
      cursorY += ptLines.length * 23 + 18;
      return block;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="840" height="1060" viewBox="0 0 840 1060">
  <rect width="840" height="1060" fill="#f8fafc"/>
  <rect x="32" y="32" width="776" height="996" rx="28" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="32" y="32" width="776" height="164" rx="28" fill="#1e3a8a"/>
  <rect x="32" y="150" width="776" height="46" fill="#1e3a8a"/>
  <text x="64" y="80" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="14" font-weight="700" fill="#93c5fd" letter-spacing="1.5">PROJECT ECCD · PKBI KABUPATEN BULELENG</text>
  <text x="64" y="124" font-family="Georgia, serif" font-size="28" font-weight="700" fill="#ffffff">${escapeXml(pamphlet.title)}</text>
  <text x="64" y="160" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="16" fill="#dbeafe">${escapeXml(pamphlet.subtitle)}</text>
  ${summarySvg}
  <line x1="64" y1="${cursorY - 14}" x2="776" y2="${cursorY - 14}" stroke="#e2e8f0" stroke-width="1.5"/>
  <text x="64" y="${cursorY + 12}" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="13" font-weight="700" fill="#1d4ed8" letter-spacing="1">POIN EDUKASI UTAMA CALON PENGANTIN</text>
  <g transform="translate(0, 38)">
    ${pointsSvg}
  </g>
  <rect x="64" y="904" width="712" height="84" rx="16" fill="#ecfdf5" stroke="#a7f3d0" stroke-width="1.5"/>
  <text x="86" y="936" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="13" font-weight="700" fill="#065f46">TINDAK LANJUT YANG DISARANKAN</text>
  <text x="86" y="964" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="16" font-weight="700" fill="#0f172a">${escapeXml(pamphlet.recommendedAction)}</text>
</svg>`;
}

export interface PaginatedSliceResult<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  totalItems: number;
  hasPrev: boolean;
  hasNext: boolean;
}

/**
 * Slices a list into fixed-size pages (default 5 items) with safe bounds clamping.
 */
export function paginateSlice<T>(
  items: T[],
  requestedPage: number,
  pageSize: number = 5
): PaginatedSliceResult<T> {
  const safeSize = Math.max(1, Math.floor(pageSize));
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / safeSize));
  const currentPage = Math.min(Math.max(1, Math.floor(requestedPage || 1)), totalPages);
  const startOffset = (currentPage - 1) * safeSize;
  const sliced = items.slice(startOffset, startOffset + safeSize);

  return {
    items: sliced,
    currentPage,
    totalPages,
    startIndex: totalItems === 0 ? 0 : startOffset + 1,
    endIndex: totalItems === 0 ? 0 : startOffset + sliced.length,
    totalItems,
    hasPrev: currentPage > 1,
    hasNext: currentPage < totalPages,
  };
}

