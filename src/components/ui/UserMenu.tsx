import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThreeBars } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center justify-center text-secondary-400 hover:text-primary-400 transition-all duration-200 px-3 py-2 -m-2 hover:bg-dark-600/20 rounded-lg cursor-pointer 
                  before:absolute before:inset-0 before:bg-primary-500/10 before:opacity-0 before:transition-opacity before:rounded-lg
                  hover:before:opacity-100 
                  active:before:opacity-20"
      >
        <ThreeBars className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute right-0 mt-2 bg-dark-600 rounded-super-elegant shadow-super-elegant border border-dark-400/30 p-4 z-10"
          >
            {user ? (
              <>
                <Link
                  to="/account"
                  className="block px-4 py-2 text-white hover:bg-dark-500 rounded-md"
                >
                  Account Details
                </Link>
                <button
                  onClick={handleLogout}
                  className="block px-4 py-2 text-white hover:bg-dark-500 rounded-md mt-2"
                >
                  Log Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block px-4 py-2 text-white hover:bg-dark-500 rounded-md"
              >
                Sign In
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
