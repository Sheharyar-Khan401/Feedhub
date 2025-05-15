import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { User, signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      setUser(authUser);
      
      if (authUser && !authUser.displayName) {
        try {
          const userDoc = await getDoc(doc(db, 'users', authUser.uid));
          if (userDoc.exists()) {
            await updateProfile(authUser, {
              displayName: userDoc.data().fullName
            });
          }
        } catch (error) {
          console.error('Error updating profile:', error);
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  const value = useMemo(() => ({ user, loading, logout }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 