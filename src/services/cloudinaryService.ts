import {
  buildCloudinaryUploadEndpoint,
  CloudinaryConfigInput,
  CloudinaryUploadResult,
  formatCloudinaryErrorMessage,
  isCloudinaryConfigured,
  resolveCloudinaryConfig,
  validateMediaFileForCloudinary,
} from '../utils/cloudinaryGasHelpers';

/**
 * Mengunggah gambar atau video ke Cloudinary menggunakan Unsigned Upload Preset (opsional).
 * Tautan hasil unggahan (`secureUrl`) disimpan langsung ke Firebase Firestore.
 */
export async function uploadMediaToCloudinary(
  file: File,
  config: CloudinaryConfigInput,
  expectedType: 'image' | 'video' | 'auto' = 'auto'
): Promise<CloudinaryUploadResult> {
  const resolved = resolveCloudinaryConfig(config);

  if (!isCloudinaryConfigured(resolved)) {
    throw new Error(
      `Cloud Name (${resolved.cloudName}) sudah siap, namun Unsigned Upload Preset belum diisi. Buka Pengaturan -> Pengaturan Media & Firebase lalu isi nama Unsigned Upload Preset dari Cloudinary.`
    );
  }

  const check = validateMediaFileForCloudinary(file, expectedType);
  if (!check.valid) {
    throw new Error(check.error || 'File media tidak valid.');
  }

  const endpoint = buildCloudinaryUploadEndpoint(resolved.cloudName, check.resourceType);
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', resolved.uploadPreset);
  if (resolved.folder && resolved.folder.trim()) {
    formData.append('folder', resolved.folder.trim());
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errText = `Gagal mengunggah ke Cloudinary (HTTP ${response.status}).`;
    try {
      const errJson = await response.json();
      if (errJson?.error?.message) {
        errText = formatCloudinaryErrorMessage(errJson.error.message, resolved.uploadPreset);
      }
    } catch {
      // keep default error text
    }
    throw new Error(errText);
  }

  const data = await response.json();
  if (!data?.secure_url) {
    throw new Error('Cloudinary tidak mengembalikan URL media yang valid.');
  }

  return {
    secureUrl: String(data.secure_url),
    publicId: String(data.public_id || ''),
    resourceType: check.resourceType,
    bytes: Number(data.bytes) || file.size,
    format: String(data.format || ''),
  };
}
