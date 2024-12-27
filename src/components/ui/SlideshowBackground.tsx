import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface SlideshowBackgroundProps {
  images: string[];
  onImageChange: (imageUrl: string) => void;
}

const SlideshowBackground: React.FC<SlideshowBackgroundProps> = ({ images, onImageChange }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const slideshowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      const nextIndex = (currentImageIndex + 1) % images.length;
      onImageChange(images[nextIndex]);
    }, 5000);

    return () => clearInterval(timer);
  }, [images, currentImageIndex, onImageChange]);

  return (
    <div ref={slideshowRef} className="absolute inset-0 overflow-hidden">
      {images.map((image, index) => (
        <motion.img
          key={image}
          src={image}
          alt={`Slideshow Background ${index + 1}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: index === currentImageIndex ? 1 : 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'blur(2px)' }}
        />
      ))}
    </div>
  );
};

export default SlideshowBackground;
