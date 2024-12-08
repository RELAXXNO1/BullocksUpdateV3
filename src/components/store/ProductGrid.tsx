import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import type { Product } from '../../types/product';
import { trackEvent } from '../../lib/firebase';

interface ProductGridProps {
  products: Product[];
}

interface ProductCardProps extends MotionProps {
  product: Product;
  index: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  index, 
  ...motionProps 
}) => {
  const handleProductView = () => {
    trackEvent('product_view', {
      productId: product.id,
      productName: product.name,
      category: product.category
    });
  };

  return (
    <motion.div 
      key={product.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: index * 0.1,
        duration: 0.5,
        type: 'spring',
        stiffness: 100
      }}
      className="group hover-lift cursor-pointer depth-shader advanced-hover"
      onClick={handleProductView}
      {...motionProps}
    >
      <div className="bg-dark-600 rounded-ultra-elegant overflow-hidden shadow-deep-shadow border border-dark-400/30 transition-elegant transform hover:scale-[1.02] relative">
        {/* Shader-like Gradient Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-transparent via-primary-600/10 to-transparent opacity-50 mix-blend-overlay z-10"></div>
        
        <div className="relative overflow-hidden">
          <motion.img
            src={product.imageUrl}
            alt={product.name}
            className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-110"
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 z-20">
            <p className="text-white text-sm font-medium line-clamp-2 backdrop-blur-sm bg-black/30 rounded-lg p-2">
              {product.description}
            </p>
          </div>
        </div>
        
        <div className="p-5 relative z-30">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-display font-semibold text-lg gradient-text">
              {product.name}
            </h3>
            <span className="text-primary-400 font-bold text-xl">
              ${product.price?.toFixed(2)}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <span className="inline-block text-sm bg-dark-500 text-secondary-300 px-3 py-1.5 rounded-full">
              {product.category}
            </span>
            {product.attributes?.brand && (
              <span className="inline-block text-sm bg-primary-600/20 text-primary-300 px-3 py-1.5 rounded-full">
                {product.attributes.brand}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4 md:px-8 lg:px-16 py-12 bg-gradient-mesh bg-opacity-50">
      {products.map((product, index) => (
        <ProductCard 
          key={product.id}
          product={product} 
          index={index} 
        />
      ))}
    </div>
  );
};

export default ProductGrid;