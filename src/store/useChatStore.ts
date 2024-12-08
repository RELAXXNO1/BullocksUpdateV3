import { create } from 'zustand';
import { Message, ProFeature } from '../types/chat';
import { PRO_FEATURES } from '../constants/aiKnowledge';

interface ChatState {
  messages: Message[];
  isMinimized: boolean;
  showProModal: boolean;
  selectedFeature?: string | ProFeature;
  isTyping: boolean;
  isSpeaking: boolean;
  addMessage: (message: Message) => void;
  setIsMinimized: (value: boolean) => void;
  setShowProModal: (value: boolean) => void;
  setSelectedFeature: (feature: string | ProFeature) => void;
  setIsTyping: (value: boolean) => void;
  setIsSpeaking: (value: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [{
    content: "Hello! I'm your AI assistant. How can I help you today?",
    sender: 'ai',
    timestamp: new Date()
  }],
  isMinimized: false,
  showProModal: false,
  selectedFeature: undefined,
  isTyping: false,
  isSpeaking: false,
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, { 
      ...message, 
      timestamp: message.timestamp || new Date() 
    }] 
  })),
  setIsMinimized: (value) => set({ isMinimized: value }),
  setShowProModal: (value) => set({ showProModal: value }),
  setSelectedFeature: (feature) => set({ 
    selectedFeature: typeof feature === 'string' 
      ? PRO_FEATURES[feature as keyof typeof PRO_FEATURES] 
      : feature 
  }),
  setIsTyping: (value) => set({ isTyping: value }),
  setIsSpeaking: (value) => set({ isSpeaking: value }),
  clearMessages: () => set({ 
    messages: [{
      content: "Hello! I'm your AI assistant. How can I help you today?",
      sender: 'ai',
      timestamp: new Date()
    }],
    isTyping: false,
    isSpeaking: false
  })
}));