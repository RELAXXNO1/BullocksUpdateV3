import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
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

export async function submitPickupOrder(orderData: any) {
    try {
        const pickupOrdersRef = collection(db, 'pickupOrders');
        await addDoc(pickupOrdersRef, orderData);
        console.log('Pickup order submitted successfully');
        return true;
    } catch (error) {
        console.error('Error submitting pickup order:', error);
        return false;
    }
}
