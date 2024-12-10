import React from 'react';
import { motion } from 'framer-motion';
import { Product } from '../../types/product'; // Corrected import casing
import { WATERMARK_LOGO_PATH } from '../../config/constants';

interface ProductGridProps {
  products: Product[];
  selectedCategory?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, selectedCategory }) => {
  // Filter products by selected category if a category is selected
  const filteredProducts = selectedCategory 
    ? products.filter(product => product.category === selectedCategory)
    : products;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4 relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-dark-600 via-dark-500 to-dark-600 opacity-50 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,theme(colors.teal.500/0.1),transparent)] pointer-events-none" />
      
      {filteredProducts.map((product) => (
        <motion.div 
          key={product.id} 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-dark-600/50 backdrop-blur-xl rounded-2xl shadow-super-elegant border border-dark-400/30 overflow-hidden relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-transparent to-teal-500/5" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.teal.500/0.1),transparent_70%)]" />
          
          <div className="relative z-10">
            {product.images && product.images.length > 0 ? (
              <div className="relative">
                <img 
                  src={product.images[0]} 
                  alt={product.name} 
                  className="w-full h-48 object-cover group-hover:opacity-80 transition-opacity duration-300"
                />
                <img 
                  src={WATERMARK_LOGO_PATH} 
                  alt="Watermark" 
                  className="absolute bottom-2 right-2 w-16 h-16 opacity-30 group-hover:opacity-20 transition-opacity duration-300"
                />
              </div>
            ) : (
              <div className="w-full h-48 bg-dark-500 flex items-center justify-center">
                <img 
                  src={WATERMARK_LOGO_PATH} 
                  alt="No Image" 
                  className="w-32 h-32 opacity-20"
                />
              </div>
            )}
            <div className="p-4">
              <h3 className="text-lg font-display font-semibold bg-gradient-to-r from-teal-300 via-teal-400 to-teal-300 bg-clip-text text-transparent">
                {product.name}
              </h3>
              <p className="text-gray-300 font-medium">${product.price.toFixed(2)}</p>
              <p className="text-sm text-gray-500">{product.category}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ProductGrid;
