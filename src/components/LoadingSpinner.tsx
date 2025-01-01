import { LOGO_PATH } from '../config/constants';
import { motion } from 'framer-motion';

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen flex-col relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.teal.500/0.15),transparent_70%)]" />
      <div className="text-center">
        <motion.div 
          className="relative w-32 h-32 rounded-full"
          animate={{ 
            rotate: 360,
            scale: [0.95, 1, 0.95]
          }}
          transition={{
            rotate: {
              duration: 3,
              ease: "linear"
            },
            scale: {
              duration: 2,
              ease: "easeInOut"
            },
            repeat: Infinity,
          }}
        >
          <div className="absolute inset-0 rounded-full border-4 border-teal-500/20" />
          <motion.div 
            className="absolute inset-0 rounded-full border-t-4 border-teal-400"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <img 
            src={LOGO_PATH}
            alt="High10 Wellness" 
            className="absolute inset-0 w-full h-full object-contain p-4 filter brightness-110 drop-shadow-[0_0_8px_theme(colors.teal.500)]"
          />
        </motion.div>
        <motion.p 
          className="mt-4 text-gray-400"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          Loading...
        </motion.p>
      </div>
    </div>
  );
}
