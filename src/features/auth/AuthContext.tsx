'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '@/types/auth';
import { loginAction, signupAction, logoutAction } from './actions';
import { saveUserToFirestore } from './firestore';
import { auth } from '@/lib/firebase/config';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
} from 'firebase/auth';

interface AuthContextType {
  user: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (
    email: string,
    password: string,
    displayName: string,
    phoneNumber?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'cafecore_auth_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize user from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      }
    } catch {
      // ignore JSON parse error
    } finally {
      setIsLoading(false);
    }

    // Optional Firebase Auth State Listener if Firebase is configured
    try {
      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        if (!fbUser && !localStorage.getItem(STORAGE_KEY)) {
          setUser(null);
        }
      });
      return () => unsubscribe();
    } catch {
      // ignore
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Attempt Firebase client sign in if configured
      let firebaseError: any = null;
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (err: any) {
        firebaseError = err;
      }

      // Firebase 계정인데 비밀번호가 일치하지 않는 경우 즉시 안내
      if (
        firebaseError &&
        (firebaseError.code === 'auth/wrong-password' ||
          firebaseError.code === 'auth/invalid-credential') &&
        email.toLowerCase().trim() !== 'admin@gmail.com'
      ) {
        return { success: false, error: '비밀번호가 일치하지 않습니다.' };
      }

      const res = await loginAction(email, password);
      if (res.success) {
        setUser(res.data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data));
        // Cloud Firestore 'users' 컬렉션에 동기화
        saveUserToFirestore(res.data).catch(() => {});
        return { success: true };
      } else {
        return { success: false, error: res.error };
      }
    } catch (err: any) {
      return { success: false, error: err.message || '로그인에 실패했습니다.' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    email: string,
    password: string,
    displayName: string,
    phoneNumber?: string
  ) => {
    setIsLoading(true);
    try {
      // Attempt Firebase client create user if configured
      let firebaseUid: string | undefined;
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        firebaseUid = cred.user.uid;
      } catch (fbErr) {
        console.warn('Firebase Auth client create (fallback to Server Action):', fbErr);
      }

      const res = await signupAction(email, password, displayName, phoneNumber);
      if (res.success) {
        const userData: UserProfile = {
          ...res.data,
          uid: firebaseUid || res.data.uid,
        };
        setUser(userData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));

        // Cloud Firestore 'users' 컬렉션에 즉시 등록 (DB 미생성 상태여도 가입 중단 방지)
        try {
          await saveUserToFirestore(userData);
        } catch (e) {
          console.warn('[Firestore] DB 동기화 대기:', e);
        }

        return { success: true };
      } else {
        return { success: false, error: res.error };
      }
    } catch (err: any) {
      return { success: false, error: err.message || '회원가입에 실패했습니다.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      try {
        await fbSignOut(auth);
      } catch {
        // ignore
      }
      await logoutAction();
      localStorage.removeItem(STORAGE_KEY);
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const isAdmin = user?.role === 'ADMIN' || user?.email.toLowerCase() === 'admin@gmail.com';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: !!isAdmin,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
