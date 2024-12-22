import { create } from 'zustand';
import { Message } from '../types/chat';

interface ChatState {
  messages: Message[];
  isMinimized: boolean;
  isTyping: boolean;
  isSpeaking: boolean;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  setIsMinimized: (value: boolean) => void;
  setIsTyping: (value: boolean) => void;
  setIsSpeaking: (value: boolean) => void;
  clearMessages: () => void;
}

const INITIAL_MESSAGE: Message = {
  id: 'initial-message',
  content: "Hello! I'm your AI assistant. How can I help you today?",
  sender: 'ai',
  timestamp: Date.now(),
  context: { sessionId: 'default' }
};

export const useChatStore = create<ChatState>((set) => ({
  messages: [INITIAL_MESSAGE],
  isMinimized: false,
  isTyping: false,
  isSpeaking: false,

  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, { 
      ...message, 
      id: message.id || `msg-${Date.now()}`,
      timestamp: message.timestamp || Date.now(),
      context: message.context || { sessionId: 'default' }
    }] 
  })),

  setMessages: (messages) => set({ messages }),

  updateMessage: (messageId, updates) => set((state) => ({
    messages: state.messages.map(message => 
      message.id === messageId 
        ? { ...message, ...updates }
        : message
    )
  })),

  setIsMinimized: (value) => set({ isMinimized: value }),
  
  setIsTyping: (value) => set({ isTyping: value }),
  
  setIsSpeaking: (value) => set({ isSpeaking: value }),
  
  clearMessages: () => set({ 
    messages: [INITIAL_MESSAGE],
    isTyping: false,
    isSpeaking: false
  })
}));