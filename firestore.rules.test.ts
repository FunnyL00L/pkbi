import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Security Rules Static & Policy Verification against the "Dirty Dozen" Payloads
 * defined in security_spec.md and firebase-blueprint.json.
 */

const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
const blueprintPath = path.resolve(process.cwd(), 'firebase-blueprint.json');

function loadRulesText(): string {
  const target = fs.existsSync(rulesPath)
    ? rulesPath
    : path.resolve(process.cwd(), 'DRAFT_firestore.rules');
  return fs.readFileSync(target, 'utf-8');
}

test('rules enforces global default-deny catch-all and rules_version 2', () => {
  const rules = loadRulesText();
  assert.match(rules, /rules_version\s*=\s*'2'/);
  assert.match(rules, /match\s*\/\{document=\*\*\}\s*\{\s*allow\s+read,\s*write:\s*if\s+false;\s*\}/);
});

test('rules covers every collection declared in firebase-blueprint.json', () => {
  const rules = loadRulesText();
  const blueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf-8'));
  const collections = Object.keys(blueprint.firestore || {});
  assert.ok(collections.length >= 4);
  for (const colPath of collections) {
    const baseName = colPath.split('/').filter(Boolean)[0];
    assert.ok(
      rules.includes(`match /${baseName}/`),
      `Missing match block for collection /${baseName}`
    );
  }
});

test('Dirty Dozen #1-#4: blocks unauth writes, non-admin writes, email spoofing, and self-escalation', () => {
  const rules = loadRulesText();
  assert.ok(rules.includes('request.auth.token.email_verified == true'));
  assert.ok(rules.includes("request.auth.token.email == 'gedebramanda155@gmail.com'"));
  assert.ok(rules.includes('exists(/databases/$(database)/documents/admins/$(request.auth.uid))'));
  assert.ok(rules.includes('isAdmin()'));
});

test('Dirty Dozen #5-#12: enforces strict keys, ID regex, server timestamps, immutability, array bounds, and PII isolation', () => {
  const rules = loadRulesText();
  // #5 Ghost fields
  assert.ok(rules.includes('data.keys().hasAll('));
  assert.ok(rules.includes('data.keys().hasOnly('));
  assert.ok(rules.includes('affectedKeys().hasOnly('));
  // #6 ID poisoning
  assert.ok(rules.includes("id.matches('^[a-zA-Z0-9_\\\\-]+$')"));
  // #7 Client timestamp forgery & #8 Immutability
  assert.ok(rules.includes('incoming().createdAt == request.time'));
  assert.ok(rules.includes('incoming().updatedAt == request.time'));
  assert.ok(rules.includes('incoming().createdAt == existing().createdAt'));
  assert.ok(rules.includes('incoming().authorUid == existing().authorUid'));
  // #9 & #10 Size and array bounds
  assert.ok(rules.includes('data.summary.size() <= 1200'));
  assert.ok(rules.includes('data.galleryImages.size() <= 5'));
  assert.ok(rules.includes('data.monthlyGrowth.size() <= 60'));
  // #11 PII isolation on /admins/{uid}
  assert.ok(rules.includes('request.auth.uid == uid || isAdmin()'));
  // #12 Author UID spoofing
  assert.ok(rules.includes('incoming().authorUid == request.auth.uid'));
  // #13 Blogger customHtml DoW cap and contentMode allowlist
  assert.ok(rules.includes("data.contentMode in ['standard', 'html']"));
  assert.ok(rules.includes('data.customHtml.size() <= 50000'));
  // #14 Firebase cmsMedia image storage bounds & no list enumeration
  assert.ok(rules.includes('function isValidCmsMedia(data, mediaId)'));
  assert.ok(rules.includes("data.dataUrl[0:11] == 'data:image/'"));
  assert.ok(rules.includes('data.dataUrl.size() <= 450000'));
  assert.ok(rules.includes('match /cmsMedia/{mediaId}'));
});
