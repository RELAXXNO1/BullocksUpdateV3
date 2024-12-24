import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function addAdminUser(uid: string) {
  try {
    await setDoc(doc(db, 'admins', uid), {
      active: true,
      role: 'admin'
    });
    console.log(`Admin user added with UID: ${uid}`);
    return true;
  } catch (error) {
    console.error('Error adding admin user:', error);
    return false;
  }
}
