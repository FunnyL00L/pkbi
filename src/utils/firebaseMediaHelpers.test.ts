import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildFirebaseMediaRef,
  computeResizedDimensions,
  extractAllFirebaseMediaIdsFromHtml,
  extractFirebaseMediaId,
  isFirebaseMediaRef,
  replaceFirebaseMediaRefsInHtml,
  validateMediaFileForFirebase,
} from './firebaseMediaHelpers';

test('firebase-media reference parsing and building enforces strict IDs', () => {
  const ref = buildFirebaseMediaRef('img-1732091234-ab12cd');
  assert.equal(ref, 'firebase-media://img-1732091234-ab12cd');
  assert.equal(isFirebaseMediaRef(ref), true);
  assert.equal(extractFirebaseMediaId(ref), 'img-1732091234-ab12cd');

  assert.equal(isFirebaseMediaRef('https://example.com/a.jpg'), false);
  assert.equal(isFirebaseMediaRef('firebase-media://bad/path?x=1'), false);
  assert.equal(extractFirebaseMediaId('firebase-media://a'), null);
});

test('computeResizedDimensions preserves aspect ratio within max dimension', () => {
  assert.deepEqual(computeResizedDimensions(800, 600, 1280), { width: 800, height: 600 });
  assert.deepEqual(computeResizedDimensions(2560, 1280, 1280), { width: 1280, height: 640 });
  assert.deepEqual(computeResizedDimensions(1000, 2000, 1000), { width: 500, height: 1000 });
});

test('validateMediaFileForFirebase validates image/video types and byte limits', () => {
  const okImg = validateMediaFileForFirebase(
    { name: 'posyandu.jpg', type: 'image/jpeg', size: 2 * 1024 * 1024 },
    'image'
  );
  assert.equal(okImg.valid, true);
  assert.equal(okImg.resourceType, 'image');

  const hugeImg = validateMediaFileForFirebase(
    { name: 'raw.png', type: 'image/png', size: 15 * 1024 * 1024 },
    'image'
  );
  assert.equal(hugeImg.valid, false);

  const wrongType = validateMediaFileForFirebase(
    { name: 'doc.pdf', type: 'application/pdf', size: 1024 },
    'image'
  );
  assert.equal(wrongType.valid, false);
});

test('extractAllFirebaseMediaIdsFromHtml and replaceFirebaseMediaRefsInHtml hydrate Blogger HTML safely', () => {
  const html =
    '<figure><img src="firebase-media://img-101-abc" /><img src="firebase-media://img-202-xyz" /><img src="firebase-media://img-101-abc" /></figure>';
  const ids = extractAllFirebaseMediaIdsFromHtml(html);
  assert.deepEqual(ids, ['img-101-abc', 'img-202-xyz']);

  const hydrated = replaceFirebaseMediaRefsInHtml(html, {
    'img-101-abc': 'data:image/webp;base64,AAA',
    'img-202-xyz': 'data:image/jpeg;base64,BBB',
  });
  assert.equal(hydrated.includes('src="data:image/webp;base64,AAA"'), true);
  assert.equal(hydrated.includes('src="data:image/jpeg;base64,BBB"'), true);
  assert.equal(hydrated.includes('firebase-media://'), false);
});
