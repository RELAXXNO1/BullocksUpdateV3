import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatContext } from '../contexts/ChatContext';
import { Loader2, Send, Zap, Trash2, X } from 'lucide-react';
import { HfInference } from "@huggingface/inference";

const HUGGING_FACE_API_KEY = import.meta.env.VITE_HUGGING_FACE_API_KEY;

interface AIMessage {
  id?: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
}

export const AIChat: React.FC = () => {
  const [userInput, setUserInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  const { 
    addMessage 
  } = useChatContext();

  const [messages, setMessages] = useState<AIMessage[]>([
    {
      role: 'ai',
      content: 'Welcome to Bullocks! How can I assist you today? I\'m here to help with product information, recommendations, and any questions you might have.',
      timestamp: Date.now()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // Enhanced fallback models with more diverse capabilities
  const fallbackModels = [
    "mistralai/Mistral-7B-Instruct-v0.2",
    "meta-llama/Llama-3-8b-chat-hf",
    "google/gemma-7b-it"
  ];

  // Comprehensive system prompt with clear guidelines
  const createSystemPrompt = () => {
    const contexts = [
      "You are an AI assistant for Bullocks Smoke Shop.",
      "Your goal is to provide helpful, clear, and professional customer service.",
      "Always respond in a friendly, informative, and structured manner.",
      "Prioritize clarity and provide specific, actionable information.",
      "If a query is unclear, ask clarifying questions.",
      "Maintain a professional tone that is warm and approachable.",
      "Focus on customer needs and product knowledge.",
      "Be prepared to discuss product details, recommendations, and general store information.",
      "Avoid sharing personal opinions or inappropriate content.",
      "If a question is outside your expertise, admit limitations and offer to help find the right information."
    ];

    return contexts.join(" ");
  };

  // Response formatting and structuring function
  const formatResponse = (content: string) => {
    // Remove any potential formatting artifacts
    let cleanedContent = content.replace(/^(\s*\n)+|(\n\s*)+$/g, '').trim();

    // Structure response with clear formatting
    const structuredResponse = cleanedContent
      .split('\n')
      .map(paragraph => {
        // Capitalize first letter of each paragraph
        return paragraph.charAt(0).toUpperCase() + paragraph.slice(1);
      })
      .join('\n\n');

    return structuredResponse;
  };

  const generateAIResponse = async (userMessage: string) => {
    if (!HUGGING_FACE_API_KEY) {
      const errorMessage: AIMessage = {
        role: 'ai',
        content: "I apologize, but our AI service is temporarily unavailable. Please try again later or contact our customer support.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    setIsLoading(true);

    // Create user message
    const userAIMessage: AIMessage = {
      role: 'user',
      content: userMessage,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userAIMessage]);

    try {
      const client = new HfInference(HUGGING_FACE_API_KEY);
      let responseContent = "";

      const systemPrompt = createSystemPrompt();

      for (const model of fallbackModels) {
        try {
          const stream = client.chatCompletionStream({
            model: model,
            messages: [
              { role: "system", content: systemPrompt },
              { 
                role: "user", 
                content: userMessage 
              }
            ],
            max_tokens: 300,
            temperature: 0.7,
            top_p: 0.9,
            frequency_penalty: 0.5,
            presence_penalty: 0.5
          });

          for await (const chunk of stream) {
            if (chunk.choices && chunk.choices.length > 0) {
              const newContent = chunk.choices[0].delta.content;
              if (newContent) {
                responseContent += newContent;
              }
            }
          }

          // If we successfully get a response, break the loop
          if (responseContent) break;
        } catch (modelError) {
          console.warn(`Failed with model ${model}:`, modelError);
          continue;
        }
      }

      // Format and clean the response
      const formattedResponse = formatResponse(responseContent || 
        "I apologize, but I'm currently unable to process your request. Could you please rephrase your question?");

      // Create AI response message
      const aiResponseMessage: AIMessage = {
        role: 'ai',
        content: formattedResponse,
        timestamp: Date.now()
      };

      // Update messages
      setMessages(prev => [...prev, aiResponseMessage]);
      addMessage(aiResponseMessage.content, 'ai');
    } catch (error) {
      console.error("AI Generation Error:", error);
      const errorMessage: AIMessage = {
        role: 'ai',
        content: "I'm experiencing technical difficulties at the moment. Our team is working to resolve this. Would you like to try again or speak with a human representative?",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setUserInput('');
    }
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (userInput.trim()) {
      generateAIResponse(userInput.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'ai',
        content: 'Welcome to Bullocks! How can I assist you today? I\'m here to help with product information, recommendations, and any questions you might have.',
        timestamp: Date.now()
      }
    ]);
  };

  const handleResetChat = () => {
    handleClearChat();
    setUserInput('');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="bg-white dark:bg-gray-800 shadow-2xl rounded-xl border dark:border-gray-700 relative"
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="Close Chat"
            >
              <X size={24} />
            </button>

            {/* Chat Header with Clear and Reset Buttons */}
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Bullocks AI Assistant
              </h3>
              <div className="flex space-x-2">
                <button 
                  onClick={handleClearChat}
                  className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                  title="Clear Chat"
                >
                  <Trash2 size={20} />
                </button>
                <button 
                  onClick={handleResetChat}
                  className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                  title="Reset Chat"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Chat Messages Container */}
            <div 
              ref={messageContainerRef}
              className="h-96 overflow-y-auto p-4 space-y-3"
            >
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex ${
                    msg.role === 'ai' 
                      ? 'justify-start' 
                      : 'justify-end'
                  }`}
                >
                  <div 
                    className={`
                      max-w-[75%] p-3 rounded-lg 
                      ${msg.role === 'ai' 
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200' 
                        : 'bg-blue-500 text-white'}
                    `}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                    <Loader2 className="animate-spin" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t dark:border-gray-700 flex items-center">
              <input 
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="How can I help you today?"
                className="flex-grow p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
              />
              <button 
                onClick={handleSendMessage}
                className="ml-2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
              >
                <Send size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-full shadow-2xl hover:bg-blue-600"
      >
        <Zap size={24} />
      </motion.button>
    </div>
  );
};