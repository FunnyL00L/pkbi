import React from 'react';
import { Home, MapPin, TrendingDown, MessageSquare, BookOpen } from 'lucide-react';
import { ContentCategory } from '../../types';
import { useAppTheme } from '../../context/ThemeContext';
import { I18N } from '../../constants/i18n';

interface BottomNavProps {
  activeCategory: ContentCategory | null;
  onSelectCategory: (cat: ContentCategory) => void;
  onGoHome: () => void;
}

interface TabItem {
  key: 'home' | ContentCategory;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
}

const TABS: TabItem[] = [
  { key: 'home', icon: Home },
  { key: 'map', icon: MapPin },
  { key: 'desa-binaan', icon: TrendingDown },
  { key: 'pendaftaran-qa', icon: MessageSquare },
  { key: 'edukasi-interaktif', icon: BookOpen },
];

export const BottomNav: React.FC<BottomNavProps> = ({
  activeCategory,
  onSelectCategory,
  onGoHome,
}) => {
  const { language } = useAppTheme();
  const t = I18N[language];

  const isActive = (key: TabItem['key']) =>
    key === 'home' ? activeCategory === null : activeCategory === key;

  return (
    <nav
      id="bottom-nav-bar"
      aria-label="Navigasi utama mobile"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#070e22]/95 backdrop-blur-md transition-colors"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="grid grid-cols-5 h-14 max-w-lg mx-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.key);
          const label = t.navLabels[tab.key];

          return (
            <button
              key={tab.key}
              id={`bottom-nav-${tab.key}`}
              type="button"
              onClick={() =>
                tab.key === 'home' ? onGoHome() : onSelectCategory(tab.key)
              }
              aria-current={active ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center gap-0.5 min-h-[44px] min-w-[44px] px-1 cursor-pointer select-none transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 ${
                active
                  ? 'text-blue-700 dark:text-sky-300'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-blue-600 dark:bg-sky-400"
                />
              )}
              <Icon size={20} strokeWidth={active ? 2.4 : 1.9} />
              <span
                className={`text-[10px] leading-tight whitespace-nowrap truncate max-w-full ${
                  active ? 'font-bold' : 'font-medium'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
