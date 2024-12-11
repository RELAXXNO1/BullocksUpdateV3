import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, MapPin } from 'lucide-react';
import { Product } from '../../types/product';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ 
  product, 
  onClose 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const detailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensure details section is scrollable when modal opens
    if (detailsRef.current) {
      const hasOverflow = detailsRef.current.scrollHeight > detailsRef.current.clientHeight;
      if (hasOverflow) {
        detailsRef.current.classList.add('overflow-y-scroll');
      }
    }
  }, []);

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      (prev + 1) % (product.images?.length || 1)
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? (product.images?.length || 1) - 1 : prev - 1
    );
  };

  const handleStopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-slate-700 relative"
        onClick={handleStopPropagation}
      >
        <div className="grid md:grid-cols-2 h-full">
          {/* Image Section */}
          <div className="relative bg-slate-900 flex items-center justify-center">
            <button 
              onClick={handlePrevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-slate-700/50 p-2 rounded-full hover:bg-slate-600/50 z-10"
            >
              ←
            </button>
            <button 
              onClick={handleNextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-700/50 p-2 rounded-full hover:bg-slate-600/50 z-10"
            >
              →
            </button>
            <img 
              src={product.images?.[currentImageIndex] || '/placeholder.png'} 
              alt={product.name} 
              className="max-h-[400px] object-contain w-full p-8"
            />
          </div>

          {/* Details Section */}
          <div 
            ref={detailsRef}
            className="p-6 overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{product.name}</h2>
                <p className="text-emerald-500 text-xl font-semibold">${product.price.toFixed(2)}</p>
              </div>
              <button 
                onClick={onClose} 
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-slate-200 mb-2">Description</h3>
              <p className="text-slate-400">{product.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-200 mb-2">Category</h3>
                <p className="text-slate-400">{product.category}</p>
              </div>
            </div>

            {product.attributes && Object.keys(product.attributes).length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-slate-200 mb-4">Product Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(product.attributes || {}).map(([key, value]) => {
                    // Special handling for 'infused' attribute
                    const displayValue = key.toLowerCase() === 'infused' 
                      ? (
                          (typeof value === 'number' && value === 1) || 
                          (typeof value === 'boolean' && value === true) || 
                          (typeof value === 'string' && (value === 'true' || value === '1'))
                            ? 'Yes, Professionally Infused' 
                            : 'Not Infused'
                        )
                      : String(value);

                    return (
                      <div key={key} className="bg-slate-700/50 p-3 rounded-lg">
                        <h4 className="text-sm text-slate-400 mb-1 capitalize">
                          {key.replace(/_/g, ' ')}
                        </h4>
                        <p className="text-white font-medium">
                          {displayValue}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <a 
                href="https://www.google.com/maps/dir//400+Vernonview+Dr,+Mt+Vernon,+OH+43050/@40.4004795,-82.5389536,12z/data=!4m8!4m7!1m0!1m5!1m1!1s0x8839ccb9b3f11bed:0x4ca1ad52339bb0f0!2m2!1d-82.4566284!2d40.4004932?entry=ttu&g_ep=EgoyMDI0MTIwOC4wIKXMDSoASAFQAw%3D%3D" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600/10 text-emerald-400 py-3 rounded-lg 
                  flex items-center justify-center gap-2 
                  hover:bg-emerald-600/20 transition-colors
                  font-semibold border border-emerald-500/30"
              >
                <MapPin className="h-5 w-5" />
                Come Pick It Up!
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProductModal;
