export interface CatinFormInput {
  namaPria: string;
  nikPria: string;
  usiaPria: string;
  namaWanita: string;
  nikWanita: string;
  usiaWanita: string;
  noHp: string;
  kecamatan: string;
  desa: string;
  rencanaTanggalNikah: string;
  puskesmasRujukan: string;
}

export interface CatinValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof CatinFormInput, string>>;
}

/**
 * Validates premarital (Catin) screening form fields with Indonesian error messages.
 */
export function validateCatinForm(input: CatinFormInput): CatinValidationResult {
  const errors: Partial<Record<keyof CatinFormInput, string>> = {};

  if (!input.namaPria.trim() || input.namaPria.trim().length < 3) {
    errors.namaPria = 'Nama calon suami minimal 3 karakter.';
  }

  if (!input.namaWanita.trim() || input.namaWanita.trim().length < 3) {
    errors.namaWanita = 'Nama calon istri minimal 3 karakter.';
  }

  const normalizedPhone = normalizeIndonesianPhone(input.noHp);
  if (!/^08\d{8,12}$/.test(normalizedPhone)) {
    errors.noHp = 'Masukkan nomor WhatsApp valid (contoh: 081234567890).';
  }

  if (input.nikPria.trim() && !/^\d{16}$/.test(input.nikPria.trim())) {
    errors.nikPria = 'NIK harus terdiri dari 16 digit angka.';
  }

  if (input.nikWanita.trim() && !/^\d{16}$/.test(input.nikWanita.trim())) {
    errors.nikWanita = 'NIK harus terdiri dari 16 digit angka.';
  }

  if (input.usiaPria.trim()) {
    const ageM = Number(input.usiaPria);
    if (Number.isNaN(ageM) || ageM < 18 || ageM > 80) {
      errors.usiaPria = 'Usia calon suami harus antara 18–80 tahun.';
    }
  }

  if (input.usiaWanita.trim()) {
    const ageF = Number(input.usiaWanita);
    if (Number.isNaN(ageF) || ageF < 18 || ageF > 80) {
      errors.usiaWanita = 'Usia calon istri harus antara 18–80 tahun.';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Normalizes +62 / 62 / spaces / dashes into standard Indonesian 08xxx format.
 */
export function normalizeIndonesianPhone(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, '');
  if (digits.startsWith('+62')) {
    return '0' + digits.slice(3);
  }
  if (digits.startsWith('62')) {
    return '0' + digits.slice(2);
  }
  return digits;
}
