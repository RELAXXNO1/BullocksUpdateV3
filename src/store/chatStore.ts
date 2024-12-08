import { create } from 'zustand';

interface Message {
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

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
    content: "Hello! I'm your AI assistant. How can I help you today?",
    sender: 'ai',
    timestamp: new Date()
  }],
  isOpen: false,
  isTyping: false,
  setIsOpen: (value) => set({ isOpen: value }),
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  setIsTyping: (value) => set({ isTyping: value })
}));