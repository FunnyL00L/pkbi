import { useEffect, useState } from 'react';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import { auth, db, handleFirestoreError, OperationType, storage } from '../firebase';
import { ADMIN_RELAWAN_NAME } from '../utils/childGrowthHelpers';
import {
  buildFirebaseMediaRef,
  computeResizedDimensions,
  extractAllFirebaseMediaIdsFromHtml,
  extractFirebaseMediaId,
  FirebaseMediaUploadResult,
  generateFirebaseMediaId,
  isFirebaseMediaRef,
  MAX_FIRESTORE_MEDIA_DATAURL_CHARS,
  replaceFirebaseMediaRefsInHtml,
  validateMediaFileForFirebase,
} from '../utils/firebaseMediaHelpers';

const mediaDataUrlCache = new Map<string, string>();
const pendingMediaFetches = new Map<string, Promise<string | null>>();

interface CompressedImagePayload {
  blob: Blob;
  dataUrl: string;
  mimeType: 'image/webp' | 'image/jpeg' | 'image/png' | 'image/gif';
  width: number;
  height: number;
  bytes: number;
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Gagal membaca file gambar. Pastikan file tidak rusak.'));
    };
    img.src = objectUrl;
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Gagal memproses gambar.'));
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca data gambar.'));
    reader.readAsDataURL(blob);
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: 'image/webp' | 'image/jpeg',
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
}

/**
 * Compresses & resizes an image cleanly in the browser so it loads quickly
 * and always fits safely within Firebase Firestore's document size limits.
 */
async function compressImageForFirebase(file: File): Promise<CompressedImagePayload> {
  const img = await loadImageElement(file);
  const attempts: Array<{ maxDim: number; quality: number }> = [
    { maxDim: 1280, quality: 0.82 },
    { maxDim: 1080, quality: 0.74 },
    { maxDim: 900, quality: 0.66 },
    { maxDim: 720, quality: 0.58 },
    { maxDim: 560, quality: 0.5 },
  ];

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Browser tidak mendukung pemrosesan gambar kanvas.');
  }

  for (const step of attempts) {
    const { width, height } = computeResizedDimensions(
      img.naturalWidth || img.width,
      img.naturalHeight || img.height,
      step.maxDim
    );
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    // Prefer WebP for best compression, fall back to JPEG
    let mimeType: 'image/webp' | 'image/jpeg' = 'image/webp';
    let blob = await canvasToBlob(canvas, 'image/webp', step.quality);
    if (!blob || blob.type !== 'image/webp') {
      mimeType = 'image/jpeg';
      blob = await canvasToBlob(canvas, 'image/jpeg', step.quality);
    }
    if (!blob) continue;

    const dataUrl = await blobToDataUrl(blob);
    if (dataUrl.length <= MAX_FIRESTORE_MEDIA_DATAURL_CHARS) {
      return {
        blob,
        dataUrl,
        mimeType,
        width,
        height,
        bytes: dataUrl.length,
      };
    }
  }

  throw new Error(
    'Gambar masih terlalu besar setelah kompresi otomatis. Gunakan gambar dengan resolusi lebih kecil.'
  );
}

async function tryUploadToFirebaseStorage(
  path: string,
  blob: Blob,
  contentType: string,
  timeoutMs = 4500
): Promise<string | null> {
  try {
    const fileRef = storageRef(storage, path);
    const uploadPromise = uploadBytes(fileRef, blob, {
      contentType,
      cacheControl: 'public, max-age=31536000',
    }).then(() => getDownloadURL(fileRef));

    const timeoutPromise = new Promise<never>((_, reject) => {
      window.setTimeout(() => reject(new Error('firebase-storage-timeout')), timeoutMs);
    });

    return await Promise.race([uploadPromise, timeoutPromise]);
  } catch {
    return null;
  }
}

/**
 * Uploads an image or video directly to Firebase (zero Cloudinary).
 * - Images: compresses optimally, tries Firebase Storage first, and seamlessly
 *   stores in Firebase Firestore `/cmsMedia/{mediaId}` if Storage bucket is not enabled.
 * - Videos: uploads to Firebase Storage (or informs Admin to paste YouTube/MP4 URL).
 */
export async function uploadMediaToFirebase(
  file: File,
  expectedType: 'image' | 'video' | 'auto' = 'auto'
): Promise<FirebaseMediaUploadResult> {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error('Silakan login sebagai Admin terlebih dahulu untuk mengunggah media ke Firebase.');
  }

  const check = validateMediaFileForFirebase(file, expectedType);
  if (!check.valid) {
    throw new Error(check.error || 'File media tidak valid.');
  }

  if (check.resourceType === 'video') {
    const mediaId = generateFirebaseMediaId('vid');
    const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'mp4';
    const downloadUrl = await tryUploadToFirebaseStorage(
      `pkbi-buleleng-eccd/videos/${mediaId}.${ext}`,
      file,
      file.type || 'video/mp4',
      15000
    );

    if (!downloadUrl) {
      throw new Error(
        'Bucket Firebase Storage untuk file video belum diaktifkan di proyek ini. Tempel tautan YouTube atau URL video MP4 langsung pada kolom di bawah.'
      );
    }

    return {
      url: downloadUrl,
      mediaId,
      storageBackend: 'firebase-storage',
      resourceType: 'video',
      bytes: file.size,
      mimeType: file.type || 'video/mp4',
    };
  }

  // Image flow: compress cleanly then store in Firebase (Storage -> Firestore fallback)
  const compressed = await compressImageForFirebase(file);
  const mediaId = generateFirebaseMediaId('img');
  const ext = compressed.mimeType === 'image/webp' ? 'webp' : 'jpg';

  const storageDownloadUrl = await tryUploadToFirebaseStorage(
    `pkbi-buleleng-eccd/images/${mediaId}.${ext}`,
    compressed.blob,
    compressed.mimeType,
    4000
  );

  if (storageDownloadUrl) {
    return {
      url: storageDownloadUrl,
      mediaId,
      storageBackend: 'firebase-storage',
      resourceType: 'image',
      bytes: compressed.blob.size,
      mimeType: compressed.mimeType,
      width: compressed.width,
      height: compressed.height,
    };
  }

  // Seamless Firestore persistence inside `/cmsMedia/{mediaId}`
  const safeFileName = (file.name || `${mediaId}.${ext}`).trim().slice(0, 180) || `${mediaId}.${ext}`;
  const docPath = `cmsMedia/${mediaId}`;

  try {
    await setDoc(doc(db, 'cmsMedia', mediaId), {
      id: mediaId,
      fileName: safeFileName,
      mimeType: compressed.mimeType,
      dataUrl: compressed.dataUrl,
      bytes: compressed.bytes,
      width: compressed.width,
      height: compressed.height,
      authorUid: uid,
      updatedBy: ADMIN_RELAWAN_NAME,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, docPath);
  }

  mediaDataUrlCache.set(mediaId, compressed.dataUrl);

  return {
    url: buildFirebaseMediaRef(mediaId),
    mediaId,
    storageBackend: 'firebase-firestore',
    resourceType: 'image',
    bytes: compressed.bytes,
    mimeType: compressed.mimeType,
    width: compressed.width,
    height: compressed.height,
  };
}

/**
 * Fetches & caches a Firebase Firestore image document by mediaId.
 */
export async function resolveFirebaseMediaById(mediaId: string): Promise<string | null> {
  if (!mediaId) return null;
  const cached = mediaDataUrlCache.get(mediaId);
  if (cached) return cached;

  const inflight = pendingMediaFetches.get(mediaId);
  if (inflight) return inflight;

  const promise = (async () => {
    try {
      const snap = await getDoc(doc(db, 'cmsMedia', mediaId));
      if (!snap.exists()) return null;
      const data = snap.data();
      const dataUrl = typeof data?.dataUrl === 'string' ? data.dataUrl : null;
      if (dataUrl && dataUrl.startsWith('data:image/')) {
        mediaDataUrlCache.set(mediaId, dataUrl);
        return dataUrl;
      }
      return null;
    } catch {
      return null;
    } finally {
      pendingMediaFetches.delete(mediaId);
    }
  })();

  pendingMediaFetches.set(mediaId, promise);
  return promise;
}

/**
 * React hook that resolves `firebase-media://<id>` references to renderable data URLs,
 * while passing standard `https://` / `/` URLs straight through with zero overhead.
 */
export function useFirebaseMediaUrl(src?: string | null): {
  resolvedUrl: string;
  loading: boolean;
} {
  const raw = (src || '').trim();
  const mediaId = extractFirebaseMediaId(raw);
  const initialCached = mediaId ? mediaDataUrlCache.get(mediaId) || '' : raw;

  const [resolvedUrl, setResolvedUrl] = useState<string>(initialCached);
  const [loading, setLoading] = useState<boolean>(Boolean(mediaId && !initialCached));

  useEffect(() => {
    if (!mediaId) {
      setResolvedUrl(raw);
      setLoading(false);
      return;
    }

    const cached = mediaDataUrlCache.get(mediaId);
    if (cached) {
      setResolvedUrl(cached);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    void resolveFirebaseMediaById(mediaId).then((url) => {
      if (!active) return;
      setResolvedUrl(url || '');
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [raw, mediaId]);

  return { resolvedUrl, loading };
}

/**
 * React hook that hydrates any `firebase-media://<id>` image sources inside sanitized
 * Blogger HTML so inline images uploaded to Firebase render seamlessly.
 */
export function useHydratedFirebaseHtml(sanitizedHtml: string): string {
  const [hydrated, setHydrated] = useState<string>(sanitizedHtml);

  useEffect(() => {
    const ids = extractAllFirebaseMediaIdsFromHtml(sanitizedHtml);
    if (ids.length === 0) {
      setHydrated(sanitizedHtml);
      return;
    }

    // Hydrate immediately from any already-cached entries
    const immediateMap: Record<string, string> = {};
    const missing: string[] = [];
    for (const id of ids) {
      const cached = mediaDataUrlCache.get(id);
      if (cached) {
        immediateMap[id] = cached;
      } else {
        missing.push(id);
      }
    }

    if (Object.keys(immediateMap).length > 0) {
      setHydrated(replaceFirebaseMediaRefsInHtml(sanitizedHtml, immediateMap));
    } else {
      setHydrated(sanitizedHtml);
    }

    if (missing.length === 0) return;

    let active = true;
    void Promise.all(
      missing.map(async (id) => ({ id, url: await resolveFirebaseMediaById(id) }))
    ).then((results) => {
      if (!active) return;
      const merged: Record<string, string> = { ...immediateMap };
      for (const r of results) {
        if (r.url) merged[r.id] = r.url;
      }
      setHydrated(replaceFirebaseMediaRefsInHtml(sanitizedHtml, merged));
    });

    return () => {
      active = false;
    };
  }, [sanitizedHtml]);

  return hydrated;
}

export { isFirebaseMediaRef };
