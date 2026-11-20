import React, { useState } from 'react';
import {
  MapPin,
  Users,
  Building2,
  HeartPulse,
  ArrowLeft,
  Calendar,
  Layers,
  ShieldCheck,
  PhoneCall,
  MessageCircle,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { KecamatanInfo, DesaDetailInfo, KecamatanActivity } from '../../types';
import { TEJAKULA_DESA_LIST } from '../../data/bulelengData';
import { SafeImage } from '../ui/SafeImage';
import { BlogArticleModal, BlogArticleData } from '../ui/BlogArticleModal';
import { buildWhatsAppUrl } from '../../utils/whatsapp';

interface LamanKecamatanDetailProps {
  kecamatan: KecamatanInfo;
  onBackToMap: () => void;
  onSelectDesa?: (desa: DesaDetailInfo) => void;
  onNavigateToQA?: () => void;
}

export const LamanKecamatanDetail: React.FC<LamanKecamatanDetailProps> = ({
  kecamatan,
  onBackToMap,
  onSelectDesa,
}) => {
  const [activeTab, setActiveTab] = useState<'desa' | 'profil' | 'kegiatan'>('desa');
  const [selectedDesaId, setSelectedDesaId] = useState<string | null>(
    kecamatan.id === 'tejakula' ? TEJAKULA_DESA_LIST[0].id : null
  );
  const [activeArticle, setActiveArticle] = useState<BlogArticleData | null>(null);

  const openActivityArticle = (act: KecamatanActivity) => {
    setActiveArticle({
      id: act.id,
      category: `${act.category} · ${kecamatan.name}`,
      title: act.title,
      author: `Tim Lapangan PKBI ${kecamatan.name}`,
      dateText: `${act.hari}, ${act.tanggal}`,
      location: act.location,
      readTime: '3 menit baca',
      imageUrl: act.imageUrl,
      lead: act.description,
      participantCount: act.participants,
      bodyParagraphs: [
        `Kegiatan ${act.title} merupakan bagian dari rangkaian layanan aktif PKBI Kabupaten Buleleng di wilayah ${kecamatan.name}.`,
        `Dilaksanakan di ${act.location}, kegiatan ini melibatkan ${act.participants} warga bersama bidan desa, kader posyandu, serta perangkat kecamatan.`,
        `Masyarakat dapat berkonsultasi lebih lanjut mengenai tindak lanjut skrining maupun jadwal kegiatan serupa melalui layanan WhatsApp resmi PKBI Buleleng.`,
      ],
      highlights: [
        `Lokasi kegiatan: ${act.location}`,
        `Total partisipan: ${act.participants} warga`,
        `Ibu kota kecamatan: ${kecamatan.capital} (Populasi ${kecamatan.population.toLocaleString('id-ID')} jiwa)`,
      ],
    });
  };

  const waNakesHref = buildWhatsAppUrl(
    `Salam sehat, saya izin bertanya mengenai layanan kesehatan PKBI Buleleng di wilayah ${kecamatan.name}.`
  );

  const desaList =
    kecamatan.id === 'tejakula'
      ? TEJAKULA_DESA_LIST
      : (kecamatan.desaList || ['Desa Pusat', 'Desa Pesisir', 'Desa Perbukitan']).map(
          (desaName, idx) => ({
            id: `desa-${kecamatan.id}-${idx}`,
            name: desaName,
            kecamatanId: kecamatan.id,
            lat: kecamatan.lat + ((idx % 3) - 1) * 0.02,
            lng: kecamatan.lng + (Math.floor(idx / 3) - 1) * 0.02,
            population: Math.floor(
              kecamatan.population / ((kecamatan.desaList?.length || 3) * 1)
            ),
            posyanduCount: 4,
            stuntingPct: Number((kecamatan.stuntingRate || 6.2).toFixed(1)),
            statusBinaan: 'Desa Binaan PKBI',
            deskripsi: `Wilayah layanan posyandu terpadu dan pembinaan keluarga sehat PKBI di ${kecamatan.name}.`,
            polygonBoundary: [],
          })
        );

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-50">
      {/* Top Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={onBackToMap}
          className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c162e] hover:bg-slate-50 dark:hover:bg-slate-800 text-blue-700 dark:text-sky-300 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Peta Buleleng</span>
        </button>

        <a
          href={waNakesHref}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors"
        >
          <MessageCircle size={16} />
          <span>Chat WA Nakes Wilayah</span>
        </a>
      </div>

      {/* Golden Ratio Hero Profile Card */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] p-5 sm:p-8 shadow-sm space-y-6">
        <div className="golden-grid-major items-start">
          <div className="space-y-3">
            <div className="text-xs font-semibold text-blue-700 dark:text-sky-400">
              Wilayah Kerja PKBI Kabupaten Buleleng · Ibu Kota {kecamatan.capital}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-slate-900 dark:text-white leading-tight">
              {kecamatan.name}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              {kecamatan.deskripsi ||
                `Pusat monitoring kesehatan reproduksi, pemantauan gizi balita bebas stunting, serta pembinaan keluarga sehat PKBI di ${kecamatan.name}.`}
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 pt-1 tabular-nums">
              <span className="flex items-center gap-1.5">
                <Building2 size={15} className="text-blue-600 dark:text-sky-400" />
                <span>Ibu Kota: {kecamatan.capital}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Layers size={15} className="text-blue-600 dark:text-sky-400" />
                <span>Luas: {kecamatan.areaKm2} km²</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={15} className="text-blue-600 dark:text-sky-400" />
                <span>{kecamatan.population.toLocaleString('id-ID')} jiwa</span>
              </span>
            </div>
          </div>

          {/* Quantitative Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
              <span className="text-xs text-slate-500 dark:text-slate-400 block">
                Prevalensi Stunting
              </span>
              <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-emerald-700 dark:text-emerald-400 mt-1 block">
                {kecamatan.stuntingRate || 5.2}%
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">
                Target &lt; 14% Nasional
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
              <span className="text-xs text-slate-500 dark:text-slate-400 block">
                Balita Terpantau
              </span>
              <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1 block">
                {(kecamatan.balitaTerpantau || 1420).toLocaleString('id-ID')}
              </span>
              <span className="text-xs text-blue-700 dark:text-sky-400 mt-0.5 block">
                Posyandu Aktif
              </span>
            </div>
          </div>
        </div>

        {/* Segmented Tab Controls */}
        <div className="flex items-center gap-2 pt-4 border-t border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
          {[
            { id: 'desa', label: `Daftar Desa (${desaList.length})`, icon: Building2 },
            { id: 'profil', label: 'Puskesmas & Layanan', icon: ShieldCheck },
            { id: 'kegiatan', label: `Agenda Kegiatan (${kecamatan.activities.length})`, icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 flex items-center gap-2 transition-colors cursor-pointer ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'desa' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {desaList.map((desa) => {
            const isSelected = selectedDesaId === desa.id;
            return (
              <button
                key={desa.id}
                type="button"
                onClick={() => {
                  setSelectedDesaId(desa.id);
                  if (onSelectDesa) onSelectDesa(desa);
                }}
                className={`text-left p-5 rounded-2xl border transition-colors cursor-pointer space-y-3 ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 dark:border-sky-400'
                    : 'bg-white dark:bg-[#0c162e] border-slate-200 dark:border-slate-800 hover:border-blue-400'
                }`}
              >
                <div>
                  <div className="text-xs font-medium text-blue-700 dark:text-sky-400">
                    {desa.statusBinaan}
                  </div>
                  <h3 className="text-base font-bold font-serif text-slate-900 dark:text-white mt-0.5">
                    {desa.name}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {desa.deskripsi}
                </p>
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs tabular-nums">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">Penduduk</span>
                    <strong className="text-slate-900 dark:text-white">
                      {desa.population.toLocaleString('id-ID')}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">Posyandu</span>
                    <strong className="text-blue-700 dark:text-sky-400">
                      {desa.posyanduCount} Pos
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">Stunting</span>
                    <strong className="text-emerald-700 dark:text-emerald-400">
                      {desa.stuntingPct}%
                    </strong>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {activeTab === 'profil' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] space-y-4">
            <h3 className="text-base font-bold font-serif flex items-center gap-2 text-slate-900 dark:text-white">
              <HeartPulse className="text-rose-600 dark:text-rose-400" size={18} />
              <span>Puskesmas &amp; Sentra Layanan PKBI</span>
            </h3>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-2">
              <div className="font-bold text-sm text-blue-700 dark:text-sky-400">
                Puskesmas {kecamatan.name} I
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                Layanan: Konseling Calon Pengantin, Skrining Anemia, PMT Balita, dan Imunisasi Rutin.
              </p>
              <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2 pt-1 tabular-nums">
                <PhoneCall size={13} />
                <span>Hotline: (0362) 21188 · 0812-3456-7890</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] space-y-4">
            <h3 className="text-base font-bold font-serif flex items-center gap-2 text-slate-900 dark:text-white">
              <ShieldCheck className="text-blue-600 dark:text-sky-400" size={18} />
              <span>Fokus Intervensi Wilayah</span>
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <span>Pendampingan 1000 Hari Pertama Kehidupan (HPK) untuk ibu hamil &amp; baduta.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <span>Skrining pranikah bersama KUA &amp; Dinas Kependudukan setempat.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <span>Edukasi kesehatan reproduksi remaja di sekolah menengah se-{kecamatan.name}.</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'kegiatan' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {kecamatan.activities.map((act) => (
            <div
              key={act.id}
              className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] flex flex-col"
            >
              <div className="relative aspect-golden w-full overflow-hidden">
                <SafeImage src={act.imageUrl} alt={act.title} />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="text-xs text-blue-700 dark:text-sky-400 font-medium">
                    {act.category} · {act.hari}, {act.tanggal}
                  </div>
                  <h4 className="text-base font-bold font-serif text-slate-900 dark:text-white leading-snug">
                    {act.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {act.description}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 tabular-nums">
                  <span className="flex items-center gap-1.5 truncate">
                    <MapPin size={13} className="text-blue-600 dark:text-sky-400 shrink-0" />
                    <span className="truncate">{act.location}</span>
                  </span>
                  <strong className="text-blue-700 dark:text-sky-400 shrink-0">
                    {act.participants} Peserta
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={() => openActivityArticle(act)}
                  className="w-full min-h-[42px] px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <BookOpen size={14} />
                  <span>Baca Selengkapnya (Artikel)</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <BlogArticleModal
        article={activeArticle}
        onClose={() => setActiveArticle(null)}
      />
    </div>
  );
};
