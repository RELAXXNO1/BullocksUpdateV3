import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types/product';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsCollection = collection(db, 'products');
        const productsSnapshot = await getDocs(productsCollection);
        const productsList = productsSnapshot.docs.map(docSnap => ({
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
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
}
