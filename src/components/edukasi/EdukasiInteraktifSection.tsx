import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  HeartPulse,
  BookOpen,
  Video,
  Image as ImageIcon,
  Play,
  Pause,
  MessageCircle,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ShieldAlert,
  AlertTriangle,
  Sparkles,
  X,
  MoveHorizontal,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import {
  KesproArticleItem,
  KesproInfographicItem,
  PenyakitSeksualEdu,
  VideoEdukasi,
} from '../../types';
import { useAppTheme } from '../../context/ThemeContext';
import { useAdminAuth } from '../../context/AuthContext';
import { useCmsData } from '../../context/CmsContext';
import { I18N } from '../../constants/i18n';
import { SafeImage } from '../ui/SafeImage';
import { MEDIA_ASSETS } from '../../constants/mediaAssets';
import { buildWhatsAppUrl, WHATSAPP_TEMPLATES } from '../../utils/whatsapp';
import {
  extractYouTubeEmbedUrl,
  isDirectVideoUrl,
} from '../../utils/cloudinaryGasHelpers';
import { sanitizeBlogHtml } from '../../utils/htmlSanitizer';
import { AdminContentKind, AdminContentModal } from './AdminContentModal';
import { AdminDiseaseModal } from './AdminDiseaseModal';

const DISEASE_IMAGE_MAP: Record<string, string> = {
  'ims-hiv': MEDIA_ASSETS.skriningCatin,
  'ims-sifilis': MEDIA_ASSETS.posyanduSariMekar,
  'ims-gonore': MEDIA_ASSETS.giziBalitaBali,
  'ims-hpv': MEDIA_ASSETS.edukasiRemaja,
};

const getDiseaseImage = (ims: PenyakitSeksualEdu): string =>
  ims.imageUrl && ims.imageUrl.trim().length > 0
    ? ims.imageUrl
    : DISEASE_IMAGE_MAP[ims.id] || MEDIA_ASSETS.edukasiRemaja;

export const EdukasiInteraktifSection: React.FC = () => {
  const { language } = useAppTheme();
  const { isAdminMode } = useAdminAuth();
  const {
    articles: generalArticles,
    diseases,
    infographics,
    videos,
    upsertArticle,
    removeArticle,
    upsertDisease,
    removeDisease,
    upsertVideo,
    removeVideo,
    upsertInfographic,
    removeInfographic,
  } = useCmsData();
  const t = I18N[language];
  const sectionMeta = t.sectionTitles['edukasi-kespro'];

  const [activeSubTab, setActiveSubTab] = useState<'artikel' | 'galeri'>('artikel');
  const [galleryMode, setGalleryMode] = useState<'video' | 'infografis'>('video');

  const [activeGeneralArticleIndex, setActiveGeneralArticleIndex] = useState<number | null>(null);
  const [activeDiseaseIndex, setActiveDiseaseIndex] = useState<number | null>(null);
  const [activeInfographic, setActiveInfographic] = useState<KesproInfographicItem | null>(null);

  const [selectedVideoId, setSelectedVideoId] = useState<string>(videos[0]?.id || '');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Admin Content CMS Modal states (used only when isAdminMode === true)
  const [cmsModalOpen, setCmsModalOpen] = useState(false);
  const [cmsModalKind, setCmsModalKind] = useState<AdminContentKind>('article');
  const [editingArticle, setEditingArticle] = useState<KesproArticleItem | null>(null);
  const [editingVideo, setEditingVideo] = useState<VideoEdukasi | null>(null);
  const [editingInfographic, setEditingInfographic] = useState<KesproInfographicItem | null>(null);

  const [diseaseModalOpen, setDiseaseModalOpen] = useState(false);
  const [editingDisease, setEditingDisease] = useState<PenyakitSeksualEdu | null>(null);

  useEffect(() => {
    if (videos.length > 0 && !videos.some((v) => v.id === selectedVideoId)) {
      setSelectedVideoId(videos[0].id);
      setIsPlaying(false);
    }
  }, [videos, selectedVideoId]);

  const selectedVideo: VideoEdukasi | null =
    videos.find((v) => v.id === selectedVideoId) || videos[0] || null;

  const openAdminModal = (
    kind: AdminContentKind,
    payload?: {
      article?: KesproArticleItem | null;
      video?: VideoEdukasi | null;
      infographic?: KesproInfographicItem | null;
    }
  ) => {
    setCmsModalKind(kind);
    setEditingArticle(payload?.article || null);
    setEditingVideo(payload?.video || null);
    setEditingInfographic(payload?.infographic || null);
    setCmsModalOpen(true);
  };

  // Mobile-only swipe between Artikel Kespro & Galeri Multimedia
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);

  const handleMobileTouchStart = (e: React.TouchEvent) => {
    if (typeof window === 'undefined' || window.innerWidth >= 1024) return;
    touchStartXRef.current = e.targetTouches[0].clientX;
    touchStartYRef.current = e.targetTouches[0].clientY;
  };

  const handleMobileTouchEnd = (e: React.TouchEvent) => {
    if (typeof window === 'undefined' || window.innerWidth >= 1024) return;
    if (
      activeGeneralArticleIndex !== null ||
      activeDiseaseIndex !== null ||
      activeInfographic !== null
    )
      return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = touchStartXRef.current - endX;
    const diffY = Math.abs(touchStartYRef.current - endY);

    if (Math.abs(diffX) > 65 && Math.abs(diffX) > diffY * 1.4) {
      if (diffX > 0 && activeSubTab === 'artikel') {
        setActiveSubTab('galeri');
      } else if (diffX < 0 && activeSubTab === 'galeri') {
        setActiveSubTab('artikel');
      }
    }
  };

  const activeGeneralArticle: KesproArticleItem | null =
    activeGeneralArticleIndex !== null && generalArticles[activeGeneralArticleIndex]
      ? generalArticles[activeGeneralArticleIndex]
      : null;

  const activeDisease: PenyakitSeksualEdu | null =
    activeDiseaseIndex !== null && diseases[activeDiseaseIndex]
      ? diseases[activeDiseaseIndex]
      : null;

  const floatingWaHref = buildWhatsAppUrl(WHATSAPP_TEMPLATES[0].message);

  return (
    <div
      onTouchStart={handleMobileTouchStart}
      onTouchEnd={handleMobileTouchEnd}
      className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-8 space-y-4 sm:space-y-8 text-slate-900 dark:text-slate-100 overflow-x-clip"
    >
      {/* Top Banner + Sub-Tab Controls */}
      <section className="pb-3.5 sm:pb-5 border-b border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-end justify-between gap-3 sm:gap-4">
        <div className="space-y-1 sm:space-y-2 max-w-2xl">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
            <HeartPulse size={14} />
            <span>{sectionMeta.kicker}</span>
          </div>
          <h1 className="text-lg sm:text-3xl font-extrabold font-serif tracking-tight text-slate-900 dark:text-white leading-tight">
            Edukasi Kesehatan Reproduksi
          </h1>
          <p className="text-[11px] sm:text-sm text-slate-600 dark:text-slate-300 leading-snug sm:leading-relaxed">
            <span className="sm:hidden">
              Ketuk kartu untuk baca penuh atau geser ke Galeri Multimedia.
            </span>
            <span className="hidden sm:inline">
              Pelajari artikel kesehatan reproduksi menyeluruh (higienitas, gizi pra-kehamilan,
              kesiapan mental, dan pencegahan penyakit), atau jelajahi Galeri Multimedia video &amp;
              infografis PKBI Buleleng.
            </span>
          </p>
        </div>

        <div className="space-y-1.5 self-start lg:self-auto max-w-full">
          <div className="flex items-center gap-1 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 overflow-x-auto no-scrollbar max-w-full">
            <button
              id="tab-edukasi-artikel"
              type="button"
              onClick={() => setActiveSubTab('artikel')}
              className={`min-h-[36px] sm:min-h-[44px] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-semibold transition-colors flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
                activeSubTab === 'artikel'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen size={14} />
              <span className="sm:hidden">Artikel ({generalArticles.length + diseases.length})</span>
              <span className="hidden sm:inline">
                Artikel Kespro ({generalArticles.length + diseases.length})
              </span>
            </button>

            <button
              id="tab-edukasi-galeri"
              type="button"
              onClick={() => setActiveSubTab('galeri')}
              className={`min-h-[36px] sm:min-h-[44px] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-semibold transition-colors flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
                activeSubTab === 'galeri'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Video size={14} />
              <span className="sm:hidden">Galeri ({videos.length + infographics.length})</span>
              <span className="hidden sm:inline">
                Galeri Multimedia ({videos.length + infographics.length})
              </span>
            </button>
          </div>

          <p className="lg:hidden text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 px-0.5">
            <MoveHorizontal size={12} className="text-blue-600 dark:text-sky-400 shrink-0" />
            <span>
              Geser {activeSubTab === 'artikel' ? 'kiri → Galeri' : 'kanan → Artikel'}
            </span>
          </p>
        </div>
      </section>

      {/* =================================================================== */}
      {/* SUBTAB 1: ARTIKEL KESPRO GENERAL + KATALOG PENCEGAHAN PENYAKIT      */}
      {/* =================================================================== */}
      {activeSubTab === 'artikel' && (
        <div className="space-y-5 sm:space-y-8">
          {/* Section A: Edukasi Kesehatan Reproduksi General — 2-Col Side-by-Side on Mobile */}
          <section className="space-y-2.5 sm:space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm sm:text-xl font-bold font-serif text-slate-900 dark:text-white">
                  Kesehatan Reproduksi Umum
                </h2>
                <p className="hidden sm:block text-xs text-slate-600 dark:text-slate-400">
                  Ketuk salah satu kartu artikel untuk membaca panduan medis dalam mode baca layar penuh.
                </p>
              </div>
              {isAdminMode && (
                <button
                  id="btn-admin-add-article"
                  type="button"
                  onClick={() => openAdminModal('article')}
                  className="min-h-[36px] px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus size={14} />
                  <span>Tambah Artikel</span>
                </button>
              )}
            </div>

            <div
              id="edukasi-general-grid"
              className="grid grid-cols-2 gap-2.5 sm:gap-6"
            >
              {generalArticles.map((art, idx) => (
                <div
                  key={art.id}
                  id={`card-kespro-${art.id}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveGeneralArticleIndex(idx)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveGeneralArticleIndex(idx);
                    }
                  }}
                  className="group relative min-w-0 w-full text-left rounded-xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] hover:border-blue-600 dark:hover:border-sky-400 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
                >
                  {isAdminMode && (
                    <div
                      className="absolute top-2 right-2 z-20 flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => openAdminModal('article', { article: art })}
                        aria-label={`Edit artikel ${art.title}`}
                        className="w-8 h-8 rounded-lg bg-slate-950/80 hover:bg-blue-600 text-white flex items-center justify-center cursor-pointer"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => void removeArticle(art)}
                        aria-label={`Hapus artikel ${art.title}`}
                        className="w-8 h-8 rounded-lg bg-slate-950/80 hover:bg-rose-600 text-white flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}

                  <div className="w-full min-w-0">
                    <div className="relative h-24 sm:h-44 lg:h-52 w-full overflow-hidden border-b border-slate-200 dark:border-slate-800">
                      <SafeImage
                        src={art.imageUrl}
                        alt={art.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />
                      <div className="absolute bottom-1.5 left-2 right-2 sm:bottom-3 sm:left-4 sm:right-4 flex items-center justify-between gap-1 text-[10px] sm:text-xs text-white">
                        <span className="font-semibold text-sky-200 truncate">{art.category}</span>
                        <span className="hidden sm:inline text-slate-200 shrink-0">{art.readTime}</span>
                      </div>
                    </div>

                    <div className="p-2.5 sm:p-6 space-y-1 sm:space-y-2">
                      <h3 className="text-xs sm:text-xl font-bold font-serif text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-blue-700 dark:group-hover:text-sky-300 transition-colors">
                        {art.title}
                      </h3>
                      <p className="hidden sm:block text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                        {art.summary}
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {art.readTime}
                        <span className="hidden sm:inline"> · {art.author}</span>
                      </p>
                    </div>
                  </div>

                  <div className="hidden sm:flex px-6 py-3.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40 items-center justify-between text-xs sm:text-sm font-semibold text-blue-700 dark:text-sky-400">
                    <span className="flex items-center gap-1.5">
                      <BookOpen size={15} />
                      <span>Baca Panduan Lengkap</span>
                    </span>
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section B: Katalog Pencegahan Penyakit & Skrining IMS — 2-Col Side-by-Side on Mobile */}
          <section className="space-y-2.5 sm:space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm sm:text-xl font-bold font-serif text-slate-900 dark:text-white">
                  Katalog Pencegahan Penyakit (IMS)
                </h2>
                <p className="hidden sm:block text-xs text-slate-600 dark:text-slate-400">
                  Informasi berbasis bukti medis mengenai gejala, jalur penularan, skrining pranikah, dan mitos vs fakta.
                </p>
              </div>
              {isAdminMode && (
                <button
                  id="btn-admin-add-disease"
                  type="button"
                  onClick={() => {
                    setEditingDisease(null);
                    setDiseaseModalOpen(true);
                  }}
                  className="min-h-[36px] px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus size={14} />
                  <span className="hidden sm:inline">Tambah Penyakit IMS</span>
                  <span className="sm:hidden">IMS</span>
                </button>
              )}
            </div>

            <div
              id="edukasi-disease-grid"
              className="grid grid-cols-2 gap-2.5 sm:gap-6"
            >
              {diseases.map((ims, idx) => (
                <div
                  key={ims.id}
                  id={`card-disease-${ims.id}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveDiseaseIndex(idx)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveDiseaseIndex(idx);
                    }
                  }}
                  className="group relative min-w-0 w-full text-left rounded-xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] hover:border-blue-600 dark:hover:border-sky-400 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
                >
                  {isAdminMode && (
                    <div
                      className="absolute top-2 right-2 z-20 flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDisease(ims);
                          setDiseaseModalOpen(true);
                        }}
                        aria-label={`Edit penyakit ${ims.namaPenyakit}`}
                        className="w-8 h-8 rounded-lg bg-slate-950/80 hover:bg-blue-600 text-white flex items-center justify-center cursor-pointer"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          void removeDisease(ims);
                          setActiveDiseaseIndex(null);
                        }}
                        aria-label={`Hapus penyakit ${ims.namaPenyakit}`}
                        className="w-8 h-8 rounded-lg bg-slate-950/80 hover:bg-rose-600 text-white flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}

                  <div className="w-full min-w-0">
                    <div className="relative h-24 sm:h-44 lg:h-52 w-full overflow-hidden border-b border-slate-200 dark:border-slate-800">
                      <SafeImage
                        src={getDiseaseImage(ims)}
                        alt={ims.namaPenyakit}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />
                      <div className="absolute bottom-1.5 left-2 right-2 sm:bottom-3 sm:left-4 sm:right-4 flex items-center justify-between gap-1 text-[10px] sm:text-xs text-white">
                        <span className="font-semibold text-rose-200 truncate">
                          {ims.tingkatBahaya}
                        </span>
                        <span className="font-mono text-sky-200 shrink-0">{ims.singkatan}</span>
                      </div>
                    </div>

                    <div className="p-2.5 sm:p-6 space-y-1 sm:space-y-2">
                      <div className="hidden sm:block text-xs font-semibold text-blue-700 dark:text-sky-400">
                        {ims.kategori}
                      </div>
                      <h3 className="text-xs sm:text-xl font-bold font-serif text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-blue-700 dark:group-hover:text-sky-300 transition-colors">
                        {ims.namaPenyakit}
                      </h3>
                      <p className="hidden sm:block text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                        <strong className="text-slate-800 dark:text-slate-100">Penyebab:</strong>{' '}
                        {ims.penyebab}
                      </p>
                    </div>
                  </div>

                  <div className="hidden sm:flex px-6 py-3.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40 items-center justify-between text-xs sm:text-sm font-semibold text-blue-700 dark:text-sky-400">
                    <span className="flex items-center gap-1.5">
                      <ShieldAlert size={15} />
                      <span>Baca Detail Klinis</span>
                    </span>
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* =================================================================== */}
      {/* SUBTAB 2: GALERI MULTIMEDIA (VIDEO EDUKASI + FOTO & INFOGRAFIS)    */}
      {/* =================================================================== */}
      {activeSubTab === 'galeri' && (
        <div id="edukasi-galeri-panel" className="space-y-3.5 sm:space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                id="btn-gallery-mode-video"
                type="button"
                onClick={() => setGalleryMode('video')}
                className={`min-h-[34px] sm:min-h-[40px] px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold border flex items-center gap-1.5 cursor-pointer ${
                  galleryMode === 'video'
                    ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 border-slate-900 dark:border-sky-400'
                    : 'bg-white dark:bg-[#0c162e] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Video size={13} />
                <span>Video ({videos.length})</span>
              </button>

              <button
                id="btn-gallery-mode-infografis"
                type="button"
                onClick={() => setGalleryMode('infografis')}
                className={`min-h-[34px] sm:min-h-[40px] px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold border flex items-center gap-1.5 cursor-pointer ${
                  galleryMode === 'infografis'
                    ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 border-slate-900 dark:border-sky-400'
                    : 'bg-white dark:bg-[#0c162e] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                }`}
              >
                <ImageIcon size={13} />
                <span>Infografis ({infographics.length})</span>
              </button>
            </div>

            {isAdminMode && (
              <button
                id={galleryMode === 'video' ? 'btn-admin-add-video' : 'btn-admin-add-infographic'}
                type="button"
                onClick={() =>
                  openAdminModal(galleryMode === 'video' ? 'video' : 'infographic')
                }
                className="min-h-[36px] px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} />
                <span>{galleryMode === 'video' ? 'Tambah Video' : 'Tambah Infografis'}</span>
              </button>
            )}
          </div>

          {galleryMode === 'video' ? (
            selectedVideo ? (
              <div id="edukasi-video-panel" className="golden-grid-major items-start">
                {/* Compact Scaled Video Preview / Real Cloudinary MP4 or YouTube Player */}
                <div className="rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] p-3 sm:p-6 shadow-sm space-y-2.5 sm:space-y-4">
                  <div className="relative h-44 sm:h-auto sm:aspect-golden rounded-xl sm:rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                    {isPlaying && isDirectVideoUrl(selectedVideo.videoUrl) ? (
                      <video
                        key={selectedVideo.videoUrl}
                        src={selectedVideo.videoUrl}
                        poster={selectedVideo.imageUrl}
                        controls
                        autoPlay
                        className="w-full h-full object-contain bg-black"
                      />
                    ) : isPlaying && extractYouTubeEmbedUrl(selectedVideo.videoUrl) ? (
                      <iframe
                        key={selectedVideo.videoUrl}
                        src={extractYouTubeEmbedUrl(selectedVideo.videoUrl) || ''}
                        title={selectedVideo.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    ) : (
                      <>
                        <SafeImage
                          src={selectedVideo.imageUrl}
                          alt={selectedVideo.title}
                          className="w-full h-full object-cover opacity-75"
                        />
                        <button
                          type="button"
                          onClick={() => setIsPlaying((p) => !p)}
                          aria-label={isPlaying ? 'Jeda video' : 'Putar video'}
                          className="absolute w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-xl transition-transform hover:scale-105 cursor-pointer"
                        >
                          {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                        </button>
                        <span className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg bg-slate-950/90 text-white text-[10px] sm:text-xs font-mono tabular-nums">
                          {selectedVideo.durasi}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="space-y-1 sm:space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[11px] sm:text-xs font-semibold text-blue-700 dark:text-sky-400 truncate">
                        {selectedVideo.narasumber} · {selectedVideo.kategori}
                      </p>
                      {isAdminMode && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => openAdminModal('video', { video: selectedVideo })}
                            aria-label={`Edit video ${selectedVideo.title}`}
                            className="px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-sky-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Pencil size={12} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => void removeVideo(selectedVideo)}
                            aria-label={`Hapus video ${selectedVideo.title}`}
                            className="px-2 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 size={12} />
                            <span>Hapus</span>
                          </button>
                        </div>
                      )}
                    </div>
                    <h3 className="text-sm sm:text-xl font-bold font-serif text-slate-900 dark:text-white leading-snug">
                      {selectedVideo.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2 sm:line-clamp-none">
                      {selectedVideo.deskripsi}
                    </p>
                    {isPlaying && (
                      <div className="mt-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-sky-200 space-y-1">
                        <div className="font-bold">Poin Materi Video:</div>
                        <ul className="space-y-0.5">
                          {selectedVideo.ringkasanPoin.map((pt, i) => (
                            <li key={i}>• {pt}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Horizontal Side-by-Side Video Playlist on Mobile, Stacked Rail on Desktop */}
                <aside className="rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] p-3 sm:p-5 shadow-xs space-y-2.5 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <Video size={13} className="text-blue-600 dark:text-sky-400" />
                      <span>Daftar Video ({videos.length})</span>
                    </h4>
                    <span className="lg:hidden text-[10px] font-semibold text-slate-500">Geser →</span>
                  </div>

                  <div className="flex overflow-x-auto snap-x snap-mandatory gap-2 pb-1 no-scrollbar lg:block lg:space-y-2.5 lg:overflow-visible">
                    {videos.map((vid) => {
                      const isSelected = selectedVideo.id === vid.id;
                      return (
                        <button
                          key={vid.id}
                          type="button"
                          onClick={() => {
                            setSelectedVideoId(vid.id);
                            setIsPlaying(false);
                          }}
                          className={`w-[56vw] max-w-[195px] shrink-0 snap-start lg:w-full lg:max-w-none text-left p-2 sm:p-3 rounded-xl sm:rounded-2xl border transition-colors cursor-pointer flex flex-col lg:flex-row gap-2 sm:gap-3 ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-600 dark:border-sky-400'
                              : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                          }`}
                        >
                          <div className="w-full h-20 lg:w-24 lg:h-auto lg:aspect-golden rounded-lg sm:rounded-xl overflow-hidden bg-slate-900 shrink-0 relative">
                            <SafeImage src={vid.imageUrl} alt={vid.title} />
                            <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-slate-950/85 text-[9px] sm:text-[10px] text-white font-mono">
                              {vid.durasi}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[11px] sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                              {vid.title}
                            </div>
                            <div className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 truncate mt-0.5">
                              {vid.narasumber}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </aside>
              </div>
            ) : (
              <div className="p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500">
                Belum ada video edukasi tersedia.
              </div>
            )
          ) : (
            <div
              id="edukasi-infografis-grid"
              className="grid grid-cols-2 gap-2.5 sm:gap-5"
            >
              {infographics.map((info) => (
                <div
                  key={info.id}
                  id={`card-infografis-${info.id}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveInfographic(info)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveInfographic(info);
                    }
                  }}
                  className="group relative text-left rounded-xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] hover:border-blue-600 dark:hover:border-sky-400 overflow-hidden shadow-xs flex flex-col justify-between cursor-pointer"
                >
                  {isAdminMode && (
                    <div
                      className="absolute top-2 right-2 z-20 flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => openAdminModal('infographic', { infographic: info })}
                        aria-label={`Edit infografis ${info.title}`}
                        className="w-8 h-8 rounded-lg bg-slate-950/80 hover:bg-blue-600 text-white flex items-center justify-center cursor-pointer"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => void removeInfographic(info)}
                        aria-label={`Hapus infografis ${info.title}`}
                        className="w-8 h-8 rounded-lg bg-slate-950/80 hover:bg-rose-600 text-white flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}

                  <div>
                    <div className="h-24 sm:h-44 lg:h-52 w-full overflow-hidden border-b border-slate-200 dark:border-slate-800 relative">
                      <SafeImage
                        src={info.imageUrl}
                        alt={info.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="p-2.5 sm:p-5 space-y-1 sm:space-y-2">
                      <div className="text-[10px] sm:text-xs font-semibold text-blue-700 dark:text-sky-400 truncate">
                        {info.category}
                      </div>
                      <h3 className="text-xs sm:text-lg font-bold font-serif text-slate-900 dark:text-white leading-snug line-clamp-2">
                        {info.title}
                      </h3>
                      <p className="hidden sm:block text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                        {info.caption}
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:flex px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 items-center justify-between text-xs font-semibold text-blue-700 dark:text-sky-400">
                    <span className="flex items-center gap-1.5">
                      <ImageIcon size={14} />
                      <span>Perbesar Foto &amp; Infografis</span>
                    </span>
                    <ArrowRight size={15} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* FULLSCREEN READER 1: ARTIKEL KESPRO GENERAL                         */}
      {/* =================================================================== */}
      {activeGeneralArticle &&
        (typeof document !== 'undefined'
          ? createPortal(
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="kespro-article-title"
                className="fixed inset-0 z-[75] flex flex-col bg-white dark:bg-[#060c1c] text-slate-900 dark:text-slate-100 overflow-hidden"
              >
                <header
                  className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#070e22]/95 backdrop-blur-md shrink-0"
                  style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
                >
                  <div className="max-w-4xl mx-auto h-14 px-4 sm:px-6 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveGeneralArticleIndex(null)}
                      className="min-h-[44px] px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer"
                    >
                      <ArrowLeft size={18} />
                      <span>Kembali</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={buildWhatsAppUrl(
                          `Salam sehat, saya izin bertanya terkait artikel "${activeGeneralArticle.title}" bersama Tim PKBI Buleleng.`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[40px] px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <MessageCircle size={14} />
                        <span>Tanya via WA</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => setActiveGeneralArticleIndex(null)}
                        aria-label="Tutup artikel kespro"
                        className="min-h-[44px] min-w-[44px] rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                </header>

                <div
                  className="flex-1 overflow-y-auto"
                  style={{ paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom, 0px))' }}
                >
                  <article className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
                    <div className="space-y-2.5">
                      <div className="text-xs font-semibold text-blue-700 dark:text-sky-400">
                        {activeGeneralArticle.category} · {activeGeneralArticle.readTime}
                      </div>
                      <h1
                        id="kespro-article-title"
                        className="text-2xl sm:text-4xl font-extrabold font-serif text-slate-900 dark:text-white leading-[1.2]"
                      >
                        {activeGeneralArticle.title}
                      </h1>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                        {activeGeneralArticle.author} · {activeGeneralArticle.dateText}
                      </p>
                    </div>

                    <div className="aspect-golden w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                      <SafeImage
                        src={activeGeneralArticle.imageUrl}
                        alt={activeGeneralArticle.title}
                      />
                    </div>

                    <div className="p-4 sm:p-5 rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/75 dark:bg-blue-950/35 text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-relaxed font-medium">
                      {activeGeneralArticle.summary}
                    </div>

                    {activeGeneralArticle.contentMode === 'html' &&
                    activeGeneralArticle.customHtml &&
                    activeGeneralArticle.customHtml.trim() ? (
                      <div
                        className="blog-custom-html text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-[1.75] space-y-4 overflow-x-auto [&_img]:max-w-full [&_img]:rounded-2xl [&_a]:text-blue-600 dark:[&_a]:text-sky-400 [&_table]:w-full [&_table]:border-collapse"
                        dangerouslySetInnerHTML={{
                          __html: sanitizeBlogHtml(activeGeneralArticle.customHtml),
                        }}
                      />
                    ) : (
                      <div className="space-y-4 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-[1.75]">
                        {activeGeneralArticle.bodyParagraphs.map((para, i) => (
                          <p key={i}>{para}</p>
                        ))}
                      </div>
                    )}

                    <section className="p-4 sm:p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/70 dark:bg-emerald-950/30 space-y-2.5">
                      <h2 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                        Poin Penting &amp; Kebiasaan Sehat Harian
                      </h2>
                      <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                        {[...activeGeneralArticle.keyTakeaways, ...activeGeneralArticle.checklist].map(
                          (item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2
                                size={16}
                                className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                              />
                              <span>{item}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </section>

                    {activeGeneralArticle.sourceLink && (
                      <a
                        href={activeGeneralArticle.sourceLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-sky-300 text-xs sm:text-sm font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        <ExternalLink size={15} />
                        <span>Buka Tautan Referensi</span>
                      </a>
                    )}

                    <footer className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {activeGeneralArticleIndex !== null && activeGeneralArticleIndex > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              setActiveGeneralArticleIndex((p) => (p !== null && p > 0 ? p - 1 : p))
                            }
                            className="min-h-[42px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                          >
                            <ChevronLeft size={15} />
                            <span>Sebelumnya</span>
                          </button>
                        )}
                        {activeGeneralArticleIndex !== null &&
                          activeGeneralArticleIndex < generalArticles.length - 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setActiveGeneralArticleIndex((p) =>
                                  p !== null && p < generalArticles.length - 1 ? p + 1 : p
                                )
                              }
                              className="min-h-[42px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>Berikutnya</span>
                              <ChevronRight size={15} />
                            </button>
                          )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveGeneralArticleIndex(null)}
                        className="min-h-[42px] px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
                      >
                        Selesai Membaca
                      </button>
                    </footer>
                  </article>
                </div>
              </div>,
              document.body
            )
          : null)}

      {/* =================================================================== */}
      {/* FULLSCREEN READER 2: KATALOG PENYAKIT (IMS)                         */}
      {/* =================================================================== */}
      {activeDisease &&
        (typeof document !== 'undefined'
          ? createPortal(
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="disease-article-title"
                className="fixed inset-0 z-[75] flex flex-col bg-white dark:bg-[#060c1c] text-slate-900 dark:text-slate-100 overflow-hidden"
              >
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

                    <div className="flex items-center gap-1.5">
                      <a
                        id="btn-wa-disease-modal"
                        href={buildWhatsAppUrl(
                          `Salam sehat, saya izin bertanya secara rahasia terkait artikel edukasi "${activeDisease.namaPenyakit}" bersama Tim Konselor PKBI Buleleng.`
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
                    </div>

                    <div className="aspect-golden w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                      <SafeImage
                        src={getDiseaseImage(activeDisease)}
                        alt={activeDisease.namaPenyakit}
                      />
                    </div>

                    <div className="p-4 sm:p-5 rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/80 dark:bg-blue-950/35 text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-relaxed">
                      <strong className="text-blue-800 dark:text-sky-300">Penyebab Utama: </strong>
                      {activeDisease.penyebab}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <section className="p-4 sm:p-5 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 space-y-2.5">
                        <h2 className="font-bold text-sm text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                          <AlertTriangle size={16} />
                          <span>Gejala Klinis pada Pria</span>
                        </h2>
                        <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                          {activeDisease.gejalaPria.map((g, i) => (
                            <li key={i}>• {g}</li>
                          ))}
                        </ul>
                      </section>

                      <section className="p-4 sm:p-5 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 space-y-2.5">
                        <h2 className="font-bold text-sm text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                          <AlertTriangle size={16} />
                          <span>Gejala Klinis pada Wanita</span>
                        </h2>
                        <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                          {activeDisease.gejalaWanita.map((g, i) => (
                            <li key={i}>• {g}</li>
                          ))}
                        </ul>
                      </section>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <section className="p-4 sm:p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/30 space-y-2.5">
                        <h2 className="font-bold text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 size={16} />
                          <span>Metode Pencegahan</span>
                        </h2>
                        <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                          {activeDisease.metodePencegahan.map((p, i) => (
                            <li key={i}>• {p}</li>
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
                        <p className="text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-blue-200 dark:border-blue-800">
                          <strong>Pengobatan:</strong> {activeDisease.pengobatan}
                        </p>
                      </section>
                    </div>
                  </article>
                </div>
              </div>,
              document.body
            )
          : null)}

      {/* =================================================================== */}
      {/* FULLSCREEN LIGHTBOX 3: FOTO & INFOGRAFIS                            */}
      {/* =================================================================== */}
      {activeInfographic &&
        (typeof document !== 'undefined'
          ? createPortal(
              <div
                role="dialog"
                aria-modal="true"
                aria-label={activeInfographic.title}
                className="fixed inset-0 z-[75] flex flex-col bg-slate-950/95 text-white overflow-hidden"
              >
                <header
                  className="border-b border-slate-800 bg-slate-950 shrink-0"
                  style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
                >
                  <div className="max-w-5xl mx-auto h-14 px-4 sm:px-6 flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-sky-400">
                      {activeInfographic.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveInfographic(null)}
                      aria-label="Tutup lightbox infografis"
                      className="min-h-[44px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <X size={16} />
                      <span>Tutup</span>
                    </button>
                  </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center">
                  <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
                    <div className="lg:col-span-3 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900">
                      <SafeImage
                        src={activeInfographic.imageUrl}
                        alt={activeInfographic.title}
                      />
                    </div>
                    <div className="lg:col-span-2 space-y-4">
                      <h2 className="text-xl sm:text-2xl font-bold font-serif">
                        {activeInfographic.title}
                      </h2>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {activeInfographic.caption}
                      </p>
                      <ul className="space-y-2 text-xs sm:text-sm text-slate-200">
                        {activeInfographic.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                      {activeInfographic.linkUrl && (
                        <a
                          href={activeInfographic.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs sm:text-sm font-bold transition-colors"
                        >
                          <ExternalLink size={15} />
                          <span>Buka Tautan Referensi</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>,
              document.body
            )
          : null)}

      {/* Admin CMS Content Modals (Articles / Videos / Infographics / IMS Diseases) */}
      {isAdminMode && (
        <>
          <AdminContentModal
            isOpen={cmsModalOpen}
            kind={cmsModalKind}
            editingArticle={editingArticle}
            editingVideo={editingVideo}
            editingInfographic={editingInfographic}
            onClose={() => {
              setCmsModalOpen(false);
              setEditingArticle(null);
              setEditingVideo(null);
              setEditingInfographic(null);
            }}
            onSaveArticle={upsertArticle}
            onSaveVideo={upsertVideo}
            onSaveInfographic={upsertInfographic}
          />
          <AdminDiseaseModal
            isOpen={diseaseModalOpen}
            editingDisease={editingDisease}
            onClose={() => {
              setDiseaseModalOpen(false);
              setEditingDisease(null);
            }}
            onSave={upsertDisease}
          />
        </>
      )}

      {/* Floating Direct WhatsApp Trigger — Compact Square Icon on Mobile */}
      <a
        id="btn-float-qa-edukasi"
        href={floatingWaHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat WhatsApp Konsultasi Rahasia PKBI"
        title="Chat WhatsApp Konsultasi"
        className="fixed z-40 bottom-20 right-3.5 lg:bottom-6 lg:right-6 w-11 h-11 sm:w-auto sm:min-h-[48px] sm:px-4 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 text-white shadow-xl transition-transform hover:scale-105 bg-emerald-600 hover:bg-emerald-700"
      >
        <MessageCircle size={19} />
        <span className="text-xs font-semibold hidden sm:inline">Chat WhatsApp</span>
      </a>
    </div>
  );
};
