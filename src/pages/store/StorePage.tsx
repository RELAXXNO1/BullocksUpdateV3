import { useRef } from 'react';
import { motion, useMotionValue, useDragControls, useScroll, useTransform } from 'framer-motion';
import { ShoppingBag, ChevronDown } from 'lucide-react';
import { useStoreContent } from '../../contexts/StoreContentContext';
import { useProducts } from '../../hooks/useProducts';
import ProductGrid from '../../components/store/ProductGrid';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Guru } from '../../components/store/Guru';
import { DEFAULT_CATEGORIES } from '../../constants/categories';
import { useNavigate } from 'react-router-dom';

// Extend categories to create an infinite loop effect
const infiniteCategories = [
  ...DEFAULT_CATEGORIES, 
  ...DEFAULT_CATEGORIES, 
  ...DEFAULT_CATEGORIES
];

export default function StorePage() {
  const { products, loading } = useProducts();
  const { getContentBySection } = useStoreContent();
  const navigate = useNavigate();
  
  const visibleProducts = products.filter(p => p.isVisible);

  const heroContent = getContentBySection('hero');
  const productsContent = getContentBySection('products');

  // Ref for scroll-based parallax
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  // Transform scroll progress into visual effects
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "150%"]);

  const dragControls = useDragControls();
  const x = useMotionValue(0);

  if (loading) {
    return <LoadingSpinner />;
  }

  const scrollToProducts = () => {
    const productsSection = document.getElementById('products-section');
    productsSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCategoryClick = (slug: string) => {
    // Prioritize internal routing
    navigate(`/${slug}`);
    
    // Fallback to external subdomain if internal routing fails
    // window.open(`https://${slug}.bullocksmokeshop.com`, '_blank');
  };

  return (
    <>
      <div 
        ref={ref} 
        className="relative min-h-screen overflow-hidden"
      >
        <motion.div 
          style={{ y: backgroundY }}
          className="absolute inset-0 bg-gradient-mesh opacity-20 z-0" 
        />
        
        {/* Hero Section */}
        <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-4">
          <motion.div 
            style={{ y: textY }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto relative z-10"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-slate-800 dark:text-white">
              {heroContent?.title || 'Discover Premium THC-A Products'}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-slate-600 dark:text-slate-300">
              {heroContent?.description || 'Explore our curated selection of high-quality THC-A products.'}
            </p>
            
            {/* Draggable Category Scroll Wheel */}
            <div className="relative w-full h-32 overflow-hidden">
              <motion.div
                drag="x"
                dragControls={dragControls}
                dragConstraints={{ left: -2000, right: 0 }}
                dragElastic={0.5}
                style={{ x }}
                className="flex space-x-6 relative"
              >
                {infiniteCategories.map((category, index) => (
                  <motion.button
                    key={`${category.slug}-${index}`}
                    onClick={() => handleCategoryClick(category.slug)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-teal-600/80 text-white px-6 py-3 rounded-full 
                      hover:bg-teal-700 transition-colors shadow-md 
                      flex-shrink-0 whitespace-nowrap flex items-center justify-center
                      space-x-2 group"
                  >
                    <span className="text-sm font-medium">{category.name}</span>
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      whileHover={{ opacity: 1, x: 0 }}
                      className="opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out"
                    >
                      →
                    </motion.span>
                  </motion.button>
                ))}
              </motion.div>
              
              {/* Scroll Navigation Buttons */}
              <motion.button
                onClick={() => {
                  const currentX = x.get();
                  x.set(Math.min(currentX + 300, 0));
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="absolute left-0 top-1/2 -translate-y-1/2 
                  bg-teal-600/50 hover:bg-teal-600/70 
                  text-white p-2 rounded-full z-10 
                  shadow-md transition-all duration-300 
                  flex items-center justify-center"
              >
                ←
              </motion.button>
              
              <motion.button
                onClick={() => {
                  const currentX = x.get();
                  x.set(Math.max(currentX - 300, -2000));
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="absolute right-0 top-1/2 -translate-y-1/2 
                  bg-teal-600/50 hover:bg-teal-600/70 
                  text-white p-2 rounded-full z-10 
                  shadow-md transition-all duration-300 
                  flex items-center justify-center"
              >
                →
              </motion.button>
            </div>

            <div className="flex justify-center space-x-4 mt-8">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={scrollToProducts}
                className="flex items-center bg-teal-600 text-white px-6 py-3 rounded-full hover:bg-teal-700 transition-colors"
              >
                <ShoppingBag className="mr-2" /> Shop Now
              </motion.button>
            </div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="mt-12 animate-bounce"
            >
              <ChevronDown className="mx-auto text-4xl text-teal-600" />
            </motion.div>
          </motion.div>
        </section>

        {/* Products Section */}
        <section 
          id="products-section" 
          className="relative py-16 px-4 bg-white dark:bg-slate-900"
        >
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center text-slate-800 dark:text-white">
              {productsContent?.title || 'Our Products'}
            </h2>
            
            <ProductGrid 
              products={visibleProducts}
            />
          </div>
        </section>
      </div>

      <Guru />
    </>
  );
}
