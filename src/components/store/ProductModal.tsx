import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, MapPin } from 'lucide-react';
import { Product } from '../../types/product';
import { useCart } from '../../contexts/CartContext';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { cropImageToSquare } from '../../utils/imageUtils';
import { applyKeywordStyling } from '../admin/ProductForm';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [promo, setPromo] = useState<any>(null);
  const [quantity] = useState(1);

  useEffect(() => {
    const fetchPromo = async () => {
      if (product.promoId) {
        const promoRef = doc(db, 'promos', product.promoId);
        const promoSnap = await getDoc(promoRef);
        if (promoSnap.exists()) {
          setPromo(promoSnap.data());
        }
      }
    };
    fetchPromo();
  }, [product.promoId]);

  useEffect(() => {
    const loadImage = async () => {
      setLoading(true);
      if (product.images && product.images[currentImageIndex]) {
        try {
          const cropped = await cropImageToSquare(product.images[currentImageIndex]);
          setCroppedImageUrl(cropped);
        } catch (error) {
          setCroppedImageUrl(product.images[currentImageIndex]);
        }
      } else {
        setCroppedImageUrl('/placeholder.png');
      }
      setLoading(false);
    };
    loadImage();
  }, [product.images, currentImageIndex]);

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

  const handleAddToCart = () => {
    addToCart({...product, cartImage: product.images?.[currentImageIndex] || '/placeholder.png', quantity: quantity});
  };


  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="bg-slate-800 rounded-lg sm:rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-700 relative max-h-[90vh] overflow-hidden overflow-y-auto"
        onClick={handleStopPropagation}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 h-full">
          {/* Image Section */}
          <div className="relative bg-slate-900 flex items-center justify-center">
            <button
              onClick={handlePrevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-slate-700/50 p-2 rounded-full hover:bg-slate-600/50 z-20"
            >
              ←
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-700/50 p-2 rounded-full hover:bg-slate-600/50 z-20"
            >
              →
            </button>
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
              </div>
            ) : (
              <img
                src={croppedImageUrl || '/placeholder.png'}
                alt={product.name}
                className="max-h-[250px] sm:max-h-[400px] object-contain w-full p-4 sm:p-8"
              />
            )}
          </div>
          {/* Product Details */}
          <div className="p-4 sm:p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-200 mb-1">{product.name}</h2>
                {promo && promo.discount && (
                  <div className="flex items-center gap-2">
                    {typeof product.price === 'number' ? (
                      <>
                        <span className="text-gray-400 line-through text-sm opacity-75">
                          ${product.price.toFixed(2)}
                        </span>
                        <span className="text-emerald-500 text-xl font-semibold">
                          ${(product.price * (1 - promo.discount / 100)).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-gray-400 line-through text-sm opacity-75">
                          ${Math.min(...Object.values(product.price)).toFixed(2)}
                        </span>
                        <span className="text-emerald-500 text-xl font-semibold">
                          ${(Math.min(...Object.values(product.price)) * (1 - promo.discount / 100)).toFixed(2)}
                        </span>
                      </>
                    )}
                    <span className="bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                      {promo.discount}% OFF
                    </span>
                  </div>
                )}
                {!promo || !promo.discount && (
                  <p className="text-emerald-500 text-xl font-semibold">
                    ${typeof product.price === 'number' ? product.price.toFixed(2) : Math.min(...Object.values(product.price)).toFixed(2)}
                  </p>
                )}
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
              <p
                className="text-slate-400"
                dangerouslySetInnerHTML={{ __html: applyKeywordStyling(product.description || '') }}
              />
            </div>

            {product.attributes && Object.keys(product.attributes).length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-slate-200 mb-4">Product Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(product.attributes || {}).map(([key, value]) => {
                    const displayValue = key.toLowerCase() === 'infused'
                      ? ((typeof value === 'number' && value === 1) ||
                        (typeof value === 'boolean' && value === true) ||
                        (typeof value === 'string' && (value === 'true' || value === '1'))
                        ? 'Yes, Professionally Infused'
                        : 'Not Infused')
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
              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                onClick={handleAddToCart}
                className="w-full bg-emerald-600/10 text-emerald-400 py-3 rounded-lg
                  flex items-center justify-center gap-2
                  hover:bg-emerald-600/20 transition-colors
                  font-semibold border border-emerald-500/30"
              >
                <MapPin className="h-5 w-5" />
                Add to Cart
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductModal;
