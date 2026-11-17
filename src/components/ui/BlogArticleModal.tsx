import React from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle2,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { SafeImage } from './SafeImage';
import { buildWhatsAppUrl, WHATSAPP_TEMPLATES } from '../../utils/whatsapp';

export interface BlogArticleData {
  id: string;
  category: string;
  title: string;
  author: string;
  dateText: string;
  location?: string;
  readTime?: string;
  imageUrl: string;
  lead: string;
  bodyParagraphs: string[];
  highlights?: string[];
  participantCount?: number;
}

interface BlogArticleModalProps {
  article: BlogArticleData | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export const BlogArticleModal: React.FC<BlogArticleModalProps> = ({
  article,
  onClose,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
}) => {
  if (!article) return null;

  const waHref = buildWhatsAppUrl(
    `Om Swastiastu Tim PKBI Buleleng. Saya membaca artikel "${article.title}" dan ingin bertanya lebih lanjut.`
  );

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="blog-article-title"
      className="fixed inset-0 z-[75] flex flex-col bg-white dark:bg-[#060c1c] text-slate-900 dark:text-slate-100 overflow-hidden"
    >
      {/* Top Sticky Blogger Reader Bar */}
      <header
        className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#070e22]/95 backdrop-blur-md shrink-0"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="max-w-4xl mx-auto h-14 px-4 sm:px-6 flex items-center justify-between gap-3">
          <button
            id="btn-close-berita-modal"
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
            <span>Kembali</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 truncate">
            <span className="font-semibold text-blue-700 dark:text-sky-400">
              {article.category}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock size={13} />
              <span>{article.readTime || '3 menit baca'}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <a
              href={waHref || buildWhatsAppUrl(WHATSAPP_TEMPLATES[0].message)}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[40px] px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <MessageCircle size={14} />
              <span>Tanya via WA</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup artikel"
              className="min-h-[44px] min-w-[44px] rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Scrollable Article Canvas */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
          {/* Category & Title Header */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-blue-700 dark:text-sky-400">
              <span>{article.category}</span>
              <span>·</span>
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                {article.readTime || '3 menit baca'}
              </span>
            </div>

            <h1
              id="blog-article-title"
              className="text-2xl sm:text-4xl font-extrabold font-serif text-slate-900 dark:text-white leading-[1.2]"
            >
              {article.title}
            </h1>

            {/* Byline */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-900 dark:text-slate-200">
                {article.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-blue-600 dark:text-sky-400" />
                <span>{article.dateText}</span>
              </span>
              {article.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-rose-600 dark:text-rose-400" />
                  <span>{article.location}</span>
                </span>
              )}
              {typeof article.participantCount === 'number' && (
                <span className="flex items-center gap-1.5 tabular-nums">
                  <Users size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span>{article.participantCount} Peserta</span>
                </span>
              )}
            </div>
          </div>

          {/* Golden Ratio Cover Image */}
          <figure className="space-y-2">
            <div className="aspect-golden w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
              <SafeImage src={article.imageUrl} alt={article.title} />
            </div>
            <figcaption className="text-xs text-slate-500 dark:text-slate-400">
              Dokumentasi kegiatan PKBI Kabupaten Buleleng{article.location ? ` · ${article.location}` : ''}.
            </figcaption>
          </figure>

          {/* Editorial Lead Summary */}
          <div className="p-4 sm:p-5 rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/80 dark:bg-blue-950/35 text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-relaxed font-medium">
            {article.lead}
          </div>

          {/* Article Body Paragraphs */}
          <div className="space-y-4 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-[1.75]">
            {article.bodyParagraphs.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          {/* Key Outcomes / Capaian */}
          {article.highlights && article.highlights.length > 0 && (
            <section className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/30 space-y-3">
              <h2 className="text-sm sm:text-base font-bold font-serif text-emerald-900 dark:text-emerald-300">
                Poin Utama &amp; Dampak Kegiatan
              </h2>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                {article.highlights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2
                      size={16}
                      className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Prev / Next Article Navigation */}
          <footer className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {hasPrev && onPrev && (
                <button
                  type="button"
                  onClick={onPrev}
                  className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                  <span>Artikel Sebelumnya</span>
                </button>
              )}
              {hasNext && onNext && (
                <button
                  type="button"
                  onClick={onNext}
                  className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Artikel Berikutnya</span>
                  <ChevronRight size={16} />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold cursor-pointer"
            >
              Selesai Membaca
            </button>
          </footer>
        </article>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
