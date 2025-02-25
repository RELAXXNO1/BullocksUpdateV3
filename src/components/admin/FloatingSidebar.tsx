import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AiOutlineDashboard,
  AiOutlineShoppingCart,
  AiOutlineUnorderedList,
  AiOutlineTag,
  AiOutlineEdit,
  AiOutlinePicture,
  AiOutlineRobot,
  AiOutlineQuestionCircle,
  AiOutlineFolder,
  AiOutlineNotification
} from 'react-icons/ai';
import { Lock } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path?: string;
  locked?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    icon: AiOutlineDashboard,
    label: 'Dashboard',
    path: '/admin'
  },
  {
    icon: AiOutlineShoppingCart,
    label: 'Products',
    path: '/admin/products'
  },
  {
    icon: AiOutlineFolder,
    label: 'Category Manager',
    path: '/admin/category-manager'
  },
  {
    icon: AiOutlineEdit,
    label: 'Store Content',
    path: '/admin/store-content'
  },
  {
    icon: AiOutlineQuestionCircle,
    label: 'Support Requests',
    path: '/admin/support-requests'
  },
  {
    icon: AiOutlinePicture,
    label: 'Photo Bank',
    path: '/admin/photo-bank'
  },
  {
    icon: AiOutlineRobot,
    label: 'Gemini Chatbot',
    path: '/admin/gemini-chatbot'
  },
  {
    icon: AiOutlineUnorderedList,
    label: 'Orders',
    path: '/admin/orders'
  },
  {
    icon: AiOutlineTag,
    label: 'Promo Manager',
    path: '/admin/promo-manager'
  },
  {
    icon: AiOutlineNotification,
    label: 'Pop-up Manager',
    path: '/admin/popup-manager'
  }
];

export default function FloatingSidebar() {
  const [, setActiveModal] = useState<string | null>(null);
  const [unseenOrderCount, setUnseenOrderCount] = useState(0);

  useEffect(() => {
    const fetchUnseenOrders = async () => {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('seen', '==', false));
      const querySnapshot = await getDocs(q);
      setUnseenOrderCount(querySnapshot.size);
    };

    fetchUnseenOrders();
  }, []);

  const handleOrdersClick = async () => {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('seen', '==', false));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async (docSnap) => {
      await updateDoc(doc(db, 'orders', docSnap.id), { seen: true });
    });
    setUnseenOrderCount(0);
    setActiveModal('ordersUpdated');
  };

  return (
    <div className="fixed left-6 top-20 z-50 flex flex-col space-y-7">
      {NAV_ITEMS.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05, type: "spring", stiffness: 120 }}
          className="group w-16"
        >
          {item.locked ? (
            <div
              className={`
                flex flex-col items-center justify-center backdrop-blur-sm bg-transparent
                rounded-lg py-3 px-2 cursor-not-allowed opacity-50
                transition-all duration-300 group-hover:bg-dark-500/10
                relative hover:scale-110 active:scale-100
              `}
              title={`${item.label} (Coming Soon)`}
            >
              <item.icon className="h-7 w-7 text-gray-400 mb-1 transition-colors group-hover:text-purple-500" />
              <span className="text-xs text-gray-400 font-medium text-center transition-colors group-hover:text-purple-500 group-hover:text-base">{item.label}</span>
              <Lock className="h-4 w-4 absolute top-1 right-1 text-gray-500" />
            </div>
          ) : (
            <Link
              to={item.path || ''}
              onClick={item.label === 'Orders' ? handleOrdersClick : undefined}
              className={`
                flex flex-col items-center justify-center backdrop-blur-sm bg-transparent
                shadow-sm hover:shadow-teal-400/20 rounded-lg py-3 px-2
                transition-all duration-300 group-hover:bg-dark-500/10
                active:scale-[0.98] relative hover:scale-110 active:scale-100
              `}
              title={item.label}
            >
              <item.icon className="h-7 w-7 text-teal-400 transition-colors drop-shadow-glow mb-1 group-hover:text-purple-500" />
              <span className="text-xs text-teal-400 font-medium text-center text-shadow-outline drop-shadow-glow transition-colors group-hover:text-purple-500 group-hover:text-base">{item.label}</span>
              {item.label === 'Orders' && unseenOrderCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold">
                  {unseenOrderCount}
                </span>
              )}
            </Link>
          )}
        </motion.div>
      ))}
    </div>
  );
}
