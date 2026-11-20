import test from 'node:test';
import assert from 'node:assert/strict';
import { buildInlineImageHtml, sanitizeBlogHtml } from './htmlSanitizer';

test('sanitizeBlogHtml removes scripts, iframes, style tags, inline event handlers, and javascript URLs', () => {
  const malicious = `
    <h2>Judul Aman</h2>
    <script>alert("xss")</script>
    <style>body { display: none; }</style>
    <iframe src="https://evil.example"></iframe>
    <img src="https://res.cloudinary.com/demo/image/upload/sample.jpg" onerror="alert(1)" alt="Foto" />
    <a href="javascript:alert(2)" onclick="steal()">Klik</a>
    <div style="color: red; background: url(javascript:alert(3)); position: fixed;">Teks</div>
  `;

  const cleaned = sanitizeBlogHtml(malicious);
  assert.equal(cleaned.includes('<script'), false);
  assert.equal(cleaned.includes('<style'), false);
  assert.equal(cleaned.includes('<iframe'), false);
  assert.equal(cleaned.includes('onerror'), false);
  assert.equal(cleaned.includes('onclick'), false);
  assert.equal(cleaned.includes('javascript:'), false);
  assert.equal(cleaned.includes('position: fixed'), false);
  assert.equal(cleaned.includes('<h2>Judul Aman</h2>'), true);
  assert.equal(
    cleaned.includes('src="https://res.cloudinary.com/demo/image/upload/sample.jpg"'),
    true
  );
});

test('sanitizeBlogHtml preserves rich safe Blogger layouts and hardens external links', () => {
  const safe = `
    <div style="padding: 16px; border-radius: 12px;">
      <h3>Subjudul</h3>
      <p>Paragraf <strong>tebal</strong> dan <em>miring</em>.</p>
      <a href="https://pkbibali.or.id" target="_blank">Situs PKBI</a>
    </div>
  `;

  const cleaned = sanitizeBlogHtml(safe);
  assert.equal(cleaned.includes('padding: 16px; border-radius: 12px;'), true);
  assert.equal(cleaned.includes('<strong>tebal</strong>'), true);
  assert.equal(cleaned.includes('rel="noopener noreferrer"'), true);
});

test('buildInlineImageHtml produces responsive figure markup and escapes caption tags', () => {
  const snippet = buildInlineImageHtml(
    'https://res.cloudinary.com/demo/image/upload/v1/foto.jpg',
    'Kegiatan <b>Remaja</b>'
  );
  assert.equal(snippet.includes('<figure'), true);
  assert.equal(snippet.includes('src="https://res.cloudinary.com/demo/image/upload/v1/foto.jpg"'), true);
  assert.equal(snippet.includes('&lt;b&gt;Remaja&lt;/b&gt;'), true);
});
