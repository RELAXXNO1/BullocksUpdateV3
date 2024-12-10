import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatContext } from '../contexts/ChatContext';
import { Loader2, Send, Zap } from 'lucide-react';

export const AIChat: React.FC = () => {
  const [userInput, setUserInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const { 
    conversationContext, 
    modelStatus, 
    generateAIResponse, 
    addMessage, 
    initializeModel 
  } = useChatContext();

  useEffect(() => {
    const prepareModel = async () => {
      if (modelStatus && !modelStatus.isReady) {
        await initializeModel();
      }
    };

    prepareModel();
  }, [initializeModel, modelStatus]);

  const handleToggleChat = useCallback(async () => {
    if (!isOpen) {
      await initializeModel();
      // Scroll to chat container when opened
      setTimeout(() => {
        messageContainerRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'end' 
        });
      }, 100);
    }
    setIsOpen(!isOpen);
  }, [isOpen, initializeModel]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !modelStatus.isReady) return;

    addMessage(userInput, 'user');

    await generateAIResponse(userInput);

    setUserInput('');
  }, [userInput, modelStatus.isReady, addMessage, generateAIResponse]);

  const getModelStatusIndicator = () => {
    const statusColors = {
      red: 'bg-red-500',
      yellow: 'bg-yellow-500',
      green: 'bg-green-500'
    };

    return (
      <div 
        className={`w-3 h-3 rounded-full ${statusColors[modelStatus.color]} animate-pulse`}
      />
    );
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <motion.button
        onClick={handleToggleChat}
        className="bg-gradient-to-r from-teal-400 to-teal-600 text-white p-3 rounded-full shadow-lg hover:from-teal-500 hover:to-teal-700 transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Zap className="w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-16 right-0 w-96 bg-dark-700 rounded-xl shadow-2xl border border-dark-600"
          >
            <div className="flex items-center justify-between p-4 border-b border-dark-600">
              <h2 className="text-lg font-semibold text-teal-400 flex items-center space-x-2">
                <span>AI Assistant</span>
                {getModelStatusIndicator()}
              </h2>
              <div className="text-sm text-gray-400">
                {modelStatus.isInitializing 
                  ? 'Warming up...' 
                  : modelStatus.isReady 
                    ? 'Ready to chat' 
                    : 'Not available'}
              </div>
            </div>

            <div className="h-64 overflow-y-auto p-4 space-y-2" ref={chatContainerRef}>
              <AnimatePresence>
                <div ref={messageContainerRef}>
                  {conversationContext.messages.map((message) => (
                    <motion.div 
                      key={message.id} 
                      initial={{ opacity: 0, x: message.sender === 'user' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className={`p-3 rounded-lg max-w-[80%] ${
                        message.sender === 'user' 
                          ? 'bg-teal-500/20 text-right ml-auto' 
                          : 'bg-dark-600 text-left mr-auto'
                      }`}
                    >
                      {message.content}
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t border-dark-600 flex items-center space-x-2">
              <input 
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ask your AI assistant..."
                disabled={!modelStatus.isReady}
                className="flex-grow p-2 rounded-lg bg-dark-600 text-white placeholder-gray-400 disabled:opacity-50"
              />
              <button 
                type="submit" 
                disabled={!userInput.trim() || !modelStatus.isReady}
                className="bg-gradient-to-r from-teal-400 to-teal-600 text-white p-2 rounded-lg disabled:opacity-50 hover:from-teal-500 hover:to-teal-700"
              >
                {modelStatus.isInitializing ? <Loader2 className="animate-spin" /> : <Send />}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
