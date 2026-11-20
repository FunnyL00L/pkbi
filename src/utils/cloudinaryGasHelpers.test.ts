import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCloudinaryUploadEndpoint,
  buildGasUpsertPayload,
  DEFAULT_CLOUDINARY_CLOUD_NAME,
  extractYouTubeEmbedUrl,
  formatCloudinaryErrorMessage,
  isCloudinaryConfigured,
  isDirectVideoUrl,
  isValidGasWebAppUrl,
  mergeAllVillagesWithCms,
  mergeSeedWithCmsRecords,
  resolveCloudinaryConfig,
  validateMediaFileForCloudinary,
} from './cloudinaryGasHelpers';
import { CmsVillageRecord, EccdVillageMarker, KesproArticleItem } from '../types';

test('Cloudinary configuration, diuclq0nb default, and endpoint construction work reliably', () => {
  assert.equal(DEFAULT_CLOUDINARY_CLOUD_NAME, 'diuclq0nb');
  assert.equal(isCloudinaryConfigured({ cloudName: '', uploadPreset: '' }), false);
  assert.equal(
    isCloudinaryConfigured({ cloudName: '', uploadPreset: 'pkbi_dok_unsigned' }),
    true
  );
  const resolved = resolveCloudinaryConfig({ cloudName: '', uploadPreset: 'pkbi_dok_unsigned' });
  assert.equal(resolved.cloudName, 'diuclq0nb');
  assert.equal(resolved.uploadPreset, 'pkbi_dok_unsigned');
  assert.equal(resolved.folder, 'pkbi-buleleng-eccd');
  assert.equal(
    buildCloudinaryUploadEndpoint(resolved.cloudName, 'image'),
    'https://api.cloudinary.com/v1_1/diuclq0nb/image/upload'
  );
  assert.equal(
    buildCloudinaryUploadEndpoint('pkbi-buleleng', 'video'),
    'https://api.cloudinary.com/v1_1/pkbi-buleleng/video/upload'
  );
  assert.equal(
    formatCloudinaryErrorMessage('Upload preset not found', 'pkbi_dok_unsigned').includes('diuclq0nb'),
    true
  );
  assert.equal(
    formatCloudinaryErrorMessage('Must supply api_key').includes('Unsigned'),
    true
  );
});

test('validateMediaFileForCloudinary enforces MIME types and size limits', () => {
  const okImg = validateMediaFileForCloudinary(
    { name: 'kegiatan.jpg', type: 'image/jpeg', size: 1024 * 500 },
    'image'
  );
  assert.equal(okImg.valid, true);
  assert.equal(okImg.resourceType, 'image');

  const tooBigImg = validateMediaFileForCloudinary(
    { name: 'huge.png', type: 'image/png', size: 15 * 1024 * 1024 },
    'image'
  );
  assert.equal(tooBigImg.valid, false);

  const okVideo = validateMediaFileForCloudinary(
    { name: 'edukasi.mp4', type: 'video/mp4', size: 12 * 1024 * 1024 },
    'video'
  );
  assert.equal(okVideo.valid, true);
  assert.equal(okVideo.resourceType, 'video');

  const wrongType = validateMediaFileForCloudinary(
    { name: 'doc.pdf', type: 'application/pdf', size: 5000 },
    'image'
  );
  assert.equal(wrongType.valid, false);
});

test('GAS Web App URL validator and video URL classifiers work accurately', () => {
  assert.equal(
    isValidGasWebAppUrl('https://script.google.com/macros/s/AKfycbx1234567890_abc/exec'),
    true
  );
  assert.equal(isValidGasWebAppUrl('https://example.com/fake'), false);
  assert.equal(
    isDirectVideoUrl('https://res.cloudinary.com/demo/video/upload/v1/eccd.mp4'),
    true
  );
  assert.equal(
    extractYouTubeEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
    'https://www.youtube.com/embed/dQw4w9WgXcQ'
  );

  const env = buildGasUpsertPayload('articles', { id: 'art-1', title: 'Test' });
  assert.equal(env.action, 'upsert');
  assert.equal(env.entityType, 'articles');
});

test('mergeAllVillagesWithCms merges edited seeds and appends new custom Buleleng villages', () => {
  const seed: EccdVillageMarker[] = [
    {
      id: 'desa-sari-mekar',
      name: 'Desa Sari Mekar',
      kecamatanId: 'buleleng',
      kecamatanName: 'Kecamatan Buleleng',
      lat: -8.135,
      lng: 115.102,
      population: 3400,
      posyanduCount: 4,
      stuntingPct: 6.7,
      statusProgram: 'Desa Binaan Utama',
      deskripsi: 'Seed desc',
      serviceData: {
        totalRecipients: 200,
        genderBreakdown: { lakiLaki: 95, perempuan: 105 },
        ageGroups: [],
        serviceTypes: [],
        lastUpdated: '2025-02-01',
      },
      agendaList: [],
    },
  ];

  const cmsVillages: CmsVillageRecord[] = [
    {
      id: 'desa-sari-mekar',
      name: 'Desa Sari Mekar (Harmony)',
      kecamatanId: 'buleleng',
      kecamatanName: 'Kecamatan Buleleng',
      lat: -8.135,
      lng: 115.102,
      population: 3550,
      posyanduCount: 5,
      stuntingPct: 6.1,
      statusProgram: 'Desa Binaan Utama',
      deskripsi: 'Updated desc',
      totalRecipients: 250,
      lakiLaki: 120,
      perempuan: 130,
    },
    {
      id: 'desa-banyuning-baru',
      name: 'Kelurahan Banyuning',
      kecamatanId: 'buleleng',
      kecamatanName: 'Kecamatan Buleleng',
      lat: -8.118,
      lng: 115.105,
      population: 8200,
      posyanduCount: 7,
      stuntingPct: 7.4,
      statusProgram: 'Aktif ECCD Mobile',
      deskripsi: 'Kelurahan baru ditambahkan via CMS',
      totalRecipients: 180,
      lakiLaki: 85,
      perempuan: 95,
    },
  ];

  const merged = mergeAllVillagesWithCms(seed, cmsVillages, [], []);
  assert.equal(merged.length, 2);
  assert.equal(merged[0].name, 'Desa Sari Mekar (Harmony)');
  assert.equal(merged[0].serviceData.totalRecipients, 250);
  assert.equal(merged[1].id, 'desa-banyuning-baru');
  assert.equal(merged[1].serviceData.genderBreakdown.perempuan, 95);
});

test('mergeSeedWithCmsRecords handles add, override, and soft delete tombstones', () => {
  const seeds: KesproArticleItem[] = [
    {
      id: 'art-1',
      title: 'Seed 1',
      category: 'Kespro',
      readTime: '3 mnt',
      author: 'Tim',
      dateText: '2025',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/a.jpg',
      summary: 'Summary 1',
      keyTakeaways: [],
      bodyParagraphs: [],
      checklist: [],
    },
    {
      id: 'art-2',
      title: 'Seed 2',
      category: 'Kespro',
      readTime: '4 mnt',
      author: 'Tim',
      dateText: '2025',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/b.jpg',
      summary: 'Summary 2',
      keyTakeaways: [],
      bodyParagraphs: [],
      checklist: [],
    },
  ];

  const cms: KesproArticleItem[] = [
    { ...seeds[0], title: 'Seed 1 Updated' },
    { ...seeds[1], isDeleted: true },
    {
      ...seeds[0],
      id: 'art-custom-3',
      title: 'Custom New Article',
      isDeleted: false,
    },
  ];

  const result = mergeSeedWithCmsRecords(seeds, cms);
  assert.equal(result.length, 2);
  assert.equal(result[0].id, 'art-custom-3');
  assert.equal(result[1].title, 'Seed 1 Updated');
});
