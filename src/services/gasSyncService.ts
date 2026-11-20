import {
  CmsVillageRecord,
  EccdVillageAgendaItem,
  HarmonyFosterFamily,
  KesproArticleItem,
  KesproInfographicItem,
  QnaFaqItem,
  VideoEdukasi,
} from '../types';
import {
  buildGasUpsertPayload,
  GasEntityType,
  isValidGasWebAppUrl,
} from '../utils/cloudinaryGasHelpers';

export interface GasFullDatasetPayload {
  villages: CmsVillageRecord[];
  agendas: EccdVillageAgendaItem[];
  fosterFamilies: HarmonyFosterFamily[];
  articles: KesproArticleItem[];
  videos: VideoEdukasi[];
  infographics: KesproInfographicItem[];
  faqs: QnaFaqItem[];
}

export interface GasSyncResponse {
  ok: boolean;
  message?: string;
  data?: Partial<GasFullDatasetPayload>;
}

/**
 * Mengirim satu operasi upsert ke Google Apps Script Web App.
 * Menggunakan `text/plain;charset=utf-8` agar browser tidak gagal pada CORS preflight OPTIONS GAS.
 */
export async function upsertRecordToGas(
  gasWebAppUrl: string,
  entityType: GasEntityType,
  record: unknown
): Promise<GasSyncResponse> {
  if (!isValidGasWebAppUrl(gasWebAppUrl)) {
    return { ok: false, message: 'URL Web App Google Apps Script belum valid.' };
  }

  const body = JSON.stringify(buildGasUpsertPayload(entityType, record));
  const res = await fetch(gasWebAppUrl.trim(), {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body,
  });

  if (!res.ok) {
    return { ok: false, message: `GAS HTTP ${res.status}` };
  }

  try {
    const json = await res.json();
    return { ok: Boolean(json?.ok ?? true), message: json?.message || 'Tersimpan ke Spreadsheet GAS.' };
  } catch {
    return { ok: true, message: 'Terkirim ke Google Apps Script.' };
  }
}

export async function deleteRecordFromGas(
  gasWebAppUrl: string,
  entityType: GasEntityType,
  id: string
): Promise<GasSyncResponse> {
  if (!isValidGasWebAppUrl(gasWebAppUrl)) {
    return { ok: false, message: 'URL Web App Google Apps Script belum valid.' };
  }

  const res = await fetch(gasWebAppUrl.trim(), {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      action: 'delete',
      entityType,
      id,
      sentAt: new Date().toISOString(),
    }),
  });

  if (!res.ok) {
    return { ok: false, message: `GAS HTTP ${res.status}` };
  }

  try {
    const json = await res.json();
    return { ok: Boolean(json?.ok ?? true), message: json?.message || 'Dihapus di Spreadsheet GAS.' };
  } catch {
    return { ok: true, message: 'Perintah hapus terkirim ke GAS.' };
  }
}

export async function pushFullDatasetToGas(
  gasWebAppUrl: string,
  dataset: GasFullDatasetPayload
): Promise<GasSyncResponse> {
  if (!isValidGasWebAppUrl(gasWebAppUrl)) {
    return { ok: false, message: 'Masukkan URL Web App GAS yang valid (berakhiran /exec).' };
  }

  const res = await fetch(gasWebAppUrl.trim(), {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      action: 'syncAll',
      dataset,
      sentAt: new Date().toISOString(),
    }),
  });

  if (!res.ok) {
    return { ok: false, message: `Gagal sinkronisasi ke GAS (HTTP ${res.status}).` };
  }

  try {
    const json = await res.json();
    return {
      ok: Boolean(json?.ok ?? true),
      message: json?.message || 'Seluruh data & tautan Cloudinary berhasil disinkronkan ke Google Sheets.',
    };
  } catch {
    return {
      ok: true,
      message: 'Sinkronisasi lengkap telah dikirim ke Google Apps Script.',
    };
  }
}

export async function pullAllFromGas(gasWebAppUrl: string): Promise<GasSyncResponse> {
  if (!isValidGasWebAppUrl(gasWebAppUrl)) {
    return { ok: false, message: 'URL Web App Google Apps Script belum valid.' };
  }

  const sep = gasWebAppUrl.includes('?') ? '&' : '?';
  const res = await fetch(`${gasWebAppUrl.trim()}${sep}action=readAll`, {
    method: 'GET',
  });

  if (!res.ok) {
    return { ok: false, message: `Gagal membaca data dari GAS (HTTP ${res.status}).` };
  }

  const json = await res.json();
  return {
    ok: Boolean(json?.ok ?? true),
    message: json?.message || 'Data berhasil dimuat dari Google Sheets GAS.',
    data: json?.data || {},
  };
}

/**
 * Template Google Apps Script (`Code.gs`) siap pakai untuk Google Sheets PKBI Buleleng.
 * Media (gambar/video) disimpan terlebih dahulu ke Cloudinary lalu link `secure_url` masuk ke Spreadsheet ini.
 * Catatan: Pertanyaan QnA pengunjung TIDAK disimpan demi kerahasiaan.
 */
export const GAS_APPS_SCRIPT_TEMPLATE = `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT (GAS) BACKEND — WEB PROJECT ECCD PKBI BULELENG
 * =========================================================================
 * Arsitektur:
 * 1. Gambar & Video diunggah dari Web Admin ke Cloudinary (Unsigned Preset)
 *    -> menghasilkan tautan permanen CDN (imageUrl / videoUrl / galleryImages).
 * 2. Tautan Cloudinary beserta seluruh data Desa/Kelurahan Buleleng, Agenda,
 *    Keluarga Asuh (WHO Z-Score), Artikel, Video, Infografis, dan FAQ
 *    disimpan di Google Spreadsheet ini.
 * 3. Pertanyaan QnA pengunjung TIDAK disimpan (langsung ke WhatsApp).
 *
 * Cara Deploy:
 * - Buat Google Spreadsheet baru -> Ekstensi -> Apps Script
 * - Tempel seluruh kode ini ke Code.gs -> Simpan
 * - Klik Deploy -> Deployment Baru -> Aplikasi Web
 * - Jalankan sebagai: "Saya" | Yang memiliki akses: "Siapa saja"
 * - Salin URL Web App (.../exec) lalu tempel di Pengaturan -> Integrasi GAS & Cloudinary.
 */

var SHEET_MAP = {
  villages: 'Villages',
  agendas: 'VillageAgendas',
  fosterFamilies: 'FosterFamilies',
  articles: 'Articles',
  videos: 'Videos',
  infographics: 'Infographics',
  faqs: 'Faqs'
};

function getOrCreateSheet(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(['id', 'titleOrName', 'mediaLinkCloudinary', 'updatedAt', 'payloadJson']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function extractLabel(record) {
  return record.name || record.title || record.guardianOrMotherName || record.question || record.id || '';
}

function extractMediaLink(record) {
  if (record.videoUrl) return record.videoUrl;
  if (record.imageUrl) return record.imageUrl;
  if (record.galleryImages && record.galleryImages.length > 0) return record.galleryImages.join(', ');
  return '';
}

function upsertToSheet(entityType, record) {
  var sheetName = SHEET_MAP[entityType];
  if (!sheetName || !record || !record.id) return;
  var sheet = getOrCreateSheet(sheetName);
  var values = sheet.getDataRange().getValues();
  var rowIndex = -1;
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(record.id)) {
      rowIndex = i + 1;
      break;
    }
  }
  var rowData = [
    String(record.id),
    String(extractLabel(record)),
    String(extractMediaLink(record)),
    new Date().toISOString(),
    JSON.stringify(record)
  ];
  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
}

function deleteFromSheet(entityType, id) {
  var sheetName = SHEET_MAP[entityType];
  if (!sheetName || !id) return;
  var sheet = getOrCreateSheet(sheetName);
  var values = sheet.getDataRange().getValues();
  for (var i = values.length - 1; i >= 1; i--) {
    if (String(values[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
    }
  }
}

function readSheetRecords(entityType) {
  var sheetName = SHEET_MAP[entityType];
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  var values = sheet.getDataRange().getValues();
  var out = [];
  for (var i = 1; i < values.length; i++) {
    var raw = values[i][4];
    if (raw) {
      try {
        out.push(JSON.parse(raw));
      } catch (err) {}
    }
  }
  return out;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'readAll';
  if (action === 'readAll') {
    var data = {};
    Object.keys(SHEET_MAP).forEach(function(key) {
      data[key] = readSheetRecords(key);
    });
    return jsonResponse({ ok: true, message: 'Data berhasil dibaca dari Google Sheets', data: data });
  }
  return jsonResponse({ ok: true, message: 'GAS Endpoint PKBI Buleleng Aktif' });
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents || '{}');
    var action = body.action;
    if (action === 'upsert') {
      upsertToSheet(body.entityType, body.record);
      return jsonResponse({ ok: true, message: 'Record disimpan ke sheet ' + body.entityType });
    }
    if (action === 'delete') {
      deleteFromSheet(body.entityType, body.id);
      return jsonResponse({ ok: true, message: 'Record dihapus dari sheet ' + body.entityType });
    }
    if (action === 'syncAll' && body.dataset) {
      Object.keys(SHEET_MAP).forEach(function(key) {
        var list = body.dataset[key] || [];
        list.forEach(function(rec) {
          upsertToSheet(key, rec);
        });
      });
      return jsonResponse({ ok: true, message: 'Sinkronisasi penuh selesai ke seluruh sheet.' });
    }
    return jsonResponse({ ok: false, message: 'Aksi tidak dikenal: ' + action });
  } catch (err) {
    return jsonResponse({ ok: false, message: String(err) });
  }
}
`;
