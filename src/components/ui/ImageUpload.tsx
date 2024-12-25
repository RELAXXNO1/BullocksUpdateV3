import React, { useState, useRef, useCallback } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import { storage, auth } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from './Button';

interface ImageUploadProps {
  images: string[];
  onUpload: (images: string[]) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ images, onUpload }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localImages, setLocalImages] = useState(images);

  const handleUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    setUploading(true);
    const uploadErrors: string[] = [];
    const uploadedImageUrls: string[] = [];

    try {
      for (const file of event.target.files) {
        try {
          if (file.size > 10 * 1024 * 1024) {
            throw new Error(`${file.name} is too large. Maximum size is 10MB.`);
          }

          const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
          if (!allowedTypes.includes(file.type)) {
            throw new Error(`Unsupported file type for ${file.name}. Only JPEG, PNG, and WebP are allowed.`);
          }

          const storagePath = `storeContent/${auth.currentUser?.uid}/${Date.now()}_${file.name}`;
          const fileRef = ref(storage, storagePath);
          const uploadResult = await uploadBytes(fileRef, file);
          const downloadURL = await getDownloadURL(uploadResult.ref);
          uploadedImageUrls.push(downloadURL);
        } catch (uploadError) {
          console.error(`Upload failed for ${file.name}:`, uploadError);
          const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown upload error';
          uploadErrors.push(`${file.name}: ${errorMessage}`);
        }
      }

      if (uploadErrors.length > 0) {
        alert(`Some files could not be uploaded:\n${uploadErrors.join('\n')}`);
      } else {
        alert('All images uploaded successfully!');
      }

      setLocalImages(prev => [...prev, ...uploadedImageUrls]);
      onUpload([...localImages, ...uploadedImageUrls]);
    } catch (overallError) {
      console.error('Overall Upload Process Failed:', overallError);
      alert('Failed to complete image upload. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [auth.currentUser, onUpload, localImages]);

  const triggerFileInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleDeleteImage = useCallback((imageToDelete: string) => {
    const updatedImages = localImages.filter(image => image !== imageToDelete);
    setLocalImages(updatedImages);
    onUpload(updatedImages);
  }, [localImages, onUpload]);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <input
          ref={fileInputRef}
          type="file"
          id="image-upload"
          multiple
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
        <Button
          type="button"
          onClick={triggerFileInput}
          disabled={uploading}
          className="flex items-center space-x-2 bg-blue-600 text-white hover:bg-blue-700"
        >
          <Upload className="mr-2 h-4 w-4" /> Upload Images
        </Button>
      </div>
      {localImages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {localImages.map((image, index) => (
            <div key={index} className="relative">
              <img src={image} alt={`Uploaded Image ${index + 1}`} className="h-20 w-auto rounded-md object-cover" />
              <button
                onClick={() => handleDeleteImage(image)}
                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
