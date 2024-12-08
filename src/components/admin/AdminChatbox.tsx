import { useState, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useChatStore } from '../../store/useChatStore';
import { AIService } from '../../services/aiService';
import { ChatHeader } from './chat/ChatHeader';
import { ChatMessages } from './chat/ChatMessages';
import { ChatInput } from './chat/ChatInput';
import { ProModal } from './chat/ProModal';
import { Message } from '../../types/chat';

export default function AdminChatbox() {
  const [input, setInput] = useState('');
  const chatboxRef = useRef<HTMLDivElement>(null);
  const { 
    addMessage, 
    setIsTyping,
    setSelectedFeature,
    setShowProModal,
    clearMessages
  } = useChatStore();
  const aiService = AIService.getInstance();

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    // Add user message
    const userMessage: Message = {
      content: trimmedInput,
      sender: 'user',
      timestamp: new Date()
    };
    addMessage(userMessage);

    setInput('');
    setIsTyping(true);

    try {
      const response = await aiService.generateResponse(trimmedInput);
      
      if (response.requiresProFeature && response.proFeatureId) {
        setShowProModal(true);
        setSelectedFeature(response.proFeatureId);
      }

      setIsTyping(false);
      const aiMessage: Message = {
        content: response.text,
        sender: 'ai',
        timestamp: new Date()
      };
      addMessage(aiMessage);

      // If there are suggestions, add them as a separate message
      if (response.suggestions?.length) {
        setTimeout(() => {
          const suggestionsMessage: Message = {
            content: response.suggestions!.join('\n'),
            sender: 'ai',
            timestamp: new Date()
          };
          addMessage(suggestionsMessage);
        }, 500);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      setIsTyping(false);
      const errorMessage: Message = {
        content: "I'm having trouble processing that request. Please try again.",
        sender: 'ai',
        timestamp: new Date()
      };
      addMessage(errorMessage);
    }
  };

  const handleReset = () => {
    clearMessages();
    setInput('');
  };

  return (
    <>
      <div 
        ref={chatboxRef}
        className="mt-3 bg-dark-600/95 backdrop-blur-md rounded-lg shadow-super-elegant border border-dark-400/30 h-[500px] overflow-hidden flex flex-col"
      >
        <ChatHeader onReset={handleReset} />
        <ChatMessages />
        <ChatInput 
          input={input}
          setInput={setInput}
          handleSend={handleSend}
          disabled={false}
        />
      </div>

      <AnimatePresence>
        <ProModal />
      </AnimatePresence>
    </>
  );
}