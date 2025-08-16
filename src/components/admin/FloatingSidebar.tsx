import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Tag,
  FileText,
  Image,
  MessageSquare,
  HelpCircle,
  Archive,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Package, label: 'Products', path: '/admin/products' },
  { icon: ClipboardList, label: 'Orders', path: '/admin/orders' },
  { icon: Archive, label: 'Category Manager', path: '/admin/category-manager' },
  { icon: Tag, label: 'Promo Manager', path: '/admin/promo-manager' },
  { icon: FileText, label: 'Store Content', path: '/admin/store-content' },
  { icon: Image, label: 'Photo Bank', path: '/admin/photo-bank' },
  { icon: MessageSquare, label: 'Gemini Chatbot', path: '/admin/gemini-chatbot' },
  { icon: Bell, label: 'Pop-up Manager', path: '/admin/popup-manager' },
  { icon: HelpCircle, label: 'Support Requests', path: '/admin/support-requests' },
];

export default function FloatingSidebar({ onToggle }: { onToggle: (isExpanded: boolean) => void }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [unseenOrderCount, setUnseenOrderCount] = useState(0);
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    onToggle(isExpanded);
  }, [isExpanded, onToggle]);

  useEffect(() => {
    const fetchUnseenOrders = async () => {
      try {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('seen', '==', false));
        const querySnapshot = await getDocs(q);
        setUnseenOrderCount(querySnapshot.size);
      } catch (error) {
        console.error("Error fetching unseen orders:", error);
      }
    };

    fetchUnseenOrders();
    const interval = setInterval(fetchUnseenOrders, 120000); // Poll every 2 minutes
    return () => clearInterval(interval);
  }, []);

  const handleOrdersClick = async () => {
    if (unseenOrderCount > 0) {
      try {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('seen', '==', false));
        const querySnapshot = await getDocs(q);
        const updates = querySnapshot.docs.map(docSnap => updateDoc(doc(db, 'orders', docSnap.id), { seen: true }));
        await Promise.all(updates);
        setUnseenOrderCount(0);
      } catch (error) {
        console.error("Error updating orders:", error);
      }
    }
  };

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = location.pathname === item.path;
    const isOrders = item.label === 'Orders';

    return (
      <Link
        to={item.path}
        onClick={isOrders ? handleOrdersClick : undefined}
        className={`
          flex items-center w-full h-12 px-3.5 text-sm font-medium rounded-lg transition-all duration-200
          ${isActive
            ? 'bg-gray-700 text-white'
            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }
        `}
      >
        <item.icon className="w-5 h-5 mr-3" />
        <AnimatePresence>
          {isExpanded && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="whitespace-nowrap"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
        {isOrders && unseenOrderCount > 0 && (
          <motion.span
            className="ml-auto text-xs font-semibold text-white bg-red-500 rounded-full w-5 h-5 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {unseenOrderCount}
          </motion.span>
        )}
      </Link>
    );
  };

  return (
    <motion.div
      className="fixed top-0 left-0 h-full bg-gray-900 text-white flex flex-col z-50 shadow-2xl"
      animate={{ width: isExpanded ? 256 : 72 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex items-center relative"
            >
              <img src="/public/logos/DALL·E 2024-12-31 21.50.35 - A series of minimalistic logo designs featuring a large triangle with variations of a smaller superscript '10' positioned in the upper right corner. V (1)-fotor-bg-remover-20241231215642 (1).png" alt="Logo" className="h-8 w-auto shadow-lg shadow-teal-500/50 z-10" />
              <span className="ml-2 text-lg font-bold">Admin Panel</span>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-full hover:bg-gray-800 transition-colors"
        >
          {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        {NAV_ITEMS.map(item => <NavLink key={item.label} item={item} />)}
      </nav>

      <div className="px-2 py-4 border-t border-gray-800">
        <div className="space-y-2">
          <button className="flex items-center w-full h-12 px-3.5 text-sm font-medium text-gray-400 rounded-lg hover:bg-gray-800 hover:text-white transition-colors">
            <LogOut className="w-5 h-5 mr-3" />
            {isExpanded && <span className="whitespace-nowrap">Logout</span>}
          </button>
        </div>
        <div className="mt-4 p-3 bg-gray-800 rounded-lg">
          <div className="flex items-center">
            <img className="h-10 w-10 rounded-full object-cover" src="/src/assets/avatar.png" alt="User Avatar" />
            {isExpanded && (
              <div className="ml-3">
                {authLoading ? (
                  <p className="text-sm font-semibold text-white">Loading...</p>
                ) : user ? (
                  <>
                    <p className="text-sm font-semibold text-white">{user.email}</p>
                    <p className="text-xs text-gray-400">{user.isAdmin ? 'Admin' : 'User'}</p>
                  </>
                ) : (
                  <p className="text-sm font-semibold text-white">Not Logged In</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
