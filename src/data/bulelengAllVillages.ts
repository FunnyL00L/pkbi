/**
 * Master Lengkap Seluruh 148 Desa & Kelurahan Resmi Kabupaten Buleleng (9 Kecamatan)
 * Sumber referensi administratif BPS & OpenStreetMap Kabupaten Buleleng, Bali.
 *
 * Digunakan agar peta setiap kecamatan menampilkan seluruh titik desa/kelurahan:
 * - Warna BIRU  = Desa sudah memiliki data layanan / agenda ECCD di sistem atau Firebase.
 * - Warna ABU-ABU = Desa terdaftar di peta kecamatan namun data layanan/agendanya masih kosong.
 */

export interface BulelengMasterVillageEntry {
  id: string;
  name: string;
  kecamatanId:
    | 'gerokgak'
    | 'seririt'
    | 'busungbiu'
    | 'banjar'
    | 'sukasada'
    | 'buleleng'
    | 'sawan'
    | 'kubutambahan'
    | 'tejakula';
  kecamatanName: string;
  lat: number;
  lng: number;
  isKelurahan?: boolean;
}

export const BULELENG_ALL_VILLAGES: BulelengMasterVillageEntry[] = [
  // =========================================================================
  // 1. KECAMATAN GEROKGAK (14 Desa)
  // =========================================================================
  { id: 'v-gerokgak-banyupoh', name: 'Desa Banyupoh', kecamatanId: 'gerokgak', kecamatanName: 'Kecamatan Gerokgak', lat: -8.179, lng: 114.699 },
  { id: 'v-gerokgak-celukanbawang', name: 'Desa Celukanbawang', kecamatanId: 'gerokgak', kecamatanName: 'Kecamatan Gerokgak', lat: -8.194, lng: 114.843 },
  { id: 'v-gerokgak-gerokgak', name: 'Desa Gerokgak', kecamatanId: 'gerokgak', kecamatanName: 'Kecamatan Gerokgak', lat: -8.191, lng: 114.782 },
  { id: 'v-gerokgak-musi', name: 'Desa Musi', kecamatanId: 'gerokgak', kecamatanName: 'Kecamatan Gerokgak', lat: -8.187, lng: 114.748 },
  { id: 'v-gerokgak-patas', name: 'Desa Patas', kecamatanId: 'gerokgak', kecamatanName: 'Kecamatan Gerokgak', lat: -8.198, lng: 114.803 },
  { id: 'v-gerokgak-pejarakan', name: 'Desa Pejarakan', kecamatanId: 'gerokgak', kecamatanName: 'Kecamatan Gerokgak', lat: -8.151, lng: 114.576 },
  { id: 'v-gerokgak-pemuteran', name: 'Desa Pemuteran', kecamatanId: 'gerokgak', kecamatanName: 'Kecamatan Gerokgak', lat: -8.153, lng: 114.651 },
  { id: 'v-gerokgak-pengulon', name: 'Desa Pengulon', kecamatanId: 'gerokgak', kecamatanName: 'Kecamatan Gerokgak', lat: -8.203, lng: 114.823 },
  { id: 'v-gerokgak-penyabangan', name: 'Desa Penyabangan', kecamatanId: 'gerokgak', kecamatanName: 'Kecamatan Gerokgak', lat: -8.181, lng: 114.725 },
  { id: 'v-gerokgak-sanggalangit', name: 'Desa Sanggalangit', kecamatanId: 'gerokgak', kecamatanName: 'Kecamatan Gerokgak', lat: -8.189, lng: 114.765 },
  { id: 'v-gerokgak-sumberkelampok', name: 'Desa Sumberkelampok', kecamatanId: 'gerokgak', kecamatanName: 'Kecamatan Gerokgak', lat: -8.165, lng: 114.486 },
  { id: 'v-gerokgak-sumberkima', name: 'Desa Sumberkima', kecamatanId: 'gerokgak', kecamatanName: 'Kecamatan Gerokgak', lat: -8.148, lng: 114.615 },
  { id: 'v-gerokgak-tingatinga', name: 'Desa Tinga-Tinga', kecamatanId: 'gerokgak', kecamatanName: 'Kecamatan Gerokgak', lat: -8.199, lng: 114.864 },
  { id: 'v-gerokgak-tukadsumaga', name: 'Desa Tukadsumaga', kecamatanId: 'gerokgak', kecamatanName: 'Kecamatan Gerokgak', lat: -8.213, lng: 114.848 },

  // =========================================================================
  // 2. KECAMATAN SERIRIT (20 Desa + 1 Kelurahan = 21)
  // =========================================================================
  { id: 'v-seririt-banjarasem', name: 'Desa Banjar Asem', kecamatanId: 'seririt', kecamatanName: 'Kecamatan Seririt', lat: -8.206, lng: 114.892 },
  { id: 'v-seririt-bestala', name: 'Desa Bestala', kecamatanId: 'seririt', kecamatanName: 'Kecamatan Seririt', lat: -8.257, lng: 114.956 },
  { id: 'v-seririt-bubunan', name: 'Desa Bubunan', kecamatanId: 'seririt', kecamatanName: 'Kecamatan Seririt', lat: -8.204, lng: 114.948 },
  { id: 'v-seririt-gunungsari', name: 'Desa Gunungsari', kecamatanId: 'seririt', kecamatanName: 'Kecamatan Seririt', lat: -8.251, lng: 114.922 },
  { id: 'v-seririt-joanyar', name: 'Desa Joanyar', kecamatanId: 'seririt', kecamatanName: 'Kecamatan Seririt', lat: -8.216, lng: 114.938 },
  { id: 'v-seririt-kalianget', name: 'Desa Kalianget', kecamatanId: 'seririt', kecamatanName: 'Kecamatan Seririt', lat: -8.195, lng: 114.947 },
  { id: 'v-seririt-kalisada', name: 'Desa Kalisada', kecamatanId: 'seririt', kecamatanName: 'Kecamatan Seririt', lat: -8.205, lng: 114.881 },
  { id: 'v-seririt-lokapaksa', name: 'Desa Lokapaksa', kecamatanId: 'seririt', kecamatanName: 'Kecamatan Seririt', lat: -8.216, lng: 114.909 },
  { id: 'v-seririt-mayong', name: 'Desa Mayong', kecamatanId: 'seririt', kecamatanName: 'Kecamatan Seririt', lat: -8.256, lng: 114.939 },
  { id: 'v-seririt-mundukbestala', name: 'Desa Munduk Bestala', kecamatanId: 'seririt', kecamatanName: 'Kecamatan Seririt', lat: -8.268, lng: 114.959 },
  { id: 'v-seririt-pangkungparuk', name: 'Desa Pangkungparuk', kecamatanId: 'seririt', kecamatanName: 'Kecamatan Seririt', lat: -8.227, lng: 114.896 },
  { id: 'v-seririt-patemon', name: 'Desa Patemon', kecamatanId: 'seririt', kecamatanName: 'Kecamatan Seririt', lat: -8.211, lng: 114.928 },
  { id: 'v-seririt-pengastulan', name: 'Desa Pengastulan', kecamatanId: 'seririt', kecamatanName: 'Kecamatan Seririt', lat: -8.191, lng: 114.938 },
  { id: 'v-seririt-rangdu', name: 'Desa Rangdu', kecamatanId: 'seririt', kecamatanName: 'Kecamatan Seririt', lat: -8.241, lng: 114.946 },
  { id: 'v-seririt-ringdikit', name: 'Desa Ringdikit', kecamatanId: 'seririt', kecamatanName: 'Kecamatan Seririt', lat: -8.228, lng: 114.949 },
  { id: 'v-seririt-seririt', name: 'Kelurahan Seririt', kecamatanId: 'seririt', kecamatanName: 'Kecamatan Seririt', lat: -8.195, lng: 114.931, isKelurahan: true },
  { id: 'v-seririt-sulanyah', name: 'Desa Sulanyah', kecamatanId: 'seririt', kecamatanName: 'Kecamatan Seririt', lat: -8.197, lng: 114.923 },
  { id: 'v-seririt-tangguwisia', name: 'Desa Tangguwisia', kecamatanId: 'seririt', kecamatanName: 'Kecamatan Seririt', lat: -8.191, lng: 114.957 },
  { id: 'v-seririt-ularan', name: 'Desa Ularan', kecamatanId: 'seririt', kecamatanName: 'Kecamatan Seririt', lat: -8.243, lng: 114.916 },
  { id: 'v-seririt-umeanyar', name: 'Desa Umeanyar', kecamatanId: 'seririt', kecamatanName: 'Kecamatan Seririt', lat: -8.197, lng: 114.914 },
  { id: 'v-seririt-unggahan', name: 'Desa Unggahan', kecamatanId: 'seririt', kecamatanName: 'Kecamatan Seririt', lat: -8.234, lng: 114.926 },

  // =========================================================================
  // 3. KECAMATAN BUSUNGBIU (15 Desa)
  // =========================================================================
  { id: 'v-busungbiu-bengkel', name: 'Desa Bengkel', kecamatanId: 'busungbiu', kecamatanName: 'Kecamatan Busungbiu', lat: -8.268, lng: 114.971 },
  { id: 'v-busungbiu-bongancina', name: 'Desa Bongancina', kecamatanId: 'busungbiu', kecamatanName: 'Kecamatan Busungbiu', lat: -8.299, lng: 114.961 },
  { id: 'v-busungbiu-busungbiu', name: 'Desa Busungbiu', kecamatanId: 'busungbiu', kecamatanName: 'Kecamatan Busungbiu', lat: -8.267, lng: 114.946 },
  { id: 'v-busungbiu-kedis', name: 'Desa Kedis', kecamatanId: 'busungbiu', kecamatanName: 'Kecamatan Busungbiu', lat: -8.261, lng: 114.931 },
  { id: 'v-busungbiu-kekeran', name: 'Desa Kekeran', kecamatanId: 'busungbiu', kecamatanName: 'Kecamatan Busungbiu', lat: -8.277, lng: 114.941 },
  { id: 'v-busungbiu-pelapuan', name: 'Desa Pelapuan', kecamatanId: 'busungbiu', kecamatanName: 'Kecamatan Busungbiu', lat: -8.282, lng: 114.956 },
  { id: 'v-busungbiu-pucaksari', name: 'Desa Pucaksari', kecamatanId: 'busungbiu', kecamatanName: 'Kecamatan Busungbiu', lat: -8.294, lng: 114.929 },
  { id: 'v-busungbiu-sepang', name: 'Desa Sepang', kecamatanId: 'busungbiu', kecamatanName: 'Kecamatan Busungbiu', lat: -8.308, lng: 114.896 },
  { id: 'v-busungbiu-sepangkelod', name: 'Desa Sepang Kelod', kecamatanId: 'busungbiu', kecamatanName: 'Kecamatan Busungbiu', lat: -8.329, lng: 114.909 },
  { id: 'v-busungbiu-subuk', name: 'Desa Subuk', kecamatanId: 'busungbiu', kecamatanName: 'Kecamatan Busungbiu', lat: -8.273, lng: 114.918 },
  { id: 'v-busungbiu-telaga', name: 'Desa Telaga', kecamatanId: 'busungbiu', kecamatanName: 'Kecamatan Busungbiu', lat: -8.265, lng: 114.908 },
  { id: 'v-busungbiu-tinggarsari', name: 'Desa Tinggarsari', kecamatanId: 'busungbiu', kecamatanName: 'Kecamatan Busungbiu', lat: -8.258, lng: 114.912 },
  { id: 'v-busungbiu-tista', name: 'Desa Tista', kecamatanId: 'busungbiu', kecamatanName: 'Kecamatan Busungbiu', lat: -8.306, lng: 114.939 },
  { id: 'v-busungbiu-titab', name: 'Desa Titab', kecamatanId: 'busungbiu', kecamatanName: 'Kecamatan Busungbiu', lat: -8.285, lng: 114.922 },
  { id: 'v-busungbiu-umejero', name: 'Desa Umejero', kecamatanId: 'busungbiu', kecamatanName: 'Kecamatan Busungbiu', lat: -8.287, lng: 114.902 },

  // =========================================================================
  // 4. KECAMATAN BANJAR (17 Desa)
  // =========================================================================
  { id: 'v-banjar-banjar', name: 'Desa Banjar', kecamatanId: 'banjar', kecamatanName: 'Kecamatan Banjar', lat: -8.191, lng: 114.971 },
  { id: 'v-banjar-banjartegeha', name: 'Desa Banjar Tegeha', kecamatanId: 'banjar', kecamatanName: 'Kecamatan Banjar', lat: -8.211, lng: 114.976 },
  { id: 'v-banjar-banyuatis', name: 'Desa Banyuatis', kecamatanId: 'banjar', kecamatanName: 'Kecamatan Banjar', lat: -8.265, lng: 115.039 },
  { id: 'v-banjar-banyuseri', name: 'Desa Banyuseri', kecamatanId: 'banjar', kecamatanName: 'Kecamatan Banjar', lat: -8.248, lng: 115.019 },
  { id: 'v-banjar-cempaga', name: 'Desa Cempaga', kecamatanId: 'banjar', kecamatanName: 'Kecamatan Banjar', lat: -8.229, lng: 114.996 },
  { id: 'v-banjar-dencarik', name: 'Desa Dencarik', kecamatanId: 'banjar', kecamatanName: 'Kecamatan Banjar', lat: -8.187, lng: 114.985 },
  { id: 'v-banjar-gesing', name: 'Desa Gesing', kecamatanId: 'banjar', kecamatanName: 'Kecamatan Banjar', lat: -8.279, lng: 115.048 },
  { id: 'v-banjar-gobleg', name: 'Desa Gobleg', kecamatanId: 'banjar', kecamatanName: 'Kecamatan Banjar', lat: -8.258, lng: 115.071 },
  { id: 'v-banjar-kaliasem', name: 'Desa Kaliasem', kecamatanId: 'banjar', kecamatanName: 'Kecamatan Banjar', lat: -8.168, lng: 115.018 },
  { id: 'v-banjar-kayuputih', name: 'Desa Kayuputih', kecamatanId: 'banjar', kecamatanName: 'Kecamatan Banjar', lat: -8.253, lng: 115.032 },
  { id: 'v-banjar-munduk', name: 'Desa Munduk', kecamatanId: 'banjar', kecamatanName: 'Kecamatan Banjar', lat: -8.268, lng: 115.083 },
  { id: 'v-banjar-pedawa', name: 'Desa Pedawa', kecamatanId: 'banjar', kecamatanName: 'Kecamatan Banjar', lat: -8.241, lng: 115.011 },
  { id: 'v-banjar-sidetapa', name: 'Desa Sidetapa', kecamatanId: 'banjar', kecamatanName: 'Kecamatan Banjar', lat: -8.234, lng: 114.984 },
  { id: 'v-banjar-tampekan', name: 'Desa Tampekan', kecamatanId: 'banjar', kecamatanName: 'Kecamatan Banjar', lat: -8.215, lng: 114.994 },
  { id: 'v-banjar-temukus', name: 'Desa Temukus', kecamatanId: 'banjar', kecamatanName: 'Kecamatan Banjar', lat: -8.176, lng: 115.002 },
  { id: 'v-banjar-tigawasa', name: 'Desa Tigawasa', kecamatanId: 'banjar', kecamatanName: 'Kecamatan Banjar', lat: -8.219, lng: 115.016 },
  { id: 'v-banjar-tirtasari', name: 'Desa Tirtasari', kecamatanId: 'banjar', kecamatanName: 'Kecamatan Banjar', lat: -8.242, lng: 115.041 },

  // =========================================================================
  // 5. KECAMATAN SUKASADA (14 Desa + 1 Kelurahan = 15)
  // =========================================================================
  { id: 'v-sukasada-ambengan', name: 'Desa Ambengan', kecamatanId: 'sukasada', kecamatanName: 'Kecamatan Sukasada', lat: -8.181, lng: 115.115 },
  { id: 'v-sukasada-gitgit', name: 'Desa Gitgit', kecamatanId: 'sukasada', kecamatanName: 'Kecamatan Sukasada', lat: -8.214, lng: 115.134 },
  { id: 'v-sukasada-kayuputih', name: 'Desa Kayuputih', kecamatanId: 'sukasada', kecamatanName: 'Kecamatan Sukasada', lat: -8.217, lng: 115.072 },
  { id: 'v-sukasada-padangbulia', name: 'Desa Padangbulia', kecamatanId: 'sukasada', kecamatanName: 'Kecamatan Sukasada', lat: -8.194, lng: 115.106 },
  { id: 'v-sukasada-pancasari', name: 'Desa Pancasari', kecamatanId: 'sukasada', kecamatanName: 'Kecamatan Sukasada', lat: -8.252, lng: 115.158 },
  { id: 'v-sukasada-panji', name: 'Desa Panji', kecamatanId: 'sukasada', kecamatanName: 'Kecamatan Sukasada', lat: -8.149, lng: 115.072 },
  { id: 'v-sukasada-panjianom', name: 'Desa Panji Anom', kecamatanId: 'sukasada', kecamatanName: 'Kecamatan Sukasada', lat: -8.172, lng: 115.077 },
  { id: 'v-sukasada-pegadungan', name: 'Desa Pegadungan', kecamatanId: 'sukasada', kecamatanName: 'Kecamatan Sukasada', lat: -8.188, lng: 115.136 },
  { id: 'v-sukasada-pegayaman', name: 'Desa Pegayaman', kecamatanId: 'sukasada', kecamatanName: 'Kecamatan Sukasada', lat: -8.209, lng: 115.147 },
  { id: 'v-sukasada-sambangan', name: 'Desa Sambangan', kecamatanId: 'sukasada', kecamatanName: 'Kecamatan Sukasada', lat: -8.155, lng: 115.105 },
  { id: 'v-sukasada-selat', name: 'Desa Selat', kecamatanId: 'sukasada', kecamatanName: 'Kecamatan Sukasada', lat: -8.187, lng: 115.069 },
  { id: 'v-sukasada-silangjana', name: 'Desa Silangjana', kecamatanId: 'sukasada', kecamatanName: 'Kecamatan Sukasada', lat: -8.176, lng: 115.138 },
  { id: 'v-sukasada-sukasada', name: 'Kelurahan Sukasada', kecamatanId: 'sukasada', kecamatanName: 'Kecamatan Sukasada', lat: -8.143, lng: 115.095, isKelurahan: true },
  { id: 'v-sukasada-tegalllinggah', name: 'Desa Tegal Linggah', kecamatanId: 'sukasada', kecamatanName: 'Kecamatan Sukasada', lat: -8.165, lng: 115.092 },
  { id: 'v-sukasada-wanagiri', name: 'Desa Wanagiri', kecamatanId: 'sukasada', kecamatanName: 'Kecamatan Sukasada', lat: -8.241, lng: 115.118 },

  // =========================================================================
  // 6. KECAMATAN BULELENG (12 Desa + 17 Kelurahan = 29)
  // =========================================================================
  { id: 'v-buleleng-alasangker', name: 'Desa Alasangker', kecamatanId: 'buleleng', kecamatanName: 'Kecamatan Buleleng', lat: -8.153, lng: 115.131 },
  { id: 'v-buleleng-anturan', name: 'Desa Anturan', kecamatanId: 'buleleng', kecamatanName: 'Kecamatan Buleleng', lat: -8.148, lng: 115.052 },
  { id: 'v-buleleng-astina', name: 'Kelurahan Astina', kecamatanId: 'buleleng', kecamatanName: 'Kecamatan Buleleng', lat: -8.117, lng: 115.091, isKelurahan: true },
  { id: 'v-buleleng-baktiseraga', name: 'Desa Bakti Seraga', kecamatanId: 'buleleng', kecamatanName: 'Kecamatan Buleleng', lat: -8.132, lng: 115.072 },
  { id: 'v-buleleng-banjarbali', name: 'Kelurahan Banjar Bali', kecamatanId: 'buleleng', kecamatanName: 'Kecamatan Buleleng', lat: -8.118, lng: 115.096, isKelurahan: true },
  { id: 'v-buleleng-banjarjawa', name: 'Kelurahan Banjar Jawa', kecamatanId: 'buleleng', kecamatanName: 'Kecamatan Buleleng', lat: -8.112, lng: 115.088, isKelurahan: true },
  { id: 'v-buleleng-banjartegal', name: 'Kelurahan Banjar Tegal', kecamatanId: 'buleleng', kecamatanName: 'Kecamatan Buleleng', lat: -8.121, lng: 115.084, isKelurahan: true },
  { id: 'v-buleleng-banyuasri', name: 'Kelurahan Banyuasri', kecamatanId: 'buleleng', kecamatanName: 'Kecamatan Buleleng', lat: -8.124, lng: 115.081, isKelurahan: true },
  { id: 'v-buleleng-banyuning', name: 'Kelurahan Banyuning', kecamatanId: 'buleleng', kecamatanName: 'Kecamatan Buleleng', lat: -8.117, lng: 115.109, isKelurahan: true },
  { id: 'v-buleleng-beratan', name: 'Kelurahan Beratan', kecamatanId: 'buleleng', kecamatanName: 'Kecamatan Buleleng', lat: -8.131, lng: 115.101, isKelurahan: true },
  { id: 'v-buleleng-jinengdalem', name: 'Desa Jinengdalem', kecamatanId: 'buleleng', kecamatanName: 'Kecamatan Buleleng', lat: -8.134, lng: 115.126 },
  { id: 'v-buleleng-kalibukbuk', name: 'Desa Kalibukbuk', kecamatanId: 'buleleng', kecamatanName: 'Kecamatan Buleleng', lat: -8.156, lng: 115.034 },
  { id: 'v-buleleng-kaliuntu', name: 'Kelurahan Kaliuntu', kecamatanId: 'buleleng', kecamatanName: 'Kecamatan Buleleng', lat: -8.119, lng: 115.082, isKelurahan: true },
  { id: 'v-buleleng-kampunganyar', name: 'Kelurahan Kampung Anyar', kecamatanId: 'buleleng', kecamatanName: 'Kecamatan Buleleng', lat: -8.111, lng: 115.091, isKelurahan: true },
  { id: 'v-buleleng-kampungbaru', name: 'Kelurahan Kampung Baru', kecamatanId: 'buleleng', kecamatanName: 'Kecamatan Buleleng', lat: -8.108, lng: 115.097, isKelurahan: true },
  { id: 'v-buleleng-kampungbugis', name: 'Kelurahan Kampung Bugis', kecamatanId: 'buleleng', kecamatanName: 'Kecamatan Buleleng', lat: -8.106, lng: 115.091, isKelurahan: true },
  { id: 'v-buleleng-kampungkajanan', name: 'Kelurahan Kampung Kajanan', kecamatanId: 'buleleng', kecamatanName: 'Kecamatan Buleleng', lat: -8.109, lng: 115.088, isKelurahan: true },
  { id: 'v-buleleng-kampungsingaraja', name: 'Kelurahan Kampung Singaraja', kecamatanId: 'buleleng', kecamatanName: 'Kecamatan Buleleng', lat: -8.114, lng: 115.091, isKelurahan: true },
  { id: 'v-buleleng-kendran', name: 'Kelurahan Kendran', kecamatanId: 'buleleng', kecamatanName: 'Kecamatan Buleleng', lat: -8.121, lng: 115.093, isKelurahan: true },
  { id: 'v-buleleng-liligundi', name: 'Kelurahan Liligundi', kecamatanId: 'buleleng', kecamatanName: 'Kecamatan Buleleng', lat: -8.124, lng: 115.096, isKelurahan: true },
  { id: 'v-buleleng-nagasepaha', name: 'Desa Nagasepaha', kecamatanId: 'buleleng', kecamatanName: 'Kecamatan Buleleng', lat: -8.149, lng: 115.118 },
  { id: 'v-buleleng-paketaging', name: 'Kelurahan Paket Agung', kecamatanId: 'buleleng', kecamatanName: 'Kecamatan Buleleng', lat: -8.122, lng: 115.089, isKelurahan: true },
  { id: 'v-buleleng-pemaron', name: 'Desa Pemaron', kecamatanId: 'buleleng', kecamatanName: 'Kecamatan Buleleng', lat: -8.138, lng: 115.063 },
  { id: 'v-buleleng-penarukan', name: 'Kelurahan Penarukan', kecamatanId: 'buleleng', kecamatanName: 'Kecamatan Buleleng', lat: -8.109, lng: 115.119, isKelurahan: true },
  { id: 'v-buleleng-penglatan', name: 'Desa Penglatan', kecamatanId: 'buleleng', kecamatanName: 'Kecamatan Buleleng', lat: -8.128, lng: 115.118 },
  { id: 'v-buleleng-petandakan', name: 'Desa Petandakan', kecamatanId: 'buleleng', kecamatanName: 'Kecamatan Buleleng', lat: -8.143, lng: 115.114 },
  { id: 'v-buleleng-pohbergong', name: 'Desa Poh Bergong', kecamatanId: 'buleleng', kecamatanName: 'Kecamatan Buleleng', lat: -8.147, lng: 115.128 },
  { id: 'v-buleleng-sarimekar', name: 'Desa Sari Mekar', kecamatanId: 'buleleng', kecamatanName: 'Kecamatan Buleleng', lat: -8.138, lng: 115.111 },
  { id: 'v-buleleng-tukadmungga', name: 'Desa Tukadmungga', kecamatanId: 'buleleng', kecamatanName: 'Kecamatan Buleleng', lat: -8.144, lng: 115.059 },

  // =========================================================================
  // 7. KECAMATAN SAWAN (14 Desa)
  // =========================================================================
  { id: 'v-sawan-bebetin', name: 'Desa Bebetin', kecamatanId: 'sawan', kecamatanName: 'Kecamatan Sawan', lat: -8.181, lng: 115.182 },
  { id: 'v-sawan-bungkulan', name: 'Desa Bungkulan', kecamatanId: 'sawan', kecamatanName: 'Kecamatan Sawan', lat: -8.095, lng: 115.156 },
  { id: 'v-sawan-galungan', name: 'Desa Galungan', kecamatanId: 'sawan', kecamatanName: 'Kecamatan Sawan', lat: -8.215, lng: 115.177 },
  { id: 'v-sawan-giriemas', name: 'Desa Giri Emas', kecamatanId: 'sawan', kecamatanName: 'Kecamatan Sawan', lat: -8.088, lng: 115.146 },
  { id: 'v-sawan-jagaraga', name: 'Desa Jagaraga', kecamatanId: 'sawan', kecamatanName: 'Kecamatan Sawan', lat: -8.133, lng: 115.158 },
  { id: 'v-sawan-kerobokan', name: 'Desa Kerobokan', kecamatanId: 'sawan', kecamatanName: 'Kecamatan Sawan', lat: -8.098, lng: 115.134 },
  { id: 'v-sawan-lemukih', name: 'Desa Lemukih', kecamatanId: 'sawan', kecamatanName: 'Kecamatan Sawan', lat: -8.198, lng: 115.166 },
  { id: 'v-sawan-menyali', name: 'Desa Menyali', kecamatanId: 'sawan', kecamatanName: 'Kecamatan Sawan', lat: -8.151, lng: 115.164 },
  { id: 'v-sawan-sangsit', name: 'Desa Sangsit', kecamatanId: 'sawan', kecamatanName: 'Kecamatan Sawan', lat: -8.089, lng: 115.137 },
  { id: 'v-sawan-sawan', name: 'Desa Sawan', kecamatanId: 'sawan', kecamatanName: 'Kecamatan Sawan', lat: -8.144, lng: 115.148 },
  { id: 'v-sawan-sekumpul', name: 'Desa Sekumpul', kecamatanId: 'sawan', kecamatanName: 'Kecamatan Sawan', lat: -8.177, lng: 115.185 },
  { id: 'v-sawan-sinabun', name: 'Desa Sinabun', kecamatanId: 'sawan', kecamatanName: 'Kecamatan Sawan', lat: -8.116, lng: 115.137 },
  { id: 'v-sawan-sudaji', name: 'Desa Sudaji', kecamatanId: 'sawan', kecamatanName: 'Kecamatan Sawan', lat: -8.163, lng: 115.163 },
  { id: 'v-sawan-suwug', name: 'Desa Suwug', kecamatanId: 'sawan', kecamatanName: 'Kecamatan Sawan', lat: -8.135, lng: 115.144 },

  // =========================================================================
  // 8. KECAMATAN KUBUTAMBAHAN (13 Desa)
  // =========================================================================
  { id: 'v-kubutambahan-bengkala', name: 'Desa Bengkala', kecamatanId: 'kubutambahan', kecamatanName: 'Kecamatan Kubutambahan', lat: -8.113, lng: 115.174 },
  { id: 'v-kubutambahan-bila', name: 'Desa Bila', kecamatanId: 'kubutambahan', kecamatanName: 'Kecamatan Kubutambahan', lat: -8.122, lng: 115.183 },
  { id: 'v-kubutambahan-bontihing', name: 'Desa Bontihing', kecamatanId: 'kubutambahan', kecamatanName: 'Kecamatan Kubutambahan', lat: -8.166, lng: 115.206 },
  { id: 'v-kubutambahan-bukti', name: 'Desa Bukti', kecamatanId: 'kubutambahan', kecamatanName: 'Kecamatan Kubutambahan', lat: -8.081, lng: 115.211 },
  { id: 'v-kubutambahan-bulian', name: 'Desa Bulian', kecamatanId: 'kubutambahan', kecamatanName: 'Kecamatan Kubutambahan', lat: -8.112, lng: 115.197 },
  { id: 'v-kubutambahan-depeha', name: 'Desa Depeha', kecamatanId: 'kubutambahan', kecamatanName: 'Kecamatan Kubutambahan', lat: -8.136, lng: 115.213 },
  { id: 'v-kubutambahan-kubutambahan', name: 'Desa Kubutambahan', kecamatanId: 'kubutambahan', kecamatanName: 'Kecamatan Kubutambahan', lat: -8.082, lng: 115.186 },
  { id: 'v-kubutambahan-mengening', name: 'Desa Mengening', kecamatanId: 'kubutambahan', kecamatanName: 'Kecamatan Kubutambahan', lat: -8.209, lng: 115.205 },
  { id: 'v-kubutambahan-pakisan', name: 'Desa Pakisan', kecamatanId: 'kubutambahan', kecamatanName: 'Kecamatan Kubutambahan', lat: -8.162, lng: 115.194 },
  { id: 'v-kubutambahan-tajun', name: 'Desa Tajun', kecamatanId: 'kubutambahan', kecamatanName: 'Kecamatan Kubutambahan', lat: -8.191, lng: 115.213 },
  { id: 'v-kubutambahan-tambakan', name: 'Desa Tambakan', kecamatanId: 'kubutambahan', kecamatanName: 'Kecamatan Kubutambahan', lat: -8.176, lng: 115.196 },
  { id: 'v-kubutambahan-tamblang', name: 'Desa Tamblang', kecamatanId: 'kubutambahan', kecamatanName: 'Kecamatan Kubutambahan', lat: -8.132, lng: 115.195 },
  { id: 'v-kubutambahan-tunjung', name: 'Desa Tunjung', kecamatanId: 'kubutambahan', kecamatanName: 'Kecamatan Kubutambahan', lat: -8.151, lng: 115.224 },

  // =========================================================================
  // 9. KECAMATAN TEJAKULA (10 Desa)
  // =========================================================================
  { id: 'v-tejakula-bondalem', name: 'Desa Bondalem', kecamatanId: 'tejakula', kecamatanName: 'Kecamatan Tejakula', lat: -8.129, lng: 115.323 },
  { id: 'v-tejakula-julah', name: 'Desa Julah', kecamatanId: 'tejakula', kecamatanName: 'Kecamatan Tejakula', lat: -8.121, lng: 115.299 },
  { id: 'v-tejakula-les', name: 'Desa Les', kecamatanId: 'tejakula', kecamatanName: 'Kecamatan Tejakula', lat: -8.145, lng: 115.367 },
  { id: 'v-tejakula-madenan', name: 'Desa Madenan', kecamatanId: 'tejakula', kecamatanName: 'Kecamatan Tejakula', lat: -8.166, lng: 115.274 },
  { id: 'v-tejakula-pacung', name: 'Desa Pacung', kecamatanId: 'tejakula', kecamatanName: 'Kecamatan Tejakula', lat: -8.111, lng: 115.278 },
  { id: 'v-tejakula-penuktukan', name: 'Desa Penuktukan', kecamatanId: 'tejakula', kecamatanName: 'Kecamatan Tejakula', lat: -8.154, lng: 115.383 },
  { id: 'v-tejakula-sambirenteng', name: 'Desa Sambirenteng', kecamatanId: 'tejakula', kecamatanName: 'Kecamatan Tejakula', lat: -8.163, lng: 115.399 },
  { id: 'v-tejakula-sembiran', name: 'Desa Sembiran', kecamatanId: 'tejakula', kecamatanName: 'Kecamatan Tejakula', lat: -8.133, lng: 115.278 },
  { id: 'v-tejakula-tejakula', name: 'Desa Tejakula', kecamatanId: 'tejakula', kecamatanName: 'Kecamatan Tejakula', lat: -8.141, lng: 115.346 },
  { id: 'v-tejakula-tembok', name: 'Desa Tembok', kecamatanId: 'tejakula', kecamatanName: 'Kecamatan Tejakula', lat: -8.172, lng: 115.424 },
];
