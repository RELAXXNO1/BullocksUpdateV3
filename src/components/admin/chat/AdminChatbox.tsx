import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Crown, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useChatState } from '../../../contexts/ChatContext';
import { formatTimestamp } from '../../../utils/dateUtils';

interface AdminChatboxProps {
  onClose: () => void;
}

export default function AdminChatbox({ onClose }: AdminChatboxProps) {
  const [input, setInput] = useState('');
  const { 
    messages, 
    addMessage, 
    generateAIResponse 
  } = useChatState();
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    addMessage(input, 'user');
    setInput('');
    setIsTyping(true);

    try {
      await generateAIResponse(input);
      setIsTyping(false);
    } catch (error) {
      console.error('AI Response Generation Error:', error);
      setIsTyping(false);
      addMessage('I apologize, but I encountered an error processing your request.', 'ai');
    }
  };

  return (
    <div className="mt-3 bg-dark-600/95 backdrop-blur-md rounded-lg shadow-super-elegant border border-dark-400/30 overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-dark-400/30">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bot className="h-5 w-5 text-primary-400" />
            <motion.div 
              className="absolute -bottom-1 -right-1 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-dark-600"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
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
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-dark-500 rounded-lg transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="h-[400px] overflow-y-auto p-4 custom-scrollbar">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
          >
            <div
              className={`inline-block max-w-[80%] p-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-primary-600/90 text-white'
                  : 'bg-dark-500/90 text-gray-200'
              }`}
            >
              {message.content}
            </div>
            <div className="text-xs text-secondary-400 mt-1">
              {formatTimestamp(message.timestamp)}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-2 text-secondary-400">
            <motion.div className="flex gap-1">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="w-2 h-2 bg-primary-400 rounded-full"
              />
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                className="w-2 h-2 bg-primary-400 rounded-full"
              />
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                className="w-2 h-2 bg-primary-400 rounded-full"
              />
            </motion.div>
            <span className="text-sm">AI is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-dark-400/30">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-dark-500 border border-dark-400/30 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-500 text-secondary-200 placeholder-secondary-400"
          />
          <button
            onClick={handleSend}
            className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}