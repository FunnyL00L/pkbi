import React, { useRef, useState } from 'react';
import { UploadCloud, Loader2, CheckCircle2, AlertCircle, Link as LinkIcon, Film, Image as ImageIcon } from 'lucide-react';
import { useCmsData } from '../../context/CmsContext';
import { uploadMediaToCloudinary } from '../../services/cloudinaryService';
import {
  isCloudinaryConfigured,
  isDirectVideoUrl,
  resolveCloudinaryConfig,
} from '../../utils/cloudinaryGasHelpers';

interface CloudinaryMediaFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  mediaType?: 'image' | 'video';
  placeholder?: string;
  helperText?: string;
}

export const CloudinaryMediaField: React.FC<CloudinaryMediaFieldProps> = ({
  label,
  value,
  onChange,
  mediaType = 'image',
  placeholder,
  helperText,
}) => {
  const { integrationConfig } = useCmsData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const resolvedCloudinary = resolveCloudinaryConfig({
    cloudName: integrationConfig.cloudinaryCloudName,
    uploadPreset: integrationConfig.cloudinaryUploadPreset,
    folder: integrationConfig.cloudinaryFolder,
  });
  const cloudinaryReady = isCloudinaryConfigured(resolvedCloudinary);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErrorMsg(null);
    setStatusMsg(null);
    try {
      const resolvedType: 'image' | 'video' = mediaType === 'video' ? 'video' : 'image';
      const result = await uploadMediaToCloudinary(
        file,
        resolvedCloudinary,
        resolvedType
      );
      onChange(result.secureUrl);
      setStatusMsg('Berhasil diunggah ke Cloudinary — tautan media siap disimpan ke Firebase.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal mengunggah ke Cloudinary.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          {mediaType === 'video' ? <Film size={13} /> : <ImageIcon size={13} />}
          <span>{label}</span>
        </span>
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="min-h-[30px] px-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-60"
        >
          {uploading ? <Loader2 size={12} className="animate-spin" /> : <UploadCloud size={12} />}
          <span>{uploading ? 'Mengunggah...' : `Upload ${mediaType === 'video' ? 'Video' : 'Gambar'} ke Cloudinary`}</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={mediaType === 'video' ? 'video/*' : 'image/*'}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div className="relative">
        <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            placeholder ||
            (mediaType === 'video'
              ? `https://res.cloudinary.com/${resolvedCloudinary.cloudName}/video/upload/... atau link YouTube`
              : `https://res.cloudinary.com/${resolvedCloudinary.cloudName}/image/upload/...`)
          }
          className="w-full min-h-[40px] pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
        />
      </div>

      {!cloudinaryReady && (
        <p className="text-[11px] text-amber-700 dark:text-amber-300">
          Cloud Name (<strong>{resolvedCloudinary.cloudName}</strong>) sudah terhubung. Lengkapi <strong>Unsigned Upload Preset</strong> di <strong>Pengaturan → Pengaturan Media &amp; Firebase</strong> agar bisa upload langsung dari perangkat, atau tempel tautan URL di atas.
        </p>
      )}

      {helperText && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">{helperText}</p>
      )}

      {statusMsg && (
        <p className="text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
          <CheckCircle2 size={12} className="shrink-0" />
          <span>{statusMsg}</span>
        </p>
      )}

      {errorMsg && (
        <p className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1">
          <AlertCircle size={12} className="shrink-0" />
          <span>{errorMsg}</span>
        </p>
      )}

      {value && mediaType === 'image' && /^https?:\/\//i.test(value) && (
        <div className="mt-1.5 h-24 w-40 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
          <img src={value} alt="Pratinjau Cloudinary" className="w-full h-full object-cover" />
        </div>
      )}

      {value && mediaType === 'video' && isDirectVideoUrl(value) && (
        <div className="mt-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
          Tautan video langsung terdeteksi (siap diputar di pemutar video HTML5).
        </div>
      )}
    </div>
  );
};
