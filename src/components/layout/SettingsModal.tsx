import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Palette,
  Globe2,
  Sun,
  Moon,
  Check,
  ShieldCheck,
  LogIn,
  LogOut,
  AlertCircle,
  Loader2,
  UserCheck,
  Database,
} from 'lucide-react';
import { useAppTheme } from '../../context/ThemeContext';
import { useAdminAuth } from '../../context/AuthContext';
import { AppLanguage } from '../../types';
import { GasCloudinaryConfigModal } from './GasCloudinaryConfigModal';

export const SettingsModal: React.FC = () => {
  const { theme, setTheme, language, setLanguage, isSettingsOpen, setIsSettingsOpen } =
    useAppTheme();
  const {
    user,
    isAdmin,
    isAdminMode,
    authLoading,
    authError,
    loginWithGoogle,
    logoutAdmin,
    clearAuthError,
  } = useAdminAuth();

  const [gasConfigOpen, setGasConfigOpen] = useState(false);

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
                  : 'Pengaturan Portal'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {language === 'en'
                  ? 'Display theme, language, and admin access'
                  : language === 'ban'
                  ? 'Pilih warna tampilan, basa, lan akses admin'
                  : 'Tema tampilan, bahasa, serta akses Admin PKBI'}
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

            {/* External Admin Authentication (Firebase Google Sign-In) */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-sky-400">
                  <ShieldCheck size={15} />
                  <span>Akses Admin Relawan PKBI</span>
                </div>
                {isAdminMode && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                    Mode Admin Aktif
                  </span>
                )}
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p>{authError}</p>
                    <button
                      type="button"
                      onClick={clearAuthError}
                      className="underline font-semibold cursor-pointer"
                    >
                      Tutup pesan
                    </button>
                  </div>
                </div>
              )}

              {!user ? (
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-3">
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Masuk dengan akun Gmail Admin PKBI yang terdaftar di sistem autentikasi eksternal
                    untuk menambah, memperbarui, atau menghapus kegiatan desa dan data pertumbuhan
                    Desa Harmony. Pengunjung biasa tidak perlu login.
                  </p>
                  <button
                    id="btn-admin-google-login"
                    type="button"
                    disabled={authLoading}
                    onClick={loginWithGoogle}
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-sky-500 hover:bg-slate-800 dark:hover:bg-sky-400 text-white dark:text-slate-950 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {authLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <LogIn size={16} />
                    )}
                    <span>
                      {authLoading ? 'Memverifikasi Akun...' : 'Login Admin dengan Gmail'}
                    </span>
                  </button>
                </div>
              ) : isAdmin ? (
                <div className="p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/30 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <UserCheck size={18} />
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {user.displayName || 'Admin Relawan PKBI Buleleng'}
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                        {user.email}
                      </div>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-1 leading-snug">
                        Mode Admin Firebase aktif. Anda dapat mengelola Desa, Agenda, Keluarga Asuh,
                        Posyandu, Forum Remaja, Pamflet Catin, Artikel, Video, Katalog IMS &amp; FAQ.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      id="btn-open-firebase-media-config"
                      type="button"
                      onClick={() => setGasConfigOpen(true)}
                      className="flex-1 min-h-[40px] px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Database size={14} />
                      <span>Pengaturan Media &amp; Firebase</span>
                    </button>
                    <button
                      id="btn-admin-logout"
                      type="button"
                      disabled={authLoading}
                      onClick={logoutAdmin}
                      className="min-h-[40px] px-3.5 py-2 rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>Keluar Admin</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 space-y-2.5">
                  <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    Akun Tamu ({user.email})
                  </div>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                    Email ini belum terdaftar sebagai Admin Relawan PKBI Buleleng. Portal tetap
                    ditampilkan dalam mode pengunjung publik.
                  </p>
                  <button
                    id="btn-admin-logout"
                    type="button"
                    disabled={authLoading}
                    onClick={logoutAdmin}
                    className="w-full min-h-[40px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>Keluar Akun</span>
                  </button>
                </div>
              )}
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

        {isAdminMode && (
          <GasCloudinaryConfigModal
            isOpen={gasConfigOpen}
            onClose={() => setGasConfigOpen(false)}
          />
        )}
      </div>
    </AnimatePresence>
  );
};
