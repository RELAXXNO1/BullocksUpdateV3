import React, { createContext, useState, useContext, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { 
  Message, 
  ConversationContext,
  AIModelStatus
} from '../types/chat';
import { ChatService } from '../services/chatService';

interface ChatContextType {
  conversationContext: ConversationContext;
  modelStatus: AIModelStatus;
  addMessage: (content: string, sender: 'user' | 'ai') => void;
  generateAIResponse: (input: string) => Promise<void>;
  resetConversation: () => void;
  initializeModel: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversationContext, setConversationContext] = useState<ConversationContext>(() => {
    const sessionId = uuidv4();
    return {
      sessionId,
      messages: [{
        id: uuidv4(),
        content: "Hello! I'm your AI assistant. How can I help you today?",
        sender: 'ai',
        timestamp: Date.now(),
        context: {
          sessionId,
          category: 'ai_welcome',
          originalInput: 'Initial greeting'
        }
      }],
      lastInteractionTimestamp: Date.now()
    };
  });

  const [modelStatus, setModelStatus] = useState<AIModelStatus>({
    isInitializing: false,
    isReady: false,
    temperature: 0,
    color: 'red'
  });

  const config = {
    apiKey: import.meta.env.VITE_HUGGINGFACE_API_KEY || '',
    model: 'mistralai/Mistral-7B-Instruct-v0.1',
    maxTokens: 250,
    temperature: 0.7
  };

  if (!config.apiKey) {
    console.error('Hugging Face API key is missing. Please set VITE_HUGGINGFACE_API_KEY in your environment.');
  }

  const chatService = new ChatService(config);

  const initializeModel = useCallback(async () => {
    try {
      if (!config.apiKey) {
        throw new Error('Hugging Face API key is missing');
      }

      setModelStatus(prev => ({ ...prev, isInitializing: true, color: 'yellow' }));
      
      // Actual model initialization
      await chatService.testConnection();
      
      setModelStatus({
        isInitializing: false,
        isReady: true,
        temperature: config.temperature,
        color: 'green'
      });
    } catch (error) {
      console.error('Model Initialization Error:', error);
      setModelStatus({
        isInitializing: false,
        isReady: false,
        temperature: 0,
        color: 'red'
      });
      
      // Optionally show a user-friendly error message
      addMessage('Unable to connect to AI service. Please try again later.', 'ai');
    }
  }, []);

  const addMessage = useCallback((content: string, sender: 'user' | 'ai') => {
    const newMessage: Message = {
      id: uuidv4(),
      content,
      sender,
      timestamp: Date.now(),
      context: {
        sessionId: conversationContext.sessionId,
        originalInput: content,
        category: sender === 'user' ? 'user_query' : 'ai_response'
      }
    };

    setConversationContext(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      lastInteractionTimestamp: Date.now()
    }));
  }, [conversationContext.sessionId]);

  const generateAIResponse = useCallback(async (input: string) => {
    if (!modelStatus.isReady) {
      addMessage('Please wait, the AI is warming up...', 'ai');
      
      // Attempt to reinitialize the model
      try {
        await initializeModel();
      } catch (initError) {
        console.error('Failed to reinitialize model:', initError);
        addMessage('Sorry, the AI service is currently unavailable.', 'ai');
        return;
      }
    }

    try {
      const aiResponse = await chatService.generateResponse(input);
      
      if (!aiResponse.text) {
        throw new Error('Empty AI response');
      }

      addMessage(aiResponse.text, 'ai');
    } catch (error) {
      console.error('AI Response Generation Error:', error);
      
      // Provide a more informative error message
      const errorMessages = [
        'I apologize, but I could not generate a response at this time.',
        'There seems to be an issue with the AI service.',
        'Please try your request again later.'
      ];
      
      const randomErrorMessage = errorMessages[Math.floor(Math.random() * errorMessages.length)];
      addMessage(randomErrorMessage, 'ai');
    }
  }, [addMessage, modelStatus.isReady, initializeModel]);

  const resetConversation = useCallback(() => {
    const newSessionId = uuidv4();
    setConversationContext({
      sessionId: newSessionId,
      messages: [{
        id: uuidv4(),
        content: "Hello! I'm your AI assistant. How can I help you today?",
        sender: 'ai',
        timestamp: Date.now(),
        context: {
          sessionId: newSessionId,
          category: 'ai_welcome',
          originalInput: 'Initial conversation start'
        }
      }],
      lastInteractionTimestamp: Date.now()
    });
  }, []);

  return (
    <ChatContext.Provider value={{
      conversationContext,
      modelStatus,
      addMessage,
      generateAIResponse,
      resetConversation,
      initializeModel
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

export const useChatState = () => {
  const { 
    conversationContext, 
    modelStatus,
    addMessage, 
    generateAIResponse, 
    resetConversation,
    initializeModel
  } = useChatContext();

  return {
    messages: conversationContext.messages,
    sessionId: conversationContext.sessionId,
    modelStatus,
    addMessage,
    generateAIResponse,
    resetConversation,
    initializeModel,
    currentTopic: conversationContext.currentTopic,
    lastInteractionTimestamp: conversationContext.lastInteractionTimestamp
  };
};
