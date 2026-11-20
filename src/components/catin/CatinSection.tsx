import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ClipboardCheck,
  Download,
  Eye,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  Send,
  MessageCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react';
import { CATIN_HEALTH_FACILITIES } from '../../data/eccdData';
import { KECAMATAN_LIST } from '../../data/bulelengData';
import { submitCatinNarasi } from '../../services/dataService';
import { CatinNarasiSubmission, CatinPamphletItem } from '../../types';
import { SafeImage } from '../ui/SafeImage';
import {
  generatePamphletSvgBlobContent,
  validateCatinNarasiForm,
} from '../../utils/eccdReportHelpers';
import {
  clampPamphletPage,
  getPamphletPageSlice,
  getTotalPamphletPages,
} from '../../utils/pamphletSliderHelpers';
import { buildWhatsAppUrl } from '../../utils/whatsapp';
import { useAppTheme } from '../../context/ThemeContext';
import { useAdminAuth } from '../../context/AuthContext';
import { useCmsData } from '../../context/CmsContext';
import { I18N } from '../../constants/i18n';
import { AdminPamphletModal } from './AdminPamphletModal';

interface CatinSectionProps {
  onNavigateToQna?: () => void;
}

export const CatinSection: React.FC<CatinSectionProps> = ({ onNavigateToQna }) => {
  const { language } = useAppTheme();
  const { isAdminMode } = useAdminAuth();
  const { pamphlets, upsertPamphlet, removePamphlet } = useCmsData();
  const t = I18N[language];
  const sectionMeta = t.sectionTitles.catin;

  const [previewPamphlet, setPreviewPamphlet] = useState<CatinPamphletItem | null>(null);
  const [downloadedId, setDownloadedId] = useState<string | null>(null);

  // Pamphlet slider pagination (>3 pamphlets use top-right arrows instead of stacking extra rows)
  const [pamphletPage, setPamphletPage] = useState<number>(0);
  const pamphletScrollRef = useRef<HTMLDivElement>(null);

  // Admin modal state
  const [pamphletModalOpen, setPamphletModalOpen] = useState<boolean>(false);
  const [editingPamphlet, setEditingPamphlet] = useState<CatinPamphletItem | null>(null);

  const totalPamphletPages = getTotalPamphletPages(pamphlets.length, 3);
  const safePamphletPage = clampPamphletPage(pamphletPage, pamphlets.length, 3);
  const visibleDesktopPamphlets = getPamphletPageSlice(pamphlets, safePamphletPage, 3);
  const hasOverflowPamphlets = pamphlets.length > 3;

  useEffect(() => {
    setPamphletPage((prev) => clampPamphletPage(prev, pamphlets.length, 3));
  }, [pamphlets.length]);

  const scrollMobilePamphlets = (dir: -1 | 1) => {
    const el = pamphletScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 240, behavior: 'smooth' });
  };

  const handleDeletePamphlet = async (item: CatinPamphletItem) => {
    await removePamphlet(item);
    if (previewPamphlet?.id === item.id) setPreviewPamphlet(null);
  };

  const [namaPasangan, setNamaPasangan] = useState<string>('');
  const [noHp, setNoHp] = useState<string>('');
  const [kecamatan, setKecamatan] = useState<string>('Kecamatan Buleleng');
  const [puskesmasTujuan, setPuskesmasTujuan] = useState<string>(
    CATIN_HEALTH_FACILITIES[0].name
  );
  const [rencanaTanggalNikah, setRencanaTanggalNikah] = useState<string>('');
  const [narasiKeluhan, setNarasiKeluhan] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [latestTicket, setLatestTicket] = useState<CatinNarasiSubmission | null>(null);

  const handleDownloadPamphlet = (pamphlet: CatinPamphletItem) => {
    try {
      const svgContent = generatePamphletSvgBlobContent(pamphlet);
      const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pamflet-catin-${pamphlet.id}-pkbi-buleleng.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setDownloadedId(pamphlet.id);
      setTimeout(() => setDownloadedId(null), 2600);
    } catch (err) {
      console.error('Failed to trigger pamphlet download:', err);
    }
  };

  const handleSubmitNarasi = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateCatinNarasiForm({
      namaPasangan,
      noHp,
      kecamatan,
      narasiKeluhan,
    });

    if (!validation.valid) {
      setFormErrors(validation.errors as Record<string, string>);
      return;
    }

    setFormErrors({});
    const saved = submitCatinNarasi({
      namaPasangan: namaPasangan.trim(),
      noHp: noHp.trim(),
      kecamatan,
      puskesmasTujuan,
      rencanaTanggalNikah: rencanaTanggalNikah || 'Belum ditentukan',
      narasiKeluhan: narasiKeluhan.trim(),
    });
    setLatestTicket(saved);
    setNamaPasangan('');
    setNoHp('');
    setNarasiKeluhan('');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-8 space-y-5 sm:space-y-8 text-slate-900 dark:text-slate-100">
      {/* Header Section */}
      <section className="pb-3.5 sm:pb-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2.5 sm:gap-4">
        <div className="space-y-1 sm:space-y-2 min-w-0 flex-1 max-w-3xl">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-sky-400">
            <ClipboardCheck size={14} />
            <span className="truncate">{sectionMeta.kicker}</span>
          </div>
          <h1 className="text-lg sm:text-3xl font-extrabold font-serif tracking-tight text-slate-900 dark:text-white leading-tight">
            Layanan &amp; Skrining Calon Pengantin
          </h1>
          <p className="text-[11px] sm:text-sm text-slate-600 dark:text-slate-300 leading-snug sm:leading-relaxed">
            <span className="sm:hidden">
              Pamflet Anemia &amp; KEK, faskes rujukan, serta Kotak Narasi Catin.
            </span>
            <span className="hidden sm:inline">
              Pelajari pamflet pencegahan Anemia &amp; KEK (dapat dilihat &amp; diunduh), temukan
              lokasi fasilitas kesehatan rujukan di Buleleng, serta tuliskan keluhan atau kebutuhan
              skrining Anda melalui Kotak Narasi di bawah ini.
            </span>
          </p>
        </div>

        {onNavigateToQna && (
          <button
            type="button"
            onClick={onNavigateToQna}
            aria-label="Buka Modul QnA Privasi"
            title="Buka Modul QnA Privasi"
            className="min-h-[38px] min-w-[38px] sm:min-h-[42px] px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c162e] hover:border-blue-500 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap"
          >
            <MessageCircle size={15} className="text-blue-600 dark:text-sky-400 shrink-0" />
            <span className="hidden sm:inline">Ada pertanyaan privasi? Buka Modul QnA</span>
          </button>
        )}
      </section>

      {/* 1. PAMFLET EDUKASI INTERAKTIF — Max 3 Cards Per Slide + Top-Right Arrows When > 3 */}
      <section id="catin-pamphlets-section" className="space-y-2.5 sm:space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-base sm:text-xl font-bold font-serif text-slate-900 dark:text-white">
              Pamflet Skrining Catin ({pamphlets.length})
            </h2>
            <p className="hidden sm:block text-xs text-slate-600 dark:text-slate-400">
              Ketuk Lihat Detail untuk membaca penuh atau Unduh Pamflet dalam format poster digital SVG.
            </p>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {isAdminMode && (
              <button
                id="btn-admin-add-pamphlet"
                type="button"
                onClick={() => {
                  setEditingPamphlet(null);
                  setPamphletModalOpen(true);
                }}
                className="min-h-[34px] sm:min-h-[38px] px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} />
                <span className="hidden sm:inline">Tambah Pamflet</span>
                <span className="sm:hidden">Pamflet</span>
              </button>
            )}

            {/* Desktop Top-Right Arrows (shown whenever > 3 pamphlets exist) */}
            {hasOverflowPamphlets && (
              <div className="hidden md:flex items-center gap-1.5">
                <span className="text-xs font-semibold tabular-nums text-slate-500 dark:text-slate-400 mr-1">
                  {safePamphletPage + 1} / {totalPamphletPages}
                </span>
                <button
                  id="btn-pamphlet-prev"
                  type="button"
                  disabled={safePamphletPage === 0}
                  onClick={() => setPamphletPage((p) => clampPamphletPage(p - 1, pamphlets.length, 3))}
                  aria-label="Pamflet sebelumnya"
                  className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c162e] hover:border-blue-600 text-slate-800 dark:text-slate-100 flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  id="btn-pamphlet-next"
                  type="button"
                  disabled={safePamphletPage >= totalPamphletPages - 1}
                  onClick={() => setPamphletPage((p) => clampPamphletPage(p + 1, pamphlets.length, 3))}
                  aria-label="Pamflet berikutnya"
                  className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c162e] hover:border-blue-600 text-slate-800 dark:text-slate-100 flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* Mobile Top-Right Scroll Arrows */}
            {pamphlets.length > 1 && (
              <div className="flex md:hidden items-center gap-1">
                <button
                  type="button"
                  onClick={() => scrollMobilePamphlets(-1)}
                  aria-label="Geser pamflet ke kiri"
                  className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c162e] text-slate-700 dark:text-slate-200 flex items-center justify-center cursor-pointer"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollMobilePamphlets(1)}
                  aria-label="Geser pamflet ke kanan"
                  className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c162e] text-slate-700 dark:text-slate-200 flex items-center justify-center cursor-pointer"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Smooth Horizontal Carousel */}
        <div
          ref={pamphletScrollRef}
          className="flex md:hidden overflow-x-auto snap-x snap-mandatory gap-2.5 pb-1 no-scrollbar"
        >
          {pamphlets.map((pamphlet) => {
            const justDownloaded = downloadedId === pamphlet.id;
            return (
              <article
                key={pamphlet.id}
                id={`catin-pamphlet-mobile-${pamphlet.id}`}
                className="relative w-[64vw] max-w-[235px] shrink-0 snap-start rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] overflow-hidden flex flex-col justify-between shadow-xs"
              >
                {isAdminMode && (
                  <div className="absolute top-2 right-2 z-20 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPamphlet(pamphlet);
                        setPamphletModalOpen(true);
                      }}
                      aria-label={`Edit pamflet ${pamphlet.title}`}
                      className="w-7 h-7 rounded-lg bg-slate-950/80 hover:bg-blue-600 text-white flex items-center justify-center cursor-pointer"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDeletePamphlet(pamphlet)}
                      aria-label={`Hapus pamflet ${pamphlet.title}`}
                      className="w-7 h-7 rounded-lg bg-slate-950/80 hover:bg-rose-600 text-white flex items-center justify-center cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}

                <div>
                  <div className="h-24 w-full overflow-hidden border-b border-slate-200 dark:border-slate-800 relative">
                    <SafeImage src={pamphlet.imageUrl} alt={pamphlet.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/15 to-transparent pointer-events-none" />
                    <div className="absolute bottom-1.5 left-2.5 right-2.5 text-[10px] font-semibold text-sky-200 truncate">
                      {pamphlet.category}
                    </div>
                  </div>

                  <div className="p-2.5 space-y-1">
                    <h3 className="text-xs font-bold font-serif text-slate-900 dark:text-white leading-snug line-clamp-2">
                      {pamphlet.title}
                    </h3>
                    <p className="text-[10px] font-semibold text-blue-700 dark:text-sky-400 line-clamp-1">
                      {pamphlet.subtitle}
                    </p>
                  </div>
                </div>

                <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPreviewPamphlet(pamphlet)}
                    aria-label={`Lihat detail ${pamphlet.title}`}
                    title="Lihat Detail"
                    className="min-h-[34px] px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-100 flex items-center justify-center cursor-pointer"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadPamphlet(pamphlet)}
                    aria-label={`Unduh pamflet ${pamphlet.title}`}
                    title="Unduh Pamflet SVG"
                    className="min-h-[34px] px-2 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center cursor-pointer"
                  >
                    {justDownloaded ? <CheckCircle2 size={14} /> : <Download size={14} />}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* Desktop 3-Column Paginated Slide Grid (never stacks a 4th card onto a new row) */}
        <div className="hidden md:grid md:grid-cols-3 md:gap-5">
          {visibleDesktopPamphlets.map((pamphlet) => {
            const justDownloaded = downloadedId === pamphlet.id;
            return (
              <article
                key={pamphlet.id}
                id={`catin-pamphlet-${pamphlet.id}`}
                className="relative rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] overflow-hidden flex flex-col justify-between shadow-xs"
              >
                {isAdminMode && (
                  <div className="absolute top-3 right-3 z-20 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPamphlet(pamphlet);
                        setPamphletModalOpen(true);
                      }}
                      aria-label={`Edit pamflet ${pamphlet.title}`}
                      className="w-8 h-8 rounded-lg bg-slate-950/80 hover:bg-blue-600 text-white flex items-center justify-center cursor-pointer"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDeletePamphlet(pamphlet)}
                      aria-label={`Hapus pamflet ${pamphlet.title}`}
                      className="w-8 h-8 rounded-lg bg-slate-950/80 hover:bg-rose-600 text-white flex items-center justify-center cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}

                <div>
                  <div className="h-40 w-full overflow-hidden border-b border-slate-200 dark:border-slate-800 relative">
                    <SafeImage src={pamphlet.imageUrl} alt={pamphlet.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/15 to-transparent pointer-events-none" />
                    <div className="absolute bottom-3 left-4 right-4 text-xs font-semibold text-sky-200 truncate">
                      {pamphlet.category}
                    </div>
                  </div>

                  <div className="p-5 space-y-2.5">
                    <h3 className="text-lg font-bold font-serif text-slate-900 dark:text-white leading-snug line-clamp-2">
                      {pamphlet.title}
                    </h3>
                    <p className="text-xs font-semibold text-blue-700 dark:text-sky-400">
                      {pamphlet.subtitle}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                      {pamphlet.summary}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 grid grid-cols-2 gap-2">
                  <button
                    id={`btn-preview-pamphlet-${pamphlet.id}`}
                    type="button"
                    onClick={() => setPreviewPamphlet(pamphlet)}
                    aria-label={`Lihat detail ${pamphlet.title}`}
                    title="Lihat Detail"
                    className="min-h-[42px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-500 text-xs font-semibold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye size={14} />
                    <span>Lihat Detail</span>
                  </button>
                  <button
                    id={`btn-download-pamphlet-${pamphlet.id}`}
                    type="button"
                    onClick={() => handleDownloadPamphlet(pamphlet)}
                    aria-label={`Unduh pamflet ${pamphlet.title}`}
                    title="Unduh Pamflet SVG"
                    className="min-h-[42px] px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {justDownloaded ? <CheckCircle2 size={14} /> : <Download size={14} />}
                    <span>{justDownloaded ? 'Terunduh' : 'Unduh Pamflet'}</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 2. GOLDEN RATIO SPLIT: KOTAK NARASI CATIN (LEFT 61.8%) + LOKASI FASKES (RIGHT 38.2%) */}
      <div className="golden-grid-major items-start">
        {/* Kotak Narasi Catin Form */}
        <section
          id="catin-kotak-narasi-section"
          className="min-w-0 overflow-hidden p-3.5 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] space-y-3.5 sm:space-y-5 shadow-xs"
        >
          <div className="space-y-1">
            <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-sky-400 flex items-center gap-1.5">
              <FileText size={13} />
              <span>Kotak Narasi &amp; Jadwal Skrining</span>
            </div>
            <h2 className="text-base sm:text-2xl font-bold font-serif text-slate-900 dark:text-white leading-snug">
              Kirim Narasi Skrining Catin
            </h2>
            <p className="hidden sm:block text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Ceritakan rencana pernikahan Anda, riwayat keluhan (seperti anemia/lemas, berat badan
              kurang/LILA rendah), atau jadwal pemeriksaan Puskesmas yang diinginkan sebelum registrasi.
            </p>
          </div>

          {latestTicket && (
            <div
              id="catin-narasi-success"
              className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 space-y-2 text-xs sm:text-sm"
            >
              <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 size={17} />
                <span>
                  Narasi Catin Diterima · Nomor Registrasi: {latestTicket.nomorRegistrasi}
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-200">
                Terima kasih <strong>{latestTicket.namaPasangan}</strong>. Tim konselor PKBI &amp;{' '}
                {latestTicket.puskesmasTujuan} siap menindaklanjuti jadwal skrining Anda.
              </p>
              <a
                href={buildWhatsAppUrl(
                  `Salam sehat, saya izin bertanya dan mengonfirmasi pendaftaran Skrining Catin PKBI Buleleng.\nNomor Registrasi: ${latestTicket.nomorRegistrasi}\nPasangan: ${latestTicket.namaPasangan}\nKecamatan: ${latestTicket.kecamatan}\nFaskes: ${latestTicket.puskesmasTujuan}\nNarasi: ${latestTicket.narasiKeluhan}`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 min-h-[38px] px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
              >
                <MessageCircle size={14} />
                <span>Lanjutkan Konfirmasi via WhatsApp</span>
              </a>
            </div>
          )}

          <form onSubmit={handleSubmitNarasi} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
              <div className="min-w-0">
                <label
                  htmlFor="input-catin-nama"
                  className="block text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 truncate"
                >
                  Nama Pasangan <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-catin-nama"
                  type="text"
                  value={namaPasangan}
                  onChange={(e) => setNamaPasangan(e.target.value)}
                  placeholder="Adi & Sari"
                  className="w-full min-w-0 max-w-full min-h-[38px] sm:min-h-[44px] px-2.5 sm:px-3.5 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-blue-600"
                />
                {formErrors.namaPasangan && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">
                    {formErrors.namaPasangan}
                  </p>
                )}
              </div>

              <div className="min-w-0">
                <label
                  htmlFor="input-catin-hp"
                  className="block text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 truncate"
                >
                  No. WhatsApp <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-catin-hp"
                  type="tel"
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  placeholder="081234567890"
                  className="w-full min-w-0 max-w-full min-h-[38px] sm:min-h-[44px] px-2.5 sm:px-3.5 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-blue-600"
                />
                {formErrors.noHp && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">
                    {formErrors.noHp}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
              <div className="min-w-0">
                <label
                  htmlFor="select-catin-kecamatan"
                  className="block text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 truncate"
                >
                  Kecamatan
                </label>
                <select
                  id="select-catin-kecamatan"
                  value={kecamatan}
                  onChange={(e) => setKecamatan(e.target.value)}
                  className="w-full min-w-0 max-w-full truncate min-h-[38px] sm:min-h-[44px] px-2 sm:px-3 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-blue-600"
                >
                  {KECAMATAN_LIST.map((k) => (
                    <option key={k.id} value={k.name}>
                      {k.name.replace('Kecamatan ', '')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-0">
                <label
                  htmlFor="select-catin-faskes"
                  className="block text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 truncate"
                >
                  Faskes Tujuan
                </label>
                <select
                  id="select-catin-faskes"
                  value={puskesmasTujuan}
                  onChange={(e) => setPuskesmasTujuan(e.target.value)}
                  className="w-full min-w-0 max-w-full truncate min-h-[38px] sm:min-h-[44px] px-2 sm:px-3 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-blue-600"
                >
                  {CATIN_HEALTH_FACILITIES.map((f) => (
                    <option key={f.id} value={f.name}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2 sm:col-span-1 min-w-0">
                <label
                  htmlFor="input-catin-date"
                  className="block text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 truncate"
                >
                  Rencana Nikah
                </label>
                <input
                  id="input-catin-date"
                  type="date"
                  value={rencanaTanggalNikah}
                  onChange={(e) => setRencanaTanggalNikah(e.target.value)}
                  className="w-full min-w-0 max-w-full min-h-[38px] sm:min-h-[44px] px-2.5 sm:px-3 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="textarea-catin-narasi"
                className="block text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Kotak Narasi Keluhan / Kebutuhan Skrining <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="textarea-catin-narasi"
                rows={3}
                value={narasiKeluhan}
                onChange={(e) => setNarasiKeluhan(e.target.value)}
                placeholder="Tuliskan keluhan (mis. pusing/anemia, LILA) atau jadwal cek Hb yang diinginkan..."
                className="w-full p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-blue-600 leading-relaxed"
              />
              {formErrors.narasiKeluhan && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">
                  {formErrors.narasiKeluhan}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 pt-0.5">
              <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                Dijaga kerahasiaannya oleh PKBI.
              </span>
              <button
                id="btn-submit-catin-narasi"
                type="submit"
                aria-label="Kirim Narasi dan Jadwalkan Skrining"
                className="min-h-[38px] sm:min-h-[44px] px-3.5 sm:px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
              >
                <Send size={14} />
                <span className="sm:hidden">Kirim</span>
                <span className="hidden sm:inline">Kirim Narasi &amp; Jadwalkan Skrining</span>
              </button>
            </div>
          </form>
        </section>

        {/* Right Rail: Direktori Lokasi Fasilitas Kesehatan Rujukan Catin — Side-by-Side Horizontal Carousel on Mobile */}
        <aside className="min-w-0 overflow-hidden p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm sm:text-lg font-bold font-serif text-slate-900 dark:text-white flex items-center gap-1.5">
                <MapPin size={15} className="text-rose-600 dark:text-rose-400 shrink-0" />
                <span>Lokasi Faskes Catin</span>
              </h2>
              <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">
                Fasilitas kesehatan resmi melayani pemeriksaan Hb, LILA, Triple Eliminasi &amp; Elsimil.
              </p>
            </div>
            <span className="lg:hidden text-[10px] font-semibold text-slate-500 shrink-0">
              Geser →
            </span>
          </div>

          <div className="flex overflow-x-auto snap-x snap-mandatory gap-2.5 pb-1 no-scrollbar lg:block lg:space-y-3 lg:overflow-visible">
            {CATIN_HEALTH_FACILITIES.map((fac) => (
              <div
                key={fac.id}
                className="w-[70vw] max-w-[250px] shrink-0 snap-start lg:w-auto lg:max-w-none p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 space-y-1 text-[11px] sm:text-xs"
              >
                <div className="font-bold text-slate-900 dark:text-white truncate">{fac.name}</div>
                <div className="text-slate-600 dark:text-slate-300 flex items-start gap-1">
                  <MapPin size={11} className="text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{fac.address}</span>
                </div>
                <div className="text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    <span>{fac.hours}</span>
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Phone size={11} />
                    <span>{fac.phone}</span>
                  </span>
                </div>
                <div className="text-[10px] sm:text-[11px] font-medium text-emerald-700 dark:text-emerald-400 line-clamp-1 pt-0.5">
                  {fac.services.join(' · ')}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Fullscreen Pamphlet Detail Modal */}
      {previewPamphlet &&
        (typeof document !== 'undefined'
          ? createPortal(
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="catin-pamphlet-modal-title"
                className="fixed inset-0 z-[75] flex flex-col bg-white dark:bg-[#060c1c] text-slate-900 dark:text-slate-100 overflow-hidden"
              >
                <header
                  className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#070e22]/95 backdrop-blur-md shrink-0"
                  style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
                >
                  <div className="max-w-4xl mx-auto h-14 px-4 sm:px-6 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setPreviewPamphlet(null)}
                      className="min-h-[44px] px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer"
                    >
                      <ArrowLeft size={18} />
                      <span>Kembali</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDownloadPamphlet(previewPamphlet)}
                        className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download size={14} />
                        <span>Unduh Pamflet (SVG)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewPamphlet(null)}
                        aria-label="Tutup pratinjau pamflet"
                        className="min-h-[44px] min-w-[44px] rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                </header>

                <div
                  className="flex-1 overflow-y-auto"
                  style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}
                >
                  <article className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-blue-700 dark:text-sky-400">
                        {previewPamphlet.category} · Project ECCD PKBI Kabupaten Buleleng
                      </div>
                      <h1
                        id="catin-pamphlet-modal-title"
                        className="text-2xl sm:text-4xl font-extrabold font-serif text-slate-900 dark:text-white leading-tight"
                      >
                        {previewPamphlet.title}
                      </h1>
                      <p className="text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300">
                        {previewPamphlet.subtitle}
                      </p>
                    </div>

                    <div className="aspect-golden w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                      <SafeImage src={previewPamphlet.imageUrl} alt={previewPamphlet.title} />
                    </div>

                    <div className="p-4 sm:p-5 rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/75 dark:bg-blue-950/35 text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-relaxed">
                      {previewPamphlet.summary}
                    </div>

                    <section className="space-y-3">
                      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Sparkles size={15} className="text-blue-600 dark:text-sky-400" />
                        <span>Poin Edukasi Wajib Calon Pengantin</span>
                      </h2>
                      <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-200">
                        {previewPamphlet.keyPoints.map((pt, idx) => (
                          <li
                            key={idx}
                            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-start gap-2.5"
                          >
                            <CheckCircle2
                              size={17}
                              className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                            />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </section>

                    <div className="p-4 sm:p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/80 dark:bg-emerald-950/35 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                          Tindak Lanjut yang Disarankan
                        </div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                          {previewPamphlet.recommendedAction}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDownloadPamphlet(previewPamphlet)}
                        className="min-h-[42px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 shrink-0 cursor-pointer"
                      >
                        <Download size={14} />
                        <span>Unduh Poster SVG</span>
                      </button>
                    </div>
                  </article>
                </div>
              </div>,
              document.body
            )
          : null)}

      {/* Admin Pamphlet CRUD Modal (Firebase Firestore) */}
      {isAdminMode && (
        <AdminPamphletModal
          isOpen={pamphletModalOpen}
          editingPamphlet={editingPamphlet}
          onClose={() => {
            setPamphletModalOpen(false);
            setEditingPamphlet(null);
          }}
          onSave={upsertPamphlet}
        />
      )}
    </div>
  );
};
