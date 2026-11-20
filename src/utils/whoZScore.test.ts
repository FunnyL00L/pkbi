import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeChildMonthlyZScores,
  calculateHeightForAgeZScore,
  classifyHeightForAgeZScore,
  formatZScore,
  getWhoHeightForAgeReference,
} from './whoZScore';
import { buildMonthlyGrowthPoint } from './childGrowthHelpers';

test('WHO reference lookup returns exact values and interpolates between milestones', () => {
  const m12Boy = getWhoHeightForAgeReference(12, 'L');
  assert.equal(m12Boy.medianCm, 75.7);
  assert.equal(m12Boy.sdCm, 2.4);

  const m12Girl = getWhoHeightForAgeReference(12, 'P');
  assert.equal(m12Girl.medianCm, 74.0);
  assert.equal(m12Girl.sdCm, 2.6);

  // Interpolation at 27 months (midpoint between 24 and 30)
  const m27Boy = getWhoHeightForAgeReference(27, 'L');
  assert.ok(m27Boy.medianCm > 87.8 && m27Boy.medianCm < 91.9);
});

test('calculateHeightForAgeZScore computes exact WHO standard deviations', () => {
  // At 12 months boys: median = 75.7, sd = 2.4
  assert.equal(calculateHeightForAgeZScore(12, 75.7, 'L'), 0);
  assert.equal(calculateHeightForAgeZScore(12, 73.3, 'L'), -1);
  assert.equal(calculateHeightForAgeZScore(12, 70.9, 'L'), -2);
  assert.equal(calculateHeightForAgeZScore(12, 68.5, 'L'), -3);
  assert.ok(calculateHeightForAgeZScore(12, 67.8, 'L') < -3);
});

test('classifyHeightForAgeZScore enforces exact WHO / Buku KIA threshold buckets', () => {
  // < -3 SD -> Severely Stunted
  assert.equal(classifyHeightForAgeZScore(-3.01).code, 'severely-stunted');
  assert.equal(classifyHeightForAgeZScore(-3.5).code, 'severely-stunted');

  // -3 SD to < -2 SD -> Stunted
  assert.equal(classifyHeightForAgeZScore(-3.0).code, 'stunted');
  assert.equal(classifyHeightForAgeZScore(-2.45).code, 'stunted');
  assert.equal(classifyHeightForAgeZScore(-2.01).code, 'stunted');

  // -2 SD to < -1 SD -> Normal Watch
  assert.equal(classifyHeightForAgeZScore(-2.0).code, 'normal-watch');
  assert.equal(classifyHeightForAgeZScore(-1.5).code, 'normal-watch');
  assert.equal(classifyHeightForAgeZScore(-1.01).code, 'normal-watch');

  // >= -1 SD -> Normal Ideal
  assert.equal(classifyHeightForAgeZScore(-1.0).code, 'normal-ideal');
  assert.equal(classifyHeightForAgeZScore(0).code, 'normal-ideal');
  assert.equal(classifyHeightForAgeZScore(0.5).code, 'normal-ideal');
});

test('analyzeChildMonthlyZScores summarizes longitudinal progression and bucket counts', () => {
  const trajectory = [
    buildMonthlyGrowthPoint(1, 48.5, 2.8), // Boys m1 median 54.7 sd 1.9 -> z = -3.26 (severely stunted)
    buildMonthlyGrowthPoint(6, 62.6, 6.2), // Boys m6 median 67.6 sd 2.2 -> z = -2.27 (stunted)
    buildMonthlyGrowthPoint(12, 72.1, 8.9), // Boys m12 median 75.7 sd 2.4 -> z = -1.50 (normal-watch)
  ];

  const analysis = analyzeChildMonthlyZScores(trajectory, 'L');
  assert.equal(analysis.points.length, 3);
  assert.equal(analysis.firstClassification.code, 'severely-stunted');
  assert.equal(analysis.latestClassification.code, 'normal-watch');
  assert.equal(analysis.monthsSeverelyStunted, 1);
  assert.equal(analysis.monthsStunted, 1);
  assert.equal(analysis.monthsNormalWatch, 1);
  assert.ok(analysis.zScoreDelta > 1.5);
  assert.equal(formatZScore(-1.5), '-1.50 SD');
  assert.equal(formatZScore(0.25), '+0.25 SD');
});
