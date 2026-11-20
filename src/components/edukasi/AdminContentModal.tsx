import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Loader2, ShieldCheck, Link as LinkIcon } from 'lucide-react';
import { KesproArticleItem, KesproInfographicItem, VideoEdukasi } from '../../types';
import { ADMIN_RELAWAN_NAME } from '../../utils/childGrowthHelpers';
import { CloudinaryMediaField } from '../ui/CloudinaryMediaField';
import { BloggerHtmlEditor } from '../ui/BloggerHtmlEditor';

export type AdminContentKind = 'article' | 'video' | 'infographic';

interface AdminContentModalProps {
  isOpen: boolean;
  kind: AdminContentKind;
  editingArticle?: KesproArticleItem | null;
  editingVideo?: VideoEdukasi | null;
  editingInfographic?: KesproInfographicItem | null;
  onClose: () => void;
  onSaveArticle: (item: KesproArticleItem) => Promise<void>;
  onSaveVideo: (item: VideoEdukasi) => Promise<void>;
  onSaveInfographic: (item: KesproInfographicItem) => Promise<void>;
}

export const AdminContentModal: React.FC<AdminContentModalProps> = ({
  isOpen,
  kind,
  editingArticle,
  editingVideo,
  editingInfographic,
  onClose,
  onSaveArticle,
  onSaveVideo,
  onSaveInfographic,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [authorOrSpeaker, setAuthorOrSpeaker] = useState(ADMIN_RELAWAN_NAME);
  const [durationOrReadTime, setDurationOrReadTime] = useState('');
  const [summaryOrDesc, setSummaryOrDesc] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [externalLink, setExternalLink] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [contentMode, setContentMode] = useState<'standard' | 'html'>('standard');
  const [customHtml, setCustomHtml] = useState('');
  const [pointsText, setPointsText] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg(null);
    if (kind === 'article') {
      if (editingArticle) {
        setTitle(editingArticle.title);
        setCategory(editingArticle.category);
        setAuthorOrSpeaker(editingArticle.author);
        setDurationOrReadTime(editingArticle.readTime);
        setSummaryOrDesc(editingArticle.summary);
        setImageUrl(editingArticle.imageUrl);
        setExternalLink(editingArticle.sourceLink || '');
        setBodyText(editingArticle.bodyParagraphs.join('\n\n'));
        setContentMode(editingArticle.contentMode === 'html' ? 'html' : 'standard');
        setCustomHtml(editingArticle.customHtml || '');
        setPointsText(editingArticle.keyTakeaways.join('\n'));
      } else {
        setTitle('');
        setCategory('Kesehatan Reproduksi');
        setAuthorOrSpeaker(ADMIN_RELAWAN_NAME);
        setDurationOrReadTime('4 menit baca');
        setSummaryOrDesc('');
        setImageUrl('');
        setExternalLink('');
        setBodyText('');
        setContentMode('standard');
        setCustomHtml('');
        setPointsText('');
      }
    } else if (kind === 'video') {
      if (editingVideo) {
        setTitle(editingVideo.title);
        setCategory(editingVideo.kategori);
        setAuthorOrSpeaker(editingVideo.narasumber);
        setDurationOrReadTime(editingVideo.durasi);
        setSummaryOrDesc(editingVideo.deskripsi);
        setImageUrl(editingVideo.imageUrl);
        setVideoUrl(editingVideo.videoUrl || '');
        setPointsText(editingVideo.ringkasanPoin.join('\n'));
      } else {
        setTitle('');
        setCategory('Edukasi Kespro');
        setAuthorOrSpeaker(ADMIN_RELAWAN_NAME);
        setDurationOrReadTime('04:00');
        setSummaryOrDesc('');
        setImageUrl('');
        setVideoUrl('');
        setPointsText('');
      }
    } else {
      if (editingInfographic) {
        setTitle(editingInfographic.title);
        setCategory(editingInfographic.category);
        setSummaryOrDesc(editingInfographic.caption);
        setImageUrl(editingInfographic.imageUrl);
        setExternalLink(editingInfographic.linkUrl || '');
        setPointsText(editingInfographic.highlights.join('\n'));
      } else {
        setTitle('');
        setCategory('Infografis ECCD');
        setSummaryOrDesc('');
        setImageUrl('');
        setExternalLink('');
        setPointsText('');
      }
    }
  }, [isOpen, kind, editingArticle, editingVideo, editingInfographic]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summaryOrDesc.trim()) {
      setErrorMsg('Judul dan ringkasan/deskripsi wajib diisi.');
      return;
    }

    const points = pointsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      setSaving(true);
      setErrorMsg(null);
      if (kind === 'article') {
        const paragraphs = bodyText
          .split(/\n{2,}/)
          .map((s) => s.trim())
          .filter(Boolean);
        await onSaveArticle({
          id: editingArticle?.id || `art-${Date.now()}`,
          title: title.trim(),
          category: category.trim() || 'Kesehatan Reproduksi',
          readTime: durationOrReadTime.trim() || '4 menit baca',
          author: authorOrSpeaker.trim() || ADMIN_RELAWAN_NAME,
          dateText:
            editingArticle?.dateText ||
            new Date().toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            }),
          imageUrl: imageUrl.trim(),
          sourceLink: externalLink.trim() || undefined,
          summary: summaryOrDesc.trim(),
          keyTakeaways: points.length > 0 ? points : ['Panduan edukasi resmi PKBI Buleleng'],
          bodyParagraphs: paragraphs.length > 0 ? paragraphs : [summaryOrDesc.trim()],
          contentMode,
          customHtml: contentMode === 'html' ? customHtml.trim() : '',
          checklist: editingArticle?.checklist || [],
          isDeleted: false,
        });
      } else if (kind === 'video') {
        await onSaveVideo({
          id: editingVideo?.id || `vid-${Date.now()}`,
          title: title.trim(),
          kategori: category.trim() || 'Edukasi Kespro',
          durasi: durationOrReadTime.trim() || '04:00',
          narasumber: authorOrSpeaker.trim() || ADMIN_RELAWAN_NAME,
          deskripsi: summaryOrDesc.trim(),
          imageUrl: imageUrl.trim(),
          videoUrl: videoUrl.trim() || undefined,
          ringkasanPoin: points.length > 0 ? points : ['Materi edukasi lapangan ECCD PKBI Buleleng'],
          isDeleted: false,
        });
      } else {
        await onSaveInfographic({
          id: editingInfographic?.id || `inf-${Date.now()}`,
          title: title.trim(),
          category: category.trim() || 'Infografis ECCD',
          caption: summaryOrDesc.trim(),
          imageUrl: imageUrl.trim(),
          linkUrl: externalLink.trim() || undefined,
          highlights: points.length > 0 ? points : ['Infografis edukasi PKBI Buleleng'],
          isDeleted: false,
        });
      }
      onClose();
    } catch {
      setErrorMsg('Gagal menyimpan konten ke database. Pastikan Anda login sebagai Admin.');
    } finally {
      setSaving(false);
    }
  };

  const modalTitle =
    kind === 'article'
      ? editingArticle
        ? 'Edit Artikel Edukasi'
        : 'Tambah Artikel Edukasi Baru'
      : kind === 'video'
        ? editingVideo
          ? 'Edit Video Edukasi'
          : 'Tambah Video Edukasi (Cloudinary / YouTube)'
        : editingInfographic
          ? 'Edit Foto & Infografis'
          : 'Tambah Foto / Infografis (Cloudinary)';

  const modalNode = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[85] bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className={`w-full ${kind === 'article' ? 'sm:max-w-2xl' : 'sm:max-w-xl'} max-h-[92dvh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#0c162e] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-2xl overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <ShieldCheck size={13} />
              <span>CMS Firebase Firestore · PKBI Buleleng</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold font-serif">{modalTitle}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup editor konten"
            className="min-h-[40px] min-w-[40px] rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
          >
            <X size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-3.5 text-xs sm:text-sm">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          <label className="block space-y-1">
            <span className="text-xs font-semibold">Judul Konten</span>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-xs font-semibold">Kategori</span>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </label>

            {kind !== 'infographic' && (
              <label className="space-y-1">
                <span className="text-xs font-semibold">
                  {kind === 'video' ? 'Durasi (mis. 05:20)' : 'Waktu Baca (mis. 4 menit baca)'}
                </span>
                <input
                  type="text"
                  value={durationOrReadTime}
                  onChange={(e) => setDurationOrReadTime(e.target.value)}
                  className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </label>
            )}
          </div>

          {kind !== 'infographic' && (
            <label className="block space-y-1">
              <span className="text-xs font-semibold">
                {kind === 'video' ? 'Narasumber / Pemateri' : 'Penulis / Tim Medis'}
              </span>
              <input
                type="text"
                value={authorOrSpeaker}
                onChange={(e) => setAuthorOrSpeaker(e.target.value)}
                className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </label>
          )}

          {kind === 'video' && (
            <CloudinaryMediaField
              label="File / Tautan Video (Upload Cloudinary MP4 atau Link YouTube)"
              value={videoUrl}
              onChange={setVideoUrl}
              mediaType="video"
              helperText="Tempel tautan video YouTube/MP4 atau unggah ke Cloudinary lalu simpan ke Firebase."
            />
          )}

          <CloudinaryMediaField
            label={
              kind === 'video'
                ? 'Thumbnail / Sampul Video (Cloudinary)'
                : 'Gambar Utama / Infografis (Cloudinary)'
            }
            value={imageUrl}
            onChange={setImageUrl}
            mediaType="image"
          />

          {kind !== 'video' && (
            <label className="block space-y-1">
              <span className="text-xs font-semibold flex items-center gap-1">
                <LinkIcon size={12} />
                <span>Tautan Referensi / Sumber Eksternal (Opsional)</span>
              </span>
              <input
                type="url"
                value={externalLink}
                onChange={(e) => setExternalLink(e.target.value)}
                placeholder="https://..."
                className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </label>
          )}

          <label className="block space-y-1">
            <span className="text-xs font-semibold">
              {kind === 'article' ? 'Ringkasan Artikel' : kind === 'video' ? 'Deskripsi Video' : 'Keterangan Infografis'}
            </span>
            <textarea
              rows={3}
              required
              value={summaryOrDesc}
              onChange={(e) => setSummaryOrDesc(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </label>

          {kind === 'article' && (
            <BloggerHtmlEditor
              contentMode={contentMode}
              onContentModeChange={setContentMode}
              bodyText={bodyText}
              onBodyTextChange={setBodyText}
              customHtml={customHtml}
              onCustomHtmlChange={setCustomHtml}
              standardLabel="Isi Artikel Lengkap (pisahkan paragraf dengan baris kosong)"
              standardPlaceholder="Tulis panduan kesehatan reproduksi secara lengkap..."
            />
          )}

          <label className="block space-y-1">
            <span className="text-xs font-semibold">Poin Penting / Sorotan (1 poin per baris)</span>
            <textarea
              rows={3}
              value={pointsText}
              onChange={(e) => setPointsText(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </label>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[42px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="min-h-[42px] px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              <span>Simpan ke Firebase</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;
};
