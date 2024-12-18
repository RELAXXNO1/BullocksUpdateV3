import { ref, listAll, getDownloadURL, uploadBytes } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from './firebase';
import { v4 as uuidv4 } from 'uuid';

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
    const storageRef = ref(storage, `photos/${category}/${uniqueFileName}`);

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

    // Fetch images from Firebase Storage for all categories
    const storageRef = ref(storage, `photos/${category}`);
    console.log('Fetching images from Firebase Storage:', storageRef.fullPath);
    const res = await listAll(storageRef);
    console.log('Firebase Storage listAll result:', res);
    
    const images = await Promise.all(
        res.items.map(async (item) => {
            const downloadURL = await getDownloadURL(item);
            const id = item.name;
            console.log('Fetched image from Firebase Storage:', {
                id: id,
                downloadURL: downloadURL,
                category: category,
            });
            return {
                id: id,
                downloadURL: downloadURL,
                category: category,
            };
        })
    );
    
    console.log('Images fetched from Firebase Storage:', images);
    return images;
  } catch (error) {
    console.error('Error fetching photobank images:', error);
    throw error;
  }
};
