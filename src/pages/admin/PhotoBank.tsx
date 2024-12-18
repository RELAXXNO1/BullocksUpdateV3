import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Trash2, ImageIcon, Link2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { BackButton } from '../../components/ui/BackButton';
import { auth, storage, db, checkAdminStatus } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, query as firestoreQuery, getDocs, doc, setDoc } from 'firebase/firestore';
import { DEFAULT_CATEGORIES } from '../../config/categories';
import { useNavigate } from 'react-router-dom';
import type { CategoryConfig } from '../../constants/categories';

const WATERMARK_LOGO_PATH = '/logos/black_logo_transparent_background_page-0001-removebg-preview.png';

interface Photo {
  fileName: string;
  storagePath: string;
  downloadURL: string;
  category: string;
  id: string;
}

export default function PhotoBank() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [showCategoryTooltip, setShowCategoryTooltip] = useState(false);
  const [fetchError, setFetchError] = useState<Error | null>(null);


  useEffect(() => {
    const fetchPhotos = async () => {
      if (!isAdmin) return;

      try {
        const photosRef = collection(db, 'photos');
        const photosQuery = firestoreQuery(photosRef);
        const snapshot = await getDocs(photosQuery);
        
        console.group('🖼️ Photobank Image Fetch');
        console.log('Total documents found:', snapshot.docs.length);

        const fetchedPhotos = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Photo Document:', {
            id: doc.id,
            fileName: data.fileName,
            downloadURL: data.downloadURL,
            category: data.category,
            isVisible: data.isVisible
          });
          return {
            id: doc.id,
            fileName: data.fileName, 
            storagePath: data.storagePath, 
            downloadURL: data.downloadURL,
            category: data.category
          };
        });

        console.log('Processed Photos:', fetchedPhotos);
        console.groupEnd();

        setPhotos(fetchedPhotos);
        setFetchError(null);
      } catch (error) {
        console.error('❌ Error fetching photos:', error);
        setPhotos([]);
        setFetchError(error instanceof Error ? error : new Error('Failed to fetch photos'));
      }
    };

    if (isAdmin) {
      fetchPhotos();
    }
  }, [isAdmin]);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        if (auth.currentUser) {
          const adminStatus = await checkAdminStatus(auth.currentUser.uid);
          setIsAdmin(adminStatus);

          // Ensure photos collection exists when admin is confirmed
          if (adminStatus) {
            try {
              const photosCollectionRef = collection(db, 'photos');
              const initialDocRef = doc(photosCollectionRef, 'initial_photo_collection');
              await setDoc(initialDocRef, {
                created_at: new Date().toISOString(),
                description: 'Initial photo collection'
              }, { merge: true });
              console.log('Ensured photos collection exists');
            } catch (collectionError) {
              console.error('Failed to ensure photos collection:', collectionError);
            }
          }
        }
      } catch (error) {
        console.error('Error checking admin status', error);
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, []);

  const addWatermarkToImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0, img.width, img.height);

        const logo = new Image();
        logo.crossOrigin = 'Anonymous';
        logo.onload = () => {
          const watermarkSize = Math.min(img.width * 0.1, 100);
          const padding = 10;

          const x = canvas.width - watermarkSize - padding;
          const y = canvas.height - watermarkSize - padding;

          ctx.globalAlpha = 0.5;
          ctx.drawImage(logo, x, y, watermarkSize, watermarkSize);
          ctx.globalAlpha = 1;

          canvas.toBlob((blob) => {
            if (blob) {
              const watermarkedFile = new File([blob], file.name, { 
                type: file.type 
              });
              resolve(watermarkedFile);
            } else {
              reject(new Error('Failed to create watermarked image'));
            }
          }, file.type);
        };

        logo.onerror = () => {
          console.error('Failed to load watermark logo:', WATERMARK_LOGO_PATH);
          reject(new Error('Failed to load watermark logo'));
        };
        logo.src = WATERMARK_LOGO_PATH;
      };

      img.onerror = () => reject(new Error('Failed to load original image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleUploadPhoto = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🚀 Photo Upload Started');

    // Validate inputs
    if (!event.target.files || event.target.files.length === 0) {
      alert('Please select a photo to upload');
      return;
    }

    if (!isAdmin) {
      alert('You do not have permission to upload photos');
      return;
    }

    if (!selectedCategory) {
      return;
    }

    if (!auth.currentUser) {
      alert('Please log in to upload photos');
      return;
    }

    setIsLoading(true);
    const uploadErrors: string[] = [];

    try {
      const uploadedPhotos: Photo[] = [];

      for (let file of event.target.files) {
        try {
          // Validate file
          if (file.size > 10 * 1024 * 1024) {
            throw new Error(`${file.name} is too large. Maximum size is 10MB.`);
          }

          const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
          if (!allowedTypes.includes(file.type)) {
            throw new Error(`Unsupported file type for ${file.name}. Only JPEG, PNG, and WebP are allowed.`);
          }

          // Add watermark to image
          const watermarkedFile = await addWatermarkToImage(file);

          // Generate unique storage path
          const storagePath = `photos/${selectedCategory}/${Date.now()}_${watermarkedFile.name}`;
          
          // Upload to Firebase Storage
          const fileRef = ref(storage, storagePath);
          const uploadResult = await uploadBytes(fileRef, watermarkedFile);
          const downloadURL = await getDownloadURL(uploadResult.ref);

          // Create Firestore document
          const photoDocRef = await addDoc(collection(db, 'photos'), {
            fileName: watermarkedFile.name,
            storagePath: storagePath,
            downloadURL: downloadURL,
            category: selectedCategory,
            uploadedBy: auth.currentUser.uid,
            uploadedAt: serverTimestamp(),
            isVisible: true
          });

          console.log('Photo document created:', photoDocRef.id);

          // Track successful uploads
          uploadedPhotos.push({
            id: photoDocRef.id,
            fileName: watermarkedFile.name,
            storagePath: storagePath,
            downloadURL: downloadURL,
            category: selectedCategory
          });

          console.log(`✅ Successfully uploaded: ${file.name}`);
        } catch (uploadError) {
          console.error(`❌ Upload failed for ${file.name}:`, uploadError);
          
          const errorMessage = uploadError instanceof Error 
            ? uploadError.message 
            : 'Unknown upload error';
          
          uploadErrors.push(`${file.name}: ${errorMessage}`);
        }
      }

      // Update local state with uploaded photos
      if (uploadedPhotos.length > 0) {
        setPhotos(prev => [...prev, ...uploadedPhotos]);
      }

      // Handle upload errors
      if (uploadErrors.length > 0) {
        alert(`Some files could not be uploaded:\n${uploadErrors.join('\n')}`);
      } else {
        alert('All photos uploaded successfully!');
      }

    } catch (overallError) {
      console.error('❌ Overall Upload Process Failed:', overallError);
      alert('Failed to complete photo upload. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, selectedCategory, auth.currentUser]);

  const triggerFileInput = useCallback(() => {
    if (isAdmin && !isLoading && fileInputRef.current && selectedCategory) {
      fileInputRef.current.click();
      setShowCategoryTooltip(false);
    }
  }, [isAdmin, isLoading, selectedCategory]);


  const handleDeletePhoto = useCallback(async (photoToDelete: string) => {
    if (!isAdmin) return;
    
    try {
      const photoToDeleteDoc = photos.find(photo => photo.downloadURL === photoToDelete);
      if (!photoToDeleteDoc) {
        console.error('Photo not found in local state:', photoToDelete);
        return;
      }

      const photoDocRef = doc(db, 'photos', photoToDeleteDoc.id);
      await setDoc(photoDocRef, { isVisible: false }, { merge: true });

      setPhotos(prev => prev.filter(photo => photo.downloadURL !== photoToDelete));
      console.log(`✅ Successfully deleted photo: ${photoToDelete}`);
    } catch (error) {
      console.error('❌ Error deleting photo:', error);
      alert('Failed to delete photo. Please try again.');
    }
  }, [isAdmin, photos, db]);

  const togglePhotoSelection = useCallback((photo: string) => {
    setSelectedPhotos(prev => 
      prev.includes(photo) 
        ? prev.filter(p => p !== photo)
        : [...prev, photo]
    );
  }, []);

  const navigateToProducts = () => {
    navigate('/admin/products');
  };

  const handleUploadButtonClick = () => {
    if (!selectedCategory) {
      setShowCategoryTooltip(true);
    } else {
      triggerFileInput();
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-dark-900/50 backdrop-blur-sm flex items-center justify-center z-50">
        <motion.div 
          className="w-24 h-24 border-4 border-t-primary-500 border-r-primary-500 border-b-primary-500/30 border-l-primary-500/30 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 1.2, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <BackButton to="/admin/dashboard" label="Back to Dashboard" />
          <h1 className="text-3xl font-display font-bold mt-4 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            Photo Bank
          </h1>
        </div>
        <Button 
          variant="outline" 
          onClick={navigateToProducts}
          className="flex items-center space-x-2 bg-primary-500/20 text-primary-300 border-primary-500/50 hover:bg-primary-500/30"
        >
          <Link2 className="mr-2 h-4 w-4" /> Go to Product Manager
        </Button>
      </div>

      <Card className="bg-dark-600/50 backdrop-blur-sm rounded-xl border border-dark-400/30">
        <CardHeader className="flex justify-between items-center border-b border-dark-400/30 p-6">
          <CardTitle className="text-xl font-semibold">Manage Photos</CardTitle>
          <div className="flex items-center space-x-4 relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-dark-600 p-2 rounded-lg"
              disabled={!isAdmin || isLoading}
            >
              <option value="">Select Category</option>
              {DEFAULT_CATEGORIES.map((category: CategoryConfig) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
            <input 
              ref={fileInputRef}
              type="file" 
              id="photo-upload" 
              multiple 
              accept="image/*" 
              onChange={handleUploadPhoto}
              className="hidden"
            />
            <div className="relative">
              <Button 
                type="button"
                onClick={handleUploadButtonClick}
                disabled={!isAdmin || isLoading}
                className="flex items-center space-x-2 bg-blue-600 text-white hover:bg-blue-700"
              >
                <Upload className="mr-2 h-4 w-4" /> Upload Photos
              </Button>
              {showCategoryTooltip && !selectedCategory && (
                <div className="absolute top-full left-0 mt-1 bg-dark-700 text-white p-2 rounded-md shadow-md z-10 text-sm">
                  You must select a category
                </div>
              )}
            </div>
            {selectedPhotos.length > 0 && (
              <Button 
                variant="destructive" 
                disabled={!isAdmin || isLoading}
                onClick={() => selectedPhotos.forEach(handleDeletePhoto)}
                className={`
                  ${!isAdmin || isLoading 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-red-500/30 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]'}
                  transition-all duration-300
                  bg-red-500/20 text-red-300 border-red-500/50
                `}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete Selected
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {fetchError ? (
            <div className="text-center py-16 bg-slate-100 dark:bg-slate-900 rounded-xl">
              <h2 className="text-2xl font-bold text-red-500 mb-4">
                Error Loading Photos
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                {fetchError.message}
              </p>
            </div>
          ) : photos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-dark-500/50 rounded-ultra-elegant border-2 border-dashed border-dark-400/30 hover:border-primary-500 transition-elegant">
              <ImageIcon className="w-16 h-16 text-primary-500/50 mb-4 animate-subtle-pulse" />
              <p className="text-secondary-400 text-center">
                {!isAdmin 
                  ? "Admin access required to upload photos" 
                  : !selectedCategory
                    ? "Select a category to upload photos"
                    : "No photos uploaded yet"}
                <br />
                <span className="text-sm text-primary-300/70">
                  {!isAdmin 
                    ? "Please contact system administrator" 
                    : !selectedCategory
                      ? "Choose a category from the dropdown"
                      : "Drag and drop or click to upload"}
                </span>
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(
                photos.reduce((acc, photo) => {
                  if (!acc[photo.category]) acc[photo.category] = [];
                  acc[photo.category].push(photo);
                  return acc;
                }, {} as Record<string, typeof photos>)
              ).map(([category, categoryPhotos]) => (
                <div key={category}>
                  <h3 className="text-xl font-semibold mb-4 text-primary-400 capitalize">
                    {DEFAULT_CATEGORIES.find((cat: CategoryConfig) => cat.slug === category)?.name || category}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <AnimatePresence>
                      {categoryPhotos.map((photo, index) => (
                        <motion.div 
                          key={photo.downloadURL}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ delay: index * 0.1 }}
                          className={`
                            relative group cursor-pointer 
                            transform transition-all duration-300 
                            ${selectedPhotos.includes(photo.downloadURL) 
                              ? 'scale-105 border-4 border-primary-500' 
                              : 'hover:scale-105'}
                            rounded-lg overflow-hidden
                            shadow-lg hover:shadow-xl
                            bg-dark-500/50
                          `}
                          onClick={() => togglePhotoSelection(photo.downloadURL)}
                        >
                          <img 
                            src={photo.downloadURL} 
                            alt={`Uploaded photo ${index + 1}`} 
                            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-900/50 to-dark-900/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="bg-primary-500/50 p-2 rounded-full text-white text-sm">
                              {selectedPhotos.includes(photo.downloadURL) ? 'Selected' : 'Select'}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
