import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Bot, Send, X } from 'lucide-react';
import { ChatService } from '../../services/chatService';

// Ensure the API key and model are imported securely
const HUGGINGFACE_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;
const HUGGINGFACE_MODEL = 'meta-llama/Llama-3.2-3B-Instruct'; // Updated model

export const Guru: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([
    { 
      text: "Hi there! I'm your THCA Guru, ready to help you with any questions about our cannabis products, their benefits, usage, and more. How can I assist you today?", 
      isUser: false 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize ChatService
  const chatService = useRef(new ChatService({
    apiKey: HUGGINGFACE_API_KEY,
    model: HUGGINGFACE_MODEL,
    maxTokens: 250,
    temperature: 0.6
  }));

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = useCallback(async () => {
    if (!input.trim()) return;

    // Add user message
    const newMessages = [...messages, { text: input, isUser: true }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Use ChatService to generate response
      const response = await chatService.current.generateResponse(input);

      // Add AI response
      setMessages(prevMessages => [
        ...prevMessages, 
        { text: response.text, isUser: false }
      ]);
    } catch (error: any) {
      console.error('Error generating response:', error);
      setMessages(prevMessages => [
        ...prevMessages, 
        { text: 'I apologize, but there was an error processing your request. Our team is working on resolving this.', isUser: false }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, messages]);

  const toggleChat = () => setIsOpen(!isOpen);

  return (
    <>
      <button 
        onClick={toggleChat}
        className="fixed bottom-4 right-4 bg-teal-600 text-white p-3 rounded-full shadow-xl hover:bg-teal-700 transition-colors z-50 
        animate-pulse-slow hover:animate-none
        ring-4 ring-teal-500/30 hover:ring-teal-500/50
        transform hover:scale-110 active:scale-95
        transition-all duration-300 ease-in-out"
      >
        {isOpen ? <X /> : <Bot />}
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 md:w-96 
          bg-white dark:bg-slate-800 
          rounded-xl border dark:border-slate-700 
          z-50 
          transition-all duration-300 ease-in-out 
          transform hover:scale-[1.02]
          shadow-2xl hover:shadow-3xl
          backdrop-blur-sm
          bg-opacity-90 dark:bg-opacity-95
          border-opacity-50
          animate-fade-in-up"
        >
          <div className="p-4 border-b dark:border-slate-700 
            bg-gradient-to-r from-teal-600 to-teal-700 
            text-white 
            rounded-t-xl 
            flex justify-between items-center
            shadow-lg
            relative
            overflow-hidden
            before:absolute before:inset-0 
            before:bg-gradient-to-r 
            before:from-white/10 
            before:to-transparent 
            before:mix-blend-overlay"
          >
            <div className="relative z-10">
              <h2 className="text-lg font-bold drop-shadow-md">Guru</h2>
              <p className="text-xs opacity-80 drop-shadow-sm">Your Cannabis Product Expert</p>
            </div>
            <button 
              onClick={toggleChat} 
              className="hover:bg-teal-800/50 p-2 rounded-full transition-colors 
              relative z-10
              transform hover:scale-110 active:scale-95"
            >
              <X size={20} className="drop-shadow-md" />
            </button>
          </div>
          
          <div className="h-[24rem] overflow-y-auto p-4 space-y-2 
            scrollbar-thin 
            scrollbar-thumb-teal-500 
            scrollbar-track-teal-100 
            dark:scrollbar-thumb-teal-700 
            dark:scrollbar-track-slate-700
            bg-gradient-to-br from-teal-50 to-white 
            dark:from-slate-900 dark:to-slate-800"
          >
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`
                  max-w-[80%] p-2 rounded-lg 
                  shadow-md hover:shadow-xl 
                  transition-all duration-300 ease-in-out 
                  ${message.isUser 
                    ? 'bg-teal-100 dark:bg-teal-900 self-end ml-auto' 
                    : 'bg-slate-100 dark:bg-slate-700 mr-auto'}
                  transform hover:scale-[1.02]
                  border border-opacity-20
                  backdrop-blur-sm
                `}
              >
                {message.text}
              </div>
            ))}
            {isLoading && (
              <div className="text-center text-slate-500 dark:text-slate-400 
                animate-pulse
                bg-teal-50 dark:bg-slate-800 
                rounded-lg p-2 
                shadow-inner"
              >
                Generating response...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="flex p-4 border-t dark:border-slate-700 
            bg-gradient-to-r from-teal-50 to-white 
            dark:from-slate-900 dark:to-slate-800 
            rounded-b-xl 
            shadow-inner"
          >
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about THCA products, benefits, or usage..."
              className="flex-grow p-2 border rounded-l-lg 
                dark:bg-slate-700 dark:border-slate-600 
                focus:ring-2 focus:ring-teal-500 
                transition-all 
                backdrop-blur-sm
                shadow-inner
                hover:bg-teal-50 
                dark:hover:bg-slate-800"
            />
            <button 
              onClick={handleSendMessage}
              disabled={isLoading}
              className="bg-teal-600 text-white px-4 py-2 
                rounded-r-lg 
                hover:bg-teal-700 
                disabled:opacity-50 
                transition-colors 
                group
                shadow-md 
                hover:shadow-xl
                active:shadow-inner"
            >
              <Send size={20} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
