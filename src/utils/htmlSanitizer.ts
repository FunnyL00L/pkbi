/**
 * Pure, zero-dependency HTML sanitizer and Blogger-style HTML template helpers.
 * Allows Admin to design rich custom HTML blog layouts safely (headings, figures,
 * inline images, callout boxes, tables, grids, styled containers) while stripping
 * executable vectors (script, iframe, event handlers, javascript:/data: URLs, style tags).
 */

export interface BloggerHtmlTemplate {
  id: string;
  label: string;
  description: string;
  html: string;
}

const DANGEROUS_CONTAINER_TAGS = [
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'applet',
  'form',
  'input',
  'button',
  'textarea',
  'select',
  'meta',
  'link',
  'base',
  'svg',
  'math',
];

/**
 * Sanitizes custom Blogger HTML before rendering into the DOM.
 * Works identically in Node.js (unit tests) and Browser environments.
 */
export function sanitizeBlogHtml(rawHtml: string): string {
  if (!rawHtml || typeof rawHtml !== 'string') return '';

  let html = rawHtml.trim();
  if (!html) return '';

  // 1. Remove HTML comments (which can hide conditional IE scripts or malformed tags)
  html = html.replace(/<!--[\s\S]*?-->/g, '');

  // 2. Remove dangerous paired tags AND their entire inner content
  for (const tag of DANGEROUS_CONTAINER_TAGS) {
    const pairedRe = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}\\s*>`, 'gi');
    const selfClosingRe = new RegExp(`<${tag}\\b[^>]*\\/?>`, 'gi');
    html = html.replace(pairedRe, '');
    html = html.replace(selfClosingRe, '');
  }

  // 3. Strip inline event handler attributes (onClick, onError, onLoad, etc.)
  html = html.replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  // 4. Strip srcdoc attributes
  html = html.replace(/\s+srcdoc\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  // 5. Sanitize dangerous URL schemes in href / src / poster / action attributes
  html = html.replace(
    /\b(href|src|poster)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/gi,
    (_full, attrName: string, _quoted: string, dbl?: string, sgl?: string, bare?: string) => {
      const rawVal = (dbl ?? sgl ?? bare ?? '').trim();
      const normalized = rawVal.replace(/[\u0000-\u001F\s]+/g, '').toLowerCase();

      const isSafeProtocol =
        normalized.startsWith('https://') ||
        normalized.startsWith('http://') ||
        normalized.startsWith('/') ||
        normalized.startsWith('#') ||
        normalized.startsWith('mailto:') ||
        normalized.startsWith('tel:');

      if (!isSafeProtocol) {
        return `${attrName}="#"`;
      }
      return `${attrName}="${rawVal.replace(/"/g, '&quot;')}"`;
    }
  );

  // 6. Sanitize inline style="..." against CSS expression(), behavior:, @import, and javascript: urls
  html = html.replace(
    /\bstyle\s*=\s*("([^"]*)"|'([^']*)')/gi,
    (_full, _quoted: string, dbl?: string, sgl?: string) => {
      const rawStyle = (dbl ?? sgl ?? '').trim();
      const cleanedStyle = rawStyle
        .replace(/expression\s*\([^)]*\)/gi, '')
        .replace(/url\s*\(\s*['"]?\s*(?:javascript|vbscript|data):[^)]*\)/gi, '')
        .replace(/@import[^;]*;?/gi, '')
        .replace(/behavior\s*:[^;]*;?/gi, '')
        .replace(/-moz-binding\s*:[^;]*;?/gi, '')
        .replace(/position\s*:\s*fixed/gi, 'position: relative')
        .trim();
      return cleanedStyle ? `style="${cleanedStyle.replace(/"/g, '&quot;')}"` : '';
    }
  );

  // 7. Harden target="_blank" anchors with rel="noopener noreferrer"
  html = html.replace(/<a\b([^>]*)>/gi, (match, attrs: string) => {
    if (/target\s*=\s*["']?_blank["']?/i.test(attrs) && !/\brel\s*=/i.test(attrs)) {
      return `<a${attrs} rel="noopener noreferrer">`;
    }
    return match;
  });

  return html;
}

/**
 * Generates clean responsive HTML for inserting an uploaded/linked image inside a Blogger post.
 */
export function buildInlineImageHtml(imageUrl: string, caption = ''): string {
  const safeUrl = imageUrl.trim().replace(/"/g, '&quot;');
  const safeCaption = caption
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  if (!safeUrl) return '';

  return [
    '<figure style="margin: 1.5rem 0; text-align: center;">',
    `  <img src="${safeUrl}" alt="${safeCaption || 'Dokumentasi PKBI Buleleng'}" style="width: 100%; max-height: 460px; object-fit: cover; border-radius: 16px; border: 1px solid rgba(148,163,184,0.35);" />`,
    safeCaption
      ? `  <figcaption style="margin-top: 0.5rem; font-size: 0.8rem; color: #64748b;">${safeCaption}</figcaption>`
      : '',
    '</figure>',
  ]
    .filter(Boolean)
    .join('\n');
}

export const BLOGGER_HTML_TEMPLATES: BloggerHtmlTemplate[] = [
  {
    id: 'editorial-magazine',
    label: 'Artikel Majalah + Highlight Box',
    description: 'Layout editorial elegan dengan kotak sorotan biru & kutipan.',
    html: `<div style="padding: 16px 20px; border-left: 4px solid #2563eb; background: rgba(37, 99, 235, 0.08); border-radius: 12px; margin-bottom: 18px;">
  <strong style="color: #1d4ed8; font-size: 0.95rem;">Ringkasan Cepat Kegiatan</strong>
  <p style="margin: 6px 0 0; line-height: 1.6;">Tulis intisari kegiatan atau edukasi PKBI Buleleng di sini agar pembaca langsung menangkap pesan utama.</p>
</div>

<h2 style="font-size: 1.35rem; font-weight: 800; margin: 20px 0 10px;">Latar Belakang &amp; Tujuan</h2>
<p style="line-height: 1.75; margin-bottom: 14px;">Uraikan cerita lapangan, partisipasi masyarakat atau remaja Desa Harmony, serta tantangan yang dihadapi secara mendalam.</p>

<blockquote style="margin: 18px 0; padding: 14px 18px; border-radius: 14px; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); font-style: italic;">
  &ldquo;Setiap anak dan remaja Buleleng berhak mendapatkan akses informasi kesehatan reproduksi yang ramah, ilmiah, dan bebas stigma.&rdquo;
</blockquote>

<h3 style="font-size: 1.1rem; font-weight: 700; margin: 18px 0 8px;">Poin Aksi Lapangan</h3>
<ul style="padding-left: 20px; line-height: 1.75;">
  <li>Sesi diskusi interaktif berbasis studi kasus bersama konselor sebaya.</li>
  <li>Pemantauan gizi, tablet tambah darah, dan rencana tindak lanjut bulanan.</li>
</ul>`,
  },
  {
    id: 'two-column-cards',
    label: 'Kartu 2 Kolom + Panduan Langkah',
    description: 'Tampilan visual unik dengan dua kartu perbandingan dan langkah terstruktur.',
    html: `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin: 16px 0;">
  <div style="padding: 16px; border-radius: 14px; border: 1px solid rgba(59,130,246,0.3); background: rgba(59,130,246,0.07);">
    <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #2563eb;">Fakta Utama</div>
    <h3 style="font-size: 1.05rem; font-weight: 800; margin: 6px 0;">Pendampingan Berkelanjutan</h3>
    <p style="font-size: 0.9rem; line-height: 1.6; margin: 0;">Kader dan relawan PKBI Buleleng mendampingi remaja dan keluarga secara berkala di tingkat desa.</p>
  </div>
  <div style="padding: 16px; border-radius: 14px; border: 1px solid rgba(16,185,129,0.3); background: rgba(16,185,129,0.07);">
    <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #059669;">Target Dampak</div>
    <h3 style="font-size: 1.05rem; font-weight: 800; margin: 6px 0;">Generasi Sehat Buleleng</h3>
    <p style="font-size: 0.9rem; line-height: 1.6; margin: 0;">Meningkatkan literasi kesehatan reproduksi dan kesiapan gizi sejak usia remaja hingga pranikah.</p>
  </div>
</div>

<h2 style="font-size: 1.3rem; font-weight: 800; margin: 20px 0 10px;">Langkah Praktis</h2>
<ol style="padding-left: 20px; line-height: 1.75;">
  <li><strong>Kenali Kebutuhan:</strong> Lakukan pemetaan isu utama bersama kader setempat.</li>
  <li><strong>Edukasi Terbuka:</strong> Buka ruang dialog aman tanpa menghakimi.</li>
  <li><strong>Rujukan Layanan:</strong> Hubungkan peserta dengan Puskesmas atau konselor PKBI.</li>
</ol>`,
  },
];
