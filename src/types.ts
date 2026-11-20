export type ContentCategory =
  | 'map'
  | 'desa-harmony'
  | 'catin'
  | 'edukasi-kespro'
  | 'qna';

export type AppTheme = 'light' | 'dark';
export type AppLanguage = 'id' | 'en' | 'ban';

// =========================================================================
// 1. SKEMA DATA PROJECT ECCD BULELENG: PETA DESA -> LAYANAN -> AGENDA -> LAPORAN
// =========================================================================

export interface EccdAgeGroupStat {
  label: string; // contoh: "Balita (0-5 th)", "Anak (6-12 th)", "Remaja (13-19 th)", "Dewasa & Bumil (20+ th)"
  count: number;
}

export interface EccdServiceTypeStat {
  serviceName: string; // contoh: "Pemeriksaan Tumbuh Kembang & Gizi", "Konseling KIA & Bumil KEK", "Edukasi Kespro Remaja"
  count: number;
}

export interface EccdVillageServiceData {
  totalRecipients: number;
  genderBreakdown: {
    lakiLaki: number;
    perempuan: number;
  };
  ageGroups: EccdAgeGroupStat[];
  serviceTypes: EccdServiceTypeStat[];
  lastUpdated: string;
}

export interface EccdVillageAgendaItem {
  id: string;
  villageId: string;
  kecamatanId: string;
  title: string;
  category: string;
  date: string; // YYYY-MM-DD atau format tanggal terstruktur
  displayDate: string; // contoh: "Senin, 18 November 2024"
  time: string;
  status: 'Terlaksana' | 'Terjadwal';
  location: string;
  facilitator: string;
  participants: number;
  summary: string;
  galleryImages: string[];
}

export interface EccdVillageMarker {
  id: string;
  name: string;
  kecamatanId: string;
  kecamatanName: string;
  lat: number;
  lng: number;
  population: number;
  posyanduCount: number;
  stuntingPct: number;
  statusProgram: 'Aktif ECCD Mobile' | 'Desa Binaan Utama' | 'Siaga Layanan';
  deskripsi: string;
  serviceData: EccdVillageServiceData;
  agendaList: EccdVillageAgendaItem[];
}

export interface EccdActivityReportRow {
  agendaId: string;
  villageId: string;
  villageName: string;
  kecamatanId: string;
  kecamatanName: string;
  title: string;
  category: string;
  date: string;
  displayDate: string;
  status: 'Terlaksana' | 'Terjadwal';
  participants: number;
  villageTotalRecipients: number;
  lakiLaki: number;
  perempuan: number;
  location: string;
}

export interface EccdAggregatedReportSummary {
  totalVillages: number;
  totalRecipients: number;
  totalMale: number;
  totalFemale: number;
  totalAgendas: number;
  completedAgendas: number;
  scheduledAgendas: number;
  totalAgendaParticipants: number;
}

// =========================================================================
// 2. SKEMA DATA MODUL KHUSUS: DESA HARMONY
// =========================================================================

export type HarmonyFosterCategory = 'stunting' | 'ibu-hamil-kek';

export interface StuntingChildMonthlyPoint {
  month: number; // Usia bulan ke-1, 2, ..., 60
  label: string; // contoh: "Bln 1"
  heightCm: number; // Tinggi / Panjang Badan (cm) -> Kurva MERAH
  weightKg: number; // Berat Badan (kg) -> Kurva HIJAU
  bmi: number; // Indeks Massa Tubuh / IMT (kg/m2) -> Kurva BIRU
  zScore?: number; // WHO Length/Height-for-Age (PB/U atau TB/U) dalam satuan SD
}

export type ChildSex = 'L' | 'P';

export interface HarmonyFosterFamily {
  id: string;
  codeName: string; // contoh: "Keluarga Asuh #01"
  guardianOrMotherName: string; // Inisial anak (stunting) atau inisial ibu hamil (KEK), misal "An. K.D.R" / "Ibu D.Md.R"
  banjar: string;
  category: HarmonyFosterCategory;
  categoryLabel: string;
  targetName: string; // Misal "Usia 12 Bulan (1 Tahun)" atau "Usia Kehamilan 26 Minggu"
  childAgeMonths?: number; // Jumlah bulan usia anak (misal 12 bulan untuk 1 tahun)
  childSex?: ChildSex; // Jenis kelamin anak untuk kalkulasi standar WHO PB/U & TB/U ('L' = Laki-laki, 'P' = Perempuan)
  baselineMetric: string; // contoh: "Bln 1: TB 49,5 cm · BB 3,1 kg · IMT 12,7"
  currentMetric: string; // contoh: "Bln 12: TB 74,2 cm · BB 9,2 kg · IMT 16,7"
  progressPct: number;
  mentorName: string;
  recordedBy: string; // Dikhususkan "Admin Relawan PKBI Buleleng"
  interventions: string[];
  monthlyGrowth?: StuntingChildMonthlyPoint[];
  statusLabel: 'Progres Baik' | 'Pemulihan Intensif' | 'Target Tercapai';
  isDeleted?: boolean;
}

export interface HarmonyPosyanduActivity {
  id: string;
  posyanduName: string;
  banjar: string;
  schedule: string;
  nextSession: string;
  leadMidwife: string;
  balitaCount: number;
  bumilCount: number;
  description: string;
  imageUrl: string;
  highlights: string[];
  isDeleted?: boolean;
}

export interface HarmonyYouthActivity {
  id: string;
  programName: string;
  forumName: string;
  schedule: string;
  participantCount: number;
  facilitator: string;
  topicFocus: string;
  description: string;
  imageUrl: string;
  outputs: string[];
  bodyParagraphs?: string[];
  contentMode?: 'standard' | 'html';
  customHtml?: string;
  dateText?: string;
  readTime?: string;
  isDeleted?: boolean;
}

// =========================================================================
// 3. SKEMA DATA MODUL: LAYANAN DAN SKRINING CALON PENGANTIN (CATIN)
// =========================================================================

export interface CatinPamphletItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  imageUrl: string;
  summary: string;
  keyPoints: string[];
  recommendedAction: string;
  isDeleted?: boolean;
}

export interface CatinHealthFacility {
  id: string;
  name: string;
  kecamatan: string;
  address: string;
  hours: string;
  services: string[];
  phone: string;
}

export interface CatinNarasiSubmission {
  id: string;
  nomorRegistrasi: string;
  namaPasangan: string;
  noHp: string;
  kecamatan: string;
  puskesmasTujuan: string;
  rencanaTanggalNikah: string;
  narasiKeluhan: string;
  tanggalSubmit: string;
}

// =========================================================================
// 4. SKEMA DATA MODUL: EDUKASI KESEHATAN REPRODUKSI
// =========================================================================

export interface KesproArticleItem {
  id: string;
  title: string;
  category: string;
  readTime: string;
  author: string;
  dateText: string;
  imageUrl: string;
  sourceLink?: string;
  summary: string;
  keyTakeaways: string[];
  bodyParagraphs: string[];
  contentMode?: 'standard' | 'html';
  customHtml?: string;
  checklist: string[];
  isDeleted?: boolean;
}

export interface KesproInfographicItem {
  id: string;
  title: string;
  category: string;
  caption: string;
  imageUrl: string;
  linkUrl?: string;
  highlights: string[];
  isDeleted?: boolean;
}

// =========================================================================
// 5. SKEMA DATA MODUL: QnA (QUESTION AND ANSWER)
// =========================================================================

export type QnaCategoryId =
  | 'kesehatan-reproduksi'
  | 'kesehatan-mental'
  | 'layanan-catin'
  | 'pertanyaan-lainnya';

export interface QnaCategoryOption {
  id: QnaCategoryId;
  label: string;
  description: string;
}

export interface QnaFaqItem {
  id: string;
  categoryId: QnaCategoryId;
  question: string;
  answer: string;
  answeredBy: string;
  isDeleted?: boolean;
}

export interface QnaSubmissionItem {
  id: string;
  ticketCode: string;
  categoryId: QnaCategoryId;
  alias: string;
  question: string;
  submittedAt: string;
  status: 'Diterima Konselor' | 'Menunggu Tinjauan';
}

// =========================================================================
// 6. SKEMA CMS DATABASE, CLOUDINARY MEDIA & GOOGLE APPS SCRIPT (GAS)
// =========================================================================

export interface CmsIntegrationConfig {
  id: string;
  gasWebAppUrl: string;
  cloudinaryCloudName: string;
  cloudinaryUploadPreset: string;
  cloudinaryFolder: string;
  autoSyncGas: boolean;
  updatedBy?: string;
}

export interface CmsVillageRecord {
  id: string;
  name: string;
  kecamatanId: string;
  kecamatanName: string;
  lat: number;
  lng: number;
  population: number;
  posyanduCount: number;
  stuntingPct: number;
  statusProgram: 'Aktif ECCD Mobile' | 'Desa Binaan Utama' | 'Siaga Layanan';
  deskripsi: string;
  totalRecipients: number;
  lakiLaki: number;
  perempuan: number;
  imageUrl?: string;
  isDeleted?: boolean;
}

// =========================================================================
// EXISTING / LEGACY COMPATIBILITY INTERFACES (RETAINED FOR SEAMLESS TYPING)
// =========================================================================

export interface KecamatanActivity {
  id: string;
  title: string;
  category: string;
  hari: string;
  tanggal: string;
  imageUrl: string;
  description: string;
  participants: number;
  location: string;
}

export interface DesaDetailInfo {
  id: string;
  name: string;
  kecamatanId: string;
  lat: number;
  lng: number;
  population: number;
  posyanduCount: number;
  stuntingPct: number;
  statusBinaan: string;
  deskripsi: string;
  polygonBoundary: [number, number][];
}

export interface KecamatanInfo {
  id: string;
  name: string;
  capital: string;
  areaKm2: number;
  population: number;
  lat: number;
  lng: number;
  positionCategory: 'left' | 'center' | 'right';
  color: string;
  activities: KecamatanActivity[];
  deskripsi?: string;
  stuntingRate?: number;
  balitaTerpantau?: number;
  posyanduCount?: number;
  puskesmasList?: string[];
  desaList?: string[];
  detailedDesas?: DesaDetailInfo[];
  boundaryPolygon?: [number, number][];
}

export interface DesaSariMekarProfile {
  name: string;
  kecamatanName: string;
  kabupaten: string;
  lat: number;
  lng: number;
  kepalaDesa: string;
  luasWilayahKm2: number;
  jumlahPenduduk: number;
  jumlahBalita: number;
  fokusProgram: string;
  deskripsi: string;
  posyanduList: string[];
}

export interface StuntingBulanData {
  bulan: string;
  prevalensiStuntingPct: number;
  balitaTerpantau: number;
  balitaStunting: number;
  pemberianPMT: number;
  targetNasional: number;
}

export interface BeritaKegiatanDetail {
  id: string;
  desaName: string;
  kecamatanName: string;
  title: string;
  hari: string;
  tanggal: string;
  waktu: string;
  lokasi: string;
  kategori: string;
  status: 'Selesai' | 'Sedang Berlangsung' | 'Akan Datang';
  imageUrl: string;
  ringkasan: string;
  isiBeritaLengkap: string;
  contentMode?: 'standard' | 'html';
  customHtml?: string;
  narasumber: string;
  pesertaCount: number;
  hasilKegiatan: string[];
  isDeleted?: boolean;
}

export interface PenyakitSeksualEdu {
  id: string;
  namaPenyakit: string;
  singkatan: string;
  penyebab: string;
  kategori: string;
  tingkatBahaya: 'Tinggi' | 'Sangat Tinggi' | 'Perlu Perhatian Khusus';
  imageUrl?: string;
  gejalaPria: string[];
  gejalaWanita: string[];
  caraPenularan: string[];
  metodePencegahan: string[];
  pengobatan: string;
  skriningPranikah: string;
  mitosFakta: { mitos: string; fakta: string }[];
  isDeleted?: boolean;
}

export interface VideoEdukasi {
  id: string;
  title: string;
  kategori: string;
  durasi: string;
  narasumber: string;
  deskripsi: string;
  imageUrl: string;
  videoUrl?: string;
  ringkasanPoin: string[];
  isDeleted?: boolean;
}

export type QARoomId = 'kesehatan-seksual' | 'keluarga-asuh';

export interface ChatMessage {
  id: string;
  roomId: QARoomId;
  sender: 'user' | 'bot' | 'petugas';
  senderName: string;
  text: string;
  time: string;
  badge?: string;
  isAnonymous?: boolean;
  attachedFile?: UserUploadedFile;
}

export interface GuestUserProfile {
  guestId: string;
  alias: string;
  joinedAt: string;
  saveHistoryLocally: boolean;
}

export interface PendaftaranCatinSubmission {
  id: string;
  tipe: 'calon-pengantin';
  namaPria: string;
  nikPria: string;
  usiaPria: number;
  namaWanita: string;
  nikWanita: string;
  usiaWanita: number;
  noHp: string;
  kecamatan: string;
  desa: string;
  rencanaTanggalNikah: string;
  puskesmasRujukan: string;
  tanggalDaftar: string;
  nomorRegistrasi: string;
  statusKesehatan: string;
  lampiranBerkas?: UserUploadedFile[];
}

export interface PendaftaranKeluargaAsuhSubmission {
  id: string;
  tipe: 'keluarga-asuh';
  namaLengkap: string;
  nik: string;
  pekerjaan: string;
  noHp: string;
  email: string;
  alamatDomisili: string;
  kecamatan: string;
  desa: string;
  paketBantuan: 'Paket Gizi Balita (PMT)' | 'Bantuan Nutrisi & Vitamin' | 'Pendampingan Penuh 6 Bulan';
  komitmenBulan: number;
  desaSasaran: string;
  alasanBergabung: string;
  tanggalDaftar: string;
  nomorRegistrasi: string;
  lampiranBerkas?: UserUploadedFile[];
}

export interface NakesProfile {
  id: string;
  nama: string;
  panggilan: string;
  gelar: string;
  peran: 'dokter' | 'bidan' | 'konselor';
  jabatan: string;
  spesialisasi: string;
  avatarIcon: string;
  badgeKeahlian: string;
  statusOnline: boolean;
  jadwalLayanan: string;
  lokasiPraktik: string;
  nomorSip: string;
  deskripsi: string;
}

export interface AturanResponProtokol {
  kataKunci: string[];
  responMedis: string;
  tindakanLanjutan?: string;
  prioritas?: 'tinggi' | 'sedang' | 'edukasi';
}

export interface ChatProtokol {
  protokolId: string;
  targetId: string;
  namaProtokol: string;
  namaNakes: string;
  roleNakes: string;
  avatarIcon: string;
  badgeKerahasiaan: string;
  pesanPembuka: string;
  topikCepat: string[];
  aturanRespon: AturanResponProtokol[];
  responDefault: string;
  responLampiranBerkas: string;
}

export interface NakesChatMessage {
  id: string;
  nakesId?: string;
  sender: 'user' | 'nakes';
  name: string;
  role?: string;
  text: string;
  time: string;
  date?: string;
  attachedFile?: UserUploadedFile;
}

export interface UserUploadedFile {
  id: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  category:
    | 'catin_ktp'
    | 'catin_surat_desa'
    | 'asuh_identitas'
    | 'asuh_bukti_donasi'
    | 'konsultasi_medis'
    | 'lainnya';
  uploadedAt: string;
  uploaderName: string;
  previewUrl?: string;
  description?: string;
}

export interface AppDatabaseSchema {
  version: string;
  lastUpdated: string;
  kecamatanList: KecamatanInfo[];
  eccdVillages: EccdVillageMarker[];
  desaSariMekarProfile: DesaSariMekarProfile;
  stuntingMonthlyData: StuntingBulanData[];
  beritaKegiatanList: BeritaKegiatanDetail[];
  edukasiPenyakitList: PenyakitSeksualEdu[];
  videoEdukasiList: VideoEdukasi[];
  nakesList: NakesProfile[];
  chat_protokol: Record<string, ChatProtokol>;
  tanyaNakesChats: NakesChatMessage[];
  qaChatRooms: Record<QARoomId, ChatMessage[]>;
  pendaftaranCatinList: PendaftaranCatinSubmission[];
  catinNarasiList: CatinNarasiSubmission[];
  qnaSubmissionList: QnaSubmissionItem[];
  pendaftaranKeluargaAsuhList: PendaftaranKeluargaAsuhSubmission[];
  uploadedFiles: UserUploadedFile[];
}
