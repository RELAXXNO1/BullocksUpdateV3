import { doc, getDoc, DocumentSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { ADMIN_CONFIG } from '../config/admin';

interface AdminData {
  role: string;
  active: boolean;
  email: string;
}

async function validateAdminDoc(adminDoc: DocumentSnapshot): Promise<boolean> {
  if (!adminDoc.exists()) return false;
  const data = adminDoc.data() as AdminData;
  return data.role === 'admin' && data.active === true;
}

export async function checkAdminStatus(uid: string): Promise<boolean> {
  try {
    if (!uid) return false;
    const adminRef = doc(db, 'admins', uid);
    const adminDoc = await getDoc(adminRef);
    return validateAdminDoc(adminDoc);
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

export async function initializeAdmin(uid: string, email: string): Promise<boolean> {
  try {
    if (!uid || !email) return false;
    
    // Verify email matches admin config
    if (email !== ADMIN_CONFIG.email) {
      console.log('Email does not match admin config');
      return false;
    }

    const adminRef = doc(db, 'admins', uid);
    const adminDoc = await getDoc(adminRef);

    // Only initialize if admin doc doesn't exist
    if (!adminDoc.exists()) {
      await setDoc(adminRef, {
        email,
        role: 'admin',
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    return true;
  } catch (error) {
    console.error('Error initializing admin:', error);
    return false;
  }
}