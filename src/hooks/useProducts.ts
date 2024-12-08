import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc as firestoreUpdateDoc, 
  deleteDoc, 
  doc, 
  getDoc 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, auth } from '../lib/firebase';
import { checkAdminStatus } from '../lib/firebase';
import type { Product, ProductFormData } from '../types/product';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productData);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const ensureCollectionExists = async () => {
    try {
      // Validate admin status before collection creation
      if (!auth.currentUser) {
        throw new Error('No authenticated user');
      }

      const isAdmin = await checkAdminStatus(auth.currentUser.uid);
      if (!isAdmin) {
        throw new Error('User is not an admin');
      }

      // Attempt to add a dummy document to ensure the collection exists
      const collectionRef = collection(db, 'products');
      await addDoc(collectionRef, { 
        _systemInitialized: true, 
        createdAt: new Date().toISOString(),
        createdBy: auth.currentUser.uid
      });
      console.log('✅ Ensured products collection exists');
    } catch (error) {
      console.error('❌ Collection Initialization Error:', error);
      
      // More detailed error handling
      if (error instanceof Error) {
        if (error.message.includes('permission-denied')) {
          throw new Error('You do not have permission to create collections. Please contact an administrator.');
        }
      }
      
      throw error;
    }
  };

  // Utility function to upload image to Firebase Storage
  const uploadImageToFirebase = async (imageFile: File): Promise<string> => {
    try {
      // Validate admin status before upload
      if (!auth.currentUser) {
        throw new Error('No authenticated user');
      }

      const isAdmin = await checkAdminStatus(auth.currentUser.uid);
      if (!isAdmin) {
        throw new Error('User is not an admin');
      }

      // Generate a unique filename with more controlled format
      const sanitizedFileName = imageFile.name
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .toLowerCase();
      const filename = `products/${Date.now()}_${auth.currentUser.uid}_${sanitizedFileName}`;
      const imageRef = ref(storage, filename);

      // Upload the original image
      const uploadResult = await uploadBytes(imageRef, imageFile, {
        contentType: imageFile.type
      });
      
      // Get the download URL
      const downloadURL = await getDownloadURL(uploadResult.ref);
      
      console.log('🖼️ Image Uploaded Successfully:', {
        filename,
        downloadURL
      });

      return downloadURL;
    } catch (error) {
      console.error('❌ Image Upload Error:', error);
      
      // More detailed error handling
      if (error instanceof Error) {
        if (error.message.includes('unauthorized') || error.message.includes('permission')) {
          throw new Error('You do not have permission to upload images. Please contact an administrator.');
        }
      }
      
      throw new Error('Failed to upload image');
    }
  };

  const addProduct = async (productData: ProductFormData) => {
    try {
      console.log('🚀 ADD PRODUCT STARTED', {
        userData: {
          uid: auth.currentUser?.uid,
          email: auth.currentUser?.email
        },
        productData
      });
      
      if (!auth.currentUser) {
        console.error('❌ NO AUTHENTICATED USER');
        throw new Error('No authenticated user');
      }

      console.log('🔍 Checking admin status for user:', auth.currentUser.uid);
      const isAdmin = await checkAdminStatus(auth.currentUser.uid);
      console.log('🛡️ Admin Status:', isAdmin, 'User UID:', auth.currentUser.uid);
      
      // Ensure products collection exists before adding
      await ensureCollectionExists();
      
      // Upload image if provided
      let imageUrl = '';
      if (productData.imageFile) {
        imageUrl = await uploadImageToFirebase(productData.imageFile);
      }

      // Prepare product document
      const productDoc = {
        name: productData.name || '',
        description: productData.description || '',
        price: productData.price || 0,
        category: productData.category || '',
        imageUrl: imageUrl || productData.imageUrl || '',
        isVisible: productData.isVisible ?? true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        attributes: productData.attributes || {}
      };

      // Add product to Firestore
      const docRef = await addDoc(collection(db, 'products'), productDoc);
      console.log('✅ Product Added:', docRef.id);

      return {
        id: docRef.id,
        ...productDoc
      } as Product;
    } catch (error) {
      console.error('❌ Add Product Error:', error);
      throw error;
    }
  };

  const updateProduct = async (productId: string, productData: Partial<ProductFormData>) => {
    try {
      if (!auth.currentUser) {
        console.error('❌ NO AUTHENTICATED USER');
        throw new Error('No authenticated user');
      }

      console.log('🔍 Checking admin status for user:', auth.currentUser.uid);
      const isAdmin = await checkAdminStatus(auth.currentUser.uid);
      console.log('🛡️ Admin Status:', isAdmin, 'User UID:', auth.currentUser.uid);
      
      // Ensure products collection exists before updating
      await ensureCollectionExists();
      
      // Fetch existing product to merge with updates
      const productRef = doc(db, 'products', productId);
      const existingProductSnap = await getDoc(productRef);
      const existingProduct = existingProductSnap.data() as Product;

      // Upload new image if provided
      let imageUrl = productData.imageUrl || existingProduct.imageUrl;
      if (productData.imageFile) {
        // Delete existing image if it exists
        if (existingProduct.imageUrl) {
          try {
            const existingImageRef = ref(storage, existingProduct.imageUrl);
            await deleteObject(existingImageRef);
            console.log('🗑️ Deleted existing product image');
          } catch (deleteError) {
            console.warn('⚠️ Failed to delete existing image:', deleteError);
          }
        }

        // Upload new image
        imageUrl = await uploadImageToFirebase(productData.imageFile);
      }

      // Prepare update document
      const updatedProduct = {
        name: productData.name || existingProduct.name,
        description: productData.description || existingProduct.description,
        price: productData.price || existingProduct.price,
        category: productData.category || existingProduct.category,
        imageUrl: imageUrl,
        isVisible: productData.isVisible ?? existingProduct.isVisible,
        createdAt: existingProduct.createdAt, // Preserve original creation date
        updatedAt: new Date().toISOString(),
        attributes: {
          ...existingProduct.attributes,
          ...productData.attributes
        }
      };

      // Update product in Firestore
      await firestoreUpdateDoc(productRef, updatedProduct);
      console.log('✅ Product Updated:', productId);

      return {
        id: productId,
        ...updatedProduct
      } as Product;
    } catch (error) {
      console.error('❌ Update Product Error:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string, imageUrl: string) => {
    try {
      if (!auth.currentUser) {
        throw new Error('No authenticated user');
      }

      console.log('🔍 Checking admin status for user:', auth.currentUser.uid);
      const isAdmin = await checkAdminStatus(auth.currentUser.uid);
      console.log('🛡️ Admin Status:', isAdmin, 'User UID:', auth.currentUser.uid);

      if (imageUrl) {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      }
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct
  };
}