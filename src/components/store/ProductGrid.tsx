import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductModal } from './ProductModal';
import { Product } from '../../types/product';
import { WATERMARK_LOGO_PATH } from '../../config/constants';

interface ProductGridProps {
  products: Product[];
  initialCategory?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  initialCategory = 'All Products' 
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);

  // Get unique categories from products
  const categories = useMemo(() => {
    const allCategories = ['All Products', ...new Set(products.map(p => p.category))];
    return allCategories;
  }, [products]);

  // Filter products based on selected category
  const filteredProducts = useMemo(() => {
    return selectedCategory === 'All Products' 
      ? products 
      : products.filter(product => product.category === selectedCategory);
  }, [products, selectedCategory]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="container mx-auto px-4">
      {/* Category Filter */}
      <div className="flex justify-center space-x-4 mb-6 overflow-x-auto scrollbar-hide">
        {categories.map((category) => (
          <motion.button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              selectedCategory === category 
                ? 'bg-teal-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {category}
          </motion.button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="inline-flex space-x-6 pb-4 min-w-full">
          {filteredProducts.map((product) => (
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

      {/* No Products Message */}
      {filteredProducts.length === 0 && (
        <div className="text-center text-slate-400 py-8">
          No products found in this category.
        </div>
      )}

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
