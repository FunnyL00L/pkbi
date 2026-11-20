import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  Film,
  Image as ImageIcon,
  Database,
} from 'lucide-react';
import { isFirebaseMediaRef, uploadMediaToFirebase } from '../../services/firebaseMediaService';
import { isDirectVideoUrl } from '../../utils/cloudinaryGasHelpers';
import { SafeImage } from './SafeImage';

interface CloudinaryMediaFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  mediaType?: 'image' | 'video';
  placeholder?: string;
  helperText?: string;
}

export const FirebaseMediaField: React.FC<CloudinaryMediaFieldProps> = ({
  label,
  value,
  onChange,
  mediaType = 'image',
  placeholder,
  helperText,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErrorMsg(null);
    setStatusMsg(null);
    try {
      const resolvedType: 'image' | 'video' = mediaType === 'video' ? 'video' : 'image';
      const result = await uploadMediaToFirebase(file, resolvedType);
      onChange(result.url);
      const kb = Math.max(1, Math.round(result.bytes / 1024));
      setStatusMsg(
        result.storageBackend === 'firebase-storage'
          ? `Berhasil disimpan ke Firebase Storage (${kb} KB).`
          : `Berhasil dikompresi & disimpan ke Firebase (${kb} KB).`
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menyimpan media ke Firebase.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const hasRenderableImage =
    Boolean(value) &&
    mediaType === 'image' &&
    (isFirebaseMediaRef(value) || /^https?:\/\//i.test(value) || value.startsWith('/'));

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
          className="min-h-[30px] px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-60 shrink-0"
        >
          {uploading ? <Loader2 size={12} className="animate-spin" /> : <UploadCloud size={12} />}
          <span>
            {uploading
              ? 'Menyimpan...'
              : `Upload ${mediaType === 'video' ? 'Video' : 'Gambar'} ke Firebase`}
          </span>
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
        {isFirebaseMediaRef(value) ? (
          <Database size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            placeholder ||
            (mediaType === 'video'
              ? 'Tempel link YouTube / URL video MP4, atau klik Upload ke Firebase'
              : 'Klik Upload Gambar ke Firebase atau tempel tautan gambar (https://...)')
          }
          className="w-full min-h-[40px] pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
        />
      </div>

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

      {hasRenderableImage && (
        <div className="mt-1.5 h-24 w-40 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
          <SafeImage src={value} alt="Pratinjau Media Firebase" />
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

// Backwards-compatible export alias for existing Admin modal imports
export const CloudinaryMediaField = FirebaseMediaField;
