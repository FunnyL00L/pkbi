import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Loader2, ShieldCheck } from 'lucide-react';
import { HarmonyPosyanduActivity } from '../../types';
import { ADMIN_RELAWAN_NAME } from '../../utils/childGrowthHelpers';
import { CloudinaryMediaField } from '../ui/CloudinaryMediaField';

interface AdminPosyanduModalProps {
  isOpen: boolean;
  editingPosyandu: HarmonyPosyanduActivity | null;
  onClose: () => void;
  onSave: (item: HarmonyPosyanduActivity) => Promise<void>;
}

export const AdminPosyanduModal: React.FC<AdminPosyanduModalProps> = ({
  isOpen,
  editingPosyandu,
  onClose,
  onSave,
}) => {
  const [posyanduName, setPosyanduName] = useState('');
  const [banjar, setBanjar] = useState('');
  const [schedule, setSchedule] = useState('');
  const [nextSession, setNextSession] = useState('');
  const [leadMidwife, setLeadMidwife] = useState(ADMIN_RELAWAN_NAME);
  const [balitaCount, setBalitaCount] = useState(45);
  const [bumilCount, setBumilCount] = useState(12);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [highlightsText, setHighlightsText] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg(null);
    if (editingPosyandu) {
      setPosyanduName(editingPosyandu.posyanduName);
      setBanjar(editingPosyandu.banjar);
      setSchedule(editingPosyandu.schedule);
      setNextSession(editingPosyandu.nextSession);
      setLeadMidwife(editingPosyandu.leadMidwife);
      setBalitaCount(editingPosyandu.balitaCount);
      setBumilCount(editingPosyandu.bumilCount);
      setDescription(editingPosyandu.description);
      setImageUrl(editingPosyandu.imageUrl);
      setHighlightsText(editingPosyandu.highlights.join('\n'));
    } else {
      setPosyanduName('');
      setBanjar('Banjar Desa Harmony');
      setSchedule('Setiap Tanggal 10 · 08.30 – 11.30 WITA');
      setNextSession('Bulan Depan · 08.30 WITA');
      setLeadMidwife(ADMIN_RELAWAN_NAME);
      setBalitaCount(45);
      setBumilCount(10);
      setDescription('');
      setImageUrl('');
      setHighlightsText('Penimbangan BB & pengukuran panjang/tinggi badan\nDistribusi PMT pangan lokal bergizi');
    }
  }, [isOpen, editingPosyandu]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!posyanduName.trim() || !description.trim()) {
      setErrorMsg('Nama Posyandu dan deskripsi layanan wajib diisi.');
      return;
    }

    const highlights = highlightsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      setSaving(true);
      setErrorMsg(null);
      await onSave({
        id: editingPosyandu?.id || `pos-${Date.now()}`,
        posyanduName: posyanduName.trim(),
        banjar: banjar.trim() || 'Banjar Desa Harmony',
        schedule: schedule.trim() || 'Setiap Bulan · 08.30 WITA',
        nextSession: nextSession.trim() || 'Jadwal Terbaru',
        leadMidwife: leadMidwife.trim() || ADMIN_RELAWAN_NAME,
        balitaCount: Math.max(0, Math.round(balitaCount)),
        bumilCount: Math.max(0, Math.round(bumilCount)),
        description: description.trim(),
        imageUrl: imageUrl.trim(),
        highlights: highlights.length > 0 ? highlights : ['Pemantauan tumbuh kembang balita & ibu hamil'],
        isDeleted: false,
      });
      onClose();
    } catch {
      setErrorMsg('Gagal menyimpan data Posyandu ke Firebase. Pastikan sesi Admin aktif.');
    } finally {
      setSaving(false);
    }
  };

  const modalNode = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-posyandu-modal-title"
      className="fixed inset-0 z-[85] bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-xl max-h-[92dvh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#0c162e] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <ShieldCheck size={13} />
              <span>Firebase CMS · Posyandu Desa Harmony</span>
            </div>
            <h2 id="admin-posyandu-modal-title" className="text-base sm:text-lg font-bold font-serif">
              {editingPosyandu ? 'Edit Data Posyandu' : 'Tambah Posyandu Baru'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup form Posyandu"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-xs font-semibold">Nama Posyandu</span>
              <input
                type="text"
                required
                value={posyanduName}
                onChange={(e) => setPosyanduName(e.target.value)}
                placeholder="Mis. Posyandu Melati I"
                className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold">Banjar / Wilayah</span>
              <input
                type="text"
                required
                value={banjar}
                onChange={(e) => setBanjar(e.target.value)}
                placeholder="Mis. Banjar Dangin Yeh"
                className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold">Jadwal Rutin</span>
              <input
                type="text"
                required
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                placeholder="Setiap Tgl 10 · 08.30 WITA"
                className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold">Sesi Berikutnya</span>
              <input
                type="text"
                required
                value={nextSession}
                onChange={(e) => setNextSession(e.target.value)}
                placeholder="Mis. 10 Juni 2025 · 08.30 WITA"
                className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold">Jumlah Balita Terpantau</span>
              <input
                type="number"
                min={0}
                value={balitaCount}
                onChange={(e) => setBalitaCount(Number(e.target.value))}
                className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 tabular-nums"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold">Jumlah Ibu Hamil</span>
              <input
                type="number"
                min={0}
                value={bumilCount}
                onChange={(e) => setBumilCount(Number(e.target.value))}
                className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 tabular-nums"
              />
            </label>
          </div>

          <label className="block space-y-1">
            <span className="text-xs font-semibold">Bidan / Kader Penanggung Jawab</span>
            <input
              type="text"
              value={leadMidwife}
              onChange={(e) => setLeadMidwife(e.target.value)}
              className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </label>

          <CloudinaryMediaField
            label="Foto Kegiatan Posyandu"
            value={imageUrl}
            onChange={setImageUrl}
            mediaType="image"
          />

          <label className="block space-y-1">
            <span className="text-xs font-semibold">Deskripsi Layanan Posyandu</span>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ringkasan layanan penimbangan, konseling gizi, dan kelas ibu..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-semibold">Fokus Layanan / Sorotan (1 poin per baris)</span>
            <textarea
              rows={3}
              value={highlightsText}
              onChange={(e) => setHighlightsText(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
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
              className="min-h-[42px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
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
