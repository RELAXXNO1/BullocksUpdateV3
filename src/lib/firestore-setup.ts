import { db } from './firebase';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { DEFAULT_CATEGORIES } from '../constants/categories';

export async function initializeFirestoreCollections() {
  try {
    // Initialize Categories Collection
    const categoriesRef = collection(db, 'categories');
    const existingCategories = await getDocs(categoriesRef);

    if (existingCategories.empty) {
      console.log('🔧 Initializing Categories Collection');
      for (const category of DEFAULT_CATEGORIES) {
        await setDoc(doc(categoriesRef, category.slug), {
          ...category,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      console.log('✅ Categories Collection Initialized');
    }

    // Initialize Products Collection with Placeholder
    const productsRef = collection(db, 'products');
    const existingProducts = await getDocs(productsRef);

    if (existingProducts.empty) {
      console.log('🔧 Adding Initial Product Placeholders');
      const placeholderProducts = [
        {
          category: 'Pre Rolls',
          name: 'Sample Pre-Roll',
          description: 'A placeholder pre-roll product',
          price: 9.99,
          isVisible: true,
          images: ['/placeholder-preroll.jpg'],
          createdAt: new Date().toISOString()
        },
        {
          category: 'Mushrooms',
          name: 'Sample Mushroom Product',
          description: 'A placeholder mushroom product',
          price: 14.99,
          isVisible: true,
          images: ['/placeholder-mushroom.jpg'],
          createdAt: new Date().toISOString()
        },
        {
          category: 'Lighters And Torches',
          name: 'Sample Lighter',
          description: 'A placeholder lighter product',
          price: 4.99,
          isVisible: true,
          images: ['/placeholder-lighter.jpg'],
          createdAt: new Date().toISOString()
        }
      ];

      for (const product of placeholderProducts) {
        await setDoc(doc(productsRef), product);
      }
      console.log('✅ Product Placeholders Added');
    }

    console.log('🚀 Firestore Collections Initialized Successfully');
  } catch (error) {
    console.error('❌ Firestore Initialization Error:', error);
  }
}

// Call this function during app initialization or admin setup
export default initializeFirestoreCollections;
