export function isRunningInIframe(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

/**
 * Only allow automatic redirect fallback outside an iframe (e.g. Vercel / standalone web)
 * when the browser blocks popups or does not support signInWithPopup.
 */
export function shouldFallbackToRedirect(errorCode: string, insideIframe: boolean): boolean {
  if (insideIframe) return false;
  return (
    errorCode === 'auth/popup-blocked' ||
    errorCode === 'auth/operation-not-supported-in-this-environment'
  );
}

/**
 * Produces clear, actionable Indonesian diagnostics for Firebase Auth errors
 * so deployments on Vercel or custom domains immediately show what needs whitelisting.
 */
export function formatFirebaseAuthError(
  errorCode: string,
  hostname: string,
  projectId: string
): string {
  const host = (hostname || '').trim() || 'domain-anda.vercel.app';
  const project = (projectId || '').trim() || 'Firebase Project Anda';

  switch (errorCode) {
    case 'auth/unauthorized-domain':
      return `Domain "${host}" belum diizinkan di Firebase Authentication. Buka Firebase Console (${project}) → Authentication → Settings → Authorized domains → Add domain → tambahkan "${host}", lalu coba login kembali.`;
    case 'auth/popup-closed-by-user':
      return 'Jendela login Google ditutup sebelum proses masuk selesai.';
    case 'auth/cancelled-popup-request':
      return 'Permintaan popup login sebelumnya dibatalkan. Silakan klik tombol login sekali lagi.';
    case 'auth/popup-blocked':
      return 'Popup login Google diblokir oleh browser. Izinkan popup untuk situs ini lalu coba lagi.';
    case 'auth/operation-not-allowed':
      return `Metode login Google belum diaktifkan di Firebase Console (${project}) → Authentication → Sign-in method.`;
    case 'auth/network-request-failed':
      return 'Koneksi ke server autentikasi Firebase terganggu. Periksa jaringan internet atau nonaktifkan pemblokir iklan/VPN lalu coba lagi.';
    case 'auth/invalid-api-key':
      return 'Konfigurasi API Key Firebase tidak valid. Pastikan file firebase-applet-config.json ikut ter-deploy dengan benar.';
    default:
      return errorCode
        ? `Gagal masuk dengan akun Gmail (${errorCode}). Pastikan domain "${host}" sudah terdaftar di Authorized domains Firebase Console.`
        : 'Gagal masuk dengan akun Gmail. Silakan coba lagi.';
  }
}
