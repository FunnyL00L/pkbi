import type { HarmonyYouthActivity } from '../types';
import type { BlogArticleData } from '../components/ui/BlogArticleModal';

export const DEFAULT_PAMPHLET_PAGE_SIZE = 3;

/**
 * Computes total pages for the Catin pamphlet carousel (3 cards per slide on desktop).
 */
export function getTotalPamphletPages(
  totalItems: number,
  pageSize: number = DEFAULT_PAMPHLET_PAGE_SIZE
): number {
  const safeSize = Math.max(1, Math.floor(pageSize));
  if (totalItems <= 0) return 1;
  return Math.ceil(totalItems / safeSize);
}

/**
 * Clamps a 0-based page index safely within [0, totalPages - 1].
 */
export function clampPamphletPage(
  pageIndex: number,
  totalItems: number,
  pageSize: number = DEFAULT_PAMPHLET_PAGE_SIZE
): number {
  const totalPages = getTotalPamphletPages(totalItems, pageSize);
  const safeIdx = Number.isFinite(pageIndex) ? Math.floor(pageIndex) : 0;
  return Math.max(0, Math.min(safeIdx, totalPages - 1));
}

/**
 * Returns the exact slice of pamphlets for a 0-based slide index (default 3 items per slide).
 */
export function getPamphletPageSlice<T>(
  items: T[],
  pageIndex: number,
  pageSize: number = DEFAULT_PAMPHLET_PAGE_SIZE
): T[] {
  const safeSize = Math.max(1, Math.floor(pageSize));
  const clamped = clampPamphletPage(pageIndex, items.length, safeSize);
  const start = clamped * safeSize;
  return items.slice(start, start + safeSize);
}

/**
 * Converts a Forum Remaja Desa Harmony record into a full BlogArticleData payload
 * suitable for the fullscreen BlogArticleModal reader.
 */
export function youthActivityToBlogArticle(prog: HarmonyYouthActivity): BlogArticleData {
  const customParagraphs = Array.isArray(prog.bodyParagraphs)
    ? prog.bodyParagraphs.map((p) => p.trim()).filter(Boolean)
    : [];

  const bodyParagraphs =
    customParagraphs.length > 0
      ? customParagraphs
      : [
          prog.description,
          `Kegiatan ${prog.forumName} ini berfokus pada topik "${prog.topicFocus}" dengan jadwal rutin ${prog.schedule} bersama fasilitator ${prog.facilitator}.`,
          `Sebanyak ${prog.participantCount} remaja aktif terlibat dalam diskusi interaktif, praktik sebaya, dan penyusunan rencana aksi komunitas di Desa Harmony.`,
        ];

  return {
    id: prog.id,
    category: `${prog.forumName} · Forum Remaja`,
    title: prog.programName,
    author: prog.facilitator,
    dateText: prog.dateText || prog.schedule,
    location: `Desa Harmony · Fokus: ${prog.topicFocus}`,
    readTime: prog.readTime || '3 menit baca',
    imageUrl: prog.imageUrl,
    lead: prog.description,
    bodyParagraphs,
    contentMode: prog.contentMode,
    customHtml: prog.customHtml,
    highlights: prog.outputs,
    participantCount: prog.participantCount,
  };
}
