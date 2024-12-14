import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Package, Edit2, ShoppingCart, 
  Users, Tag, Gift, Lock, Bot, Image 
} from 'lucide-react';
import { AdminGuru } from './AdminGuru';

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
  { icon: Bot, label: 'Business AI Assistant', locked: true },
  { icon: ShoppingCart, label: 'Shopping Cart and Orders', path: '/admin/orders' },
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
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors group cursor-not-allowed opacity-50"
                >
                  <item.icon className="h-5 w-5 group-hover:text-primary-400 transition-colors" />
                  <span className="text-sm">{item.label}</span>
                  <Lock className="h-4 w-4 ml-auto text-gray-500" />
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
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="fixed bottom-4 right-4 z-50 bg-primary-600 text-white p-3 rounded-full shadow-xl hover:bg-primary-700 transition-colors group"
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
