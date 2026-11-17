import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  ShieldAlert,
  AlertTriangle,
  HeartPulse,
  Video,
  Play,
  Pause,
  Sparkles,
  CheckCircle2,
  MessageCircle,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  X,
  MoveHorizontal,
} from 'lucide-react';
import {
  getEdukasiPenyakitList,
  getVideoEdukasiList,
} from '../../services/dataService';
import { PenyakitSeksualEdu, VideoEdukasi } from '../../types';
import { useAppTheme } from '../../context/ThemeContext';
import { I18N } from '../../constants/i18n';
import { SafeImage } from '../ui/SafeImage';
import { MEDIA_ASSETS } from '../../constants/mediaAssets';
import { buildWhatsAppUrl, WHATSAPP_TEMPLATES } from '../../utils/whatsapp';

const DISEASE_IMAGE_MAP: Record<string, string> = {
  'ims-hiv': MEDIA_ASSETS.skriningCatin,
  'ims-sifilis': MEDIA_ASSETS.posyanduSariMekar,
  'ims-gonore': MEDIA_ASSETS.giziBalitaBali,
  'ims-hpv': MEDIA_ASSETS.edukasiRemaja,
};

const getDiseaseImage = (id: string): string =>
  DISEASE_IMAGE_MAP[id] || MEDIA_ASSETS.edukasiRemaja;

export const EdukasiInteraktifSection: React.FC = () => {
  const { language } = useAppTheme();
  const t = I18N[language];
  const sectionMeta = t.sectionTitles['edukasi-interaktif'];

  const diseases = getEdukasiPenyakitList();
  const videos = getVideoEdukasiList();

  const [activeSubTab, setActiveSubTab] = useState<'penyakit' | 'video'>('penyakit');
  const [activeDiseaseIndex, setActiveDiseaseIndex] = useState<number | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoEdukasi>(videos[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Mobile-only swipe state to switch between Penyakit & Video Pembelajaran
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);

  const handleMobileTouchStart = (e: React.TouchEvent) => {
    if (typeof window === 'undefined' || window.innerWidth >= 1024) return;
    touchStartXRef.current = e.targetTouches[0].clientX;
    touchStartYRef.current = e.targetTouches[0].clientY;
  };

  const handleMobileTouchEnd = (e: React.TouchEvent) => {
    if (typeof window === 'undefined' || window.innerWidth >= 1024) return;
    if (activeDiseaseIndex !== null) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = touchStartXRef.current - endX;
    const diffY = Math.abs(touchStartYRef.current - endY);

    // Trigger only on intentional horizontal swipe (diffX > 65 and stronger than vertical scroll)
    if (Math.abs(diffX) > 65 && Math.abs(diffX) > diffY * 1.4) {
      if (diffX > 0 && activeSubTab === 'penyakit') {
        setActiveSubTab('video');
      } else if (diffX < 0 && activeSubTab === 'video') {
        setActiveSubTab('penyakit');
      }
    }
  };

  const activeDisease: PenyakitSeksualEdu | null =
    activeDiseaseIndex !== null && diseases[activeDiseaseIndex]
      ? diseases[activeDiseaseIndex]
      : null;

  const floatingWaHref = buildWhatsAppUrl(WHATSAPP_TEMPLATES[0].message);

  return (
    <div
      onTouchStart={handleMobileTouchStart}
      onTouchEnd={handleMobileTouchEnd}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 text-slate-900 dark:text-slate-100"
    >
      {/* Top Banner + Sub-Tab Controls */}
      <section className="pb-5 border-b border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
            <HeartPulse size={15} />
            <span>{sectionMeta.kicker}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-slate-900 dark:text-white">
            {sectionMeta.full}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Pilih kartu topik penyakit di bawah untuk membaca artikel klinis lengkap, atau buka video pembelajaran PKBI Buleleng.
          </p>
        </div>

        <div className="space-y-2 self-start lg:self-auto max-w-full">
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 overflow-x-auto no-scrollbar max-w-full">
            <button
              id="tab-edukasi-penyakit"
              type="button"
              onClick={() => setActiveSubTab('penyakit')}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer ${
                activeSubTab === 'penyakit'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldAlert size={16} />
              <span>Artikel Penyakit ({diseases.length})</span>
            </button>

            <button
              id="tab-edukasi-video"
              type="button"
              onClick={() => setActiveSubTab('video')}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer ${
                activeSubTab === 'video'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Video size={16} />
              <span>Video Pembelajaran</span>
            </button>
          </div>

          <p className="lg:hidden text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 px-1">
            <MoveHorizontal size={13} className="text-blue-600 dark:text-sky-400 shrink-0" />
            <span>
              Geser layar ke {activeSubTab === 'penyakit' ? 'kiri untuk Video Pembelajaran' : 'kanan untuk Artikel Penyakit'}
            </span>
          </p>
        </div>
      </section>

      {/* SUBTAB 1: BLOG-STYLE CARD GRID FOR EACH DISEASE */}
      {activeSubTab === 'penyakit' && (
        <div
          id="edukasi-disease-grid"
          className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6"
        >
          {diseases.map((ims, idx) => (
            <button
              key={ims.id}
              id={`card-disease-${ims.id}`}
              type="button"
              onClick={() => setActiveDiseaseIndex(idx)}
              className="group text-left rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] hover:border-blue-600 dark:hover:border-sky-400 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
            >
              <div className="w-full">
                {/* Blog Card Cover Image (Golden Ratio 1.618:1) */}
                <div className="relative aspect-golden w-full overflow-hidden border-b border-slate-200 dark:border-slate-800">
                  <SafeImage
                    src={getDiseaseImage(ims.id)}
                    alt={ims.namaPenyakit}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between gap-2 text-xs text-white">
                    <span className="font-semibold text-rose-200">
                      Tingkat Risiko: {ims.tingkatBahaya}
                    </span>
                    <span className="font-mono text-sky-200">{ims.singkatan}</span>
                  </div>
                </div>

                {/* Editorial Preview Body */}
                <div className="p-5 sm:p-6 space-y-2.5">
                  <div className="text-xs font-semibold text-blue-700 dark:text-sky-400">
                    {ims.kategori}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold font-serif text-slate-900 dark:text-white leading-snug group-hover:text-blue-700 dark:group-hover:text-sky-300 transition-colors">
                    {ims.namaPenyakit}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                    <strong className="text-slate-800 dark:text-slate-100">Penyebab:</strong>{' '}
                    {ims.penyebab}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {ims.skriningPranikah}
                  </p>
                </div>
              </div>

              <div className="px-5 sm:px-6 py-3.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40 flex items-center justify-between text-xs sm:text-sm font-semibold text-blue-700 dark:text-sky-400">
                <span className="flex items-center gap-1.5">
                  <BookOpen size={15} />
                  <span>Baca Detail Lengkap</span>
                </span>
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* SUBTAB 2: VIDEO PEMBELAJARAN (Golden Ratio 1.618fr : 1fr) */}
      {activeSubTab === 'video' && (
        <div id="edukasi-video-panel" className="golden-grid-major items-start">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] p-5 sm:p-6 shadow-sm space-y-4">
            <div className="relative aspect-golden rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
              <SafeImage
                src={selectedVideo.imageUrl}
                alt={selectedVideo.title}
                className="w-full h-full object-cover opacity-75"
              />
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                aria-label={isPlaying ? 'Jeda video' : 'Putar video'}
                className="absolute w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-xl transition-transform hover:scale-105 cursor-pointer"
              >
                {isPlaying ? <Pause size={26} /> : <Play size={26} className="ml-1" />}
              </button>
              <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-slate-950/90 text-white text-xs font-mono tabular-nums">
                {selectedVideo.durasi}
              </span>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-blue-700 dark:text-sky-400">
                {selectedVideo.narasumber} · {selectedVideo.kategori}
              </p>
              <h3 className="text-lg sm:text-xl font-bold font-serif text-slate-900 dark:text-white">
                {selectedVideo.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedVideo.deskripsi}
              </p>
              {isPlaying && (
                <div className="mt-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-sky-200">
                  <strong>Ringkasan Materi:</strong> {selectedVideo.ringkasanPoin.join(' · ')}
                </div>
              )}
            </div>
          </div>

          <aside className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] p-4 sm:p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Video size={14} className="text-blue-600 dark:text-sky-400" />
              <span>Daftar Video Edukasi ({videos.length})</span>
            </h4>

            <div className="space-y-2.5">
              {videos.map((vid) => {
                const isSelected = selectedVideo.id === vid.id;
                return (
                  <button
                    key={vid.id}
                    type="button"
                    onClick={() => {
                      setSelectedVideo(vid);
                      setIsPlaying(false);
                    }}
                    className={`w-full text-left p-3 rounded-2xl border transition-colors cursor-pointer flex gap-3 min-h-[68px] ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-600 dark:border-sky-400'
                        : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                    }`}
                  >
                    <div className="w-24 aspect-golden rounded-xl overflow-hidden bg-slate-900 shrink-0 relative">
                      <SafeImage src={vid.imageUrl} alt={vid.title} />
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-slate-950/85 text-[10px] text-white font-mono">
                        {vid.durasi}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                        {vid.title}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 truncate mt-0.5">
                        {vid.narasumber}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      )}

      {/* FULLSCREEN BLOG-STYLE CLINICAL READER MODAL */}
      {activeDisease &&
        (typeof document !== 'undefined'
          ? createPortal(
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="disease-article-title"
                className="fixed inset-0 z-[75] flex flex-col bg-white dark:bg-[#060c1c] text-slate-900 dark:text-slate-100 overflow-hidden"
              >
          {/* Sticky Reader Top Bar */}
          <header
            className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#070e22]/95 backdrop-blur-md shrink-0"
            style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
          >
            <div className="max-w-4xl mx-auto h-14 px-4 sm:px-6 flex items-center justify-between gap-3">
              <button
                id="btn-close-disease-modal"
                type="button"
                onClick={() => setActiveDiseaseIndex(null)}
                className="min-h-[44px] px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <ArrowLeft size={18} />
                <span>Kembali</span>
              </button>

              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 truncate">
                <span className="font-semibold text-rose-700 dark:text-rose-400">
                  Risiko {activeDisease.tingkatBahaya}
                </span>
                <span>·</span>
                <span>{activeDisease.singkatan}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <a
                  id="btn-wa-disease-modal"
                  href={buildWhatsAppUrl(
                    `Om Swastiastu Tim Konselor PKBI Buleleng. Saya membaca artikel edukasi tentang "${activeDisease.namaPenyakit}" dan ingin berkonsultasi secara rahasia.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[40px] px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <MessageCircle size={14} />
                  <span>Tanya via WA</span>
                </a>

                <button
                  type="button"
                  onClick={() => setActiveDiseaseIndex(null)}
                  aria-label="Tutup artikel penyakit"
                  className="min-h-[44px] min-w-[44px] rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </header>

          {/* Fullscreen Scrollable Clinical Article */}
          <div
            className="flex-1 overflow-y-auto"
            style={{ paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom, 0px))' }}
          >
            <article className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-blue-700 dark:text-sky-400">
                  <span>{activeDisease.kategori}</span>
                  <span>·</span>
                  <span className="text-rose-700 dark:text-rose-400">
                    Tingkat Bahaya: {activeDisease.tingkatBahaya}
                  </span>
                </div>

                <h1
                  id="disease-article-title"
                  className="text-2xl sm:text-4xl font-extrabold font-serif text-slate-900 dark:text-white leading-[1.2]"
                >
                  {activeDisease.namaPenyakit}
                </h1>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Disusun oleh Tim Medis &amp; Konselor PKBI Kabupaten Buleleng · Materi Edukasi Kesehatan Reproduksi
                </p>
              </div>

              <div className="aspect-golden w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                <SafeImage
                  src={getDiseaseImage(activeDisease.id)}
                  alt={activeDisease.namaPenyakit}
                />
              </div>

              {/* Lead Cause Box */}
              <div className="p-4 sm:p-5 rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/80 dark:bg-blue-950/35 text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-relaxed">
                <strong className="text-blue-800 dark:text-sky-300">Penyebab Utama: </strong>
                {activeDisease.penyebab}
              </div>

              {/* Gejala Klinis Pria & Wanita */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <section className="p-4 sm:p-5 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 space-y-2.5">
                  <h2 className="font-bold text-sm text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle size={16} />
                    <span>Gejala Klinis pada Pria</span>
                  </h2>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    {activeDisease.gejalaPria.map((g, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-600 dark:text-rose-400 font-bold">•</span>
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="p-4 sm:p-5 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 space-y-2.5">
                  <h2 className="font-bold text-sm text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle size={16} />
                    <span>Gejala Klinis pada Wanita</span>
                  </h2>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    {activeDisease.gejalaWanita.map((g, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-600 dark:text-rose-400 font-bold">•</span>
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              {/* Cara Penularan */}
              {activeDisease.caraPenularan?.length > 0 && (
                <section className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-2.5">
                  <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                    Jalur &amp; Cara Penularan
                  </h2>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {activeDisease.caraPenularan.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-sky-400 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Pencegahan & Skrining */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <section className="p-4 sm:p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/30 space-y-2.5">
                  <h2 className="font-bold text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 size={16} />
                    <span>Metode Pencegahan</span>
                  </h2>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    {activeDisease.metodePencegahan.map((p, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="p-4 sm:p-5 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/80 dark:bg-blue-950/30 space-y-2.5">
                  <h2 className="font-bold text-sm text-blue-800 dark:text-sky-300 flex items-center gap-1.5">
                    <Sparkles size={16} />
                    <span>Skrining Pranikah &amp; Penanganan</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    {activeDisease.skriningPranikah}
                  </p>
                  <div className="pt-2 border-t border-blue-200 dark:border-blue-800/60 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white">Pengobatan Medis:</strong>{' '}
                    {activeDisease.pengobatan}
                  </div>
                </section>
              </div>

              {/* Mitos vs Fakta */}
              {activeDisease.mitosFakta?.length > 0 && (
                <section className="pt-2 space-y-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Mitos vs Fakta Medis
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeDisease.mitosFakta.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs sm:text-sm space-y-1.5"
                      >
                        <div className="font-semibold text-rose-700 dark:text-rose-300">
                          Mitos: &ldquo;{item.mitos}&rdquo;
                        </div>
                        <div className="text-slate-700 dark:text-slate-200 leading-relaxed">
                          <strong className="text-emerald-700 dark:text-emerald-400">Fakta:</strong>{' '}
                          {item.fakta}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Footer Prev/Next & Direct WhatsApp CTA */}
              <footer className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {activeDiseaseIndex !== null && activeDiseaseIndex > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveDiseaseIndex((prev) =>
                          prev !== null && prev > 0 ? prev - 1 : prev
                        )
                      }
                      className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <ChevronLeft size={16} />
                      <span>Sebelumnya</span>
                    </button>
                  )}
                  {activeDiseaseIndex !== null &&
                    activeDiseaseIndex < diseases.length - 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setActiveDiseaseIndex((prev) =>
                            prev !== null && prev < diseases.length - 1 ? prev + 1 : prev
                          )
                        }
                        className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Berikutnya</span>
                        <ChevronRight size={16} />
                      </button>
                    )}
                </div>

                <a
                  href={buildWhatsAppUrl(
                    `Om Swastiastu Tim PKBI Buleleng. Saya membaca artikel "${activeDisease.namaPenyakit}" dan ingin menanyakan layanan tes / konseling rahasia.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors"
                >
                  <MessageCircle size={16} />
                  <span>Konsultasi via WhatsApp</span>
                </a>
              </footer>
            </article>
          </div>
        </div>,
              document.body
            )
          : null)}

      {/* Floating Direct WhatsApp Trigger */}
      <a
        id="btn-float-qa-edukasi"
        href={floatingWaHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat WhatsApp Konsultasi Rahasia PKBI"
        title="Chat WhatsApp PKBI (Template Konsultasi Rahasia)"
        className="fixed z-40 bottom-20 right-4 lg:bottom-6 lg:right-6 min-h-[52px] min-w-[52px] px-4 rounded-2xl flex items-center justify-center gap-2 text-white shadow-xl transition-transform hover:scale-105 bg-emerald-600 hover:bg-emerald-700"
      >
        <MessageCircle size={20} />
        <span className="text-xs font-semibold hidden sm:inline">Chat WhatsApp</span>
      </a>
    </div>
  );
};
