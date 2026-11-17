import React, { useState, useRef } from 'react';
import {
  TrendingDown,
  TrendingUp,
  Calendar,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Award,
  BookOpen,
  X,
  Layers,
  HeartHandshake,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  DESA_SARI_MEKAR_PROFILE,
  DOKUMENTASI_KEGIATAN_LIST,
} from '../../data/bulelengData';
import { BeritaKegiatanDetail } from '../../types';
import { useAppTheme } from '../../context/ThemeContext';
import { I18N } from '../../constants/i18n';
import { SafeImage } from '../ui/SafeImage';
import { BlogArticleModal, BlogArticleData } from '../ui/BlogArticleModal';

const PENINGKATAN_GIZI_DATA = [
  { bulan: 'Jan', persenCapaianGizi: 32.4, balitaPulih: 24, prevalensiStuntingPct: 17.6 },
  { bulan: 'Feb', persenCapaianGizi: 38.0, balitaPulih: 30, prevalensiStuntingPct: 16.8 },
  { bulan: 'Mar', persenCapaianGizi: 46.5, balitaPulih: 38, prevalensiStuntingPct: 15.4 },
  { bulan: 'Apr', persenCapaianGizi: 54.0, balitaPulih: 45, prevalensiStuntingPct: 14.2 },
  { bulan: 'Mei', persenCapaianGizi: 62.8, balitaPulih: 52, prevalensiStuntingPct: 13.0 },
  { bulan: 'Jun', persenCapaianGizi: 69.5, balitaPulih: 60, prevalensiStuntingPct: 11.9 },
  { bulan: 'Jul', persenCapaianGizi: 75.0, balitaPulih: 66, prevalensiStuntingPct: 10.8 },
  { bulan: 'Agu', persenCapaianGizi: 81.2, balitaPulih: 72, prevalensiStuntingPct: 9.8 },
  { bulan: 'Sep', persenCapaianGizi: 86.4, balitaPulih: 77, prevalensiStuntingPct: 8.9 },
  { bulan: 'Okt', persenCapaianGizi: 90.5, balitaPulih: 81, prevalensiStuntingPct: 8.0 },
  { bulan: 'Nov', persenCapaianGizi: 93.2, balitaPulih: 85, prevalensiStuntingPct: 7.2 },
  { bulan: 'Des', persenCapaianGizi: 95.8, balitaPulih: 88, prevalensiStuntingPct: 6.7 },
];

const mapBeritaToBlogArticle = (item: BeritaKegiatanDetail): BlogArticleData => ({
  id: item.id,
  category: `${item.kategori} · ${item.desaName}`,
  title: item.title,
  author: item.narasumber,
  dateText: `${item.hari}, ${item.tanggal} (${item.waktu})`,
  location: item.lokasi,
  readTime: '3 menit baca',
  imageUrl: item.imageUrl,
  lead: item.ringkasan,
  bodyParagraphs: [
    item.isiBeritaLengkap,
    `Kegiatan yang bertempat di ${item.lokasi} ini dihadiri langsung oleh ${item.pesertaCount} peserta dan kader masyarakat ${item.desaName}, ${item.kecamatanName}. Kolaborasi ini menjadi bagian dari pendampingan berkesinambungan PKBI Kabupaten Buleleng.`,
  ],
  highlights: item.hasilKegiatan,
  participantCount: item.pesertaCount,
});

export const DesaBinaanSection: React.FC = () => {
  const { theme, language } = useAppTheme();
  const isLight = theme === 'light';
  const t = I18N[language];
  const sectionMeta = t.sectionTitles['desa-binaan'];

  const top7Activities = DOKUMENTASI_KEGIATAN_LIST.slice(0, 7);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [activeArticleIndex, setActiveArticleIndex] = useState<number | null>(null);
  const [isMoreModalOpen, setIsMoreModalOpen] = useState<boolean>(false);
  const [chartMode, setChartMode] = useState<'peningkatan' | 'penurunan'>('peningkatan');

  const touchStartXRef = useRef<number>(0);
  const touchEndXRef = useRef<number>(0);

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % top7Activities.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + top7Activities.length) % top7Activities.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartXRef.current - touchEndXRef.current;
    if (diff > 45) {
      handleNextSlide();
    } else if (diff < -45) {
      handlePrevSlide();
    }
  };

  const openArticleById = (id: string) => {
    const idx = DOKUMENTASI_KEGIATAN_LIST.findIndex((doc) => doc.id === id);
    if (idx !== -1) {
      setActiveArticleIndex(idx);
    }
  };

  const currentItem = top7Activities[currentSlideIndex];
  const activeArticle =
    activeArticleIndex !== null && DOKUMENTASI_KEGIATAN_LIST[activeArticleIndex]
      ? mapBeritaToBlogArticle(DOKUMENTASI_KEGIATAN_LIST[activeArticleIndex])
      : null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 sm:space-y-10 text-slate-900 dark:text-slate-100">
      {/* 1. Header Banner & Key Metrics (Golden Ratio 61.8% / 38.2%) */}
      <section className="pb-6 border-b border-slate-200 dark:border-slate-800 space-y-5">
        <div className="golden-grid-major items-end">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-sky-400">
              {sectionMeta.kicker} · {DESA_SARI_MEKAR_PROFILE.kabupaten}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-slate-900 dark:text-white leading-tight">
              {DESA_SARI_MEKAR_PROFILE.name} ({DESA_SARI_MEKAR_PROFILE.kecamatanName})
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              Pusat percontohan penanganan stunting terpadu, program keluarga asuh, dan posyandu integrasi layanan primer di Kabupaten Buleleng.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] shadow-xs">
            <div className="text-center px-1.5">
              <div className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                Prevalensi Akhir
              </div>
              <div className="text-lg sm:text-xl font-bold font-mono tabular-nums text-emerald-700 dark:text-emerald-400 mt-0.5">
                6,7%
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Turun dr 17,6%</div>
            </div>
            <div className="text-center px-1.5 border-x border-slate-200 dark:border-slate-800">
              <div className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                Balita Terpantau
              </div>
              <div className="text-lg sm:text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-0.5">
                284
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">KMS Rutin 100%</div>
            </div>
            <div className="text-center px-1.5">
              <div className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                Orang Tua Asuh
              </div>
              <div className="text-lg sm:text-xl font-bold font-mono tabular-nums text-blue-700 dark:text-sky-400 mt-0.5">
                35
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Mitra Aktif</div>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <span className="font-semibold text-slate-900 dark:text-white">Jaringan Posyandu:</span>{' '}
          {DESA_SARI_MEKAR_PROFILE.posyanduList.join(' · ')}
        </p>
      </section>

      {/* 2. TOP 7 KEGIATAN CAROUSEL (Golden Ratio 1.618fr : 1fr) */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg sm:text-xl font-bold font-serif text-slate-900 dark:text-white">
              Dokumentasi Kegiatan Terkini
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 tabular-nums">
              Artikel {currentSlideIndex + 1} dari {top7Activities.length} · Geser kartu atau gunakan panah navigasi
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-card-prev-left"
              type="button"
              onClick={handlePrevSlide}
              aria-label="Kegiatan Sebelumnya"
              className="min-h-[44px] min-w-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c162e] hover:bg-blue-600 hover:text-white hover:border-blue-600 dark:hover:bg-blue-600 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              id="btn-card-next-right"
              type="button"
              onClick={handleNextSlide}
              aria-label="Kegiatan Selanjutnya"
              className="min-h-[44px] min-w-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c162e] hover:bg-blue-600 hover:text-white hover:border-blue-600 dark:hover:bg-blue-600 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight size={20} />
            </button>
            <button
              id="btn-more-documentation"
              type="button"
              onClick={() => setIsMoreModalOpen(true)}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Layers size={15} />
              <span>Semua Artikel</span>
            </button>
          </div>
        </div>

        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] p-4 sm:p-6 shadow-sm select-none"
        >
          <div className="golden-grid-major items-center">
            {/* MAJOR (61.8%): Golden Aspect Photo */}
            <div className="relative aspect-golden rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <SafeImage src={currentItem.imageUrl} alt={currentItem.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3.5 right-3.5 text-white flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold flex items-center gap-1.5">
                  <Calendar size={14} className="text-sky-300" />
                  <span>
                    {currentItem.hari}, {currentItem.tanggal}
                  </span>
                </span>
                <span className="font-mono text-sky-200">{currentItem.waktu}</span>
              </div>
            </div>

            {/* MINOR (38.2%): Editorial Details */}
            <div className="space-y-4">
              <div className="text-xs font-semibold text-blue-700 dark:text-sky-400">
                {currentItem.kategori} · {currentItem.status}
              </div>

              <h4 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-white leading-snug">
                {currentItem.title}
              </h4>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {currentItem.ringkasan}
              </p>

              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 flex items-center justify-between gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 min-w-0 truncate">
                  <MapPin size={14} className="text-rose-600 dark:text-rose-400 shrink-0" />
                  <span className="truncate">{currentItem.lokasi}</span>
                </span>
                <span className="font-bold text-blue-700 dark:text-sky-400 flex items-center gap-1 shrink-0 tabular-nums">
                  <Users size={14} />
                  <span>{currentItem.pesertaCount} Peserta</span>
                </span>
              </div>

              <div className="pt-1 flex flex-wrap items-center justify-between gap-3">
                <button
                  id={`btn-baca-berita-${currentItem.id}`}
                  type="button"
                  onClick={() => openArticleById(currentItem.id)}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <span>Baca Selengkapnya</span>
                  <BookOpen size={15} />
                </button>

                <div className="flex items-center gap-1.5" aria-label="Indikator slide">
                  {top7Activities.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentSlideIndex(idx)}
                      aria-label={`Lihat kegiatan ${idx + 1}`}
                      className="min-h-[36px] min-w-[20px] flex items-center justify-center cursor-pointer"
                    >
                      <span
                        className={`block h-2 rounded-full transition-all ${
                          idx === currentSlideIndex
                            ? 'w-6 bg-blue-600 dark:bg-sky-400'
                            : 'w-2 bg-slate-300 dark:bg-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. GRAFIK KURVA LENGKUNG EVALUASI PROGRAM */}
      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] p-5 sm:p-7 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-sky-400">
              {chartMode === 'peningkatan' ? (
                <TrendingUp size={15} className="text-emerald-600 dark:text-emerald-400" />
              ) : (
                <TrendingDown size={15} className="text-blue-600 dark:text-sky-400" />
              )}
              <span>Grafik Kurva Evaluasi Program PKBI</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-white">
              {chartMode === 'peningkatan'
                ? 'Kurva Peningkatan Capaian Gizi Balita Sehat'
                : 'Kurva Penurunan Prevalensi Stunting Bulanan'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              {chartMode === 'peningkatan'
                ? 'Status gizi balita penerima PMT meningkat bertahap dari 32,4% hingga 95,8% (88 balita mencapai pertumbuhan KMS hijau).'
                : 'Prevalensi stunting Desa Sari Mekar turun dari 17,6% menjadi 6,7%, melampaui target nasional sebesar 14,0%.'}
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 self-start md:self-auto">
            <button
              id="btn-chart-mode-peningkatan"
              type="button"
              onClick={() => setChartMode('peningkatan')}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                chartMode === 'peningkatan'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp size={14} />
              <span>Peningkatan Gizi</span>
            </button>
            <button
              id="btn-chart-mode-penurunan"
              type="button"
              onClick={() => setChartMode('penurunan')}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                chartMode === 'penurunan'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TrendingDown size={14} />
              <span>Penurunan Stunting</span>
            </button>
          </div>
        </div>

        <div className="w-full h-72 sm:h-96 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'peningkatan' ? (
              <AreaChart
                data={PENINGKATAN_GIZI_DATA}
                margin={{ top: 16, right: 20, left: -10, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="colorGizi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isLight ? '#e2e8f0' : '#1e293b'}
                />
                <XAxis
                  dataKey="bulan"
                  stroke={isLight ? '#64748b' : '#94a3b8'}
                  tick={{ fontSize: 12, fill: isLight ? '#334155' : '#cbd5e1' }}
                />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(val) => `${val}%`}
                  stroke={isLight ? '#64748b' : '#94a3b8'}
                  tick={{ fontSize: 12, fill: isLight ? '#334155' : '#cbd5e1' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isLight ? '#ffffff' : '#0f172a',
                    borderColor: isLight ? '#cbd5e1' : '#334155',
                    borderRadius: '12px',
                    color: isLight ? '#0f172a' : '#f8fafc',
                    fontSize: '12px',
                  }}
                  formatter={(value: unknown, name: unknown) => {
                    if (name === 'persenCapaianGizi')
                      return [`${value}%`, 'Capaian Gizi'];
                    if (name === 'balitaPulih')
                      return [`${value} Balita`, 'Balita Berat Normal'];
                    return [String(value), String(name)];
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={32}
                  wrapperStyle={{ fontSize: '12px', color: isLight ? '#0f172a' : '#f8fafc' }}
                  formatter={(val) =>
                    val === 'persenCapaianGizi' ? 'Capaian Gizi Balita (%)' : val
                  }
                />
                <ReferenceLine
                  y={80}
                  stroke="#059669"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: 'Target 80%',
                    fill: isLight ? '#047857' : '#34d399',
                    fontSize: 11,
                    position: 'insideTopLeft',
                  }}
                />
                <Area
                  type="natural"
                  dataKey="persenCapaianGizi"
                  name="persenCapaianGizi"
                  stroke="#16a34a"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorGizi)"
                  dot={{ r: 4, fill: '#16a34a', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 7, stroke: '#22c55e', strokeWidth: 2 }}
                />
              </AreaChart>
            ) : (
              <AreaChart
                data={PENINGKATAN_GIZI_DATA}
                margin={{ top: 16, right: 20, left: -10, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="colorStunting" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isLight ? '#e2e8f0' : '#1e293b'}
                />
                <XAxis
                  dataKey="bulan"
                  stroke={isLight ? '#64748b' : '#94a3b8'}
                  tick={{ fontSize: 12, fill: isLight ? '#334155' : '#cbd5e1' }}
                />
                <YAxis
                  domain={[0, 22]}
                  tickFormatter={(val) => `${val}%`}
                  stroke={isLight ? '#64748b' : '#94a3b8'}
                  tick={{ fontSize: 12, fill: isLight ? '#334155' : '#cbd5e1' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isLight ? '#ffffff' : '#0f172a',
                    borderColor: isLight ? '#cbd5e1' : '#334155',
                    borderRadius: '12px',
                    color: isLight ? '#0f172a' : '#f8fafc',
                    fontSize: '12px',
                  }}
                  formatter={(value: unknown, name: unknown) => {
                    if (name === 'prevalensiStuntingPct')
                      return [`${value}%`, 'Prevalensi Stunting'];
                    return [String(value), String(name)];
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={32}
                  wrapperStyle={{ fontSize: '12px', color: isLight ? '#0f172a' : '#f8fafc' }}
                  formatter={(val) =>
                    val === 'prevalensiStuntingPct' ? 'Prevalensi Stunting (%)' : val
                  }
                />
                <ReferenceLine
                  y={14}
                  stroke="#e11d48"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  label={{
                    value: 'Target Nasional 14%',
                    fill: isLight ? '#be123c' : '#fb7185',
                    fontSize: 11,
                    position: 'insideTopRight',
                  }}
                />
                <Area
                  type="natural"
                  dataKey="prevalensiStuntingPct"
                  name="prevalensiStuntingPct"
                  stroke="#0284c7"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorStunting)"
                  dot={{ r: 4, fill: '#0284c7', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 7, stroke: '#38bdf8', strokeWidth: 2 }}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Bottom 3-Column Achievement Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 flex items-start gap-3">
            <CheckCircle2 className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" size={18} />
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                95,8% Capaian Pemulihan Gizi
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                88 balita mencapai kurva pertumbuhan KMS hijau optimal berkat PMT rutin.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 flex items-start gap-3">
            <HeartHandshake className="text-blue-600 dark:text-sky-400 mt-0.5 shrink-0" size={18} />
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                35 Orang Tua Asuh Terdaftar
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Mendampingi pemenuhan nutrisi dan pemantauan tumbuh kembang balita.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 flex items-start gap-3">
            <Award className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" size={18} />
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                100% Catin Ter-skrining
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Seluruh calon pengantin Desa Sari Mekar menjalani pemeriksaan pranikah.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ANDROID BOTTOM SHEET / DESKTOP MODAL: SEMUA ARTIKEL KEGIATAN */}
      {isMoreModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-archive-title"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/70 backdrop-blur-sm"
        >
          <div className="w-full sm:max-w-4xl max-h-[88dvh] rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] text-slate-900 dark:text-slate-100 flex flex-col overflow-hidden shadow-2xl">
            <div className="sm:hidden flex justify-center pt-2.5 pb-1">
              <span className="w-10 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>

            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div>
                <h3 id="modal-archive-title" className="text-lg font-bold font-serif text-slate-900 dark:text-white">
                  Arsip Artikel Desa Binaan &amp; Buleleng
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Menampilkan {DOKUMENTASI_KEGIATAN_LIST.length} liputan kegiatan lapangan PKBI
                </p>
              </div>
              <button
                id="btn-close-more-modal"
                type="button"
                onClick={() => setIsMoreModalOpen(false)}
                aria-label="Tutup arsip"
                className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div
              className="p-4 sm:p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4"
              style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
            >
              {DOKUMENTASI_KEGIATAN_LIST.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => openArticleById(doc.id)}
                  className="text-left p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 hover:border-blue-500 dark:hover:border-sky-400 transition-colors cursor-pointer flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2.5 w-full">
                    <div className="aspect-golden rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                      <SafeImage src={doc.imageUrl} alt={doc.title} />
                    </div>
                    <div className="text-xs font-semibold text-blue-700 dark:text-sky-400">
                      {doc.kategori} · {doc.hari}, {doc.tanggal}
                    </div>
                    <h4 className="text-sm font-bold font-serif text-slate-900 dark:text-white leading-snug">
                      {doc.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {doc.ringkasan}
                    </p>
                  </div>

                  <div className="w-full pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400 truncate max-w-[200px]">
                      {doc.lokasi}
                    </span>
                    <span className="text-blue-700 dark:text-sky-400 font-semibold flex items-center gap-1 shrink-0">
                      <span>Baca Artikel</span>
                      <ArrowRight size={13} />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. BLOGGER-STYLE ARTICLE READER MODAL */}
      <BlogArticleModal
        article={activeArticle}
        onClose={() => setActiveArticleIndex(null)}
        hasPrev={activeArticleIndex !== null && activeArticleIndex > 0}
        hasNext={
          activeArticleIndex !== null &&
          activeArticleIndex < DOKUMENTASI_KEGIATAN_LIST.length - 1
        }
        onPrev={() =>
          setActiveArticleIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev))
        }
        onNext={() =>
          setActiveArticleIndex((prev) =>
            prev !== null && prev < DOKUMENTASI_KEGIATAN_LIST.length - 1 ? prev + 1 : prev
          )
        }
      />
    </div>
  );
};
