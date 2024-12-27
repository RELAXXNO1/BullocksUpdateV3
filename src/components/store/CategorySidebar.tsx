import React from 'react';
import { motion, useMotionValue, useDragControls } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_CATEGORIES } from '../../constants/categories';
import { X } from 'lucide-react';

interface CategorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dragControls = useDragControls();
  const y = useMotionValue(0);

  const handleCategoryClick = (slug: string) => {
    navigate(`/${slug}`);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed top-0 left-0 w-full h-full z-50 flex bg-black/30 backdrop-blur-sm"
    >
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        exit={{ x: -300 }}
        className="relative w-full sm:w-64 h-full max-h-screen overflow-hidden"
      >
        {/* Glassmorphic background layers */}
        <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-800/50 to-gray-900/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-transparent to-teal-500/10" />
        
        {/* Content container */}
        <div className="relative h-full p-6 overflow-y-auto">
          {/* Close button */}
          <div 
            className="absolute top-0 right-0 p-4 -m-4"
            onClick={onClose}
          >
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative p-2 rounded-full bg-gray-700/50 hover:bg-gray-600/50 backdrop-blur-sm
                border border-white/10 transition-colors group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-0 
                group-hover:opacity-100 transition-opacity duration-300" />
              <X className="w-5 h-5 text-gray-200 group-hover:text-white transition-colors" />
            </motion.button>
          </div>

          {/* Header */}
          <div className="mb-8 relative">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-300 to-teal-200 bg-clip-text text-transparent">
              Categories
            </h2>
            <div className="mt-2 h-1 w-20 bg-gradient-to-r from-teal-500 to-transparent rounded-full" />
          </div>

          {/* Categories list */}
          <motion.div
            drag="y"
            dragControls={dragControls}
            dragElastic={0.5}
            style={{ y }}
            className="space-y-3 relative"
          >
            {DEFAULT_CATEGORIES.map((category, index) => (
              <motion.button
                key={category.slug}
                onClick={() => handleCategoryClick(category.slug)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-teal-600/80 to-teal-700/80 backdrop-blur-sm 
                  rounded-xl transition-all duration-300 group-hover:from-teal-500/80 group-hover:to-teal-600/80" />
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-0 
                  group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 border border-white/10 rounded-xl" />
                
                <div className="relative px-6 py-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">
                    {category.name}
                  </span>
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="text-white/70 group-hover:text-white transition-all duration-300"
                  >
                    →
                  </motion.span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-900/90 to-transparent 
          pointer-events-none" />
      </motion.aside>

      {/* Click away area */}
      <motion.div 
        className="flex-1"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
    </motion.div>
  );
};

export default CategorySidebar;
