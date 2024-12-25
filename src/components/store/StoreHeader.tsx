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
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-dark-600 rounded-super-elegant p-8 max-w-md w-full shadow-super-elegant border border-dark-400/30"
            >
              <h3 className="text-2xl font-display font-bold gradient-text mb-6 text-center">
                Store Hours
              </h3>
              <div className="space-y-4">
                <div className="bg-dark-500 p-4 rounded-elegant">
                  <h4 className="font-semibold text-primary-400 mb-2">In-Store Hours</h4>
                  <p className="text-secondary-300">Open Daily: 8:00 AM - 10:00 PM</p>
                </div>
                <div className="bg-dark-500 p-4 rounded-elegant">
                  <h4 className="font-semibold text-primary-400 mb-2">Drive-Thru Hours</h4>
                  <p className="text-secondary-300">Open Daily: 8:00 AM - 11:00 PM</p>
                </div>
              </div>
              <button
                onClick={() => setShowHours(false)}
                className="mt-6 w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-elegant transition-elegant"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    );
  };


  return (
    <header className="bg-dark-600/80 shadow-[0_4px_30px_rgba(0,0,0,0.3)] sticky top-0 z-40 backdrop-blur-md border-b border-dark-400/30 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-transparent to-teal-500/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,theme(colors.teal.500/0.1),transparent_50%)]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-4 hover-lift relative z-10">
            <motion.img
              src={LOGO_PATH}
              alt="Bullocks Smoke Shop"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="h-20 w-auto object-contain"
            />
            <h1 className="text-2xl font-display font-bold hidden md:block bg-gradient-to-r from-teal-300 via-teal-400 to-teal-300 bg-clip-text text-transparent">
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
                className="group relative flex flex-col items-center text-secondary-400 hover:text-primary-400 transition-all duration-200 px-3 py-2 -m-2 hover:bg-dark-600/20 rounded-lg cursor-pointer 
                  before:absolute before:inset-0 before:bg-primary-500/10 before:opacity-0 before:transition-opacity before:rounded-lg
                  hover:before:opacity-100 
                  active:before:opacity-20"
              >
                <Icon className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-xs mt-1 opacity-70 group-hover:opacity-100 transition-opacity duration-200">
                  {label}
                </span>
              </button>
            ))}
            {isCartEnabled && (
              <button
                onClick={toggleCart}
                title="Shopping Cart"
                className="group relative flex flex-col items-center text-secondary-400 hover:text-primary-400 transition-all duration-200 px-3 py-2 -m-2 hover:bg-dark-600/20 rounded-lg cursor-pointer 
                  before:absolute before:inset-0 before:bg-primary-500/10 before:opacity-0 before:transition-opacity before:rounded-lg
                  hover:before:opacity-100 
                  active:before:opacity-20"
              >
                <ShoppingCartIcon className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-xs mt-1 opacity-70 group-hover:opacity-100 transition-opacity duration-200">
                  Cart
                </span>
              </button>
            )}
            {user ? (
              <UserMenu isOpen={isUserModalOpen} onClose={toggleUserModal} closeMenu={closeUserModal} showAdminLink={isAdminOnStorePage} />
            ) : (
              <Link to="/login" className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded-elegant transition-elegant">
                Sign In
              </Link>
            )}
          </motion.div>
        </div>
      </div>
      <HoursModal />
      <AnimatePresence>
        {isCartModalOpen && isCartEnabled && <ShoppingCart  closeCart={() => setIsCartModalOpen(false)} />}
      </AnimatePresence>
    </header>
  );
}
