import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface SlideshowBackgroundProps {
  images: string[];
}

const SlideshowBackground: React.FC<SlideshowBackgroundProps> = ({ images }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const slideshowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [images.length]);

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
        />
      ))}
    </div>
  );
};

export default SlideshowBackground;
