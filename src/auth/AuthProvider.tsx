import {
  onAuthStateChanged,
  signOut,
  type User,
} from 'firebase/auth';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth, isFirebaseConfigured } from '../firebase';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  configurationError: string | null;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    return onAuthStateChanged(
      auth,
      (nextUser) => {
        setUser(nextUser);
        setLoading(false);
      },
      (error) => {
        console.error('Firebase authentication listener failed:', error);
        setLoading(false);
      },
    );
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    configurationError: isFirebaseConfigured
      ? null
      : 'Firebase is not configured. Add the required VITE_FIREBASE_* environment variables.',
    signOutUser: async () => {
      if (auth) await signOut(auth);
    },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
