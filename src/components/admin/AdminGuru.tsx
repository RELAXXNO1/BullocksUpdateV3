import React, { useState, useCallback, useEffect, useRef } from 'react';
import { HfInference } from '@huggingface/inference';
import { Bot, Send, X } from 'lucide-react';

// Ensure the API key is imported securely
const HUGGINGFACE_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;

export const AdminGuru: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([
    { 
      text: "Hi there! I'm your Admin Guru, ready to help with marketing strategies, product naming, promotional ideas, and business insights. What can I assist you with today?", 
      isUser: false 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Hugging Face Inference client
  const hf = new HfInference(HUGGINGFACE_API_KEY);

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
      // Construct a specialized admin-focused prompt
      const systemPrompt = `
You are an AI assistant specializing in cannabis business management and marketing. 
Your primary goals are to:
1. Provide strategic marketing insights
2. Generate creative product names and branding ideas
3. Suggest promotional strategies
4. Offer business intelligence and trend analysis
5. Help with market positioning and competitive research

Key Focus Areas:
- Product naming conventions
- Marketing campaign strategies
- Promotional idea generation
- Brand positioning
- Market trend analysis
- Customer engagement tactics

Respond professionally, creatively, and provide actionable insights.
`;

      const conversationHistory = messages
        .map(msg => msg.isUser ? `Admin: ${msg.text}` : `Admin Guru: ${msg.text}`)
        .join('\n');
      
      const fullPrompt = `${systemPrompt}\n\nConversation History:\n${conversationHistory}\n\nAdmin: ${input}\n\nAdmin Guru:`;

      // Use text generation API
      const response = await hf.textGeneration({
        model: 'facebook/blenderbot-400M-distill',
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: 250,
          temperature: 0.7,
          top_p: 0.9
        }
      });

      // Clean and add AI response
      const cleanedResponse = response.generated_text
        ?.replace(fullPrompt, '')
        .trim()
        .replace(/^(Admin Guru:)?\s*/, '') || 'I apologize, but I couldn\'t generate a helpful response.';

      setMessages(prevMessages => [
        ...prevMessages, 
        { text: cleanedResponse, isUser: false }
      ]);
    } catch (error) {
      console.error('Error generating response:', error);
      setMessages(prevMessages => [
        ...prevMessages, 
        { text: 'I apologize, but there was an error processing your request. Our team is working on resolving this.', isUser: false }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (onClose) onClose();
  };

  return (
    <>
      <button 
        onClick={toggleChat}
        className="fixed bottom-4 right-4 bg-purple-600 text-white p-3 rounded-full shadow-xl hover:bg-purple-700 transition-colors z-50 
        animate-pulse-slow hover:animate-none
        ring-4 ring-purple-500/30 hover:ring-purple-500/50
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
            bg-gradient-to-r from-purple-600 to-purple-700 
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
              <p className="text-xs opacity-80 drop-shadow-sm">Your Business Strategy Assistant</p>
            </div>
            <button 
              onClick={toggleChat} 
              className="hover:bg-purple-800/50 p-2 rounded-full transition-colors 
              relative z-10
              transform hover:scale-110 active:scale-95"
            >
              <X size={20} className="drop-shadow-md" />
            </button>
          </div>
          
          <div className="h-[24rem] overflow-y-auto p-4 space-y-2 
            scrollbar-thin 
            scrollbar-thumb-purple-500 
            scrollbar-track-purple-100 
            dark:scrollbar-thumb-purple-700 
            dark:scrollbar-track-slate-700
            bg-gradient-to-br from-purple-50 to-white 
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
                    ? 'bg-purple-100 dark:bg-purple-900 self-end ml-auto' 
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
                bg-purple-50 dark:bg-slate-800 
                rounded-lg p-2 
                shadow-inner"
              >
                Generating response...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="flex p-4 border-t dark:border-slate-700 
            bg-gradient-to-r from-purple-50 to-white 
            dark:from-slate-900 dark:to-slate-800 
            rounded-b-xl 
            shadow-inner"
          >
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about marketing, product names, or business strategy..."
              className="flex-grow p-2 border rounded-l-lg 
                dark:bg-slate-700 dark:border-slate-600 
                focus:ring-2 focus:ring-purple-500 
                transition-all 
                backdrop-blur-sm
                shadow-inner
                hover:bg-purple-50 
                dark:hover:bg-slate-800"
            />
            <button 
              onClick={handleSendMessage}
              disabled={isLoading}
              className="bg-purple-600 text-white px-4 py-2 
                rounded-r-lg 
                hover:bg-purple-700 
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
