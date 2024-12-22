import { create } from 'zustand';
import { Message } from '../types/chat';

interface ChatState {
  messages: Message[];
  isOpen: boolean;
  isTyping: boolean;
  setIsOpen: (value: boolean) => void;
  addMessage: (message: Message) => void;
  setIsTyping: (value: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [{
    id: 'initial',
    content: "Hello! I'm your AI assistant. How can I help you today?",
    sender: 'ai',
    timestamp: Date.now(),
    context: { sessionId: 'default' }
  }],
  isOpen: false,
  isTyping: false,
  setIsOpen: (value) => set({ isOpen: value }),
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  setIsTyping: (value) => set({ isTyping: value })
}));
