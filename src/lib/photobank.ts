import { ref, listAll, getDownloadURL, uploadBytes } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { storage, db } from './firebase';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_CATEGORIES } from '../constants/categories';

interface PhotoUploadOptions {
  file: File;
  category?: string;
  tags?: string[];
}

export const uploadToPhotobank = async ({
  file, 
  category = 'Uncategorized', 
  tags = []
}: PhotoUploadOptions) => {
  try {
    // Validate file
    if (!file || file.size > 10 * 1024 * 1024) {
      throw new Error('File is too large. Maximum size is 10MB.');
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    
    // Create storage reference
    const storageRef = ref(storage, `photobank/${category}/${uniqueFileName}`);

    // Upload file to Firebase Storage
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Create Firestore document
    const photosRef = collection(db, 'photos');
    await addDoc(photosRef, {
      fileName: uniqueFileName,
      originalName: file.name,
      storagePath: snapshot.ref.fullPath,
      downloadURL,
      category,
      tags,
      fileType: file.type,
      fileSize: file.size,
      isVisible: true,
      createdAt: serverTimestamp(),
      uploadedBy: 'admin'
    });

    return {
      fileName: uniqueFileName,
      downloadURL,
      category
    };
  } catch (error) {
    console.error('Error uploading to photobank:', error);
    throw error;
  }
};

export const getPhotobankImages = async (category?: string) => {
  try {
    console.log('getPhotobankImages called with category:', category);

    if (!category) {
      console.log('No category provided, returning empty array.');
      return [];
    }

    const isDefaultCategory = DEFAULT_CATEGORIES.some(cat => cat.slug === category);
    console.log('Is default category:', isDefaultCategory);

    if (isDefaultCategory) {
      // Fetch images from Firebase Storage for default categories
      const storageRef = ref(storage, `photobank/${category}`);
        console.log('Fetching images from Firebase Storage:', storageRef.fullPath);
        const res = await listAll(storageRef);
        console.log('Firebase Storage listAll result:', res);
        
        const images = await Promise.all(
            res.items.map(async (item) => {
                const downloadURL = await getDownloadURL(item);
                console.log('Fetched image from Firebase Storage:', {
                    id: item.name,
                    downloadURL: downloadURL,
                    category: category,
                });
                return {
                    id: item.name,
                    downloadURL: downloadURL,
                    category: category,
                };
            })
        );
        
        console.log('Images fetched from Firebase Storage:', images);
        return images;
    } else {
      // Fetch images from Firestore for custom categories
      const photosRef = collection(db, 'photos');
      console.log('Fetching images from Firestore:', { category });
      const q = query(photosRef, where('category', '==', category), where('isVisible', '==', true));
      const querySnapshot = await getDocs(q);
      const images = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Images fetched from Firestore:', images);
      return images;
    }
  } catch (error) {
    console.error('Error fetching photobank images:', error);
    throw error;
  }
};
