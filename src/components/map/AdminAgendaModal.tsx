import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Loader2, ShieldCheck } from 'lucide-react';
import { EccdVillageAgendaItem, EccdVillageMarker } from '../../types';
import {
  ADMIN_RELAWAN_NAME,
  formatIndonesianDisplayDate,
} from '../../utils/childGrowthHelpers';
import { CloudinaryMediaField } from '../ui/CloudinaryMediaField';

interface AdminAgendaModalProps {
  isOpen: boolean;
  villages: EccdVillageMarker[];
  defaultVillageId?: string;
  editingAgenda: EccdVillageAgendaItem | null;
  onClose: () => void;
  onSave: (agenda: EccdVillageAgendaItem) => Promise<void>;
}

const AGENDA_CATEGORIES: EccdVillageAgendaItem['category'][] = [
  'Posyandu & Gizi',
  'Layanan Mobile ECCD',
  'Kelas Ibu & Anak',
  'Skrining Catin & Kespro',
  'Edukasi Remaja',
];

export const AdminAgendaModal: React.FC<AdminAgendaModalProps> = ({
  isOpen,
  villages,
  defaultVillageId,
  editingAgenda,
  onClose,
  onSave,
}) => {
  const [villageId, setVillageId] = useState(defaultVillageId || villages[0]?.id || '');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EccdVillageAgendaItem['category']>('Layanan Mobile ECCD');
  const [date, setDate] = useState('2025-05-15');
  const [time, setTime] = useState('08.30 – 12.00 WITA');
  const [status, setStatus] = useState<'Terlaksana' | 'Terjadwal'>('Terjadwal');
  const [location, setLocation] = useState('');
  const [facilitator, setFacilitator] = useState(ADMIN_RELAWAN_NAME);
  const [participants, setParticipants] = useState(40);
  const [summary, setSummary] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg(null);
    if (editingAgenda) {
      setVillageId(editingAgenda.villageId);
      setTitle(editingAgenda.title);
      setCategory(editingAgenda.category);
      setDate(editingAgenda.date);
      setTime(editingAgenda.time);
      setStatus(editingAgenda.status);
      setLocation(editingAgenda.location);
      setFacilitator(editingAgenda.facilitator || ADMIN_RELAWAN_NAME);
      setParticipants(editingAgenda.participants);
      setSummary(editingAgenda.summary);
      setImageUrl(editingAgenda.galleryImages?.[0] || '');
    } else {
      const targetVillage =
        villages.find((v) => v.id === defaultVillageId) || villages[0];
      setVillageId(targetVillage?.id || '');
      setTitle('');
      setCategory('Layanan Mobile ECCD');
      setDate(new Date().toISOString().slice(0, 10));
      setTime('08.30 – 12.00 WITA');
      setStatus('Terjadwal');
      setLocation(targetVillage ? `Balai Desa ${targetVillage.name.replace(/^Desa\s+/i, '')}` : '');
      setFacilitator(ADMIN_RELAWAN_NAME);
      setParticipants(45);
      setSummary('');
      setImageUrl('');
    }
  }, [isOpen, editingAgenda, defaultVillageId, villages]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedVillage = villages.find((v) => v.id === villageId);
    if (!selectedVillage) {
      setErrorMsg('Pilih desa tujuan kegiatan terlebih dahulu.');
      return;
    }
    if (!title.trim() || !summary.trim()) {
      setErrorMsg('Judul dan ringkasan kegiatan wajib diisi.');
      return;
    }

    const trimmedImage = imageUrl.trim();
    const fallbackImg =
      editingAgenda?.galleryImages?.[0] ||
      selectedVillage.agendaList[0]?.galleryImages?.[0] ||
      '';

    const resolvedGallery = trimmedImage
      ? [
          trimmedImage,
          ...(editingAgenda?.galleryImages?.slice(1) || []).filter((u) => u !== trimmedImage),
        ]
      : editingAgenda?.galleryImages && editingAgenda.galleryImages.length > 0
        ? editingAgenda.galleryImages
        : fallbackImg
          ? [fallbackImg]
          : [];

    const payload: EccdVillageAgendaItem = {
      id: editingAgenda?.id || `agenda-${selectedVillage.id}-${Date.now()}`,
      villageId: selectedVillage.id,
      kecamatanId: selectedVillage.kecamatanId,
      title: title.trim(),
      date,
      displayDate: formatIndonesianDisplayDate(date),
      time: time.trim() || '08.30 – 12.00 WITA',
      status,
      category,
      location: location.trim() || selectedVillage.name,
      participants: Math.max(0, Math.round(participants)),
      facilitator: facilitator.trim() || ADMIN_RELAWAN_NAME,
      summary: summary.trim(),
      galleryImages: resolvedGallery,
    };

    try {
      setSaving(true);
      setErrorMsg(null);
      await onSave(payload);
      onClose();
    } catch {
      setErrorMsg('Gagal menyimpan kegiatan ke Firestore. Pastikan sesi Admin aktif.');
    } finally {
      setSaving(false);
    }
  };

  const modalNode = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-agenda-modal-title"
      className="fixed inset-0 z-[85] bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-xl max-h-[90dvh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#0c162e] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <ShieldCheck size={13} />
              <span>Mode Admin · {ADMIN_RELAWAN_NAME}</span>
            </div>
            <h2 id="admin-agenda-modal-title" className="text-base sm:text-lg font-bold font-serif">
              {editingAgenda ? 'Edit Kegiatan Desa' : 'Tambah Kegiatan Desa Baru'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup form kegiatan"
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
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Pilih Desa / Wilayah Sasaran
            </span>
            <select
              value={villageId}
              disabled={Boolean(editingAgenda)}
              onChange={(e) => setVillageId(e.target.value)}
              className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              {villages.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} — {v.kecamatanName.replace('Kecamatan ', 'Kec. ')}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Judul Kegiatan
            </span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Posyandu Integrasi & Pemeriksaan Gizi Balita"
              required
              className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Kategori
              </span>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as EccdVillageAgendaItem['category'])
                }
                className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                {AGENDA_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Status Kegiatan
              </span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Terlaksana' | 'Terjadwal')}
                className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="Terjadwal">Terjadwal</option>
                <option value="Terlaksana">Terlaksana</option>
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Tanggal
              </span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Waktu
              </span>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Lokasi Kegiatan
              </span>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Jumlah Peserta
              </span>
              <input
                type="number"
                min={0}
                max={2000}
                value={participants}
                onChange={(e) => setParticipants(Number(e.target.value))}
                className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </label>
          </div>

          <label className="block space-y-1">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Fasilitator / Pencatat
            </span>
            <input
              type="text"
              value={facilitator}
              onChange={(e) => setFacilitator(e.target.value)}
              className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Ringkasan Kegiatan
            </span>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Uraikan layanan lapangan, target peserta, dan capaian singkat..."
              required
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </label>

          <CloudinaryMediaField
            label="Foto Dokumentasi Kegiatan"
            value={imageUrl}
            onChange={setImageUrl}
            mediaType="image"
            helperText="Unggah foto atau tempel URL gambar, lalu tautannya otomatis tersimpan ke Firebase."
          />

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[42px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              id="btn-save-admin-agenda"
              type="submit"
              disabled={saving}
              className="min-h-[42px] px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              <span>Simpan Kegiatan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;
};
