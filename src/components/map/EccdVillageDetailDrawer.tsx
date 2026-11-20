import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Users,
  Calendar,
  MapPin,
  FileBarChart2,
  BookOpen,
  Clock,
  CheckCircle2,
  CalendarClock,
  HeartPulse,
  ArrowRight,
  Image as ImageIcon,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react';
import { EccdVillageAgendaItem, EccdVillageMarker } from '../../types';
import { SafeImage } from '../ui/SafeImage';

interface EccdVillageDetailDrawerProps {
  village: EccdVillageMarker | null;
  onClose: () => void;
  onOpenReportForVillage: (village: EccdVillageMarker) => void;
  onOpenAgendaArticle: (village: EccdVillageMarker, agenda: EccdVillageAgendaItem) => void;
  isAdminMode?: boolean;
  onAddAgenda?: (village: EccdVillageMarker) => void;
  onEditAgenda?: (village: EccdVillageMarker, agenda: EccdVillageAgendaItem) => void;
  onDeleteAgenda?: (village: EccdVillageMarker, agenda: EccdVillageAgendaItem) => void;
}

export const EccdVillageDetailDrawer: React.FC<EccdVillageDetailDrawerProps> = ({
  village,
  onClose,
  onOpenReportForVillage,
  onOpenAgendaArticle,
  isAdminMode = false,
  onAddAgenda,
  onEditAgenda,
  onDeleteAgenda,
}) => {
  const [activeTab, setActiveTab] = useState<'layanan' | 'agenda'>('layanan');

  useEffect(() => {
    setActiveTab('layanan');
  }, [village?.id]);

  if (!village) return null;

  const { serviceData, agendaList } = village;
  const totalRecipients = Math.max(1, serviceData.totalRecipients);
  const malePct = Math.round((serviceData.genderBreakdown.lakiLaki / totalRecipients) * 100);
  const femalePct = 100 - malePct;

  const drawerContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="eccd-village-drawer-title"
      className="fixed inset-0 z-[70] flex justify-end bg-slate-950/60 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl h-full bg-white dark:bg-[#081024] text-slate-900 dark:text-slate-100 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Sticky Drawer Header */}
        <header
          className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#081024]/95 flex items-start justify-between gap-3 shrink-0"
          style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))' }}
        >
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-blue-700 dark:text-sky-400">
              <span>{village.kecamatanName}</span>
              <span>·</span>
              <span>{village.statusProgram}</span>
            </div>
            <h2
              id="eccd-village-drawer-title"
              className="text-xl sm:text-2xl font-extrabold font-serif text-slate-900 dark:text-white leading-tight"
            >
              {village.name}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {village.deskripsi}
            </p>
          </div>

          <button
            id="btn-close-village-drawer"
            type="button"
            onClick={onClose}
            aria-label="Tutup detail desa"
            className="min-h-[44px] min-w-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 cursor-pointer"
          >
            <X size={18} />
          </button>
        </header>

        {/* Sub-metrics Strip */}
        <div className="grid grid-cols-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 text-center shrink-0">
          <div className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-800">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Penduduk</div>
            <div className="text-sm font-bold tabular-nums text-slate-900 dark:text-white">
              {village.population.toLocaleString('id-ID')}
            </div>
          </div>
          <div className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-800">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Posyandu</div>
            <div className="text-sm font-bold tabular-nums text-slate-900 dark:text-white">
              {village.posyanduCount} Titik
            </div>
          </div>
          <div className="py-2.5 px-2">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Prevalensi Stunting</div>
            <div className="text-sm font-bold tabular-nums text-blue-700 dark:text-sky-400">
              {village.stuntingPct}%
            </div>
          </div>
        </div>

        {/* 2 Primary Tabs: Data Layanan | Agenda Kegiatan */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#081024] shrink-0">
          <div
            role="tablist"
            aria-label="Detail Desa ECCD"
            className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
          >
            <button
              id="tab-village-data-layanan"
              role="tab"
              aria-selected={activeTab === 'layanan'}
              type="button"
              onClick={() => setActiveTab('layanan')}
              className={`min-h-[42px] px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'layanan'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users size={15} />
              <span>Data Layanan</span>
            </button>

            <button
              id="tab-village-agenda-kegiatan"
              role="tab"
              aria-selected={activeTab === 'agenda'}
              type="button"
              onClick={() => setActiveTab('agenda')}
              className={`min-h-[42px] px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'agenda'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calendar size={15} />
              <span>Agenda Kegiatan ({agendaList.length})</span>
            </button>
          </div>
        </div>

        {/* Scrollable Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {activeTab === 'layanan' && (
            <div id="panel-village-data-layanan" className="space-y-5">
              {/* Total Penerima Layanan Highlight */}
              <div className="p-4 sm:p-5 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/75 dark:bg-blue-950/35 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-sky-400">
                    Total Penerima Layanan ECCD
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold font-serif tabular-nums text-slate-900 dark:text-white mt-1">
                    {serviceData.totalRecipients.toLocaleString('id-ID')}{' '}
                    <span className="text-sm font-sans font-semibold text-slate-600 dark:text-slate-300">
                      Jiwa
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Pembaruan data lapangan: {serviceData.lastUpdated}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <HeartPulse size={22} />
                </div>
              </div>

              {/* Gender Demographic Split */}
              <section className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-200">
                    Demografi Jenis Kelamin Penerima
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                    {serviceData.totalRecipients} Total
                  </span>
                </div>

                <div className="h-3 w-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex">
                  <div
                    className="bg-blue-600 dark:bg-sky-500 transition-all"
                    style={{ width: `${malePct}%` }}
                  />
                  <div
                    className="bg-rose-500 dark:bg-rose-400 transition-all"
                    style={{ width: `${femalePct}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <div className="text-slate-500 dark:text-slate-400">Laki-laki</div>
                    <div className="text-lg font-extrabold tabular-nums text-blue-700 dark:text-sky-400">
                      {serviceData.genderBreakdown.lakiLaki}{' '}
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        ({malePct}%)
                      </span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <div className="text-slate-500 dark:text-slate-400">Perempuan</div>
                    <div className="text-lg font-extrabold tabular-nums text-rose-600 dark:text-rose-400">
                      {serviceData.genderBreakdown.perempuan}{' '}
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        ({femalePct}%)
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Age Groups Breakdown */}
              <section className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Sebaran Rentang Usia Penerima Layanan
                </h3>
                <div className="space-y-2.5">
                  {serviceData.ageGroups.map((group) => {
                    const pct = Math.round((group.count / totalRecipients) * 100);
                    return (
                      <div key={group.label} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {group.label}
                          </span>
                          <span className="font-bold tabular-nums text-slate-900 dark:text-white">
                            {group.count} Jiwa ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-600 dark:bg-sky-400"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Service Types Received */}
              <section className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Jenis Layanan ECCD yang Diterima
                </h3>
                <ul className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                  {serviceData.serviceTypes.map((srv) => (
                    <li
                      key={srv.serviceName}
                      className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                    >
                      <span className="text-slate-700 dark:text-slate-200 font-medium">
                        {srv.serviceName}
                      </span>
                      <span className="font-bold tabular-nums text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                        {srv.count} Layanan
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          )}

          {activeTab === 'agenda' && (
            <div id="panel-village-agenda-kegiatan" className="space-y-4">
              {isAdminMode && onAddAgenda && (
                <button
                  id="btn-drawer-admin-add-agenda"
                  type="button"
                  onClick={() => onAddAgenda(village)}
                  className="w-full min-h-[42px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Plus size={16} />
                  <span>Tambah Kegiatan di {village.name}</span>
                </button>
              )}

              {agendaList.length === 0 && (
                <div className="p-5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500 dark:text-slate-400">
                  Belum ada agenda kegiatan tercatat untuk desa ini.
                </div>
              )}

              {agendaList.map((agenda) => {
                const isDone = agenda.status === 'Terlaksana';
                return (
                  <article
                    key={agenda.id}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] space-y-3.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span
                        className={`inline-flex items-center gap-1.5 font-bold ${
                          isDone
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        {isDone ? <CheckCircle2 size={14} /> : <CalendarClock size={14} />}
                        <span>{agenda.status}</span>
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        {agenda.displayDate}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold font-serif text-slate-900 dark:text-white leading-snug">
                      {agenda.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {agenda.summary}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-rose-600 dark:text-rose-400 shrink-0" />
                        <span className="truncate">{agenda.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-blue-600 dark:text-sky-400 shrink-0" />
                        <span>{agenda.time}</span>
                      </div>
                    </div>

                    {/* Gallery Photos */}
                    {agenda.galleryImages.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <ImageIcon size={12} />
                          <span>Galeri Dokumentasi Kegiatan ({agenda.galleryImages.length})</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {agenda.galleryImages.map((img, idx) => (
                            <div
                              key={idx}
                              className="aspect-golden rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900"
                            >
                              <SafeImage src={img} alt={`${agenda.title} - foto ${idx + 1}`} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold tabular-nums text-slate-700 dark:text-slate-300">
                        {agenda.participants} Peserta Terdata
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isAdminMode && onEditAgenda && (
                          <button
                            type="button"
                            onClick={() => onEditAgenda(village, agenda)}
                            aria-label={`Edit kegiatan ${agenda.title}`}
                            className="min-h-[36px] min-w-[36px] rounded-xl border border-blue-200 dark:border-sky-800 bg-blue-50 dark:bg-sky-950/50 text-blue-700 dark:text-sky-300 flex items-center justify-center cursor-pointer"
                          >
                            <Pencil size={14} />
                          </button>
                        )}
                        {isAdminMode && onDeleteAgenda && (
                          <button
                            type="button"
                            onClick={() => onDeleteAgenda(village, agenda)}
                            aria-label={`Hapus kegiatan ${agenda.title}`}
                            className="min-h-[36px] min-w-[36px] rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 flex items-center justify-center cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onOpenAgendaArticle(village, agenda)}
                          className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          <BookOpen size={13} />
                          <span>Baca Artikel</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Sticky Footer Linking Directly to Laporan Kegiatan */}
        <footer
          className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#060c1c] flex items-center justify-between gap-3 shrink-0"
          style={{ paddingBottom: 'calc(0.875rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <button
            id="btn-drawer-to-laporan"
            type="button"
            onClick={() => onOpenReportForVillage(village)}
            className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 dark:bg-sky-500 hover:bg-slate-800 dark:hover:bg-sky-400 text-white dark:text-slate-950 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <FileBarChart2 size={16} />
            <span>Buka Rekap di Laporan Kegiatan</span>
            <ArrowRight size={15} />
          </button>
        </footer>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(drawerContent, document.body) : drawerContent;
};
