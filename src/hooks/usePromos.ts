import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Promo } from '../types/promo';

export function usePromos() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const promoCollection = collection(db, 'promos');
    const q = query(promoCollection);
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const promoList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          startDate: doc.data().startDate?.toDate(),
          endDate: doc.data().endDate?.toDate(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        } as Promo));
        setPromos(promoList);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching promos:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const createPromo = async (promoData: Omit<Promo, 'id'>) => {
    try {
      const promoCollection = collection(db, 'promos');
      const docRef = await addDoc(promoCollection, {
        ...promoData,
        startDate: Timestamp.fromDate(promoData.startDate),
        endDate: Timestamp.fromDate(promoData.endDate),
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      });
      return docRef.id;
    } catch (err) {
      console.error('Error creating promo:', err);
      throw err;
    }
  };

  const updatePromo = async (id: string, updates: Partial<Promo>) => {
    try {
      const promoRef = doc(db, 'promos', id);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date())
      };
      
      if (updates.startDate) {
        updateData.startDate = Timestamp.fromDate(updates.startDate);
      }
      if (updates.endDate) {
        updateData.endDate = Timestamp.fromDate(updates.endDate);
      }
      
      await updateDoc(promoRef, updateData);
    } catch (err) {
      console.error('Error updating promo:', err);
      throw err;
    }
  };

  const deletePromo = async (id: string) => {
    try {
      const promoRef = doc(db, 'promos', id);
      await deleteDoc(promoRef);
    } catch (err) {
      console.error('Error deleting promo:', err);
      throw err;
    }
  };

  return {
    promos,
    loading,
    error,
    createPromo,
    updatePromo,
    deletePromo
  };
}