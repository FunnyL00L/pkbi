import type { KecamatanInfo, KecamatanActivity } from '../types';

export interface DistrictSummaryStats {
  totalDistricts: number;
  totalPopulation: number;
  totalAreaKm2: number;
  averageStuntingPct: number;
}

/**
 * Computes aggregate Buleleng district metrics for the map overview panel.
 */
export function computeBulelengSummary(districts: KecamatanInfo[]): DistrictSummaryStats {
  if (districts.length === 0) {
    return {
      totalDistricts: 0,
      totalPopulation: 0,
      totalAreaKm2: 0,
      averageStuntingPct: 0,
    };
  }

  const totalPopulation = districts.reduce((acc, d) => acc + d.population, 0);
  const totalAreaKm2 = Number(
    districts.reduce((acc, d) => acc + d.areaKm2, 0).toFixed(2)
  );
  const districtsWithStunting = districts.filter((d) => typeof d.stuntingRate === 'number');
  const averageStuntingPct =
    districtsWithStunting.length > 0
      ? Number(
          (
            districtsWithStunting.reduce((acc, d) => acc + (d.stuntingRate || 0), 0) /
            districtsWithStunting.length
          ).toFixed(1)
        )
      : 6.7;

  return {
    totalDistricts: districts.length,
    totalPopulation,
    totalAreaKm2,
    averageStuntingPct,
  };
}

/**
 * Filters districts by user search query against name, capital, or village names.
 */
export function filterDistrictsByQuery(
  districts: KecamatanInfo[],
  query: string
): KecamatanInfo[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return districts;

  return districts.filter((kec) => {
    const inName = kec.name.toLowerCase().includes(normalized);
    const inCapital = kec.capital.toLowerCase().includes(normalized);
    const inDesa = (kec.desaList || []).some((desa) =>
      desa.toLowerCase().includes(normalized)
    );
    const inSariMekar = kec.id === 'buleleng' && 'sari mekar'.includes(normalized);
    return inName || inCapital || inDesa || inSariMekar;
  });
}

/**
 * Resolves the primary activity for a selected district, with optional Sari Mekar focus override.
 */
export function resolveDistrictHighlightActivity(
  district: KecamatanInfo | null,
  focusSariMekar: boolean,
  sariMekarFallbackImage: string
): KecamatanActivity | null {
  if (!district) return null;

  if (district.id === 'buleleng' && focusSariMekar) {
    return {
      id: 'sm-focus-special',
      title: 'Desa Binaan Utama: Pendampingan Posyandu Terpadu & Keluarga Asuh',
      hari: 'Rabu',
      tanggal: '12 Februari 2025',
      location: 'Balai Desa Sari Mekar, Kec. Buleleng',
      description:
        'Sentra intervensi stunting PKBI Buleleng. Prevalensi stunting turun dari 17,6% menjadi 6,7% melalui pendampingan 35 orang tua asuh dan PMT pangan lokal.',
      imageUrl: sariMekarFallbackImage,
      participants: 165,
      category: 'Desa Binaan Terpadu',
    };
  }

  return district.activities[0] || null;
}
