import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  Edit2, 
  ShoppingCart, 
  Tag, 
  Lock, 
  Bot, 
  Image, 
  Menu,
  ChevronLeft,
  ChevronRight 
} from 'lucide-react';
import { AdminGuru } from './AdminGuru';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path?: string;
  locked?: boolean;
  description?: string;
}

const NAV_ITEMS: NavItem[] = [
  { 
    icon: LayoutDashboard, 
    label: 'Dashboard', 
    path: '/admin/dashboard',
    description: 'Overview and analytics'
  },
  { 
    icon: Package, 
    label: 'Products', 
    path: '/admin/products',
    description: 'Manage store products'
  },
  { 
    icon: Edit2, 
    label: 'Store Content', 
    path: '/admin/store-content',
    description: 'Edit website content'
  },
  { 
    icon: Image, 
    label: 'Photo Bank', 
    path: '/admin/photo-bank',
    description: 'Manage product images'
  },
  { 
    icon: Bot, 
    label: 'Business AI Assistant', 
    locked: true,
    description: 'AI-powered business insights'
  },
  { 
    icon: ShoppingCart, 
    label: 'Orders', 
    path: '/admin/orders',
    description: 'View and manage orders'
  },
  { 
    icon: Tag, 
    label: 'Promo Manager', 
    path: '/admin/promo-manager', 
    description: 'Manage promotions'
  }
];

export default function AdminSidebar() {
  const location = useLocation();
  const [showChat, setShowChat] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Handle collapse toggle
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleResize = useCallback(() => {
    if (window.innerWidth >= 768) {
      setIsMobileMenuOpen(false);
    }
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  return (
    <>
      {/* Mobile Menu Toggle */} 
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-[60px] left-4 z-50 p-3 bg-dark-500/90 
          backdrop-blur-sm rounded-lg text-gray-400 hover:text-white
          min-w-[44px] min-h-[44px] flex items-center justify-center
          border border-dark-400/30 shadow-lg
          active:scale-95 transition-all duration-200"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`
        fixed z-40 top-[60px] left-0 bottom-0
        bg-dark-600 border-r border-dark-400/30
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        overflow-hidden shadow-xl
        h-[calc(100vh-60px)]
      `}>
        <div className="flex flex-col h-full">
          {/* Collapse Toggle */}
          <div className="hidden md:block p-4 border-b border-dark-400/30">
            <button
              onClick={toggleCollapse}
              className={`
                w-full flex items-center justify-center p-2
                bg-dark-500/50 rounded-lg text-gray-400 
                hover:text-white hover:bg-dark-400/50 
                transition-all duration-200
              `}
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5 mx-auto" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
            {NAV_ITEMS.map((item) => (
              item.locked ? (
                <div
                  key={item.label}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-colors group cursor-not-allowed opacity-50
                    min-h-[44px] relative
                  `}
                  title={`${item.label} (Coming Soon)`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0 group-hover:text-primary-400 transition-colors" />
                  <div className={`flex-1 ${isCollapsed ? 'hidden' : ''}`}>
                    <span className="text-sm font-medium">{item.label}</span>
                    {!isCollapsed && item.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                    )}
                  </div>
                  <Lock className="h-4 w-4 ml-auto text-gray-500" />
                </div>
              ) : (
                <Link
                  key={item.label}
                  to={item.path || ''}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    min-h-[44px] relative transition-all duration-200
                    group hover:bg-dark-500
                    hover:bg-dark-500 hover:shadow-md
                    ${location.pathname === item.path 
                      ? 'bg-dark-500 shadow-sm border border-dark-400/30' 
                      : ''}
                    active:bg-dark-400 active:scale-[0.98]
                  `}
                  title={isCollapsed ? item.label : ''}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0 group-hover:text-primary-400 transition-colors" />
                  <div className={`flex-1 ${isCollapsed ? 'hidden' : ''}`}>
                    <span className="text-sm font-medium">{item.label}</span>
                    {!isCollapsed && item.description && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>
                    )}
                  </div>
                </Link>
              )
            ))}
          </nav>

          <div className={`p-4 border-t border-dark-400/30 mt-auto ${isCollapsed ? 'hidden md:block' : ''}`}>
            <motion.button
              onClick={() => {
                setShowChat(!showChat);
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="fixed bottom-4 right-4 z-50 bg-primary-600 text-white p-3 
                rounded-full shadow-xl hover:bg-primary-700 transition-all duration-200 
                group hover:shadow-primary-500/20 hover:shadow-lg active:scale-95"
              title="AI Assistant"
            >
              <Bot 
                className={`h-6 w-6 ${
                  isHovered ? 'group-hover:rotate-12 transition-transform' : ''
                }`} 
              />
            </motion.button>

            <AnimatePresence>
              {showChat && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <AdminGuru onClose={() => setShowChat(false)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>
    </>
  );
}
