import { motion } from 'framer-motion';
import { Lock, Phone } from 'lucide-react';

interface FeatureLockModalProps {
  isOpen: boolean;
  featureName: string;
  onClose: () => void;
}

export function FeatureLockModal({ 
  isOpen, 
  featureName, 
  onClose 
}: FeatureLockModalProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-dark-600 rounded-super-elegant p-8 max-w-md w-full shadow-super-elegant border border-dark-400/30"
      >
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="bg-primary-600/20 p-4 rounded-full">
              <Lock className="h-12 w-12 text-primary-400" />
            </div>
          </div>
          
          <h3 className="text-2xl font-display font-bold gradient-text mb-4">
            Feature Locked
          </h3>
          
          <p className="text-secondary-300 mb-6">
            The "{featureName}" feature is currently locked. 
            Upgrade to Bullocks AI Pro to unlock advanced capabilities!
          </p>
          
          <p className="text-secondary-300 mb-4">
            Call Travis to discuss upgrade options:
          </p>
          
          <a 
            href="tel:+13303273343"
            className="inline-flex items-center gap-2 text-xl font-semibold text-primary-400 hover:text-primary-300 transition-colors mb-6"
          >
            <Phone className="h-6 w-6" />
            +1 (330) 327-3343
          </a>
          
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-dark-500 rounded-elegant hover:bg-dark-400 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
