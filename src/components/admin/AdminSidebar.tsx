import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Package, Edit2, ShoppingCart, 
  Users, Tag, Gift, Lock, MessageSquare, Image 
} from 'lucide-react';
import  AdminChatbox  from './chat/AdminChatbox';
import { FeatureLockModal } from './chat/FeatureLockModal';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path?: string;
  locked?: boolean;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Package, label: 'Products', path: '/admin/products' },
  { icon: Edit2, label: 'Store Content', path: '/admin/store-content' },
  { icon: Image, label: 'Photo Bank', path: '/admin/photo-bank' },
  { icon: MessageSquare, label: 'Customer AI Assistant', locked: true },
  { icon: ShoppingCart, label: 'Shopping Cart and Orders', locked: true },
  { icon: Users, label: 'UIX Editor', locked: true },
  { icon: Tag, label: 'Admin Management', locked: true },
  { icon: Gift, label: 'Loyalty Rewards', locked: true },
  { icon: Tag, label: 'Promo Manager', locked: true },
  { icon: Users, label: 'Connect to Clover', locked: true }
];

export default function AdminSidebar() {
  const location = useLocation();
  const [showChat, setShowChat] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [lockedFeature, setLockedFeature] = useState<string | null>(null);
  const chatboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showChat && chatboxRef.current) {
      chatboxRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [showChat]);

  const handleLockedFeatureClick = (label: string) => {
    setLockedFeature(label);
  };

  const handleCloseLockedFeatureModal = () => {
    setLockedFeature(null);
  };

  return (
    <>
      <aside className={`bg-dark-600 min-h-screen border-r border-dark-400/30 transition-all duration-300 ease-in-out ${
        showChat ? 'w-96' : 'w-64'
      }`}>
        <div className="flex flex-col h-full">
          <nav className="p-4 space-y-1.5 flex-1">
            {navItems.map((item) => (
              item.locked ? (
                <div
                  key={item.label}
                  onClick={() => handleLockedFeatureClick(item.label)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors group cursor-not-allowed opacity-50"
                >
                  <item.icon className="h-5 w-5 group-hover:text-primary-400 transition-colors" />
                  <span className="flex-1">{item.label}</span>
                  <Lock className="h-4 w-4 text-primary-400" />
                </div>
              ) : (
                <Link
                  key={item.label}
                  to={item.path || ''}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors group hover:bg-dark-500
                    ${location.pathname === item.path ? 'bg-dark-500' : ''}`}
                >
                  <item.icon className="h-5 w-5 group-hover:text-primary-400 transition-colors" />
                  <span>{item.label}</span>
                </Link>
              )
            ))}
          </nav>

          <div className="p-4 border-t border-dark-400/30">
            <motion.button
              onClick={() => {
                setShowChat(!showChat);
                // Scroll to bottom of the page
                if (!showChat) {
                  setTimeout(() => {
                    window.scrollTo({
                      top: document.documentElement.scrollHeight,
                      behavior: 'smooth'
                    });
                  }, 100);
                }
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                showChat ? 'bg-teal-600 text-white' : 'text-secondary-300 hover:text-white'
              }`}
              whileHover={{ scale: 1.02 }}
              animate={{
                boxShadow: showChat ? 'none' : [
                  '0 0 0 0 rgba(20, 184, 166, 0)',
                  '0 0 0 10px rgba(20, 184, 166, 0.2)',
                  '0 0 0 0 rgba(20, 184, 166, 0)'
                ],
                background: isHovered ? 'rgba(20, 184, 166, 0.2)' : 'transparent'
              }}
              transition={{
                boxShadow: {
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                },
                background: {
                  duration: 0.3
                }
              }}
            >
              <MessageSquare className="h-5 w-5" />
              <span>AI Assistant</span>
            </motion.button>

            <AnimatePresence>
              {showChat && (
                <motion.div
                  ref={chatboxRef}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <AdminChatbox onClose={() => setShowChat(false)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>

      <AnimatePresence>
        {lockedFeature && (
          <FeatureLockModal 
            isOpen={!!lockedFeature}
            featureName={lockedFeature || ''}
            onClose={handleCloseLockedFeatureModal}
          />
        )}
      </AnimatePresence>
    </>
  );
}