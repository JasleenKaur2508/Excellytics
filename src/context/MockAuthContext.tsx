import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth } from '@/config/firebase';
import { 
  onAuthStateChanged, 
  signOut, 
  updateProfile, 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';

export type AuthedUser = {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
};

type AuthContextValue = {
  user: AuthedUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const MockAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setUser({
          uid: fbUser.uid,
          email: fbUser.email || '',
          displayName: fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : ''),
          photoURL: fbUser.photoURL || undefined,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateFirebaseProfile(userCredential.user, {
        displayName
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useMockAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useMockAuth must be used within a MockAuthProvider');
    }
  return context;
};
