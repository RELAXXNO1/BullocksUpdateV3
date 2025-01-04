import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Product } from '../../types/product';
import { MapPin } from 'lucide-react';
import ProductModal from '../store/ProductModal';
import { useCart } from '../../contexts/CartContext';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface ProductGridProps {
  products: Product[];
  initialCategory?: string;
}

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToCart } = useCart();
  const [promo, setPromo] = useState<any>(null);

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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({...product, cartImage: product.images?.[0] || '/placeholder-product.png', quantity: 1});
    
    const button = e.currentTarget;
    button.classList.add('animate-pulse');
    setTimeout(() => {
      button.classList.remove('animate-pulse');
    }, 300);
  };

  return (
    <>
      <motion.div 
        onClick={() => setIsModalOpen(true)}
        className="product-card group relative rounded-2xl shadow-lg bg-white dark:bg-slate-800 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative aspect-square overflow-hidden">
          <img 
            src={product.images?.[0] || '/placeholder-product.png'} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 min-h-[200px] relative"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Promo Badge */}
          {promo && (
            <div className="absolute top-0 right-0 bg-gradient-to-l from-primary-600 to-primary-700 text-white text-xs font-bold py-1 px-3 rounded-bl-lg shadow-lg transform transition-transform duration-300 group-hover:scale-105">
              <div className="relative">
                {promo.product}
                <div className="absolute -bottom-1 left-0 w-full h-[1px] bg-white/30" />
              </div>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="p-1 space-y-0.5 sm:p-2 sm:space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white truncate leading-tight">
            {product.name}
          </h3>
          
          {/* Price Section with Original and Discounted Price */}
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              {promo?.discount ? (
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    {typeof product.price === 'number' ? (
                      <>
                        <span className="text-gray-400 line-through text-sm opacity-75">
                          ${product.price.toFixed(2)}
                        </span>
                        <span className="text-teal-500 font-bold text-base sm:text-lg">
                          ${(product.price * (1 - promo.discount / 100)).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-gray-400 line-through text-sm opacity-75">
                          ${Math.min(...Object.values(product.price)).toFixed(2)} - ${Math.max(...Object.values(product.price)).toFixed(2)}
                        </span>
                        <span className="text-teal-500 font-bold text-base sm:text-lg">
                          ${(Math.min(...Object.values(product.price)) * (1 - promo.discount / 100)).toFixed(2)} - ${(Math.max(...Object.values(product.price)) * (1 - promo.discount / 100)).toFixed(2)}
                        </span>
                      </>
                    )}
                  </div>
                  <span className="bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                    {promo.discount}% OFF
                  </span>
                </div>
              ) : (
                <span className="text-teal-500 font-semibold text-base sm:text-lg">
                  ${typeof product.price === 'number' ? product.price.toFixed(2) : `${Math.min(...Object.values(product.price)).toFixed(2)} - ${Math.max(...Object.values(product.price)).toFixed(2)}`}
                </span>
              )}
            </div>
          </div>
          
          {/* Cart/Location Button */}
          <div className="mt-2">
            <button
              onClick={handleAddToCart}
              className="w-full text-teal-400 hover:text-teal-300 text-xs italic flex items-center justify-center bg-teal-500/10 rounded-md py-1.5 hover:bg-teal-500/20 transition-colors"
            >
              <MapPin className="h-3 w-3 mr-0.5" />
              Add to Cart
            </button>
          </div>
        </div>
      </motion.div>

      {isModalOpen && (
        <ProductModal 
          product={product} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
};

const ProductGrid: React.FC<ProductGridProps> = ({ products, initialCategory }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      {products.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 bg-slate-100 dark:bg-slate-900 rounded-xl"
        >
          <h2 className="text-2xl font-bold text-slate-700 dark:text-white mb-4">
            No Products Available
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Check back soon for new {initialCategory} products!
          </p>
        </motion.div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                delayChildren: 0.2,
                staggerChildren: 0.1
              }
            }
          }}
        >
          {products.map((product) => (
            <motion.div 
              key={product.id}
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: { opacity: 1, scale: 1 }
              }}
              transition={{ duration: 0.5 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default ProductGrid;
