import React from 'react';
import {
  MapPin,
  Calendar,
  Users,
  Building2,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  X,
  Layers,
  BookOpen,
} from 'lucide-react';
import { KecamatanInfo, KecamatanActivity } from '../../types';
import { SafeImage } from '../ui/SafeImage';
import { useAppTheme } from '../../context/ThemeContext';
import { I18N } from '../../constants/i18n';

interface MapInspectorPanelProps {
  selectedKecamatan: KecamatanInfo;
  selectedActivity: KecamatanActivity;
  isSariMekarFocused: boolean;
  onToggleSariMekar: () => void;
  onOpenArticle: () => void;
  onOpenDetail: (kec: KecamatanInfo) => void;
  onClearSelection: () => void;
  isMobileExpanded: boolean;
  onToggleMobileExpand: () => void;
}

export const MapInspectorPanel: React.FC<MapInspectorPanelProps> = ({
  selectedKecamatan,
  selectedActivity,
  isSariMekarFocused,
  onToggleSariMekar,
  onOpenArticle,
  onOpenDetail,
  onClearSelection,
  isMobileExpanded,
  onToggleMobileExpand,
}) => {
  const { language } = useAppTheme();
  const t = I18N[language];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0c162e] text-slate-900 dark:text-slate-50 rounded-t-3xl lg:rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg lg:shadow-sm">
      {/* Mobile Android Drag Handle */}
      <div className="lg:hidden flex justify-center pt-2 pb-1">
        <div className="w-10 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
      </div>

      {/* Inspector Header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 bg-slate-50/80 dark:bg-slate-900/60">
        <div className="min-w-0">
          <div className="text-xs font-medium text-blue-700 dark:text-sky-400 truncate">
            {selectedActivity.category} · {selectedKecamatan.capital}
          </div>
          <h3 className="text-base sm:text-lg font-bold font-serif text-slate-900 dark:text-white truncate">
            {selectedKecamatan.name}
          </h3>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onToggleMobileExpand}
            aria-label={isMobileExpanded ? t.map.collapseSheet : t.map.expandSheet}
            className="lg:hidden min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            {isMobileExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            <span>{isMobileExpanded ? t.map.collapseSheet : t.map.expandSheet}</span>
          </button>

          <button
            id="btn-close-highlight-card"
            type="button"
            onClick={onClearSelection}
            aria-label="Tutup panel kecamatan"
            className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Scrollable Body */}
      <div
        className={`${
          isMobileExpanded ? 'block' : 'hidden lg:block'
        } flex-1 overflow-y-auto p-4 space-y-4`}
      >
        {/* Golden Ratio Photo Frame */}
        <div className="relative aspect-golden w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
          <SafeImage src={selectedActivity.imageUrl} alt={selectedActivity.title} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 text-white space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-sky-200 font-medium">
              <Calendar size={13} />
              <span>
                {selectedActivity.hari}, {selectedActivity.tanggal}
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-bold font-serif leading-snug">
              {selectedActivity.title}
            </h4>
          </div>
        </div>

        {/* Location & Participation */}
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex items-start gap-2">
            <MapPin size={15} className="text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="text-slate-500 dark:text-slate-400 block">Lokasi</span>
              <strong className="text-slate-900 dark:text-slate-100 leading-snug block">
                {selectedActivity.location}
              </strong>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex items-start gap-2">
            <Users size={15} className="text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="text-slate-500 dark:text-slate-400 block">Partisipasi</span>
              <strong className="text-slate-900 dark:text-slate-100 tabular-nums leading-snug block">
                {selectedActivity.participants} Peserta
              </strong>
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {selectedActivity.description}
        </p>

        {/* Blogger Article Trigger */}
        <button
          id="btn-baca-artikel-map"
          type="button"
          onClick={onOpenArticle}
          className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-950/70 text-blue-800 dark:text-sky-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <BookOpen size={15} />
          <span>Baca Artikel Dokumentasi Lengkap</span>
        </button>

        {/* Quick Demographic Strip */}
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 py-2 border-y border-slate-200 dark:border-slate-800 tabular-nums">
          <span className="flex items-center gap-1.5">
            <Layers size={14} className="text-blue-600 dark:text-sky-400" />
            Luas {selectedKecamatan.areaKm2} km²
          </span>
          <span className="font-medium text-slate-800 dark:text-slate-200">
            {selectedKecamatan.population.toLocaleString('id-ID')} jiwa
          </span>
        </div>

        {/* Sari Mekar Focus Action */}
        {selectedKecamatan.id === 'buleleng' && (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-bold text-amber-950 dark:text-amber-200">
                Desa Binaan Utama: Sari Mekar
              </div>
              <div className="text-xs text-amber-800 dark:text-amber-300 tabular-nums">
                Stunting turun 17,6% ke 6,7% · 35 Orang Tua Asuh
              </div>
            </div>
            <button
              type="button"
              onClick={onToggleSariMekar}
              className="min-h-[40px] px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shrink-0 cursor-pointer transition-colors"
            >
              {isSariMekarFocused ? 'Agenda Umum' : 'Fokus Sari Mekar'}
            </button>
          </div>
        )}
      </div>

      {/* Primary Action Footer */}
      <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e]">
        <button
          id="btn-buka-laman-detail-wilayah"
          type="button"
          onClick={() => onOpenDetail(selectedKecamatan)}
          className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Building2 size={16} />
          <span className="truncate">{t.map.openDistrictDetail}</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
