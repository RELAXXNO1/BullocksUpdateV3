import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import { storage } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from './Button';

interface ImageUploadProps {
  currentImageUrl?: string;
  onUploadSuccess: (url: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ currentImageUrl, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localImageUrl, setLocalImageUrl] = useState<string | undefined>(currentImageUrl);

  useEffect(() => {
    setLocalImageUrl(currentImageUrl);
  }, [currentImageUrl]);

  const handleUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    setUploading(true);
    const file = event.target.files[0]; // Only allow single image upload for popups

    try {
      if (file.size > 10 * 1024 * 1024) {
        throw new Error(`${file.name} is too large. Maximum size is 10MB.`);
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Unsupported file type for ${file.name}. Only JPEG, PNG, and WebP are allowed.`);
      }

      const storagePath = `popups/${Date.now()}_${file.name}`;
      const fileRef = ref(storage, storagePath);
      const uploadResult = await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(uploadResult.ref);

      setLocalImageUrl(downloadURL);
      onUploadSuccess(downloadURL);
      alert('Image uploaded successfully!');
    } catch (uploadError) {
      console.error(`Upload failed for ${file.name}:`, uploadError);
      const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown upload error';
      alert(`Upload failed: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  }, [onUploadSuccess]);

  const triggerFileInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleDeleteImage = useCallback(() => {
    setLocalImageUrl(undefined);
    onUploadSuccess(''); // Clear the image URL in the parent component
  }, [onUploadSuccess]);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <input
          ref={fileInputRef}
          type="file"
          id="image-upload"
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
          <Upload className="mr-2 h-4 w-4" /> {uploading ? 'Uploading...' : 'Upload Image'}
        </Button>
      </div>
      {localImageUrl && (
        <div className="relative w-fit">
          <img src={localImageUrl} alt="Uploaded" className="h-20 w-auto rounded-md object-cover" />
          <button
            onClick={handleDeleteImage}
            className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
