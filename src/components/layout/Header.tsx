import React from 'react';
import { ArrowLeft, SlidersHorizontal } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { ContentCategory } from '../../types';
import { useAppTheme } from '../../context/ThemeContext';
import { I18N } from '../../constants/i18n';

interface HeaderProps {
  activeCategory: ContentCategory;
  onSelectCategory: (cat: ContentCategory) => void;
  onBackToMainMenu: () => void;
}

const NAV_CATEGORIES: ContentCategory[] = [
  'map',
  'desa-binaan',
  'pendaftaran-qa',
  'edukasi-interaktif',
];

export const Header: React.FC<HeaderProps> = ({
  activeCategory,
  onSelectCategory,
  onBackToMainMenu,
}) => {
  const { toggleSettings, language } = useAppTheme();
  const t = I18N[language];
  const sectionMeta = t.sectionTitles[activeCategory];

  return (
    <header className="sticky top-0 z-40 h-13 lg:h-16 bg-white/95 dark:bg-[#070e22]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-50 transition-colors">
      <div className="max-w-7xl mx-auto h-full px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-4 lg:gap-8">
        {/* Zone 1: Brand / Back to Hub */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            id="btn-back-to-main-menu"
            type="button"
            onClick={onBackToMainMenu}
            className="min-h-[40px] min-w-[40px] lg:min-w-0 lg:px-3 lg:py-1.5 rounded-xl flex items-center justify-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-blue-600"
            aria-label={t.backToHome}
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline text-xs font-semibold whitespace-nowrap shrink-0">
              {t.backToHome}
            </span>
          </button>

          <button
            type="button"
            onClick={onBackToMainMenu}
            className="flex items-center gap-2 min-w-0 cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-blue-600 rounded-lg"
          >
            <BrandLogo size={30} className="hidden sm:flex" />
            <span className="text-sm sm:text-base font-bold font-serif tracking-tight text-slate-900 dark:text-white whitespace-nowrap truncate">
              <span className="lg:hidden">{sectionMeta.short}</span>
              <span className="hidden lg:inline">{t.portalName}</span>
            </span>
          </button>
        </div>

        {/* Zone 2: Desktop Single-Line Navigation Links */}
        <nav
          aria-label="Navigasi Portal PKBI"
          className="hidden lg:flex items-center gap-6 text-sm font-medium"
        >
          {NAV_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(cat)}
                aria-current={isActive ? 'page' : undefined}
                className={`py-1.5 whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-600 ${
                  isActive
                    ? 'border-blue-600 dark:border-sky-400 text-blue-700 dark:text-sky-300 font-semibold'
                    : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.navLabels[cat]}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Settings Action */}
        <div className="flex items-center shrink-0">
          <button
            id="btn-pkbi-logo-settings"
            type="button"
            onClick={toggleSettings}
            className="min-h-[40px] min-w-[40px] sm:px-3.5 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-blue-600"
            aria-label={t.settings}
          >
            <SlidersHorizontal size={16} className="text-blue-600 dark:text-sky-400" />
            <span className="hidden sm:inline">{t.settings}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
