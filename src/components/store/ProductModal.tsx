import React, { useState, useEffect } from 'react';
import { Product } from '../../types/product';
import { Button } from '../ui/Button';
import { useCart } from '../../contexts/CartContext';
import { DEFAULT_CATEGORIES } from '../../constants/categories';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { applyKeywordStyling } from '../admin/ProductForm'; // Import the styling function

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [promo, setPromo] = useState<any>(null); // State to hold promo data

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

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300); // Animation duration
    onClose();
  };

  const categoryConfig = DEFAULT_CATEGORIES.find(cat => cat.slug === product.category);
  const attributes = categoryConfig?.attributes?.fields || [];

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : (product.images?.length || 1) - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex < (product.images?.length || 0) - 1 ? prevIndex + 1 : 0));
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center product-modal-container backdrop-blur-md">
      <div className="relative flex flex-col overflow-hidden rounded-3xl border-2 bg-white dark:bg-dark-800 border-dark-700 shadow-2xl dark:shadow-dark-700/60 hover:shadow-3xl transition-shadow duration-500 max-w-md w-full text-white dark:text-gray-100 bg-white dark:bg-slate-900 focus-within:ring-4 focus-within:ring-teal-500 transform hover:scale-105 transition-transform duration-300">
        {/* Teal Underglow Element */}
        <div className="absolute inset-[-1rem] rounded-3xl pointer-events-none ring-8 ring-teal-500 opacity-0 focus-within:opacity-100 transition-opacity duration-300 focus-within:animate-pulse"></div>
        
        {/* Header with Close Button */}
        <div className="px-8 pt-8 pb-4 flex justify-between items-start">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-teal-500 dark:text-teal-300 drop-shadow-md">{product.name}</h2>
          <button 
            onClick={onClose} 
            className="bg-gray-700 bg-opacity-75 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto h-[calc(100vh-150px)]"> 
          {product.images && product.images.length > 0 && (
            <div className="relative mb-4 rounded-xl overflow-hidden shadow-lg">
              <img
                src={product.images[currentImageIndex]}
                alt={product.name}
                className="w-full h-72 object-cover rounded-xl border-4 border-white dark:border-dark-900 rounded-xl"
              />
              {product.images.length > 1 && (
                <div className="absolute bottom-2 right-2 flex space-x-2 z-10">
                  <button onClick={handlePrevImage} className="bg-gray-700 bg-opacity-75 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-600 transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={handleNextImage} className="bg-gray-700 bg-opacity-75 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-600 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          )}
          {/* Apply keyword styling to the description */}
          <p
            className="text-gray-600 dark:text-gray-300 mb-6 text-base leading-relaxed"
            dangerouslySetInnerHTML={{ __html: applyKeywordStyling(product.description || '') }}
          />
          {promo?.discount ? (
            <div className="mb-6">
              {typeof product.price === 'number' ? (
                <>
                  <p className="text-gray-400 line-through text-xl opacity-75 mb-1">
                    ${product.price.toFixed(2)}
                  </p>
                  <p className="text-3xl font-extrabold text-teal-500 dark:text-teal-300">
                    ${(product.price * (1 - promo.discount / 100)).toFixed(2)} <span className="text-primary-500 text-base font-bold ml-2">({promo.discount}% OFF)</span>
                  </p>
                </>
              ) : (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Price Options</h3>
                  <ul className="space-y-2">
                    {Object.entries(product.price).map(([key, price]) => (
                      <li key={key} className="text-sm">
                        <span className="font-semibold text-gray-800 dark:text-gray-100">{key}:</span> 
                        <div className="flex items-center">
                          <span className="text-gray-400 line-through text-sm opacity-75 mr-2">
                            ${price.toFixed(2)}
                          </span>
                          <span className="text-teal-500 font-bold text-base">
                            ${(price * (1 - promo.discount / 100)).toFixed(2)} <span className="text-primary-500 text-xs font-bold ml-1">({promo.discount}% OFF)</span>
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="mb-6">
              {typeof product.price === 'number' ? (
                <p className="text-2xl font-extrabold text-teal-500 dark:text-teal-300 mb-6">
                  ${product.price.toFixed(2)}
                </p>
              ) : (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Price Options</h3>
                  <ul className="space-y-2">
                    {Object.entries(product.price).map(([key, price]) => (
                      <li key={key} className="text-sm">
                        <span className="font-semibold text-gray-800 dark:text-gray-100">{key}:</span> <span className="text-gray-600 dark:text-gray-300">${price.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {attributes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Product Details</h3>
              <ul className="space-y-2">
                {attributes.map(attr => {
                  // Handle boolean attributes correctly
                  const attributeValue = product.attributes?.[attr.name];
                  let displayValue;

                  if (attr.type === 'boolean') {
                    displayValue = attributeValue === '1' ? 'Yes' : attributeValue === '0' ? 'No' : 'N/A';
                  } else {
                    displayValue = attributeValue || 'N/A';
                  }


                  return (
                    <li key={attr.name} className="text-sm">
                      <span className="font-semibold text-gray-800 dark:text-gray-100">{attr.label}:</span> <span className="text-gray-600 dark:text-gray-300">{displayValue}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4 p-8 pt-0">
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
          <Button
            onClick={() => handleAddToCart(product)}
            className={`${isAnimating ? 'animate-pulse' : ''}`}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
