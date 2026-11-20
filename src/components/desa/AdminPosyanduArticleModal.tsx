import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Loader2, BookOpen } from 'lucide-react';
import { BeritaKegiatanDetail } from '../../types';
import { ADMIN_RELAWAN_NAME } from '../../utils/childGrowthHelpers';
import { CloudinaryMediaField } from '../ui/CloudinaryMediaField';
import { BloggerHtmlEditor } from '../ui/BloggerHtmlEditor';

interface AdminPosyanduArticleModalProps {
  isOpen: boolean;
  editingArticle?: BeritaKegiatanDetail | null;
  onClose: () => void;
  onSave: (article: BeritaKegiatanDetail) => Promise<void>;
}

const DEFAULT_POSYANDU_IMAGE =
  'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=900&q=80';

export const AdminPosyanduArticleModal: React.FC<AdminPosyanduArticleModalProps> = ({
  isOpen,
  editingArticle,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [kategori, setKategori] = useState('Posyandu & Gizi');
  const [hari, setHari] = useState('Sabtu');
  const [tanggal, setTanggal] = useState('');
  const [waktu, setWaktu] = useState('08:00 - 11:00 WITA');
  const [lokasi, setLokasi] = useState('Balai Banjar Desa Sari Mekar');
  const [narasumber, setNarasumber] = useState(ADMIN_RELAWAN_NAME);
  const [pesertaCount, setPesertaCount] = useState('45');
  const [status, setStatus] = useState<BeritaKegiatanDetail['status']>('Selesai');
  const [imageUrl, setImageUrl] = useState(DEFAULT_POSYANDU_IMAGE);
  const [ringkasan, setRingkasan] = useState('');
  const [hasilText, setHasilText] = useState('');
  const [contentMode, setContentMode] = useState<'standard' | 'html'>('standard');
  const [isiBeritaLengkap, setIsiBeritaLengkap] = useState('');
  const [customHtml, setCustomHtml] = useState('');

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg(null);
    if (editingArticle) {
      setTitle(editingArticle.title || '');
      setKategori(editingArticle.kategori || 'Posyandu & Gizi');
      setHari(editingArticle.hari || 'Sabtu');
      setTanggal(editingArticle.tanggal || '');
      setWaktu(editingArticle.waktu || '08:00 - 11:00 WITA');
      setLokasi(editingArticle.lokasi || 'Balai Banjar Desa Sari Mekar');
      setNarasumber(editingArticle.narasumber || ADMIN_RELAWAN_NAME);
      setPesertaCount(String(editingArticle.pesertaCount ?? 40));
      setStatus(editingArticle.status || 'Selesai');
      setImageUrl(editingArticle.imageUrl || DEFAULT_POSYANDU_IMAGE);
      setRingkasan(editingArticle.ringkasan || '');
      setHasilText((editingArticle.hasilKegiatan || []).join('\n'));
      setContentMode(editingArticle.contentMode === 'html' ? 'html' : 'standard');
      setIsiBeritaLengkap(editingArticle.isiBeritaLengkap || '');
      setCustomHtml(editingArticle.customHtml || '');
    } else {
      const todayLabel = new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
      setTitle('');
      setKategori('Posyandu & Gizi');
      setHari('Sabtu');
      setTanggal(todayLabel);
      setWaktu('08:00 - 11:00 WITA');
      setLokasi('Balai Banjar Desa Sari Mekar, Kec. Buleleng');
      setNarasumber(ADMIN_RELAWAN_NAME);
      setPesertaCount('45');
      setStatus('Selesai');
      setImageUrl(DEFAULT_POSYANDU_IMAGE);
      setRingkasan('');
      setHasilText(
        'Seluruh balita sasaran berhasil ditimbang dan diukur tinggi badannya\nPemberian Makanan Tambahan (PMT) bergizi disalurkan kepada balita dan ibu hamil'
      );
      setContentMode('standard');
      setIsiBeritaLengkap('');
      setCustomHtml('');
    }
  }, [isOpen, editingArticle]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 3) {
      setErrorMsg('Judul artikel dokumentasi minimal 3 karakter.');
      return;
    }
    if (ringkasan.trim().length < 5) {
      setErrorMsg('Ringkasan singkat artikel minimal 5 karakter.');
      return;
    }
    if (contentMode === 'html' && customHtml.trim().length < 10) {
      setErrorMsg('Kode HTML kustom masih kosong. Isi kode HTML atau pilih template cepat.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    try {
      const hasilKegiatan = hasilText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 12);

      const safeBody =
        isiBeritaLengkap.trim() ||
        ringkasan.trim();

      const payload: BeritaKegiatanDetail = {
        id: editingArticle?.id || `pos-art-${Date.now()}`,
        desaName: editingArticle?.desaName || 'Desa Sari Mekar',
        kecamatanName: editingArticle?.kecamatanName || 'Kecamatan Buleleng',
        title: title.trim(),
        hari: hari.trim() || 'Sabtu',
        tanggal: tanggal.trim() || 'Hari ini',
        waktu: waktu.trim() || '08:00 - 11:00 WITA',
        lokasi: lokasi.trim() || 'Desa Sari Mekar',
        kategori: kategori.trim() || 'Posyandu & Gizi',
        status,
        imageUrl: imageUrl.trim() || DEFAULT_POSYANDU_IMAGE,
        ringkasan: ringkasan.trim(),
        isiBeritaLengkap: safeBody,
        contentMode,
        customHtml: contentMode === 'html' ? customHtml : '',
        narasumber: narasumber.trim() || ADMIN_RELAWAN_NAME,
        pesertaCount: Math.max(0, Number(pesertaCount) || 0),
        hasilKegiatan,
        isDeleted: false,
      };

      await onSave(payload);
      onClose();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Gagal menyimpan Artikel Dokumentasi Posyandu ke Firebase.'
      );
    } finally {
      setSaving(false);
    }
  };

  const modal = (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center p-2.5 sm:p-5 bg-slate-950/75 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label={editingArticle ? 'Edit Artikel Dokumentasi Posyandu' : 'Tambah Artikel Dokumentasi Posyandu'}
    >
      <div className="w-full max-w-2xl max-h-[92vh] rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0c162e] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-700 dark:text-sky-400 flex items-center justify-center shrink-0">
              <BookOpen size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold font-serif text-slate-900 dark:text-white truncate">
                {editingArticle
                  ? 'Edit Artikel Dokumentasi Posyandu'
                  : 'Tambah Artikel Dokumentasi Posyandu'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Tersimpan di Firebase · Mendukung Mode Standar &amp; Kustom HTML (Blogger)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-xs font-semibold text-rose-700 dark:text-rose-300">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Judul Artikel Dokumentasi *
            </label>
            <input
              id="input-posyandu-article-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Pemberian Makanan Tambahan (PMT) Balita Banjar Dangin Yeh"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Kategori
              </label>
              <input
                type="text"
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                placeholder="Posyandu & Gizi"
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Hari
              </label>
              <input
                type="text"
                value={hari}
                onChange={(e) => setHari(e.target.value)}
                placeholder="Sabtu"
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Tanggal
              </label>
              <input
                type="text"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                placeholder="15 Maret 2025"
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Jumlah Peserta
              </label>
              <input
                type="number"
                min={0}
                max={50000}
                value={pesertaCount}
                onChange={(e) => setPesertaCount(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Lokasi Kegiatan
              </label>
              <input
                type="text"
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value)}
                placeholder="Balai Banjar Desa Sari Mekar"
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Narasumber / Pencatat
              </label>
              <input
                type="text"
                value={narasumber}
                onChange={(e) => setNarasumber(e.target.value)}
                placeholder={ADMIN_RELAWAN_NAME}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Status Kegiatan
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BeritaKegiatanDetail['status'])}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
              >
                <option value="Selesai">Selesai</option>
                <option value="Sedang Berlangsung">Sedang Berlangsung</option>
                <option value="Akan Datang">Akan Datang</option>
              </select>
            </div>
          </div>

          <CloudinaryMediaField
            label="Foto Sampul Dokumentasi (Simpan ke Firebase / URL)"
            value={imageUrl}
            onChange={setImageUrl}
            mediaType="image"
            placeholder="Klik Upload Gambar ke Firebase atau tempel URL (https://...)"
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Ringkasan Singkat (Lead Artikel) *
            </label>
            <textarea
              rows={2}
              required
              value={ringkasan}
              onChange={(e) => setRingkasan(e.target.value)}
              placeholder="Ringkasan singkat dokumentasi kegiatan posyandu..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white"
            />
          </div>

          {/* Blogger Dual-Mode Editor: Standar vs Kustom HTML + Sisipkan Gambar Inline */}
          <BloggerHtmlEditor
            mode={contentMode}
            onModeChange={setContentMode}
            standardText={isiBeritaLengkap}
            onStandardTextChange={setIsiBeritaLengkap}
            customHtml={customHtml}
            onCustomHtmlChange={setCustomHtml}
            standardLabel="Isi Dokumentasi Lengkap (1 baris = 1 paragraf)"
            standardPlaceholder="Tulis uraian lengkap kegiatan posyandu di sini. Anda juga dapat beralih ke mode Kustom HTML untuk membuat desain bebas ala Blogger beserta gambar inline."
            articleTitle={title}
            articleSummary={ringkasan}
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Hasil / Poin Utama Kegiatan (1 baris = 1 poin)
            </label>
            <textarea
              rows={3}
              value={hasilText}
              onChange={(e) => setHasilText(e.target.value)}
              placeholder="Contoh: 45 balita terukur antropometri lengkap&#10;Distribusi 30 paket PMT lokal"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="min-h-[40px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Batal
            </button>
            <button
              id="btn-save-posyandu-article"
              type="submit"
              disabled={saving}
              className="min-h-[40px] px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              <span>{saving ? 'Menyimpan...' : 'Simpan ke Firebase'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};
