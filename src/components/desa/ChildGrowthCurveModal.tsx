import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import {
  X,
  CheckCircle2,
  TrendingUp,
  UserCheck,
  Pencil,
  Trash2,
  Baby,
  Activity,
  Info,
} from 'lucide-react';
import { HarmonyFosterFamily } from '../../types';
import {
  ADMIN_RELAWAN_NAME,
  summarizeChildGrowth,
} from '../../utils/childGrowthHelpers';
import {
  analyzeChildMonthlyZScores,
  formatZScore,
} from '../../utils/whoZScore';
import { useAppTheme } from '../../context/ThemeContext';

interface ChildGrowthCurveModalProps {
  family: HarmonyFosterFamily | null;
  onClose: () => void;
  isAdminMode?: boolean;
  onEdit?: (family: HarmonyFosterFamily) => void;
  onDelete?: (family: HarmonyFosterFamily) => void;
}

export const ChildGrowthCurveModal: React.FC<ChildGrowthCurveModalProps> = ({
  family,
  onClose,
  isAdminMode = false,
  onEdit,
  onDelete,
}) => {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  const points = family?.monthlyGrowth || [];
  const childSex = family?.childSex || 'L';

  const summary = useMemo(() => summarizeChildGrowth(points), [points]);
  const whoAnalysis = useMemo(
    () => analyzeChildMonthlyZScores(points, childSex),
    [points, childSex]
  );

  if (!family) return null;

  const ageMonths = family.childAgeMonths || points.length || 12;
  const ageLabel =
    ageMonths === 12
      ? 'Usia 1 Tahun (12 Bulan)'
      : `Usia ${ageMonths} Bulan`;
  const sexLabel = childSex === 'P' ? 'Perempuan (WHO PB/U)' : 'Laki-laki (WHO PB/U)';
  const recorder = family.recordedBy || ADMIN_RELAWAN_NAME;
  const latestCls = whoAnalysis.latestClassification;

  const modalContent = (
    <div
      id="modal-child-growth-detail"
      role="dialog"
      aria-modal="true"
      aria-labelledby="child-growth-modal-title"
      className="fixed inset-0 z-[80] flex flex-col bg-white dark:bg-[#060c1c] text-slate-900 dark:text-slate-100 overflow-hidden"
    >
      {/* Top Sticky Header */}
      <header
        className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#070e22]/95 backdrop-blur-md shrink-0"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Baby size={18} />
            </span>
            <div className="min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-sky-400 truncate">
                {family.codeName} · {ageLabel} · {sexLabel}
              </div>
              <h2
                id="child-growth-modal-title"
                className="text-base sm:text-xl font-extrabold font-serif text-slate-900 dark:text-white truncate"
              >
                Kurva &amp; Analisa Z-Score WHO {family.guardianOrMotherName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isAdminMode && onEdit && (
              <button
                id="btn-modal-edit-child"
                type="button"
                onClick={() => onEdit(family)}
                aria-label="Edit data anak"
                className="min-h-[38px] px-3 rounded-xl border border-blue-200 dark:border-sky-800 bg-blue-50 dark:bg-sky-950/50 text-blue-700 dark:text-sky-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Pencil size={14} />
                <span className="hidden sm:inline">Edit Data</span>
              </button>
            )}
            {isAdminMode && onDelete && (
              <button
                id="btn-modal-delete-child"
                type="button"
                onClick={() => onDelete(family)}
                aria-label="Hapus data anak"
                className="min-h-[38px] min-w-[38px] sm:px-3 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={14} />
                <span className="hidden sm:inline">Hapus</span>
              </button>
            )}
            <button
              id="btn-close-child-growth-modal"
              type="button"
              onClick={onClose}
              aria-label="Tutup grafik tumbuh kembang"
              className="min-h-[40px] min-w-[40px] rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Scrollable Body */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-6">
          {/* 4-Card Summary Strip: Tinggi, Berat, IMT, and WHO Z-Score SD */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="p-3 sm:p-4 rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/25 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-red-700 dark:text-red-400">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                <span className="truncate">Tinggi / Panjang</span>
              </div>
              <div className="text-lg sm:text-2xl font-extrabold font-serif tabular-nums text-slate-900 dark:text-white">
                {summary.latest ? `${summary.latest.heightCm} cm` : '-'}
              </div>
              <div className="text-[10px] sm:text-xs text-red-700/80 dark:text-red-300 tabular-nums">
                {summary.first && summary.latest
                  ? `Bln ${summary.first.month}: ${summary.first.heightCm} → +${summary.heightGainCm} cm`
                  : family.currentMetric}
              </div>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/25 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate">Berat Badan (BB)</span>
              </div>
              <div className="text-lg sm:text-2xl font-extrabold font-serif tabular-nums text-slate-900 dark:text-white">
                {summary.latest ? `${summary.latest.weightKg} kg` : '-'}
              </div>
              <div className="text-[10px] sm:text-xs text-emerald-700/80 dark:text-emerald-300 tabular-nums">
                {summary.first && summary.latest
                  ? `Bln ${summary.first.month}: ${summary.first.weightKg} → +${summary.weightGainKg} kg`
                  : '-'}
              </div>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/25 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-blue-700 dark:text-blue-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                <span className="truncate">Indeks Massa Tubuh</span>
              </div>
              <div className="text-lg sm:text-2xl font-extrabold font-serif tabular-nums text-slate-900 dark:text-white">
                {summary.latest ? `${summary.latest.bmi}` : '-'}{' '}
                <span className="text-[10px] sm:text-xs font-sans font-semibold text-slate-500">
                  kg/m²
                </span>
              </div>
              <div className="text-[10px] sm:text-xs text-blue-700/80 dark:text-blue-300 tabular-nums">
                {summary.first && summary.latest
                  ? `Bln ${summary.first.month}: ${summary.first.bmi} (${summary.bmiDelta >= 0 ? '+' : ''}${summary.bmiDelta})`
                  : '-'}
              </div>
            </div>

            <div
              id="who-zscore-summary-card"
              className={`p-3 sm:p-4 rounded-2xl border space-y-1 ${latestCls.badgeClass}`}
            >
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold">
                <Activity size={13} className="shrink-0" />
                <span className="truncate">Z-Score WHO (PB/U)</span>
              </div>
              <div className="text-lg sm:text-2xl font-extrabold font-serif tabular-nums">
                {formatZScore(whoAnalysis.latestZScore)}
              </div>
              <div className="text-[10px] sm:text-xs font-semibold truncate">
                {latestCls.shortLabel}
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* SECTION 1: ANALISA & KURVA Z-SCORE WHO / BUKU KIA (-1, -2, -3 SD) */}
          {/* ================================================================= */}
          <section
            id="who-zscore-analysis-section"
            className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] space-y-4 shadow-xs"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-sky-400">
                  Standar Antropometri WHO &amp; Buku KIA · PB/U &amp; TB/U
                </div>
                <h3 className="text-sm sm:text-lg font-bold font-serif text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity size={17} className="text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Kurva Z-Score (SD) &amp; Kalkulasi Risiko Stunting Per Bulan</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 tabular-nums">
                  Perkembangan Z-Score: <strong>{formatZScore(whoAnalysis.firstZScore)}</strong> (Bln 1) →{' '}
                  <strong>{formatZScore(whoAnalysis.latestZScore)}</strong> (Bln {points.length}) ·{' '}
                  Perubahan:{' '}
                  <strong className={whoAnalysis.zScoreDelta >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600'}>
                    {whoAnalysis.zScoreDelta >= 0 ? '+' : ''}
                    {whoAnalysis.zScoreDelta.toFixed(2)} SD
                  </strong>{' '}
                  · Median WHO Bln {points.length}: <strong>{whoAnalysis.latestWhoMedianCm} cm</strong>
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-xl border text-xs font-bold ${latestCls.badgeClass}`}
              >
                {latestCls.label}
              </span>
            </div>

            {/* Z-Score Chart with explicit 0 SD, -1 SD, -2 SD, -3 SD Reference Lines */}
            <div className="h-[240px] sm:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={whoAnalysis.points}
                  margin={{ top: 14, right: 20, left: -8, bottom: 8 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? 'rgba(148,163,184,0.16)' : '#e2e8f0'}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: isDark ? '#cbd5e1' : '#475569', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[-4, 1]}
                    ticks={[-4, -3, -2, -1, 0, 1]}
                    tick={{ fill: isDark ? '#cbd5e1' : '#475569', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v} SD`}
                    width={52}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      borderColor: isDark ? '#334155' : '#e2e8f0',
                      borderRadius: '14px',
                      color: isDark ? '#f8fafc' : '#0f172a',
                      fontSize: '12px',
                    }}
                    formatter={(value: unknown, _name: string, item: any) => {
                      const pt = item?.payload;
                      const zVal = Number(value);
                      return [
                        `${formatZScore(zVal)} (${pt?.classification?.shortLabel || ''}) · PB ${pt?.heightCm} cm vs Median ${pt?.whoMedianCm} cm`,
                        'Z-Score WHO PB/U',
                      ];
                    }}
                  />
                  <ReferenceLine
                    y={0}
                    stroke="#10b981"
                    strokeDasharray="4 4"
                    label={{
                      value: '0 SD (Median WHO)',
                      position: 'insideTopRight',
                      fill: '#059669',
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  />
                  <ReferenceLine
                    y={-1}
                    stroke="#0284c7"
                    strokeDasharray="4 4"
                    label={{
                      value: '-1 SD (Batas Pantau)',
                      position: 'insideTopRight',
                      fill: '#0284c7',
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  />
                  <ReferenceLine
                    y={-2}
                    stroke="#d97706"
                    strokeWidth={1.8}
                    strokeDasharray="5 3"
                    label={{
                      value: '-2 SD (Batas Stunting)',
                      position: 'insideTopRight',
                      fill: '#d97706',
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  />
                  <ReferenceLine
                    y={-3}
                    stroke="#dc2626"
                    strokeWidth={1.8}
                    strokeDasharray="5 3"
                    label={{
                      value: '-3 SD (Sangat Pendek)',
                      position: 'insideTopRight',
                      fill: '#dc2626',
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="zScore"
                    name="Z-Score PB/U (SD)"
                    stroke={latestCls.colorHex}
                    strokeWidth={3}
                    dot={{ r: 4, fill: latestCls.colorHex, strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Clinical Interpretation Box for this Child */}
            <div className={`p-3.5 sm:p-4 rounded-2xl border space-y-1.5 text-xs sm:text-sm ${latestCls.badgeClass}`}>
              <div className="font-bold flex items-center gap-1.5">
                <Info size={15} className="shrink-0" />
                <span>
                  Hasil Analisa Klinis Terkini ({formatZScore(whoAnalysis.latestZScore)} · {latestCls.rangeText}):
                </span>
              </div>
              <p className="leading-relaxed opacity-95">{latestCls.clinicalSummary}</p>
              <p className="text-xs font-semibold pt-0.5">Rekomendasi: {latestCls.actionNote}</p>
            </div>

            {/* 3-Zone Reference Legend (Exact User WHO / Buku KIA Guide) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px] sm:text-xs">
              <div className="p-3 rounded-xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/70 dark:bg-sky-950/25 space-y-1">
                <div className="font-bold text-sky-900 dark:text-sky-300">
                  • Antara -2 SD hingga -1 SD (Normal Pantau)
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-snug">
                  Masih tergolong normal. Meski sedikit di bawah rata-rata (0 SD), anak belum masuk
                  kategori pendek/stunting, tetapi perlu dipantau rutin agar tidak turun melewati -2 SD.
                </p>
                <div className="font-semibold text-sky-800 dark:text-sky-400 tabular-nums">
                  Riwayat anak ini: {whoAnalysis.monthsNormalWatch} bulan ({whoAnalysis.monthsNormalIdeal} bln ≥ -1 SD)
                </div>
              </div>

              <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/25 space-y-1">
                <div className="font-bold text-amber-900 dark:text-amber-300">
                  • Di bawah -2 SD hingga -3 SD (Pendek / Stunted)
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-snug">
                  Terkategori pendek (stunted). Menandakan adanya risiko atau indikasi kekurangan gizi
                  kronis sehingga perlu evaluasi tenaga kesehatan.
                </p>
                <div className="font-semibold text-amber-800 dark:text-amber-400 tabular-nums">
                  Riwayat anak ini: {whoAnalysis.monthsStunted} bulan
                </div>
              </div>

              <div className="p-3 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/25 space-y-1">
                <div className="font-bold text-red-900 dark:text-red-300">
                  • Di bawah -3 SD (Sangat Pendek / Severely Stunted)
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-snug">
                  Terkategori sangat pendek (severely stunted). Menunjukkan gangguan pertumbuhan kronis
                  lebih berat yang memerlukan penanganan medis serta gizi lebih intensif.
                </p>
                <div className="font-semibold text-red-800 dark:text-red-400 tabular-nums">
                  Riwayat anak ini: {whoAnalysis.monthsSeverelyStunted} bulan
                </div>
              </div>
            </div>
          </section>

          {/* ================================================================= */}
          {/* SECTION 2: 3-COLOR SMOOTH GROWTH CURVE (TB MERAH, BB HIJAU, IMT BIRU) */}
          {/* ================================================================= */}
          <section className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] space-y-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm sm:text-lg font-bold font-serif text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp size={17} className="text-blue-600 dark:text-sky-400" />
                  <span>Kurva Antropometri Bulanan ({points.length} Bulan Pemantauan)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Status: <strong className="text-emerald-700 dark:text-emerald-400">{family.statusLabel}</strong> · Progres {family.progressPct}%
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                  <span className="w-3 h-1.5 rounded-full bg-red-500" />
                  Tinggi (cm)
                </span>
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <span className="w-3 h-1.5 rounded-full bg-emerald-500" />
                  Berat Badan (kg)
                </span>
                <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <span className="w-3 h-1.5 rounded-full bg-blue-500" />
                  IMT (kg/m²)
                </span>
              </div>
            </div>

            <div className="h-[250px] sm:h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={points}
                  margin={{ top: 12, right: 12, left: -8, bottom: 8 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? 'rgba(148,163,184,0.16)' : '#e2e8f0'}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: isDark ? '#cbd5e1' : '#475569', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="height"
                    orientation="left"
                    domain={['dataMin - 4', 'dataMax + 4']}
                    tick={{ fill: '#ef4444', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    unit=" cm"
                    width={52}
                  />
                  <YAxis
                    yAxisId="weightBmi"
                    orientation="right"
                    domain={[0, 'dataMax + 3']}
                    tick={{ fill: isDark ? '#93c5fd' : '#2563eb', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={42}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      borderColor: isDark ? '#334155' : '#e2e8f0',
                      borderRadius: '14px',
                      color: isDark ? '#f8fafc' : '#0f172a',
                      fontSize: '12px',
                    }}
                    formatter={(value: unknown, name: string) => {
                      if (name.includes('Tinggi')) return [`${value} cm`, name];
                      if (name.includes('Berat')) return [`${value} kg`, name];
                      return [`${value} kg/m²`, name];
                    }}
                  />
                  <Line
                    yAxisId="height"
                    type="monotone"
                    dataKey="heightCm"
                    name="Tinggi / Panjang Badan"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{ r: 3.5, fill: '#ef4444', strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    yAxisId="weightBmi"
                    type="monotone"
                    dataKey="weightKg"
                    name="Berat Badan (BB)"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 3.5, fill: '#10b981', strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    yAxisId="weightBmi"
                    type="monotone"
                    dataKey="bmi"
                    name="Indeks Massa Tubuh (IMT)"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 3.5, fill: '#3b82f6', strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Monthly Data Breakdown Table (including Z-Score SD & WHO Status) + Interventions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <section className="lg:col-span-2 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm sm:text-base font-bold font-serif text-slate-900 dark:text-white">
                  Rincian Pengukuran &amp; Kalkulasi Z-Score Per Bulan
                </h3>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {whoAnalysis.points.length} Titik Bulan
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <th className="py-2 pr-2 font-semibold">Usia</th>
                      <th className="py-2 px-2 font-semibold text-red-600 dark:text-red-400">Tinggi</th>
                      <th className="py-2 px-2 font-semibold text-emerald-600 dark:text-emerald-400">Berat</th>
                      <th className="py-2 px-2 font-semibold text-blue-600 dark:text-blue-400">IMT</th>
                      <th className="py-2 px-2 font-semibold text-slate-700 dark:text-slate-200">Z-Score</th>
                      <th className="py-2 pl-2 font-semibold text-slate-700 dark:text-slate-200">Kategori WHO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 tabular-nums">
                    {whoAnalysis.points.map((pt) => (
                      <tr key={pt.month} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40">
                        <td className="py-2 pr-2 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          Bln {pt.month}
                        </td>
                        <td className="py-2 px-2 font-bold text-red-600 dark:text-red-400 whitespace-nowrap">
                          {pt.heightCm} cm
                        </td>
                        <td className="py-2 px-2 font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          {pt.weightKg} kg
                        </td>
                        <td className="py-2 px-2 font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                          {pt.bmi}
                        </td>
                        <td className="py-2 px-2 font-extrabold whitespace-nowrap">
                          {formatZScore(pt.zScore)}
                        </td>
                        <td className="py-2 pl-2 whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-lg border text-[10px] font-bold ${pt.classification.badgeClass}`}
                          >
                            {pt.classification.shortLabel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <aside className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] space-y-4">
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold font-serif text-slate-900 dark:text-white">
                  Ringkasan Pendampingan
                </h3>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Awal:</span>{' '}
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                      {family.baselineMetric}
                    </span>
                  </div>
                  <div className="text-emerald-700 dark:text-emerald-300 font-semibold">
                    <span>Terkini:</span> {family.currentMetric}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Intervensi Dilakukan
                </h4>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-200">
                  {family.interventions.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2
                        size={14}
                        className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <UserCheck size={15} className="text-blue-600 dark:text-sky-400 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400">
                    Pengisi &amp; Pencatat Data
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white">{recorder}</div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
