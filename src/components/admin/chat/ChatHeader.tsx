import { Bot, Minimize2, Maximize2, Crown, RefreshCw } from 'lucide-react';
import { useChatStore } from '../../../store/useChatStore';
import { motion } from 'framer-motion';

interface ChatHeaderProps {
  onReset?: () => void;
}

export function ChatHeader({ onReset }: ChatHeaderProps) {
  const { isMinimized, setIsMinimized } = useChatStore();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-between p-4 border-b border-dark-400/30 bg-gradient-to-r from-dark-500/50 via-dark-600/50 to-dark-500/50"
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="relative">
            <Bot className="h-5 w-5 text-primary-400" />
            <motion.div 
              className="absolute -bottom-1 -right-1 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-dark-600"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-primary-400">Bullocks AI</h3>
            <span className="flex items-center gap-1 text-xs bg-primary-600/20 text-primary-400 px-2 py-0.5 rounded-full">
              <Crown className="h-3 w-3" /> Basic
            </span>
          </div>
          <p className="text-xs text-secondary-400">Always here to help</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onReset && (
          <button
            onClick={onReset}
            title="Reset Chat"
            className="p-1.5 hover:bg-dark-500 rounded-lg transition-colors text-secondary-300 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="p-1.5 hover:bg-dark-500 rounded-lg transition-colors text-secondary-300 hover:text-white"
        >
          {isMinimized ? (
            <Maximize2 className="h-4 w-4" />
          ) : (
            <Minimize2 className="h-4 w-4" />
          )}
        </button>
      </div>
    </motion.div>
  );
}