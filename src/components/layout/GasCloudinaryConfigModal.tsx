import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Save,
  Loader2,
  Cloud,
  Database,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useCmsData } from '../../context/CmsContext';
import {
  DEFAULT_CLOUDINARY_CLOUD_NAME,
  DEFAULT_CLOUDINARY_FOLDER,
} from '../../utils/cloudinaryGasHelpers';

interface FirebaseMediaConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GasCloudinaryConfigModal: React.FC<FirebaseMediaConfigModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { integrationConfig, saveIntegrationConfig } = useCmsData();

  const [cloudinaryCloudName, setCloudinaryCloudName] = useState(
    integrationConfig.cloudinaryCloudName || DEFAULT_CLOUDINARY_CLOUD_NAME
  );
  const [cloudinaryUploadPreset, setCloudinaryUploadPreset] = useState(
    integrationConfig.cloudinaryUploadPreset
  );
  const [cloudinaryFolder, setCloudinaryFolder] = useState(
    integrationConfig.cloudinaryFolder || DEFAULT_CLOUDINARY_FOLDER
  );

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setCloudinaryCloudName(integrationConfig.cloudinaryCloudName || DEFAULT_CLOUDINARY_CLOUD_NAME);
    setCloudinaryUploadPreset(integrationConfig.cloudinaryUploadPreset || '');
    setCloudinaryFolder(integrationConfig.cloudinaryFolder || DEFAULT_CLOUDINARY_FOLDER);
    setFeedback(null);
  }, [isOpen, integrationConfig]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setFeedback(null);
      await saveIntegrationConfig({
        id: 'integrations',
        gasWebAppUrl: '',
        cloudinaryCloudName: cloudinaryCloudName.trim() || DEFAULT_CLOUDINARY_CLOUD_NAME,
        cloudinaryUploadPreset: cloudinaryUploadPreset.trim(),
        cloudinaryFolder: cloudinaryFolder.trim() || DEFAULT_CLOUDINARY_FOLDER,
        autoSyncGas: false,
      });
      setFeedback({
        type: 'ok',
        text: 'Pengaturan media Cloudinary berhasil disimpan ke Firebase Firestore.',
      });
    } catch {
      setFeedback({
        type: 'err',
        text: 'Gagal menyimpan konfigurasi ke Firebase. Pastikan akun Admin Anda aktif.',
      });
    } finally {
      setSaving(false);
    }
  };

  const modalNode = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="firebase-media-modal-title"
      className="fixed inset-0 z-[90] bg-slate-950/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-xl max-h-[90dvh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#0c162e] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
              <Database size={13} />
              <span>Firebase Firestore · Media Upload</span>
            </div>
            <h2 id="firebase-media-modal-title" className="text-base sm:text-lg font-bold font-serif">
              Pengaturan Database Firebase &amp; Media
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup pengaturan media Firebase"
            className="min-h-[40px] min-w-[40px] rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
          >
            <X size={18} />
          </button>
        </header>

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-5 text-xs sm:text-sm">
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/35 border border-emerald-200 dark:border-emerald-900 text-xs text-slate-700 dark:text-slate-200 leading-relaxed space-y-1">
            <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <Database size={14} />
              <span>Penyimpanan Utama: 100% Firebase Cloud Firestore</span>
            </div>
            <p>
              Seluruh data Desa/Kelurahan, Agenda, Keluarga Asuh, Posyandu, Artikel Forum Remaja,
              Pamflet Catin, Artikel Kespro, Katalog Penyakit IMS, Video, Infografis, dan FAQ
              disimpan langsung secara real-time di <strong>Firebase Firestore</strong>.
            </p>
          </div>

          {feedback && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                feedback.type === 'ok'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300'
              }`}
            >
              {feedback.type === 'ok' ? (
                <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Cloudinary Media Upload Helper */}
          <section className="space-y-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40">
            <h3 className="text-xs sm:text-sm font-bold flex items-center gap-1.5 text-slate-900 dark:text-white">
              <Cloud size={15} className="text-sky-600 dark:text-sky-400" />
              <span>Upload Media Gambar/Video via Cloudinary</span>
            </h3>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Cloud Name <strong>{DEFAULT_CLOUDINARY_CLOUD_NAME}</strong> sudah terisi otomatis. Agar
              upload dari browser aman tanpa <em>API Secret</em>, Cloudinary menggunakan{' '}
              <strong>Unsigned Upload Preset</strong> (API Key tidak diperlukan).
            </p>
            <div className="p-3 rounded-xl bg-sky-50/80 dark:bg-sky-950/35 border border-sky-200 dark:border-sky-900/70 text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
              <div className="font-bold text-sky-900 dark:text-sky-300">
                Cara mendapatkan Unsigned Upload Preset (30 detik):
              </div>
              <ol className="list-decimal list-inside space-y-0.5">
                <li>
                  Buka Cloudinary Console → <strong>Settings</strong> → <strong>Upload</strong> →{' '}
                  <strong>Upload presets</strong> → <strong>Add upload preset</strong>.
                </li>
                <li>
                  Ubah <strong>Signing Mode</strong> menjadi <strong>Unsigned</strong>, beri nama
                  (mis. <code>pkbi_dok_unsigned</code>), lalu klik <strong>Save</strong>.
                </li>
                <li>
                  Tempel nama preset tersebut pada kolom <strong>Unsigned Upload Preset</strong> di
                  bawah lalu klik <strong>Simpan ke Firebase</strong>.
                </li>
              </ol>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="space-y-1">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Cloud Name (Product Environment)
                </span>
                <input
                  type="text"
                  value={cloudinaryCloudName}
                  onChange={(e) => setCloudinaryCloudName(e.target.value)}
                  placeholder={DEFAULT_CLOUDINARY_CLOUD_NAME}
                  className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm font-mono"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Unsigned Upload Preset
                </span>
                <input
                  type="text"
                  value={cloudinaryUploadPreset}
                  onChange={(e) => setCloudinaryUploadPreset(e.target.value)}
                  placeholder="mis. pkbi_dok_unsigned"
                  className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm"
                />
              </label>
            </div>
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Folder Media (Opsional)
              </span>
              <input
                type="text"
                value={cloudinaryFolder}
                onChange={(e) => setCloudinaryFolder(e.target.value)}
                placeholder={DEFAULT_CLOUDINARY_FOLDER}
                className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm"
              />
            </label>
          </section>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[42px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="submit"
              disabled={saving}
              className="min-h-[42px] px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              <span>Simpan ke Firebase</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;
};
