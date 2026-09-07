'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  authTokenKey,
  authUserKey,
  demoMode,
  fetchCurrentUser,
  loginWithApi,
  signupWithApi,
  type AuthSession,
  type AuthUser,
} from '@/lib/api';

interface AuthContextValue {
  ready: boolean;
  user: AuthUser | null;
  signIn: (email: string, password: string, remember: boolean) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function clearStoredSession() {
  for (const storage of [window.localStorage, window.sessionStorage]) {
    storage.removeItem(authTokenKey);
    storage.removeItem(authUserKey);
  }
}

function storeSession(session: AuthSession, remember: boolean) {
  clearStoredSession();
  const storage = remember ? window.localStorage : window.sessionStorage;
  storage.setItem(authTokenKey, session.token);
  storage.setItem(authUserKey, JSON.stringify(session.user));
}

function readStoredSession(): AuthSession | null {
  for (const storage of [window.sessionStorage, window.localStorage]) {
    const token = storage.getItem(authTokenKey);
    const serializedUser = storage.getItem(authUserKey);
    if (!token || !serializedUser) continue;
    try {
      return { token, user: JSON.parse(serializedUser) as AuthUser };
    } catch {
      clearStoredSession();
    }
  }
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const restore = async () => {
      const stored = readStoredSession();
      if (!stored) {
        setReady(true);
        return;
      }
      if (demoMode) {
        setUser(stored.user);
        setReady(true);
        return;
      }
      try {
        const response = await fetchCurrentUser();
        setUser(response.user);
      } catch {
        clearStoredSession();
      } finally {
        setReady(true);
      }
    };
    void restore();
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearStoredSession();
      setUser(null);
    };
    window.addEventListener('northstar:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('northstar:unauthorized', handleUnauthorized);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      user,
      signIn: async (email, password, remember) => {
        const session = await loginWithApi(email, password);
        storeSession(session, remember);
        setUser(session.user);
      },
      signUp: async (name, email, password) => {
        const session = await signupWithApi(name, email, password);
        storeSession(session, true);
        setUser(session.user);
      },
      signOut: () => {
        clearStoredSession();
        setUser(null);
      },
    }),
    [ready, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
