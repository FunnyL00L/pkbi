import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildQnaWhatsAppMessage,
  buildWhatsAppUrl,
  PKBI_WHATSAPP_NUMBER,
  WHATSAPP_TEMPLATES,
} from './whatsapp';

test('buildWhatsAppUrl encodes template text and targets sanitized phone number 0813-5373-6085', () => {
  assert.equal(PKBI_WHATSAPP_NUMBER, '6281353736085');
  const url = buildWhatsAppUrl('Salam sehat, saya izin bertanya tentang skrining catin!', '+62 813-5373-6085');
  assert.ok(url.startsWith('https://wa.me/6281353736085?text='));
  assert.ok(url.includes(encodeURIComponent('Salam sehat, saya izin bertanya tentang skrining catin!')));
});

test('WHATSAPP_TEMPLATES uses Salam sehat greeting and excludes Om Swastiastu', () => {
  assert.equal(WHATSAPP_TEMPLATES.length, 4);
  for (const tpl of WHATSAPP_TEMPLATES) {
    assert.ok(tpl.message.toLowerCase().includes('salam sehat, saya izin bertanya'));
    assert.equal(tpl.message.toLowerCase().includes('om swastiastu'), false);
    const url = buildWhatsAppUrl(tpl.message);
    assert.ok(url.startsWith(`https://wa.me/${PKBI_WHATSAPP_NUMBER}?text=`));
  }
});

test('buildQnaWhatsAppMessage includes topic category, alias, and question with Salam sehat greeting', () => {
  const msg = buildQnaWhatsAppMessage({
    categoryLabel: 'Kesehatan Reproduksi',
    question: 'Kapan jadwal skrining pranikah terdekat?',
    alias: 'Inisial R',
    ticketCode: 'QNA-4821',
  });
  assert.ok(msg.startsWith('Salam sehat, saya izin bertanya'));
  assert.ok(msg.includes('Topik: Kesehatan Reproduksi'));
  assert.ok(msg.includes('Nama/Inisial: Inisial R'));
  assert.ok(msg.includes('Kapan jadwal skrining pranikah terdekat?'));
});
