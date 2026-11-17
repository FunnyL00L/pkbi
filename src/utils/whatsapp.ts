export const PKBI_WHATSAPP_NUMBER = '6281239998877';

export interface WhatsAppTemplateOption {
  id: 'ims' | 'catin' | 'desa' | 'wilayah';
  label: string;
  description: string;
  message: string;
}

export const WHATSAPP_TEMPLATES: WhatsAppTemplateOption[] = [
  {
    id: 'ims',
    label: 'Konsultasi Rahasia IMS & Kespro',
    description: 'Tanya seputar gejala IMS, tes HIV/VCT rahasia, atau kesehatan reproduksi.',
    message:
      'Om Swastiastu Tim Konselor PKBI Buleleng. Saya ingin berkonsultasi secara rahasia mengenai kesehatan reproduksi / skrining IMS.',
  },
  {
    id: 'catin',
    label: 'Jadwal Skrining Calon Pengantin',
    description: 'Tanya jadwal, lokasi Puskesmas, dan persiapan pemeriksaan pranikah.',
    message:
      'Om Swastiastu Tim PKBI Buleleng. Saya ingin menanyakan jadwal dan prosedur pemeriksaan skrining kesehatan Calon Pengantin (Catin).',
  },
  {
    id: 'desa',
    label: 'Program Desa Binaan Sari Mekar',
    description: 'Informasi posyandu, pemulihan gizi balita, dan mitra keluarga asuh.',
    message:
      'Om Swastiastu Tim PKBI Buleleng. Saya ingin memperoleh informasi mengenai program Desa Binaan Sari Mekar dan dukungan keluarga asuh.',
  },
  {
    id: 'wilayah',
    label: 'Layanan Kesehatan Wilayah Kecamatan',
    description: 'Koordinasi kegiatan PKBI atau rujukan Puskesmas di kecamatan Anda.',
    message:
      'Om Swastiastu Tim PKBI Buleleng. Saya ingin menanyakan jadwal layanan kesehatan PKBI di wilayah kecamatan saya.',
  },
];

/**
 * Builds a properly encoded WhatsApp click-to-chat URL with prefilled template message.
 */
export function buildWhatsAppUrl(
  message: string,
  phoneNumber: string = PKBI_WHATSAPP_NUMBER
): string {
  const sanitizedPhone = phoneNumber.replace(/[^\d]/g, '') || PKBI_WHATSAPP_NUMBER;
  const trimmedMsg = message.trim() || WHATSAPP_TEMPLATES[0].message;
  return `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(trimmedMsg)}`;
}
