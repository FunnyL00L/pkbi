export const FIREBASE_MEDIA_PREFIX = 'firebase-media://';
export const MAX_FIREBASE_IMAGE_RAW_BYTES = 12 * 1024 * 1024; // 12 MB source upload before compression
export const MAX_FIREBASE_VIDEO_RAW_BYTES = 40 * 1024 * 1024; // 40 MB for Firebase Storage video
export const MAX_FIRESTORE_MEDIA_DATAURL_CHARS = 440_000; // safely below 450k rule & 1MB doc limit

const VALID_MEDIA_ID_RE = /^[a-zA-Z0-9_-]{3,120}$/;

export interface FirebaseMediaUploadResult {
  url: string;
  mediaId: string;
  storageBackend: 'firebase-storage' | 'firebase-firestore';
  resourceType: 'image' | 'video';
  bytes: number;
  mimeType: string;
  width?: number;
  height?: number;
}

export function isFirebaseMediaRef(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith(FIREBASE_MEDIA_PREFIX)) return false;
  const id = trimmed.slice(FIREBASE_MEDIA_PREFIX.length);
  return VALID_MEDIA_ID_RE.test(id);
}

export function extractFirebaseMediaId(url?: string | null): string | null {
  if (!isFirebaseMediaRef(url)) return null;
  return url!.trim().slice(FIREBASE_MEDIA_PREFIX.length);
}

export function buildFirebaseMediaRef(mediaId: string): string {
  const cleaned = (mediaId || '').replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 120);
  return `${FIREBASE_MEDIA_PREFIX}${cleaned}`;
}

export function generateFirebaseMediaId(prefix = 'img'): string {
  const safePrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 16) || 'img';
  const rand = Math.random().toString(36).slice(2, 8);
  return `${safePrefix}-${Date.now()}-${rand}`;
}

export function computeResizedDimensions(
  width: number,
  height: number,
  maxDimension: number
): { width: number; height: number } {
  const w = Math.max(1, Math.round(width || 1));
  const h = Math.max(1, Math.round(height || 1));
  const limit = Math.max(64, Math.round(maxDimension));
  if (w <= limit && h <= limit) {
    return { width: w, height: h };
  }
  if (w >= h) {
    const ratio = limit / w;
    return { width: limit, height: Math.max(1, Math.round(h * ratio)) };
  }
  const ratio = limit / h;
  return { width: Math.max(1, Math.round(w * ratio)), height: limit };
}

export function validateMediaFileForFirebase(
  file: { type: string; size: number; name: string },
  expectedType: 'image' | 'video' | 'auto' = 'auto'
): { valid: boolean; resourceType: 'image' | 'video'; error?: string } {
  const mime = (file.type || '').toLowerCase();
  const isVideo =
    mime.startsWith('video/') || /\.(mp4|webm|mov|m4v)$/i.test(file.name || '');
  const isImage =
    mime.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(file.name || '');

  if (expectedType === 'image' && !isImage) {
    return {
      valid: false,
      resourceType: 'image',
      error: 'File harus berupa gambar (JPG, PNG, WebP, atau GIF).',
    };
  }
  if (expectedType === 'video' && !isVideo) {
    return {
      valid: false,
      resourceType: 'video',
      error: 'File harus berupa video (MP4, WebM, atau MOV).',
    };
  }
  if (!isImage && !isVideo) {
    return {
      valid: false,
      resourceType: 'image',
      error: 'Format file tidak didukung. Pilih file gambar atau video.',
    };
  }

  const resourceType: 'image' | 'video' = isVideo ? 'video' : 'image';
  const maxBytes =
    resourceType === 'video' ? MAX_FIREBASE_VIDEO_RAW_BYTES : MAX_FIREBASE_IMAGE_RAW_BYTES;

  if (file.size > maxBytes) {
    return {
      valid: false,
      resourceType,
      error:
        resourceType === 'video'
          ? 'Ukuran video maksimal 40 MB untuk unggahan ke Firebase.'
          : 'Ukuran gambar maksimal 12 MB sebelum kompresi otomatis ke Firebase.',
    };
  }

  return { valid: true, resourceType };
}

export function extractAllFirebaseMediaIdsFromHtml(html: string): string[] {
  if (!html || typeof html !== 'string') return [];
  const matches = html.match(/firebase-media:\/\/[a-zA-Z0-9_-]{3,120}/g) || [];
  const unique = new Set<string>();
  for (const m of matches) {
    const id = extractFirebaseMediaId(m);
    if (id) unique.add(id);
  }
  return Array.from(unique);
}

export function replaceFirebaseMediaRefsInHtml(
  html: string,
  resolvedMap: Record<string, string>
): string {
  if (!html || typeof html !== 'string') return '';
  return html.replace(/firebase-media:\/\/([a-zA-Z0-9_-]{3,120})/g, (full, id: string) => {
    const resolved = resolvedMap[id];
    return resolved ? resolved : full;
  });
}
