/**
 * Golden Ratio (φ = 1.61803398875) layout and typography scale helpers.
 */
export const PHI = 1.61803398875;
export const PHI_MAJOR_RATIO = 1 / PHI; // ~0.61803 (61.8%)
export const PHI_MINOR_RATIO = 1 - PHI_MAJOR_RATIO; // ~0.38197 (38.2%)

export interface GoldenSplitDimensions {
  majorPx: number;
  minorPx: number;
}

/**
 * Splits a total width (minus gap) into Golden Ratio Major (61.8%) and Minor (38.2%) segments.
 */
export function calculateGoldenSplit(totalWidth: number, gapPx = 24): GoldenSplitDimensions {
  const usable = Math.max(0, totalWidth - gapPx);
  const majorPx = Math.round(usable * PHI_MAJOR_RATIO);
  const minorPx = Math.max(0, usable - majorPx);
  return { majorPx, minorPx };
}

/**
 * Returns modular Golden Ratio typographic scale steps (in px) from a base font size.
 */
export function getGoldenTypeScale(basePx = 16) {
  return {
    xs: Math.round(basePx / PHI), // ~10px -> clamped in UI to >= 11px for legibility
    sm: Math.round(basePx / Math.sqrt(PHI)), // ~13px
    base: basePx, // 16px
    md: Math.round(basePx * Math.sqrt(PHI)), // ~20px
    lg: Math.round(basePx * PHI), // ~26px
    xl: Math.round(basePx * PHI * Math.sqrt(PHI)), // ~33px
    xxl: Math.round(basePx * PHI * PHI), // ~42px
  };
}
