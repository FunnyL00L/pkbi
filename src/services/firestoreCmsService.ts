import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import {
  BeritaKegiatanDetail,
  CatinPamphletItem,
  ChildSex,
  CmsIntegrationConfig,
  CmsVillageRecord,
  EccdVillageAgendaItem,
  HarmonyFosterFamily,
  HarmonyPosyanduActivity,
  HarmonyYouthActivity,
  KesproArticleItem,
  KesproInfographicItem,
  PenyakitSeksualEdu,
  QnaCategoryId,
  QnaFaqItem,
  StuntingChildMonthlyPoint,
  VideoEdukasi,
} from '../types';
import { ADMIN_RELAWAN_NAME, buildMonthlyGrowthPoint } from '../utils/childGrowthHelpers';
import {
  DEFAULT_CLOUDINARY_CLOUD_NAME,
  DEFAULT_CLOUDINARY_FOLDER,
} from '../utils/cloudinaryGasHelpers';

export const DEFAULT_INTEGRATION_CONFIG: CmsIntegrationConfig = {
  id: 'integrations',
  gasWebAppUrl: '',
  cloudinaryCloudName: DEFAULT_CLOUDINARY_CLOUD_NAME,
  cloudinaryUploadPreset: '',
  cloudinaryFolder: DEFAULT_CLOUDINARY_FOLDER,
  autoSyncGas: false,
  updatedBy: ADMIN_RELAWAN_NAME,
};

export interface CmsSnapshotPayload {
  villages: CmsVillageRecord[];
  agendas: EccdVillageAgendaItem[];
  deletedSeedAgendaIds: string[];
  fosterFamilies: HarmonyFosterFamily[];
  articles: KesproArticleItem[];
  videos: VideoEdukasi[];
  infographics: KesproInfographicItem[];
  faqs: QnaFaqItem[];
  posyanduList: HarmonyPosyanduActivity[];
  posyanduArticles: BeritaKegiatanDetail[];
  youthArticles: HarmonyYouthActivity[];
  pamphlets: CatinPamphletItem[];
  diseases: PenyakitSeksualEdu[];
  integrationConfig: CmsIntegrationConfig;
}

const VALID_ID_REGEX = /^[a-zA-Z0-9_-]+$/;

function sanitizeDocId(raw: string, prefix: string): string {
  const cleaned = (raw || '').replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 120);
  if (cleaned && VALID_ID_REGEX.test(cleaned)) {
    return cleaned;
  }
  return `${prefix}-${Date.now()}`;
}

function clampStr(val: string, minLen: number, maxLen: number, fallback: string): string {
  const trimmed = (val || '').trim();
  if (trimmed.length < minLen) return fallback.slice(0, maxLen);
  return trimmed.slice(0, maxLen);
}

function parseVillageDoc(d: any): CmsVillageRecord {
  const data = d.data();
  const statusProgram =
    data.statusProgram === 'Desa Binaan Utama'
      ? 'Desa Binaan Utama'
      : data.statusProgram === 'Siaga Layanan'
        ? 'Siaga Layanan'
        : 'Aktif ECCD Mobile';
  return {
    id: String(data.id || d.id),
    name: String(data.name || ''),
    kecamatanId: String(data.kecamatanId || 'buleleng'),
    kecamatanName: String(data.kecamatanName || 'Kecamatan Buleleng'),
    lat: Number(data.lat) || -8.118,
    lng: Number(data.lng) || 115.088,
    population: Number(data.population) || 0,
    posyanduCount: Number(data.posyanduCount) || 1,
    stuntingPct: Number(data.stuntingPct) || 0,
    statusProgram,
    deskripsi: String(data.deskripsi || ''),
    totalRecipients: Number(data.totalRecipients) || 0,
    lakiLaki: Number(data.lakiLaki) || 0,
    perempuan: Number(data.perempuan) || 0,
    imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl : undefined,
    isDeleted: Boolean(data.isDeleted),
  };
}

function parseAgendaDoc(d: any): EccdVillageAgendaItem {
  const data = d.data();
  return {
    id: String(data.id || d.id),
    villageId: String(data.villageId || ''),
    kecamatanId: String(data.kecamatanId || ''),
    title: String(data.title || ''),
    category: String(data.category || 'Layanan Mobile ECCD'),
    date: String(data.date || ''),
    displayDate: String(data.displayDate || ''),
    time: String(data.time || ''),
    status: data.status === 'Terjadwal' ? 'Terjadwal' : 'Terlaksana',
    location: String(data.location || ''),
    facilitator: String(data.facilitator || ADMIN_RELAWAN_NAME),
    participants: Number(data.participants) || 0,
    summary: String(data.summary || ''),
    galleryImages: Array.isArray(data.galleryImages)
      ? data.galleryImages.map(String).slice(0, 5)
      : [],
  };
}

function parseFamilyDoc(d: any): HarmonyFosterFamily {
  const data = d.data();
  const rawGrowth = Array.isArray(data.monthlyGrowth) ? data.monthlyGrowth : [];
  const monthlyGrowth: StuntingChildMonthlyPoint[] = rawGrowth.slice(0, 60).map((pt: any) =>
    buildMonthlyGrowthPoint(
      Number(pt.month) || 1,
      Number(pt.heightCm) || 50,
      Number(pt.weightKg) || 3.2
    )
  );
  const childSex: ChildSex | undefined =
    data.childSex === 'P' ? 'P' : data.childSex === 'L' ? 'L' : undefined;
  return {
    id: String(data.id || d.id),
    codeName: String(data.codeName || 'Keluarga Asuh'),
    guardianOrMotherName: String(data.guardianOrMotherName || ''),
    banjar: String(data.banjar || 'Banjar Dangin Yeh'),
    category: data.category === 'ibu-hamil-kek' ? 'ibu-hamil-kek' : 'stunting',
    categoryLabel: String(data.categoryLabel || ''),
    targetName: String(data.targetName || ''),
    childAgeMonths: typeof data.childAgeMonths === 'number' ? data.childAgeMonths : undefined,
    childSex,
    baselineMetric: String(data.baselineMetric || ''),
    currentMetric: String(data.currentMetric || ''),
    progressPct: Number(data.progressPct) || 0,
    mentorName: String(data.mentorName || ADMIN_RELAWAN_NAME),
    recordedBy: String(data.recordedBy || ADMIN_RELAWAN_NAME),
    interventions: Array.isArray(data.interventions)
      ? data.interventions.map(String).slice(0, 10)
      : [],
    monthlyGrowth: monthlyGrowth.length > 0 ? monthlyGrowth : undefined,
    statusLabel:
      data.statusLabel === 'Target Tercapai'
        ? 'Target Tercapai'
        : data.statusLabel === 'Pemulihan Intensif'
          ? 'Pemulihan Intensif'
          : 'Progres Baik',
    isDeleted: Boolean(data.isDeleted),
  };
}

function parseArticleDoc(d: any): KesproArticleItem {
  const data = d.data();
  return {
    id: String(data.id || d.id),
    title: String(data.title || ''),
    category: String(data.category || 'Kesehatan Reproduksi'),
    readTime: String(data.readTime || '4 menit baca'),
    author: String(data.author || ADMIN_RELAWAN_NAME),
    dateText: String(data.dateText || ''),
    imageUrl: String(data.imageUrl || ''),
    sourceLink: typeof data.sourceLink === 'string' && data.sourceLink ? data.sourceLink : undefined,
    summary: String(data.summary || ''),
    keyTakeaways: Array.isArray(data.keyTakeaways) ? data.keyTakeaways.map(String).slice(0, 12) : [],
    bodyParagraphs: Array.isArray(data.bodyParagraphs)
      ? data.bodyParagraphs.map(String).slice(0, 20)
      : [],
    contentMode: data.contentMode === 'html' ? 'html' : 'standard',
    customHtml: typeof data.customHtml === 'string' ? data.customHtml.slice(0, 50000) : '',
    checklist: Array.isArray(data.checklist) ? data.checklist.map(String).slice(0, 12) : [],
    isDeleted: Boolean(data.isDeleted),
  };
}

function parseVideoDoc(d: any): VideoEdukasi {
  const data = d.data();
  return {
    id: String(data.id || d.id),
    title: String(data.title || ''),
    kategori: String(data.kategori || 'Edukasi Kespro'),
    durasi: String(data.durasi || '03:00'),
    narasumber: String(data.narasumber || ADMIN_RELAWAN_NAME),
    deskripsi: String(data.deskripsi || ''),
    imageUrl: String(data.imageUrl || ''),
    videoUrl: typeof data.videoUrl === 'string' && data.videoUrl ? data.videoUrl : undefined,
    ringkasanPoin: Array.isArray(data.ringkasanPoin)
      ? data.ringkasanPoin.map(String).slice(0, 12)
      : [],
    isDeleted: Boolean(data.isDeleted),
  };
}

function parseInfographicDoc(d: any): KesproInfographicItem {
  const data = d.data();
  return {
    id: String(data.id || d.id),
    title: String(data.title || ''),
    category: String(data.category || 'Infografis ECCD'),
    caption: String(data.caption || ''),
    imageUrl: String(data.imageUrl || ''),
    linkUrl: typeof data.linkUrl === 'string' && data.linkUrl ? data.linkUrl : undefined,
    highlights: Array.isArray(data.highlights) ? data.highlights.map(String).slice(0, 12) : [],
    isDeleted: Boolean(data.isDeleted),
  };
}

function parseFaqDoc(d: any): QnaFaqItem {
  const data = d.data();
  const validCategories: QnaCategoryId[] = [
    'kesehatan-reproduksi',
    'kesehatan-mental',
    'layanan-catin',
    'pertanyaan-lainnya',
  ];
  const categoryId: QnaCategoryId = validCategories.includes(data.categoryId)
    ? data.categoryId
    : 'kesehatan-reproduksi';
  return {
    id: String(data.id || d.id),
    categoryId,
    question: String(data.question || ''),
    answer: String(data.answer || ''),
    answeredBy: String(data.answeredBy || ADMIN_RELAWAN_NAME),
    isDeleted: Boolean(data.isDeleted),
  };
}

function parsePosyanduDoc(d: any): HarmonyPosyanduActivity {
  const data = d.data();
  return {
    id: String(data.id || d.id),
    posyanduName: String(data.posyanduName || ''),
    banjar: String(data.banjar || 'Banjar Desa Harmony'),
    schedule: String(data.schedule || 'Setiap bulan'),
    nextSession: String(data.nextSession || 'Jadwal berikutnya'),
    leadMidwife: String(data.leadMidwife || ADMIN_RELAWAN_NAME),
    balitaCount: Number(data.balitaCount) || 0,
    bumilCount: Number(data.bumilCount) || 0,
    description: String(data.description || ''),
    imageUrl: String(data.imageUrl || ''),
    highlights: Array.isArray(data.highlights) ? data.highlights.map(String).slice(0, 12) : [],
    isDeleted: Boolean(data.isDeleted),
  };
}

function parseYouthArticleDoc(d: any): HarmonyYouthActivity {
  const data = d.data();
  return {
    id: String(data.id || d.id),
    programName: String(data.programName || ''),
    forumName: String(data.forumName || 'Forum Remaja Desa Harmony'),
    schedule: String(data.schedule || 'Rutin Bulanan'),
    participantCount: Number(data.participantCount) || 0,
    facilitator: String(data.facilitator || ADMIN_RELAWAN_NAME),
    topicFocus: String(data.topicFocus || 'Kesehatan Reproduksi Remaja'),
    description: String(data.description || ''),
    imageUrl: String(data.imageUrl || ''),
    outputs: Array.isArray(data.outputs) ? data.outputs.map(String).slice(0, 12) : [],
    bodyParagraphs: Array.isArray(data.bodyParagraphs)
      ? data.bodyParagraphs.map(String).slice(0, 20)
      : [],
    contentMode: data.contentMode === 'html' ? 'html' : 'standard',
    customHtml: typeof data.customHtml === 'string' ? data.customHtml.slice(0, 50000) : '',
    dateText: typeof data.dateText === 'string' && data.dateText ? data.dateText : undefined,
    readTime: typeof data.readTime === 'string' && data.readTime ? data.readTime : undefined,
    isDeleted: Boolean(data.isDeleted),
  };
}

function parsePamphletDoc(d: any): CatinPamphletItem {
  const data = d.data();
  return {
    id: String(data.id || d.id),
    title: String(data.title || ''),
    subtitle: String(data.subtitle || ''),
    category: String(data.category || 'Skrining Catin'),
    imageUrl: String(data.imageUrl || ''),
    summary: String(data.summary || ''),
    keyPoints: Array.isArray(data.keyPoints) ? data.keyPoints.map(String).slice(0, 12) : [],
    recommendedAction: String(data.recommendedAction || 'Konsultasi di Puskesmas terdekat'),
    isDeleted: Boolean(data.isDeleted),
  };
}

function parseDiseaseDoc(d: any): PenyakitSeksualEdu {
  const data = d.data();
  const tingkatBahaya: PenyakitSeksualEdu['tingkatBahaya'] =
    data.tingkatBahaya === 'Sangat Tinggi'
      ? 'Sangat Tinggi'
      : data.tingkatBahaya === 'Perlu Perhatian Khusus'
        ? 'Perlu Perhatian Khusus'
        : 'Tinggi';
  const rawMitos = Array.isArray(data.mitosFakta) ? data.mitosFakta : [];
  return {
    id: String(data.id || d.id),
    namaPenyakit: String(data.namaPenyakit || ''),
    singkatan: String(data.singkatan || 'IMS'),
    penyebab: String(data.penyebab || ''),
    kategori: String(data.kategori || 'Infeksi Menular Seksual'),
    tingkatBahaya,
    imageUrl: typeof data.imageUrl === 'string' && data.imageUrl ? data.imageUrl : undefined,
    gejalaPria: Array.isArray(data.gejalaPria) ? data.gejalaPria.map(String).slice(0, 12) : [],
    gejalaWanita: Array.isArray(data.gejalaWanita) ? data.gejalaWanita.map(String).slice(0, 12) : [],
    caraPenularan: Array.isArray(data.caraPenularan)
      ? data.caraPenularan.map(String).slice(0, 12)
      : [],
    metodePencegahan: Array.isArray(data.metodePencegahan)
      ? data.metodePencegahan.map(String).slice(0, 12)
      : [],
    pengobatan: String(data.pengobatan || ''),
    skriningPranikah: String(data.skriningPranikah || ''),
    mitosFakta: rawMitos.slice(0, 10).map((m: any) => ({
      mitos: String(m?.mitos || ''),
      fakta: String(m?.fakta || ''),
    })),
    isDeleted: Boolean(data.isDeleted),
  };
}

function parsePosyanduArticleDoc(d: any): BeritaKegiatanDetail {
  const data = d.data();
  const status: BeritaKegiatanDetail['status'] =
    data.status === 'Sedang Berlangsung'
      ? 'Sedang Berlangsung'
      : data.status === 'Akan Datang'
        ? 'Akan Datang'
        : 'Selesai';
  const contentMode: 'standard' | 'html' = data.contentMode === 'html' ? 'html' : 'standard';
  return {
    id: String(data.id || d.id),
    desaName: String(data.desaName || 'Desa Sari Mekar'),
    kecamatanName: String(data.kecamatanName || 'Kecamatan Buleleng'),
    title: String(data.title || ''),
    hari: String(data.hari || 'Sabtu'),
    tanggal: String(data.tanggal || ''),
    waktu: String(data.waktu || '08:00 - 11:00 WITA'),
    lokasi: String(data.lokasi || 'Desa Sari Mekar'),
    kategori: String(data.kategori || 'Posyandu & Gizi'),
    status,
    imageUrl: String(data.imageUrl || ''),
    ringkasan: String(data.ringkasan || ''),
    isiBeritaLengkap: String(data.isiBeritaLengkap || ''),
    contentMode,
    customHtml: typeof data.customHtml === 'string' ? data.customHtml : undefined,
    narasumber: String(data.narasumber || ADMIN_RELAWAN_NAME),
    pesertaCount: Number(data.pesertaCount) || 0,
    hasilKegiatan: Array.isArray(data.hasilKegiatan)
      ? data.hasilKegiatan.map(String).slice(0, 12)
      : [],
    isDeleted: Boolean(data.isDeleted),
  };
}

/**
 * Fetches publicly readable CMS records from Firebase Firestore so non-logged-in visitors
 * see live Admin updates immediately. Every list query uses a query-provable filter.
 */
export async function fetchPublicCmsState(): Promise<CmsSnapshotPayload> {
  try {
    const [
      villagesSnap,
      agendaSnap,
      deletedSnap,
      familySnap,
      articlesSnap,
      videosSnap,
      infographicsSnap,
      faqsSnap,
      posyanduSnap,
      posyanduArticlesSnap,
      youthSnap,
      pamphletsSnap,
      diseasesSnap,
    ] = await Promise.all([
      getDocs(query(collection(db, 'cmsVillages'), where('id', '>=', ''))),
      getDocs(
        query(collection(db, 'villageAgendas'), where('status', 'in', ['Terlaksana', 'Terjadwal']))
      ),
      getDocs(query(collection(db, 'deletedSeedAgendas'), where('agendaId', '>=', ''))),
      getDocs(
        query(collection(db, 'fosterFamilies'), where('category', 'in', ['stunting', 'ibu-hamil-kek']))
      ),
      getDocs(query(collection(db, 'cmsArticles'), where('id', '>=', ''))),
      getDocs(query(collection(db, 'cmsVideos'), where('id', '>=', ''))),
      getDocs(query(collection(db, 'cmsInfographics'), where('id', '>=', ''))),
      getDocs(query(collection(db, 'cmsFaqs'), where('id', '>=', ''))),
      getDocs(query(collection(db, 'cmsPosyandu'), where('id', '>=', ''))),
      getDocs(query(collection(db, 'cmsPosyanduArticles'), where('id', '>=', ''))),
      getDocs(query(collection(db, 'cmsYouthArticles'), where('id', '>=', ''))),
      getDocs(query(collection(db, 'cmsPamphlets'), where('id', '>=', ''))),
      getDocs(query(collection(db, 'cmsDiseases'), where('id', '>=', ''))),
    ]);

    return {
      villages: villagesSnap.docs.map(parseVillageDoc),
      agendas: agendaSnap.docs.map(parseAgendaDoc),
      deletedSeedAgendaIds: deletedSnap.docs.map((d) => String(d.data().agendaId || d.id)),
      fosterFamilies: familySnap.docs.map(parseFamilyDoc),
      articles: articlesSnap.docs.map(parseArticleDoc),
      videos: videosSnap.docs.map(parseVideoDoc),
      infographics: infographicsSnap.docs.map(parseInfographicDoc),
      faqs: faqsSnap.docs.map(parseFaqDoc),
      posyanduList: posyanduSnap.docs.map(parsePosyanduDoc),
      posyanduArticles: posyanduArticlesSnap.docs.map(parsePosyanduArticleDoc),
      youthArticles: youthSnap.docs.map(parseYouthArticleDoc),
      pamphlets: pamphletsSnap.docs.map(parsePamphletDoc),
      diseases: diseasesSnap.docs.map(parseDiseaseDoc),
      integrationConfig: DEFAULT_INTEGRATION_CONFIG,
    };
  } catch (err) {
    console.warn('Public CMS fetch fallback to seed data:', err);
    return {
      villages: [],
      agendas: [],
      deletedSeedAgendaIds: [],
      fosterFamilies: [],
      articles: [],
      videos: [],
      infographics: [],
      faqs: [],
      posyanduList: [],
      posyanduArticles: [],
      youthArticles: [],
      pamphlets: [],
      diseases: [],
      integrationConfig: DEFAULT_INTEGRATION_CONFIG,
    };
  }
}

export async function fetchAdminIntegrationConfig(): Promise<CmsIntegrationConfig> {
  try {
    const snap = await getDoc(doc(db, 'cmsSettings', 'integrations'));
    if (!snap.exists()) return DEFAULT_INTEGRATION_CONFIG;
    const data = snap.data();
    return {
      id: 'integrations',
      gasWebAppUrl: String(data.gasWebAppUrl || ''),
      cloudinaryCloudName:
        String(data.cloudinaryCloudName || '').trim() || DEFAULT_CLOUDINARY_CLOUD_NAME,
      cloudinaryUploadPreset: String(data.cloudinaryUploadPreset || ''),
      cloudinaryFolder: String(data.cloudinaryFolder || DEFAULT_CLOUDINARY_FOLDER),
      autoSyncGas: Boolean(data.autoSyncGas),
      updatedBy: String(data.updatedBy || ADMIN_RELAWAN_NAME),
    };
  } catch {
    return DEFAULT_INTEGRATION_CONFIG;
  }
}

export async function saveIntegrationConfigToFirestore(
  config: CmsIntegrationConfig
): Promise<CmsIntegrationConfig> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Silakan login sebagai Admin terlebih dahulu.');

  const docPath = 'cmsSettings/integrations';
  const docRef = doc(db, 'cmsSettings', 'integrations');
  const sanitized: CmsIntegrationConfig = {
    id: 'integrations',
    gasWebAppUrl: (config.gasWebAppUrl || '').trim().slice(0, 500),
    cloudinaryCloudName:
      (config.cloudinaryCloudName || '').trim().slice(0, 120) || DEFAULT_CLOUDINARY_CLOUD_NAME,
    cloudinaryUploadPreset: (config.cloudinaryUploadPreset || '').trim().slice(0, 120),
    cloudinaryFolder:
      (config.cloudinaryFolder || DEFAULT_CLOUDINARY_FOLDER).trim().slice(0, 120),
    autoSyncGas: Boolean(config.autoSyncGas),
    updatedBy: ADMIN_RELAWAN_NAME,
  };

  try {
    const existingSnap = await getDoc(docRef);
    if (existingSnap.exists()) {
      await updateDoc(docRef, {
        gasWebAppUrl: sanitized.gasWebAppUrl,
        cloudinaryCloudName: sanitized.cloudinaryCloudName,
        cloudinaryUploadPreset: sanitized.cloudinaryUploadPreset,
        cloudinaryFolder: sanitized.cloudinaryFolder,
        autoSyncGas: sanitized.autoSyncGas,
        updatedBy: ADMIN_RELAWAN_NAME,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(docRef, {
        ...sanitized,
        authorUid: uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    return sanitized;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, docPath);
  }
}

/**
 * Attaches real-time onSnapshot listeners ONLY when authenticated.
 */
export function subscribeAuthenticatedCmsState(
  onUpdate: (partial: Partial<CmsSnapshotPayload>) => void,
  isAdminUser: boolean
): () => void {
  const unsubs: (() => void)[] = [];

  unsubs.push(
    onSnapshot(
      query(collection(db, 'cmsVillages'), where('id', '>=', '')),
      (snap) => onUpdate({ villages: snap.docs.map(parseVillageDoc) }),
      (error) => handleFirestoreError(error, OperationType.LIST, 'cmsVillages')
    )
  );

  unsubs.push(
    onSnapshot(
      query(collection(db, 'villageAgendas'), where('status', 'in', ['Terlaksana', 'Terjadwal'])),
      (snap) => onUpdate({ agendas: snap.docs.map(parseAgendaDoc) }),
      (error) => handleFirestoreError(error, OperationType.LIST, 'villageAgendas')
    )
  );

  unsubs.push(
    onSnapshot(
      query(collection(db, 'deletedSeedAgendas'), where('agendaId', '>=', '')),
      (snap) =>
        onUpdate({
          deletedSeedAgendaIds: snap.docs.map((d) => String(d.data().agendaId || d.id)),
        }),
      (error) => handleFirestoreError(error, OperationType.LIST, 'deletedSeedAgendas')
    )
  );

  unsubs.push(
    onSnapshot(
      query(collection(db, 'fosterFamilies'), where('category', 'in', ['stunting', 'ibu-hamil-kek'])),
      (snap) => onUpdate({ fosterFamilies: snap.docs.map(parseFamilyDoc) }),
      (error) => handleFirestoreError(error, OperationType.LIST, 'fosterFamilies')
    )
  );

  unsubs.push(
    onSnapshot(
      query(collection(db, 'cmsArticles'), where('id', '>=', '')),
      (snap) => onUpdate({ articles: snap.docs.map(parseArticleDoc) }),
      (error) => handleFirestoreError(error, OperationType.LIST, 'cmsArticles')
    )
  );

  unsubs.push(
    onSnapshot(
      query(collection(db, 'cmsVideos'), where('id', '>=', '')),
      (snap) => onUpdate({ videos: snap.docs.map(parseVideoDoc) }),
      (error) => handleFirestoreError(error, OperationType.LIST, 'cmsVideos')
    )
  );

  unsubs.push(
    onSnapshot(
      query(collection(db, 'cmsInfographics'), where('id', '>=', '')),
      (snap) => onUpdate({ infographics: snap.docs.map(parseInfographicDoc) }),
      (error) => handleFirestoreError(error, OperationType.LIST, 'cmsInfographics')
    )
  );

  unsubs.push(
    onSnapshot(
      query(collection(db, 'cmsFaqs'), where('id', '>=', '')),
      (snap) => onUpdate({ faqs: snap.docs.map(parseFaqDoc) }),
      (error) => handleFirestoreError(error, OperationType.LIST, 'cmsFaqs')
    )
  );

  unsubs.push(
    onSnapshot(
      query(collection(db, 'cmsPosyandu'), where('id', '>=', '')),
      (snap) => onUpdate({ posyanduList: snap.docs.map(parsePosyanduDoc) }),
      (error) => handleFirestoreError(error, OperationType.LIST, 'cmsPosyandu')
    )
  );

  unsubs.push(
    onSnapshot(
      query(collection(db, 'cmsYouthArticles'), where('id', '>=', '')),
      (snap) => onUpdate({ youthArticles: snap.docs.map(parseYouthArticleDoc) }),
      (error) => handleFirestoreError(error, OperationType.LIST, 'cmsYouthArticles')
    )
  );

  unsubs.push(
    onSnapshot(
      query(collection(db, 'cmsPamphlets'), where('id', '>=', '')),
      (snap) => onUpdate({ pamphlets: snap.docs.map(parsePamphletDoc) }),
      (error) => handleFirestoreError(error, OperationType.LIST, 'cmsPamphlets')
    )
  );

  unsubs.push(
    onSnapshot(
      query(collection(db, 'cmsDiseases'), where('id', '>=', '')),
      (snap) => onUpdate({ diseases: snap.docs.map(parseDiseaseDoc) }),
      (error) => handleFirestoreError(error, OperationType.LIST, 'cmsDiseases')
    )
  );

  unsubs.push(
    onSnapshot(
      query(collection(db, 'cmsPosyanduArticles'), where('id', '>=', '')),
      (snap) => onUpdate({ posyanduArticles: snap.docs.map(parsePosyanduArticleDoc) }),
      (error) => handleFirestoreError(error, OperationType.LIST, 'cmsPosyanduArticles')
    )
  );

  if (isAdminUser) {
    unsubs.push(
      onSnapshot(
        doc(db, 'cmsSettings', 'integrations'),
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            onUpdate({
              integrationConfig: {
                id: 'integrations',
                gasWebAppUrl: String(data.gasWebAppUrl || ''),
                cloudinaryCloudName:
                  String(data.cloudinaryCloudName || '').trim() || DEFAULT_CLOUDINARY_CLOUD_NAME,
                cloudinaryUploadPreset: String(data.cloudinaryUploadPreset || ''),
                cloudinaryFolder: String(data.cloudinaryFolder || DEFAULT_CLOUDINARY_FOLDER),
                autoSyncGas: Boolean(data.autoSyncGas),
                updatedBy: String(data.updatedBy || ADMIN_RELAWAN_NAME),
              },
            });
          }
        },
        (error) => handleFirestoreError(error, OperationType.GET, 'cmsSettings/integrations')
      )
    );
  }

  return () => {
    unsubs.forEach((fn) => fn());
  };
}

// =========================================================================
// CRUD: VILLAGES / KELURAHAN KABUPATEN BULELENG
// =========================================================================
export async function saveCmsVillageToFirestore(
  village: CmsVillageRecord,
  isUpdateExistingDoc: boolean
): Promise<CmsVillageRecord> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Silakan login sebagai Admin terlebih dahulu.');

  const safeId = sanitizeDocId(village.id || `desa-${village.kecamatanId}-${Date.now()}`, 'desa');
  const docPath = `cmsVillages/${safeId}`;
  const docRef = doc(db, 'cmsVillages', safeId);

  const lakiLaki = Math.max(0, Math.min(200000, Math.round(Number(village.lakiLaki) || 0)));
  const perempuan = Math.max(0, Math.min(200000, Math.round(Number(village.perempuan) || 0)));
  const totalRecipients = Math.max(
    lakiLaki + perempuan,
    Math.min(200000, Math.round(Number(village.totalRecipients) || lakiLaki + perempuan))
  );

  const sanitized: CmsVillageRecord = {
    id: safeId,
    name: clampStr(village.name, 2, 140, 'Desa Binaan Buleleng'),
    kecamatanId: sanitizeDocId(village.kecamatanId, 'buleleng').slice(0, 64),
    kecamatanName: clampStr(village.kecamatanName, 2, 120, 'Kecamatan Buleleng'),
    lat: Math.max(-9.0, Math.min(-7.5, Number(village.lat) || -8.118)),
    lng: Math.max(114.2, Math.min(116.0, Number(village.lng) || 115.088)),
    population: Math.max(0, Math.min(500000, Math.round(Number(village.population) || 0))),
    posyanduCount: Math.max(0, Math.min(200, Math.round(Number(village.posyanduCount) || 1))),
    stuntingPct: Math.max(0, Math.min(100, Math.round((Number(village.stuntingPct) || 0) * 10) / 10)),
    statusProgram:
      village.statusProgram === 'Desa Binaan Utama'
        ? 'Desa Binaan Utama'
        : village.statusProgram === 'Siaga Layanan'
          ? 'Siaga Layanan'
          : 'Aktif ECCD Mobile',
    deskripsi: clampStr(village.deskripsi, 3, 1200, 'Lokasi layanan lapangan ECCD PKBI Buleleng.'),
    totalRecipients,
    lakiLaki,
    perempuan,
    imageUrl: (village.imageUrl || '').trim().slice(0, 600),
    isDeleted: Boolean(village.isDeleted),
  };

  const payload: Record<string, unknown> = {
    name: sanitized.name,
    kecamatanId: sanitized.kecamatanId,
    kecamatanName: sanitized.kecamatanName,
    lat: sanitized.lat,
    lng: sanitized.lng,
    population: sanitized.population,
    posyanduCount: sanitized.posyanduCount,
    stuntingPct: sanitized.stuntingPct,
    statusProgram: sanitized.statusProgram,
    deskripsi: sanitized.deskripsi,
    totalRecipients: sanitized.totalRecipients,
    lakiLaki: sanitized.lakiLaki,
    perempuan: sanitized.perempuan,
    imageUrl: sanitized.imageUrl || '',
    isDeleted: Boolean(sanitized.isDeleted),
    updatedBy: ADMIN_RELAWAN_NAME,
    updatedAt: serverTimestamp(),
  };

  try {
    if (isUpdateExistingDoc) {
      await updateDoc(docRef, payload);
    } else {
      await setDoc(docRef, {
        ...payload,
        id: safeId,
        authorUid: uid,
        createdAt: serverTimestamp(),
      });
    }
    return sanitized;
  } catch (err) {
    handleFirestoreError(err, isUpdateExistingDoc ? OperationType.UPDATE : OperationType.CREATE, docPath);
  }
}

// =========================================================================
// CRUD: VILLAGE AGENDAS
// =========================================================================
export async function saveVillageAgendaToFirestore(
  agenda: EccdVillageAgendaItem,
  isUpdateExistingDoc: boolean
): Promise<EccdVillageAgendaItem> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Silakan login sebagai Admin terlebih dahulu.');

  const safeId = sanitizeDocId(agenda.id || `ag-${agenda.villageId}-${Date.now()}`, 'ag');
  const docPath = `villageAgendas/${safeId}`;
  const docRef = doc(db, 'villageAgendas', safeId);

  const sanitized: EccdVillageAgendaItem = {
    id: safeId,
    villageId: sanitizeDocId(agenda.villageId, 'desa'),
    kecamatanId: sanitizeDocId(agenda.kecamatanId, 'kec').slice(0, 64),
    title: clampStr(agenda.title, 3, 180, 'Kegiatan Layanan ECCD'),
    category: clampStr(agenda.category, 2, 80, 'Layanan Mobile ECCD'),
    date: clampStr(agenda.date, 4, 32, new Date().toISOString().slice(0, 10)),
    displayDate: clampStr(agenda.displayDate, 4, 80, agenda.date || 'Jadwal Terbaru'),
    time: clampStr(agenda.time, 3, 60, '09.00 - 12.00 WITA'),
    status: agenda.status === 'Terjadwal' ? 'Terjadwal' : 'Terlaksana',
    location: clampStr(agenda.location, 3, 160, 'Balai Banjar Desa'),
    facilitator: clampStr(agenda.facilitator, 3, 140, ADMIN_RELAWAN_NAME),
    participants: Math.max(0, Math.min(100000, Math.round(Number(agenda.participants) || 0))),
    summary: clampStr(agenda.summary, 5, 1200, 'Dokumentasi kegiatan lapangan ECCD PKBI Buleleng.'),
    galleryImages: (agenda.galleryImages || [])
      .filter((u) => typeof u === 'string' && u.trim().length > 0)
      .map((u) => u.trim().slice(0, 600))
      .slice(0, 5),
  };

  try {
    if (isUpdateExistingDoc) {
      await updateDoc(docRef, {
        villageId: sanitized.villageId,
        kecamatanId: sanitized.kecamatanId,
        title: sanitized.title,
        category: sanitized.category,
        date: sanitized.date,
        displayDate: sanitized.displayDate,
        time: sanitized.time,
        status: sanitized.status,
        location: sanitized.location,
        facilitator: sanitized.facilitator,
        participants: sanitized.participants,
        summary: sanitized.summary,
        galleryImages: sanitized.galleryImages,
        updatedBy: ADMIN_RELAWAN_NAME,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(docRef, {
        ...sanitized,
        authorUid: uid,
        updatedBy: ADMIN_RELAWAN_NAME,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    return sanitized;
  } catch (err) {
    handleFirestoreError(err, isUpdateExistingDoc ? OperationType.UPDATE : OperationType.CREATE, docPath);
  }
}

export async function deleteVillageAgendaFromFirestore(
  agendaId: string,
  villageId: string,
  isSeedAgenda: boolean
): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Silakan login sebagai Admin terlebih dahulu.');

  const safeId = sanitizeDocId(agendaId, 'ag');
  try {
    if (isSeedAgenda) {
      await setDoc(doc(db, 'deletedSeedAgendas', safeId), {
        agendaId: safeId,
        villageId: sanitizeDocId(villageId, 'desa'),
        authorUid: uid,
        createdAt: serverTimestamp(),
      });
      try {
        await deleteDoc(doc(db, 'villageAgendas', safeId));
      } catch {
        // Ignore if override doc never existed
      }
    } else {
      await deleteDoc(doc(db, 'villageAgendas', safeId));
    }
  } catch (err) {
    handleFirestoreError(
      err,
      isSeedAgenda ? OperationType.CREATE : OperationType.DELETE,
      isSeedAgenda ? `deletedSeedAgendas/${safeId}` : `villageAgendas/${safeId}`
    );
  }
}

// =========================================================================
// CRUD: FOSTER FAMILIES (DESA HARMONY)
// =========================================================================
export async function saveFosterFamilyToFirestore(
  family: HarmonyFosterFamily,
  isUpdateExistingDoc: boolean
): Promise<HarmonyFosterFamily> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Silakan login sebagai Admin terlebih dahulu.');

  const safeId = sanitizeDocId(family.id || `ka-${Date.now()}`, 'ka');
  const docPath = `fosterFamilies/${safeId}`;
  const docRef = doc(db, 'fosterFamilies', safeId);

  const boundedGrowth = (family.monthlyGrowth || [])
    .slice(0, 60)
    .map((pt) => buildMonthlyGrowthPoint(pt.month, pt.heightCm, pt.weightKg));

  const boundedInterventions = (family.interventions || [])
    .map((s) => s.trim().slice(0, 240))
    .filter(Boolean)
    .slice(0, 10);

  const childSex: ChildSex | undefined =
    family.category === 'stunting' ? (family.childSex === 'P' ? 'P' : 'L') : undefined;

  const sanitized: HarmonyFosterFamily = {
    id: safeId,
    codeName: clampStr(family.codeName, 2, 60, 'Keluarga Asuh'),
    guardianOrMotherName: clampStr(family.guardianOrMotherName, 2, 80, 'An. B.L'),
    banjar: clampStr(family.banjar, 2, 80, 'Banjar Dangin Yeh'),
    category: family.category === 'ibu-hamil-kek' ? 'ibu-hamil-kek' : 'stunting',
    categoryLabel: clampStr(
      family.categoryLabel,
      2,
      80,
      family.category === 'ibu-hamil-kek' ? 'Ibu Hamil KEK' : 'Kasus Anak Stunting'
    ),
    targetName: clampStr(family.targetName, 2, 100, 'Usia 12 Bulan (1 Tahun)'),
    childAgeMonths:
      family.category === 'stunting'
        ? Math.max(1, Math.min(72, Math.round(family.childAgeMonths || boundedGrowth.length || 12)))
        : undefined,
    childSex,
    baselineMetric: clampStr(family.baselineMetric, 2, 200, 'Data awal terpantau'),
    currentMetric: clampStr(family.currentMetric, 2, 200, 'Perkembangan terbaru'),
    progressPct: Math.max(0, Math.min(100, Math.round(Number(family.progressPct) || 0))),
    mentorName: clampStr(family.mentorName, 2, 120, ADMIN_RELAWAN_NAME),
    recordedBy: ADMIN_RELAWAN_NAME,
    interventions:
      boundedInterventions.length > 0 ? boundedInterventions : ['Pemantauan berkala PKBI Buleleng'],
    monthlyGrowth: boundedGrowth.length > 0 ? boundedGrowth : undefined,
    statusLabel:
      family.statusLabel === 'Target Tercapai'
        ? 'Target Tercapai'
        : family.statusLabel === 'Pemulihan Intensif'
          ? 'Pemulihan Intensif'
          : 'Progres Baik',
    isDeleted: Boolean(family.isDeleted),
  };

  const payload: Record<string, unknown> = {
    codeName: sanitized.codeName,
    guardianOrMotherName: sanitized.guardianOrMotherName,
    banjar: sanitized.banjar,
    category: sanitized.category,
    categoryLabel: sanitized.categoryLabel,
    targetName: sanitized.targetName,
    baselineMetric: sanitized.baselineMetric,
    currentMetric: sanitized.currentMetric,
    progressPct: sanitized.progressPct,
    mentorName: sanitized.mentorName,
    recordedBy: sanitized.recordedBy,
    interventions: sanitized.interventions,
    statusLabel: sanitized.statusLabel,
    isDeleted: Boolean(sanitized.isDeleted),
    updatedAt: serverTimestamp(),
  };

  if (typeof sanitized.childAgeMonths === 'number') {
    payload.childAgeMonths = sanitized.childAgeMonths;
  }
  if (sanitized.childSex) {
    payload.childSex = sanitized.childSex;
  }
  if (sanitized.monthlyGrowth && sanitized.monthlyGrowth.length > 0) {
    payload.monthlyGrowth = sanitized.monthlyGrowth;
  }

  try {
    if (isUpdateExistingDoc) {
      await updateDoc(docRef, payload);
    } else {
      await setDoc(docRef, {
        ...payload,
        id: safeId,
        authorUid: uid,
        createdAt: serverTimestamp(),
      });
    }
    return sanitized;
  } catch (err) {
    handleFirestoreError(err, isUpdateExistingDoc ? OperationType.UPDATE : OperationType.CREATE, docPath);
  }
}

export async function deleteFosterFamilyFromFirestore(
  family: HarmonyFosterFamily,
  isSeedFamily: boolean,
  hasFirestoreDoc: boolean
): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Silakan login sebagai Admin terlebih dahulu.');

  const safeId = sanitizeDocId(family.id, 'ka');
  try {
    if (isSeedFamily) {
      await saveFosterFamilyToFirestore({ ...family, isDeleted: true }, hasFirestoreDoc);
    } else {
      await deleteDoc(doc(db, 'fosterFamilies', safeId));
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `fosterFamilies/${safeId}`);
  }
}

// =========================================================================
// CRUD: ARTICLES, VIDEOS, INFOGRAPHICS, FAQS
// =========================================================================
export async function saveCmsArticleToFirestore(
  article: KesproArticleItem,
  isUpdateExistingDoc: boolean
): Promise<KesproArticleItem> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Silakan login sebagai Admin terlebih dahulu.');

  const safeId = sanitizeDocId(article.id || `art-${Date.now()}`, 'art');
  const docRef = doc(db, 'cmsArticles', safeId);

  const sanitized: KesproArticleItem = {
    id: safeId,
    title: clampStr(article.title, 3, 200, 'Artikel Edukasi PKBI'),
    category: clampStr(article.category, 2, 80, 'Kesehatan Reproduksi'),
    readTime: clampStr(article.readTime, 2, 40, '4 menit baca'),
    author: clampStr(article.author, 2, 120, ADMIN_RELAWAN_NAME),
    dateText: clampStr(article.dateText, 2, 60, new Date().toLocaleDateString('id-ID')),
    imageUrl: (article.imageUrl || '').trim().slice(0, 600),
    sourceLink: (article.sourceLink || '').trim().slice(0, 600),
    summary: clampStr(article.summary, 5, 1000, 'Ringkasan panduan edukasi kesehatan reproduksi.'),
    keyTakeaways: (article.keyTakeaways || []).map((s) => s.trim().slice(0, 300)).filter(Boolean).slice(0, 12),
    bodyParagraphs: (article.bodyParagraphs || []).map((s) => s.trim().slice(0, 2000)).filter(Boolean).slice(0, 20),
    contentMode: article.contentMode === 'html' ? 'html' : 'standard',
    customHtml: (article.customHtml || '').trim().slice(0, 50000),
    checklist: (article.checklist || []).map((s) => s.trim().slice(0, 300)).filter(Boolean).slice(0, 12),
    isDeleted: Boolean(article.isDeleted),
  };

  const payload: Record<string, unknown> = {
    title: sanitized.title,
    category: sanitized.category,
    readTime: sanitized.readTime,
    author: sanitized.author,
    dateText: sanitized.dateText,
    imageUrl: sanitized.imageUrl,
    sourceLink: sanitized.sourceLink || '',
    summary: sanitized.summary,
    keyTakeaways: sanitized.keyTakeaways,
    bodyParagraphs: sanitized.bodyParagraphs,
    contentMode: sanitized.contentMode || 'standard',
    customHtml: sanitized.customHtml || '',
    checklist: sanitized.checklist,
    isDeleted: Boolean(sanitized.isDeleted),
    updatedBy: ADMIN_RELAWAN_NAME,
    updatedAt: serverTimestamp(),
  };

  try {
    if (isUpdateExistingDoc) {
      await updateDoc(docRef, payload);
    } else {
      await setDoc(docRef, { ...payload, id: safeId, authorUid: uid, createdAt: serverTimestamp() });
    }
    return sanitized;
  } catch (err) {
    handleFirestoreError(err, isUpdateExistingDoc ? OperationType.UPDATE : OperationType.CREATE, `cmsArticles/${safeId}`);
  }
}

export async function deleteCmsArticleFromFirestore(
  article: KesproArticleItem,
  isSeed: boolean,
  hasFirestoreDoc: boolean
): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Silakan login sebagai Admin terlebih dahulu.');
  const safeId = sanitizeDocId(article.id, 'art');
  try {
    if (isSeed) {
      await saveCmsArticleToFirestore({ ...article, isDeleted: true }, hasFirestoreDoc);
    } else {
      await deleteDoc(doc(db, 'cmsArticles', safeId));
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `cmsArticles/${safeId}`);
  }
}

export async function saveCmsVideoToFirestore(
  video: VideoEdukasi,
  isUpdateExistingDoc: boolean
): Promise<VideoEdukasi> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Silakan login sebagai Admin terlebih dahulu.');

  const safeId = sanitizeDocId(video.id || `vid-${Date.now()}`, 'vid');
  const docRef = doc(db, 'cmsVideos', safeId);

  const sanitized: VideoEdukasi = {
    id: safeId,
    title: clampStr(video.title, 3, 200, 'Video Edukasi PKBI'),
    kategori: clampStr(video.kategori, 2, 80, 'Edukasi Kespro'),
    durasi: clampStr(video.durasi, 2, 40, '03:00'),
    narasumber: clampStr(video.narasumber, 2, 140, ADMIN_RELAWAN_NAME),
    deskripsi: clampStr(video.deskripsi, 5, 1200, 'Video edukasi Project ECCD PKBI Buleleng.'),
    imageUrl: (video.imageUrl || '').trim().slice(0, 600),
    videoUrl: (video.videoUrl || '').trim().slice(0, 600),
    ringkasanPoin: (video.ringkasanPoin || []).map((s) => s.trim().slice(0, 300)).filter(Boolean).slice(0, 12),
    isDeleted: Boolean(video.isDeleted),
  };

  const payload: Record<string, unknown> = {
    title: sanitized.title,
    kategori: sanitized.kategori,
    durasi: sanitized.durasi,
    narasumber: sanitized.narasumber,
    deskripsi: sanitized.deskripsi,
    imageUrl: sanitized.imageUrl,
    videoUrl: sanitized.videoUrl || '',
    ringkasanPoin: sanitized.ringkasanPoin,
    isDeleted: Boolean(sanitized.isDeleted),
    updatedBy: ADMIN_RELAWAN_NAME,
    updatedAt: serverTimestamp(),
  };

  try {
    if (isUpdateExistingDoc) {
      await updateDoc(docRef, payload);
    } else {
      await setDoc(docRef, { ...payload, id: safeId, authorUid: uid, createdAt: serverTimestamp() });
    }
    return sanitized;
  } catch (err) {
    handleFirestoreError(err, isUpdateExistingDoc ? OperationType.UPDATE : OperationType.CREATE, `cmsVideos/${safeId}`);
  }
}

export async function deleteCmsVideoFromFirestore(
  video: VideoEdukasi,
  isSeed: boolean,
  hasFirestoreDoc: boolean
): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Silakan login sebagai Admin terlebih dahulu.');
  const safeId = sanitizeDocId(video.id, 'vid');
  try {
    if (isSeed) {
      await saveCmsVideoToFirestore({ ...video, isDeleted: true }, hasFirestoreDoc);
    } else {
      await deleteDoc(doc(db, 'cmsVideos', safeId));
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `cmsVideos/${safeId}`);
  }
}

export async function saveCmsInfographicToFirestore(
  item: KesproInfographicItem,
  isUpdateExistingDoc: boolean
): Promise<KesproInfographicItem> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Silakan login sebagai Admin terlebih dahulu.');

  const safeId = sanitizeDocId(item.id || `inf-${Date.now()}`, 'inf');
  const docRef = doc(db, 'cmsInfographics', safeId);

  const sanitized: KesproInfographicItem = {
    id: safeId,
    title: clampStr(item.title, 3, 180, 'Infografis PKBI Buleleng'),
    category: clampStr(item.category, 2, 80, 'Infografis ECCD'),
    caption: clampStr(item.caption, 3, 1000, 'Dokumentasi & panduan visual PKBI Buleleng.'),
    imageUrl: (item.imageUrl || '').trim().slice(0, 600),
    linkUrl: (item.linkUrl || '').trim().slice(0, 600),
    highlights: (item.highlights || []).map((s) => s.trim().slice(0, 300)).filter(Boolean).slice(0, 12),
    isDeleted: Boolean(item.isDeleted),
  };

  const payload: Record<string, unknown> = {
    title: sanitized.title,
    category: sanitized.category,
    caption: sanitized.caption,
    imageUrl: sanitized.imageUrl,
    linkUrl: sanitized.linkUrl || '',
    highlights: sanitized.highlights,
    isDeleted: Boolean(sanitized.isDeleted),
    updatedBy: ADMIN_RELAWAN_NAME,
    updatedAt: serverTimestamp(),
  };

  try {
    if (isUpdateExistingDoc) {
      await updateDoc(docRef, payload);
    } else {
      await setDoc(docRef, { ...payload, id: safeId, authorUid: uid, createdAt: serverTimestamp() });
    }
    return sanitized;
  } catch (err) {
    handleFirestoreError(err, isUpdateExistingDoc ? OperationType.UPDATE : OperationType.CREATE, `cmsInfographics/${safeId}`);
  }
}

export async function deleteCmsInfographicFromFirestore(
  item: KesproInfographicItem,
  isSeed: boolean,
  hasFirestoreDoc: boolean
): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Silakan login sebagai Admin terlebih dahulu.');
  const safeId = sanitizeDocId(item.id, 'inf');
  try {
    if (isSeed) {
      await saveCmsInfographicToFirestore({ ...item, isDeleted: true }, hasFirestoreDoc);
    } else {
      await deleteDoc(doc(db, 'cmsInfographics', safeId));
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `cmsInfographics/${safeId}`);
  }
}

export async function saveCmsFaqToFirestore(
  faq: QnaFaqItem,
  isUpdateExistingDoc: boolean
): Promise<QnaFaqItem> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Silakan login sebagai Admin terlebih dahulu.');

  const safeId = sanitizeDocId(faq.id || `faq-${Date.now()}`, 'faq');
  const docRef = doc(db, 'cmsFaqs', safeId);

  const sanitized: QnaFaqItem = {
    id: safeId,
    categoryId: faq.categoryId || 'kesehatan-reproduksi',
    question: clampStr(faq.question, 5, 300, 'Pertanyaan umum layanan PKBI'),
    answer: clampStr(faq.answer, 5, 1600, 'Penjelasan resmi dari tim konselor PKBI Buleleng.'),
    answeredBy: clampStr(faq.answeredBy, 2, 140, ADMIN_RELAWAN_NAME),
    isDeleted: Boolean(faq.isDeleted),
  };

  const payload: Record<string, unknown> = {
    categoryId: sanitized.categoryId,
    question: sanitized.question,
    answer: sanitized.answer,
    answeredBy: sanitized.answeredBy,
    isDeleted: Boolean(sanitized.isDeleted),
    updatedBy: ADMIN_RELAWAN_NAME,
    updatedAt: serverTimestamp(),
  };

  try {
    if (isUpdateExistingDoc) {
      await updateDoc(docRef, payload);
    } else {
      await setDoc(docRef, { ...payload, id: safeId, authorUid: uid, createdAt: serverTimestamp() });
    }
    return sanitized;
  } catch (err) {
    handleFirestoreError(err, isUpdateExistingDoc ? OperationType.UPDATE : OperationType.CREATE, `cmsFaqs/${safeId}`);
  }
}

export async function deleteCmsFaqFromFirestore(
  faq: QnaFaqItem,
  isSeed: boolean,
  hasFirestoreDoc: boolean
): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Silakan login sebagai Admin terlebih dahulu.');
  const safeId = sanitizeDocId(faq.id, 'faq');
  try {
    if (isSeed) {
      await saveCmsFaqToFirestore({ ...faq, isDeleted: true }, hasFirestoreDoc);
    } else {
      await deleteDoc(doc(db, 'cmsFaqs', safeId));
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `cmsFaqs/${safeId}`);
  }
}

// =========================================================================
// CRUD: DESA HARMONY POSYANDU
// =========================================================================
export async function saveCmsPosyanduToFirestore(
  item: HarmonyPosyanduActivity,
  isUpdateExistingDoc: boolean
): Promise<HarmonyPosyanduActivity> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Silakan login sebagai Admin terlebih dahulu.');

  const safeId = sanitizeDocId(item.id || `pos-${Date.now()}`, 'pos');
  const docRef = doc(db, 'cmsPosyandu', safeId);

  const sanitized: HarmonyPosyanduActivity = {
    id: safeId,
    posyanduName: clampStr(item.posyanduName, 2, 140, 'Posyandu Desa Harmony'),
    banjar: clampStr(item.banjar, 2, 120, 'Banjar Desa Harmony'),
    schedule: clampStr(item.schedule, 2, 140, 'Setiap Bulan · 08.30 WITA'),
    nextSession: clampStr(item.nextSession, 2, 120, 'Jadwal Bulan Ini'),
    leadMidwife: clampStr(item.leadMidwife, 2, 140, ADMIN_RELAWAN_NAME),
    balitaCount: Math.max(0, Math.min(50000, Math.round(Number(item.balitaCount) || 0))),
    bumilCount: Math.max(0, Math.min(50000, Math.round(Number(item.bumilCount) || 0))),
    description: clampStr(item.description, 3, 1200, 'Layanan pemantauan gizi dan tumbuh kembang balita.'),
    imageUrl: (item.imageUrl || '').trim().slice(0, 600),
    highlights: (item.highlights || []).map((s) => s.trim().slice(0, 300)).filter(Boolean).slice(0, 12),
    isDeleted: Boolean(item.isDeleted),
  };

  const payload: Record<string, unknown> = {
    posyanduName: sanitized.posyanduName,
    banjar: sanitized.banjar,
    schedule: sanitized.schedule,
    nextSession: sanitized.nextSession,
    leadMidwife: sanitized.leadMidwife,
    balitaCount: sanitized.balitaCount,
    bumilCount: sanitized.bumilCount,
    description: sanitized.description,
    imageUrl: sanitized.imageUrl,
    highlights: sanitized.highlights,
    isDeleted: Boolean(sanitized.isDeleted),
    updatedBy: ADMIN_RELAWAN_NAME,
    updatedAt: serverTimestamp(),
  };

  try {
    if (isUpdateExistingDoc) {
      await updateDoc(docRef, payload);
    } else {
      await setDoc(docRef, { ...payload, id: safeId, authorUid: uid, createdAt: serverTimestamp() });
    }
    return sanitized;
  } catch (err) {
    handleFirestoreError(err, isUpdateExistingDoc ? OperationType.UPDATE : OperationType.CREATE, `cmsPosyandu/${safeId}`);
  }
}

export async function deleteCmsPosyanduFromFirestore(
  item: HarmonyPosyanduActivity,
  isSeed: boolean,
  hasFirestoreDoc: boolean
): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Silakan login sebagai Admin terlebih dahulu.');
  const safeId = sanitizeDocId(item.id, 'pos');
  try {
    if (isSeed) {
      await saveCmsPosyanduToFirestore({ ...item, isDeleted: true }, hasFirestoreDoc);
    } else {
      await deleteDoc(doc(db, 'cmsPosyandu', safeId));
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `cmsPosyandu/${safeId}`);
  }
}

// =========================================================================
// CRUD: FORUM REMAJA BLOG ARTICLES (DESA HARMONY)
// =========================================================================
export async function saveCmsYouthArticleToFirestore(
  item: HarmonyYouthActivity,
  isUpdateExistingDoc: boolean
): Promise<HarmonyYouthActivity> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Silakan login sebagai Admin terlebih dahulu.');

  const safeId = sanitizeDocId(item.id || `remaja-${Date.now()}`, 'remaja');
  const docRef = doc(db, 'cmsYouthArticles', safeId);

  const sanitized: HarmonyYouthActivity = {
    id: safeId,
    programName: clampStr(item.programName, 3, 180, 'Artikel Forum Remaja Desa Harmony'),
    forumName: clampStr(item.forumName, 2, 120, 'Forum Remaja Desa Harmony'),
    schedule: clampStr(item.schedule, 2, 140, 'Rutin Bulanan'),
    participantCount: Math.max(0, Math.min(50000, Math.round(Number(item.participantCount) || 0))),
    facilitator: clampStr(item.facilitator, 2, 140, ADMIN_RELAWAN_NAME),
    topicFocus: clampStr(item.topicFocus, 2, 160, 'Kesehatan Reproduksi & Kepemimpinan Remaja'),
    description: clampStr(item.description, 5, 1200, 'Liputan kegiatan dan artikel edukasi Forum Remaja Desa Harmony.'),
    imageUrl: (item.imageUrl || '').trim().slice(0, 600),
    outputs: (item.outputs || []).map((s) => s.trim().slice(0, 300)).filter(Boolean).slice(0, 12),
    bodyParagraphs: (item.bodyParagraphs || []).map((s) => s.trim().slice(0, 2000)).filter(Boolean).slice(0, 20),
    contentMode: item.contentMode === 'html' ? 'html' : 'standard',
    customHtml: (item.customHtml || '').trim().slice(0, 50000),
    dateText: (item.dateText || '').trim().slice(0, 80),
    readTime: (item.readTime || '3 menit baca').trim().slice(0, 40),
    isDeleted: Boolean(item.isDeleted),
  };

  const payload: Record<string, unknown> = {
    programName: sanitized.programName,
    forumName: sanitized.forumName,
    schedule: sanitized.schedule,
    participantCount: sanitized.participantCount,
    facilitator: sanitized.facilitator,
    topicFocus: sanitized.topicFocus,
    description: sanitized.description,
    imageUrl: sanitized.imageUrl,
    outputs: sanitized.outputs,
    bodyParagraphs: sanitized.bodyParagraphs,
    contentMode: sanitized.contentMode || 'standard',
    customHtml: sanitized.customHtml || '',
    dateText: sanitized.dateText || '',
    readTime: sanitized.readTime || '3 menit baca',
    isDeleted: Boolean(sanitized.isDeleted),
    updatedBy: ADMIN_RELAWAN_NAME,
    updatedAt: serverTimestamp(),
  };

  try {
    if (isUpdateExistingDoc) {
      await updateDoc(docRef, payload);
    } else {
      await setDoc(docRef, { ...payload, id: safeId, authorUid: uid, createdAt: serverTimestamp() });
    }
    return sanitized;
  } catch (err) {
    handleFirestoreError(err, isUpdateExistingDoc ? OperationType.UPDATE : OperationType.CREATE, `cmsYouthArticles/${safeId}`);
  }
}

export async function deleteCmsYouthArticleFromFirestore(
  item: HarmonyYouthActivity,
  isSeed: boolean,
  hasFirestoreDoc: boolean
): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Silakan login sebagai Admin terlebih dahulu.');
  const safeId = sanitizeDocId(item.id, 'remaja');
  try {
    if (isSeed) {
      await saveCmsYouthArticleToFirestore({ ...item, isDeleted: true }, hasFirestoreDoc);
    } else {
      await deleteDoc(doc(db, 'cmsYouthArticles', safeId));
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `cmsYouthArticles/${safeId}`);
  }
}

// =========================================================================
// CRUD: CATIN PAMPHLETS
// =========================================================================
export async function saveCmsPamphletToFirestore(
  item: CatinPamphletItem,
  isUpdateExistingDoc: boolean
): Promise<CatinPamphletItem> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Silakan login sebagai Admin terlebih dahulu.');

  const safeId = sanitizeDocId(item.id || `pamflet-${Date.now()}`, 'pamflet');
  const docRef = doc(db, 'cmsPamphlets', safeId);

  const sanitized: CatinPamphletItem = {
    id: safeId,
    title: clampStr(item.title, 3, 180, 'Pamflet Skrining Catin'),
    subtitle: clampStr(item.subtitle, 2, 200, 'Panduan Persiapan Pranikah'),
    category: clampStr(item.category, 2, 80, 'Skrining Catin'),
    imageUrl: (item.imageUrl || '').trim().slice(0, 600),
    summary: clampStr(item.summary, 5, 1000, 'Ringkasan panduan skrining kesehatan calon pengantin.'),
    keyPoints: (item.keyPoints || []).map((s) => s.trim().slice(0, 300)).filter(Boolean).slice(0, 12),
    recommendedAction: clampStr(item.recommendedAction, 3, 300, 'Lakukan pemeriksaan rutin di Puskesmas terdekat.'),
    isDeleted: Boolean(item.isDeleted),
  };

  const payload: Record<string, unknown> = {
    title: sanitized.title,
    subtitle: sanitized.subtitle,
    category: sanitized.category,
    imageUrl: sanitized.imageUrl,
    summary: sanitized.summary,
    keyPoints: sanitized.keyPoints,
    recommendedAction: sanitized.recommendedAction,
    isDeleted: Boolean(sanitized.isDeleted),
    updatedBy: ADMIN_RELAWAN_NAME,
    updatedAt: serverTimestamp(),
  };

  try {
    if (isUpdateExistingDoc) {
      await updateDoc(docRef, payload);
    } else {
      await setDoc(docRef, { ...payload, id: safeId, authorUid: uid, createdAt: serverTimestamp() });
    }
    return sanitized;
  } catch (err) {
    handleFirestoreError(err, isUpdateExistingDoc ? OperationType.UPDATE : OperationType.CREATE, `cmsPamphlets/${safeId}`);
  }
}

export async function deleteCmsPamphletFromFirestore(
  item: CatinPamphletItem,
  isSeed: boolean,
  hasFirestoreDoc: boolean
): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Silakan login sebagai Admin terlebih dahulu.');
  const safeId = sanitizeDocId(item.id, 'pamflet');
  try {
    if (isSeed) {
      await saveCmsPamphletToFirestore({ ...item, isDeleted: true }, hasFirestoreDoc);
    } else {
      await deleteDoc(doc(db, 'cmsPamphlets', safeId));
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `cmsPamphlets/${safeId}`);
  }
}

// =========================================================================
// CRUD: KATALOG PENYAKIT IMS
// =========================================================================
export async function saveCmsDiseaseToFirestore(
  item: PenyakitSeksualEdu,
  isUpdateExistingDoc: boolean
): Promise<PenyakitSeksualEdu> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Silakan login sebagai Admin terlebih dahulu.');

  const safeId = sanitizeDocId(item.id || `ims-${Date.now()}`, 'ims');
  const docRef = doc(db, 'cmsDiseases', safeId);

  const tingkatBahaya: PenyakitSeksualEdu['tingkatBahaya'] =
    item.tingkatBahaya === 'Sangat Tinggi'
      ? 'Sangat Tinggi'
      : item.tingkatBahaya === 'Perlu Perhatian Khusus'
        ? 'Perlu Perhatian Khusus'
        : 'Tinggi';

  const sanitized: PenyakitSeksualEdu = {
    id: safeId,
    namaPenyakit: clampStr(item.namaPenyakit, 2, 160, 'Penyakit Menular Seksual'),
    singkatan: clampStr(item.singkatan, 1, 40, 'IMS'),
    penyebab: clampStr(item.penyebab, 3, 600, 'Infeksi patogen menular seksual.'),
    kategori: clampStr(item.kategori, 2, 100, 'Infeksi Menular Seksual'),
    tingkatBahaya,
    imageUrl: (item.imageUrl || '').trim().slice(0, 600),
    gejalaPria: (item.gejalaPria || []).map((s) => s.trim().slice(0, 300)).filter(Boolean).slice(0, 12),
    gejalaWanita: (item.gejalaWanita || []).map((s) => s.trim().slice(0, 300)).filter(Boolean).slice(0, 12),
    caraPenularan: (item.caraPenularan || []).map((s) => s.trim().slice(0, 300)).filter(Boolean).slice(0, 12),
    metodePencegahan: (item.metodePencegahan || []).map((s) => s.trim().slice(0, 300)).filter(Boolean).slice(0, 12),
    pengobatan: clampStr(item.pengobatan, 3, 1000, 'Konsultasi dan terapi medis sesuai anjuran dokter.'),
    skriningPranikah: clampStr(item.skriningPranikah, 3, 1000, 'Dapat dideteksi melalui pemeriksaan laboratorium Puskesmas.'),
    mitosFakta: (item.mitosFakta || [])
      .filter((m) => m && (m.mitos || m.fakta))
      .slice(0, 10)
      .map((m) => ({
        mitos: String(m.mitos || '').trim().slice(0, 300),
        fakta: String(m.fakta || '').trim().slice(0, 400),
      })),
    isDeleted: Boolean(item.isDeleted),
  };

  const payload: Record<string, unknown> = {
    namaPenyakit: sanitized.namaPenyakit,
    singkatan: sanitized.singkatan,
    penyebab: sanitized.penyebab,
    kategori: sanitized.kategori,
    tingkatBahaya: sanitized.tingkatBahaya,
    imageUrl: sanitized.imageUrl || '',
    gejalaPria: sanitized.gejalaPria,
    gejalaWanita: sanitized.gejalaWanita,
    caraPenularan: sanitized.caraPenularan,
    metodePencegahan: sanitized.metodePencegahan,
    pengobatan: sanitized.pengobatan,
    skriningPranikah: sanitized.skriningPranikah,
    mitosFakta: sanitized.mitosFakta,
    isDeleted: Boolean(sanitized.isDeleted),
    updatedBy: ADMIN_RELAWAN_NAME,
    updatedAt: serverTimestamp(),
  };

  try {
    if (isUpdateExistingDoc) {
      await updateDoc(docRef, payload);
    } else {
      await setDoc(docRef, { ...payload, id: safeId, authorUid: uid, createdAt: serverTimestamp() });
    }
    return sanitized;
  } catch (err) {
    handleFirestoreError(err, isUpdateExistingDoc ? OperationType.UPDATE : OperationType.CREATE, `cmsDiseases/${safeId}`);
  }
}

export async function deleteCmsDiseaseFromFirestore(
  item: PenyakitSeksualEdu,
  isSeed: boolean,
  hasFirestoreDoc: boolean
): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Silakan login sebagai Admin terlebih dahulu.');
  const safeId = sanitizeDocId(item.id, 'ims');
  try {
    if (isSeed) {
      await saveCmsDiseaseToFirestore({ ...item, isDeleted: true }, hasFirestoreDoc);
    } else {
      await deleteDoc(doc(db, 'cmsDiseases', safeId));
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `cmsDiseases/${safeId}`);
  }
}

// =========================================================================
// CRUD: ARTIKEL DOKUMENTASI POSYANDU DESA HARMONY (STANDARD / BLOGGER HTML)
// =========================================================================
export async function saveCmsPosyanduArticleToFirestore(
  item: BeritaKegiatanDetail,
  isUpdateExistingDoc: boolean
): Promise<BeritaKegiatanDetail> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Silakan login sebagai Admin terlebih dahulu.');

  const safeId = sanitizeDocId(item.id || `pos-art-${Date.now()}`, 'pos-art');
  const docRef = doc(db, 'cmsPosyanduArticles', safeId);

  const status: BeritaKegiatanDetail['status'] =
    item.status === 'Sedang Berlangsung'
      ? 'Sedang Berlangsung'
      : item.status === 'Akan Datang'
        ? 'Akan Datang'
        : 'Selesai';
  const contentMode: 'standard' | 'html' = item.contentMode === 'html' ? 'html' : 'standard';
  const customHtml = (item.customHtml || '').slice(0, 50000);

  const sanitized: BeritaKegiatanDetail = {
    id: safeId,
    desaName: clampStr(item.desaName, 2, 120, 'Desa Sari Mekar'),
    kecamatanName: clampStr(item.kecamatanName, 2, 120, 'Kecamatan Buleleng'),
    title: clampStr(item.title, 3, 200, 'Dokumentasi Posyandu Desa Harmony'),
    hari: clampStr(item.hari, 2, 40, 'Sabtu'),
    tanggal: clampStr(item.tanggal, 2, 60, new Date().toLocaleDateString('id-ID')),
    waktu: clampStr(item.waktu, 2, 60, '08:00 - 11:00 WITA'),
    lokasi: clampStr(item.lokasi, 2, 180, 'Balai Banjar Desa Sari Mekar'),
    kategori: clampStr(item.kategori, 2, 80, 'Posyandu & Gizi'),
    status,
    imageUrl: (item.imageUrl || '').trim().slice(0, 600),
    ringkasan: clampStr(item.ringkasan, 5, 1000, 'Dokumentasi kegiatan pendampingan posyandu Desa Harmony.'),
    isiBeritaLengkap: (item.isiBeritaLengkap || '').trim().slice(0, 10000),
    contentMode,
    customHtml,
    narasumber: clampStr(item.narasumber, 2, 160, ADMIN_RELAWAN_NAME),
    pesertaCount: Math.max(0, Math.min(50000, Math.round(Number(item.pesertaCount) || 0))),
    hasilKegiatan: (item.hasilKegiatan || [])
      .map((s) => s.trim().slice(0, 300))
      .filter(Boolean)
      .slice(0, 12),
    isDeleted: Boolean(item.isDeleted),
  };

  const payload: Record<string, unknown> = {
    desaName: sanitized.desaName,
    kecamatanName: sanitized.kecamatanName,
    title: sanitized.title,
    hari: sanitized.hari,
    tanggal: sanitized.tanggal,
    waktu: sanitized.waktu,
    lokasi: sanitized.lokasi,
    kategori: sanitized.kategori,
    status: sanitized.status,
    imageUrl: sanitized.imageUrl,
    ringkasan: sanitized.ringkasan,
    isiBeritaLengkap: sanitized.isiBeritaLengkap,
    contentMode: sanitized.contentMode,
    customHtml: sanitized.customHtml || '',
    narasumber: sanitized.narasumber,
    pesertaCount: sanitized.pesertaCount,
    hasilKegiatan: sanitized.hasilKegiatan,
    isDeleted: Boolean(sanitized.isDeleted),
    updatedBy: ADMIN_RELAWAN_NAME,
    updatedAt: serverTimestamp(),
  };

  try {
    if (isUpdateExistingDoc) {
      await updateDoc(docRef, payload);
    } else {
      await setDoc(docRef, { ...payload, id: safeId, authorUid: uid, createdAt: serverTimestamp() });
    }
    return sanitized;
  } catch (err) {
    handleFirestoreError(
      err,
      isUpdateExistingDoc ? OperationType.UPDATE : OperationType.CREATE,
      `cmsPosyanduArticles/${safeId}`
    );
  }
}

export async function deleteCmsPosyanduArticleFromFirestore(
  item: BeritaKegiatanDetail,
  isSeed: boolean,
  hasFirestoreDoc: boolean
): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Silakan login sebagai Admin terlebih dahulu.');
  const safeId = sanitizeDocId(item.id, 'pos-art');
  try {
    if (isSeed) {
      await saveCmsPosyanduArticleToFirestore({ ...item, isDeleted: true }, hasFirestoreDoc);
    } else {
      await deleteDoc(doc(db, 'cmsPosyanduArticles', safeId));
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `cmsPosyanduArticles/${safeId}`);
  }
}
