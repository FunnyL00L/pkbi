import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  HeartHandshake,
  Users,
  Baby,
  Calendar,
  BookOpen,
  ArrowRight,
  MessageSquareHeart,
  Eye,
  X,
  Maximize2,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import {
  getDesaSariMekarProfile,
} from '../../services/dataService';
import {
  BeritaKegiatanDetail,
  HarmonyFosterFamily,
  HarmonyPosyanduActivity,
  HarmonyYouthActivity,
} from '../../types';
import { BlogArticleModal, BlogArticleData } from '../ui/BlogArticleModal';
import { SafeImage } from '../ui/SafeImage';
import { useAppTheme } from '../../context/ThemeContext';
import { useAdminAuth } from '../../context/AuthContext';
import { useCmsData } from '../../context/CmsContext';
import { I18N } from '../../constants/i18n';
import {
  ADMIN_RELAWAN_NAME,
  summarizeChildGrowth,
} from '../../utils/childGrowthHelpers';
import { analyzeChildMonthlyZScores, formatZScore } from '../../utils/whoZScore';
import { youthActivityToBlogArticle } from '../../utils/pamphletSliderHelpers';
import { ChildGrowthCurveModal } from './ChildGrowthCurveModal';
import { AdminFosterFamilyModal } from './AdminFosterFamilyModal';
import { AdminPosyanduModal } from './AdminPosyanduModal';
import { AdminPosyanduArticleModal } from './AdminPosyanduArticleModal';
import { AdminYouthArticleModal } from './AdminYouthArticleModal';

interface DesaHarmonySectionProps {
  onNavigateToQna?: () => void;
}

type HarmonyPillarFilter = 'all' | 'keluarga-asuh' | 'posyandu' | 'remaja';

export const DesaHarmonySection: React.FC<DesaHarmonySectionProps> = ({
  onNavigateToQna,
}) => {
  const { theme, language } = useAppTheme();
  const { isAdminMode } = useAdminAuth();
  const {
    fosterFamilies,
    posyanduList,
    posyanduArticles,
    youthArticles,
    upsertFosterFamily,
    removeFosterFamily,
    upsertPosyandu,
    removePosyandu,
    upsertPosyanduArticle,
    removePosyanduArticle,
    upsertYouthArticle,
    removeYouthArticle,
  } = useCmsData();
  const t = I18N[language];
  const sectionMeta = t.sectionTitles['desa-harmony'];
  const isDark = theme === 'dark';

  const profile = getDesaSariMekarProfile();
  const articles = posyanduArticles;

  const [activePillar, setActivePillar] = useState<HarmonyPillarFilter>('all');
  const [activeArticleIndex, setActiveArticleIndex] = useState<number | null>(null);
  const [activeYouthBlogIndex, setActiveYouthBlogIndex] = useState<number | null>(null);
  const [expandedChildFamilyId, setExpandedChildFamilyId] = useState<string | null>(null);
  const [detailFamily, setDetailFamily] = useState<HarmonyFosterFamily | null>(null);
  const [detailPosyandu, setDetailPosyandu] = useState<HarmonyPosyanduActivity | null>(null);

  // Admin CRUD modal states (rendered only when isAdminMode === true)
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminModalCategory, setAdminModalCategory] = useState<'stunting' | 'ibu-hamil-kek'>('stunting');
  const [editingFamily, setEditingFamily] = useState<HarmonyFosterFamily | null>(null);

  const [posyanduModalOpen, setPosyanduModalOpen] = useState(false);
  const [editingPosyandu, setEditingPosyandu] = useState<HarmonyPosyanduActivity | null>(null);

  const [posyanduArticleModalOpen, setPosyanduArticleModalOpen] = useState(false);
  const [editingPosyanduArticle, setEditingPosyanduArticle] = useState<BeritaKegiatanDetail | null>(null);

  const [youthModalOpen, setYouthModalOpen] = useState(false);
  const [editingYouth, setEditingYouth] = useState<HarmonyYouthActivity | null>(null);

  const stuntingFamilies = useMemo(
    () => fosterFamilies.filter((f) => f.category === 'stunting'),
    [fosterFamilies]
  );
  const kekFamilies = useMemo(
    () => fosterFamilies.filter((f) => f.category === 'ibu-hamil-kek'),
    [fosterFamilies]
  );

  const totalYouthParticipants = useMemo(
    () => youthArticles.reduce((sum, item) => sum + (Number(item.participantCount) || 0), 0),
    [youthArticles]
  );

  const expandedChildFamily = useMemo(
    () =>
      expandedChildFamilyId
        ? fosterFamilies.find((f) => f.id === expandedChildFamilyId) || null
        : null,
    [expandedChildFamilyId, fosterFamilies]
  );

  const handleAdminDeleteFamily = async (family: HarmonyFosterFamily) => {
    await removeFosterFamily(family);
    if (expandedChildFamilyId === family.id) setExpandedChildFamilyId(null);
    if (detailFamily?.id === family.id) setDetailFamily(null);
  };

  const handleAdminDeletePosyandu = async (item: HarmonyPosyanduActivity) => {
    await removePosyandu(item);
    if (detailPosyandu?.id === item.id) setDetailPosyandu(null);
  };

  const handleAdminDeletePosyanduArticle = async (item: BeritaKegiatanDetail) => {
    await removePosyanduArticle(item);
    setActiveArticleIndex(null);
  };

  const handleAdminDeleteYouth = async (item: HarmonyYouthActivity) => {
    await removeYouthArticle(item);
    setActiveYouthBlogIndex(null);
  };

  const activeArticle: BlogArticleData | null =
    activeYouthBlogIndex !== null && youthArticles[activeYouthBlogIndex]
      ? youthActivityToBlogArticle(youthArticles[activeYouthBlogIndex])
      : activeArticleIndex !== null && articles[activeArticleIndex]
        ? {
            id: articles[activeArticleIndex].id,
            category: `${articles[activeArticleIndex].kategori} · Desa Harmony`,
            title: articles[activeArticleIndex].title,
            author: articles[activeArticleIndex].narasumber,
            dateText: `${articles[activeArticleIndex].hari}, ${articles[activeArticleIndex].tanggal}`,
            location: articles[activeArticleIndex].lokasi,
            readTime: '4 menit baca',
            imageUrl: articles[activeArticleIndex].imageUrl,
            lead: articles[activeArticleIndex].ringkasan,
            bodyParagraphs: (articles[activeArticleIndex].isiBeritaLengkap || '')
              .split('\n')
              .map((p) => p.trim())
              .filter(Boolean),
            contentMode: articles[activeArticleIndex].contentMode,
            customHtml: articles[activeArticleIndex].customHtml,
            highlights: articles[activeArticleIndex].hasilKegiatan,
            participantCount: articles[activeArticleIndex].pesertaCount,
          }
        : null;

  const renderStuntingChildCard = (family: HarmonyFosterFamily) => {
    const points = family.monthlyGrowth || [];
    const summary = summarizeChildGrowth(points);
    const who = analyzeChildMonthlyZScores(points, family.childSex || 'L');
    const recorder = family.recordedBy || ADMIN_RELAWAN_NAME;

    return (
      <article
        key={family.id}
        id={`foster-card-${family.id}`}
        onClick={() => setExpandedChildFamilyId(family.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpandedChildFamilyId(family.id);
          }
        }}
        aria-label={`Buka grafik tumbuh kembang ${family.guardianOrMotherName}`}
        className="w-[82vw] max-w-[300px] shrink-0 snap-start md:w-auto md:max-w-none p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-sky-400 bg-white dark:bg-[#0c162e] space-y-2.5 sm:space-y-3 flex flex-col justify-between cursor-pointer transition-all hover:shadow-md group"
      >
        <div className="space-y-2.5">
          {/* Top Row: Code + Status + Expand Icon */}
          <div className="flex items-center justify-between gap-1.5 text-[10px] sm:text-xs">
            <span className="font-bold text-blue-700 dark:text-sky-400 truncate">
              {family.codeName}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <span className="font-semibold text-emerald-700 dark:text-emerald-400 truncate">
                {family.statusLabel}
              </span>
              <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-sky-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Maximize2 size={12} />
              </span>
            </div>
          </div>

          {/* Child Initial, Age & WHO Z-Score PB/U Status */}
          <div className="space-y-1.5">
            <div>
              <h4 className="text-sm sm:text-base font-extrabold font-serif text-slate-900 dark:text-white leading-snug truncate">
                {family.guardianOrMotherName}
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 truncate">
                {family.targetName} · {family.banjar}
              </p>
            </div>
            <div
              className={`px-2 py-1 rounded-lg border text-[10px] sm:text-[11px] font-bold flex items-center justify-between gap-1.5 tabular-nums ${who.latestClassification.badgeClass}`}
            >
              <span className="truncate">{who.latestClassification.shortLabel}</span>
              <span className="shrink-0">{formatZScore(who.latestZScore)}</span>
            </div>
          </div>

          {/* 3-Color Mini Smooth Curve Chart (Red=Tinggi, Green=BB, Blue=IMT) */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 p-2 space-y-1.5">
            <div className="flex items-center justify-between gap-1 text-[10px] font-semibold">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Tinggi
                </span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  BB
                </span>
                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  IMT
                </span>
              </div>
              <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                {points.length} Bln
              </span>
            </div>

            <div className="h-[118px] sm:h-[135px] w-full pointer-events-none">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={points} margin={{ top: 4, right: 2, left: -24, bottom: 0 }}>
                  <CartesianGrid
                    strokeDasharray="2 2"
                    stroke={isDark ? 'rgba(148,163,184,0.14)' : '#e2e8f0'}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                    tickFormatter={(v) => `B${v}`}
                  />
                  <YAxis
                    yAxisId="height"
                    orientation="left"
                    domain={['dataMin - 3', 'dataMax + 3']}
                    tick={false}
                    axisLine={false}
                    tickLine={false}
                    width={24}
                  />
                  <YAxis
                    yAxisId="weightBmi"
                    orientation="right"
                    domain={[0, 'dataMax + 2']}
                    hide
                  />
                  <Line
                    yAxisId="height"
                    type="monotone"
                    dataKey="heightCm"
                    stroke="#ef4444"
                    strokeWidth={2.2}
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    yAxisId="weightBmi"
                    type="monotone"
                    dataKey="weightKg"
                    stroke="#10b981"
                    strokeWidth={2.2}
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    yAxisId="weightBmi"
                    type="monotone"
                    dataKey="bmi"
                    stroke="#3b82f6"
                    strokeWidth={2.2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Latest Monthly Metrics */}
            <div className="grid grid-cols-3 gap-1 pt-0.5 text-center tabular-nums">
              <div className="rounded-lg bg-red-50 dark:bg-red-950/35 px-1 py-1">
                <div className="text-[9px] font-semibold text-red-700 dark:text-red-400">TB</div>
                <div className="text-[11px] font-extrabold text-slate-900 dark:text-white">
                  {summary.latest ? `${summary.latest.heightCm}cm` : '-'}
                </div>
              </div>
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/35 px-1 py-1">
                <div className="text-[9px] font-semibold text-emerald-700 dark:text-emerald-400">
                  BB
                </div>
                <div className="text-[11px] font-extrabold text-slate-900 dark:text-white">
                  {summary.latest ? `${summary.latest.weightKg}kg` : '-'}
                </div>
              </div>
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/35 px-1 py-1">
                <div className="text-[9px] font-semibold text-blue-700 dark:text-blue-400">IMT</div>
                <div className="text-[11px] font-extrabold text-slate-900 dark:text-white">
                  {summary.latest ? summary.latest.bmi : '-'}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] sm:text-xs">
              <span className="text-slate-600 dark:text-slate-400">Progres · Klik grafik</span>
              <span className="font-bold tabular-nums text-slate-900 dark:text-white">
                {family.progressPct}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-600 dark:bg-sky-400"
                style={{ width: `${family.progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer: Pencatat Admin Relawan PKBI Buleleng + Admin Mode Buttons */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
          <span className="truncate">
            Pengisi: <strong className="text-slate-700 dark:text-slate-200">{recorder}</strong>
          </span>

          {isAdminMode && (
            <div
              className="flex items-center gap-1 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  setEditingFamily(family);
                  setAdminModalCategory('stunting');
                  setAdminModalOpen(true);
                }}
                aria-label={`Edit ${family.guardianOrMotherName}`}
                className="min-h-[28px] min-w-[28px] rounded-lg bg-blue-50 dark:bg-sky-950/50 text-blue-700 dark:text-sky-300 flex items-center justify-center cursor-pointer"
              >
                <Pencil size={12} />
              </button>
              <button
                type="button"
                onClick={() => handleAdminDeleteFamily(family)}
                aria-label={`Hapus ${family.guardianOrMotherName}`}
                className="min-h-[28px] min-w-[28px] rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 flex items-center justify-center cursor-pointer"
              >
                <Trash2 size={12} />
              </button>
            </div>
          )}
        </div>
      </article>
    );
  };

  const renderKekFamilyCard = (family: HarmonyFosterFamily) => {
    const recorder = family.recordedBy || ADMIN_RELAWAN_NAME;
    return (
      <article
        key={family.id}
        id={`foster-card-${family.id}`}
        className="w-[74vw] max-w-[260px] shrink-0 snap-start md:w-auto md:max-w-none p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] space-y-2.5 sm:space-y-3.5 flex flex-col justify-between"
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-1.5 text-[10px] sm:text-xs">
            <span className="font-bold truncate text-rose-700 dark:text-rose-400">
              {family.codeName}
            </span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400 truncate">
              {family.statusLabel}
            </span>
          </div>

          <div>
            <h4 className="text-sm sm:text-base font-bold font-serif text-slate-900 dark:text-white leading-snug truncate">
              {family.guardianOrMotherName}
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 truncate">
              {family.targetName} · {family.banjar}
            </p>
          </div>

          <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1 text-[11px] sm:text-xs">
            <div className="hidden sm:block text-slate-500 dark:text-slate-400">
              <strong className="text-slate-700 dark:text-slate-200">Awal:</strong>{' '}
              {family.baselineMetric}
            </div>
            <div className="text-emerald-700 dark:text-emerald-300 font-semibold line-clamp-2 sm:line-clamp-none">
              <strong>Kini:</strong> {family.currentMetric}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] sm:text-xs">
              <span className="text-slate-600 dark:text-slate-400">Progres</span>
              <span className="font-bold tabular-nums text-slate-900 dark:text-white">
                {family.progressPct}%
              </span>
            </div>
            <div className="h-1.5 sm:h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-rose-600 dark:bg-rose-400"
                style={{ width: `${family.progressPct}%` }}
              />
            </div>
          </div>

          <ul className="hidden sm:block space-y-1 text-xs text-slate-600 dark:text-slate-300 pt-1">
            {family.interventions.map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <CheckCircle2
                  size={13}
                  className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
          <span className="truncate">
            Pengisi: <strong className="text-slate-700 dark:text-slate-200">{recorder}</strong>
          </span>

          <div className="flex items-center gap-1 shrink-0">
            {isAdminMode && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setEditingFamily(family);
                    setAdminModalCategory('ibu-hamil-kek');
                    setAdminModalOpen(true);
                  }}
                  aria-label={`Edit ${family.guardianOrMotherName}`}
                  className="min-h-[28px] min-w-[28px] rounded-lg bg-blue-50 dark:bg-sky-950/50 text-blue-700 dark:text-sky-300 flex items-center justify-center cursor-pointer"
                >
                  <Pencil size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => handleAdminDeleteFamily(family)}
                  aria-label={`Hapus ${family.guardianOrMotherName}`}
                  className="min-h-[28px] min-w-[28px] rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 flex items-center justify-center cursor-pointer"
                >
                  <Trash2 size={12} />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setDetailFamily(family)}
              aria-label={`Lihat rincian ${family.guardianOrMotherName}`}
              title="Lihat rincian pendampingan"
              className="sm:hidden min-h-[28px] min-w-[28px] rounded-lg bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-sky-400 flex items-center justify-center shrink-0 cursor-pointer"
            >
              <Eye size={13} />
            </button>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-8 space-y-5 sm:space-y-8 text-slate-900 dark:text-slate-100">
      {/* Header Banner */}
      <section className="pb-3.5 sm:pb-5 border-b border-slate-200 dark:border-slate-800 space-y-3 sm:space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 sm:gap-4">
          <div className="space-y-1 sm:space-y-2 max-w-3xl">
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-sky-400">
              <HeartHandshake size={14} />
              <span>{sectionMeta.kicker} · {profile.name}</span>
            </div>
            <h1 className="text-lg sm:text-3xl font-extrabold font-serif tracking-tight text-slate-900 dark:text-white leading-tight">
              Desa Harmony: 3 Pilar Program
            </h1>
            <p className="text-[11px] sm:text-sm text-slate-600 dark:text-slate-300 leading-snug sm:leading-relaxed">
              <span className="sm:hidden">
                {fosterFamilies.length} Keluarga Asuh ({stuntingFamilies.length} Anak Stunting · {kekFamilies.length} Ibu KEK), Posyandu &amp; Remaja.
              </span>
              <span className="hidden sm:inline">
                Model intervensi terpadu Project ECCD PKBI Buleleng di {profile.name} berfokus pada
                Pendampingan {fosterFamilies.length} Keluarga Asuh ({stuntingFamilies.length} Anak Stunting dengan kurva bulanan TB/BB/IMT &amp; {kekFamilies.length} Ibu Hamil KEK), Layanan Posyandu Presisi, serta Penguatan Kapasitas Remaja.
              </span>
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-2.5 shrink-0">
            <div className="px-2.5 py-2 sm:px-3.5 sm:py-2.5 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] text-center">
              <div className="text-base sm:text-xl font-extrabold font-serif tabular-nums text-blue-700 dark:text-sky-400">
                {fosterFamilies.length}
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 truncate">
                Keluarga Asuh
              </div>
            </div>
            <div className="px-2.5 py-2 sm:px-3.5 sm:py-2.5 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] text-center">
              <div className="text-base sm:text-xl font-extrabold font-serif tabular-nums text-emerald-700 dark:text-emerald-400">
                {posyanduList.length}
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 truncate">
                Posyandu
              </div>
            </div>
            <div className="px-2.5 py-2 sm:px-3.5 sm:py-2.5 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] text-center">
              <div className="text-base sm:text-xl font-extrabold font-serif tabular-nums text-amber-700 dark:text-amber-400">
                {totalYouthParticipants}
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 truncate">
                Remaja
              </div>
            </div>
          </div>
        </div>

        {/* 3-Pillar Filter Navigation */}
        <div
          role="tablist"
          aria-label="Pilih Pilar Program Desa Harmony"
          className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pt-0.5"
        >
          {(
            [
              { id: 'all', short: 'Semua (3)', label: 'Semua 3 Pilar Program' },
              {
                id: 'keluarga-asuh',
                short: `1. Keluarga (${fosterFamilies.length})`,
                label: `1. Keluarga Asuh (${fosterFamilies.length})`,
              },
              { id: 'posyandu', short: '2. Posyandu', label: '2. Pendampingan Posyandu' },
              { id: 'remaja', short: '3. Remaja', label: '3. Kapasitas Remaja' },
            ] as const
          ).map((tab) => {
            const active = activePillar === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-harmony-${tab.id}`}
                type="button"
                onClick={() => setActivePillar(tab.id)}
                className={`min-h-[34px] sm:min-h-[42px] px-2.5 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-semibold border whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  active
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-[#0c162e] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-blue-500'
                }`}
              >
                <span className="sm:hidden">{tab.short}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* PILAR 1: PENDAMPINGAN KELUARGA ASUH (STUNTING CURVES + IBU HAMIL KEK) */}
      {/* ===================================================================== */}
      {(activePillar === 'all' || activePillar === 'keluarga-asuh') && (
        <section id="pillar-keluarga-asuh" className="space-y-4 sm:space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-sky-400">
                Pilar 01 · Monitoring · Pencatat: {ADMIN_RELAWAN_NAME}
              </div>
              <h2 className="text-base sm:text-2xl font-bold font-serif text-slate-900 dark:text-white">
                {fosterFamilies.length} Keluarga Asuh Desa Harmony
              </h2>
            </div>

            {isAdminMode ? (
              <div className="flex items-center gap-1.5">
                <button
                  id="btn-admin-add-stunting"
                  type="button"
                  onClick={() => {
                    setEditingFamily(null);
                    setAdminModalCategory('stunting');
                    setAdminModalOpen(true);
                  }}
                  className="min-h-[34px] sm:min-h-[38px] px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Tambah Anak Stunting</span>
                </button>
                <button
                  id="btn-admin-add-kek"
                  type="button"
                  onClick={() => {
                    setEditingFamily(null);
                    setAdminModalCategory('ibu-hamil-kek');
                    setAdminModalOpen(true);
                  }}
                  className="min-h-[34px] sm:min-h-[38px] px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Tambah Ibu KEK</span>
                </button>
              </div>
            ) : (
              <p className="hidden sm:block text-xs text-slate-600 dark:text-slate-400">
                Klik grafik anak untuk memperbesar kurva TB (Merah), BB (Hijau) &amp; IMT (Biru)
              </p>
            )}
          </div>

          {/* Group A: Anak Kasus Stunting (Inisial + Kurva Bulanan 3 Warna) */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5 sm:pb-2">
              <h3 className="text-xs sm:text-base font-bold text-blue-800 dark:text-sky-300 flex items-center gap-1.5">
                <Baby size={15} className="shrink-0" />
                <span>{stuntingFamilies.length} Anak Pendampingan Stunting (Kurva Bulanan)</span>
              </h3>
              <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="md:hidden">Geser / Ketuk →</span>
                <span className="hidden md:inline">Ketuk grafik untuk perbesar</span>
              </span>
            </div>
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-2.5 pb-1 no-scrollbar md:grid md:grid-cols-3 md:gap-4 md:overflow-visible">
              {stuntingFamilies.map(renderStuntingChildCard)}
            </div>
          </div>

          {/* Group B: Ibu Hamil KEK (Inisial Ibu) */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5 sm:pb-2">
              <h3 className="text-xs sm:text-base font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                <HeartHandshake size={15} className="shrink-0" />
                <span>{kekFamilies.length} Ibu Hamil KEK (Inisial)</span>
              </h3>
              <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="md:hidden">Geser →</span>
                <span className="hidden md:inline">{kekFamilies.length} Keluarga</span>
              </span>
            </div>
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-2.5 pb-1 no-scrollbar md:grid md:grid-cols-3 md:gap-4 md:overflow-visible">
              {kekFamilies.map(renderKekFamilyCard)}
            </div>
          </div>
        </section>
      )}

      {/* ===================================================================== */}
      {/* PILAR 2: PENDAMPINGAN POSYANDU DESA HARMONY (FULL FIREBASE CRUD)      */}
      {/* ===================================================================== */}
      {(activePillar === 'all' || activePillar === 'posyandu') && (
        <section id="pillar-posyandu" className="space-y-4 sm:space-y-5 pt-1">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Pilar 02 · Posyandu ({posyanduList.length} Unit)
              </div>
              <h2 className="text-base sm:text-2xl font-bold font-serif text-slate-900 dark:text-white">
                Pendampingan Posyandu Desa Harmony
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {isAdminMode && (
                <button
                  id="btn-admin-add-posyandu"
                  type="button"
                  onClick={() => {
                    setEditingPosyandu(null);
                    setPosyanduModalOpen(true);
                  }}
                  className="min-h-[34px] sm:min-h-[38px] px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Tambah Posyandu</span>
                </button>
              )}
              <span className="md:hidden text-[10px] font-semibold text-slate-500">Geser →</span>
            </div>
          </div>

          {/* Posyandu Schedule & Units — Horizontal Side-by-Side Cards with Scaled Thumbnails on Mobile */}
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-2.5 pb-1 no-scrollbar md:grid md:grid-cols-3 md:gap-4 md:overflow-visible">
            {posyanduList.map((pos) => (
              <article
                key={pos.id}
                id={`posyandu-card-${pos.id}`}
                className="relative w-[68vw] max-w-[248px] shrink-0 snap-start md:w-auto md:max-w-none rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] overflow-hidden flex flex-col justify-between"
              >
                {isAdminMode && (
                  <div className="absolute top-2 right-2 z-20 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPosyandu(pos);
                        setPosyanduModalOpen(true);
                      }}
                      aria-label={`Edit ${pos.posyanduName}`}
                      className="w-7 h-7 rounded-lg bg-slate-950/80 hover:bg-blue-600 text-white flex items-center justify-center cursor-pointer"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleAdminDeletePosyandu(pos)}
                      aria-label={`Hapus ${pos.posyanduName}`}
                      className="w-7 h-7 rounded-lg bg-slate-950/80 hover:bg-rose-600 text-white flex items-center justify-center cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}

                <div>
                  <div className="h-24 sm:h-40 w-full overflow-hidden border-b border-slate-200 dark:border-slate-800">
                    <SafeImage src={pos.imageUrl} alt={pos.posyanduName} />
                  </div>
                  <div className="p-2.5 sm:p-5 space-y-1.5 sm:space-y-2.5">
                    <div className="text-[10px] sm:text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 truncate">
                      <Calendar size={12} className="shrink-0" />
                      <span className="truncate">{pos.nextSession}</span>
                    </div>
                    <h3 className="text-xs sm:text-base font-bold font-serif text-slate-900 dark:text-white leading-snug line-clamp-2">
                      {pos.posyanduName}
                    </h3>
                    <p className="hidden sm:block text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {pos.description}
                    </p>
                    <ul className="hidden sm:block space-y-1 text-xs text-slate-600 dark:text-slate-300 pt-1">
                      {pos.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="px-2.5 sm:px-5 py-2 sm:py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 flex items-center justify-between gap-1 text-[10px] sm:text-xs">
                  <span className="tabular-nums font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {pos.balitaCount} Balita · {pos.bumilCount} Bumil
                  </span>
                  <button
                    type="button"
                    onClick={() => setDetailPosyandu(pos)}
                    aria-label={`Lihat detail ${pos.posyanduName}`}
                    className="sm:hidden min-h-[28px] min-w-[28px] rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-700 dark:text-sky-400 flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <Eye size={13} />
                  </button>
                  <span className="hidden sm:inline text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                    {pos.schedule.split('·')[0]}
                  </span>
                </div>
              </article>
            ))}
          </div>

          {/* Artikel Dokumentasi Posyandu (Full Firebase CRUD + Blogger HTML Support) */}
          <div
            id="section-posyandu-articles"
            className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <BookOpen size={14} className="text-blue-600 dark:text-sky-400" />
                <span>Artikel Dokumentasi Posyandu</span>
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                  {articles.length} Artikel
                </span>
                {isAdminMode && (
                  <button
                    id="btn-admin-add-posyandu-article"
                    type="button"
                    onClick={() => {
                      setEditingPosyanduArticle(null);
                      setPosyanduArticleModalOpen(true);
                    }}
                    className="min-h-[30px] sm:min-h-[34px] px-2.5 sm:px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] sm:text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Tambah Artikel</span>
                  </button>
                )}
              </div>
            </div>

            {articles.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500 dark:text-slate-400">
                Belum ada artikel dokumentasi posyandu tercatat.
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                {articles.map((art, idx) => (
                  <div
                    key={art.id}
                    id={`posyandu-article-card-${art.id}`}
                    className="relative group rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50/70 dark:bg-slate-900/50 transition-colors flex flex-col justify-between"
                  >
                    {isAdminMode && (
                      <div className="absolute top-1.5 right-1.5 z-20 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPosyanduArticle(art);
                            setPosyanduArticleModalOpen(true);
                          }}
                          aria-label={`Edit artikel ${art.title}`}
                          title="Edit Artikel (Standar / HTML)"
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-950/80 hover:bg-blue-600 text-white flex items-center justify-center cursor-pointer"
                        >
                          <Pencil size={11} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleAdminDeletePosyanduArticle(art);
                          }}
                          aria-label={`Hapus artikel ${art.title}`}
                          title="Hapus Artikel"
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-950/80 hover:bg-rose-600 text-white flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setActiveYouthBlogIndex(null);
                        setActiveArticleIndex(idx);
                      }}
                      className={`w-full h-full text-left p-2.5 sm:p-3.5 cursor-pointer flex items-start justify-between gap-2 ${
                        isAdminMode ? 'pt-9 sm:pt-10' : ''
                      }`}
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] sm:text-[11px] font-semibold text-blue-700 dark:text-sky-400 truncate">
                            {art.tanggal}
                          </span>
                          {art.contentMode === 'html' && (
                            <span className="px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-[9px] font-bold text-indigo-700 dark:text-indigo-300">
                              HTML
                            </span>
                          )}
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                          {art.title}
                        </div>
                      </div>
                      <ArrowRight size={14} className="hidden sm:block text-slate-400 shrink-0 mt-1" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===================================================================== */}
      {/* PILAR 3: BLOG ARTIKEL FORUM REMAJA DESA HARMONY (FULL FIREBASE CRUD)  */}
      {/* ===================================================================== */}
      {(activePillar === 'all' || activePillar === 'remaja') && (
        <section id="pillar-remaja" className="space-y-3 sm:space-y-4 pt-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Pilar 03 · Blog Forum Remaja ({youthArticles.length} Artikel)
              </div>
              <h2 className="text-base sm:text-2xl font-bold font-serif text-slate-900 dark:text-white truncate">
                Artikel &amp; Kegiatan Forum Remaja
              </h2>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {isAdminMode && (
                <button
                  id="btn-admin-add-youth"
                  type="button"
                  onClick={() => {
                    setEditingYouth(null);
                    setYouthModalOpen(true);
                  }}
                  className="min-h-[34px] sm:min-h-[40px] px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} />
                  <span className="hidden sm:inline">Tambah Artikel Remaja</span>
                  <span className="sm:hidden">Artikel</span>
                </button>
              )}

              {onNavigateToQna && (
                <button
                  type="button"
                  onClick={onNavigateToQna}
                  aria-label="Tanya Konselor Remaja (QnA)"
                  title="Tanya Konselor Remaja (QnA)"
                  className="min-h-[34px] min-w-[34px] sm:min-h-[40px] px-2.5 sm:px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <MessageSquareHeart size={15} />
                  <span className="hidden sm:inline">Tanya Konselor (QnA)</span>
                </button>
              )}
            </div>
          </div>

          <div
            id="forum-remaja-blog-grid"
            className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-5"
          >
            {youthArticles.map((prog, idx) => (
              <article
                key={prog.id}
                id={`youth-blog-card-${prog.id}`}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setActiveArticleIndex(null);
                  setActiveYouthBlogIndex(idx);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveArticleIndex(null);
                    setActiveYouthBlogIndex(idx);
                  }
                }}
                aria-label={`Baca artikel blog ${prog.programName}`}
                className="group relative min-w-0 rounded-xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-blue-600 dark:hover:border-sky-400 bg-white dark:bg-[#0c162e] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
              >
                {isAdminMode && (
                  <div
                    className="absolute top-2 right-2 z-20 flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setEditingYouth(prog);
                        setYouthModalOpen(true);
                      }}
                      aria-label={`Edit artikel ${prog.programName}`}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-950/80 hover:bg-blue-600 text-white flex items-center justify-center cursor-pointer"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleAdminDeleteYouth(prog)}
                      aria-label={`Hapus artikel ${prog.programName}`}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-950/80 hover:bg-rose-600 text-white flex items-center justify-center cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}

                <div className="min-w-0">
                  <div className="relative h-24 sm:h-44 w-full overflow-hidden border-b border-slate-200 dark:border-slate-800">
                    <SafeImage
                      src={prog.imageUrl}
                      alt={prog.programName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/15 to-transparent pointer-events-none" />
                    <div className="absolute bottom-1.5 left-2 right-2 sm:bottom-3 sm:left-4 sm:right-4 flex items-center justify-between gap-1 text-[10px] sm:text-xs text-white">
                      <span className="font-semibold text-amber-200 truncate">{prog.forumName}</span>
                      <span className="hidden sm:inline text-slate-200 shrink-0">
                        {prog.readTime || '3 menit baca'}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 sm:p-5 space-y-1.5 sm:space-y-2">
                    <div className="flex items-center justify-between gap-1 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                      <span className="truncate">{prog.dateText || prog.schedule.split('·')[0]}</span>
                      <span className="font-bold tabular-nums text-blue-700 dark:text-sky-400 flex items-center gap-0.5 shrink-0">
                        <Users size={11} />
                        <span>{prog.participantCount}</span>
                      </span>
                    </div>

                    <h3 className="text-xs sm:text-lg font-bold font-serif text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-blue-700 dark:group-hover:text-sky-300 transition-colors">
                      {prog.programName}
                    </h3>

                    <p className="hidden sm:block text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                      {prog.description}
                    </p>
                  </div>
                </div>

                <div className="px-2.5 sm:px-5 py-2 sm:py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 flex items-center justify-between text-[10px] sm:text-xs font-semibold text-blue-700 dark:text-sky-400">
                  <span className="flex items-center gap-1 truncate">
                    <BookOpen size={13} className="shrink-0" />
                    <span>Baca Artikel</span>
                  </span>
                  <ArrowRight size={14} className="shrink-0 transition-transform group-hover:translate-x-0.5" />
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Compact On-Demand Detail Modal for Mobile (Family / Posyandu) */}
      {(detailFamily || detailPosyandu) &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[75] bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-3"
            onClick={() => {
              setDetailFamily(null);
              setDetailPosyandu(null);
            }}
          >
            <div
              className="w-full max-w-lg max-h-[85dvh] overflow-y-auto rounded-2xl bg-white dark:bg-[#0c162e] border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-3 text-slate-900 dark:text-slate-100 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div className="min-w-0">
                  <div className="text-[11px] font-bold uppercase text-blue-700 dark:text-sky-400">
                    {detailFamily
                      ? `${detailFamily.codeName} · ${detailFamily.categoryLabel}`
                      : `Posyandu · ${detailPosyandu?.nextSession}`}
                  </div>
                  <h3 className="text-base font-bold font-serif text-slate-900 dark:text-white leading-snug">
                    {detailFamily
                      ? detailFamily.guardianOrMotherName
                      : detailPosyandu?.posyanduName}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDetailFamily(null);
                    setDetailPosyandu(null);
                  }}
                  aria-label="Tutup rincian"
                  className="min-h-[36px] min-w-[36px] rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {detailFamily && (
                <div className="space-y-3 text-xs">
                  <p className="text-slate-600 dark:text-slate-300">
                    {detailFamily.targetName} · {detailFamily.banjar} · Status:{' '}
                    <strong className="text-emerald-700 dark:text-emerald-400">
                      {detailFamily.statusLabel} ({detailFamily.progressPct}%)
                    </strong>
                  </p>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                    <div>
                      <strong>Kondisi Awal:</strong> {detailFamily.baselineMetric}
                    </div>
                    <div className="text-emerald-700 dark:text-emerald-300 font-semibold">
                      <strong>Kondisi Kini:</strong> {detailFamily.currentMetric}
                    </div>
                  </div>
                  <ul className="space-y-1.5">
                    {detailFamily.interventions.map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="text-[11px] text-slate-500">
                    Pengisi: <strong>{detailFamily.recordedBy || ADMIN_RELAWAN_NAME}</strong>
                  </div>
                </div>
              )}

              {detailPosyandu && (
                <div className="space-y-3 text-xs">
                  <div className="h-40 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                    <SafeImage src={detailPosyandu.imageUrl} alt={detailPosyandu.posyanduName} />
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {detailPosyandu.description}
                  </p>
                  <div className="font-semibold text-emerald-700 dark:text-emerald-400">
                    {detailPosyandu.balitaCount} Balita · {detailPosyandu.bumilCount} Ibu Hamil ·{' '}
                    {detailPosyandu.schedule}
                  </div>
                  <ul className="space-y-1">
                    {detailPosyandu.highlights.map((h, i) => (
                      <li key={i}>• {h}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}

      {/* Expanded Fullscreen 3-Color Child Growth Curve Modal */}
      <ChildGrowthCurveModal
        family={expandedChildFamily}
        onClose={() => setExpandedChildFamilyId(null)}
        isAdminMode={isAdminMode}
        onEdit={(fam) => {
          setExpandedChildFamilyId(null);
          setEditingFamily(fam);
          setAdminModalCategory(fam.category);
          setAdminModalOpen(true);
        }}
        onDelete={handleAdminDeleteFamily}
      />

      {/* Admin Mode CRUD Modals for Desa Harmony (Keluarga Asuh, Posyandu, Forum Remaja Blog) */}
      {isAdminMode && (
        <>
          <AdminFosterFamilyModal
            isOpen={adminModalOpen}
            editingFamily={editingFamily}
            defaultCategory={adminModalCategory}
            onClose={() => {
              setAdminModalOpen(false);
              setEditingFamily(null);
            }}
            onSave={upsertFosterFamily}
          />
          <AdminPosyanduModal
            isOpen={posyanduModalOpen}
            editingPosyandu={editingPosyandu}
            onClose={() => {
              setPosyanduModalOpen(false);
              setEditingPosyandu(null);
            }}
            onSave={upsertPosyandu}
          />
          <AdminPosyanduArticleModal
            isOpen={posyanduArticleModalOpen}
            editingArticle={editingPosyanduArticle}
            onClose={() => {
              setPosyanduArticleModalOpen(false);
              setEditingPosyanduArticle(null);
            }}
            onSave={upsertPosyanduArticle}
          />
          <AdminYouthArticleModal
            isOpen={youthModalOpen}
            editingArticle={editingYouth}
            onClose={() => {
              setYouthModalOpen(false);
              setEditingYouth(null);
            }}
            onSave={upsertYouthArticle}
          />
        </>
      )}

      {/* Fullscreen Editorial Blog Article Modal (Posyandu Articles + Forum Remaja Blog Articles) */}
      <BlogArticleModal
        article={activeArticle}
        onClose={() => {
          setActiveArticleIndex(null);
          setActiveYouthBlogIndex(null);
        }}
        onPrev={() => {
          if (activeYouthBlogIndex !== null) {
            setActiveYouthBlogIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
          } else {
            setActiveArticleIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
          }
        }}
        onNext={() => {
          if (activeYouthBlogIndex !== null) {
            setActiveYouthBlogIndex((prev) =>
              prev !== null && prev < youthArticles.length - 1 ? prev + 1 : prev
            );
          } else {
            setActiveArticleIndex((prev) =>
              prev !== null && prev < articles.length - 1 ? prev + 1 : prev
            );
          }
        }}
        hasPrev={
          activeYouthBlogIndex !== null
            ? activeYouthBlogIndex > 0
            : activeArticleIndex !== null && activeArticleIndex > 0
        }
        hasNext={
          activeYouthBlogIndex !== null
            ? activeYouthBlogIndex < youthArticles.length - 1
            : activeArticleIndex !== null && activeArticleIndex < articles.length - 1
        }
      />
    </div>
  );
};
