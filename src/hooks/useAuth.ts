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
import { ADMIN_CONFIG } from '../config/admin';

interface AuthUser extends FirebaseUser {
  isAdmin: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Check admin status
          const adminDocRef = doc(db, 'admins', firebaseUser.uid);
          const adminDocSnap = await getDoc(adminDocRef);
          const isAdmin = adminDocSnap.exists() && adminDocSnap.data()?.active === true;

          // Set user with admin status
          setUser({
            ...firebaseUser,
            isAdmin
          } as AuthUser);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setUser({
            ...firebaseUser,
            isAdmin: false
          } as AuthUser);
        }
      } else {
        setUser(null);
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
        lastLogin: new Date().toISOString()
      }, { merge: true });

      // Update local user state
      const authUser = {
        ...firebaseUser,
        isAdmin
      } as AuthUser;

      setUser(authUser);
      return authUser;

    } catch (error) {
      console.error('Login Error:', error);
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
        createdAt: new Date().toISOString()
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
    login, 
    logout, 
    signup,
    deleteAccount
  };
}
