export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: number;
  context: {
    sessionId: string;
    category?: string;
    originalInput?: string;
    userName?: string;
  };
}

export interface AIModelStatus {
  isInitializing: boolean;
  isReady: boolean;
  temperature: number;
  color: 'red' | 'yellow' | 'green';
}

export interface AIResponse {
  text: string;
  confidence: number;
  suggestions?: string[];
  context?: {
    category?: string;
    originalInput?: string;
    processedAt?: number;
    suggestedQuestions?: string[];
  };
}

export interface ChatConfig {
  apiKey: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ConversationContext {
  sessionId: string;
  messages: Message[];
  lastInteractionTimestamp: number;
  currentTopic?: string;
  systemPrompt: string;
  responseFormat?: ResponseFormat;
}

export interface KnowledgeBaseEntry {
  keywords: string[];
  context: string;
  relevanceThreshold?: number;
}

export interface ResponseFormat {
  type: 'default' | 'list' | 'table' | 'code';
  style?: 'professional' | 'friendly' | 'technical';
  emoji?: boolean;
  maxLength?: number;
}

export type ChatKnowledge = {
  [key: string]: string;
};

export const KNOWLEDGE_BASE: KnowledgeBaseEntry[] = [
  {
    keywords: ['product', 'inventory', 'stock', 'management'],
    context: 'The application is a product management system for a smoke shop. Key features include photo upload, product tracking, and admin management.',
    relevanceThreshold: 0.6
  },
  {
    keywords: ['photo', 'upload', 'image', 'category'],
    context: 'The PhotoBank component allows admins to upload and categorize product images with thumbnail generation and Firestore metadata tracking.',
    relevanceThreshold: 0.7
  },
  {
    keywords: ['admin', 'authentication', 'access', 'control'],
    context: 'The system implements role-based access control with Firebase Authentication. Only verified admin users can access certain features.',
    relevanceThreshold: 0.5
  }
];