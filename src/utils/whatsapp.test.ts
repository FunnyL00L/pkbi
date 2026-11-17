import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWhatsAppUrl, PKBI_WHATSAPP_NUMBER, WHATSAPP_TEMPLATES } from './whatsapp.ts';

test('buildWhatsAppUrl encodes template text and targets sanitized phone number', () => {
  const url = buildWhatsAppUrl('Halo PKBI Buleleng, tanya skrining catin!', '+62 812-3999-8877');
  assert.ok(url.startsWith(`https://wa.me/${PKBI_WHATSAPP_NUMBER}?text=`));
  assert.ok(url.includes('Halo%20PKBI%20Buleleng'));
});

test('WHATSAPP_TEMPLATES includes all four end-user consultation paths', () => {
  assert.equal(WHATSAPP_TEMPLATES.length, 4);
  const ids = WHATSAPP_TEMPLATES.map((t) => t.id);
  assert.deepEqual(ids, ['ims', 'catin', 'desa', 'wilayah']);
});
