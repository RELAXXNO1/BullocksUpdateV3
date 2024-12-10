import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { FaCheckCircle } from 'react-icons/fa';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface PhotobankPopupProps {
  onClose: () => void;
  onSelectImages: (images: string[]) => void;
}

export const PhotobankPopup: React.FC<PhotobankPopupProps> = ({ onClose, onSelectImages }) => {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [photoLibrary, setPhotoLibrary] = useState<{
    id: string;
    fileName: string, 
    storagePath: string, 
    downloadURL: string,
    category: string
  }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const photosRef = collection(db, 'photos');
        const photosQuery = query(
          photosRef, 
          where('isVisible', '==', true)
        );
        const snapshot = await getDocs(photosQuery);
        
        console.group('🖼️ Photobank Image Fetch');
        console.log('Total documents found:', snapshot.docs.length);

        const photos = snapshot.docs.map(doc => {
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

        console.log('Processed Photos:', photos);
        console.groupEnd();

        setPhotoLibrary(photos);
      } catch (error) {
        console.error('❌ Error fetching photos:', error);
        setPhotoLibrary([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  const toggleImageSelection = (image: string) => {
    setSelectedImages(prev => 
      prev.includes(image) 
        ? prev.filter(img => img !== image)
        : [...prev, image]
    );
  };

  const handleSelectImages = () => {
    onSelectImages(selectedImages);
    onClose();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Select Photos from Photobank</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {photoLibrary.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            No photos available in the photobank
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {photoLibrary.map((photo) => (
              <div 
                key={photo.downloadURL} 
                className={`
                  relative 
                  cursor-pointer 
                  border-2 
                  rounded-lg 
                  overflow-hidden 
                  transform 
                  transition-all 
                  hover:scale-105
                  ${selectedImages.includes(photo.downloadURL) ? 'border-blue-500' : 'border-transparent'}
                `}
                onClick={() => toggleImageSelection(photo.downloadURL)}
              >
                <img 
                  src={photo.downloadURL} 
                  alt={photo.fileName} 
                  className="w-full h-48 object-cover"
                />
                {selectedImages.includes(photo.downloadURL) && (
                  <div className="absolute top-2 right-2 text-blue-500 rounded-full w-8 h-8 flex items-center justify-center">
                    <FaCheckCircle className="w-8 h-8" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                  {photo.category}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-4">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Cancel
          </button>
          <button 
            onClick={handleSelectImages} 
            disabled={selectedImages.length === 0}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Select Images
          </button>
        </div>
      </div>
    </div>
  );
};
