import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DEFAULT_CATEGORIES, CategoryConfig, CategoryAttribute } from '../constants/categories';

export function useCategories() {
  const [categories, setCategories] = useState<CategoryConfig[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesCollection = collection(db, 'categories');
        const categoriesSnapshot = await getDocs(categoriesCollection);
        
        const fetchedCategories = categoriesSnapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        } as CategoryConfig));

        // Merge fetched categories with default categories
        const mergedCategories = [...DEFAULT_CATEGORIES, ...fetchedCategories.filter(
          fc => !DEFAULT_CATEGORIES.some(dc => dc.slug === fc.slug)
        )];

        setCategories(mergedCategories);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch categories'));
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const createCategory = async (newCategory: CategoryConfig) => {
    try {
      // Validate category
      if (!newCategory.slug || !newCategory.name) {
        throw new Error('Category must have a slug and name');
      }

      // Check if category already exists
      if (categories.some(cat => cat.slug === newCategory.slug)) {
        throw new Error('Category with this slug already exists');
      }

      // Prepare category for Firestore
      const categoryToSave = {
        ...newCategory,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Remove id if present to prevent overwriting
      delete categoryToSave.id;

      // Add to Firestore
      const categoriesCollection = collection(db, 'categories');
      const docRef = await addDoc(categoriesCollection, categoryToSave);

      // Update local state
      const savedCategory: CategoryConfig = {
        ...newCategory,
        id: docRef.id
      };

      setCategories(prev => [...prev, savedCategory]);

      return docRef.id;
    } catch (err) {
      console.error('Error creating category:', err);
      throw err;
    }
  };

  const updateCategory = async (categoryId: string, updates: Partial<CategoryConfig>) => {
    try {
      if (!categoryId) {
        throw new Error('Category ID is required');
      }

      const categoryDoc = doc(db, 'categories', categoryId);
      await updateDoc(categoryDoc, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      // Update local state
      setCategories(prev => prev.map(cat => 
        cat.id === categoryId ? { ...cat, ...updates, updatedAt: new Date().toISOString() } : cat
      ));
    } catch (err) {
      console.error('Error updating category:', err);
      throw err;
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      const categoryDoc = doc(db, 'categories', categoryId);
      await deleteDoc(categoryDoc);

      // Update local state
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    } catch (err) {
      console.error('Error deleting category:', err);
      throw err;
    }
  };

  const addCategoryAttribute = async (
    categoryId: string, 
    newAttribute: CategoryAttribute
  ) => {
    try {
      const categoryDoc = doc(db, 'categories', categoryId);
      
      // Fetch current category
      const currentCategory = categories.find(cat => cat.id === categoryId);
      if (!currentCategory) {
        throw new Error('Category not found');
      }

      // Prepare updated attributes
      const updatedAttributes = {
        fields: [
          ...(currentCategory.attributes?.fields || []),
          newAttribute
        ]
      };

      // Update Firestore
      await updateDoc(categoryDoc, { 
        attributes: updatedAttributes,
        updatedAt: serverTimestamp()
      });

      // Update local state
      setCategories(prev => prev.map(cat => 
        cat.id === categoryId 
          ? { 
              ...cat, 
              attributes: updatedAttributes,
              updatedAt: new Date().toISOString() 
            } 
          : cat
      ));
    } catch (err) {
      console.error('Error adding category attribute:', err);
      throw err;
    }
  };

  const updateCategoryAttribute = async (
    categoryId: string,
    attributeIndex: number,
    updates: Partial<CategoryAttribute>
  ) => {
    try {
      const categoryDocRef = doc(db, 'categories', categoryId);
      const currentCategory = categories.find(cat => cat.id === categoryId);

      if (!currentCategory || !currentCategory.attributes?.fields) {
        throw new Error('Category or attributes not found');
      }

      const updatedFields = [...currentCategory.attributes.fields];
      updatedFields[attributeIndex] = { ...updatedFields[attributeIndex], ...updates };

      await updateDoc(categoryDocRef, {
        attributes: { fields: updatedFields },
        updatedAt: serverTimestamp()
      });

      setCategories(prev => prev.map(cat =>
        cat.id === categoryId
          ? { ...cat, attributes: { fields: updatedFields }, updatedAt: new Date().toISOString() }
          : cat
      ));
    } catch (err) {
      console.error('Error updating category attribute:', err);
      throw err;
    }
  };

  const deleteCategoryAttribute = async (
    categoryId: string,
    attributeIndex: number
  ) => {
    try {
      const categoryDocRef = doc(db, 'categories', categoryId);
      const currentCategory = categories.find(cat => cat.id === categoryId);

      if (!currentCategory || !currentCategory.attributes?.fields) {
        throw new Error('Category or attributes not found');
      }

      const updatedFields = currentCategory.attributes.fields.filter(
        (_, index) => index !== attributeIndex
      );

      await updateDoc(categoryDocRef, {
        attributes: { fields: updatedFields },
        updatedAt: serverTimestamp()
      });

      setCategories(prev => prev.map(cat =>
        cat.id === categoryId
          ? { ...cat, attributes: { fields: updatedFields }, updatedAt: new Date().toISOString() }
          : cat
      ));
    } catch (err) {
      console.error('Error deleting category attribute:', err);
      throw err;
    }
  };

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    addCategoryAttribute,
    updateCategoryAttribute,
    deleteCategoryAttribute
  };
}
