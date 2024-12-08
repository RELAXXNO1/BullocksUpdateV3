import { Link } from 'react-router-dom';
import { Phone, MapPin, Clock, User } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LOGO_PATH, STORE_INFO } from '../../config/constants';

export default function StoreHeader() {
  const [showHours, setShowHours] = useState(false);

  const handleCall = () => {
    window.location.href = `tel:${STORE_INFO.phone.replace(/\D/g, '')}`;
  };

  const handleLocation = () => {
    window.open(STORE_INFO.mapUrl);
  };

  return (
    <header className="bg-dark-600/80 shadow-[0_4px_30px_rgba(0,0,0,0.3)] sticky top-0 z-40 backdrop-blur-md border-b border-dark-400/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-transparent to-teal-500/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,theme(colors.teal.500/0.1),transparent_50%)]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link 
            to="/" 
            className="flex items-center gap-4 hover-lift relative z-10"
          >
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
            className="flex items-center gap-6"
          >
            {[
              { 
                icon: Phone, 
                label: 'Call', 
                action: handleCall,
                title: 'Contact Us'
              },
              { 
                icon: MapPin, 
                label: 'Location', 
                action: handleLocation,
                title: 'Find Our Store'
              },
              { 
                icon: Clock, 
                label: 'Hours', 
                action: () => setShowHours(true),
                title: 'Store Hours'
              }
            ].map(({ icon: Icon, label, action, title }) => (
              <button
                key={label}
                onClick={action}
                title={title}
                className="group flex flex-col items-center text-secondary-400 hover:text-primary-400 transition-elegant px-3 py-2 -m-2 hover:bg-dark-600/20 rounded-lg cursor-pointer"
              >
                <Icon className="h-6 w-6 group-hover:scale-110 transition-transform" />
                <span className="text-xs mt-1 opacity-70 group-hover:opacity-100 transition-opacity">
                  {label}
                </span>
              </button>
            ))}
            
            <div className="h-8 w-px bg-dark-400 mx-4" />
            
            <Link
              to="/login"
              className="relative z-20 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-elegant transition-all duration-300 group shadow-[0_0_15px_rgba(20,184,166,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.4)]"
            >
              <User className="h-4 w-4 group-hover:rotate-12 transition-transform" />
              Sign In
            </Link>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showHours && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
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
      </AnimatePresence>
    </header>
  );
}