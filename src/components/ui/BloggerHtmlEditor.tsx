import React, { useMemo, useRef, useState } from 'react';
import {
  Code2,
  Eye,
  FileText,
  ImagePlus,
  Sparkles,
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  List,
  LayoutGrid,
  Info,
  Link as LinkIcon,
  Check,
  X,
} from 'lucide-react';
import {
  BLOGGER_HTML_TEMPLATES,
  buildInlineImageHtml,
  sanitizeBlogHtml,
} from '../../utils/htmlSanitizer';
import { CloudinaryMediaField } from './CloudinaryMediaField';

interface BloggerHtmlEditorProps {
  contentMode: 'standard' | 'html';
  onContentModeChange: (mode: 'standard' | 'html') => void;
  bodyText: string;
  onBodyTextChange: (val: string) => void;
  customHtml: string;
  onCustomHtmlChange: (val: string) => void;
  standardLabel?: string;
  standardPlaceholder?: string;
}

export const BloggerHtmlEditor: React.FC<BloggerHtmlEditorProps> = ({
  contentMode,
  onContentModeChange,
  bodyText,
  onBodyTextChange,
  customHtml,
  onCustomHtmlChange,
  standardLabel = 'Isi Lengkap Artikel (pisahkan paragraf dengan 1 baris kosong)',
  standardPlaceholder = 'Tulis isi artikel secara lengkap di sini...',
}) => {
  const [htmlTab, setHtmlTab] = useState<'code' | 'preview'>('code');
  const [showImagePanel, setShowImagePanel] = useState(false);
  const [inlineImgUrl, setInlineImgUrl] = useState('');
  const [inlineImgCaption, setInlineImgCaption] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const sanitizedPreview = useMemo(() => sanitizeBlogHtml(customHtml), [customHtml]);

  const insertSnippetAtCursor = (snippet: string) => {
    const el = textareaRef.current;
    if (!el) {
      onCustomHtmlChange(customHtml ? `${customHtml}\n${snippet}` : snippet);
      return;
    }
    const start = el.selectionStart ?? customHtml.length;
    const end = el.selectionEnd ?? customHtml.length;
    const before = customHtml.slice(0, start);
    const after = customHtml.slice(end);
    const nextValue = `${before}${snippet}${after}`;
    onCustomHtmlChange(nextValue.slice(0, 50000));
    window.requestAnimationFrame(() => {
      el.focus();
      const cursor = Math.min(nextValue.length, start + snippet.length);
      el.setSelectionRange(cursor, cursor);
    });
  };

  const handleInsertInlineImage = () => {
    if (!inlineImgUrl.trim()) return;
    const imgSnippet = `\n${buildInlineImageHtml(inlineImgUrl, inlineImgCaption)}\n`;
    if (contentMode !== 'html') {
      onContentModeChange('html');
    }
    insertSnippetAtCursor(imgSnippet);
    setInlineImgUrl('');
    setInlineImgCaption('');
    setShowImagePanel(false);
    setHtmlTab('code');
  };

  const handleConvertStandardToHtml = () => {
    const paras = bodyText
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (paras.length === 0) return;
    const converted = paras
      .map((p) => `<p style="line-height: 1.75; margin-bottom: 14px;">${p}</p>`)
      .join('\n\n');
    onCustomHtmlChange(converted.slice(0, 50000));
    setHtmlTab('code');
  };

  return (
    <div className="space-y-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-3 sm:p-4">
      {/* Mode Switcher Header: Standar vs Kode HTML Blogger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="text-xs font-bold text-slate-900 dark:text-white">
            Mode Penulisan &amp; Tampilan Blog
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Pilih template bawaan yang praktis atau tulis kode HTML kustom layaknya Blogger.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Mode editor artikel blog"
          className="flex items-center gap-1 p-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 shrink-0 self-start sm:self-auto"
        >
          <button
            id="btn-editor-mode-standard"
            type="button"
            role="tab"
            aria-selected={contentMode === 'standard'}
            onClick={() => onContentModeChange('standard')}
            className={`min-h-[34px] px-2.5 sm:px-3 rounded-lg text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              contentMode === 'standard'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText size={13} />
            <span>Standar</span>
          </button>

          <button
            id="btn-editor-mode-html"
            type="button"
            role="tab"
            aria-selected={contentMode === 'html'}
            onClick={() => onContentModeChange('html')}
            className={`min-h-[34px] px-2.5 sm:px-3 rounded-lg text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              contentMode === 'html'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Code2 size={13} />
            <span>Kustom HTML</span>
          </button>
        </div>
      </div>

      {/* MODE 1: TAMPILAN STANDAR (TEMPLATE BAWAAN) */}
      {contentMode === 'standard' ? (
        <div className="space-y-2">
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {standardLabel}
            </span>
            <textarea
              rows={5}
              value={bodyText}
              onChange={(e) => onBodyTextChange(e.target.value)}
              placeholder={standardPlaceholder}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 leading-relaxed text-xs sm:text-sm"
            />
          </label>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span>Menggunakan tata letak artikel standar PKBI Buleleng.</span>
            <button
              type="button"
              onClick={() => {
                if (!customHtml.trim() && bodyText.trim()) {
                  handleConvertStandardToHtml();
                }
                onContentModeChange('html');
              }}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer flex items-center gap-1"
            >
              <Code2 size={12} />
              <span>Beralih ke Mode HTML Kustom →</span>
            </button>
          </div>
        </div>
      ) : (
        /* MODE 2: BLOGGER CUSTOM HTML + INLINE IMAGE UPLOAD + LIVE PREVIEW */
        <div className="space-y-3">
          {/* Sub-tabs: Kode HTML vs Pratinjau Langsung + Quick Template Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-200/70 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setHtmlTab('code')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
                  htmlTab === 'code'
                    ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <Code2 size={12} />
                <span>Kode HTML</span>
              </button>
              <button
                type="button"
                onClick={() => setHtmlTab('preview')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
                  htmlTab === 'preview'
                    ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <Eye size={12} />
                <span>Pratinjau Langsung</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {BLOGGER_HTML_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => {
                    onCustomHtmlChange(tpl.html);
                    setHtmlTab('code');
                  }}
                  title={tpl.description}
                  className="px-2 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-[10px] sm:text-[11px] font-semibold flex items-center gap-1 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 cursor-pointer"
                >
                  <Sparkles size={11} />
                  <span>{tpl.label}</span>
                </button>
              ))}
              {bodyText.trim().length > 0 && (
                <button
                  type="button"
                  onClick={handleConvertStandardToHtml}
                  className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-[10px] sm:text-[11px] font-semibold cursor-pointer"
                >
                  Dari Paragraf
                </button>
              )}
            </div>
          </div>

          {/* Blogger Formatting & Media Toolbar */}
          {htmlTab === 'code' && (
            <div className="flex flex-wrap items-center gap-1 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950">
              <button
                type="button"
                title="Sisipkan Subjudul H2"
                onClick={() =>
                  insertSnippetAtCursor(
                    '\n<h2 style="font-size: 1.35rem; font-weight: 800; margin: 18px 0 8px;">Subjudul Bagian</h2>\n'
                  )
                }
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <Heading2 size={14} />
              </button>
              <button
                type="button"
                title="Sisipkan Subjudul H3"
                onClick={() =>
                  insertSnippetAtCursor(
                    '\n<h3 style="font-size: 1.1rem; font-weight: 700; margin: 14px 0 6px;">Subjudul Kecil</h3>\n'
                  )
                }
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <Heading3 size={14} />
              </button>
              <button
                type="button"
                title="Tebal (Bold)"
                onClick={() => insertSnippetAtCursor('<strong>Teks Tebal</strong>')}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <Bold size={14} />
              </button>
              <button
                type="button"
                title="Miring (Italic)"
                onClick={() => insertSnippetAtCursor('<em>Teks Miring</em>')}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <Italic size={14} />
              </button>
              <button
                type="button"
                title="Kotak Kutipan"
                onClick={() =>
                  insertSnippetAtCursor(
                    '\n<blockquote style="margin: 16px 0; padding: 14px 18px; border-left: 4px solid #10b981; background: rgba(16,185,129,0.08); border-radius: 10px; font-style: italic;">Tulis kutipan penting di sini...</blockquote>\n'
                  )
                }
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <Quote size={14} />
              </button>
              <button
                type="button"
                title="Daftar Poin"
                onClick={() =>
                  insertSnippetAtCursor(
                    '\n<ul style="padding-left: 20px; line-height: 1.75;">\n  <li>Poin pertama</li>\n  <li>Poin kedua</li>\n</ul>\n'
                  )
                }
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <List size={14} />
              </button>
              <button
                type="button"
                title="Kotak Informasi Biru"
                onClick={() =>
                  insertSnippetAtCursor(
                    '\n<div style="padding: 14px 18px; border-radius: 12px; border: 1px solid rgba(59,130,246,0.3); background: rgba(59,130,246,0.08); margin: 14px 0;"><strong>Catatan Penting:</strong> Tulis informasi sorotan di sini.</div>\n'
                  )
                }
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <Info size={14} />
              </button>
              <button
                type="button"
                title="Layout 2 Kolom Responsif"
                onClick={() =>
                  insertSnippetAtCursor(
                    '\n<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin: 16px 0;">\n  <div style="padding: 14px; border-radius: 12px; border: 1px solid rgba(148,163,184,0.35);"><strong>Kolom Kiri</strong><p style="margin-top:6px;">Isi kolom 1...</p></div>\n  <div style="padding: 14px; border-radius: 12px; border: 1px solid rgba(148,163,184,0.35);"><strong>Kolom Kanan</strong><p style="margin-top:6px;">Isi kolom 2...</p></div>\n</div>\n'
                  )
                }
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <LayoutGrid size={14} />
              </button>
              <button
                type="button"
                title="Sisipkan Tautan"
                onClick={() =>
                  insertSnippetAtCursor(
                    '<a href="https://pkbibali.or.id" target="_blank" style="color: #2563eb; text-decoration: underline; font-weight: 600;">Teks Tautan</a>'
                  )
                }
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <LinkIcon size={14} />
              </button>

              <span className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

              {/* Upload / Insert Inline Image directly into Blog HTML */}
              <button
                id="btn-blogger-insert-image"
                type="button"
                onClick={() => setShowImagePanel((prev) => !prev)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  showImagePanel
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <ImagePlus size={13} />
                <span>Sisipkan Gambar</span>
              </button>
            </div>
          )}

          {/* Inline Image Uploader Drawer (Cloudinary or Direct URL -> inserts <figure><img>) */}
          {showImagePanel && htmlTab === 'code' && (
            <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/25 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                  <ImagePlus size={14} />
                  <span>Upload / Sisipkan Gambar di Dalam Isi Blog</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowImagePanel(false)}
                  aria-label="Tutup panel sisip gambar"
                  className="p-1 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              <CloudinaryMediaField
                label="Upload via Cloudinary atau Tempel URL Gambar"
                value={inlineImgUrl}
                onChange={setInlineImgUrl}
                mediaType="image"
                placeholder="https://res.cloudinary.com/... atau klik Upload"
              />

              <label className="block space-y-1">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Keterangan Gambar / Caption (Opsional)
                </span>
                <input
                  type="text"
                  value={inlineImgCaption}
                  onChange={(e) => setInlineImgCaption(e.target.value)}
                  placeholder="Mis. Dokumentasi diskusi remaja Desa Harmony"
                  className="w-full min-h-[36px] px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
              </label>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowImagePanel(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={!inlineImgUrl.trim()}
                  onClick={handleInsertInlineImage}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Check size={13} />
                  <span>Sisipkan ke Kode HTML</span>
                </button>
              </div>
            </div>
          )}

          {/* Code Textarea OR Live Sanitized Preview */}
          {htmlTab === 'code' ? (
            <div className="space-y-1">
              <textarea
                ref={textareaRef}
                rows={9}
                value={customHtml}
                onChange={(e) => onCustomHtmlChange(e.target.value.slice(0, 50000))}
                placeholder={`<h2>Judul Bagian Unik</h2>\n<p>Tulis kode HTML kustom Anda di sini atau klik tombol "Sisipkan Gambar" dan "Template" di atas...</p>`}
                spellCheck={false}
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-950 text-sky-100 font-mono text-xs leading-relaxed outline-none focus:border-indigo-500"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                <span>
                  Mendukung HTML &amp; inline CSS aman (script/iframe otomatis disaring demi keamanan).
                </span>
                <span className="tabular-nums font-mono">
                  {customHtml.length.toLocaleString('id-ID')} / 50.000
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#081024] min-h-[180px] overflow-x-auto">
              {sanitizedPreview ? (
                <div
                  className="blog-custom-html text-sm text-slate-800 dark:text-slate-200 leading-relaxed space-y-3 [&_img]:max-w-full [&_img]:rounded-xl [&_a]:text-blue-600 dark:[&_a]:text-sky-400 [&_table]:w-full [&_table]:border-collapse"
                  dangerouslySetInnerHTML={{ __html: sanitizedPreview }}
                />
              ) : (
                <div className="text-center py-8 text-xs text-slate-400">
                  Belum ada kode HTML. Ketik HTML atau pilih template cepat di atas untuk melihat pratinjau.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
