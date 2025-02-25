import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineHome,
  HiOutlineShoppingBag,
  HiOutlineClipboardList,
  HiOutlineTag,
  HiOutlineDocumentText,
  HiOutlinePhotograph,
  HiOutlineChatAlt,
  HiOutlineQuestionMarkCircle,
  HiOutlineCollection,
  HiOutlineBell
} from 'react-icons/hi';
import * as Lucide from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path?: string;
  locked?: boolean;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  {
    icon: HiOutlineHome,
    label: 'Dashboard',
    path: '/admin'
  },
  {
    icon: HiOutlineShoppingBag,
    label: 'Products',
    path: '/admin/products'
  },
  {
    icon: HiOutlineClipboardList,
    label: 'Orders',
    path: '/admin/orders'
  },
  {
    icon: HiOutlineCollection,
    label: 'Category Manager',
    path: '/admin/category-manager'
  },
  {
    icon: HiOutlineTag,
    label: 'Promo Manager',
    path: '/admin/promo-manager'
  },
  {
    icon: HiOutlineDocumentText,
    label: 'Store Content',
    path: '/admin/store-content'
  },
  {
    icon: HiOutlinePhotograph,
    label: 'Photo Bank',
    path: '/admin/photo-bank'
  },
  {
    icon: HiOutlineChatAlt,
    label: 'Gemini Chatbot',
    path: '/admin/gemini-chatbot'
  },
  {
    icon: HiOutlineBell,
    label: 'Pop-up Manager',
    path: '/admin/popup-manager'
  },
  {
    icon: HiOutlineQuestionMarkCircle,
    label: 'Support Requests',
    path: '/admin/support-requests'
  },
];

export default function FloatingSidebar() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [unseenOrderCount, setState] = useState(0);
  const [expandedHorizontally, setExpandedHorizontally] = useState(false);
  const [expandedVertically, setExpandedVertically] = useState(false);
  const [activeItem, setActiveItem] = useState<string>('');
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  // Set active item based on current route
  useEffect(() => {
    const path = location.pathname;
    const item = NAV_ITEMS.find(item => item.path === path);
    if (item) {
      setActiveItem(item.label);
    }
  }, [location]);

  // Check if sidebar needs scroll indicator
  useEffect(() => {
    const checkScroll = () => {
      if (sidebarRef.current) {
        const { scrollHeight, clientHeight, scrollTop } = sidebarRef.current;
        // Show indicator if content exceeds visible area and not at bottom
        setShowScrollIndicator(scrollHeight > clientHeight && scrollTop < scrollHeight - clientHeight - 20);
      }
    };

    checkScroll();
    // Set up event listener for scrolling
    const sidebar = sidebarRef.current;
    if (sidebar) {
      sidebar.addEventListener('scroll', checkScroll);
      return () => sidebar.removeEventListener('scroll', checkScroll);
    }
  }, []);

  useEffect(() => {
    const fetchUnseenOrders = async () => {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('seen', '==', false));
      const querySnapshot = await getDocs(q);
      setState(querySnapshot.size);
    };

    fetchUnseenOrders();
    
    // Set up polling for new orders every 2 minutes
    const interval = setInterval(fetchUnseenOrders, 120000);
    return () => clearInterval(interval);
  }, []);

  const handleOrdersClick = async () => {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('seen', '==', false));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async (docSnap) => {
      await updateDoc(doc(db, 'orders', docSnap.id), { seen: true });
    });
    setState(0);
    setActiveModal('ordersUpdated');
    
    // Auto-dismiss notification after 3 seconds
    setTimeout(() => {
      setActiveModal(null);
    }, 3000);
  };

  const scrollToBottom = () => {
    if (sidebarRef.current) {
      sidebarRef.current.scrollTo({
        top: sidebarRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      <div className="fixed left-6 top-12 z-50 flex flex-col items-center">
        {/* Expand/Collapse Buttons */}
        <div className="flex items-center mb-2 mt-2">
          <div
            className="text-teal-500 hover:text-teal-600 transition-colors duration-300 cursor-pointer"
            onClick={() => setExpandedVertically(!expandedVertically)}
          >
            {expandedVertically ? "^" : "v"}
          </div>
          <div
            className="text-teal-500 hover:text-teal-600 transition-colors duration-300 cursor-pointer ml-1"
            onClick={() => setExpandedHorizontally(!expandedHorizontally)}
          >
            {expandedHorizontally ? "<" : ">"}
          </div>
        </div>

        {/* Main Sidebar */}
        <motion.div
          ref={sidebarRef}
          className={`flex flex-col p-4 gap-2 bg-gradient-to-r from-gray-900/90 to-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-teal-500/20 h-auto max-h-[calc(100vh-12rem)] overflow-y-auto transition-all duration-300 ${expandedHorizontally ? 'w-60' : 'w-20'}`}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {NAV_ITEMS.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
              className={`group w-full`}
            >
              {item.locked ? (
                <div
                  className={`
                    flex items-center justify-start gap-3 
                    rounded-xl py-3 px-3 cursor-not-allowed 
                    transition-all duration-300 bg-gray-800/30
                    border border-gray-700/50 hover:border-gray-600
                    relative ${activeItem === item.label ? 'bg-gray-700/50' : ''}
                    flex items-center justify-start gap-3 
                    rounded-xl py-3 px-3 cursor-not-allowed 
                    transition-all duration-300 bg-gray-800/30
                    border border-gray-700/50 hover:border-gray-600
                    relative ${activeItem === item.label ? 'bg-gray-700/50' : ''}
                  `}
                  title={`${item.label} (Coming Soon)`}
                >
                  <item.icon className={`h-6 w-6 flex-shrink-0 text-gray-400 transition-colors`} />
                  
                  <AnimatePresence>
                    {expandedHorizontally && (
                      <motion.span 
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="text-sm text-gray-400 font-medium whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  
                  <Lucide.LockClosed className="h-4 w-4 absolute top-1 right-1 text-gray-500" />
                </div>
              ) : (
                <Link
                  to={item.path || ''}
                  onClick={item.label === 'Orders' ? handleOrdersClick : undefined}
                  className={`
                    flex items-center justify-start gap-3
                    rounded-xl py-3 px-3
                    transition-all duration-300 
                    hover:bg-teal-500/10 active:scale-[0.98]
                    border ${activeItem === item.label 
                      ? 'border-teal-500 bg-teal-500/10' 
                      : 'border-transparent hover:border-teal-500/30'
                    }
                    relative group
                  `}
                  title={expandedHorizontally ? '' : item.label}
                  onMouseEnter={() => !expandedHorizontally && setActiveItem(item.label)}
                  onMouseLeave={() => !expandedHorizontally && setActiveItem('')}
                >
                  <motion.div
                    className="relative flex-shrink-0"
                    whileHover={{ scale: 1.1, color: '#2DD4BF' }}
                    whileTap={{ scale: 0.95, color: '#14B8A6' }}
                  >
                    <item.icon className={`h-6 w-6 ${activeItem === item.label ? 'text-teal-400' : 'text-gray-300'} transition-colors drop-shadow-glow group-hover:text-teal-400`} />
                    
                    {item.label === 'Orders' && unseenOrderCount > 0 && (
                      <motion.span 
                        className="absolute -top-2 -right-2 flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold shadow-lg"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        {unseenOrderCount}
                      </motion.span>
                    )}
                  </motion.div>
                  
                  <AnimatePresence>
                    {expandedHorizontally && (
                      <motion.span 
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className={`text-sm font-medium whitespace-nowrap overflow-hidden ${
                          activeItem === item.label ? 'text-teal-300' : 'text-gray-200'
                        } group-hover:text-teal-300`}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              )}
            </motion.div>
          ))}
        </motion.div>
        
        {/* Scroll Indicator */}
        <AnimatePresence>
          {showScrollIndicator && (
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onClick={scrollToBottom}
              className="mt-2 w-10 h-10 flex items-center justify-center bg-gray-800/80 backdrop-blur-sm border border-teal-500/30 rounded-full shadow-lg hover:bg-teal-500/20 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Lucide.ChevronRight className="h-5 w-5 rotate-90" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      
      {/* Notification Modal */}
      <AnimatePresence>
        {activeModal === 'ordersUpdated' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 bg-gray-900 border border-teal-500/30 rounded-lg p-4 shadow-lg backdrop-blur-lg z-50"
          >
            <div className="flex items-center gap-3">
              <div className="bg-teal-500/20 p-2 rounded-full">
                <HiOutlineClipboardList className="h-6 w-6 text-teal-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">Orders Updated</h3>
                <p className="text-gray-300 text-sm">All orders have been marked as seen</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
