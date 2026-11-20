import {
  EccdVillageAgendaItem,
  EccdVillageMarker,
  HarmonyFosterFamily,
  StuntingChildMonthlyPoint,
} from '../types';

export const ADMIN_RELAWAN_NAME = 'Admin Relawan PKBI Buleleng';

/**
 * Calculates Body Mass Index (IMT = weightKg / (heightMeters^2)) rounded to 1 decimal place.
 */
export function calculateBmi(weightKg: number, heightCm: number): number {
  if (!Number.isFinite(weightKg) || !Number.isFinite(heightCm) || heightCm <= 0 || weightKg <= 0) {
    return 0;
  }
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

/**
 * Builds a single monthly growth measurement point for a child.
 */
export function buildMonthlyGrowthPoint(
  month: number,
  heightCm: number,
  weightKg: number
): StuntingChildMonthlyPoint {
  const safeMonth = Math.max(1, Math.min(72, Math.round(month)));
  const safeHeight = Math.round(heightCm * 10) / 10;
  const safeWeight = Math.round(weightKg * 10) / 10;
  return {
    month: safeMonth,
    label: `Bln ${safeMonth}`,
    heightCm: safeHeight,
    weightKg: safeWeight,
    bmi: calculateBmi(safeWeight, safeHeight),
  };
}

export interface ChildGrowthSummary {
  totalMonths: number;
  first: StuntingChildMonthlyPoint | null;
  latest: StuntingChildMonthlyPoint | null;
  heightGainCm: number;
  weightGainKg: number;
  bmiDelta: number;
}

/**
 * Computes longitudinal deltas from the first recorded month to the latest recorded month.
 */
export function summarizeChildGrowth(
  points: StuntingChildMonthlyPoint[] | undefined
): ChildGrowthSummary {
  if (!points || points.length === 0) {
    return {
      totalMonths: 0,
      first: null,
      latest: null,
      heightGainCm: 0,
      weightGainKg: 0,
      bmiDelta: 0,
    };
  }
  const sorted = [...points].sort((a, b) => a.month - b.month);
  const first = sorted[0];
  const latest = sorted[sorted.length - 1];
  return {
    totalMonths: sorted.length,
    first,
    latest,
    heightGainCm: Math.round((latest.heightCm - first.heightCm) * 10) / 10,
    weightGainKg: Math.round((latest.weightKg - first.weightKg) * 10) / 10,
    bmiDelta: Math.round((latest.bmi - first.bmi) * 10) / 10,
  };
}

/**
 * Formats an ISO date (YYYY-MM-DD) into a readable Indonesian display date.
 */
export function formatIndonesianDisplayDate(isoDate: string): string {
  if (!isoDate) return 'Tanggal menyusul';
  const parsed = new Date(`${isoDate}T09:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Pure merge helper combining seed ECCD villages with Firestore admin-managed agendas and tombstones.
 */
export function mergeVillagesWithCms(
  seedVillages: EccdVillageMarker[],
  cmsAgendas: EccdVillageAgendaItem[],
  deletedSeedAgendaIds: string[]
): EccdVillageMarker[] {
  const deletedSet = new Set(deletedSeedAgendaIds);
  const cmsById = new Map<string, EccdVillageAgendaItem>();
  const cmsByVillage = new Map<string, EccdVillageAgendaItem[]>();

  for (const ag of cmsAgendas) {
    cmsById.set(ag.id, ag);
    const list = cmsByVillage.get(ag.villageId) || [];
    list.push(ag);
    cmsByVillage.set(ag.villageId, list);
  }

  return seedVillages.map((village) => {
    const survivingSeeds = village.agendaList
      .filter((seedAg) => !deletedSet.has(seedAg.id))
      .map((seedAg) => cmsById.get(seedAg.id) || seedAg);

    const seedIdSet = new Set(village.agendaList.map((a) => a.id));
    const addedCustom = (cmsByVillage.get(village.id) || []).filter(
      (ag) => !seedIdSet.has(ag.id) && !deletedSet.has(ag.id)
    );

    const combined = [...addedCustom, ...survivingSeeds].sort((a, b) =>
      b.date.localeCompare(a.date)
    );

    return {
      ...village,
      agendaList: combined,
    };
  });
}

/**
 * Pure merge helper combining seed Desa Harmony foster families with Firestore admin overrides/additions.
 */
export function mergeFosterFamiliesWithCms(
  seedFamilies: HarmonyFosterFamily[],
  cmsFamilies: HarmonyFosterFamily[]
): HarmonyFosterFamily[] {
  const cmsMap = new Map<string, HarmonyFosterFamily>();
  for (const fam of cmsFamilies) {
    cmsMap.set(fam.id, fam);
  }

  const mergedSeeds: HarmonyFosterFamily[] = [];
  const seenSeedIds = new Set<string>();

  for (const seed of seedFamilies) {
    seenSeedIds.add(seed.id);
    const override = cmsMap.get(seed.id);
    if (override) {
      if (!override.isDeleted) {
        mergedSeeds.push({
          ...override,
          recordedBy: override.recordedBy || ADMIN_RELAWAN_NAME,
        });
      }
    } else {
      mergedSeeds.push(seed);
    }
  }

  const extraCustom = cmsFamilies
    .filter((fam) => !seenSeedIds.has(fam.id) && !fam.isDeleted)
    .map((fam) => ({
      ...fam,
      recordedBy: fam.recordedBy || ADMIN_RELAWAN_NAME,
    }));

  return [...mergedSeeds, ...extraCustom];
}
