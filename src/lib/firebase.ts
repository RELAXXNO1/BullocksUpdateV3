import { initializeApp, getApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword as firebaseSignIn, 
  signOut as firebaseSignOut, 
  createUserWithEmailAndPassword as firebaseCreateUser, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection as firestoreCollection, 
  doc, 
  getDoc, 
  setDoc 
} from 'firebase/firestore';
import { 
  getStorage, 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL,
  deleteObject  
} from 'firebase/storage';
import { getAnalytics, logEvent } from 'firebase/analytics';

// Validate environment variables
const validateEnvVar = (varName: string): string => {
  const value = import.meta.env[varName];
  if (!value) {
    console.error(`❌ Missing environment variable: ${varName}`);
    throw new Error(`Missing required environment variable: ${varName}`);
  }
  return value;
};

// Secure Firebase configuration
const firebaseConfig = {
  apiKey: validateEnvVar('VITE_FIREBASE_API_KEY'),
  authDomain: validateEnvVar('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: validateEnvVar('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: validateEnvVar('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: validateEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: validateEnvVar('VITE_FIREBASE_APP_ID'),
  measurementId: validateEnvVar('VITE_FIREBASE_MEASUREMENT_ID')
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);
const googleProvider = new GoogleAuthProvider();

// Secure admin configuration
export const ADMIN_CONFIG = {
  email: import.meta.env.VITE_ADMIN_EMAIL || '',
  initialPassword: import.meta.env.VITE_ADMIN_INITIAL_PASSWORD || ''
};

// Expose Firebase methods with renamed imports to avoid unused variable warnings
export const signInWithEmailAndPassword = firebaseSignIn;
export const signOut = firebaseSignOut;
export const createUserWithEmailAndPassword = firebaseCreateUser;
export const collection = firestoreCollection;
export const uploadStorageRef = storageRef;

// Expose storage upload and download functions
export const uploadStorageBytes = uploadBytes;
export const getStorageDownloadURL = getDownloadURL;
export const deleteStorageObject = deleteObject;

// Analytics event tracking
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  logEvent(analytics, eventName, params);
};

// Check if user is admin
export async function checkAdminStatus(uid: string): Promise<boolean> {
  try {
    console.log('🔍 Checking Admin Status', { 
      uid, 
      expectedAdminEmail: ADMIN_CONFIG.email 
    });

    // Validate input
    if (!uid) {
      console.error('❌ Invalid UID provided');
      return false;
    }

    // Reference to admin document
    const adminRef = doc(db, 'admins', uid);
    
    // Fetch admin document with error handling
    try {
      const adminDoc = await getDoc(adminRef);

      if (adminDoc.exists()) {
        const adminData = adminDoc.data();
        console.log('✅ Admin Document Found', {
          documentEmail: adminData.email,
          configEmail: ADMIN_CONFIG.email,
          role: adminData.role,
          active: adminData.active
        });

        // More flexible admin validation
        const isValidAdmin = !!(
          adminData && 
          adminData.role === 'admin' && 
          adminData.active === true
        );

        // Log detailed validation reasons
        if (!isValidAdmin) {
          console.warn('⚠️ Admin Validation Failed', {
            roleCheck: adminData.role === 'admin',
            activeCheck: adminData.active === true
          });
        }

        return isValidAdmin;
      } else {
        console.warn('⚠️ No Admin Document Found', { 
          uid, 
          expectedAdminEmail: ADMIN_CONFIG.email 
        });
        return false;
      }
    } catch (fetchError) {
      console.error('❌ Error Fetching Admin Document', {
        error: fetchError,
        uid: uid
      });
      return false;
    }
  } catch (error) {
    console.error('❌ Critical Error in Admin Status Check', error);
    return false;
  }
}

// Initialize admin
export async function initializeAdmin() {
  try {
    console.log('🔐 DETAILED ADMIN INITIALIZATION START');
    
    // Comprehensive logging of current authentication state
    console.log('🕵️ Current Auth State:', {
      currentUser: {
        uid: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified
      },
      expectedAdminEmail: ADMIN_CONFIG.email
    });

    // Validate current user
    if (!auth.currentUser) {
      console.error('❌ NO AUTHENTICATED USER');
      throw new Error('No authenticated user');
    }

    // Strict email validation
    if (auth.currentUser.email !== ADMIN_CONFIG.email) {
      console.error('❌ EMAIL MISMATCH', {
        currentEmail: auth.currentUser.email,
        expectedEmail: ADMIN_CONFIG.email
      });
      throw new Error('Unauthorized admin access');
    }

    // Reference to admin document
    const adminRef = doc(db, 'admins', auth.currentUser.uid);
    
    // Attempt to read existing admin document
    const adminDoc = await getDoc(adminRef);

    // Detailed logging of existing admin document
    if (adminDoc.exists()) {
      const existingAdminData = adminDoc.data();
      console.log('🔍 Existing Admin Document Found:', {
        uid: existingAdminData.uid,
        email: existingAdminData.email,
        role: existingAdminData.role,
        active: existingAdminData.active
      });

      // Validate existing admin document
      if (
        existingAdminData.email === auth.currentUser.email &&
        existingAdminData.role === 'admin'
      ) {
        return true;
      }
    }

    // Prepare admin document data
    const adminDocData = {
      uid: auth.currentUser.uid,
      email: auth.currentUser.email,
      role: 'admin',
      active: true,
      permissions: {
        canAddProducts: true,
        canEditProducts: true,
        canDeleteProducts: true,
        canManageUsers: true
      },
      metadata: {
        createdAt: adminDoc.exists() 
          ? adminDoc.data()?.metadata?.createdAt || new Date().toISOString()
          : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      },
      profile: {
        displayName: auth.currentUser.displayName,
        photoURL: auth.currentUser.photoURL
      }
    };

    // Set or update the admin document
    await setDoc(adminRef, adminDocData, { merge: true });

    console.log('✅ ADMIN DOCUMENT CREATED/UPDATED SUCCESSFULLY', {
      uid: auth.currentUser.uid,
      email: auth.currentUser.email
    });

    return true;
  } catch (error) {
    console.error('❌ ADMIN INITIALIZATION ERROR', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error Details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }

    return false;
  }
}

export { app, auth, db, storage, googleProvider, analytics };