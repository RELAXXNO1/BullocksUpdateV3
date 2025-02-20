import { Outlet } from 'react-router-dom';
import { StoreHeader } from '../store/StoreHeader';
import StoreFooter from '../store/StoreFooter';
import AgeVerification from '../AgeVerification';
import CategorySidebar from '../store/CategorySidebar';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StoreLayoutProps {
    points?: number;
}

export default function StoreLayout({ points }: StoreLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const portalRef = useRef(document.createElement('div'));

  useEffect(() => {
    const portalElement = portalRef.current;
    document.body.appendChild(portalElement);
    return () => {
      document.body.removeChild(portalElement);
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AgeVerification />
      <StoreHeader points={points} />
      <div className="flex-grow flex relative">
        <AnimatePresence>
          <motion.button
            onClick={toggleSidebar}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="fixed top-24 left-4 z-30 group shadow-md"
            style={{ top: '150px' }}
          >
            <div className="relative">
              {/* Glass background */}
              <div className="absolute inset-0 bg-gradient-to-r from-teal-600/80 to-teal-700/80 rounded-xl backdrop-blur-sm 
                transition-all duration-300 group-hover:from-teal-500/80 group-hover:to-teal-600/80" />
              
              {/* Highlight effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-0 
                group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
              
              {/* Border */}
              <div className="absolute inset-0 border border-white/10 rounded-xl" />
              
              {/* Content */}
              <div className="relative px-4 py-2 flex items-center space-x-2">
                <Menu className="w-5 h-5 text-white" />
                <span className="text-sm font-medium text-white">Categories</span>
              </div>
            </div>
          </motion.button>
        </AnimatePresence>
        
        <main className="flex-grow px-4 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
      {createPortal(
        <CategorySidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />,
        portalRef.current
      )}
      <StoreFooter />
    </div>
  );
}
