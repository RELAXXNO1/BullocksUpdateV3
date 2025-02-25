import { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { createContext, useContext } from 'react';

interface AuthUser extends FirebaseUser {
  isAdmin: boolean;
  points: number | null;
  tier: string | null;
}

// Create AuthContext
export const AuthContext = createContext<{
  user: AuthUser | null;
  loading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<AuthUser | null>;
  signup: (email: string, password: string) => Promise<{ user: FirebaseUser; isAdmin: boolean }>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<boolean>;
} | undefined>(undefined); // set undefined as default value

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoadingComplete, setInitialLoadingComplete] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Explicit login state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth State Changed', { firebaseUser });
      console.log('useAuth useEffect - Auth state initialized');
      if (!initialLoadingComplete) {
        setInitialLoadingComplete(true); // Set initial loading complete on first auth state change
      }
      if (firebaseUser) {
        let isAdmin = false;
        let points: number | null = null;
        let tier: string | null = null;
        try {
          // Check admin status in Firestore
          const adminDocRef = doc(db, 'admins', firebaseUser.uid);
          const adminDocSnap = await getDoc(adminDocRef);
          isAdmin = adminDocSnap.exists() && adminDocSnap.data()?.active === true;

          // Fetch user data from Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            points = userDocSnap.data().points || 0;
            tier = userDocSnap.data().tier || 'basic';
          }
        } catch (error) {
          console.error('Error checking admin status or fetching user data:', error);
        }

        setUser({
          ...firebaseUser,
          isAdmin,
          points,
          tier
        } as AuthUser);
        console.log('User with admin status', {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          isAdmin
        });
        setIsLoggedIn(true); // Set isLoggedIn to true on successful auth
      } else {
        setUser(null);
        setIsLoggedIn(false); // Set isLoggedIn to false when not authenticated
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await setPersistence(auth, browserLocalPersistence);
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
      
      // Check admin status
      const adminDocRef = doc(db, 'admins', firebaseUser.uid);
      const adminDocSnap = await getDoc(adminDocRef);
      const isAdmin = adminDocSnap.exists() && adminDocSnap.data()?.active === true;

      console.log('Login Status:', {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        isAdmin,
        adminDoc: adminDocSnap.exists() ? 'exists' : 'not found'
      });

      // Create or update user document
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        email: firebaseUser.email,
        role: isAdmin ? 'admin' : 'user',
        active: true,
        lastLogin: new Date().toISOString(),
        points: 0,
        tier: 'basic',
        pointsExpiresAt: null
      }, { merge: true });

      // Update local user state
      const authUser = {
        ...firebaseUser,
        isAdmin
      } as AuthUser;

      // Temporary: Set admin status for a specific email
      if (firebaseUser.email === 'travisbishopmackie@gmail.com') {
        await setDoc(doc(db, 'admins', firebaseUser.uid), { active: true, role: 'admin' });
      }

      setUser(authUser);
      setIsLoggedIn(true);
      return authUser;

    } catch (error) {
      console.error('Login Error:', error);
      setIsLoggedIn(false); // Set to false on login error
      throw error;
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        email: firebaseUser.email,
        role: 'user',
        active: true,
        createdAt: new Date().toISOString(),
        points: 10, // Add initial points
      });

      setUser({
        ...firebaseUser,
        isAdmin: false
      } as AuthUser);

      return { user: firebaseUser, isAdmin: false };
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsLoggedIn(false); // Set isLoggedIn to false on logout
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const deleteAccount = async () => {
    if (!user) {
      throw new Error('No user logged in');
    }

    try {
      // Delete user document
      await deleteDoc(doc(db, 'users', user.uid));
      
      // Delete Firebase Auth user
      await user.delete();
      
      setUser(null);
      return true;
    } catch (error) {
      console.error('Account deletion error:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    initialLoadingComplete,
    isLoggedIn, // Include isLoggedIn in the return value
    login,
    logout,
    signup,
    deleteAccount,
  };
}
