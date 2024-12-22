import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { checkAdminStatus } from './firebase';

export async function initializeFirestoreCollections() {
  try {
    console.log('🔧 Starting Firestore initialization...');
    
    // Wait a bit to ensure Firebase is fully initialized
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if user has admin access before proceeding
    const auth = (await import('./firebase')).auth;
    if (!auth.currentUser) {
      console.log('No user logged in, skipping collection initialization');
      return;
    }

    const isAdmin = await checkAdminStatus(auth.currentUser.uid);
    if (!isAdmin) {
      console.log('User is not admin, skipping collection initialization');
      return;
    }

    // Initialize Categories Collection
    for (const category of DEFAULT_CATEGORIES) {
      const categoryRef = doc(db, 'categories', category.slug);
      const existingDoc = await getDoc(categoryRef);
      
      if (!existingDoc.exists()) {
        console.log(`Creating category: ${category.name}`);
        await setDoc(categoryRef, {
          ...category,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }

    // Initialize required collections
    const collections = ['products', 'photos', 'analytics_events', 'promos'];
    for (const collectionName of collections) {
      const collectionRef = collection(db, collectionName);
      const initialDocRef = doc(collectionRef, 'initial_document');
      const existingDoc = await getDoc(initialDocRef);
      
      if (!existingDoc.exists()) {
        console.log(`Initializing collection: ${collectionName}`);
        await setDoc(initialDocRef, {
          created_at: new Date().toISOString(),
          initialized: true
        });
      }
    }

    // Ensure admins collection exists but don't create any admin documents
    const adminsRef = collection(db, 'admins');
    const initialAdminDocRef = doc(adminsRef, 'initial_document');
    const existingAdminDoc = await getDoc(initialAdminDocRef);
    
    if (!existingAdminDoc.exists()) {
      console.log('Initializing admins collection');
      await setDoc(initialAdminDocRef, {
        created_at: new Date().toISOString(),
        initialized: true,
        note: 'Admin documents should only be created through secure backend processes'
      });
    }

    // Success message with timestamp
    console.log('✅ Firestore collections initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Firestore collections:', error);
    throw error;
  }
}