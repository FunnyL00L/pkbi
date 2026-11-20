import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  FileBarChart2,
  Filter,
  Search,
  CheckCircle2,
  CalendarClock,
  MapPin,
  Users,
  BookOpen,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  EccdActivityReportRow,
  EccdVillageAgendaItem,
  EccdVillageMarker,
} from '../../types';
import { KECAMATAN_LIST } from '../../data/bulelengData';
import {
  buildActivityReportRows,
  computeAggregatedReportSummary,
  filterActivityReportRows,
  paginateSlice,
} from '../../utils/eccdReportHelpers';

interface LaporanKegiatanPanelProps {
  villages: EccdVillageMarker[];
  initialKecamatanId?: string;
  initialVillageId?: string;
  onSelectVillageOnMap: (villageId: string) => void;
  onOpenAgendaArticle: (village: EccdVillageMarker, agenda: EccdVillageAgendaItem) => void;
}

const REPORT_PAGE_SIZE = 5;

export const LaporanKegiatanPanel: React.FC<LaporanKegiatanPanelProps> = ({
  villages,
  initialKecamatanId = 'all',
  initialVillageId = 'all',
  onSelectVillageOnMap,
  onOpenAgendaArticle,
}) => {
  const [selectedKecamatanId, setSelectedKecamatanId] = useState<string>(initialKecamatanId);
  const [selectedVillageId, setSelectedVillageId] = useState<string>(initialVillageId);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'Terlaksana' | 'Terjadwal'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);

  useEffect(() => {
    setSelectedKecamatanId(initialKecamatanId);
    setSelectedVillageId(initialVillageId);
  }, [initialKecamatanId, initialVillageId]);

  // Reset to Slide 1 whenever any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedKecamatanId, selectedVillageId, selectedStatus, searchQuery]);

  const availableVillages = useMemo(() => {
    if (selectedKecamatanId === 'all') return villages;
    return villages.filter((v) => v.kecamatanId === selectedKecamatanId);
  }, [villages, selectedKecamatanId]);

  const allRows = useMemo(() => buildActivityReportRows(villages), [villages]);

  const filteredRows = useMemo(
    () =>
      filterActivityReportRows(allRows, {
        kecamatanId: selectedKecamatanId,
        villageId: selectedVillageId,
        status: selectedStatus,
        query: searchQuery,
      }),
    [allRows, selectedKecamatanId, selectedVillageId, selectedStatus, searchQuery]
  );

  const paged = useMemo(
    () => paginateSlice(filteredRows, currentPage, REPORT_PAGE_SIZE),
    [filteredRows, currentPage]
  );

  const summary = useMemo(
    () =>
      computeAggregatedReportSummary(
        villages,
        filteredRows,
        selectedKecamatanId,
        selectedVillageId
      ),
    [villages, filteredRows, selectedKecamatanId, selectedVillageId]
  );

  const handleKecamatanChange = (kecId: string) => {
    setSelectedKecamatanId(kecId);
    setSelectedVillageId('all');
  };

  const handleResetFilters = () => {
    setSelectedKecamatanId('all');
    setSelectedVillageId('all');
    setSelectedStatus('all');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const goPrevSlide = () => {
    setCurrentPage((p) => Math.max(1, p - 1));
  };

  const goNextSlide = () => {
    setCurrentPage((p) => Math.min(paged.totalPages, p + 1));
  };

  const handleListTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
    touchStartYRef.current = e.targetTouches[0].clientY;
  };

  const handleListTouchEnd = (e: React.TouchEvent) => {
    const diffX = touchStartXRef.current - e.changedTouches[0].clientX;
    const diffY = Math.abs(touchStartYRef.current - e.changedTouches[0].clientY);
    if (Math.abs(diffX) > 55 && Math.abs(diffX) > diffY * 1.3) {
      if (diffX > 0 && paged.hasNext) {
        goNextSlide();
      } else if (diffX < 0 && paged.hasPrev) {
        goPrevSlide();
      }
    }
  };

  const findVillageAndAgenda = (row: EccdActivityReportRow) => {
    const village = villages.find((v) => v.id === row.villageId);
    const agenda = village?.agendaList.find((a) => a.id === row.agendaId);
    if (village && agenda) {
      onOpenAgendaArticle(village, agenda);
    }
  };

  // Compact window of slide indicators (max 5 dots/numbers)
  const visiblePageNumbers = useMemo(() => {
    const total = paged.totalPages;
    const curr = paged.currentPage;
    if (total <= 5) {
      return Array.from({ length: total }, (_, idx) => idx + 1);
    }
    const start = Math.max(1, Math.min(curr - 2, total - 4));
    return Array.from({ length: 5 }, (_, idx) => start + idx);
  }, [paged.totalPages, paged.currentPage]);

  return (
    <section id="laporan-kegiatan-panel" className="space-y-3 sm:space-y-5">
      {/* Live Aggregated Summary KPIs — Compact 2x2 on Mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <div className="p-2.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e]">
          <div className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
            Cakupan Desa
          </div>
          <div className="text-lg sm:text-3xl font-extrabold font-serif tabular-nums text-slate-900 dark:text-white mt-0.5 sm:mt-1">
            {summary.totalVillages}{' '}
            <span className="text-[10px] sm:text-xs font-sans font-semibold text-slate-500 dark:text-slate-400">
              Desa
            </span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-blue-700 dark:text-sky-400 mt-0.5 truncate">
            9 Kec. Buleleng
          </div>
        </div>

        <div className="p-2.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e]">
          <div className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
            Penerima Layanan
          </div>
          <div
            id="laporan-kpi-total-recipients"
            className="text-lg sm:text-3xl font-extrabold font-serif tabular-nums text-blue-700 dark:text-sky-400 mt-0.5 sm:mt-1"
          >
            {summary.totalRecipients.toLocaleString('id-ID')}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 tabular-nums truncate">
            L:{summary.totalMale.toLocaleString('id-ID')} · P:{summary.totalFemale.toLocaleString('id-ID')}
          </div>
        </div>

        <div className="p-2.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e]">
          <div className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
            Rekap Agenda
          </div>
          <div
            id="laporan-kpi-total-agendas"
            className="text-lg sm:text-3xl font-extrabold font-serif tabular-nums text-slate-900 dark:text-white mt-0.5 sm:mt-1"
          >
            {summary.totalAgendas}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 tabular-nums truncate">
            {summary.completedAgendas} Selesai · {summary.scheduledAgendas} Jadwal
          </div>
        </div>

        <div className="p-2.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e]">
          <div className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
            Partisipasi Warga
          </div>
          <div className="text-lg sm:text-3xl font-extrabold font-serif tabular-nums text-emerald-700 dark:text-emerald-400 mt-0.5 sm:mt-1">
            {summary.totalAgendaParticipants.toLocaleString('id-ID')}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            Warga &amp; remaja desa
          </div>
        </div>
      </div>

      {/* Filter Toolbar — Compact 2x2 Grid on Mobile + Icon-Only Reset */}
      <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] space-y-2.5 sm:space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 min-w-0 truncate">
            <Filter size={13} className="text-blue-600 dark:text-sky-400 shrink-0" />
            <span className="truncate">Filter Rekap</span>
          </div>

          <button
            type="button"
            onClick={handleResetFilters}
            aria-label="Reset Filter"
            title="Reset Filter"
            className="min-h-[34px] min-w-[34px] sm:min-h-[36px] px-2 sm:px-3 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <RotateCcw size={13} />
            <span className="hidden sm:inline">Reset Filter</span>
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          <div>
            <label
              htmlFor="laporan-filter-kecamatan"
              className="block text-[10px] sm:text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1"
            >
              Kecamatan
            </label>
            <select
              id="laporan-filter-kecamatan"
              value={selectedKecamatanId}
              onChange={(e) => handleKecamatanChange(e.target.value)}
              className="w-full min-h-[36px] sm:min-h-[42px] px-2 sm:px-3 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-blue-600"
            >
              <option value="all">Semua Kec.</option>
              {KECAMATAN_LIST.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.name.replace('Kecamatan ', '')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="laporan-filter-desa"
              className="block text-[10px] sm:text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1"
            >
              Desa
            </label>
            <select
              id="laporan-filter-desa"
              value={selectedVillageId}
              onChange={(e) => setSelectedVillageId(e.target.value)}
              className="w-full min-h-[36px] sm:min-h-[42px] px-2 sm:px-3 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-blue-600"
            >
              <option value="all">Semua ({availableVillages.length})</option>
              {availableVillages.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name.replace(/^(Desa|Kelurahan)\s+/i, '')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="laporan-filter-status"
              className="block text-[10px] sm:text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1"
            >
              Status
            </label>
            <select
              id="laporan-filter-status"
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value as 'all' | 'Terlaksana' | 'Terjadwal')
              }
              className="w-full min-h-[36px] sm:min-h-[42px] px-2 sm:px-3 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-blue-600"
            >
              <option value="all">Semua</option>
              <option value="Terlaksana">Terlaksana</option>
              <option value="Terjadwal">Terjadwal</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="laporan-search-input"
              className="block text-[10px] sm:text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1"
            >
              Cari
            </label>
            <div className="flex items-center gap-1.5 min-h-[36px] sm:min-h-[42px] px-2 sm:px-3 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
              <Search size={13} className="text-slate-400 shrink-0" />
              <input
                id="laporan-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari agenda..."
                className="w-full bg-transparent outline-none text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Activity Report List — Strictly 5 Items per Slide with Swipe + Prev/Next Controls */}
      <div className="rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] overflow-hidden">
        <div className="px-3 sm:px-5 py-2.5 sm:py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
              <FileBarChart2 size={15} className="text-blue-600 dark:text-sky-400 shrink-0" />
              <span className="truncate">Rekap Layanan &amp; Agenda ({filteredRows.length})</span>
            </h3>
            {filteredRows.length > 0 && (
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 tabular-nums mt-0.5">
                Menampilkan {paged.startIndex}–{paged.endIndex} dari {paged.totalItems} · Slide{' '}
                {paged.currentPage}/{paged.totalPages}
              </p>
            )}
          </div>

          {paged.totalPages > 1 && (
            <div className="flex items-center gap-1 shrink-0">
              <button
                id="btn-laporan-prev-slide-top"
                type="button"
                onClick={goPrevSlide}
                disabled={!paged.hasPrev}
                aria-label="Slide rekap sebelumnya"
                title="Slide sebelumnya"
                className="min-h-[34px] min-w-[34px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 disabled:opacity-35 hover:border-blue-500 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                id="btn-laporan-next-slide-top"
                type="button"
                onClick={goNextSlide}
                disabled={!paged.hasNext}
                aria-label="Slide rekap berikutnya"
                title="Slide berikutnya"
                className="min-h-[34px] min-w-[34px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 disabled:opacity-35 hover:border-blue-500 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {filteredRows.length === 0 ? (
          <div className="p-6 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Tidak ada kegiatan yang sesuai filter. Klik Reset untuk melihat semua.
          </div>
        ) : (
          <>
            <div
              id="laporan-rekap-list"
              data-testid="laporan-rekap-list"
              data-page={String(paged.currentPage)}
              data-total-pages={String(paged.totalPages)}
              data-visible-rows={String(paged.items.length)}
              onTouchStart={handleListTouchStart}
              onTouchEnd={handleListTouchEnd}
              className="divide-y divide-slate-100 dark:divide-slate-800"
            >
              {paged.items.map((row) => {
                const isDone = row.status === 'Terlaksana';
                return (
                  <div
                    key={row.agendaId}
                    data-testid="laporan-rekap-row"
                    className="p-3 sm:px-5 sm:py-4 hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors flex items-center justify-between gap-2.5 sm:gap-4"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] sm:text-xs">
                        <span
                          className={`inline-flex items-center gap-1 font-bold ${
                            isDone
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          {isDone ? <CheckCircle2 size={12} /> : <CalendarClock size={12} />}
                          <span>{row.status}</span>
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="font-semibold text-blue-700 dark:text-sky-400 truncate max-w-[140px] sm:max-w-none">
                          {row.villageName}
                        </span>
                        <span className="hidden sm:inline text-slate-400">·</span>
                        <span className="hidden sm:inline text-slate-600 dark:text-slate-400">
                          {row.kecamatanName}
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-base font-bold font-serif text-slate-900 dark:text-white leading-snug line-clamp-1 sm:line-clamp-none">
                        {row.title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-x-2.5 sm:gap-x-4 gap-y-0.5 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400">
                        <span className="truncate">{row.displayDate}</span>
                        <span className="hidden sm:flex items-center gap-1">
                          <MapPin size={12} className="text-rose-500" />
                          <span>{row.location}</span>
                        </span>
                        <span className="flex items-center gap-1 tabular-nums">
                          <Users size={11} className="text-blue-600 dark:text-sky-400 shrink-0" />
                          <span>
                            {row.participants} peserta
                            <span className="hidden sm:inline">
                              {' '}
                              (Layanan Desa: {row.villageTotalRecipients} · L:{row.lakiLaki} / P:
                              {row.perempuan})
                            </span>
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Icon-only buttons on mobile (< sm), full labeled buttons on desktop */}
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onSelectVillageOnMap(row.villageId)}
                        aria-label={`Lihat titik ${row.villageName} di peta`}
                        title={`Lihat titik ${row.villageName}`}
                        className="min-h-[36px] min-w-[36px] sm:min-h-[38px] sm:px-3 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-500 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <MapPin size={14} className="text-blue-600 dark:text-sky-400 shrink-0" />
                        <span className="hidden sm:inline">Lihat Titik Desa</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => findVillageAndAgenda(row)}
                        aria-label={`Baca artikel ${row.title}`}
                        title="Baca artikel lengkap"
                        className="min-h-[36px] min-w-[36px] sm:min-h-[38px] sm:px-3 rounded-lg sm:rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <BookOpen size={14} className="shrink-0" />
                        <span className="hidden sm:inline">Baca Artikel</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Slide Navigation Bar */}
            {paged.totalPages > 1 && (
              <div className="px-3 sm:px-5 py-2.5 sm:py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/50 flex items-center justify-between gap-2">
                <button
                  id="btn-laporan-prev-slide"
                  type="button"
                  onClick={goPrevSlide}
                  disabled={!paged.hasPrev}
                  aria-label="Halaman sebelumnya"
                  className="min-h-[36px] px-2.5 sm:px-3.5 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c162e] text-xs font-semibold text-slate-700 dark:text-slate-200 disabled:opacity-40 hover:border-blue-500 flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={15} />
                  <span className="hidden sm:inline">Sebelumnya</span>
                </button>

                <div className="flex items-center gap-1">
                  {visiblePageNumbers.map((pageNum) => {
                    const isActive = pageNum === paged.currentPage;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        aria-label={`Slide halaman ${pageNum}`}
                        aria-current={isActive ? 'page' : undefined}
                        className={`min-h-[32px] min-w-[32px] px-2 rounded-lg text-xs font-bold tabular-nums transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white dark:bg-[#0c162e] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-500'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {paged.totalPages > 5 && visiblePageNumbers[visiblePageNumbers.length - 1] < paged.totalPages && (
                    <span className="px-1 text-[11px] font-semibold text-slate-400 tabular-nums">
                      /{paged.totalPages}
                    </span>
                  )}
                </div>

                <button
                  id="btn-laporan-next-slide"
                  type="button"
                  onClick={goNextSlide}
                  disabled={!paged.hasNext}
                  aria-label="Halaman berikutnya"
                  className="min-h-[36px] px-2.5 sm:px-3.5 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c162e] text-xs font-semibold text-slate-700 dark:text-slate-200 disabled:opacity-40 hover:border-blue-500 flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                >
                  <span className="hidden sm:inline">Berikutnya</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};
