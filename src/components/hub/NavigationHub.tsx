import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  TrendingDown,
  MessageSquare,
  BookOpen,
  SlidersHorizontal,
  Compass,
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
    shortTitle: 'Peta Buleleng',
    title: 'Peta Wilayah 9 Kecamatan',
    angle: 225,
    icon: MapPin,
  },
  {
    id: 'desa-binaan',
    shortTitle: 'Sari Mekar',
    title: 'Desa Binaan Sari Mekar',
    angle: 315,
    icon: TrendingDown,
  },
  {
    id: 'pendaftaran-qa',
    shortTitle: 'Daftar & Chat',
    title: 'Pendaftaran Catin & Konsultasi WA',
    angle: 45,
    icon: MessageSquare,
  },
  {
    id: 'edukasi-interaktif',
    shortTitle: 'Edukasi IMS',
    title: 'Edukasi Penyakit Seksual & Video',
    angle: 135,
    icon: BookOpen,
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
        <div className="max-w-7xl mx-auto h-14 sm:h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <BrandLogo size={34} />
            <span className="font-serif font-bold text-base sm:text-lg text-slate-900 dark:text-white whitespace-nowrap truncate">
              {t.portalName}
            </span>
          </div>

          <button
            id="btn-top-right-settings-hub"
            type="button"
            onClick={toggleSettings}
            className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-2 text-xs font-semibold transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-blue-600"
            aria-label={t.settings}
          >
            <SlidersHorizontal size={16} className="text-blue-600 dark:text-sky-400" />
            <span>{t.settings}</span>
          </button>
        </div>
      </header>

      {/* Centerpiece Hero: Orbital Menu PKBI Highlight */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center space-y-6">
          <div className="space-y-2">
            <p className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-sky-400 tracking-wide">
              {t.hub.eyebrow}
            </p>
            <h1
              className="font-serif font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]"
              style={{
                fontSize: 'clamp(1.65rem, 3.4vw, 2.75rem)',
                textWrap: 'balance',
              }}
            >
              {t.hub.headline}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              {t.hub.subheadline}
            </p>
          </div>

          {/* Highlight Card Containing Radial Menu Lingkaran PKBI */}
          <div className="w-full max-w-[440px] rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] p-5 sm:p-7 shadow-lg flex flex-col items-center">
            <div className="w-full flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <Compass size={15} className="text-blue-600 dark:text-sky-400" />
                <span>Menu Lingkaran PKBI</span>
              </span>
              <button
                id="btn-toggle-orbit-hub"
                type="button"
                onClick={() => setIsOrbitExpanded((prev) => !prev)}
                className="min-h-[38px] px-3.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                {isOrbitExpanded ? t.hub.closeMenu : t.hub.openMenu}
              </button>
            </div>

            {/* Orbital Dial Stage */}
            <div className="relative w-[300px] h-[300px] sm:w-[356px] sm:h-[356px] my-4 flex items-center justify-center">
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 340 340"
              >
                <circle
                  cx="170"
                  cy="170"
                  r="116"
                  fill="none"
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-800"
                  strokeWidth="1.5"
                  strokeDasharray="4 6"
                />
                {isOrbitExpanded &&
                  HUB_PROGRAMS.map((item) => {
                    const rad = (item.angle * Math.PI) / 180;
                    const x2 = 170 + 116 * Math.cos(rad);
                    const y2 = 170 + 116 * Math.sin(rad);
                    const isFocused = focusedProgram.id === item.id;
                    return (
                      <line
                        key={`beam-${item.id}`}
                        x1="170"
                        y1="170"
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
                aria-label="Toggle Menu Lingkaran PKBI"
                className="relative z-20 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-sky-400 shadow-lg flex flex-col items-center justify-center p-2 cursor-pointer hover:scale-105 active:scale-95 transition-transform focus-visible:outline-2 focus-visible:outline-blue-600"
              >
                <BrandLogo size={56} />
                <span className="text-[11px] font-bold text-blue-700 dark:text-sky-300 mt-0.5 leading-none">
                  PKBI
                </span>
              </button>

              {/* 4 Orbiting Program Nodes */}
              <AnimatePresence>
                {isOrbitExpanded &&
                  HUB_PROGRAMS.map((item) => {
                    const rad = (item.angle * Math.PI) / 180;
                    const radius = 114;
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
                        className={`absolute z-30 w-[82px] h-[82px] sm:w-[90px] sm:h-[90px] rounded-full flex flex-col items-center justify-center p-2 text-center shadow-lg border cursor-pointer transition-transform hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-blue-600 ${
                          isFocused
                            ? 'bg-blue-600 text-white border-blue-400 ring-4 ring-blue-500/25'
                            : 'bg-slate-900 dark:bg-slate-800 text-white border-slate-700 hover:bg-blue-700'
                        }`}
                      >
                        <Icon size={20} />
                        <span className="text-[11px] font-semibold leading-tight mt-1 line-clamp-2">
                          {item.shortTitle}
                        </span>
                      </motion.button>
                    );
                  })}
              </AnimatePresence>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800 w-full">
              {isOrbitExpanded
                ? `${focusedProgram.title} · Ketuk lingkaran biru untuk membuka`
                : t.hub.tapPrompt}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
