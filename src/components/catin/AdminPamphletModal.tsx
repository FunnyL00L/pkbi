import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Loader2, ShieldCheck } from 'lucide-react';
import { CatinPamphletItem } from '../../types';
import { CloudinaryMediaField } from '../ui/CloudinaryMediaField';

interface AdminPamphletModalProps {
  isOpen: boolean;
  editingPamphlet: CatinPamphletItem | null;
  onClose: () => void;
  onSave: (item: CatinPamphletItem) => Promise<void>;
}

export const AdminPamphletModal: React.FC<AdminPamphletModalProps> = ({
  isOpen,
  editingPamphlet,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('Skrining Catin');
  const [imageUrl, setImageUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [keyPointsText, setKeyPointsText] = useState('');
  const [recommendedAction, setRecommendedAction] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg(null);
    if (editingPamphlet) {
      setTitle(editingPamphlet.title);
      setSubtitle(editingPamphlet.subtitle);
      setCategory(editingPamphlet.category);
      setImageUrl(editingPamphlet.imageUrl);
      setSummary(editingPamphlet.summary);
      setKeyPointsText(editingPamphlet.keyPoints.join('\n'));
      setRecommendedAction(editingPamphlet.recommendedAction);
    } else {
      setTitle('');
      setSubtitle('');
      setCategory('Edukasi Pranikah');
      setImageUrl('');
      setSummary('');
      setKeyPointsText('Lakukan pemeriksaan kesehatan minimal 3 bulan sebelum menikah\nKonsumsi gizi seimbang & tablet tambah darah');
      setRecommendedAction('Kunjungi Poli KIA & Lab Catin Puskesmas terdekat di Buleleng.');
    }
  }, [isOpen, editingPamphlet]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) {
      setErrorMsg('Judul pamflet dan ringkasan wajib diisi.');
      return;
    }

    const keyPoints = keyPointsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      setSaving(true);
      setErrorMsg(null);
      await onSave({
        id: editingPamphlet?.id || `pamflet-${Date.now()}`,
        title: title.trim(),
        subtitle: subtitle.trim() || 'Panduan Calon Pengantin PKBI Buleleng',
        category: category.trim() || 'Skrining Catin',
        imageUrl: imageUrl.trim(),
        summary: summary.trim(),
        keyPoints: keyPoints.length > 0 ? keyPoints : ['Panduan resmi skrining pranikah PKBI Buleleng'],
        recommendedAction:
          recommendedAction.trim() || 'Konsultasi di Puskesmas terdekat atau hubungi Tim PKBI Buleleng.',
        isDeleted: false,
      });
      onClose();
    } catch {
      setErrorMsg('Gagal menyimpan pamflet ke Firebase. Pastikan sesi Admin aktif.');
    } finally {
      setSaving(false);
    }
  };

  const modalNode = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-pamphlet-modal-title"
      className="fixed inset-0 z-[85] bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-xl max-h-[92dvh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#0c162e] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-sky-400 flex items-center gap-1">
              <ShieldCheck size={13} />
              <span>Firebase CMS · Pamflet Skrining Catin</span>
            </div>
            <h2 id="admin-pamphlet-modal-title" className="text-base sm:text-lg font-bold font-serif">
              {editingPamphlet ? 'Edit Pamflet Catin' : 'Tambah Pamflet Catin Baru'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup form pamflet"
            className="min-h-[40px] min-w-[40px] rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
          >
            <X size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-3.5 text-xs sm:text-sm">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          <label className="block space-y-1">
            <span className="text-xs font-semibold">Judul Pamflet</span>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Mis. Panduan Imunisasi TT & Asam Folat Pranikah"
              className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-xs font-semibold">Subjudul Singkat</span>
              <input
                type="text"
                required
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Mis. Persiapan Kehamilan Sehat"
                className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold">Kategori Pamflet</span>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Mis. Pencegahan Anemia"
                className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </label>
          </div>

          <CloudinaryMediaField
            label="Gambar Poster / Cover Pamflet"
            value={imageUrl}
            onChange={setImageUrl}
            mediaType="image"
          />

          <label className="block space-y-1">
            <span className="text-xs font-semibold">Ringkasan Pamflet</span>
            <textarea
              rows={3}
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-semibold">Poin Edukasi Utama (1 poin per baris)</span>
            <textarea
              rows={4}
              value={keyPointsText}
              onChange={(e) => setKeyPointsText(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-semibold">Tindak Lanjut yang Disarankan</span>
            <input
              type="text"
              required
              value={recommendedAction}
              onChange={(e) => setRecommendedAction(e.target.value)}
              className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </label>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[42px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer"
            >
              Batal
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
