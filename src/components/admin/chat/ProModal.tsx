import { motion } from 'framer-motion';
import { Lock, Sparkles } from 'lucide-react';
import { useChatStore } from '../../../store/useChatStore';
import { PRO_FEATURES } from '../../../constants/chatKnowledge';

export function ProModal() {
  const { showProModal, selectedFeature, setShowProModal } = useChatStore();

  if (!showProModal || !selectedFeature) return null;

  const feature = typeof selectedFeature === 'string' 
    ? PRO_FEATURES[selectedFeature as keyof typeof PRO_FEATURES]
    : selectedFeature;

  return (
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
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="bg-primary-600/20 p-4 rounded-full">
              <Sparkles className="h-12 w-12 text-primary-400" />
            </div>
          </div>
          <h3 className="text-2xl font-display font-bold gradient-text mb-6">
            Upgrade to Bullocks AI Pro
          </h3>
          <div className="text-left mb-6">
            <h4 className="text-lg font-semibold text-primary-400 mb-2">
              {feature.name}
            </h4>
            <p className="text-secondary-300 mb-4">
              {feature.description}
            </p>
            <div className="space-y-2">
              {(
                (feature as { features: string[] }).features ?? 
                (feature as { currentFeatures: { pro: string[] } }).currentFeatures?.pro ?? 
                []
              ).map((featureItem: string, index: number) => (
                <div key={index} className="flex items-center gap-2 text-secondary-400">
                  <Lock className="h-4 w-4 text-primary-400" />
                  <span>{featureItem}</span>
                </div>
              ))}
            </div>
          </div>
          {feature.benefits && (
            <div className="text-left mb-6">
              <h4 className="text-lg font-semibold text-primary-400 mb-2">
                Benefits
              </h4>
              <div className="space-y-2">
                {feature.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-secondary-400">
                    <Sparkles className="h-4 w-4 text-primary-400" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="text-secondary-300 mb-3">
            Contact Travis for Upgrades or Questions
          </p>
          <a
            href="tel:+13303273343"
            className="inline-block text-primary-400 text-xl font-semibold mb-5 hover:text-primary-300 transition-colors"
          >
            +1 (330) 327-3343
          </a>
          <div className="flex justify-center">
            <button
              onClick={() => setShowProModal(false)}
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