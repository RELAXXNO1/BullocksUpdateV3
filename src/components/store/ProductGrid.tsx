import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Product } from '../../types/product';
import { MapPin } from 'lucide-react';
import { ProductModal } from '../store/ProductModal';
import { useCart } from '../../contexts/CartContext';
import { useCartToggle } from '../../contexts/CartToggleContext';

interface ProductGridProps {
  products: Product[];
  initialCategory?: string;
}

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToCart } = useCart();
  const { isCartEnabled } = useCartToggle();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <>
      <motion.div 
        onClick={() => setIsModalOpen(true)}
        className="group relative overflow-hidden rounded-2xl shadow-lg bg-white dark:bg-slate-800 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Image Container with Overlay */}
        <div className="relative aspect-square overflow-hidden">
          <img 
            src={product.images?.[0] || '/placeholder-product.png'} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Product Details */}
        <div className="p-4 space-y-2">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white truncate">
            {product.name}
          </h3>
          <div className="flex justify-between items-center">
            <span className="text-teal-600 font-semibold text-xl">
              ${product.price.toFixed(2)}
            </span>
            {isCartEnabled ? (
              <button
                onClick={handleAddToCart}
                className="text-teal-400 hover:text-teal-300 text-sm italic flex items-center justify-center"
              >
                <MapPin className="h-4 w-4 mr-1" />
                Add to Cart
              </button>
            ) : (
              <a
                href="https://www.google.com/maps/search/bullocks+smoke+shop"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-400 hover:text-teal-300 text-sm italic flex items-center justify-center"
              >
                <MapPin className="h-4 w-4 mr-1" />
                Come Pick it Up
              </a>
            )}
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
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
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
