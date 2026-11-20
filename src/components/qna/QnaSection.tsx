import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  ShieldCheck,
  MessageSquareHeart,
  Send,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  MessageCircle,
  Lock,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Loader2,
} from 'lucide-react';
import { QNA_CATEGORY_OPTIONS } from '../../data/eccdData';
import { submitQnaQuestion } from '../../services/dataService';
import { QnaCategoryId, QnaFaqItem, QnaSubmissionItem } from '../../types';
import { validateQnaSubmission } from '../../utils/eccdReportHelpers';
import { ADMIN_RELAWAN_NAME } from '../../utils/childGrowthHelpers';
import {
  buildQnaWhatsAppMessage,
  buildWhatsAppUrl,
  PKBI_WHATSAPP_DISPLAY,
  triggerExternalWhatsAppLink,
} from '../../utils/whatsapp';
import { useAppTheme } from '../../context/ThemeContext';
import { useAdminAuth } from '../../context/AuthContext';
import { useCmsData } from '../../context/CmsContext';
import { I18N } from '../../constants/i18n';

export const QnaSection: React.FC = () => {
  const { language } = useAppTheme();
  const { isAdminMode } = useAdminAuth();
  const { faqs, upsertFaq, removeFaq } = useCmsData();
  const t = I18N[language];
  const sectionMeta = t.sectionTitles.qna;

  const [categoryId, setCategoryId] = useState<QnaCategoryId | ''>(
    QNA_CATEGORY_OPTIONS[0].id
  );
  const [alias, setAlias] = useState<string>('');
  const [question, setQuestion] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  // Ephemeral in-memory notice ONLY (NEVER saved to localStorage, Firestore, or GAS)
  const [ephemeralSent, setEphemeralSent] = useState<QnaSubmissionItem | null>(null);

  const [faqFilter, setFaqFilter] = useState<'all' | QnaCategoryId>('all');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(
    faqs[0]?.id || null
  );

  // Admin FAQ editor modal state
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<QnaFaqItem | null>(null);
  const [faqCat, setFaqCat] = useState<QnaCategoryId>('kesehatan-reproduksi');
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [faqAnsweredBy, setFaqAnsweredBy] = useState(ADMIN_RELAWAN_NAME);
  const [savingFaq, setSavingFaq] = useState(false);

  const selectedCategoryMeta = useMemo(
    () => QNA_CATEGORY_OPTIONS.find((c) => c.id === categoryId) || null,
    [categoryId]
  );

  const filteredFaqs = useMemo(() => {
    if (faqFilter === 'all') return faqs;
    return faqs.filter((f) => f.categoryId === faqFilter);
  }, [faqFilter, faqs]);

  const getCategoryLabel = (id: QnaCategoryId): string => {
    return QNA_CATEGORY_OPTIONS.find((c) => c.id === id)?.label || id;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = validateQnaSubmission({ categoryId, question });
    if (!res.valid || !categoryId) {
      setFormError(res.error || 'Periksa kembali input Anda.');
      return;
    }

    setFormError('');
    // Hanya membuat objek sementara di memori untuk langsung dikirim ke WA (TIDAK disimpan)
    const transient = submitQnaQuestion({
      categoryId,
      alias,
      question,
    });
    setEphemeralSent(transient);

    const waUrl = buildWhatsAppUrl(
      buildQnaWhatsAppMessage({
        categoryLabel: getCategoryLabel(transient.categoryId),
        question: transient.question,
        alias: transient.alias,
        ticketCode: transient.ticketCode,
      })
    );
    triggerExternalWhatsAppLink(waUrl);

    setAlias('');
    setQuestion('');
  };

  const openAddFaqModal = () => {
    setEditingFaq(null);
    setFaqCat('kesehatan-reproduksi');
    setFaqQuestion('');
    setFaqAnswer('');
    setFaqAnsweredBy(ADMIN_RELAWAN_NAME);
    setFaqModalOpen(true);
  };

  const openEditFaqModal = (item: QnaFaqItem) => {
    setEditingFaq(item);
    setFaqCat(item.categoryId);
    setFaqQuestion(item.question);
    setFaqAnswer(item.answer);
    setFaqAnsweredBy(item.answeredBy || ADMIN_RELAWAN_NAME);
    setFaqModalOpen(true);
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQuestion.trim() || !faqAnswer.trim()) return;
    try {
      setSavingFaq(true);
      await upsertFaq({
        id: editingFaq?.id || `faq-${Date.now()}`,
        categoryId: faqCat,
        question: faqQuestion.trim(),
        answer: faqAnswer.trim(),
        answeredBy: faqAnsweredBy.trim() || ADMIN_RELAWAN_NAME,
      });
      setFaqModalOpen(false);
    } finally {
      setSavingFaq(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-8 space-y-5 sm:space-y-8 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <section className="pb-3 sm:pb-4 border-b border-slate-200 dark:border-slate-800 space-y-1 sm:space-y-2">
        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-sky-400">
          <MessageSquareHeart size={14} />
          <span>{sectionMeta.kicker}</span>
        </div>
        <h1 className="text-lg sm:text-3xl font-extrabold font-serif tracking-tight text-slate-900 dark:text-white leading-tight">
          QnA &amp; Konsultasi Rahasia PKBI
        </h1>
        <p className="text-[11px] sm:text-sm text-slate-600 dark:text-slate-300 leading-snug sm:leading-relaxed max-w-3xl">
          <span className="sm:hidden">Kirim langsung ke WhatsApp (tidak disimpan) atau baca FAQ resmi.</span>
          <span className="hidden sm:inline">
            Ajukan pertanyaan atau keluhan Anda berdasarkan kategori topik di bawah ini. Pertanyaan
            dikirim langsung ke WhatsApp konselor dan <strong>tidak disimpan di situs atau database</strong>{' '}
            demi menjaga kerahasiaan Anda sepenuhnya.
          </span>
        </p>
      </section>

      {/* FORM KONSULTASI DENGAN BANNER PRIVASI PROMINEN */}
      <section
        id="qna-consultation-form-card"
        className="rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] overflow-hidden shadow-xs"
      >
        {/* PROMINENT PRIVACY BANNER */}
        <div
          id="qna-privacy-banner"
          className="px-3.5 py-3 sm:px-7 sm:py-5 bg-emerald-50 dark:bg-emerald-950/50 border-b border-emerald-200 dark:border-emerald-900 flex items-center gap-2.5 sm:gap-3.5"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Lock size={16} />
          </div>
          <div className="space-y-0.5 min-w-0">
            <h2 className="text-xs sm:text-base font-extrabold text-emerald-950 dark:text-emerald-200 leading-snug">
              Segala informasi Anda akan kami jaga kerahasiaannya &amp; tidak disimpan di web.
            </h2>
            <p className="hidden sm:block text-xs text-emerald-800 dark:text-emerald-300/90 leading-relaxed">
              Pertanyaan yang dikirim langsung diteruskan ke WhatsApp konselor PKBI Kabupaten
              Buleleng tanpa meninggalkan riwayat tersimpan di browser maupun database.
            </p>
          </div>
        </div>

        <div className="p-3.5 sm:p-7 space-y-3.5 sm:space-y-5">
          {ephemeralSent && (
            <div
              id="qna-submission-success"
              className="p-4 rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50/80 dark:bg-blue-950/40 space-y-2 text-xs sm:text-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-sky-300">
                  <CheckCircle2 size={17} />
                  <span>Pertanyaan Dialihkan Langsung ke WhatsApp</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEphemeralSent(null)}
                  aria-label="Tutup notifikasi"
                  className="p-1 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
              <p className="text-slate-700 dark:text-slate-200">
                Kategori: <strong>{getCategoryLabel(ephemeralSent.categoryId)}</strong>. Demi
                privasi, isi pertanyaan Anda <strong>tidak disimpan</strong> pada perangkat maupun
                database.
              </p>
              <a
                id="btn-qna-wa-fallback"
                href={buildWhatsAppUrl(
                  buildQnaWhatsAppMessage({
                    categoryLabel: getCategoryLabel(ephemeralSent.categoryId),
                    question: ephemeralSent.question,
                    alias: ephemeralSent.alias,
                    ticketCode: ephemeralSent.ticketCode,
                  })
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 min-h-[38px] px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
              >
                <MessageCircle size={14} />
                <span>Buka Ulang WhatsApp ({PKBI_WHATSAPP_DISPLAY})</span>
              </a>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
              <div>
                <label
                  htmlFor="qna-category-select"
                  className="block text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1"
                >
                  Kategori Topik <span className="text-rose-500">*</span>
                </label>
                <select
                  id="qna-category-select"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value as QnaCategoryId)}
                  className="w-full min-h-[38px] sm:min-h-[46px] px-2.5 sm:px-3.5 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-blue-600"
                >
                  {QNA_CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {selectedCategoryMeta && (
                  <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-snug">
                    {selectedCategoryMeta.description}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="qna-alias-input"
                  className="block text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1"
                >
                  Nama / Inisial (Opsional)
                </label>
                <input
                  id="qna-alias-input"
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="Anonim / Inisial R"
                  className="w-full min-h-[38px] sm:min-h-[46px] px-2.5 sm:px-3.5 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="qna-question-textarea"
                className="block text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1"
              >
                Pertanyaan Anda <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="qna-question-textarea"
                rows={3}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Tuliskan pertanyaan Anda dengan nyaman..."
                className="w-full p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-blue-600 leading-relaxed"
              />
              {formError && (
                <p className="text-[11px] sm:text-xs font-medium text-rose-600 dark:text-rose-400 mt-1">
                  {formError}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 pt-0.5">
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 min-w-0">
                <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">Bebas stigma · Tanpa riwayat tersimpan</span>
              </div>

              <button
                id="btn-submit-qna"
                type="submit"
                aria-label="Kirim Pertanyaan Langsung ke WhatsApp"
                className="min-h-[38px] sm:min-h-[44px] px-3.5 sm:px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
              >
                <Send size={14} />
                <span className="sm:hidden">Kirim WA</span>
                <span className="hidden sm:inline">Kirim Langsung ke WhatsApp</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* DAFTAR FAQ (TERFILTER PER 4 TOPIK KATEGORI — EDITABLE OLEH ADMIN) */}
      <section id="qna-faq-section" className="space-y-3 sm:space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-xl font-bold font-serif text-slate-900 dark:text-white flex items-center gap-1.5">
              <HelpCircle size={16} className="text-blue-600 dark:text-sky-400 shrink-0" />
              <span>FAQ Konsultasi</span>
            </h2>
            <p className="hidden sm:block text-xs text-slate-600 dark:text-slate-400">
              Temukan jawaban cepat yang telah dikurasi oleh tim dokter, bidan, dan psikolog PKBI Buleleng.
            </p>
          </div>
          {isAdminMode && (
            <button
              id="btn-admin-add-faq"
              type="button"
              onClick={openAddFaqModal}
              className="min-h-[36px] px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Tambah FAQ</span>
            </button>
          )}
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-0.5">
          <button
            type="button"
            onClick={() => setFaqFilter('all')}
            className={`min-h-[34px] sm:min-h-[38px] px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold border whitespace-nowrap shrink-0 cursor-pointer ${
              faqFilter === 'all'
                ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 border-slate-900 dark:border-sky-400'
                : 'bg-white dark:bg-[#0c162e] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
          >
            Semua ({faqs.length})
          </button>

          {QNA_CATEGORY_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setFaqFilter(opt.id)}
              className={`min-h-[34px] sm:min-h-[38px] px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold border whitespace-nowrap shrink-0 cursor-pointer ${
                faqFilter === opt.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-[#0c162e] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-2 sm:space-y-2.5">
          {filteredFaqs.map((faq) => {
            const isOpen = expandedFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className="rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] overflow-hidden"
              >
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setExpandedFaqId(isOpen ? null : faq.id)}
                    aria-expanded={isOpen}
                    className="flex-1 p-3 sm:px-5 sm:py-4 text-left flex items-center justify-between gap-2.5 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-900/40"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-[10px] sm:text-[11px] font-semibold text-blue-700 dark:text-sky-400 truncate">
                        {getCategoryLabel(faq.categoryId)}
                      </div>
                      <div className="text-xs sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                        {faq.question}
                      </div>
                    </div>
                    {isOpen ? (
                      <ChevronUp size={16} className="text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown size={16} className="text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isAdminMode && (
                    <div className="flex items-center gap-1 pr-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditFaqModal(faq)}
                        aria-label={`Edit FAQ ${faq.question}`}
                        className="min-h-[30px] min-w-[30px] rounded-lg bg-blue-50 dark:bg-sky-950/50 text-blue-700 dark:text-sky-300 flex items-center justify-center cursor-pointer"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFaq(faq)}
                        aria-label={`Hapus FAQ ${faq.question}`}
                        className="min-h-[30px] min-w-[30px] rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>

                {isOpen && (
                  <div className="px-3 sm:px-5 pb-3.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-1.5">
                    <p>{faq.answer}</p>
                    <div className="text-[10px] sm:text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                      {faq.answeredBy}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Admin FAQ Modal */}
      {isAdminMode &&
        faqModalOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[85] bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setFaqModalOpen(false)}
          >
            <div
              className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#0c162e] border border-slate-200 dark:border-slate-800 p-5 space-y-4 text-slate-900 dark:text-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold font-serif">
                  {editingFaq ? 'Edit FAQ Konsultasi' : 'Tambah FAQ Konsultasi Baru'}
                </h3>
                <button
                  type="button"
                  onClick={() => setFaqModalOpen(false)}
                  aria-label="Tutup form FAQ"
                  className="min-h-[36px] min-w-[36px] rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleSaveFaq} className="space-y-3 text-xs sm:text-sm">
                <label className="block space-y-1">
                  <span className="font-semibold text-xs">Kategori</span>
                  <select
                    value={faqCat}
                    onChange={(e) => setFaqCat(e.target.value as QnaCategoryId)}
                    className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  >
                    {QNA_CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block space-y-1">
                  <span className="font-semibold text-xs">Pertanyaan</span>
                  <input
                    type="text"
                    required
                    value={faqQuestion}
                    onChange={(e) => setFaqQuestion(e.target.value)}
                    className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="font-semibold text-xs">Jawaban Resmi</span>
                  <textarea
                    rows={4}
                    required
                    value={faqAnswer}
                    onChange={(e) => setFaqAnswer(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="font-semibold text-xs">Dijawab Oleh</span>
                  <input
                    type="text"
                    value={faqAnsweredBy}
                    onChange={(e) => setFaqAnsweredBy(e.target.value)}
                    className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </label>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setFaqModalOpen(false)}
                    className="min-h-[40px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={savingFaq}
                    className="min-h-[40px] px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {savingFaq ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    <span>Simpan FAQ</span>
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
