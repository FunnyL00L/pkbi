export const PKBI_WHATSAPP_NUMBER = '6281353736085';
export const PKBI_WHATSAPP_DISPLAY = '0813-5373-6085';

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
      'Salam sehat, saya izin bertanya secara rahasia mengenai kesehatan reproduksi dan skrining IMS kepada Tim Konselor PKBI Buleleng.',
  },
  {
    id: 'catin',
    label: 'Jadwal Skrining Calon Pengantin',
    description: 'Tanya jadwal, lokasi Puskesmas, dan persiapan pemeriksaan pranikah.',
    message:
      'Salam sehat, saya izin bertanya mengenai jadwal dan prosedur pemeriksaan skrining kesehatan Calon Pengantin (Catin) di PKBI Buleleng.',
  },
  {
    id: 'desa',
    label: 'Program Desa Harmony Sari Mekar',
    description: 'Informasi keluarga asuh (stunting & ibu hamil KEK), posyandu, serta forum remaja.',
    message:
      'Salam sehat, saya izin bertanya mengenai informasi program Desa Harmony Sari Mekar (Keluarga Asuh, Posyandu & Remaja).',
  },
  {
    id: 'wilayah',
    label: 'Layanan Kesehatan Wilayah Kecamatan',
    description: 'Koordinasi kegiatan PKBI atau rujukan Puskesmas di kecamatan Anda.',
    message:
      'Salam sehat, saya izin bertanya mengenai jadwal layanan mobile Project ECCD PKBI di wilayah kecamatan saya.',
  },
];

export interface QnaWhatsAppPayload {
  categoryLabel: string;
  question: string;
  alias?: string;
  ticketCode?: string;
}

/**
 * Formats a concise, privacy-friendly one-click WhatsApp consultation message from QnA form inputs.
 */
export function buildQnaWhatsAppMessage(payload: QnaWhatsAppPayload): string {
  const safeAlias = payload.alias?.trim() || 'Anonim';
  const ticketSegment = payload.ticketCode ? ` (${payload.ticketCode})` : '';
  return [
    `Salam sehat, saya izin bertanya kepada Tim Konselor PKBI Buleleng${ticketSegment}.`,
    `Topik: ${payload.categoryLabel}`,
    `Nama/Inisial: ${safeAlias}`,
    `Pertanyaan: ${payload.question.trim()}`,
  ].join('\n');
}

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

/**
 * Triggers opening an external WhatsApp URL cleanly on a user click gesture without using window.open.
 */
export function triggerExternalWhatsAppLink(url: string): void {
  if (typeof document === 'undefined') return;
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}
