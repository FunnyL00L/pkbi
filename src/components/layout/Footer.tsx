import React from 'react';
import { BrandLogo } from './BrandLogo';
import { ContentCategory } from '../../types';
import { useAppTheme } from '../../context/ThemeContext';
import { I18N } from '../../constants/i18n';

interface FooterProps {
  activeCategory: ContentCategory | null;
  onBackToMainMenu: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  activeCategory,
  onBackToMainMenu,
}) => {
  const { language } = useAppTheme();
  const t = I18N[language];

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#050a18] text-slate-600 dark:text-slate-400 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-nav-footer lg:pb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BrandLogo size={36} />
          <div className="text-left">
            <div className="text-sm font-bold font-serif text-slate-900 dark:text-white">
              {t.portalName}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              {t.portalSubtitle}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 text-xs">
          {activeCategory && (
            <button
              type="button"
              onClick={onBackToMainMenu}
              className="font-semibold text-blue-700 dark:text-sky-400 hover:underline cursor-pointer min-h-[40px] px-2 flex items-center"
            >
              {t.backToHome}
            </button>
          )}
          <span className="text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} PKBI Kabupaten Buleleng
          </span>
        </div>
      </div>
    </footer>
  );
};
