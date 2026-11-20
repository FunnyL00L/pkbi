import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Loader2, ShieldCheck } from 'lucide-react';
import { PenyakitSeksualEdu } from '../../types';
import { CloudinaryMediaField } from '../ui/CloudinaryMediaField';

interface AdminDiseaseModalProps {
  isOpen: boolean;
  editingDisease: PenyakitSeksualEdu | null;
  onClose: () => void;
  onSave: (item: PenyakitSeksualEdu) => Promise<void>;
}

export const AdminDiseaseModal: React.FC<AdminDiseaseModalProps> = ({
  isOpen,
  editingDisease,
  onClose,
  onSave,
}) => {
  const [namaPenyakit, setNamaPenyakit] = useState('');
  const [singkatan, setSingkatan] = useState('');
  const [kategori, setKategori] = useState('Infeksi Menular Seksual');
  const [tingkatBahaya, setTingkatBahaya] =
    useState<PenyakitSeksualEdu['tingkatBahaya']>('Tinggi');
  const [imageUrl, setImageUrl] = useState('');
  const [penyebab, setPenyebab] = useState('');
  const [gejalaPriaText, setGejalaPriaText] = useState('');
  const [gejalaWanitaText, setGejalaWanitaText] = useState('');
  const [penularanText, setPenularanText] = useState('');
  const [pencegahanText, setPencegahanText] = useState('');
  const [skriningPranikah, setSkriningPranikah] = useState('');
  const [pengobatan, setPengobatan] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg(null);
    if (editingDisease) {
      setNamaPenyakit(editingDisease.namaPenyakit);
      setSingkatan(editingDisease.singkatan);
      setKategori(editingDisease.kategori);
      setTingkatBahaya(editingDisease.tingkatBahaya);
      setImageUrl(editingDisease.imageUrl || '');
      setPenyebab(editingDisease.penyebab);
      setGejalaPriaText(editingDisease.gejalaPria.join('\n'));
      setGejalaWanitaText(editingDisease.gejalaWanita.join('\n'));
      setPenularanText(editingDisease.caraPenularan.join('\n'));
      setPencegahanText(editingDisease.metodePencegahan.join('\n'));
      setSkriningPranikah(editingDisease.skriningPranikah);
      setPengobatan(editingDisease.pengobatan);
    } else {
      setNamaPenyakit('');
      setSingkatan('IMS');
      setKategori('Infeksi Menular Seksual (Bakteri/Virus)');
      setTingkatBahaya('Tinggi');
      setImageUrl('');
      setPenyebab('');
      setGejalaPriaText('');
      setGejalaWanitaText('');
      setPenularanText('Kontak seksual tanpa pengaman');
      setPencegahanText('Setia pada satu pasangan dan lakukan skrining rutin');
      setSkriningPranikah('Dapat dideteksi melalui pemeriksaan laboratorium Puskesmas sebelum menikah.');
      setPengobatan('Segera periksakan diri ke dokter/Puskesmas untuk penanganan medis yang tepat.');
    }
  }, [isOpen, editingDisease]);

  if (!isOpen) return null;

  const splitLines = (raw: string, fallback: string) => {
    const arr = raw
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    return arr.length > 0 ? arr : [fallback];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPenyakit.trim() || !penyebab.trim()) {
      setErrorMsg('Nama penyakit dan penyebab wajib diisi.');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);
      await onSave({
        id: editingDisease?.id || `ims-${Date.now()}`,
        namaPenyakit: namaPenyakit.trim(),
        singkatan: singkatan.trim() || 'IMS',
        kategori: kategori.trim() || 'Infeksi Menular Seksual',
        tingkatBahaya,
        imageUrl: imageUrl.trim() || undefined,
        penyebab: penyebab.trim(),
        gejalaPria: splitLines(gejalaPriaText, 'Sering tanpa gejala pada tahap awal'),
        gejalaWanita: splitLines(gejalaWanitaText, 'Sering tanpa gejala pada tahap awal'),
        caraPenularan: splitLines(penularanText, 'Kontak seksual tanpa pengaman'),
        metodePencegahan: splitLines(pencegahanText, 'Skrining kesehatan berkala & perilaku aman'),
        skriningPranikah:
          skriningPranikah.trim() || 'Tersedia layanan pemeriksaan laboratorium di Puskesmas.',
        pengobatan:
          pengobatan.trim() || 'Konsultasi dan terapi medis sesuai anjuran dokter.',
        mitosFakta: editingDisease?.mitosFakta || [],
        isDeleted: false,
      });
      onClose();
    } catch {
      setErrorMsg('Gagal menyimpan katalog penyakit IMS ke Firebase. Pastikan sesi Admin aktif.');
    } finally {
      setSaving(false);
    }
  };

  const modalNode = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-disease-modal-title"
      className="fixed inset-0 z-[85] bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-2xl max-h-[92dvh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#0c162e] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1">
              <ShieldCheck size={13} />
              <span>Firebase CMS · Katalog Penyakit IMS</span>
            </div>
            <h2 id="admin-disease-modal-title" className="text-base sm:text-lg font-bold font-serif">
              {editingDisease ? `Edit Penyakit: ${editingDisease.namaPenyakit}` : 'Tambah Penyakit IMS Baru'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup form katalog IMS"
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
              <span className="text-xs font-semibold">Nama Penyakit</span>
              <input
                type="text"
                required
                value={namaPenyakit}
                onChange={(e) => setNamaPenyakit(e.target.value)}
                placeholder="Mis. Klamidia (Chlamydia)"
                className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold">Singkatan / Kode</span>
              <input
                type="text"
                required
                value={singkatan}
                onChange={(e) => setSingkatan(e.target.value)}
                placeholder="Mis. CT / HPV / HIV"
                className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold">Kategori</span>
              <input
                type="text"
                required
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                placeholder="Mis. Infeksi Bakteri Menular Seksual"
                className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold">Tingkat Bahaya</span>
              <select
                value={tingkatBahaya}
                onChange={(e) =>
                  setTingkatBahaya(e.target.value as PenyakitSeksualEdu['tingkatBahaya'])
                }
                className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="Sangat Tinggi">Sangat Tinggi</option>
                <option value="Tinggi">Tinggi</option>
                <option value="Perlu Perhatian Khusus">Perlu Perhatian Khusus</option>
              </select>
            </label>
          </div>

          <CloudinaryMediaField
            label="Foto Ilustrasi / Sampul (Opsional)"
            value={imageUrl}
            onChange={setImageUrl}
            mediaType="image"
          />

          <label className="block space-y-1">
            <span className="text-xs font-semibold">Penyebab Utama</span>
            <textarea
              rows={2}
              required
              value={penyebab}
              onChange={(e) => setPenyebab(e.target.value)}
              placeholder="Contoh: Bakteri Chlamydia trachomatis..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-xs font-semibold">Gejala pada Pria (1 per baris)</span>
              <textarea
                rows={3}
                value={gejalaPriaText}
                onChange={(e) => setGejalaPriaText(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold">Gejala pada Wanita (1 per baris)</span>
              <textarea
                rows={3}
                value={gejalaWanitaText}
                onChange={(e) => setGejalaWanitaText(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold">Cara Penularan (1 per baris)</span>
              <textarea
                rows={3}
                value={penularanText}
                onChange={(e) => setPenularanText(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold">Metode Pencegahan (1 per baris)</span>
              <textarea
                rows={3}
                value={pencegahanText}
                onChange={(e) => setPencegahanText(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </label>
          </div>

          <label className="block space-y-1">
            <span className="text-xs font-semibold">Skrining Pranikah</span>
            <textarea
              rows={2}
              required
              value={skriningPranikah}
              onChange={(e) => setSkriningPranikah(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-semibold">Pengobatan &amp; Penanganan</span>
            <textarea
              rows={2}
              required
              value={pengobatan}
              onChange={(e) => setPengobatan(e.target.value)}
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
              className="min-h-[42px] px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
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
