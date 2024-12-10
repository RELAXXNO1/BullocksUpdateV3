import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Sparkles, ChevronDown } from 'lucide-react';
import { useStoreContent } from '../../contexts/StoreContentContext';
import { useProducts } from '../../hooks/useProducts';
import ProductGrid from '../../components/store/ProductGrid';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useState, useEffect } from 'react';

export default function StorePage() {
  const { products, loading } = useProducts();
  const { getContentBySection } = useStoreContent();
  const [scrolled, setScrolled] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const visibleProducts = products.filter(p => p.isVisible);
  const uniqueCategories = [...new Set(products.map(p => p.category))];

  const handleCategorySelect = (category?: string) => {
    setSelectedCategory(category);
  };

  console.log('🛍️ Store Products Debug', {
    totalProducts: products.length,
    visibleProductsCount: visibleProducts.length,
    visibleProducts: visibleProducts.map(p => ({
      id: p.id,
      name: p.name,
      isVisible: p.isVisible,
      category: p.category
    })),
    allProductDetails: products.map(p => ({
      id: p.id,
      name: p.name,
      isVisible: p.isVisible,
      category: p.category
    }))
  });

  const heroContent = getContentBySection('hero');
  const productsContent = getContentBySection('products');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-mesh opacity-20" />
      
      {/* Hero Section */}
      {heroContent && heroContent.isVisible && (
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden"
        >
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            className="absolute inset-0 bg-gradient-radial"
          />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block mb-8"
            >
              <div className="bg-primary-600/20 p-4 rounded-full backdrop-blur-sm">
                <ShoppingBag className="h-8 w-8 text-primary-400" />
              </div>
            </motion.div>
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ 
                delay: 0.3,
                type: "spring",
                stiffness: 100 
              }}
              className="text-6xl md:text-7xl font-display font-bold mb-8 relative"
            >
              <span className="relative z-10 bg-gradient-to-r from-teal-300 via-teal-400 to-teal-300 bg-clip-text text-transparent">
                {heroContent.title}
              </span>
              <span className="absolute inset-0 -z-10 animate-pulse blur-xl bg-gradient-to-r from-teal-950 via-teal-900 to-teal-950 bg-clip-text text-transparent opacity-90">
                {heroContent.title}
              </span>
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ 
                delay: 0.4,
                type: "spring",
                stiffness: 50
              }}
              className="text-xl text-gray-300 mb-12 leading-relaxed max-w-2xl mx-auto"
            >
              {heroContent.description}
            </motion.p>
            
            <AnimatePresence>
              {!scrolled && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, y: [0, 10, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ 
                    opacity: { duration: 0.2 },
                    y: { repeat: Infinity, duration: 1.5 }
                  }}
                  onClick={scrollToProducts}
                  className="absolute bottom-12 left-1/2 -translate-x-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <ChevronDown className="h-8 w-8" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.section>
      )}

      {/* Products Section */}
      <section id="products" className="relative px-4 py-24">
        {productsContent && productsContent.isVisible && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20 relative z-10"
          >
            <div className="inline-block mb-4">
              <div className="bg-primary-600/20 p-3 rounded-full backdrop-blur-sm">
                <Sparkles className="h-6 w-6 text-primary-400" />
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 relative">
              <span className="relative z-10 bg-gradient-to-r from-teal-300 via-teal-400 to-teal-300 bg-clip-text text-transparent">
                {productsContent.title}
              </span>
              <span className="absolute inset-0 -z-10 animate-pulse blur-xl bg-gradient-to-r from-teal-950 via-teal-900 to-teal-950 bg-clip-text text-transparent opacity-90">
                {productsContent.title}
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              {productsContent.description}
            </p>
          </motion.div>
        )}
        <ProductGrid 
          products={visibleProducts} 
          selectedCategory={selectedCategory} 
        />
      </section>
    </div>
  );
}