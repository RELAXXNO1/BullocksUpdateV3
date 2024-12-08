import { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  User as FirebaseUser,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, ADMIN_CONFIG, checkAdminStatus, initializeAdmin } from '../lib/firebase';

interface AuthUser extends FirebaseUser {
  isAdmin: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const isAdmin = await checkAdminStatus(firebaseUser.uid);
        setUser({
          ...firebaseUser,
          isAdmin
        });
        
        // Initialize admin if the user is an admin
        if (isAdmin) {
          await initializeAdmin();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email: string, password: string) => {
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        email: firebaseUser.email,
        role: 'user',
        createdAt: new Date().toISOString()
      });
      
      return { 
        user: {
          ...firebaseUser,
          isAdmin: false
        }
      };
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
      
      // Fetch admin document to validate admin status
      const adminDocRef = doc(db, 'admins', firebaseUser.uid);
      const adminDocSnap = await getDoc(adminDocRef);

      // Additional admin validation using admin document
      const isAdmin = adminDocSnap.exists() && 
        adminDocSnap.data()?.email === firebaseUser.email &&
        (await checkAdminStatus(firebaseUser.uid));

      console.log('🔐 Login Admin Status:', isAdmin, {
        configEmail: ADMIN_CONFIG.email,
        userEmail: firebaseUser.email,
        adminDocExists: adminDocSnap.exists()
      });

      // Create or update user document with admin status
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        email: firebaseUser.email,
        role: isAdmin ? 'admin' : 'user',
        active: true,
        lastLogin: new Date().toISOString()
      }, { merge: true });

      // Set user with admin status
      const authUser: AuthUser = {
        ...firebaseUser,
        isAdmin
      };
      setUser(authUser);

      // Initialize admin if the user is an admin
      if (isAdmin) {
        await initializeAdmin();
      }

      return authUser;
    } catch (error) {
      console.error('🚨 Login Error:', error);
      
      // More detailed error handling
      if (error instanceof Error) {
        switch (error.message) {
          case 'Missing or insufficient permissions':
            console.error('🔒 Permissions Error: Check Firestore security rules');
            throw new Error('System configuration error. Please contact support.');
          default:
            throw error;
        }
      }
      
      throw error;
    }
  };

  const logout = () => signOut(auth);

  return { user, loading, login, logout, signup };
}