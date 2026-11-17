import { AppLanguage, ContentCategory } from '../types';

export interface LocalizedStrings {
  portalName: string;
  portalSubtitle: string;
  backToHome: string;
  settings: string;
  navLabels: Record<'home' | ContentCategory, string>;
  sectionTitles: Record<ContentCategory, { full: string; short: string; kicker: string }>;
  hub: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    openMenu: string;
    closeMenu: string;
    tapPrompt: string;
    openModule: string;
  };
  map: {
    searchPlaceholder: string;
    allDistricts: string;
    programsButton: string;
    resetButton: string;
    emptyPromptTitle: string;
    emptyPromptBody: string;
    openDistrictDetail: string;
    expandSheet: string;
    collapseSheet: string;
  };
}

export const I18N: Record<AppLanguage, LocalizedStrings> = {
  id: {
    portalName: 'PKBI Buleleng',
    portalSubtitle: 'Perkumpulan Keluarga Berencana Indonesia · Kabupaten Buleleng',
    backToHome: 'Beranda',
    settings: 'Pengaturan',
    navLabels: {
      home: 'Beranda',
      map: 'Peta',
      'desa-binaan': 'Desa',
      'pendaftaran-qa': 'Daftar & Chat',
      'edukasi-interaktif': 'Edukasi',
    },
    sectionTitles: {
      map: {
        full: 'Peta Wilayah 9 Kecamatan Kabupaten Buleleng',
        short: 'Peta 9 Kecamatan',
        kicker: 'Pemetaan Wilayah PKBI',
      },
      'desa-binaan': {
        full: 'Desa Binaan Sari Mekar & Evaluasi Gizi Balita',
        short: 'Desa Sari Mekar',
        kicker: 'Desa Binaan Utama',
      },
      'pendaftaran-qa': {
        full: 'Pendaftaran Skrining Catin & Konsultasi WhatsApp',
        short: 'Daftar & Chat',
        kicker: 'Layanan Rahasia & Registrasi',
      },
      'edukasi-interaktif': {
        full: 'Pusat Edukasi IMS & Kesehatan Reproduksi',
        short: 'Edukasi IMS',
        kicker: 'Katalog Penyakit & Video',
      },
    },
    hub: {
      eyebrow: 'Portal Layanan Terpadu · Bali Utara',
      headline: 'Portal Informasi PKBI Kabupaten Buleleng',
      subheadline:
        'Ketuk logo PKBI atau pilih salah satu program pada lingkaran navigasi untuk menjelajahi layanan.',
      openMenu: 'Buka Lingkaran',
      closeMenu: 'Tutup Lingkaran',
      tapPrompt: 'Ketuk salah satu menu pada lingkaran PKBI untuk membuka layanan.',
      openModule: 'Buka Layanan',
    },
    map: {
      searchPlaceholder: 'Cari kecamatan (contoh: Buleleng, Tejakula, Seririt)...',
      allDistricts: 'Semua Kecamatan',
      programsButton: 'Program & Jadwal',
      resetButton: 'Reset Peta',
      emptyPromptTitle: 'Pilih Kecamatan pada Peta',
      emptyPromptBody:
        'Ketuk wilayah atau pin lokasi pada peta untuk menyorot batas kecamatan dan melihat dokumentasi kegiatan.',
      openDistrictDetail: 'Buka Profil Lengkap Kecamatan',
      expandSheet: 'Lihat Detail',
      collapseSheet: 'Ringkas',
    },
  },
  en: {
    portalName: 'PKBI Buleleng',
    portalSubtitle: 'Indonesian Planned Parenthood Association · Buleleng Regency',
    backToHome: 'Home',
    settings: 'Settings',
    navLabels: {
      home: 'Home',
      map: 'Map',
      'desa-binaan': 'Village',
      'pendaftaran-qa': 'Register & Chat',
      'edukasi-interaktif': 'Education',
    },
    sectionTitles: {
      map: {
        full: 'Interactive Map of 9 Districts in Buleleng Regency',
        short: 'Buleleng Map',
        kicker: 'Regional Service Mapping',
      },
      'desa-binaan': {
        full: 'Sari Mekar Foster Village & Nutrition Progress',
        short: 'Sari Mekar',
        kicker: 'Primary Foster Village',
      },
      'pendaftaran-qa': {
        full: 'Premarital Screening Registration & WhatsApp Consultation',
        short: 'Register & Chat',
        kicker: 'Confidential Services',
      },
      'edukasi-interaktif': {
        full: 'STI Education & Reproductive Health Center',
        short: 'STI Education',
        kicker: 'Disease Catalog & Videos',
      },
    },
    hub: {
      eyebrow: 'Integrated Public Health Portal · North Bali',
      headline: 'PKBI Buleleng Information Portal',
      subheadline:
        'Tap the PKBI emblem or choose one of the orbital program nodes to explore services.',
      openMenu: 'Open Circle',
      closeMenu: 'Close Circle',
      tapPrompt: 'Select any node on the orbital menu to begin.',
      openModule: 'Open Service',
    },
    map: {
      searchPlaceholder: 'Search district (e.g., Buleleng, Tejakula, Seririt)...',
      allDistricts: 'All Districts',
      programsButton: 'Programs & Schedule',
      resetButton: 'Reset Map',
      emptyPromptTitle: 'Select a District on the Map',
      emptyPromptBody:
        'Tap any district pin or area to highlight boundaries, view activities, and open village profiles.',
      openDistrictDetail: 'Open Full District Profile',
      expandSheet: 'View Details',
      collapseSheet: 'Minimize',
    },
  },
  ban: {
    portalName: 'PKBI Buleleng',
    portalSubtitle: 'Perkumpulan Keluarga Berencana Indonesia · Kab. Buleleng',
    backToHome: 'Umah',
    settings: 'Setelan',
    navLabels: {
      home: 'Umah',
      map: 'Peta',
      'desa-binaan': 'Desa',
      'pendaftaran-qa': 'Daftar & Chat',
      'edukasi-interaktif': 'Edukasi',
    },
    sectionTitles: {
      map: {
        full: 'Peta Wewidangan 9 Kecamatan Kabupaten Buleleng',
        short: 'Peta Buleleng',
        kicker: 'Pemetaan Wewidangan',
      },
      'desa-binaan': {
        full: 'Desa Binaan Sari Mekar & Evaluasi Gizi Alit-Alit',
        short: 'Desa Sari Mekar',
        kicker: 'Desa Binaan Utama',
      },
      'pendaftaran-qa': {
        full: 'Pendaftaran Skrining Catin & Konsultasi WhatsApp',
        short: 'Daftar & Chat',
        kicker: 'Layanan Rahasia',
      },
      'edukasi-interaktif': {
        full: 'Pusat Edukasi IMS & Kesehatan Reproduksi',
        short: 'Edukasi IMS',
        kicker: 'Katalog Penyakit & Video',
      },
    },
    hub: {
      eyebrow: 'Portal Layanan Keluarga · Bali Kaja',
      headline: 'Portal Informasi PKBI Kabupaten Buleleng',
      subheadline:
        'Cingak peta layanan 9 kecamatan, data gizi Desa Sari Mekar, daftar skrining calon pengantin, lan pitaken rahasia sareng tim medis PKBI.',
      openMenu: 'Pilih Program',
      closeMenu: 'Tutup Menu',
      tapPrompt: 'Ketuk silih tunggil program ring sor puniki.',
      openModule: 'Buka Layanan',
    },
    map: {
      searchPlaceholder: 'Rereh kecamatan (contone: Buleleng, Tejakula)...',
      allDistricts: 'Makasami Kecamatan',
      programsButton: 'Program & Jadwal',
      resetButton: 'Reset Peta',
      emptyPromptTitle: 'Pilih Kecamatan ring Peta',
      emptyPromptBody:
        'Ketuk wewidangan utawi pin lokasi ring peta mangda uning parikrama lan data desa binaan.',
      openDistrictDetail: 'Cingak Profil Lengkap Kecamatan',
      expandSheet: 'Cingak Rincian',
      collapseSheet: 'Alitang',
    },
  },
};
