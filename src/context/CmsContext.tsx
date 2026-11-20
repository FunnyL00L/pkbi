import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import {
  CATIN_PAMPHLETS,
  DESA_HARMONY_FOSTER_FAMILIES,
  DESA_HARMONY_POSYANDU_LIST,
  DESA_HARMONY_YOUTH_PROGRAMS,
  ECCD_VILLAGE_MARKERS,
  KESPRO_GENERAL_ARTICLES,
  KESPRO_INFOGRAPHICS,
  QNA_FAQ_LIST,
} from '../data/eccdData';
import {
  getBeritaKegiatanList,
  getEdukasiPenyakitList,
  getVideoEdukasiList,
} from '../services/dataService';
import {
  BeritaKegiatanDetail,
  CatinPamphletItem,
  CmsIntegrationConfig,
  CmsVillageRecord,
  EccdVillageAgendaItem,
  EccdVillageMarker,
  HarmonyFosterFamily,
  HarmonyPosyanduActivity,
  HarmonyYouthActivity,
  KesproArticleItem,
  KesproInfographicItem,
  PenyakitSeksualEdu,
  QnaFaqItem,
  VideoEdukasi,
} from '../types';
import { useAdminAuth } from './AuthContext';
import {
  CmsSnapshotPayload,
  DEFAULT_INTEGRATION_CONFIG,
  deleteCmsArticleFromFirestore,
  deleteCmsDiseaseFromFirestore,
  deleteCmsFaqFromFirestore,
  deleteCmsInfographicFromFirestore,
  deleteCmsPamphletFromFirestore,
  deleteCmsPosyanduArticleFromFirestore,
  deleteCmsPosyanduFromFirestore,
  deleteCmsVideoFromFirestore,
  deleteCmsYouthArticleFromFirestore,
  deleteFosterFamilyFromFirestore,
  deleteVillageAgendaFromFirestore,
  fetchAdminIntegrationConfig,
  fetchPublicCmsState,
  saveCmsArticleToFirestore,
  saveCmsDiseaseToFirestore,
  saveCmsFaqToFirestore,
  saveCmsInfographicToFirestore,
  saveCmsPamphletToFirestore,
  saveCmsPosyanduArticleToFirestore,
  saveCmsPosyanduToFirestore,
  saveCmsVideoToFirestore,
  saveCmsVillageToFirestore,
  saveCmsYouthArticleToFirestore,
  saveFosterFamilyToFirestore,
  saveIntegrationConfigToFirestore,
  saveVillageAgendaToFirestore,
  subscribeAuthenticatedCmsState,
} from '../services/firestoreCmsService';
import { mergeFosterFamiliesWithCms } from '../utils/childGrowthHelpers';
import {
  mergeAllVillagesWithCms,
  mergeSeedWithCmsRecords,
} from '../utils/cloudinaryGasHelpers';

const SEED_VIDEOS: VideoEdukasi[] = getVideoEdukasiList();
const SEED_DISEASES: PenyakitSeksualEdu[] = getEdukasiPenyakitList();
const SEED_POSYANDU_ARTICLES: BeritaKegiatanDetail[] = getBeritaKegiatanList();

interface CmsContextValue {
  villages: EccdVillageMarker[];
  fosterFamilies: HarmonyFosterFamily[];
  posyanduList: HarmonyPosyanduActivity[];
  posyanduArticles: BeritaKegiatanDetail[];
  youthArticles: HarmonyYouthActivity[];
  pamphlets: CatinPamphletItem[];
  diseases: PenyakitSeksualEdu[];
  articles: KesproArticleItem[];
  videos: VideoEdukasi[];
  infographics: KesproInfographicItem[];
  faqs: QnaFaqItem[];
  integrationConfig: CmsIntegrationConfig;
  cmsLoading: boolean;
  saveIntegrationConfig: (cfg: CmsIntegrationConfig) => Promise<void>;
  upsertVillage: (village: CmsVillageRecord) => Promise<void>;
  upsertVillageAgenda: (agenda: EccdVillageAgendaItem) => Promise<void>;
  removeVillageAgenda: (agendaId: string, villageId: string) => Promise<void>;
  upsertFosterFamily: (family: HarmonyFosterFamily) => Promise<void>;
  removeFosterFamily: (family: HarmonyFosterFamily) => Promise<void>;
  upsertPosyandu: (item: HarmonyPosyanduActivity) => Promise<void>;
  removePosyandu: (item: HarmonyPosyanduActivity) => Promise<void>;
  upsertPosyanduArticle: (item: BeritaKegiatanDetail) => Promise<void>;
  removePosyanduArticle: (item: BeritaKegiatanDetail) => Promise<void>;
  upsertYouthArticle: (item: HarmonyYouthActivity) => Promise<void>;
  removeYouthArticle: (item: HarmonyYouthActivity) => Promise<void>;
  upsertPamphlet: (item: CatinPamphletItem) => Promise<void>;
  removePamphlet: (item: CatinPamphletItem) => Promise<void>;
  upsertDisease: (item: PenyakitSeksualEdu) => Promise<void>;
  removeDisease: (item: PenyakitSeksualEdu) => Promise<void>;
  upsertArticle: (article: KesproArticleItem) => Promise<void>;
  removeArticle: (article: KesproArticleItem) => Promise<void>;
  upsertVideo: (video: VideoEdukasi) => Promise<void>;
  removeVideo: (video: VideoEdukasi) => Promise<void>;
  upsertInfographic: (item: KesproInfographicItem) => Promise<void>;
  removeInfographic: (item: KesproInfographicItem) => Promise<void>;
  upsertFaq: (faq: QnaFaqItem) => Promise<void>;
  removeFaq: (faq: QnaFaqItem) => Promise<void>;
}

const CmsContext = createContext<CmsContextValue | undefined>(undefined);

const SEED_AGENDA_IDS = new Set(
  ECCD_VILLAGE_MARKERS.flatMap((v) => v.agendaList.map((a) => a.id))
);
const SEED_FAMILY_IDS = new Set(DESA_HARMONY_FOSTER_FAMILIES.map((f) => f.id));
const SEED_POSYANDU_IDS = new Set(DESA_HARMONY_POSYANDU_LIST.map((p) => p.id));
const SEED_POSYANDU_ARTICLE_IDS = new Set(SEED_POSYANDU_ARTICLES.map((a) => a.id));
const SEED_YOUTH_IDS = new Set(DESA_HARMONY_YOUTH_PROGRAMS.map((y) => y.id));
const SEED_PAMPHLET_IDS = new Set(CATIN_PAMPHLETS.map((p) => p.id));
const SEED_DISEASE_IDS = new Set(SEED_DISEASES.map((d) => d.id));
const SEED_ARTICLE_IDS = new Set(KESPRO_GENERAL_ARTICLES.map((a) => a.id));
const SEED_VIDEO_IDS = new Set(SEED_VIDEOS.map((v) => v.id));
const SEED_INFOGRAPHIC_IDS = new Set(KESPRO_INFOGRAPHICS.map((i) => i.id));
const SEED_FAQ_IDS = new Set(QNA_FAQ_LIST.map((f) => f.id));

export const CmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, authReady } = useAdminAuth();

  const [cmsState, setCmsState] = useState<CmsSnapshotPayload>({
    villages: [],
    agendas: [],
    deletedSeedAgendaIds: [],
    fosterFamilies: [],
    posyanduList: [],
    posyanduArticles: [],
    youthArticles: [],
    pamphlets: [],
    diseases: [],
    articles: [],
    videos: [],
    infographics: [],
    faqs: [],
    integrationConfig: DEFAULT_INTEGRATION_CONFIG,
  });
  const [cmsLoading, setCmsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchPublicCmsState()
      .then((res) => {
        if (active) setCmsState((prev) => ({ ...res, integrationConfig: prev.integrationConfig }));
      })
      .finally(() => {
        if (active) setCmsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!authReady || !user) return;
    if (isAdmin) {
      fetchAdminIntegrationConfig().then((cfg) => {
        setCmsState((prev) => ({ ...prev, integrationConfig: cfg }));
      });
    }
    const unsub = subscribeAuthenticatedCmsState((partial) => {
      setCmsState((prev) => ({
        villages: partial.villages ?? prev.villages,
        agendas: partial.agendas ?? prev.agendas,
        deletedSeedAgendaIds: partial.deletedSeedAgendaIds ?? prev.deletedSeedAgendaIds,
        fosterFamilies: partial.fosterFamilies ?? prev.fosterFamilies,
        posyanduList: partial.posyanduList ?? prev.posyanduList,
        posyanduArticles: partial.posyanduArticles ?? prev.posyanduArticles,
        youthArticles: partial.youthArticles ?? prev.youthArticles,
        pamphlets: partial.pamphlets ?? prev.pamphlets,
        diseases: partial.diseases ?? prev.diseases,
        articles: partial.articles ?? prev.articles,
        videos: partial.videos ?? prev.videos,
        infographics: partial.infographics ?? prev.infographics,
        faqs: partial.faqs ?? prev.faqs,
        integrationConfig: partial.integrationConfig ?? prev.integrationConfig,
      }));
    }, isAdmin);
    return unsub;
  }, [authReady, user, isAdmin]);

  const villages = useMemo(
    () =>
      mergeAllVillagesWithCms(
        ECCD_VILLAGE_MARKERS,
        cmsState.villages,
        cmsState.agendas,
        cmsState.deletedSeedAgendaIds
      ),
    [cmsState.villages, cmsState.agendas, cmsState.deletedSeedAgendaIds]
  );

  const fosterFamilies = useMemo(
    () => mergeFosterFamiliesWithCms(DESA_HARMONY_FOSTER_FAMILIES, cmsState.fosterFamilies),
    [cmsState.fosterFamilies]
  );

  const posyanduList = useMemo(
    () => mergeSeedWithCmsRecords(DESA_HARMONY_POSYANDU_LIST, cmsState.posyanduList),
    [cmsState.posyanduList]
  );

  const posyanduArticles = useMemo(
    () => mergeSeedWithCmsRecords(SEED_POSYANDU_ARTICLES, cmsState.posyanduArticles),
    [cmsState.posyanduArticles]
  );

  const youthArticles = useMemo(
    () => mergeSeedWithCmsRecords(DESA_HARMONY_YOUTH_PROGRAMS, cmsState.youthArticles),
    [cmsState.youthArticles]
  );

  const pamphlets = useMemo(
    () => mergeSeedWithCmsRecords(CATIN_PAMPHLETS, cmsState.pamphlets),
    [cmsState.pamphlets]
  );

  const diseases = useMemo(
    () => mergeSeedWithCmsRecords(SEED_DISEASES, cmsState.diseases),
    [cmsState.diseases]
  );

  const articles = useMemo(
    () => mergeSeedWithCmsRecords(KESPRO_GENERAL_ARTICLES, cmsState.articles),
    [cmsState.articles]
  );

  const videos = useMemo(
    () => mergeSeedWithCmsRecords(SEED_VIDEOS, cmsState.videos),
    [cmsState.videos]
  );

  const infographics = useMemo(
    () => mergeSeedWithCmsRecords(KESPRO_INFOGRAPHICS, cmsState.infographics),
    [cmsState.infographics]
  );

  const faqs = useMemo(
    () => mergeSeedWithCmsRecords(QNA_FAQ_LIST, cmsState.faqs),
    [cmsState.faqs]
  );

  const saveIntegrationConfig = useCallback(async (cfg: CmsIntegrationConfig) => {
    const saved = await saveIntegrationConfigToFirestore({
      ...cfg,
      gasWebAppUrl: '',
      autoSyncGas: false,
    });
    setCmsState((prev) => ({ ...prev, integrationConfig: saved }));
  }, []);

  const upsertVillage = useCallback(
    async (village: CmsVillageRecord) => {
      const exists = cmsState.villages.some((v) => v.id === village.id);
      const saved = await saveCmsVillageToFirestore(village, exists);
      setCmsState((prev) => ({
        ...prev,
        villages: [saved, ...prev.villages.filter((v) => v.id !== saved.id)],
      }));
    },
    [cmsState.villages]
  );

  const upsertVillageAgenda = useCallback(
    async (agenda: EccdVillageAgendaItem) => {
      const exists = cmsState.agendas.some((a) => a.id === agenda.id);
      const saved = await saveVillageAgendaToFirestore(agenda, exists);
      setCmsState((prev) => ({
        ...prev,
        agendas: [saved, ...prev.agendas.filter((a) => a.id !== saved.id)],
        deletedSeedAgendaIds: prev.deletedSeedAgendaIds.filter((id) => id !== saved.id),
      }));
    },
    [cmsState.agendas]
  );

  const removeVillageAgenda = useCallback(async (agendaId: string, villageId: string) => {
    const isSeed = SEED_AGENDA_IDS.has(agendaId);
    await deleteVillageAgendaFromFirestore(agendaId, villageId, isSeed);
    setCmsState((prev) => ({
      ...prev,
      agendas: prev.agendas.filter((a) => a.id !== agendaId),
      deletedSeedAgendaIds: isSeed
        ? Array.from(new Set([...prev.deletedSeedAgendaIds, agendaId]))
        : prev.deletedSeedAgendaIds,
    }));
  }, []);

  const upsertFosterFamily = useCallback(
    async (family: HarmonyFosterFamily) => {
      const exists = cmsState.fosterFamilies.some((f) => f.id === family.id);
      const saved = await saveFosterFamilyToFirestore(family, exists);
      setCmsState((prev) => ({
        ...prev,
        fosterFamilies: [...prev.fosterFamilies.filter((f) => f.id !== saved.id), saved],
      }));
    },
    [cmsState.fosterFamilies]
  );

  const removeFosterFamily = useCallback(
    async (family: HarmonyFosterFamily) => {
      const isSeed = SEED_FAMILY_IDS.has(family.id);
      const exists = cmsState.fosterFamilies.some((f) => f.id === family.id);
      await deleteFosterFamilyFromFirestore(family, isSeed, exists);
      setCmsState((prev) => ({
        ...prev,
        fosterFamilies: isSeed
          ? [...prev.fosterFamilies.filter((f) => f.id !== family.id), { ...family, isDeleted: true }]
          : prev.fosterFamilies.filter((f) => f.id !== family.id),
      }));
    },
    [cmsState.fosterFamilies]
  );

  const upsertPosyandu = useCallback(
    async (item: HarmonyPosyanduActivity) => {
      const exists = cmsState.posyanduList.some((p) => p.id === item.id);
      const saved = await saveCmsPosyanduToFirestore(item, exists);
      setCmsState((prev) => ({
        ...prev,
        posyanduList: [saved, ...prev.posyanduList.filter((p) => p.id !== saved.id)],
      }));
    },
    [cmsState.posyanduList]
  );

  const removePosyandu = useCallback(
    async (item: HarmonyPosyanduActivity) => {
      const isSeed = SEED_POSYANDU_IDS.has(item.id);
      const exists = cmsState.posyanduList.some((p) => p.id === item.id);
      await deleteCmsPosyanduFromFirestore(item, isSeed, exists);
      setCmsState((prev) => ({
        ...prev,
        posyanduList: isSeed
          ? [...prev.posyanduList.filter((p) => p.id !== item.id), { ...item, isDeleted: true }]
          : prev.posyanduList.filter((p) => p.id !== item.id),
      }));
    },
    [cmsState.posyanduList]
  );

  const upsertYouthArticle = useCallback(
    async (item: HarmonyYouthActivity) => {
      const exists = cmsState.youthArticles.some((y) => y.id === item.id);
      const saved = await saveCmsYouthArticleToFirestore(item, exists);
      setCmsState((prev) => ({
        ...prev,
        youthArticles: [saved, ...prev.youthArticles.filter((y) => y.id !== saved.id)],
      }));
    },
    [cmsState.youthArticles]
  );

  const removeYouthArticle = useCallback(
    async (item: HarmonyYouthActivity) => {
      const isSeed = SEED_YOUTH_IDS.has(item.id);
      const exists = cmsState.youthArticles.some((y) => y.id === item.id);
      await deleteCmsYouthArticleFromFirestore(item, isSeed, exists);
      setCmsState((prev) => ({
        ...prev,
        youthArticles: isSeed
          ? [...prev.youthArticles.filter((y) => y.id !== item.id), { ...item, isDeleted: true }]
          : prev.youthArticles.filter((y) => y.id !== item.id),
      }));
    },
    [cmsState.youthArticles]
  );

  const upsertPamphlet = useCallback(
    async (item: CatinPamphletItem) => {
      const exists = cmsState.pamphlets.some((p) => p.id === item.id);
      const saved = await saveCmsPamphletToFirestore(item, exists);
      setCmsState((prev) => ({
        ...prev,
        pamphlets: [saved, ...prev.pamphlets.filter((p) => p.id !== saved.id)],
      }));
    },
    [cmsState.pamphlets]
  );

  const removePamphlet = useCallback(
    async (item: CatinPamphletItem) => {
      const isSeed = SEED_PAMPHLET_IDS.has(item.id);
      const exists = cmsState.pamphlets.some((p) => p.id === item.id);
      await deleteCmsPamphletFromFirestore(item, isSeed, exists);
      setCmsState((prev) => ({
        ...prev,
        pamphlets: isSeed
          ? [...prev.pamphlets.filter((p) => p.id !== item.id), { ...item, isDeleted: true }]
          : prev.pamphlets.filter((p) => p.id !== item.id),
      }));
    },
    [cmsState.pamphlets]
  );

  const upsertDisease = useCallback(
    async (item: PenyakitSeksualEdu) => {
      const exists = cmsState.diseases.some((d) => d.id === item.id);
      const saved = await saveCmsDiseaseToFirestore(item, exists);
      setCmsState((prev) => ({
        ...prev,
        diseases: [saved, ...prev.diseases.filter((d) => d.id !== saved.id)],
      }));
    },
    [cmsState.diseases]
  );

  const removeDisease = useCallback(
    async (item: PenyakitSeksualEdu) => {
      const isSeed = SEED_DISEASE_IDS.has(item.id);
      const exists = cmsState.diseases.some((d) => d.id === item.id);
      await deleteCmsDiseaseFromFirestore(item, isSeed, exists);
      setCmsState((prev) => ({
        ...prev,
        diseases: isSeed
          ? [...prev.diseases.filter((d) => d.id !== item.id), { ...item, isDeleted: true }]
          : prev.diseases.filter((d) => d.id !== item.id),
      }));
    },
    [cmsState.diseases]
  );

  const upsertArticle = useCallback(
    async (article: KesproArticleItem) => {
      const exists = cmsState.articles.some((a) => a.id === article.id);
      const saved = await saveCmsArticleToFirestore(article, exists);
      setCmsState((prev) => ({
        ...prev,
        articles: [saved, ...prev.articles.filter((a) => a.id !== saved.id)],
      }));
    },
    [cmsState.articles]
  );

  const removeArticle = useCallback(
    async (article: KesproArticleItem) => {
      const isSeed = SEED_ARTICLE_IDS.has(article.id);
      const exists = cmsState.articles.some((a) => a.id === article.id);
      await deleteCmsArticleFromFirestore(article, isSeed, exists);
      setCmsState((prev) => ({
        ...prev,
        articles: isSeed
          ? [...prev.articles.filter((a) => a.id !== article.id), { ...article, isDeleted: true }]
          : prev.articles.filter((a) => a.id !== article.id),
      }));
    },
    [cmsState.articles]
  );

  const upsertVideo = useCallback(
    async (video: VideoEdukasi) => {
      const exists = cmsState.videos.some((v) => v.id === video.id);
      const saved = await saveCmsVideoToFirestore(video, exists);
      setCmsState((prev) => ({
        ...prev,
        videos: [saved, ...prev.videos.filter((v) => v.id !== saved.id)],
      }));
    },
    [cmsState.videos]
  );

  const removeVideo = useCallback(
    async (video: VideoEdukasi) => {
      const isSeed = SEED_VIDEO_IDS.has(video.id);
      const exists = cmsState.videos.some((v) => v.id === video.id);
      await deleteCmsVideoFromFirestore(video, isSeed, exists);
      setCmsState((prev) => ({
        ...prev,
        videos: isSeed
          ? [...prev.videos.filter((v) => v.id !== video.id), { ...video, isDeleted: true }]
          : prev.videos.filter((v) => v.id !== video.id),
      }));
    },
    [cmsState.videos]
  );

  const upsertInfographic = useCallback(
    async (item: KesproInfographicItem) => {
      const exists = cmsState.infographics.some((i) => i.id === item.id);
      const saved = await saveCmsInfographicToFirestore(item, exists);
      setCmsState((prev) => ({
        ...prev,
        infographics: [saved, ...prev.infographics.filter((i) => i.id !== saved.id)],
      }));
    },
    [cmsState.infographics]
  );

  const removeInfographic = useCallback(
    async (item: KesproInfographicItem) => {
      const isSeed = SEED_INFOGRAPHIC_IDS.has(item.id);
      const exists = cmsState.infographics.some((i) => i.id === item.id);
      await deleteCmsInfographicFromFirestore(item, isSeed, exists);
      setCmsState((prev) => ({
        ...prev,
        infographics: isSeed
          ? [...prev.infographics.filter((i) => i.id !== item.id), { ...item, isDeleted: true }]
          : prev.infographics.filter((i) => i.id !== item.id),
      }));
    },
    [cmsState.infographics]
  );

  const upsertFaq = useCallback(
    async (faq: QnaFaqItem) => {
      const exists = cmsState.faqs.some((f) => f.id === faq.id);
      const saved = await saveCmsFaqToFirestore(faq, exists);
      setCmsState((prev) => ({
        ...prev,
        faqs: [saved, ...prev.faqs.filter((f) => f.id !== saved.id)],
      }));
    },
    [cmsState.faqs]
  );

  const removeFaq = useCallback(
    async (faq: QnaFaqItem) => {
      const isSeed = SEED_FAQ_IDS.has(faq.id);
      const exists = cmsState.faqs.some((f) => f.id === faq.id);
      await deleteCmsFaqFromFirestore(faq, isSeed, exists);
      setCmsState((prev) => ({
        ...prev,
        faqs: isSeed
          ? [...prev.faqs.filter((f) => f.id !== faq.id), { ...faq, isDeleted: true }]
          : prev.faqs.filter((f) => f.id !== faq.id),
      }));
    },
    [cmsState.faqs]
  );

  const upsertPosyanduArticle = useCallback(
    async (item: BeritaKegiatanDetail) => {
      const exists = cmsState.posyanduArticles.some((a) => a.id === item.id);
      const saved = await saveCmsPosyanduArticleToFirestore(item, exists);
      setCmsState((prev) => ({
        ...prev,
        posyanduArticles: [saved, ...prev.posyanduArticles.filter((a) => a.id !== saved.id)],
      }));
    },
    [cmsState.posyanduArticles]
  );

  const removePosyanduArticle = useCallback(
    async (item: BeritaKegiatanDetail) => {
      const isSeed = SEED_POSYANDU_ARTICLE_IDS.has(item.id);
      const exists = cmsState.posyanduArticles.some((a) => a.id === item.id);
      await deleteCmsPosyanduArticleFromFirestore(item, isSeed, exists);
      setCmsState((prev) => ({
        ...prev,
        posyanduArticles: isSeed
          ? [...prev.posyanduArticles.filter((a) => a.id !== item.id), { ...item, isDeleted: true }]
          : prev.posyanduArticles.filter((a) => a.id !== item.id),
      }));
    },
    [cmsState.posyanduArticles]
  );

  return (
    <CmsContext.Provider
      value={{
        villages,
        fosterFamilies,
        posyanduList,
        posyanduArticles,
        youthArticles,
        pamphlets,
        diseases,
        articles,
        videos,
        infographics,
        faqs,
        integrationConfig: cmsState.integrationConfig,
        cmsLoading,
        saveIntegrationConfig,
        upsertVillage,
        upsertVillageAgenda,
        removeVillageAgenda,
        upsertFosterFamily,
        removeFosterFamily,
        upsertPosyandu,
        removePosyandu,
        upsertPosyanduArticle,
        removePosyanduArticle,
        upsertYouthArticle,
        removeYouthArticle,
        upsertPamphlet,
        removePamphlet,
        upsertDisease,
        removeDisease,
        upsertArticle,
        removeArticle,
        upsertVideo,
        removeVideo,
        upsertInfographic,
        removeInfographic,
        upsertFaq,
        removeFaq,
      }}
    >
      {children}
    </CmsContext.Provider>
  );
};

export const useCmsData = (): CmsContextValue => {
  const ctx = useContext(CmsContext);
  if (!ctx) {
    throw new Error('useCmsData must be used inside CmsProvider');
  }
  return ctx;
};
