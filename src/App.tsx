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
const DesaHarmonySection = lazy(() =>
  import('./components/desa/DesaHarmonySection').then((m) => ({
    default: m.DesaHarmonySection,
  }))
);
const CatinSection = lazy(() =>
  import('./components/catin/CatinSection').then((m) => ({ default: m.CatinSection }))
);
const EdukasiInteraktifSection = lazy(() =>
  import('./components/edukasi/EdukasiInteraktifSection').then((m) => ({
    default: m.EdukasiInteraktifSection,
  }))
);
const QnaSection = lazy(() =>
  import('./components/qna/QnaSection').then((m) => ({ default: m.QnaSection }))
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

interface ParsedRouteState {
  category: ContentCategory | null;
  mapMode: 'peta' | 'laporan';
}

const getRouteStateFromPath = (path: string, search = ''): ParsedRouteState => {
  const params = new URLSearchParams(search);
  const viewParam = params.get('view')?.toLowerCase();

  if (viewParam === 'laporan') {
    return { category: 'map', mapMode: 'laporan' };
  }
  if (viewParam === 'map') return { category: 'map', mapMode: 'peta' };
  if (viewParam === 'desa-harmony' || viewParam === 'desa-binaan')
    return { category: 'desa-harmony', mapMode: 'peta' };
  if (viewParam === 'catin' || viewParam === 'pendaftaran')
    return { category: 'catin', mapMode: 'peta' };
  if (viewParam === 'edukasi-kespro' || viewParam === 'edukasi-interaktif')
    return { category: 'edukasi-kespro', mapMode: 'peta' };
  if (viewParam === 'qna' || viewParam === 'pendaftaran-qa')
    return { category: 'qna', mapMode: 'peta' };

  const clean = path.toLowerCase().replace(/\/+$/, '') || '/';
  if (clean === '/laporan' || clean.startsWith('/laporan')) {
    return { category: 'map', mapMode: 'laporan' };
  }
  if (clean === '/map' || clean.startsWith('/map')) {
    return { category: 'map', mapMode: 'peta' };
  }
  if (clean === '/desa-harmony' || clean === '/desa-binaan' || clean.startsWith('/desa')) {
    return { category: 'desa-harmony', mapMode: 'peta' };
  }
  if (clean === '/catin' || clean === '/pendaftaran' || clean.startsWith('/catin')) {
    return { category: 'catin', mapMode: 'peta' };
  }
  if (clean === '/edukasi' || clean === '/edukasi-kespro' || clean.startsWith('/edukasi')) {
    return { category: 'edukasi-kespro', mapMode: 'peta' };
  }
  if (clean === '/qna' || clean === '/qa' || clean.startsWith('/qn') || clean.startsWith('/qa')) {
    return { category: 'qna', mapMode: 'peta' };
  }

  return { category: null, mapMode: 'peta' };
};

const getPathFromCategory = (
  cat: ContentCategory | null,
  mapMode: 'peta' | 'laporan' = 'peta'
): string => {
  switch (cat) {
    case 'map':
      return mapMode === 'laporan' ? '/laporan' : '/map';
    case 'desa-harmony':
      return '/desa-harmony';
    case 'catin':
      return '/catin';
    case 'edukasi-kespro':
      return '/edukasi';
    case 'qna':
      return '/qna';
    default:
      return '/';
  }
};

export default function App() {
  const initial =
    typeof window !== 'undefined'
      ? getRouteStateFromPath(window.location.pathname, window.location.search)
      : { category: null, mapMode: 'peta' as const };

  const [activeCategory, setActiveCategory] = useState<ContentCategory | null>(initial.category);
  const [mapViewMode, setMapViewMode] = useState<'peta' | 'laporan'>(initial.mapMode);

  useEffect(() => {
    const handlePopState = () => {
      const parsed = getRouteStateFromPath(window.location.pathname, window.location.search);
      setActiveCategory(parsed.category);
      setMapViewMode(parsed.mapMode);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSelectCategory = (
    cat: ContentCategory,
    preferredMapMode: 'peta' | 'laporan' = 'peta'
  ) => {
    setActiveCategory(cat);
    if (cat === 'map') {
      setMapViewMode(preferredMapMode);
    }
    const targetPath = getPathFromCategory(cat, cat === 'map' ? preferredMapMode : 'peta');
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToMainMenu = () => {
    setActiveCategory(null);
    setMapViewMode('peta');
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMapModeChange = (mode: 'peta' | 'laporan') => {
    setMapViewMode(mode);
    const targetPath = mode === 'laporan' ? '/laporan' : '/map';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
  };

  return (
    <div className="min-h-screen font-sans flex flex-col bg-slate-50 dark:bg-[#060c1c] text-slate-900 dark:text-slate-50 selection:bg-blue-600 selection:text-white relative transition-colors">
      {/* 1. HOME / GOLDEN RATIO 5-NODE NAVIGATION HUB */}
      {!activeCategory && (
        <main className="flex-1 flex flex-col justify-center">
          <NavigationHub
            activeCategory={activeCategory}
            onSelectCategory={(cat) => handleSelectCategory(cat)}
          />
        </main>
      )}

      {/* 2. ACTIVE MODULE VIEW */}
      {activeCategory && (
        <>
          <Header
            activeCategory={activeCategory}
            onSelectCategory={(cat) => handleSelectCategory(cat)}
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
                      viewMode={mapViewMode}
                      onViewModeChange={handleMapModeChange}
                      onNavigateToCatin={() => handleSelectCategory('catin')}
                    />
                  </motion.div>
                )}

                {activeCategory === 'desa-harmony' && (
                  <motion.div
                    key="cat-desa-harmony"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <DesaHarmonySection
                      onNavigateToQna={() => handleSelectCategory('qna')}
                    />
                  </motion.div>
                )}

                {activeCategory === 'catin' && (
                  <motion.div
                    key="cat-catin"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <CatinSection
                      onNavigateToQna={() => handleSelectCategory('qna')}
                    />
                  </motion.div>
                )}

                {activeCategory === 'edukasi-kespro' && (
                  <motion.div
                    key="cat-edukasi-kespro"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <EdukasiInteraktifSection />
                  </motion.div>
                )}

                {activeCategory === 'qna' && (
                  <motion.div
                    key="cat-qna"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <QnaSection />
                  </motion.div>
                )}
              </AnimatePresence>
            </Suspense>
          </main>

          <BottomNav
            activeCategory={activeCategory}
            onSelectCategory={(cat) => handleSelectCategory(cat)}
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