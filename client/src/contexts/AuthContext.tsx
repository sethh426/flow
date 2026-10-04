'use client';

/**
 * Authentication Context
 * Provides user authentication state and methods throughout the app
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, runTransaction, getDoc } from 'firebase/firestore';
import { auth, db, ensureFirebase, isFirebaseConfigured } from '@/lib/firebase-config';

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  tier: 'free' | 'starter' | 'professional' | 'business';
  flowCoins: number;
  createdAt: Date;
  subscriptionId?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'trialing';
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  configured: boolean;
  retryConnection: () => void;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const requireFirebase = () => {
  if (!auth || !db) {
    throw new Error('Firebase authentication is not configured.');
  }

  return { auth, db };
};
const readyFirebase = async () => {
  await ensureFirebase();
  return requireFirebase();
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(isFirebaseConfigured);
  const [connectionAttempt, setConnectionAttempt] = useState(0);

  // Fetch user data from Firestore
  const fetchUserData = async (uid: string): Promise<UserData | null> => {
    try {
      const { db: firestore } = requireFirebase();
      const userDoc = await getDoc(doc(firestore, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  // Create user document in Firestore
  const createUserDocument = async (user: User, displayName?: string) => {
    const { db: firestore } = requireFirebase();
    const userData: UserData = {
      uid: user.uid,
      email: user.email,
      displayName: displayName || user.displayName,
      photoURL: user.photoURL,
      tier: 'free',
      flowCoins: 100, // Give 100 free coins on signup
      createdAt: new Date(),
    };

    // A retry or failed initial profile read must never overwrite an existing account.
    await runTransaction(firestore, async (transaction) => {
      const reference = doc(firestore, 'users', user.uid);
      const existing = await transaction.get(reference);
      if (!existing.exists()) transaction.set(reference, userData);
    });
    return userData;
  };

  // Sign up with email/password
  const signup = async (email: string, password: string, displayName: string) => {
    const { auth: firebaseAuth } = await readyFirebase();
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    await updateProfile(userCredential.user, { displayName });
    await createUserDocument(userCredential.user, displayName);
  };

  // Login with email/password
  const login = async (email: string, password: string) => {
    const { auth: firebaseAuth } = await readyFirebase();
    await signInWithEmailAndPassword(firebaseAuth, email, password);
  };

  // Login with Google
  const loginWithGoogle = async () => {
    const { auth: firebaseAuth } = await readyFirebase();
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(firebaseAuth, provider);
    
    // Check if user document exists, if not create it
    const existingUserData = await fetchUserData(userCredential.user.uid);
    if (!existingUserData) {
      await createUserDocument(userCredential.user);
    }
  };

  // Logout
  const logout = async () => {
    const { auth: firebaseAuth } = await readyFirebase();
    await signOut(firebaseAuth);
    setUserData(null);
  };

  // Reset password
  const resetPassword = async (email: string) => {
    const { auth: firebaseAuth } = await readyFirebase();
    await sendPasswordResetEmail(firebaseAuth, email);
  };

  // Refresh user data from Firestore
  const refreshUserData = async () => {
    if (user) {
      const data = await fetchUserData(user.uid);
      setUserData(data);
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    let active = true;
    let generation = 0;
    let unsubscribe: (() => void) | undefined;
    void ensureFirebase().then((ready) => {
      if (!active) return;
      setConfigured(ready);
      if (!ready || !auth) {
        setLoading(false);
        return;
      }
      unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
        if (!active) return;
        const current = ++generation;
        setUser(nextUser);
        setUserData(null);
        setLoading(false);
        if (nextUser) {
          const data = await fetchUserData(nextUser.uid);
          if (active && current === generation) setUserData(data);
        }
      }, () => {
        if (!active) return;
        setUser(null);
        setUserData(null);
        setLoading(false);
      });
    });
    return () => {
      active = false;
      generation++;
      unsubscribe?.();
    };
  }, [connectionAttempt]);

  const value: AuthContextType = {
    user,
    userData,
    loading,
    configured,
    retryConnection: () => {
      setLoading(true);
      setConnectionAttempt((attempt) => attempt + 1);
    },
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
