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
        productIds: promoData.productIds || [], // Ensure productIds is included, even if empty
        startDate: Timestamp.fromDate(promoData.startDate as Date), // Explicitly cast to Date
        endDate: Timestamp.fromDate(promoData.endDate as Date), // Explicitly cast to Date
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      });
      
      // Update associated products with promoId
      if (promoData.productIds && promoData.productIds.length > 0) {
        promoData.productIds.forEach(async productId => {
          const productRef = doc(db, 'products', productId);
          await updateDoc(productRef, {
            promoId: docRef.id // Add promoId to product document
          });
        });
      }

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
        productIds: updates.productIds || [], // Ensure productIds is included, even if empty
        updatedAt: Timestamp.fromDate(new Date())
      };

      if (updates.startDate) {
        updateData.startDate = updates.startDate;
      }
      if (updates.endDate) {
        updateData.endDate = updates.endDate;
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
