import React from 'react';
import { Send, Volume2, VolumeX, Mic } from 'lucide-react';
import { SuggestedQuestions } from './SuggestedQuestions';
import { motion } from 'framer-motion';
import { useTTS } from '../../../services/ttsService';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSend: () => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ input, setInput, handleSend, disabled }) => {
  const { speak, stop, isSpeaking } = useTTS();
  
  const inputRef = React.createRef<HTMLTextAreaElement>();

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const adjustHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 100)}px`;
    }
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      stop();
    } else if (input.trim()) {
      speak(input.trim());
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 border-t border-dark-400/30 bg-gradient-to-r from-dark-500/50 via-dark-600/50 to-dark-500/50"
    >
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              adjustHeight();
            }}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            disabled={disabled}
            className="w-full bg-dark-500/50 border border-dark-400/30 rounded-xl px-4 py-2 focus:outline-none focus:border-primary-500 text-secondary-200 placeholder-secondary-400 resize-none min-h-[38px] max-h-[100px] pr-20 text-sm"
            style={{ height: '38px' }}
          />
          <SuggestedQuestions />
          <div className="absolute right-2 bottom-1.5">
            <button
              onClick={toggleSpeech}
              className="p-1.5 hover:bg-dark-400/50 rounded-lg transition-colors text-secondary-400 hover:text-primary-400 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={disabled}
              title={isSpeaking ? "Stop Speaking" : "Speak Text"}
            >
              {isSpeaking ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>
            <button
              className="p-1.5 hover:bg-dark-400/50 rounded-lg transition-colors text-secondary-400 hover:text-primary-400 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={disabled}
              title="Voice input (Pro feature)"
            >
              <Mic className="h-4 w-4" />
            </button>
          </div>
        </div>
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
};