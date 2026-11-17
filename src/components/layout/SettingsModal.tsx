import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Palette, Globe2, Sun, Moon, Check } from 'lucide-react';
import { useAppTheme } from '../../context/ThemeContext';
import { AppLanguage } from '../../types';

export const SettingsModal: React.FC = () => {
  const { theme, setTheme, language, setLanguage, isSettingsOpen, setIsSettingsOpen } =
    useAppTheme();

  if (!isSettingsOpen) return null;

  const isLight = theme === 'light';

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-4"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsSettingsOpen(false)}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
          className="relative w-full sm:max-w-md max-h-[88dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl z-10 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] text-slate-900 dark:text-slate-50"
        >
          {/* Android Bottom Sheet Drag Indicator */}
          <div className="sm:hidden flex justify-center pb-3">
            <div className="w-10 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
          </div>

          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 id="settings-modal-title" className="font-bold text-lg font-serif">
                {language === 'en'
                  ? 'Portal Settings'
                  : language === 'ban'
                  ? 'Setelan Portal PKBI'
                  : 'Pengaturan Tampilan'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {language === 'en'
                  ? 'Adjust display theme and language'
                  : language === 'ban'
                  ? 'Pilih warna tampilan lan basa'
                  : 'Sesuaikan tema warna dan bahasa antarmuka'}
              </p>
            </div>

            <button
              id="btn-close-settings-modal"
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              aria-label="Tutup pengaturan"
              className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <div className="py-5 space-y-6">
            {/* Theme Selector */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-sky-400">
                <Palette size={15} />
                <span>
                  {language === 'en' ? 'Display Theme' : 'Tema Warna Tampilan'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  id="btn-theme-light"
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`min-h-[44px] p-3.5 rounded-2xl border text-left transition-colors cursor-pointer flex flex-col gap-2 ${
                    isLight
                      ? 'border-blue-600 bg-blue-50 text-slate-900 ring-2 ring-blue-500/25'
                      : 'border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                      <Sun size={16} />
                    </span>
                    {isLight && (
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-sm">Terang</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      Putih &amp; Biru Cerah
                    </div>
                  </div>
                </button>

                <button
                  id="btn-theme-dark"
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`min-h-[44px] p-3.5 rounded-2xl border text-left transition-colors cursor-pointer flex flex-col gap-2 ${
                    !isLight
                      ? 'border-sky-400 bg-slate-900 text-white ring-2 ring-sky-400/25'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="w-8 h-8 rounded-xl bg-slate-800 text-sky-300 flex items-center justify-center border border-slate-700">
                      <Moon size={16} />
                    </span>
                    {!isLight && (
                      <span className="w-5 h-5 rounded-full bg-sky-400 text-slate-950 flex items-center justify-center">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-sm">Gelap</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      Kontras Malam Nyaman
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Language Selector */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-sky-400">
                <Globe2 size={15} />
                <span>{language === 'en' ? 'Language' : 'Bahasa Antarmuka'}</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'id', name: 'Indonesia', code: 'ID' },
                  { id: 'en', name: 'English', code: 'EN' },
                  { id: 'ban', name: 'Basa Bali', code: 'BAN' },
                ].map((item) => {
                  const active = language === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`btn-lang-${item.id}`}
                      type="button"
                      onClick={() => setLanguage(item.id as AppLanguage)}
                      className={`min-h-[48px] px-2 py-2.5 rounded-2xl border text-center transition-colors cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                        active
                          ? 'border-blue-600 dark:border-sky-400 bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-sky-200 font-bold'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-mono opacity-80">{item.code}</span>
                      <span className="text-xs">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              Selesai
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
