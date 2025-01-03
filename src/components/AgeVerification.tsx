import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ShieldCheck, Calendar } from 'lucide-react';
import { LOGO_PATH } from '../config/constants';

export default function AgeVerification() {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem('age-verified');
    if (!verified) {
      setIsOpen(true);
    }
  }, []);

  const handleVerification = (isAdult: boolean) => {
    if (!isAdult) {
      setError(true);
      return;
    }
    localStorage.setItem('age-verified', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-mesh opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.teal.500/0.1),transparent_70%)]" />
      
      <motion.div
        animate={{ scale: 1, opacity: 1 }}
        className="bg-dark-600/50 backdrop-blur-xl rounded-2xl shadow-super-elegant border border-dark-400/30 p-8 max-w-md w-full relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-transparent to-teal-500/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.teal.500/0.1),transparent_70%)]" />
        
        <div className="relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block mb-6"
            >
              <img 
                src={LOGO_PATH}
                alt="High10 Wellness"
                className="h-24 mx-auto drop-shadow-[0_0_8px_theme(colors.teal.500)]"
              />
            </motion.div>
            
              <h2 className="text-3xl font-display font-bold mb-4">
                <span className="bg-gradient-to-r from-teal-300 via-teal-400 to-teal-300 bg-clip-text text-transparent">
                  Age Verification Required
                </span>
              </h2>
              <p className="text-gray-300 text-lg mb-8">
                You must be 21 years or older to visit High10 Wellness.
              </p>
            

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-6"
                >
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <p className="text-red-400 text-sm">
                      Sorry, you must be 21 or older to access this site.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3">
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onClick={() => handleVerification(true)}
                className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200 shadow-[0_0_15px_rgba(20,184,166,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.4)]"
              >
                <ShieldCheck className="h-5 w-5" />
                Yes, I'm 21 or older
              </motion.button>
              
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onClick={() => handleVerification(false)}
                className="w-full py-3 px-4 bg-dark-500 hover:bg-dark-400 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors border border-dark-400/30"
              >
                <Calendar className="h-5 w-5" />
                No, I'm under 21
              </motion.button>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 text-sm text-gray-400"
            >
              By clicking "Yes", you confirm that you are of legal age to view our products.
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
