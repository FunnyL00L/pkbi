import React, { useState } from 'react';
import {
  MessageCircle,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Calendar,
  MapPin,
} from 'lucide-react';
import { PendaftaranCatinSubmission } from '../../types';
import { submitPendaftaranCatin } from '../../services/dataService';
import { useAppTheme } from '../../context/ThemeContext';
import { I18N } from '../../constants/i18n';
import { validateCatinForm, normalizeIndonesianPhone, CatinFormInput } from '../../utils/validation';
import { ToastBanner } from '../ui/ToastBanner';
import {
  WHATSAPP_TEMPLATES,
  WhatsAppTemplateOption,
  buildWhatsAppUrl,
} from '../../utils/whatsapp';

export const PendaftaranDanQASection: React.FC = () => {
  const { language } = useAppTheme();
  const t = I18N[language];
  const sectionMeta = t.sectionTitles['pendaftaran-qa'];

  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);

  const [selectedTemplateId, setSelectedTemplateId] = useState<WhatsAppTemplateOption['id']>('catin');
  const [waMessageDraft, setWaMessageDraft] = useState<string>(
    WHATSAPP_TEMPLATES.find((tpl) => tpl.id === 'catin')?.message || WHATSAPP_TEMPLATES[0].message
  );

  const [catinForm, setCatinForm] = useState<CatinFormInput>({
    namaPria: '',
    nikPria: '',
    usiaPria: '',
    namaWanita: '',
    nikWanita: '',
    usiaWanita: '',
    noHp: '',
    kecamatan: 'Buleleng',
    desa: 'Desa Sari Mekar',
    rencanaTanggalNikah: '',
    puskesmasRujukan: 'Puskesmas Buleleng I',
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CatinFormInput, string>>>({});
  const [registeredCatinResult, setRegisteredCatinResult] =
    useState<PendaftaranCatinSubmission | null>(null);

  const showToast = (message: string, variant: 'success' | 'error' = 'success') => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSelectTemplate = (tpl: WhatsAppTemplateOption) => {
    setSelectedTemplateId(tpl.id);
    setWaMessageDraft(tpl.message);
  };

  const handleSubmitCatin = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateCatinForm(catinForm);
    if (!validation.valid) {
      setFormErrors(validation.errors);
      showToast('Periksa kembali isian formulir yang ditandai merah.', 'error');
      return;
    }
    setFormErrors({});

    const result = submitPendaftaranCatin({
      namaPria: catinForm.namaPria.trim(),
      nikPria: catinForm.nikPria.trim() || '510801xxxxxxxxxx',
      usiaPria: Number(catinForm.usiaPria) || 25,
      namaWanita: catinForm.namaWanita.trim(),
      nikWanita: catinForm.nikWanita.trim() || '510801xxxxxxxxxx',
      usiaWanita: Number(catinForm.usiaWanita) || 24,
      noHp: normalizeIndonesianPhone(catinForm.noHp),
      kecamatan: catinForm.kecamatan,
      desa: catinForm.desa,
      rencanaTanggalNikah: catinForm.rencanaTanggalNikah || '2025-06-15',
      puskesmasRujukan: catinForm.puskesmasRujukan,
    });
    setRegisteredCatinResult(result);
    showToast(`Registrasi ${result.nomorRegistrasi} berhasil disimpan.`, 'success');
  };

  const waDirectHref = buildWhatsAppUrl(waMessageDraft);

  const buildCatinConfirmWaHref = (res: PendaftaranCatinSubmission) =>
    buildWhatsAppUrl(
      `Om Swastiastu Tim PKBI Buleleng. Kami telah mendaftarkan jadwal Skrining Catin dengan Nomor Registrasi ${res.nomorRegistrasi} atas nama ${res.namaPria} & ${res.namaWanita} (${res.puskesmasRujukan}, Kec. ${res.kecamatan}). Mohon konfirmasi jadwal pemeriksaannya.`
    );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 text-slate-900 dark:text-slate-100">
      {/* Header Banner */}
      <section className="pb-6 border-b border-slate-200 dark:border-slate-800 space-y-2 max-w-2xl">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-sky-400">
          <UserCheck size={15} />
          <span>{sectionMeta.kicker}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-slate-900 dark:text-white">
          {sectionMeta.full}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Daftarkan jadwal skrining kesehatan calon pengantin (Catin) di Puskesmas terdekat atau langsung konsultasi rahasia dengan petugas PKBI Buleleng melalui WhatsApp.
        </p>
      </section>

      {/* Golden Ratio Layout (61.8% Form Pendaftaran / 38.2% Konsultasi WhatsApp & Privasi) */}
      <div className="golden-grid-major items-start">
        {/* MAJOR (61.8%): Form Registrasi Catin */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] p-5 sm:p-7 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg sm:text-xl font-bold font-serif text-slate-900 dark:text-white">
              Formulir Registrasi Skrining Pranikah (Catin)
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Isi data pasangan calon pengantin untuk dijadwalkan pemeriksaan di Puskesmas rujukan Buleleng.
            </p>
          </div>

          {registeredCatinResult ? (
            <div className="p-6 rounded-2xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 text-center space-y-4">
              <CheckCircle2 size={44} className="mx-auto text-emerald-600 dark:text-emerald-400" />
              <div className="space-y-1.5">
                <h4 className="text-base sm:text-lg font-bold">
                  Pendaftaran Berhasil Dicatat
                </h4>
                <p className="text-xs sm:text-sm">
                  Nomor Registrasi:{' '}
                  <strong className="font-mono">{registeredCatinResult.nomorRegistrasi}</strong>
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-emerald-800 dark:text-emerald-200 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} />
                    <span>{registeredCatinResult.puskesmasRujukan}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={13} />
                    <span>{registeredCatinResult.tanggalDaftar}</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <a
                  href={buildCatinConfirmWaHref(registeredCatinResult)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors"
                >
                  <MessageCircle size={16} />
                  <span>Konfirmasi via WhatsApp</span>
                  <ExternalLink size={14} />
                </a>

                <button
                  type="button"
                  onClick={() => setRegisteredCatinResult(null)}
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  Daftarkan Pasangan Lain
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitCatin} noValidate className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="catin-nama-pria"
                    className="block text-xs font-semibold text-slate-800 dark:text-slate-200"
                  >
                    Nama Calon Suami (Pria) *
                  </label>
                  <input
                    id="catin-nama-pria"
                    type="text"
                    required
                    value={catinForm.namaPria}
                    onChange={(e) => {
                      setCatinForm({ ...catinForm, namaPria: e.target.value });
                      if (formErrors.namaPria) setFormErrors({ ...formErrors, namaPria: undefined });
                    }}
                    placeholder="Contoh: I Kadek Sudarma"
                    className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-colors ${
                      formErrors.namaPria
                        ? 'border-rose-500 focus:border-rose-600'
                        : 'border-slate-300 dark:border-slate-700 focus:border-blue-600 dark:focus:border-sky-400'
                    }`}
                  />
                  {formErrors.namaPria && (
                    <p className="text-xs text-rose-600 dark:text-rose-400">{formErrors.namaPria}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="catin-nama-wanita"
                    className="block text-xs font-semibold text-slate-800 dark:text-slate-200"
                  >
                    Nama Calon Istri (Wanita) *
                  </label>
                  <input
                    id="catin-nama-wanita"
                    type="text"
                    required
                    value={catinForm.namaWanita}
                    onChange={(e) => {
                      setCatinForm({ ...catinForm, namaWanita: e.target.value });
                      if (formErrors.namaWanita) setFormErrors({ ...formErrors, namaWanita: undefined });
                    }}
                    placeholder="Contoh: Ni Luh Putu Sintia"
                    className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-colors ${
                      formErrors.namaWanita
                        ? 'border-rose-500 focus:border-rose-600'
                        : 'border-slate-300 dark:border-slate-700 focus:border-blue-600 dark:focus:border-sky-400'
                    }`}
                  />
                  {formErrors.namaWanita && (
                    <p className="text-xs text-rose-600 dark:text-rose-400">{formErrors.namaWanita}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="catin-no-hp"
                    className="block text-xs font-semibold text-slate-800 dark:text-slate-200"
                  >
                    Nomor WhatsApp Aktif *
                  </label>
                  <input
                    id="catin-no-hp"
                    type="tel"
                    required
                    value={catinForm.noHp}
                    onChange={(e) => {
                      setCatinForm({ ...catinForm, noHp: e.target.value });
                      if (formErrors.noHp) setFormErrors({ ...formErrors, noHp: undefined });
                    }}
                    placeholder="081234567890"
                    className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-colors ${
                      formErrors.noHp
                        ? 'border-rose-500 focus:border-rose-600'
                        : 'border-slate-300 dark:border-slate-700 focus:border-blue-600 dark:focus:border-sky-400'
                    }`}
                  />
                  {formErrors.noHp && (
                    <p className="text-xs text-rose-600 dark:text-rose-400">{formErrors.noHp}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="catin-puskesmas"
                    className="block text-xs font-semibold text-slate-800 dark:text-slate-200"
                  >
                    Puskesmas Rujukan Terdekat
                  </label>
                  <select
                    id="catin-puskesmas"
                    value={catinForm.puskesmasRujukan}
                    onChange={(e) =>
                      setCatinForm({ ...catinForm, puskesmasRujukan: e.target.value })
                    }
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-600 dark:focus:border-sky-400"
                  >
                    <option>Puskesmas Buleleng I</option>
                    <option>Puskesmas Buleleng II</option>
                    <option>Puskesmas Sukasada I</option>
                    <option>Puskesmas Tejakula I</option>
                    <option>Puskesmas Seririt I</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="catin-tanggal-nikah"
                    className="block text-xs font-semibold text-slate-800 dark:text-slate-200"
                  >
                    Rencana Tanggal Pernikahan (Opsional)
                  </label>
                  <input
                    id="catin-tanggal-nikah"
                    type="date"
                    value={catinForm.rencanaTanggalNikah}
                    onChange={(e) =>
                      setCatinForm({ ...catinForm, rencanaTanggalNikah: e.target.value })
                    }
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-600 dark:focus:border-sky-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="catin-kecamatan"
                    className="block text-xs font-semibold text-slate-800 dark:text-slate-200"
                  >
                    Kecamatan Domisili
                  </label>
                  <input
                    id="catin-kecamatan"
                    type="text"
                    value={catinForm.kecamatan}
                    onChange={(e) => setCatinForm({ ...catinForm, kecamatan: e.target.value })}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-600 dark:focus:border-sky-400"
                  />
                </div>
              </div>

              <button
                id="btn-submit-catin"
                type="submit"
                className="w-full min-h-[48px] py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors cursor-pointer mt-2"
              >
                Daftarkan Jadwal Skrining Pranikah
              </button>
            </form>
          )}
        </div>

        {/* MINOR (38.2%): Direct WhatsApp Consultation with Pre-filled Templates + Privacy Guarantee */}
        <aside className="space-y-4">
          <div className="rounded-3xl border border-emerald-200 dark:border-emerald-900/70 bg-white dark:bg-[#0c162e] p-5 shadow-xs space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                <MessageCircle size={15} />
                <span>Konsultasi Langsung via WhatsApp</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold font-serif text-slate-900 dark:text-white">
                Pilih Template Pesan Cepat
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Ketuk salah satu topik di bawah, lalu lanjutkan ke WhatsApp resmi konselor PKBI Buleleng.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {WHATSAPP_TEMPLATES.map((tpl) => {
                const isSelected = selectedTemplateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tpl)}
                    className={`text-left p-3 rounded-xl border transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:border-emerald-400'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:border-emerald-400'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {tpl.label}
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                      {tpl.description}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="wa-message-draft"
                className="block text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                Isi Pesan Template (dapat disesuaikan)
              </label>
              <textarea
                id="wa-message-draft"
                rows={3}
                value={waMessageDraft}
                onChange={(e) => setWaMessageDraft(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm leading-relaxed focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-400"
              />
            </div>

            <a
              id="btn-wa-konsultasi-pendaftaran"
              href={waDirectHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle size={18} />
              <span>Chat WhatsApp PKBI Sekarang</span>
              <ExternalLink size={14} />
            </a>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] p-5 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-sky-400 uppercase tracking-wider">
              <ShieldCheck size={16} />
              <span>Jaminan Privasi Pengguna</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Kerahasiaan pertanyaan dan data pendaftaran skrining pranikah Anda dilindungi sepenuhnya oleh konselor medis PKBI Kabupaten Buleleng.
            </p>
          </div>
        </aside>
      </div>

      {/* Floating Direct WhatsApp Trigger */}
      <a
        id="btn-float-chat-pendaftaran"
        href={waDirectHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat WhatsApp PKBI Buleleng"
        title="Chat WhatsApp PKBI Buleleng"
        className="fixed z-40 bottom-20 right-4 lg:bottom-6 lg:right-6 min-h-[52px] min-w-[52px] px-4 rounded-2xl flex items-center justify-center gap-2 text-white shadow-xl transition-transform hover:scale-105 bg-emerald-600 hover:bg-emerald-700"
      >
        <MessageCircle size={20} />
        <span className="text-xs font-semibold hidden sm:inline">Chat WhatsApp</span>
      </a>

      {toast && (
        <ToastBanner
          message={toast.message}
          variant={toast.variant}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
};
