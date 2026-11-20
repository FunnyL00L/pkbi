import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import {
  auth,
  BOOTSTRAPPED_ADMIN_EMAIL,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '../firebase';

interface AdminAuthContextValue {
  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  isAdminMode: boolean;
  authLoading: boolean;
  authError: string | null;
  loginWithGoogle: () => Promise<boolean>;
  logoutAdmin: () => Promise<void>;
  clearAuthError: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

async function resolveIsAdminAccount(user: User | null): Promise<boolean> {
  if (!user || !user.emailVerified) return false;

  const emailLower = (user.email || '').toLowerCase();
  if (emailLower === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()) {
    // Ensure admin registry doc exists in Firestore for audit consistency
    try {
      const adminRef = doc(db, 'admins', user.uid);
      const snap = await getDoc(adminRef);
      if (!snap.exists()) {
        await setDoc(adminRef, {
          uid: user.uid,
          email: emailLower.slice(0, 160),
          displayName: (user.displayName || 'Admin Relawan PKBI Buleleng').slice(0, 120),
          role: 'admin',
          createdAt: serverTimestamp(),
        });
      }
    } catch {
      // Bootstrapped admin remains authorized even if offline/first write skipped
    }
    return true;
  }

  try {
    const adminDoc = await getDoc(doc(db, 'admins', user.uid));
    return adminDoc.exists() && adminDoc.data()?.role === 'admin';
  } catch (err) {
    // Non-admin read denial on /admins/{uid} safely maps to false
    const msg = err instanceof Error ? err.message : String(err);
    if (!msg.toLowerCase().includes('permission')) {
      handleFirestoreError(err, OperationType.GET, `admins/${user.uid}`);
    }
    return false;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (!nextUser) {
        setIsAdmin(false);
        setAuthReady(true);
        return;
      }

      try {
        const verifiedAdmin = await resolveIsAdminAccount(nextUser);
        setIsAdmin(verifiedAdmin);
      } catch {
        setIsAdmin(false);
      } finally {
        setAuthReady(true);
      }
    });
    return unsub;
  }, []);

  const loginWithGoogle = useCallback(async (): Promise<boolean> => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      const signedInUser = credential.user;
      const verifiedAdmin = await resolveIsAdminAccount(signedInUser);
      setUser(signedInUser);
      setIsAdmin(verifiedAdmin);

      if (!verifiedAdmin) {
        setAuthError(
          `Akun ${signedInUser.email || 'Gmail ini'} berhasil masuk tetapi belum terdaftar sebagai Admin PKBI. Tampilan tetap dalam mode pengguna publik.`
        );
      }
      return verifiedAdmin;
    } catch (err) {
      const code = (err as { code?: string })?.code || '';
      if (code === 'auth/popup-closed-by-user') {
        setAuthError('Jendela login Google ditutup sebelum selesai.');
      } else if (code === 'auth/popup-blocked') {
        setAuthError('Popup login diblokir browser. Izinkan popup untuk login dengan Gmail.');
      } else {
        setAuthError('Gagal masuk dengan akun Gmail. Silakan coba lagi.');
      }
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const logoutAdmin = useCallback(async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signOut(auth);
      setUser(null);
      setIsAdmin(false);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        authReady,
        isAdmin,
        isAdminMode: Boolean(user && isAdmin),
        authLoading,
        authError,
        loginWithGoogle,
        logoutAdmin,
        clearAuthError,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextValue => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used inside AuthProvider');
  }
  return ctx;
};
