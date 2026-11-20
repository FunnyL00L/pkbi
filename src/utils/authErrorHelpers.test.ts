import test from 'node:test';
import assert from 'node:assert/strict';
import { formatFirebaseAuthError, shouldFallbackToRedirect } from './authErrorHelpers';

test('formatFirebaseAuthError explains auth/unauthorized-domain with exact Vercel hostname and project ID', () => {
  const msg = formatFirebaseAuthError(
    'auth/unauthorized-domain',
    'pkbi-buleleng.vercel.app',
    'global-thinker-467500-n0'
  );
  assert.equal(msg.includes('pkbi-buleleng.vercel.app'), true);
  assert.equal(msg.includes('global-thinker-467500-n0'), true);
  assert.equal(msg.includes('Authorized domains'), true);
});

test('formatFirebaseAuthError preserves unknown Firebase error codes instead of swallowing them', () => {
  const msg = formatFirebaseAuthError(
    'auth/internal-error',
    'pkbi-buleleng.vercel.app',
    'global-thinker-467500-n0'
  );
  assert.equal(msg.includes('auth/internal-error'), true);
});

test('shouldFallbackToRedirect only triggers outside iframes for popup-blocked/unsupported errors', () => {
  assert.equal(shouldFallbackToRedirect('auth/popup-blocked', false), true);
  assert.equal(
    shouldFallbackToRedirect('auth/operation-not-supported-in-this-environment', false),
    true
  );
  assert.equal(shouldFallbackToRedirect('auth/popup-blocked', true), false);
  assert.equal(shouldFallbackToRedirect('auth/unauthorized-domain', false), false);
  assert.equal(shouldFallbackToRedirect('auth/popup-closed-by-user', false), false);
});
