import { initializeApp, getApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword as firebaseSignIn, 
  signOut as firebaseSignOut, 
  createUserWithEmailAndPassword as firebaseCreateUser, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, logEvent } from 'firebase/analytics';

// Admin validation function
export async function checkAdminStatus(uid: string): Promise<boolean> {
  try {
    if (!uid) return false;
    const adminRef = doc(db, 'admins', uid);
    const adminDoc = await getDoc(adminRef);
    const adminData = adminDoc.data();
    return adminDoc.exists() && 
           adminData?.role === 'admin' && 
           adminData?.active === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// Environment variable validation
const validateEnvVar = (varName: string): string => {
  const value = import.meta.env[varName];
  if (!value) {
    console.error(`❌ Missing environment variable: ${varName}`);
    throw new Error(`Missing required environment variable: ${varName}`);
  }
  return value;
};

// Firebase configuration
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
const trackEvent = (eventName: string, params?: Record<string, any>) => {
  logEvent(analytics, eventName, params);
}

// Function to add an order to Firestore
export const addOrder = async (orderData: any) => {
  try {
    const ordersCollection = collection(db, 'orders');
    await addDoc(ordersCollection, orderData);
    console.log('Order added to Firestore');
  } catch (error) {
    console.error('Error adding order to Firestore:', error);
    throw error;
  }
};


export {
  app,
  auth,
  db,
  storage,
  analytics,
  googleProvider,
  trackEvent,
  firebaseSignIn as signInWithEmailAndPassword,
  firebaseSignOut as signOut,
  firebaseCreateUser as createUserWithEmailAndPassword
};
