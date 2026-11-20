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
    portalName: 'PKBI Buleleng · ECCD',
    portalSubtitle: 'Layanan Mobile Project ECCD · PKBI Kabupaten Buleleng',
    backToHome: 'Beranda',
    settings: 'Pengaturan',
    navLabels: {
      home: 'Beranda',
      map: 'Peta ECCD',
      'desa-harmony': 'Desa Harmony',
      catin: 'Skrining Catin',
      'edukasi-kespro': 'Edukasi Kespro',
      qna: 'QnA',
    },
    sectionTitles: {
      map: {
        full: 'Layanan Mobile Project ECCD di Kabupaten Buleleng',
        short: 'Layanan Mobile ECCD',
        kicker: 'Pemetaan Layanan & Laporan ECCD',
      },
      'desa-harmony': {
        full: 'Desa Harmony · Keluarga Asuh, Posyandu & Remaja',
        short: 'Desa Harmony',
        kicker: 'Modul Khusus Desa Harmony',
      },
      catin: {
        full: 'Layanan dan Skrining Calon Pengantin (Catin)',
        short: 'Skrining Catin',
        kicker: 'Edukasi Anemia, KEK & Narasi Konsultasi',
      },
      'edukasi-kespro': {
        full: 'Edukasi Kesehatan Reproduksi & Galeri Multimedia',
        short: 'Edukasi Kespro',
        kicker: 'Artikel General, Infografis & Video',
      },
      qna: {
        full: 'Ruang Konsultasi Daring & QnA PKBI Buleleng',
        short: 'QnA Rahasia',
        kicker: 'Konsultasi Terkategori & FAQ',
      },
    },
    hub: {
      eyebrow: 'Project ECCD (Early Childhood Care and Development) · Bali Utara',
      headline: 'Portal Layanan Mobile Project ECCD PKBI Buleleng',
      subheadline:
        'Jelajahi pemetaan layanan desa di 9 kecamatan, pantau Desa Harmony, akses skrining calon pengantin, edukasi kespro, dan konsultasi QnA rahasia.',
      openMenu: 'Buka Lingkaran',
      closeMenu: 'Tutup Lingkaran',
      tapPrompt: 'Ketuk salah satu modul layanan Project ECCD pada lingkaran menu.',
      openModule: 'Buka Layanan',
    },
    map: {
      searchPlaceholder: 'Cari desa atau kecamatan (contoh: Sari Mekar, Tejakula, Banjar)...',
      allDistricts: 'Semua Kecamatan',
      programsButton: 'Laporan Kegiatan',
      resetButton: 'Reset Peta',
      emptyPromptTitle: 'Pilih Titik Desa pada Peta',
      emptyPromptBody:
        'Ketuk pin desa atau filter kecamatan untuk melihat rincian data layanan dan agenda kegiatan ECCD.',
      openDistrictDetail: 'Lihat Detail Desa & Agenda',
      expandSheet: 'Lihat Detail',
      collapseSheet: 'Ringkas',
    },
  },
  en: {
    portalName: 'PKBI Buleleng · ECCD',
    portalSubtitle: 'Project ECCD Mobile Service Hub · PKBI Buleleng Regency',
    backToHome: 'Home',
    settings: 'Settings',
    navLabels: {
      home: 'Home',
      map: 'ECCD Map',
      'desa-harmony': 'Desa Harmony',
      catin: 'Catin Screening',
      'edukasi-kespro': 'Repro Health',
      qna: 'QnA',
    },
    sectionTitles: {
      map: {
        full: 'Project ECCD Mobile Services in Buleleng Regency',
        short: 'ECCD Mobile Map',
        kicker: 'Village Mapping & Activity Reports',
      },
      'desa-harmony': {
        full: 'Desa Harmony · Foster Families, Posyandu & Youth',
        short: 'Desa Harmony',
        kicker: 'Community Flagship Program',
      },
      catin: {
        full: 'Premarital Counseling & Screening Services (Catin)',
        short: 'Catin Screening',
        kicker: 'Anemia & CED Prevention Pamphlets',
      },
      'edukasi-kespro': {
        full: 'Reproductive Health Education & Multimedia Gallery',
        short: 'Repro Health',
        kicker: 'General Articles, Videos & Infographics',
      },
      qna: {
        full: 'Confidential Online Consultation & QnA Forum',
        short: 'Private QnA',
        kicker: 'Categorized Questions & FAQ',
      },
    },
    hub: {
      eyebrow: 'Project ECCD (Early Childhood Care and Development) · North Bali',
      headline: 'PKBI Buleleng ECCD Mobile Portal',
      subheadline:
        'Explore village service points across 9 districts, Desa Harmony monitoring, premarital screening info, reproductive health gallery, and private QnA.',
      openMenu: 'Open Circle',
      closeMenu: 'Close Circle',
      tapPrompt: 'Tap any ECCD service node around the emblem to explore.',
      openModule: 'Open Service',
    },
    map: {
      searchPlaceholder: 'Search village or district (e.g., Sari Mekar, Tejakula)...',
      allDistricts: 'All Districts',
      programsButton: 'Activity Report',
      resetButton: 'Reset Map',
      emptyPromptTitle: 'Select a Village Pin on the Map',
      emptyPromptBody:
        'Tap a village pin or district filter to inspect beneficiary demographics and activity schedules.',
      openDistrictDetail: 'Open Village Details',
      expandSheet: 'View Details',
      collapseSheet: 'Minimize',
    },
  },
  ban: {
    portalName: 'PKBI Buleleng · ECCD',
    portalSubtitle: 'Layanan Mobile Project ECCD · PKBI Kabupaten Buleleng',
    backToHome: 'Umah',
    settings: 'Setelan',
    navLabels: {
      home: 'Umah',
      map: 'Peta ECCD',
      'desa-harmony': 'Desa Harmony',
      catin: 'Skrining Catin',
      'edukasi-kespro': 'Edukasi Kespro',
      qna: 'QnA',
    },
    sectionTitles: {
      map: {
        full: 'Layanan Mobile Project ECCD ring Kabupaten Buleleng',
        short: 'Layanan Mobile ECCD',
        kicker: 'Pemetaan Desa & Laporan Parikrama',
      },
      'desa-harmony': {
        full: 'Desa Harmony · Keluarga Asuh, Posyandu & Yowana',
        short: 'Desa Harmony',
        kicker: 'Program Khusus Desa Harmony',
      },
      catin: {
        full: 'Layanan lan Skrining Calon Pengantin (Catin)',
        short: 'Skrining Catin',
        kicker: 'Edukasi Anemia, KEK & Narasi',
      },
      'edukasi-kespro': {
        full: 'Edukasi Kesehatan Reproduksi & Galeri Multimedia',
        short: 'Edukasi Kespro',
        kicker: 'Artikel, Infografis & Video',
      },
      qna: {
        full: 'Ruang Konsultasi Rahasia & QnA PKBI Buleleng',
        short: 'QnA Rahasia',
        kicker: 'Pitaken & FAQ',
      },
    },
    hub: {
      eyebrow: 'Project ECCD (Early Childhood Care and Development) · Bali Kaja',
      headline: 'Portal Layanan Mobile Project ECCD PKBI Buleleng',
      subheadline:
        'Cingak pemetaan desa ring 9 kecamatan, Desa Harmony, layanan skrining calon pengantin, edukasi kespro, lan konsultasi QnA rahasia.',
      openMenu: 'Buka Lingkaran',
      closeMenu: 'Tutup Lingkaran',
      tapPrompt: 'Ketuk silih tunggil layanan Project ECCD ring sor puniki.',
      openModule: 'Buka Layanan',
    },
    map: {
      searchPlaceholder: 'Rereh desa utawi kecamatan (contone: Sari Mekar, Tejakula)...',
      allDistricts: 'Makasami Kecamatan',
      programsButton: 'Laporan Parikrama',
      resetButton: 'Reset Peta',
      emptyPromptTitle: 'Pilih Titik Desa ring Peta',
      emptyPromptBody:
        'Ketuk pin desa mangda uning rincian data layanan lan agenda parikrama ECCD.',
      openDistrictDetail: 'Cingak Detail Desa',
      expandSheet: 'Cingak Rincian',
      collapseSheet: 'Alitang',
    },
  },
};
