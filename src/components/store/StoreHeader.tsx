import { Link } from 'react-router-dom';
import { Phone, Clock, MapPin } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LOGO_PATH, STORE_INFO } from '../../config/constants';
import ReactDOM from 'react-dom';
import { useCartToggle } from '../../contexts/CartToggleContext';
import { ShoppingCart as ShoppingCartIcon } from 'lucide-react';
import UserMenu from '../ui/UserMenu';
import { useAuth } from '../../hooks/useAuth';
import ShoppingCart from './ShoppingCart';

export default function StoreHeader() {
  const [showHours, setShowHours] = useState(false);
  const { isCartEnabled } = useCartToggle();
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const { user } = useAuth();
  const isAdminOnStorePage = user?.isAdmin;

  // Existing handlers remain unchanged
  const handleCall = () => {
    window.location.href = `tel:${STORE_INFO.phone.replace(/\D/g, '')}`;
  };

  const toggleCart = () => {
    setIsCartModalOpen(!isCartModalOpen);
  };

  const toggleUserModal = () => {
    setIsUserModalOpen(prev => !prev);
  };

  const closeUserModal = () => {
    setIsUserModalOpen(false);
  };

  const HoursModal = () => {
    return ReactDOM.createPortal(
      <AnimatePresence>
        {showHours && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-dark-600/90 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full shadow-2xl border border-white/10 relative overflow-hidden"
            >
              {/* Glass reflections */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,theme(colors.teal.500/0.15),transparent_70%)]" />
              
              <h3 className="text-2xl font-display font-bold bg-gradient-to-r from-teal-300 to-teal-200 bg-clip-text text-transparent mb-6 text-center relative">
                Store Hours
              </h3>
              <div className="space-y-4 relative">
                <div className="bg-dark-500/50 backdrop-blur-sm p-4 rounded-xl border border-white/5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
                  <h4 className="font-semibold text-primary-400 mb-2 relative">In-Store Hours</h4>
                  <p className="text-secondary-300 relative">Open Daily: 8:00 AM - 10:00 PM</p>
                </div>
                <div className="bg-dark-500/50 backdrop-blur-sm p-4 rounded-xl border border-white/5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
                  <h4 className="font-semibold text-primary-400 mb-2 relative">Drive-Thru Hours</h4>
                  <p className="text-secondary-300 relative">Open Daily: 8:00 AM - 11:00 PM</p>
                </div>
              </div>
              <button
                onClick={() => setShowHours(false)}
                className="mt-6 w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative">Close</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    );
  };

  return (
    <header className="sticky top-0 relative z-40 overflow-hidden">
      {/* Enhanced glass effect background */}
      <div className="absolute inset-0 bg-dark-600/70 backdrop-blur-xl" />
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-transparent to-teal-500/10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,theme(colors.teal.500/0.15),transparent_60%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent" />
      
      {/* Subtle animated gradient */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 via-transparent to-teal-500/20 animate-gradient" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-4 hover-lift relative z-10 group">
            <motion.img
              src={LOGO_PATH}
              alt="Bullocks Smoke Shop"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="h-20 w-auto object-contain group-hover:brightness-110 transition-all duration-300"
            />
            <h1 className="text-2xl font-display font-bold hidden md:block bg-gradient-to-r from-teal-300 via-teal-200 to-teal-300 bg-clip-text text-transparent">
              Bullocks Smoke Shop
            </h1>
          </Link>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-6 relative"
          >
            {[
              {
                icon: Phone,
                label: 'Call',
                action: handleCall,
                title: 'Contact Us'
              },
              {
                icon: Clock,
                label: 'Hours',
                action: () => setShowHours(true),
                title: 'Store Hours'
              },
              {
                icon: MapPin,
                label: 'Location',
                action: () => window.open("https://www.google.com/maps/dir//400+Vernonview+Dr,+Mt+Vernon,+OH+43050/@40.4004795,-82.5389536,12z/data=!4m8!4m7!1m0!1m5!1m1!1s0x8839ccb9b3f11bed:0x4ca1ad52339bb0f0!2m2!1d-82.4566284!2d40.4004932?entry=ttu&g_ep=EgoyMDI0MTIxMS4wIKXMDSoASAFQAw%3D%3D", "_blank"),
                title: 'Come Pick it Up'
              }
            ].map(({ icon: Icon, label, action, title }) => (
              <button
                key={label}
                onClick={(e) => {
                  e.currentTarget.classList.add('active:scale-95');
                  setTimeout(() => {
                    e.currentTarget.classList.remove('active:scale-95');
                  }, 100);
                  action();
                }}
                title={title}
                className="group relative flex flex-col items-center text-secondary-300 hover:text-primary-300 transition-all duration-300 px-3 py-2 -m-2 rounded-xl cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-dark-500/0 group-hover:bg-dark-500/50 transition-all duration-300 backdrop-blur-sm rounded-xl" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                <Icon className="h-6 w-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-xs mt-1 opacity-70 group-hover:opacity-100 transition-all duration-300 relative z-10">
                  {label}
                </span>
              </button>
            ))}
            {isCartEnabled && (
              <button
                onClick={toggleCart}
                title="Shopping Cart"
                className="group relative flex flex-col items-center text-secondary-300 hover:text-primary-300 transition-all duration-300 px-3 py-2 -m-2 rounded-xl cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-dark-500/0 group-hover:bg-dark-500/50 transition-all duration-300 backdrop-blur-sm rounded-xl" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                <ShoppingCartIcon className="h-6 w-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-xs mt-1 opacity-70 group-hover:opacity-100 transition-all duration-300 relative z-10">
                  Cart
                </span>
              </button>
            )}
            {user ? (
              <UserMenu isOpen={isUserModalOpen} onClose={toggleUserModal} closeMenu={closeUserModal} showAdminLink={isAdminOnStorePage} />
            ) : (
              <Link 
                to="/login" 
                className="relative overflow-hidden bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-300 group"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative">Sign In</span>
              </Link>
            )}
          </motion.div>
        </div>
      </div>
      <HoursModal />
      <AnimatePresence>
        {isCartModalOpen && isCartEnabled && <ShoppingCart closeCart={() => setIsCartModalOpen(false)} />}
      </AnimatePresence>
    </header>
  );
}
