import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2, Save, Loader2, ShieldCheck } from 'lucide-react';
import {
  ChildSex,
  HarmonyFosterFamily,
  StuntingChildMonthlyPoint,
} from '../../types';
import {
  ADMIN_RELAWAN_NAME,
  buildMonthlyGrowthPoint,
  calculateBmi,
} from '../../utils/childGrowthHelpers';
import { calculateHeightForAgeZScore, formatZScore } from '../../utils/whoZScore';

interface AdminFosterFamilyModalProps {
  isOpen: boolean;
  editingFamily: HarmonyFosterFamily | null;
  defaultCategory?: 'stunting' | 'ibu-hamil-kek';
  onClose: () => void;
  onSave: (family: HarmonyFosterFamily) => Promise<void>;
}

export const AdminFosterFamilyModal: React.FC<AdminFosterFamilyModalProps> = ({
  isOpen,
  editingFamily,
  defaultCategory = 'stunting',
  onClose,
  onSave,
}) => {
  const [category, setCategory] = useState<'stunting' | 'ibu-hamil-kek'>(defaultCategory);
  const [childSex, setChildSex] = useState<ChildSex>('L');
  const [codeName, setCodeName] = useState('');
  const [initials, setInitials] = useState('');
  const [banjar, setBanjar] = useState('Banjar Dinas Sari Mekar');
  const [statusLabel, setStatusLabel] =
    useState<HarmonyFosterFamily['statusLabel']>('Progres Baik');
  const [progressPct, setProgressPct] = useState(75);
  const [baselineMetric, setBaselineMetric] = useState('');
  const [currentMetric, setCurrentMetric] = useState('');
  const [interventionsText, setInterventionsText] = useState('');
  const [monthlyRows, setMonthlyRows] = useState<StuntingChildMonthlyPoint[]>([]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg(null);
    if (editingFamily) {
      setCategory(editingFamily.category);
      setChildSex(editingFamily.childSex || 'L');
      setCodeName(editingFamily.codeName);
      setInitials(editingFamily.guardianOrMotherName);
      setBanjar(editingFamily.banjar);
      setStatusLabel(editingFamily.statusLabel);
      setProgressPct(editingFamily.progressPct);
      setBaselineMetric(editingFamily.baselineMetric);
      setCurrentMetric(editingFamily.currentMetric);
      setInterventionsText(editingFamily.interventions.join('\n'));
      setMonthlyRows(
        editingFamily.monthlyGrowth && editingFamily.monthlyGrowth.length > 0
          ? editingFamily.monthlyGrowth
          : [
              buildMonthlyGrowthPoint(1, 50.0, 3.2),
              buildMonthlyGrowthPoint(2, 53.5, 4.1),
              buildMonthlyGrowthPoint(3, 56.8, 4.9),
            ]
      );
    } else {
      const nextCat = defaultCategory;
      setCategory(nextCat);
      setChildSex('L');
      setCodeName(nextCat === 'stunting' ? 'Anak Asuh Baru' : 'Ibu KEK Baru');
      setInitials(nextCat === 'stunting' ? 'An. M.A.P' : 'Ibu N.L.S');
      setBanjar('Banjar Dinas Sari Mekar');
      setStatusLabel(nextCat === 'stunting' ? 'Progres Baik' : 'Pemulihan Intensif');
      setProgressPct(70);
      setBaselineMetric(
        nextCat === 'stunting'
          ? 'Bln 1: PB 50.0 cm · BB 3.2 kg · IMT 12.8'
          : 'LILA awal 21.5 cm · Hb 10.2 g/dL'
      );
      setCurrentMetric(
        nextCat === 'stunting'
          ? 'Bln 3: PB 56.8 cm · BB 4.9 kg · IMT 15.2'
          : 'LILA kini 23.4 cm · Hb 11.4 g/dL'
      );
      setInterventionsText(
        nextCat === 'stunting'
          ? 'PMT Protein Hewani harian\nPemantauan TB, BB & IMT bulanan Posyandu'
          : 'PMT Ibu Hamil KEK terpantau\nSuplementasi TTD & asam folat rutin'
      );
      setMonthlyRows([
        buildMonthlyGrowthPoint(1, 50.0, 3.2),
        buildMonthlyGrowthPoint(2, 53.5, 4.1),
        buildMonthlyGrowthPoint(3, 56.8, 4.9),
      ]);
    }
  }, [isOpen, editingFamily, defaultCategory]);

  if (!isOpen) return null;

  const handleUpdateMonthRow = (
    idx: number,
    field: 'heightCm' | 'weightKg',
    rawValue: string
  ) => {
    const num = parseFloat(rawValue);
    setMonthlyRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        const heightCm = field === 'heightCm' && Number.isFinite(num) ? num : row.heightCm;
        const weightKg = field === 'weightKg' && Number.isFinite(num) ? num : row.weightKg;
        return {
          ...row,
          heightCm,
          weightKg,
          bmi: calculateBmi(weightKg, heightCm),
        };
      })
    );
  };

  const handleAddMonthRow = () => {
    setMonthlyRows((prev) => {
      const last = prev[prev.length - 1];
      const nextMonth = last ? last.month + 1 : 1;
      const nextHeight = last ? Math.round((last.heightCm + 1.5) * 10) / 10 : 50;
      const nextWeight = last ? Math.round((last.weightKg + 0.4) * 10) / 10 : 3.2;
      return [...prev, buildMonthlyGrowthPoint(nextMonth, nextHeight, nextWeight)];
    });
  };

  const handleRemoveMonthRow = (idx: number) => {
    setMonthlyRows((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInitials = initials.trim();
    const cleanCode = codeName.trim();
    if (!cleanInitials || !cleanCode) {
      setErrorMsg('Inisial dan label kode keluarga asuh wajib diisi.');
      return;
    }

    const interventions = interventionsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const isStunting = category === 'stunting';
    const sortedPoints = isStunting
      ? [...monthlyRows]
          .sort((a, b) => a.month - b.month)
          .map((pt, idx) => buildMonthlyGrowthPoint(idx + 1, pt.heightCm, pt.weightKg))
      : undefined;

    const firstPt = sortedPoints?.[0];
    const latestPt = sortedPoints?.[sortedPoints.length - 1];

    const firstZ =
      isStunting && firstPt
        ? formatZScore(calculateHeightForAgeZScore(firstPt.month, firstPt.heightCm, childSex))
        : '';
    const latestZ =
      isStunting && latestPt
        ? formatZScore(calculateHeightForAgeZScore(latestPt.month, latestPt.heightCm, childSex))
        : '';

    const computedBaseline =
      isStunting && firstPt
        ? `Bln ${firstPt.month}: PB ${firstPt.heightCm} cm (${firstZ}) · BB ${firstPt.weightKg} kg · IMT ${firstPt.bmi}`
        : baselineMetric.trim() || 'Baseline terdata';

    const computedCurrent =
      isStunting && latestPt
        ? `Bln ${latestPt.month}: TB ${latestPt.heightCm} cm (${latestZ}) · BB ${latestPt.weightKg} kg · IMT ${latestPt.bmi}`
        : currentMetric.trim() || 'Kondisi terkini terpantau';

    const ageMonths = isStunting && sortedPoints ? sortedPoints.length : undefined;

    const payload: HarmonyFosterFamily = {
      id: editingFamily?.id || `fam-${category}-${Date.now()}`,
      codeName: cleanCode,
      category,
      categoryLabel: isStunting ? 'Kasus Stunting' : 'Ibu Hamil KEK',
      guardianOrMotherName: cleanInitials,
      targetName: isStunting
        ? `Usia ${ageMonths} Bulan${ageMonths === 12 ? ' (1 Tahun)' : ''}`
        : editingFamily?.targetName || 'Ibu Hamil KEK · Pendampingan Aktif',
      banjar: banjar.trim() || 'Banjar Dinas Sari Mekar',
      baselineMetric: computedBaseline,
      currentMetric: computedCurrent,
      progressPct: Math.max(0, Math.min(100, Math.round(progressPct))),
      statusLabel,
      interventions:
        interventions.length > 0 ? interventions : ['Pendampingan rutin PKBI Buleleng'],
      mentorName: ADMIN_RELAWAN_NAME,
      recordedBy: ADMIN_RELAWAN_NAME,
      childAgeMonths: ageMonths,
      childSex: isStunting ? childSex : undefined,
      monthlyGrowth: sortedPoints,
    };

    try {
      setSaving(true);
      setErrorMsg(null);
      await onSave(payload);
      onClose();
    } catch {
      setErrorMsg('Gagal menyimpan ke database. Pastikan Anda login dengan akun Admin terdaftar.');
    } finally {
      setSaving(false);
    }
  };

  const modalNode = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-family-modal-title"
      className="fixed inset-0 z-[85] bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-2xl max-h-[92dvh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#0c162e] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <ShieldCheck size={13} />
              <span>Mode Admin · {ADMIN_RELAWAN_NAME}</span>
            </div>
            <h2 id="admin-family-modal-title" className="text-base sm:text-lg font-bold font-serif">
              {editingFamily ? 'Edit Data Keluarga Asuh' : 'Tambah Data Keluarga Asuh'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup form"
            className="min-h-[40px] min-w-[40px] rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
          >
            <X size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs sm:text-sm">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Kategori Program
              </span>
              <select
                value={category}
                disabled={Boolean(editingFamily)}
                onChange={(e) => setCategory(e.target.value as 'stunting' | 'ibu-hamil-kek')}
                className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="stunting">Kasus Stunting (Anak · Grafik Bulanan)</option>
                <option value="ibu-hamil-kek">Ibu Hamil KEK</option>
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Label Kode (mis. Anak Asuh 04)
              </span>
              <input
                type="text"
                value={codeName}
                onChange={(e) => setCodeName(e.target.value)}
                required
                className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {category === 'stunting'
                  ? 'Inisial Nama Anak (mis. An. K.D.R)'
                  : 'Inisial Ibu Hamil (mis. Ibu D.Md.R)'}
              </span>
              <input
                type="text"
                value={initials}
                onChange={(e) => setInitials(e.target.value)}
                required
                className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Banjar / Wilayah
              </span>
              <input
                type="text"
                value={banjar}
                onChange={(e) => setBanjar(e.target.value)}
                required
                className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Status Pendampingan
              </span>
              <select
                value={statusLabel}
                onChange={(e) =>
                  setStatusLabel(e.target.value as HarmonyFosterFamily['statusLabel'])
                }
                className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="Progres Baik">Progres Baik</option>
                <option value="Pemulihan Intensif">Pemulihan Intensif</option>
                <option value="Target Tercapai">Target Tercapai</option>
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Progres Pendampingan (%)
              </span>
              <input
                type="number"
                min={0}
                max={100}
                value={progressPct}
                onChange={(e) => setProgressPct(Number(e.target.value))}
                className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </label>
          </div>

          {category === 'ibu-hamil-kek' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="space-y-1">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Kondisi Awal (LILA / Hb)
                </span>
                <input
                  type="text"
                  value={baselineMetric}
                  onChange={(e) => setBaselineMetric(e.target.value)}
                  className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Kondisi Terkini (LILA / Hb)
                </span>
                <input
                  type="text"
                  value={currentMetric}
                  onChange={(e) => setCurrentMetric(e.target.value)}
                  className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </label>
            </div>
          ) : (
            <div className="space-y-2.5 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Data Kurva Bulanan (TB cm · BB kg · IMT &amp; Z-Score WHO Otomatis)
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Total {monthlyRows.length} bulan terdata
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    aria-label="Jenis Kelamin Anak (Standar WHO)"
                    value={childSex}
                    onChange={(e) => setChildSex(e.target.value as ChildSex)}
                    className="min-h-[34px] px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                  >
                    <option value="L">Laki-laki (WHO)</option>
                    <option value="P">Perempuan (WHO)</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddMonthRow}
                    className="min-h-[34px] px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Tambah Bulan</span>
                  </button>
                </div>
              </div>

              <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                {monthlyRows.map((row, idx) => {
                  const z = calculateHeightForAgeZScore(idx + 1, row.heightCm, childSex);
                  return (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-1.5 items-center bg-white dark:bg-[#0c162e] p-2 rounded-xl border border-slate-200 dark:border-slate-800"
                    >
                      <div className="col-span-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                        Bln {idx + 1}
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          step="0.1"
                          value={row.heightCm}
                          onChange={(e) => handleUpdateMonthRow(idx, 'heightCm', e.target.value)}
                          aria-label={`Tinggi bulan ${idx + 1}`}
                          className="w-full px-2 py-1.5 rounded-lg border border-red-200 dark:border-red-900 bg-transparent text-xs tabular-nums"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          step="0.1"
                          value={row.weightKg}
                          onChange={(e) => handleUpdateMonthRow(idx, 'weightKg', e.target.value)}
                          aria-label={`Berat bulan ${idx + 1}`}
                          className="w-full px-2 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-transparent text-xs tabular-nums"
                        />
                      </div>
                      <div className="col-span-3 text-[11px] font-bold text-center leading-tight tabular-nums">
                        <div className="text-blue-600 dark:text-blue-400">IMT {row.bmi}</div>
                        <div className={z < -2 ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}>
                          {formatZScore(z)}
                        </div>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveMonthRow(idx)}
                          disabled={monthlyRows.length <= 1}
                          aria-label={`Hapus bulan ${idx + 1}`}
                          className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-30 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <label className="block space-y-1">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Daftar Intervensi (pisahkan tiap baris)
            </span>
            <textarea
              rows={3}
              value={interventionsText}
              onChange={(e) => setInterventionsText(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm"
            />
          </label>

          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Pengisi Data Otomatis: <strong className="text-slate-800 dark:text-slate-200">{ADMIN_RELAWAN_NAME}</strong>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[42px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              id="btn-save-admin-family"
              type="submit"
              disabled={saving}
              className="min-h-[42px] px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              <span>Simpan ke Database</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;
};
