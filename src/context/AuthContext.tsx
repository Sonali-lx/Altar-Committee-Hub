import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithCredential,
  GoogleAuthProvider, 
  User, 
  signOut 
} from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { SocialLogin } from '@capgo/capacitor-social-login';
import { auth } from '../lib/firebase';
import { dbService } from '../services/db';
import { UserProfile, UserRole } from '../types';

const GOOGLE_WEB_CLIENT_ID = '825490865095-se97g4od9joef3s81q427rna44efad8m.apps.googleusercontent.com';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize native social login on native mobile platforms
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      SocialLogin.initialize({
        google: {
          webClientId: GOOGLE_WEB_CLIENT_ID,
          mode: 'online',
        }
      }).catch((err) => {
        console.error('[AUTH] Failed to initialize native SocialLogin:', err);
      });
    }
  }, []);

  const refreshProfile = async () => {
    if (user) {
      const p = await dbService.getUser(user.uid);
      if (p) {
        setProfile(p as UserProfile);
      }
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const p = await dbService.getUser(u.uid);
        if (p) {
          setProfile(p as UserProfile);
        } else {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signIn = async () => {
    if (Capacitor.isNativePlatform()) {
      console.log('[AUTH] Starting Google sign-in (Native Android/iOS)');
      try {
        await SocialLogin.initialize({
          google: {
            webClientId: GOOGLE_WEB_CLIENT_ID,
            mode: 'online',
          }
        });
      } catch (initErr) {
        console.warn('[AUTH] SocialLogin.initialize warning:', initErr);
      }

      const loginRes = await SocialLogin.login({
        provider: 'google',
        options: {
          scopes: ['email', 'profile'],
        }
      });

      console.log('[AUTH] Native Google sign-in response received');
      const idToken = (loginRes.result as any)?.idToken;

      if (!idToken) {
        throw new Error('Google sign-in was cancelled or returned no ID token.');
      }

      console.log('[AUTH] Creating Firebase credential from Google ID token');
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
      console.log('[AUTH] Firebase signInWithCredential completed successfully');
    } else {
      console.log('[AUTH] Starting Google sign-in (Web/Desktop Popup)');
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      console.log('[AUTH] Web signInWithPopup completed successfully');
    }
  };

  const logOut = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await SocialLogin.logout({ provider: 'google' });
      } catch (err) {
        console.warn('[AUTH] Native Google logout warning (ignored):', err);
      }
    }
    await signOut(auth);
  };

  const hasRole = (roles: UserRole[]) => {
    if (!profile || !profile.roles) return false;
    return profile.roles.some(r => roles.includes(r as UserRole)) || profile.roles.includes(UserRole.ADMIN);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, logOut, hasRole, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
