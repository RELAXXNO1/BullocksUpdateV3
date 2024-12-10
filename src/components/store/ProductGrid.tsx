import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductModal } from './ProductModal';
import { Product } from '../../types/product';
import { WATERMARK_LOGO_PATH } from '../../config/constants';

interface ProductGridProps {
  products: Product[];
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="container mx-auto px-4">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="inline-flex space-x-6 pb-4 min-w-full">
          {products.map((product) => (
            <motion.div 
              key={product.id}
              onClick={() => handleProductClick(product)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0 w-64 bg-slate-800 rounded-xl p-4 cursor-pointer group transition-all duration-300 hover:shadow-2xl hover:border-teal-500 border border-transparent"
            >
              <div className="absolute top-2 right-2 opacity-50 z-10">
                <img 
                  src={WATERMARK_LOGO_PATH} 
                  alt="Watermark" 
                  className="h-8 w-8 object-contain"
                />
              </div>

              <div className="relative mb-4">
                <img 
                  src={product.images?.[0] || '/placeholder.png'} 
                  alt={product.name} 
                  className="w-full h-48 object-cover rounded-xl 
                    transition-transform duration-300 
                    group-hover:scale-105"
                />
              </div>

              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {product.name}
                </h3>
                <div className="flex justify-center items-center">
                  <span className="text-emerald-500 font-bold">
                    ${product.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedProduct && (
          <ProductModal 
            product={selectedProduct} 
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductGrid;
