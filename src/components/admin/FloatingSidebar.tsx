import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  Edit2, 
  ShoppingCart, 
  Tag, 
  Lock, 
  Bot, 
  Image
} from 'lucide-react';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path?: string;
  locked?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { 
    icon: LayoutDashboard, 
    label: 'Dashboard', 
    path: '/admin'
  },
  { 
    icon: Package, 
    label: 'Products', 
    path: '/admin/products'
  },
  { 
    icon: Edit2, 
    label: 'Store Content', 
    path: '/admin/store-content'
  },
  { 
    icon: Image, 
    label: 'Photo Bank', 
    path: '/admin/photo-bank'
  },
  { 
    icon: Bot, 
    label: 'Business AI Assistant',
    path: '/admin/gemini-assistant'
  },
  { 
    icon: ShoppingCart, 
    label: 'Orders', 
    path: '/admin/orders'
  },
  { 
    icon: Tag, 
    label: 'Promo Manager', 
    path: '/admin/promo-manager'
  }
];

export default function FloatingSidebar() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  return (
    <>
      {NAV_ITEMS.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="fixed z-50"
          style={{
            top: `${80 + (index * 60)}px`,
            left: '20px',
          }}
        >
          {item.locked ? (
            <div
              className={`
                flex items-center justify-center p-2 rounded-full
                bg-dark-500 shadow-md cursor-not-allowed opacity-50
                transition-colors group
              `}
              title={`${item.label} (Coming Soon)`}
            >
              <item.icon className="h-5 w-5 text-gray-400" />
              <Lock className="h-4 w-4 ml-auto text-gray-500" />
            </div>
          ) : (
            <div className="relative group">
              <Link to={item.path || ''}
                onMouseEnter={() => setActiveModal(item.label)}
                onMouseLeave={() => setActiveModal(null)}
                className={`
                  flex items-center justify-center p-2 rounded-full
                  bg-dark-500 shadow-md transition-all duration-200
                  group hover:bg-dark-500/20
                  hover:shadow-lg
                  active:bg-dark-400 active:scale-[0.98]
                `}
                title={item.label}
              >
                <item.icon className="h-5 w-5 text-teal-400 shadow-md transition-colors" />
                <AnimatePresence>
                  {activeModal === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.1 }}
                      className="absolute left-full top-0 ml-2 bg-dark-500 p-2 rounded-md shadow-lg z-50 whitespace-nowrap"
                    >
                      <span className="text-sm font-medium text-gray-200">{item.label}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Link>
            </div>
          )}
        </motion.div>
      ))}
    </>
  );
}
