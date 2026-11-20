import {
  CmsVillageRecord,
  EccdVillageAgendaItem,
  EccdVillageMarker,
  KesproArticleItem,
  KesproInfographicItem,
  QnaFaqItem,
  VideoEdukasi,
} from '../types';

export interface CloudinaryConfigInput {
  cloudName: string;
  uploadPreset: string;
  folder?: string;
}

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
  resourceType: 'image' | 'video';
  bytes: number;
  format: string;
}

export const DEFAULT_CLOUDINARY_CLOUD_NAME = 'diuclq0nb';
export const DEFAULT_CLOUDINARY_FOLDER = 'pkbi-buleleng-eccd';

export const MAX_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_VIDEO_UPLOAD_BYTES = 80 * 1024 * 1024; // 80 MB

export function resolveCloudinaryConfig(
  config?: Partial<CloudinaryConfigInput> | null
): CloudinaryConfigInput {
  const cloudName =
    typeof config?.cloudName === 'string' && config.cloudName.trim().length >= 2
      ? config.cloudName.trim()
      : DEFAULT_CLOUDINARY_CLOUD_NAME;
  const uploadPreset =
    typeof config?.uploadPreset === 'string' ? config.uploadPreset.trim() : '';
  const folder =
    typeof config?.folder === 'string' && config.folder.trim().length > 0
      ? config.folder.trim()
      : DEFAULT_CLOUDINARY_FOLDER;
  return { cloudName, uploadPreset, folder };
}

export function isCloudinaryConfigured(config?: Partial<CloudinaryConfigInput> | null): boolean {
  const resolved = resolveCloudinaryConfig(config);
  return resolved.cloudName.length >= 2 && resolved.uploadPreset.length >= 2;
}

export function formatCloudinaryErrorMessage(
  rawMessage: string,
  uploadPreset?: string
): string {
  const msg = (rawMessage || '').trim();
  const lower = msg.toLowerCase();
  if (lower.includes('upload preset') && (lower.includes('not found') || lower.includes('invalid'))) {
    const presetLabel = uploadPreset ? `"${uploadPreset}"` : 'tersebut';
    return `Cloudinary: Upload Preset ${presetLabel} tidak ditemukan di Cloud Name (${DEFAULT_CLOUDINARY_CLOUD_NAME}). Pastikan nama preset persis sama dan Signing Mode disetel ke "Unsigned".`;
  }
  if (lower.includes('unsigned') || lower.includes('must supply api_key') || lower.includes('whitelisted')) {
    return 'Cloudinary: Upload dari browser wajib menggunakan Upload Preset dengan Signing Mode "Unsigned" (Settings -> Upload -> Upload presets -> Add upload preset -> Signing Mode: Unsigned).';
  }
  return msg ? `Cloudinary: ${msg}` : 'Gagal mengunggah media ke Cloudinary.';
}

export function buildCloudinaryUploadEndpoint(
  cloudName: string,
  resourceType: 'image' | 'video'
): string {
  const safeCloud = cloudName.trim().replace(/[^a-zA-Z0-9_-]/g, '');
  return `https://api.cloudinary.com/v1_1/${safeCloud}/${resourceType}/upload`;
}

export function validateMediaFileForCloudinary(
  file: { type: string; size: number; name: string },
  expectedType: 'image' | 'video' | 'auto' = 'auto'
): { valid: boolean; resourceType: 'image' | 'video'; error?: string } {
  const mime = (file.type || '').toLowerCase();
  const isVideo =
    mime.startsWith('video/') || /\.(mp4|webm|mov|m4v)$/i.test(file.name || '');
  const isImage =
    mime.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(file.name || '');

  if (expectedType === 'image' && !isImage) {
    return { valid: false, resourceType: 'image', error: 'File harus berupa gambar (JPG/PNG/WebP).' };
  }
  if (expectedType === 'video' && !isVideo) {
    return { valid: false, resourceType: 'video', error: 'File harus berupa video (MP4/WebM/MOV).' };
  }
  if (!isImage && !isVideo) {
    return { valid: false, resourceType: 'image', error: 'Format file tidak didukung. Gunakan gambar atau video.' };
  }

  const resourceType: 'image' | 'video' = isVideo ? 'video' : 'image';
  const maxBytes = resourceType === 'video' ? MAX_VIDEO_UPLOAD_BYTES : MAX_IMAGE_UPLOAD_BYTES;
  if (file.size > maxBytes) {
    return {
      valid: false,
      resourceType,
      error:
        resourceType === 'video'
          ? 'Ukuran video maksimal 80 MB untuk unggahan langsung ke Cloudinary.'
          : 'Ukuran gambar maksimal 10 MB untuk unggahan langsung ke Cloudinary.',
    };
  }

  return { valid: true, resourceType };
}

export function isDirectVideoUrl(url?: string): boolean {
  if (!url) return false;
  const lower = url.trim().toLowerCase();
  return (
    lower.includes('res.cloudinary.com') && lower.includes('/video/') ||
    /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(lower)
  );
}

export function extractYouTubeEmbedUrl(url?: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const match = trimmed.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{6,20})/
  );
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return null;
}

/**
 * Pure merge helper combining seed ECCD villages with Admin-added/edited Buleleng villages
 * and agendas/tombstones.
 */
export function mergeAllVillagesWithCms(
  seedVillages: EccdVillageMarker[],
  cmsVillages: CmsVillageRecord[],
  cmsAgendas: EccdVillageAgendaItem[],
  deletedSeedAgendaIds: string[]
): EccdVillageMarker[] {
  const deletedSet = new Set(deletedSeedAgendaIds);
  const cmsVillageMap = new Map<string, CmsVillageRecord>();
  for (const v of cmsVillages) {
    cmsVillageMap.set(v.id, v);
  }

  const cmsAgendaById = new Map<string, EccdVillageAgendaItem>();
  const cmsAgendaByVillage = new Map<string, EccdVillageAgendaItem[]>();
  for (const ag of cmsAgendas) {
    cmsAgendaById.set(ag.id, ag);
    const list = cmsAgendaByVillage.get(ag.villageId) || [];
    list.push(ag);
    cmsAgendaByVillage.set(ag.villageId, list);
  }

  const seenSeedVillageIds = new Set<string>();
  const mergedBase: EccdVillageMarker[] = [];

  for (const seed of seedVillages) {
    seenSeedVillageIds.add(seed.id);
    const override = cmsVillageMap.get(seed.id);
    if (override?.isDeleted) continue;

    const baseVillage: EccdVillageMarker = override
      ? {
          ...seed,
          name: override.name,
          kecamatanId: override.kecamatanId,
          kecamatanName: override.kecamatanName,
          lat: override.lat,
          lng: override.lng,
          population: override.population,
          posyanduCount: override.posyanduCount,
          stuntingPct: override.stuntingPct,
          statusProgram: override.statusProgram,
          deskripsi: override.deskripsi,
          serviceData: {
            ...seed.serviceData,
            totalRecipients: override.totalRecipients,
            genderBreakdown: {
              lakiLaki: override.lakiLaki,
              perempuan: override.perempuan,
            },
            lastUpdated: new Date().toISOString().slice(0, 10),
          },
        }
      : seed;

    const survivingSeeds = baseVillage.agendaList
      .filter((seedAg) => !deletedSet.has(seedAg.id))
      .map((seedAg) => cmsAgendaById.get(seedAg.id) || seedAg);

    const seedAgendaIds = new Set(baseVillage.agendaList.map((a) => a.id));
    const addedCustom = (cmsAgendaByVillage.get(baseVillage.id) || []).filter(
      (ag) => !seedAgendaIds.has(ag.id) && !deletedSet.has(ag.id)
    );

    mergedBase.push({
      ...baseVillage,
      agendaList: [...addedCustom, ...survivingSeeds].sort((a, b) => b.date.localeCompare(a.date)),
    });
  }

  // Append newly added custom Buleleng villages/kelurahan
  for (const custom of cmsVillages) {
    if (seenSeedVillageIds.has(custom.id) || custom.isDeleted) continue;
    const customAgendas = (cmsAgendaByVillage.get(custom.id) || [])
      .filter((ag) => !deletedSet.has(ag.id))
      .sort((a, b) => b.date.localeCompare(a.date));

    const total = Math.max(0, custom.totalRecipients || custom.lakiLaki + custom.perempuan);
    mergedBase.push({
      id: custom.id,
      name: custom.name,
      kecamatanId: custom.kecamatanId,
      kecamatanName: custom.kecamatanName,
      lat: custom.lat,
      lng: custom.lng,
      population: custom.population,
      posyanduCount: custom.posyanduCount,
      stuntingPct: custom.stuntingPct,
      statusProgram: custom.statusProgram,
      deskripsi: custom.deskripsi,
      serviceData: {
        totalRecipients: total,
        genderBreakdown: {
          lakiLaki: custom.lakiLaki,
          perempuan: custom.perempuan,
        },
        ageGroups: [
          { label: 'Balita (0-5 th)', count: Math.round(total * 0.35) },
          { label: 'Anak (6-12 th)', count: Math.round(total * 0.2) },
          { label: 'Remaja (13-19 th)', count: Math.round(total * 0.25) },
          { label: 'Dewasa & Bumil (20+ th)', count: Math.max(0, total - Math.round(total * 0.8)) },
        ],
        serviceTypes: [
          { serviceName: 'Pemeriksaan Tumbuh Kembang & Gizi', count: Math.round(total * 0.45) },
          { serviceName: 'Konseling KIA & Bumil KEK', count: Math.round(total * 0.3) },
          { serviceName: 'Edukasi Kespro & Catin', count: Math.max(0, total - Math.round(total * 0.75)) },
        ],
        lastUpdated: new Date().toISOString().slice(0, 10),
      },
      agendaList: customAgendas,
    });
  }

  return mergedBase;
}

/**
 * Generic pure merge helper for CMS collections (Articles, Videos, Infographics, FAQs).
 */
export function mergeSeedWithCmsRecords<T extends { id: string; isDeleted?: boolean }>(
  seeds: T[],
  cmsRecords: T[]
): T[] {
  const cmsMap = new Map<string, T>();
  for (const item of cmsRecords) {
    cmsMap.set(item.id, item);
  }

  const seenSeedIds = new Set<string>();
  const result: T[] = [];

  // Prepend newly added custom items first so Admin additions appear immediately at the top
  for (const seed of seeds) {
    seenSeedIds.add(seed.id);
  }

  for (const rec of cmsRecords) {
    if (!seenSeedIds.has(rec.id) && !rec.isDeleted) {
      result.push(rec);
    }
  }

  for (const seed of seeds) {
    const override = cmsMap.get(seed.id);
    if (override) {
      if (!override.isDeleted) {
        result.push(override);
      }
    } else {
      result.push(seed);
    }
  }

  return result;
}

export function isValidGasWebAppUrl(url: string): boolean {
  const trimmed = (url || '').trim();
  if (!trimmed) return false;
  return /^https:\/\/script\.google\.com\/macros\/s\/[a-zA-Z0-9_-]+\/exec(\?.*)?$/.test(trimmed);
}

export type GasEntityType =
  | 'villages'
  | 'agendas'
  | 'fosterFamilies'
  | 'articles'
  | 'videos'
  | 'infographics'
  | 'faqs';

export interface GasSyncEnvelope {
  action: 'upsert' | 'delete' | 'syncAll';
  entityType?: GasEntityType;
  id?: string;
  record?: unknown;
  dataset?: {
    villages: CmsVillageRecord[];
    agendas: EccdVillageAgendaItem[];
    articles: KesproArticleItem[];
    videos: VideoEdukasi[];
    infographics: KesproInfographicItem[];
    faqs: QnaFaqItem[];
  };
  sentAt: string;
}

export function buildGasUpsertPayload(
  entityType: GasEntityType,
  record: unknown
): GasSyncEnvelope {
  return {
    action: 'upsert',
    entityType,
    record,
    sentAt: new Date().toISOString(),
  };
}
