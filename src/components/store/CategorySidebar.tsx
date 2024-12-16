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
    <div className="fixed top-0 left-0 w-full h-full z-50 flex  bg-black/50">
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        exit={{ x: -300 }}
        className={`bg-gray-800 text-white w-full sm:w-64 p-4 overflow-y-auto relative h-full max-h-[90vh]`}
      >
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 bg-gray-700 rounded-full p-1 hover:bg-gray-600 transition-colors"
        >
          <X />
        </button>
        
          <h2 className="text-xl font-bold mb-4">Categories</h2>
          <motion.div
            drag="y"
            dragControls={dragControls}
            dragElastic={0.5}
            style={{ y }}
            className="flex flex-col space-y-2 relative"
          >
            {DEFAULT_CATEGORIES.map((category) => (
              <motion.button
                key={category.slug}
                onClick={() => handleCategoryClick(category.slug)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="bg-teal-600/80 text-white px-6 py-3 rounded-full 
                  hover:bg-teal-700 transition-colors shadow-md 
                  flex-shrink-0 whitespace-nowrap flex items-center justify-start
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
      </motion.aside>
    </div>
  );
};

export default CategorySidebar;
