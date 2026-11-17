import React, { useState } from 'react';
import {
  X,
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  ArrowRight,
  Search,
  Award,
  Clock,
  Play,
  Pause,
  BookOpen,
} from 'lucide-react';
import {
  HIGHLIGHT_WILAYAH_SCROLL,
  PROGRAM_KABUPATEN_BULELENG,
  ProgramKabupatenInfo,
  ProgramHighlightItem,
} from '../../data/programBulelengData';
import { SafeImage } from '../ui/SafeImage';
import { BlogArticleModal, BlogArticleData } from '../ui/BlogArticleModal';

interface ProgramTerlaksanaDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectKecamatan: (kecamatanId: string) => void;
}

const mapProgramToArticle = (prog: ProgramKabupatenInfo): BlogArticleData => ({
  id: prog.id,
  category: prog.kategoriLabel,
  title: prog.title,
  author: 'Tim Program & Pengabdian PKBI Kabupaten Buleleng',
  dateText: prog.periode,
  location: prog.wilayahCakupan,
  readTime: '3 menit baca',
  imageUrl: prog.imageUrl,
  lead: prog.capaianUtama,
  bodyParagraphs: [
    prog.deskripsi,
    `Cakupan penerima manfaat program ini telah menjangkau ${prog.totalPenerimaManfaat} di wilayah ${prog.wilayahCakupan}. Seluruh kegiatan dilaksanakan bersama kader posyandu, tenaga kesehatan Puskesmas, serta tokoh masyarakat setempat.`,
  ],
  highlights: prog.indikatorSukses,
});

export const ProgramTerlaksanaDrawer: React.FC<ProgramTerlaksanaDrawerProps> = ({
  isOpen,
  onClose,
  onSelectKecamatan,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isMarqueePaused, setIsMarqueePaused] = useState(false);
  const [activeArticleIndex, setActiveArticleIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const filteredPrograms = PROGRAM_KABUPATEN_BULELENG.filter((prog) => {
    const matchesCategory = selectedCategory === 'all' || prog.kategori === selectedCategory;
    const matchesSearch =
      prog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prog.wilayahCakupan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prog.deskripsi.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const marqueeItems = [...HIGHLIGHT_WILAYAH_SCROLL, ...HIGHLIGHT_WILAYAH_SCROLL];

  const handleCardClick = (item: ProgramHighlightItem) => {
    onSelectKecamatan(item.kecamatanId);
    onClose();
  };

  const activeArticle =
    activeArticleIndex !== null && filteredPrograms[activeArticleIndex]
      ? mapProgramToArticle(filteredPrograms[activeArticleIndex])
      : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Program Terlaksana dan Jadwal Wilayah Kabupaten Buleleng"
      className="fixed inset-0 z-50 flex justify-end"
    >
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <aside className="relative z-10 w-full max-w-2xl h-full shadow-2xl flex flex-col overflow-hidden bg-slate-50 dark:bg-[#091124] border-l border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-50">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Award size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold font-serif truncate">
                Program Terlaksana &amp; Jadwal Wilayah
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                Kabupaten Buleleng · 9 Kecamatan Sasaran
              </p>
            </div>
          </div>

          <button
            id="btn-close-program-drawer"
            type="button"
            onClick={onClose}
            aria-label="Tutup Panel Program"
            className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-6 pb-8">
          {/* Highlight Marquee */}
          <div className="pt-4 space-y-2.5">
            <div className="px-4 sm:px-6 flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-blue-700 dark:text-sky-400">
                Highlight Jadwal &amp; Dokumentasi Wilayah
              </span>

              <button
                type="button"
                onClick={() => setIsMarqueePaused((p) => !p)}
                className="min-h-[36px] px-2.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {isMarqueePaused ? (
                  <>
                    <Play size={13} className="text-emerald-600 dark:text-emerald-400" />
                    <span>Lanjutkan</span>
                  </>
                ) : (
                  <>
                    <Pause size={13} className="text-amber-600 dark:text-amber-400" />
                    <span>Jeda</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative w-full overflow-hidden py-2 border-y border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40">
              <div
                className="animate-marquee-continuous gap-3 px-4"
                style={{ animationPlayState: isMarqueePaused ? 'paused' : 'running' }}
              >
                {marqueeItems.map((item, index) => (
                  <button
                    key={`${item.id}-${index}`}
                    type="button"
                    onClick={() => handleCardClick(item)}
                    className="w-64 sm:w-72 shrink-0 text-left rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] hover:border-blue-500 transition-colors cursor-pointer shadow-xs"
                  >
                    <div className="relative aspect-golden w-full overflow-hidden">
                      <SafeImage src={item.imageUrl} alt={item.title} />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
                      <div className="absolute bottom-2 left-2.5 right-2.5 text-white text-xs font-medium flex items-center gap-1.5">
                        <Calendar size={12} className="text-sky-300 shrink-0" />
                        <span className="truncate">{item.hariTanggal}</span>
                      </div>
                    </div>

                    <div className="p-3 space-y-1.5">
                      <div className="text-xs font-medium text-blue-700 dark:text-sky-400 truncate">
                        {item.wilayahNama} · {item.status}
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold font-serif text-slate-900 dark:text-white line-clamp-2 leading-snug">
                        {item.title}
                      </h4>
                      <div className="pt-1 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 tabular-nums">
                        <span className="flex items-center gap-1">
                          <Users size={12} className="text-blue-600 dark:text-sky-400" />
                          <span>{item.participants} Warga</span>
                        </span>
                        <span className="font-semibold text-blue-700 dark:text-sky-400">
                          Sorot Peta →
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Program Filter & Cards */}
          <div className="px-4 sm:px-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-bold font-serif text-slate-900 dark:text-white">
                Program Nyata di Kabupaten Buleleng
              </h3>
              <span className="text-xs text-slate-600 dark:text-slate-400 tabular-nums">
                {PROGRAM_KABUPATEN_BULELENG.length} Program · 3.500+ Penerima Manfaat
              </span>
            </div>

            <div className="flex items-center gap-2 px-3.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c162e]">
              <Search size={15} className="text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Cari program (stunting, catin, tejakula)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent outline-none text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Hapus pencarian"
                  className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
              {[
                { id: 'all', label: 'Semua' },
                { id: 'stunting', label: 'Stunting & Balita' },
                { id: 'catin', label: 'Calon Pengantin' },
                { id: 'pangan', label: 'Pangan Lokal' },
                { id: 'kespro', label: 'Kespro & IMS' },
                { id: 'remaja', label: 'Remaja & GenRe' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`min-h-[38px] shrink-0 px-3.5 py-1.5 rounded-xl font-semibold border transition-colors cursor-pointer ${
                    selectedCategory === tab.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-[#0c162e] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="space-y-3.5">
              {filteredPrograms.map((prog, index) => (
                <div
                  key={prog.id}
                  id={`card-prog-${prog.id}`}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] p-4 space-y-3 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-44 aspect-golden sm:aspect-auto sm:h-32 shrink-0 rounded-xl overflow-hidden">
                      <SafeImage src={prog.imageUrl} alt={prog.title} />
                    </div>

                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="text-xs text-blue-700 dark:text-sky-400 font-medium flex items-center gap-1.5 flex-wrap">
                        <span>{prog.kategoriLabel}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                          <Clock size={12} />
                          {prog.periode}
                        </span>
                      </div>

                      <h4 className="text-sm sm:text-base font-bold font-serif text-slate-900 dark:text-white leading-snug">
                        {prog.title}
                      </h4>

                      <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                        <MapPin size={13} className="text-blue-600 dark:text-sky-400 shrink-0" />
                        <span className="truncate">{prog.wilayahCakupan}</span>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                        <strong className="text-blue-700 dark:text-sky-400">Capaian: </strong>
                        {prog.capaianUtama}
                      </p>

                      <div className="space-y-1">
                        {prog.indikatorSukses.slice(0, 2).map((ind, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300"
                          >
                            <CheckCircle2
                              size={13}
                              className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                            />
                            <span>{ind}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveArticleIndex(index)}
                            className="min-h-[40px] px-3.5 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-sky-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <BookOpen size={13} />
                            <span>Baca Artikel</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (prog.kecamatanTargetIds.length > 0) {
                                onSelectKecamatan(prog.kecamatanTargetIds[0]);
                                onClose();
                              }
                            }}
                            className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <MapPin size={13} />
                            <span>Sorot Lokasi</span>
                            <ArrowRight size={13} />
                          </button>
                        </div>

                        <span className="text-xs text-slate-600 dark:text-slate-400 tabular-nums">
                          {prog.totalPenerimaManfaat}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredPrograms.length === 0 && (
                <div className="text-center py-10 text-sm text-slate-500 dark:text-slate-400">
                  Tidak ada program yang sesuai dengan pencarian &ldquo;{searchQuery}&rdquo;.
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      <BlogArticleModal
        article={activeArticle}
        onClose={() => setActiveArticleIndex(null)}
        hasPrev={activeArticleIndex !== null && activeArticleIndex > 0}
        hasNext={activeArticleIndex !== null && activeArticleIndex < filteredPrograms.length - 1}
        onPrev={() =>
          setActiveArticleIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev))
        }
        onNext={() =>
          setActiveArticleIndex((prev) =>
            prev !== null && prev < filteredPrograms.length - 1 ? prev + 1 : prev
          )
        }
      />
    </div>
  );
};
