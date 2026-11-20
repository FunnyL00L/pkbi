import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clampPamphletPage,
  getPamphletPageSlice,
  getTotalPamphletPages,
  youthActivityToBlogArticle,
} from './pamphletSliderHelpers';
import type { HarmonyYouthActivity } from '../types';

test('pamphlet slider pagination stays on 1 page when <= 3 items and paginates on 4th+ item', () => {
  assert.equal(getTotalPamphletPages(0, 3), 1);
  assert.equal(getTotalPamphletPages(3, 3), 1);
  assert.equal(getTotalPamphletPages(4, 3), 2);
  assert.equal(getTotalPamphletPages(6, 3), 2);
  assert.equal(getTotalPamphletPages(7, 3), 3);

  const items = ['p1', 'p2', 'p3', 'p4', 'p5'];
  assert.deepEqual(getPamphletPageSlice(items, 0, 3), ['p1', 'p2', 'p3']);
  assert.deepEqual(getPamphletPageSlice(items, 1, 3), ['p4', 'p5']);
  // Clamping out-of-bounds indices
  assert.equal(clampPamphletPage(-3, items.length, 3), 0);
  assert.equal(clampPamphletPage(99, items.length, 3), 1);
  assert.deepEqual(getPamphletPageSlice(items, 99, 3), ['p4', 'p5']);
});

test('youthActivityToBlogArticle preserves custom blog paragraphs and builds fallback paragraphs cleanly', () => {
  const baseProg: HarmonyYouthActivity = {
    id: 'remaja-1',
    programName: 'Kelas Literasi Kesehatan Reproduksi Remaja',
    forumName: 'Forum Anak Desa Harmony',
    schedule: 'Sabtu Minggu ke-2 · 16.00 WITA',
    participantCount: 48,
    facilitator: 'Admin Relawan PKBI Buleleng',
    topicFocus: 'Pencegahan Anemia & Pernikahan Dini',
    description: 'Diskusi interaktif remaja mengenai kesehatan reproduksi dan perencanaan masa depan.',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    outputs: ['Terbentuk 12 konselor sebaya', 'Kampanye TTD remaja putri'],
  };

  const fallbackArticle = youthActivityToBlogArticle(baseProg);
  assert.equal(fallbackArticle.id, 'remaja-1');
  assert.equal(fallbackArticle.title, baseProg.programName);
  assert.equal(fallbackArticle.bodyParagraphs.length, 3);
  assert.equal(fallbackArticle.participantCount, 48);
  assert.deepEqual(fallbackArticle.highlights, baseProg.outputs);

  const customArticle = youthActivityToBlogArticle({
    ...baseProg,
    dateText: '18 Mei 2025',
    readTime: '5 menit baca',
    bodyParagraphs: ['Paragraf pembuka artikel blog.', 'Paragraf inti pembelajaran remaja.'],
  });
  assert.equal(customArticle.dateText, '18 Mei 2025');
  assert.equal(customArticle.readTime, '5 menit baca');
  assert.deepEqual(customArticle.bodyParagraphs, [
    'Paragraf pembuka artikel blog.',
    'Paragraf inti pembelajaran remaja.',
  ]);
});
