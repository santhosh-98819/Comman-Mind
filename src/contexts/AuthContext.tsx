import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';
import { getLocalUser, saveLocalUser } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isGuest: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, pass: string, isAnonymousPref?: boolean) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  loginAsLocalUser: (name: string, email?: string) => void;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserPreferences: (prefs: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => getLocalUser());
  const [loading, setLoading] = useState(true);

  // Sync profile from Firestore or create initial record
  const fetchOrCreateProfile = async (user: User, customName?: string, isAnonPref?: boolean) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        const profile: UserProfile = {
          id: user.uid,
          name: data.name || (user.isAnonymous ? 'Guest Explorer' : user.displayName || 'Community Member'),
          email: user.email || undefined,
          isGuest: user.isAnonymous,
          joinedAt: data.createdAt || new Date().toISOString(),
          experiencesShared: data.experiencesShared || 0,
          solutionsTested: data.solutionsTested || 0,
          peopleHelped: data.peopleHelped || 0,
          savedSolutionIds: data.savedSolutionIds || [],
        };
        setUserProfile(profile);
        saveLocalUser(profile);
      } else {
        const initialName = customName || (user.isAnonymous ? 'Guest Explorer' : user.displayName || 'Community Member');
        const newProfileData = {
          id: user.uid,
          name: initialName,
          email: user.email || '',
          isAnonymous: user.isAnonymous || Boolean(isAnonPref),
          displayNamePreference: isAnonPref ? 'anonymous' : 'public',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          experiencesShared: 0,
          solutionsTested: 0,
          peopleHelped: 0,
          savedSolutionIds: [],
        };
        await setDoc(userRef, newProfileData);

        const profile: UserProfile = {
          id: user.uid,
          name: initialName,
          email: user.email || undefined,
          isGuest: user.isAnonymous,
          joinedAt: newProfileData.createdAt,
          experiencesShared: 0,
          solutionsTested: 0,
          peopleHelped: 0,
          savedSolutionIds: [],
        };
        setUserProfile(profile);
        saveLocalUser(profile);
      }
    } catch (err) {
      console.warn('Firestore profile sync error:', err);
      // Fallback local memory profile so app remains responsive
      const fallbackProfile: UserProfile = {
        id: user.uid,
        name: customName || (user.isAnonymous ? 'Guest Explorer' : user.displayName || 'Community Member'),
        email: user.email || undefined,
        isGuest: user.isAnonymous,
        joinedAt: new Date().toISOString(),
        experiencesShared: 0,
        solutionsTested: 0,
        peopleHelped: 0,
        savedSolutionIds: [],
      };
      setUserProfile(fallbackProfile);
      saveLocalUser(fallbackProfile);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchOrCreateProfile(user);
      } else {
        // Keep local user profile if already present
        const local = getLocalUser();
        if (local) {
          setUserProfile(local);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    await fetchOrCreateProfile(cred.user);
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      await fetchOrCreateProfile(cred.user);
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        const errorMsg =
          'Email/Password sign-in is not enabled in the Firebase Console. Please use "Continue with Google" or continue as a Guest.';
        const newErr = new Error(errorMsg);
        (newErr as any).code = err.code;
        throw newErr;
      }
      throw err;
    }
  };

  const signUpWithEmail = async (name: string, email: string, pass: string, isAnonymousPref = false) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      await updateProfile(cred.user, {
        displayName: isAnonymousPref ? 'Anonymous Member' : name.trim(),
      });
      await fetchOrCreateProfile(cred.user, name.trim(), isAnonymousPref);
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        const errorMsg =
          'Email/Password sign-up is not enabled in your Firebase Console. Please use "Continue with Google", enable Email/Password in Firebase Console (Authentication > Sign-in method), or click "Continue as Guest".';
        const newErr = new Error(errorMsg);
        (newErr as any).code = err.code;
        throw newErr;
      }
      throw err;
    }
  };

  const loginAsGuest = async () => {
    try {
      const cred = await signInAnonymously(auth);
      await fetchOrCreateProfile(cred.user, 'Guest Explorer');
    } catch (err: any) {
      console.warn('Firebase anonymous auth unavailable, falling back to local guest mode:', err.message);
      // Seamless local fallback
      const guestProfile: UserProfile = {
        id: `guest-${Date.now()}`,
        name: 'Guest Explorer',
        isGuest: true,
        joinedAt: new Date().toISOString(),
        experiencesShared: 0,
        solutionsTested: 0,
        peopleHelped: 0,
        savedSolutionIds: [],
      };
      setUserProfile(guestProfile);
      saveLocalUser(guestProfile);
    }
  };

  const loginAsLocalUser = (name: string, email?: string) => {
    const localProfile: UserProfile = {
      id: `user-${Date.now()}`,
      name: name.trim() || 'Community Member',
      email: email?.trim(),
      isGuest: false,
      joinedAt: new Date().toISOString(),
      experiencesShared: 0,
      solutionsTested: 0,
      peopleHelped: 0,
      savedSolutionIds: [],
    };
    setUserProfile(localProfile);
    saveLocalUser(localProfile);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    const guestUser: UserProfile = {
      id: `guest-${Math.random().toString(36).substring(2, 9)}`,
      name: 'Guest Explorer',
      isGuest: true,
      joinedAt: new Date().toISOString(),
      experiencesShared: 0,
      solutionsTested: 0,
      peopleHelped: 0,
      savedSolutionIds: [],
    };
    setUserProfile(guestUser);
    saveLocalUser(guestUser);
    setCurrentUser(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const updateUserPreferences = async (prefs: Partial<UserProfile>) => {
    if (currentUser) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          ...prefs,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Failed to update user profile in Firestore:', err);
      }
    }
    setUserProfile((prev) => {
      const updated = prev ? { ...prev, ...prefs } : null;
      if (updated) saveLocalUser(updated);
      return updated;
    });
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await fetchOrCreateProfile(currentUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isGuest: Boolean(currentUser?.isAnonymous || userProfile?.isGuest),
        loginWithGoogle,
        loginWithEmail,
        signUpWithEmail,
        loginAsGuest,
        loginAsLocalUser,
        logout,
        resetPassword,
        updateUserPreferences,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
