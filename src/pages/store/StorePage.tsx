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
import { getPopups } from '../../lib/popup';
import { Popup } from '../../types/popup';
import { Button } from '../../components/ui/Button';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export default function StorePage() {
  const { products, loading, error } = useProducts();
  const { getContentBySection } = useStoreContent();

  const visibleProducts = products.filter(p => p.isVisible);
  const [slideshowImages, setSlideshowImages] = useState<string[]>([]);
  const [defaultSlideshowImages, setDefaultSlideshowImages] = useState<string[]>([]);
  const [currentSlideshowImages, setCurrentSlideshowImages] = useState<string[]>([]);
  const [activePopups, setActivePopups] = useState<Popup[]>([]);
  const { getItem, setItem } = useLocalStorage();

  const heroContent = getContentBySection('hero');
  const productsContent = getContentBySection('products');

  useEffect(() => {
    const fetchAndFilterPopups = async () => {
      try {
        const allPopups = await getPopups();
        const now = Date.now();
        
        const dismissedOncePerSession = getItem('dismissedPopupsSession') || {};
        const dismissedOncePerUser = getItem('dismissedPopupsUser') || {};

        const filteredPopups = allPopups.filter(p => {
          const isDismissedSession = dismissedOncePerSession[p.id];
          const isDismissedUser = dismissedOncePerUser[p.id];

          return (
            p.isActive &&
            (!p.startDate || p.startDate <= now) &&
            (!p.endDate || p.endDate >= now) &&
            !(p.displayRule === 'oncePerSession' && isDismissedSession) &&
            !(p.displayRule === 'oncePerUser' && isDismissedUser)
          );
        });
        setActivePopups(filteredPopups);
      } catch (error) {
        console.error("Error fetching active popups:", error);
      }
    };
    fetchAndFilterPopups();
  }, []);

  const handleDismiss = (popup: Popup) => {
    setActivePopups(prev => prev.filter(p => p.id !== popup.id));
    if (popup.displayRule === 'oncePerSession') {
      const dismissed = getItem('dismissedPopupsSession') || {};
      setItem('dismissedPopupsSession', { ...dismissed, [popup.id]: true });
    } else if (popup.displayRule === 'oncePerUser') {
      // For 'oncePerUser', you would typically store this in a database associated with the user.
      // For now, we'll use localStorage as a placeholder, but note this is not truly "per user" across devices.
      const dismissed = getItem('dismissedPopupsUser') || {};
      setItem('dismissedPopupsUser', { ...dismissed, [popup.id]: true });
    }
  };

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
    <>
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

      {activePopups.map(popup => {
        if (popup.adLocation === 'popup') {
          return (
            <motion.div
              key={popup.id}
              className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-gradient-to-br from-gray-900 to-gray-700 p-8 rounded-xl shadow-2xl max-w-lg w-full text-center relative border border-teal-500 transform scale-95"
                initial={{ y: -100, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 100, opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
              >
                <h3 className="text-3xl md:text-4xl font-extrabold mb-4 text-teal-300 tracking-wide leading-tight">
                  {popup.title.split(' ').map((word, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="inline-block mr-2"
                    >
                      {word}
                    </motion.span>
                  ))}
                </h3>
                <p className="text-lg text-gray-200 mb-6 leading-relaxed">
                  {popup.content.split(' ').map((word, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 + 0.5, duration: 0.3 }}
                      className="inline-block mr-1"
                    >
                      {word}
                    </motion.span>
                  ))}
                </p>
                {popup.imageUrl && <img src={popup.imageUrl} alt={popup.title} className="mx-auto mb-6 max-h-60 object-contain rounded-lg border border-gray-600 shadow-md" />}
                <Button onClick={() => handleDismiss(popup)} className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 ease-in-out transform hover:scale-105">
                  Close
                </Button>
              </motion.div>
            </motion.div>
          );
        } else if (popup.adLocation === 'overStorePage') {
          return (
            <div key={popup.id} className="absolute top-0 left-0 right-0 bg-gray-800 text-white p-4 text-center z-40 shadow-lg">
              <h3 className="text-xl font-bold mb-2 text-teal-400">{popup.title}</h3>
              <p className="text-gray-300">{popup.content}</p>
              {popup.imageUrl && <img src={popup.imageUrl} alt={popup.title} className="mx-auto mt-2 max-h-24 object-contain rounded-md" />}
              <Button onClick={() => handleDismiss(popup)} className="absolute top-2 right-2 bg-transparent hover:bg-gray-700 text-white p-1 rounded-full">X</Button>
            </div>
          );
        } else if (popup.adLocation === 'belowFooter') {
          // This will be rendered below the main content, so it needs to be outside ScrollWrapper
          return null; // Rendered separately below
        } else if (popup.adLocation === 'miniModule') {
          return (
            <div key={popup.id} className="fixed bottom-4 right-4 bg-gray-800 p-4 rounded-lg shadow-lg z-50 max-w-xs text-white">
              <h3 className="text-lg font-bold mb-2 text-teal-400">{popup.title}</h3>
              <p className="text-sm text-gray-300">{popup.content}</p>
              {popup.imageUrl && <img src={popup.imageUrl} alt={popup.title} className="mx-auto mt-2 max-h-20 object-contain rounded-md" />}
              <Button onClick={() => handleDismiss(popup)} className="absolute top-1 right-1 bg-transparent hover:bg-gray-700 text-white p-1 rounded-full text-xs">X</Button>
            </div>
          );
        }
        return null;
      })}

      {activePopups.map(popup => {
        if (popup.adLocation === 'belowFooter') {
          return (
            <section key={popup.id} className="py-8 px-4 bg-gray-800 text-white text-center">
              <div className="container mx-auto">
                <h3 className="text-2xl font-bold mb-4 text-teal-400">{popup.title}</h3>
                <p className="text-gray-300 mb-4">{popup.content}</p>
                {popup.imageUrl && <img src={popup.imageUrl} alt={popup.title} className="mx-auto mb-4 max-h-48 object-contain rounded-md" />}
                <Button onClick={() => handleDismiss(popup)} className="bg-teal-600 hover:bg-teal-700 text-white">Dismiss</Button>
              </div>
            </section>
          );
        }
        return null;
      })}
    </>
  );
}
