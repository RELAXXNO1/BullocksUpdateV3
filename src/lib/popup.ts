import { db } from './firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { Popup } from '../types/popup';

const POPUPS_COLLECTION = 'popups';

export const createPopup = async (popup: Omit<Popup, 'id' | 'createdAt' | 'updatedAt'>): Promise<Popup> => {
  try {
    const now = Date.now();
    const docRef = await addDoc(collection(db, POPUPS_COLLECTION), {
      ...popup,
      createdAt: now,
      updatedAt: now,
    });
    return { id: docRef.id, ...popup, createdAt: now, updatedAt: now };
  } catch (e) {
    console.error("Error adding document: ", e);
    throw new Error("Failed to create popup.");
  }
};

export const getPopups = async (): Promise<Popup[]> => {
  try {
    const q = query(collection(db, POPUPS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Popup[];
  } catch (e) {
    console.error("Error getting documents: ", e);
    throw new Error("Failed to fetch popups.");
  }
};

export const updatePopup = async (id: string, updates: Partial<Omit<Popup, 'id' | 'createdAt'>>): Promise<void> => {
  try {
    const popupRef = doc(db, POPUPS_COLLECTION, id);
    await updateDoc(popupRef, {
      ...updates,
      updatedAt: Date.now(),
    });
  } catch (e) {
    console.error("Error updating document: ", e);
    throw new Error("Failed to update popup.");
  }
};

export const deletePopup = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, POPUPS_COLLECTION, id));
  } catch (e) {
    console.error("Error deleting document: ", e);
    throw new Error("Failed to delete popup.");
  }
};
