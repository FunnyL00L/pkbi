import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Loader2, ShieldCheck } from 'lucide-react';
import { HarmonyYouthActivity } from '../../types';
import { ADMIN_RELAWAN_NAME } from '../../utils/childGrowthHelpers';
import { CloudinaryMediaField } from '../ui/CloudinaryMediaField';
import { BloggerHtmlEditor } from '../ui/BloggerHtmlEditor';

interface AdminYouthArticleModalProps {
  isOpen: boolean;
  editingArticle: HarmonyYouthActivity | null;
  onClose: () => void;
  onSave: (item: HarmonyYouthActivity) => Promise<void>;
}

export const AdminYouthArticleModal: React.FC<AdminYouthArticleModalProps> = ({
  isOpen,
  editingArticle,
  onClose,
  onSave,
}) => {
  const [programName, setProgramName] = useState('');
  const [forumName, setForumName] = useState('Forum Anak & Remaja Desa Harmony');
  const [topicFocus, setTopicFocus] = useState('');
  const [schedule, setSchedule] = useState('');
  const [dateText, setDateText] = useState('');
  const [readTime, setReadTime] = useState('4 menit baca');
  const [facilitator, setFacilitator] = useState(ADMIN_RELAWAN_NAME);
  const [participantCount, setParticipantCount] = useState(40);
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [contentMode, setContentMode] = useState<'standard' | 'html'>('standard');
  const [customHtml, setCustomHtml] = useState('');
  const [outputsText, setOutputsText] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg(null);
    if (editingArticle) {
      setProgramName(editingArticle.programName);
      setForumName(editingArticle.forumName);
      setTopicFocus(editingArticle.topicFocus);
      setSchedule(editingArticle.schedule);
      setDateText(editingArticle.dateText || '');
      setReadTime(editingArticle.readTime || '4 menit baca');
      setFacilitator(editingArticle.facilitator);
      setParticipantCount(editingArticle.participantCount);
      setImageUrl(editingArticle.imageUrl);
      setDescription(editingArticle.description);
      setBodyText(
        editingArticle.bodyParagraphs && editingArticle.bodyParagraphs.length > 0
          ? editingArticle.bodyParagraphs.join('\n\n')
          : editingArticle.description
      );
      setContentMode(editingArticle.contentMode === 'html' ? 'html' : 'standard');
      setCustomHtml(editingArticle.customHtml || '');
      setOutputsText(editingArticle.outputs.join('\n'));
    } else {
      setProgramName('');
      setForumName('Forum Remaja Desa Harmony');
      setTopicFocus('Kesehatan Reproduksi & Kepemimpinan Remaja');
      setSchedule('Sabtu Minggu ke-2 · 16.00 WITA');
      setDateText(
        new Date().toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })
      );
      setReadTime('4 menit baca');
      setFacilitator(ADMIN_RELAWAN_NAME);
      setParticipantCount(35);
      setImageUrl('');
      setDescription('');
      setBodyText('');
      setContentMode('standard');
      setCustomHtml('');
      setOutputsText('Terbentuk kader konselor sebaya aktif\nKampanye gizi & pencegahan pernikahan dini');
    }
  }, [isOpen, editingArticle]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programName.trim() || !description.trim()) {
      setErrorMsg('Judul artikel blog dan ringkasan pembuka wajib diisi.');
      return;
    }

    const outputs = outputsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const bodyParagraphs = bodyText
      .split(/\n{2,}/)
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      setSaving(true);
      setErrorMsg(null);
      await onSave({
        id: editingArticle?.id || `remaja-${Date.now()}`,
        programName: programName.trim(),
        forumName: forumName.trim() || 'Forum Remaja Desa Harmony',
        topicFocus: topicFocus.trim() || 'Penguatan Kapasitas Remaja',
        schedule: schedule.trim() || 'Rutin Bulanan',
        dateText:
          dateText.trim() ||
          new Date().toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          }),
        readTime: readTime.trim() || '4 menit baca',
        facilitator: facilitator.trim() || ADMIN_RELAWAN_NAME,
        participantCount: Math.max(0, Math.round(participantCount)),
        imageUrl: imageUrl.trim(),
        description: description.trim(),
        bodyParagraphs: bodyParagraphs.length > 0 ? bodyParagraphs : [description.trim()],
        contentMode,
        customHtml: contentMode === 'html' ? customHtml.trim() : '',
        outputs: outputs.length > 0 ? outputs : ['Peningkatan literasi kesehatan reproduksi remaja'],
        isDeleted: false,
      });
      onClose();
    } catch {
      setErrorMsg('Gagal menyimpan artikel Forum Remaja ke Firebase. Pastikan sesi Admin aktif.');
    } finally {
      setSaving(false);
    }
  };

  const modalNode = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-youth-modal-title"
      className="fixed inset-0 z-[85] bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-2xl max-h-[92dvh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#0c162e] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <ShieldCheck size={13} />
              <span>Firebase CMS · Blog Forum Remaja</span>
            </div>
            <h2 id="admin-youth-modal-title" className="text-base sm:text-lg font-bold font-serif">
              {editingArticle ? 'Edit Artikel Forum Remaja' : 'Tambah Artikel Blog Forum Remaja'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup form artikel remaja"
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
            <span className="text-xs font-semibold">Judul Artikel / Program Forum Remaja</span>
            <input
              type="text"
              required
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              placeholder="Mis. Kelas Konselor Sebaya: Cegah Anemia & Pernikahan Dini"
              className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-xs font-semibold">Nama Forum / Komunitas</span>
              <input
                type="text"
                required
                value={forumName}
                onChange={(e) => setForumName(e.target.value)}
                className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold">Fokus Topik</span>
              <input
                type="text"
                required
                value={topicFocus}
                onChange={(e) => setTopicFocus(e.target.value)}
                className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold">Tanggal Publikasi</span>
              <input
                type="text"
                value={dateText}
                onChange={(e) => setDateText(e.target.value)}
                placeholder="Mis. 18 Mei 2025"
                className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold">Waktu Baca</span>
              <input
                type="text"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                placeholder="4 menit baca"
                className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold">Jadwal Kegiatan</span>
              <input
                type="text"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold">Jumlah Peserta Remaja</span>
              <input
                type="number"
                min={0}
                value={participantCount}
                onChange={(e) => setParticipantCount(Number(e.target.value))}
                className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 tabular-nums"
              />
            </label>
          </div>

          <label className="block space-y-1">
            <span className="text-xs font-semibold">Penulis / Fasilitator</span>
            <input
              type="text"
              value={facilitator}
              onChange={(e) => setFacilitator(e.target.value)}
              className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </label>

          <CloudinaryMediaField
            label="Gambar Sampul Artikel Blog"
            value={imageUrl}
            onChange={setImageUrl}
            mediaType="image"
          />

          <label className="block space-y-1">
            <span className="text-xs font-semibold">Ringkasan Pembuka (Tampil di Card &amp; Lead Blog)</span>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ringkasan singkat artikel blog Forum Remaja..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </label>

          <BloggerHtmlEditor
            contentMode={contentMode}
            onContentModeChange={setContentMode}
            bodyText={bodyText}
            onBodyTextChange={setBodyText}
            customHtml={customHtml}
            onCustomHtmlChange={setCustomHtml}
            standardLabel="Isi Lengkap Artikel Blog (pisahkan paragraf dengan 1 baris kosong)"
            standardPlaceholder="Tulis cerita kegiatan, materi diskusi remaja, dan refleksi peserta secara lengkap..."
          />

          <label className="block space-y-1">
            <span className="text-xs font-semibold">Poin Capaian &amp; Dampak (1 poin per baris)</span>
            <textarea
              rows={3}
              value={outputsText}
              onChange={(e) => setOutputsText(e.target.value)}
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
