import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  User, 
  signOut 
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { dbService } from '../services/db';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const p = await dbService.getUser(u.uid);
        if (p) {
          setProfile(p as UserProfile);
        } else {
          // New user logic will be handled in a dedicated setup page or automatically
          // For the first user (admin), we can auto-create if email matches
          if (u.email === 'sonalisjs37@gmail.com') {
            const newProfile = {
              uid: u.uid,
              name: u.displayName || 'Admin',
              email: u.email,
              roles: [UserRole.ADMIN],
              prayerCellIds: [],
              createdAt: new Date().toISOString()
            };
            await dbService.createUser(u.uid, newProfile);
            setProfile(newProfile as UserProfile);
          }
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logOut = async () => {
    await signOut(auth);
  };

  const hasRole = (roles: UserRole[]) => {
    if (!profile) return false;
    return profile.roles.some(r => roles.includes(r as UserRole)) || profile.roles.includes(UserRole.ADMIN);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, logOut, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
