import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ChevronDown } from 'lucide-react';
import { useStoreContent } from '../../contexts/StoreContentContext';
import { useProducts } from '../../hooks/useProducts';
import ProductGrid from '../../components/store/ProductGrid';
import LoadingSpinner from '../../components/LoadingSpinner';
import ScrollWrapper from '../../components/store/ScrollWrapper';
import SlideshowBackground from '../../components/ui/SlideshowBackground';
import { storage } from '../../lib/firebase';
import { ref, listAll, getDownloadURL } from 'firebase/storage';

export default function StorePage() {
  const { products, loading, error } = useProducts();
  const { getContentBySection } = useStoreContent();
  
  const visibleProducts = products.filter(p => p.isVisible);
  const [slideshowImages, setSlideshowImages] = useState<string[]>([]);
  const [defaultSlideshowImages, setDefaultSlideshowImages] = useState<string[]>([]);
  const [currentSlideshowImages, setCurrentSlideshowImages] = useState<string[]>([]);

  const heroContent = getContentBySection('hero');
  const productsContent = getContentBySection('products');

  useEffect(() => {
    if (heroContent?.images && heroContent.images.length > 0) {
      setCurrentSlideshowImages(heroContent.images);
    } else {
      setCurrentSlideshowImages(defaultSlideshowImages);
    }
  }, [heroContent, defaultSlideshowImages]);

  useEffect(() => {
    const fetchSlideshowImages = async () => {
      const storageRef = ref(storage, 'storeContent');
      try {
        const res = await listAll(storageRef);
        const urls = await Promise.all(res.items.map(item => getDownloadURL(item)));
        setSlideshowImages(urls);
      } catch (e) {
        console.error("Error fetching slideshow images:", e);
      }
    };
    fetchSlideshowImages();

    return () => {};
  }, [slideshowImages]);

  useEffect(() => {
    const fetchDefaultSlideshowImages = async () => {
      const storageRef = ref(storage, 'gs://bullocksbasic.firebasestorage.app/storeContent/tkJiKDSAxYUsJp0W7AO2FgqDRkh2');
      try {
        const res = await listAll(storageRef);
        const urls = await Promise.all(res.items.map(item => getDownloadURL(item)));
        setDefaultSlideshowImages(urls);
      } catch (e) {
        console.error("Error fetching default slideshow images:", e);
      }
    };
    fetchDefaultSlideshowImages();

    return () => {};
  }, []);


  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-16 bg-slate-100 dark:bg-slate-900 rounded-xl">
        <h2 className="text-2xl font-bold text-red-500 mb-4">
          Error Loading Products
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          {error.message}
        </p>
      </div>
    );
  }

  const scrollToProducts = () => {
    const productsSection = document.getElementById('products-section');
    productsSection?.scrollIntoView({ behavior: 'smooth' });
  };


  return (
    <ScrollWrapper>
        {/* Hero Section */}
        <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-4 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <SlideshowBackground images={currentSlideshowImages} />
          </div>
          <div 
            className="max-w-4xl mx-auto relative z-10"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white" style={{textShadow: '0 0 10px black'}}>
              {heroContent?.title || 'Discover Premium THC-A Products'}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white" style={{textShadow: '0 0 10px black'}}>
              {heroContent?.description || 'Explore our curated selection of high-quality THC-A products.'}
            </p>
            
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
            
            <div 
              className="mt-12 animate-bounce"
            >
              <ChevronDown className="mx-auto text-4xl text-teal-600" />
            </div>
          </div>
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
    </ScrollWrapper>
  );
}
