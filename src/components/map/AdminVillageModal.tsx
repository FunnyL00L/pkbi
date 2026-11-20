import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Loader2, ShieldCheck, MapPin } from 'lucide-react';
import { KECAMATAN_LIST } from '../../data/bulelengData';
import { CmsVillageRecord, EccdVillageMarker } from '../../types';
import { ADMIN_RELAWAN_NAME } from '../../utils/childGrowthHelpers';
import { CloudinaryMediaField } from '../ui/CloudinaryMediaField';

interface AdminVillageModalProps {
  isOpen: boolean;
  editingVillage: EccdVillageMarker | null;
  defaultKecamatanId?: string;
  onClose: () => void;
  onSave: (village: CmsVillageRecord) => Promise<void>;
}

export const AdminVillageModal: React.FC<AdminVillageModalProps> = ({
  isOpen,
  editingVillage,
  defaultKecamatanId,
  onClose,
  onSave,
}) => {
  const [kecamatanId, setKecamatanId] = useState(defaultKecamatanId || KECAMATAN_LIST[0].id);
  const [name, setName] = useState('');
  const [lat, setLat] = useState(-8.118);
  const [lng, setLng] = useState(115.088);
  const [population, setPopulation] = useState(4200);
  const [posyanduCount, setPosyanduCount] = useState(4);
  const [stuntingPct, setStuntingPct] = useState(7.5);
  const [statusProgram, setStatusProgram] =
    useState<CmsVillageRecord['statusProgram']>('Aktif ECCD Mobile');
  const [lakiLaki, setLakiLaki] = useState(65);
  const [perempuan, setPerempuan] = useState(85);
  const [deskripsi, setDeskripsi] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg(null);
    if (editingVillage) {
      setKecamatanId(editingVillage.kecamatanId);
      setName(editingVillage.name);
      setLat(editingVillage.lat);
      setLng(editingVillage.lng);
      setPopulation(editingVillage.population);
      setPosyanduCount(editingVillage.posyanduCount);
      setStuntingPct(editingVillage.stuntingPct);
      setStatusProgram(editingVillage.statusProgram);
      setLakiLaki(editingVillage.serviceData.genderBreakdown.lakiLaki);
      setPerempuan(editingVillage.serviceData.genderBreakdown.perempuan);
      setDeskripsi(editingVillage.deskripsi);
      setImageUrl(editingVillage.agendaList[0]?.galleryImages?.[0] || '');
    } else {
      const kec =
        KECAMATAN_LIST.find((k) => k.id === defaultKecamatanId) || KECAMATAN_LIST[0];
      setKecamatanId(kec.id);
      setName('');
      setLat(kec.lat);
      setLng(kec.lng);
      setPopulation(3800);
      setPosyanduCount(4);
      setStuntingPct(7.2);
      setStatusProgram('Aktif ECCD Mobile');
      setLakiLaki(50);
      setPerempuan(70);
      setDeskripsi('');
      setImageUrl('');
    }
  }, [isOpen, editingVillage, defaultKecamatanId]);

  if (!isOpen) return null;

  const handleKecamatanChange = (nextId: string) => {
    setKecamatanId(nextId);
    if (!editingVillage) {
      const kec = KECAMATAN_LIST.find((k) => k.id === nextId);
      if (kec) {
        setLat(kec.lat);
        setLng(kec.lng);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !deskripsi.trim()) {
      setErrorMsg('Nama Desa/Kelurahan dan deskripsi layanan wajib diisi.');
      return;
    }
    const kec = KECAMATAN_LIST.find((k) => k.id === kecamatanId) || KECAMATAN_LIST[0];
    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60);

    const payload: CmsVillageRecord = {
      id: editingVillage?.id || `desa-${kec.id}-${slug}-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      kecamatanId: kec.id,
      kecamatanName: kec.name,
      lat: Number(lat) || kec.lat,
      lng: Number(lng) || kec.lng,
      population: Math.max(0, Math.round(population)),
      posyanduCount: Math.max(0, Math.round(posyanduCount)),
      stuntingPct: Math.max(0, Math.min(100, Number(stuntingPct) || 0)),
      statusProgram,
      deskripsi: deskripsi.trim(),
      totalRecipients: Math.max(0, Math.round(lakiLaki) + Math.round(perempuan)),
      lakiLaki: Math.max(0, Math.round(lakiLaki)),
      perempuan: Math.max(0, Math.round(perempuan)),
      imageUrl: imageUrl.trim(),
      isDeleted: false,
    };

    try {
      setSaving(true);
      setErrorMsg(null);
      await onSave(payload);
      onClose();
    } catch {
      setErrorMsg('Gagal menyimpan data desa/kelurahan ke database. Pastikan Anda login sebagai Admin.');
    } finally {
      setSaving(false);
    }
  };

  const modalNode = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-village-modal-title"
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
              <span>Mode Admin · {ADMIN_RELAWAN_NAME}</span>
            </div>
            <h2 id="admin-village-modal-title" className="text-base sm:text-lg font-bold font-serif">
              {editingVillage ? `Edit Wilayah: ${editingVillage.name}` : 'Tambah Desa / Kelurahan Buleleng'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup form desa"
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
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Kecamatan di Buleleng
              </span>
              <select
                value={kecamatanId}
                onChange={(e) => handleKecamatanChange(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
              >
                {KECAMATAN_LIST.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nama Desa / Kelurahan
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Kelurahan Banyuning / Desa Panji"
                className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <MapPin size={12} />
                <span>Lintang (Latitude Buleleng)</span>
              </span>
              <input
                type="number"
                step="0.0001"
                min={-8.6}
                max={-7.9}
                value={lat}
                onChange={(e) => setLat(Number(e.target.value))}
                className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 tabular-nums"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <MapPin size={12} />
                <span>Bujur (Longitude Buleleng)</span>
              </span>
              <input
                type="number"
                step="0.0001"
                min={114.4}
                max={115.6}
                value={lng}
                onChange={(e) => setLng(Number(e.target.value))}
                className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 tabular-nums"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Status Program ECCD
              </span>
              <select
                value={statusProgram}
                onChange={(e) =>
                  setStatusProgram(e.target.value as CmsVillageRecord['statusProgram'])
                }
                className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="Aktif ECCD Mobile">Aktif ECCD Mobile</option>
                <option value="Desa Binaan Utama">Desa Binaan Utama</option>
                <option value="Siaga Layanan">Siaga Layanan</option>
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Prevalensi Stunting (%)
              </span>
              <input
                type="number"
                step="0.1"
                min={0}
                max={100}
                value={stuntingPct}
                onChange={(e) => setStuntingPct(Number(e.target.value))}
                className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 tabular-nums"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Penerima Laki-laki
              </span>
              <input
                type="number"
                min={0}
                value={lakiLaki}
                onChange={(e) => setLakiLaki(Number(e.target.value))}
                className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 tabular-nums"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Penerima Perempuan
              </span>
              <input
                type="number"
                min={0}
                value={perempuan}
                onChange={(e) => setPerempuan(Number(e.target.value))}
                className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 tabular-nums"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Estimasi Penduduk
              </span>
              <input
                type="number"
                min={0}
                value={population}
                onChange={(e) => setPopulation(Number(e.target.value))}
                className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 tabular-nums"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Jumlah Posyandu
              </span>
              <input
                type="number"
                min={0}
                value={posyanduCount}
                onChange={(e) => setPosyanduCount(Number(e.target.value))}
                className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 tabular-nums"
              />
            </label>
          </div>

          <label className="block space-y-1">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Deskripsi &amp; Fokus Layanan Desa
            </span>
            <textarea
              rows={3}
              required
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Ringkasan jangkauan layanan mobile ECCD, Posyandu, dan pendampingan keluarga..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </label>

          <CloudinaryMediaField
            label="Foto Wilayah / Dokumentasi (Cloudinary)"
            value={imageUrl}
            onChange={setImageUrl}
            mediaType="image"
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
              type="submit"
              disabled={saving}
              className="min-h-[42px] px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              <span>Simpan Desa/Kelurahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;
};
