import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DEFAULT_CATEGORIES } from '../config/categories';
import type { Category } from '../types/product';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'categories'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        // Initialize default categories if none exist
        DEFAULT_CATEGORIES.forEach(category => {
          addCategory(
            category.name,
            category.description,
            category.attributes
          );
        });
      }

      const categoryData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      setCategories(categoryData);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const addCategory = async (name: string, description?: string, attributes?: CategoryAttributes) => {
    try {
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      const newCategory = {
        name,
        slug,
        description,
        attributes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'categories'), newCategory);
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  };

  const updateCategory = async (id: string, name: string, description?: string) => {
    try {
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      await updateDoc(doc(db, 'categories', id), {
        name,
        slug,
        description,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory
  };
}