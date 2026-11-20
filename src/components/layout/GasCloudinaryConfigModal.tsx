import React from 'react';
import { createPortal } from 'react-dom';
import { X, Database, CheckCircle2, Image as ImageIcon, ShieldCheck } from 'lucide-react';

interface FirebaseMediaConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GasCloudinaryConfigModal: React.FC<FirebaseMediaConfigModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const modalNode = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="firebase-media-modal-title"
      className="fixed inset-0 z-[90] bg-slate-950/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg max-h-[90dvh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#0c162e] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <Database size={13} />
              <span>100% Firebase · Database &amp; Media</span>
            </div>
            <h2 id="firebase-media-modal-title" className="text-base sm:text-lg font-bold font-serif">
              Penyimpanan Database &amp; Gambar Firebase
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup informasi penyimpanan Firebase"
            className="min-h-[40px] min-w-[40px] rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs sm:text-sm">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/35 border border-emerald-200 dark:border-emerald-900 space-y-1.5">
            <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 size={15} />
              <span>Penyimpanan Data: Firebase Cloud Firestore (Aktif)</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Seluruh data Desa/Kelurahan, Agenda, Keluarga Asuh, Posyandu, Artikel Dokumentasi
              Posyandu, Forum Remaja, Pamflet Catin, Artikel Kespro, Katalog IMS, Video, Infografis,
              dan FAQ tersimpan langsung secara real-time di <strong>Firebase Firestore</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/35 border border-sky-200 dark:border-sky-900 space-y-1.5">
            <div className="font-bold text-sky-900 dark:text-sky-300 flex items-center gap-1.5">
              <ImageIcon size={15} />
              <span>Penyimpanan Gambar: Langsung di Firebase (Siap Pakai)</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Setiap kali Admin mengunggah foto dari HP/komputer pada form konten maupun editor blog
              HTML, gambar otomatis dikompresi ke format WebP/JPEG ringan dan disimpan langsung ke
              <strong> Firebase</strong> tanpa perlu konfigurasi layanan eksternal.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
            <ShieldCheck size={16} className="text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Hanya akun Gmail Admin terverifikasi yang dapat mengunggah gambar dan mengubah konten,
              sedangkan pengunjung publik dapat melihat seluruh artikel dan dokumentasi secara
              otomatis.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[42px] px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold cursor-pointer"
            >
              Selesai
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;
};
