import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCatinForm, normalizeIndonesianPhone } from './validation';

test('normalizeIndonesianPhone converts +62 and 62 prefixes to 0', () => {
  assert.equal(normalizeIndonesianPhone('+62 812-3456-7890'), '081234567890');
  assert.equal(normalizeIndonesianPhone('6281912345678'), '081912345678');
  assert.equal(normalizeIndonesianPhone('08123456789'), '08123456789');
});

test('validateCatinForm passes valid input and catches missing/invalid fields', () => {
  const valid = validateCatinForm({
    namaPria: 'I Kadek Sudarma',
    nikPria: '5108011205980001',
    usiaPria: '26',
    namaWanita: 'Ni Luh Putu Sintia',
    nikWanita: '5108015408990002',
    usiaWanita: '24',
    noHp: '081234567890',
    kecamatan: 'Buleleng',
    desa: 'Desa Sari Mekar',
    rencanaTanggalNikah: '2026-06-15',
    puskesmasRujukan: 'Puskesmas Buleleng I',
  });
  assert.equal(valid.valid, true);
  assert.deepEqual(valid.errors, {});

  const invalid = validateCatinForm({
    namaPria: 'AB',
    nikPria: '123',
    usiaPria: '15',
    namaWanita: '',
    nikWanita: '',
    usiaWanita: '',
    noHp: '12345',
    kecamatan: 'Buleleng',
    desa: 'Desa Sari Mekar',
    rencanaTanggalNikah: '',
    puskesmasRujukan: 'Puskesmas Buleleng I',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.namaPria);
  assert.ok(invalid.errors.namaWanita);
  assert.ok(invalid.errors.noHp);
  assert.ok(invalid.errors.nikPria);
  assert.ok(invalid.errors.usiaPria);
});
