import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ContentCategory } from './types';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { BottomNav } from './components/layout/BottomNav';
import { SettingsModal } from './components/layout/SettingsModal';
import { NavigationHub } from './components/hub/NavigationHub';

const MapKecamatan = lazy(() =>
  import('./components/map/MapKecamatan').then((m) => ({ default: m.MapKecamatan }))
);
const DesaBinaanSection = lazy(() =>
  import('./components/desa/DesaBinaanSection').then((m) => ({ default: m.DesaBinaanSection }))
);
const PendaftaranDanQASection = lazy(() =>
  import('./components/qa/PendaftaranDanQASection').then((m) => ({
    default: m.PendaftaranDanQASection,
  }))
);
const EdukasiInteraktifSection = lazy(() =>
  import('./components/edukasi/EdukasiInteraktifSection').then((m) => ({
    default: m.EdukasiInteraktifSection,
  }))
);

const SectionSkeleton: React.FC = () => (
  <div
    className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4 animate-pulse"
    aria-label="Memuat konten"
  >
    <div className="h-8 w-2/3 rounded-xl bg-slate-200 dark:bg-slate-800" />
    <div className="h-4 w-1/2 rounded-lg bg-slate-100 dark:bg-slate-800/70" />
    <div className="h-64 rounded-2xl mt-4 bg-slate-100 dark:bg-slate-800/60" />
    <div className="h-40 rounded-2xl bg-slate-100 dark:bg-slate-800/50" />
  </div>
);

const getCategoryFromPath = (path: string, search = ''): ContentCategory | null => {
  const params = new URLSearchParams(search);
  const viewParam = params.get('view')?.toLowerCase();
  if (
    viewParam === 'map' ||
    viewParam === 'desa-binaan' ||
    viewParam === 'pendaftaran-qa' ||
    viewParam === 'edukasi-interaktif'
  ) {
    return viewParam;
  }

  const clean = path.toLowerCase().replace(/\/+$/, '') || '/';
  if (clean === '/map' || clean.startsWith('/map')) return 'map';
  if (clean === '/edukasi' || clean.startsWith('/edukasi')) return 'edukasi-interaktif';
  if (clean === '/desa' || clean === '/desa-binaan' || clean.startsWith('/desa'))
    return 'desa-binaan';
  if (
    clean === '/qa' ||
    clean === '/qna' ||
    clean === '/pendaftaran' ||
    clean === '/pendaftaran-qa' ||
    clean.startsWith('/qa')
  ) {
    return 'pendaftaran-qa';
  }
  return null;
};

const getPathFromCategory = (cat: ContentCategory | null): string => {
  switch (cat) {
    case 'map':
      return '/map';
    case 'edukasi-interaktif':
      return '/edukasi';
    case 'desa-binaan':
      return '/desa-binaan';
    case 'pendaftaran-qa':
      return '/qa';
    default:
      return '/';
  }
};

export default function App() {
  const [activeCategory, setActiveCategory] = useState<ContentCategory | null>(() => {
    if (typeof window !== 'undefined') {
      return getCategoryFromPath(window.location.pathname, window.location.search);
    }
    return null;
  });

  useEffect(() => {
    const handlePopState = () => {
      setActiveCategory(
        getCategoryFromPath(window.location.pathname, window.location.search)
      );
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSelectCategory = (cat: ContentCategory) => {
    setActiveCategory(cat);
    const targetPath = getPathFromCategory(cat);
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToMainMenu = () => {
    setActiveCategory(null);
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen font-sans flex flex-col bg-slate-50 dark:bg-[#060c1c] text-slate-900 dark:text-slate-50 selection:bg-blue-600 selection:text-white relative transition-colors">
      {/* 1. HOME / GOLDEN RATIO NAVIGATION HUB */}
      {!activeCategory && (
        <main className="flex-1 flex flex-col justify-center">
          <NavigationHub
            activeCategory={activeCategory}
            onSelectCategory={handleSelectCategory}
          />
        </main>
      )}

      {/* 2. ACTIVE MODULE VIEW */}
      {activeCategory && (
        <>
          <Header
            activeCategory={activeCategory}
            onSelectCategory={handleSelectCategory}
            onBackToMainMenu={handleBackToMainMenu}
          />

          <main className="flex-1 pb-safe-nav lg:pb-12">
            <Suspense fallback={<SectionSkeleton />}>
              <AnimatePresence mode="wait">
                {activeCategory === 'map' && (
                  <motion.div
                    key="cat-map"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <MapKecamatan
                      onNavigateToProgram={() => handleSelectCategory('pendaftaran-qa')}
                    />
                  </motion.div>
                )}

                {activeCategory === 'desa-binaan' && (
                  <motion.div
                    key="cat-desa"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <DesaBinaanSection />
                  </motion.div>
                )}

                {activeCategory === 'pendaftaran-qa' && (
                  <motion.div
                    key="cat-pendaftaran"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <PendaftaranDanQASection />
                  </motion.div>
                )}

                {activeCategory === 'edukasi-interaktif' && (
                  <motion.div
                    key="cat-edukasi"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <EdukasiInteraktifSection />
                  </motion.div>
                )}
              </AnimatePresence>
            </Suspense>
          </main>

          <BottomNav
            activeCategory={activeCategory}
            onSelectCategory={handleSelectCategory}
            onGoHome={handleBackToMainMenu}
          />
        </>
      )}

      <Footer
        activeCategory={activeCategory}
        onBackToMainMenu={handleBackToMainMenu}
      />

      <SettingsModal />
    </div>
  );
}