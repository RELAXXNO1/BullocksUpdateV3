import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export interface PhotobankImage {
  id: string;
  base64?: string; // base64 might not always be present if we're just displaying from URL
  category: string;
  fileName: string;
  url: string; // Assuming images will have a URL for display
}

export const getPhotobankImages = async (category?: string): Promise<PhotobankImage[]> => {
  try {
    console.log('getPhotobankImages called with category:', category);

    if (!category) {
      console.log('No category provided, returning empty array.');
      return [];
    }

    const photosRef = collection(db, 'photos');
    const q = query(photosRef, where('category', '==', category), where('isVisible', '==', true));
    
    console.log('Executing Firestore query for photobank images.');
    const querySnapshot = await getDocs(q);
    
    const images = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        base64: data.base64 || '', // Ensure base64 is a string, default to empty
        category: data.category,
        fileName: data.fileName,
        url: data.url || '' // Ensure url is a string, default to empty
      } as PhotobankImage;
    });
    
    console.log('Images fetched from Firestore:', images);
    return images;
  } catch (error) {
    console.error('Error fetching photobank images:', error);
    throw error;
  }
};
