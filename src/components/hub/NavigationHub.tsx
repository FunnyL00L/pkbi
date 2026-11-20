import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  HeartHandshake,
  ClipboardCheck,
  BookOpen,
  MessageSquareHeart,
  SlidersHorizontal,
  Compass,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { BrandLogo } from '../layout/BrandLogo';
import { ContentCategory } from '../../types';
import { useAppTheme } from '../../context/ThemeContext';
import { I18N } from '../../constants/i18n';

interface NavigationHubProps {
  activeCategory: ContentCategory | null;
  onSelectCategory: (cat: ContentCategory) => void;
}

interface HubProgramItem {
  id: ContentCategory;
  shortTitle: string;
  title: string;
  angle: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const HUB_PROGRAMS: HubProgramItem[] = [
  {
    id: 'map',
    shortTitle: 'Peta ECCD',
    title: 'Layanan Mobile Project ECCD Buleleng (9 Kecamatan)',
    angle: -90,
    icon: MapPin,
  },
  {
    id: 'desa-harmony',
    shortTitle: 'Desa Harmony',
    title: 'Desa Harmony: 6 Keluarga Asuh, Posyandu & Remaja',
    angle: -18,
    icon: HeartHandshake,
  },
  {
    id: 'catin',
    shortTitle: 'Skrining Catin',
    title: 'Layanan & Skrining Calon Pengantin (Anemia & KEK)',
    angle: 54,
    icon: ClipboardCheck,
  },
  {
    id: 'edukasi-kespro',
    shortTitle: 'Edukasi Kespro',
    title: 'Edukasi Kesehatan Reproduksi & Galeri Multimedia',
    angle: 126,
    icon: BookOpen,
  },
  {
    id: 'qna',
    shortTitle: 'QnA Rahasia',
    title: 'Konsultasi Terkategori & FAQ PKBI Buleleng',
    angle: 198,
    icon: MessageSquareHeart,
  },
];

export const NavigationHub: React.FC<NavigationHubProps> = ({
  activeCategory,
  onSelectCategory,
}) => {
  const { toggleSettings, language } = useAppTheme();
  const t = I18N[language];
  const [isOrbitExpanded, setIsOrbitExpanded] = useState<boolean>(true);
  const [focusedProgram, setFocusedProgram] = useState<HubProgramItem>(HUB_PROGRAMS[0]);

  return (
    <div className="min-h-[calc(100dvh-5rem)] flex flex-col bg-slate-50 dark:bg-[#060c1c] text-slate-900 dark:text-slate-50 transition-colors">
      {/* Compact Top Utility Bar */}
      <header className="w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-[#070e22]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto h-13 sm:h-16 px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <BrandLogo size={30} />
            <span className="font-serif font-bold text-sm sm:text-lg text-slate-900 dark:text-white whitespace-nowrap truncate">
              {t.portalName}
            </span>
          </div>

          <button
            id="btn-top-right-settings-hub"
            type="button"
            onClick={toggleSettings}
            className="min-h-[38px] min-w-[38px] sm:min-h-[44px] sm:px-3.5 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 text-xs font-semibold transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-blue-600"
            aria-label={t.settings}
            title={t.settings}
          >
            <SlidersHorizontal size={16} className="text-blue-600 dark:text-sky-400" />
            <span className="hidden sm:inline">{t.settings}</span>
          </button>
        </div>
      </header>

      {/* Centerpiece Hero: 5-Node Orbital Menu Project ECCD Highlight */}
      <div className="flex-1 flex flex-col items-center justify-center px-3 sm:px-4 py-4 sm:py-10">
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center text-center space-y-3.5 sm:space-y-6">
          <div className="space-y-1 sm:space-y-2">
            <p className="text-[11px] sm:text-sm font-semibold text-blue-700 dark:text-sky-400 tracking-wide">
              {t.hub.eyebrow}
            </p>
            <h1
              className="font-serif font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]"
              style={{
                fontSize: 'clamp(1.35rem, 3.4vw, 2.75rem)',
                textWrap: 'balance',
              }}
            >
              {t.hub.headline}
            </h1>
            <p className="hidden sm:block text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
              {t.hub.subheadline}
            </p>
          </div>

          {/* Highlight Card Containing 5-Node Radial Menu Lingkaran PKBI */}
          <div className="w-full max-w-[440px] rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] p-3.5 sm:p-7 shadow-lg flex flex-col items-center">
            <div className="w-full flex items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <span className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                <Compass size={14} className="text-blue-600 dark:text-sky-400 shrink-0" />
                <span className="truncate">Menu Project ECCD (5 Modul)</span>
              </span>
              <button
                id="btn-toggle-orbit-hub"
                type="button"
                onClick={() => setIsOrbitExpanded((prev) => !prev)}
                aria-label={isOrbitExpanded ? t.hub.closeMenu : t.hub.openMenu}
                title={isOrbitExpanded ? t.hub.closeMenu : t.hub.openMenu}
                className="min-h-[34px] min-w-[34px] sm:min-h-[38px] sm:px-3.5 rounded-lg sm:rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1 cursor-pointer shrink-0"
              >
                <span className="sm:hidden">
                  {isOrbitExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </span>
                <span className="hidden sm:inline">
                  {isOrbitExpanded ? t.hub.closeMenu : t.hub.openMenu}
                </span>
              </button>
            </div>

            {/* Orbital Dial Stage — Responsive Scale for Mobile Android */}
            <div className="relative w-[290px] h-[290px] sm:w-[376px] sm:h-[376px] my-2 sm:my-4 flex items-center justify-center scale-[0.92] sm:scale-100">
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 360 360"
              >
                <circle
                  cx="180"
                  cy="180"
                  r="122"
                  fill="none"
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-800"
                  strokeWidth="1.5"
                  strokeDasharray="4 6"
                />
                {isOrbitExpanded &&
                  HUB_PROGRAMS.map((item) => {
                    const rad = (item.angle * Math.PI) / 180;
                    const x2 = 180 + 122 * Math.cos(rad);
                    const y2 = 180 + 122 * Math.sin(rad);
                    const isFocused = focusedProgram.id === item.id;
                    return (
                      <line
                        key={`beam-${item.id}`}
                        x1="180"
                        y1="180"
                        x2={x2}
                        y2={y2}
                        stroke="currentColor"
                        className={
                          isFocused
                            ? 'text-blue-600 dark:text-sky-400'
                            : 'text-slate-300 dark:text-slate-700'
                        }
                        strokeWidth={isFocused ? 2.2 : 1.2}
                      />
                    );
                  })}
              </svg>

              {/* Center PKBI Emblem Trigger */}
              <button
                id="btn-radial-center-logo"
                type="button"
                onClick={() => setIsOrbitExpanded((prev) => !prev)}
                aria-label="Toggle Menu Layanan Project ECCD"
                className="relative z-20 w-20 h-20 sm:w-26 sm:h-26 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-sky-400 shadow-lg flex flex-col items-center justify-center p-2 cursor-pointer hover:scale-105 active:scale-95 transition-transform focus-visible:outline-2 focus-visible:outline-blue-600"
              >
                <BrandLogo size={44} />
                <span className="text-[9.5px] sm:text-[10px] font-bold text-blue-700 dark:text-sky-300 mt-0.5 leading-none">
                  ECCD
                </span>
              </button>

              {/* 5 Orbiting Program Nodes */}
              <AnimatePresence>
                {isOrbitExpanded &&
                  HUB_PROGRAMS.map((item) => {
                    const rad = (item.angle * Math.PI) / 180;
                    const radius = 104;
                    const tx = Math.round(radius * Math.cos(rad));
                    const ty = Math.round(radius * Math.sin(rad));
                    const Icon = item.icon;
                    const isFocused =
                      activeCategory === item.id || focusedProgram.id === item.id;

                    return (
                      <motion.button
                        key={item.id}
                        id={`btn-hub-card-${item.id}`}
                        type="button"
                        initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
                        animate={{ x: tx, y: ty, opacity: 1, scale: 1 }}
                        exit={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        onClick={() => onSelectCategory(item.id)}
                        onMouseEnter={() => setFocusedProgram(item)}
                        onFocus={() => setFocusedProgram(item)}
                        aria-label={item.title}
                        className={`absolute z-30 w-[76px] h-[76px] sm:w-[92px] sm:h-[92px] rounded-full flex flex-col items-center justify-center p-1.5 sm:p-2 text-center shadow-lg border cursor-pointer transition-transform hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-blue-600 ${
                          isFocused
                            ? 'bg-blue-600 text-white border-blue-400 ring-4 ring-blue-500/25'
                            : 'bg-slate-900 dark:bg-slate-800 text-white border-slate-700 hover:bg-blue-700'
                        }`}
                      >
                        <Icon size={18} />
                        <span className="text-[9.5px] sm:text-[10.5px] font-semibold leading-tight mt-1 line-clamp-2">
                          {item.shortTitle}
                        </span>
                      </motion.button>
                    );
                  })}
              </AnimatePresence>
            </div>

            <div className="pt-2.5 sm:pt-3 border-t border-slate-100 dark:border-slate-800 w-full flex items-center justify-between gap-2 text-left">
              <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-snug line-clamp-2">
                {isOrbitExpanded ? focusedProgram.title : t.hub.tapPrompt}
              </p>
              <button
                type="button"
                onClick={() => onSelectCategory(focusedProgram.id)}
                aria-label={t.hub.openModule}
                title={t.hub.openModule}
                className="min-h-[36px] min-w-[36px] sm:min-h-[38px] px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span className="hidden sm:inline">{t.hub.openModule}</span>
                <ArrowRight size={15} className="sm:hidden" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
