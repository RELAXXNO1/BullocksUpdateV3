import { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types/product';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const productsCollection = collection(db, 'products');
    const q = query(productsCollection);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const productsList = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        } as Product));
        
        setProducts(productsList);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch products'));
        setLoading(false);
      }
    }, (err) => {
        console.error('Error listening to products:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch products'));
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { products, loading, error };
}
