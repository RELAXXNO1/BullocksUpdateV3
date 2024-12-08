export interface Message {
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface ProFeature {
  name: string;
  description: string;
  currentFeatures?: {
    basic: string[];
    pro: string[];
  };
  features?: string[];
  benefits?: string[];
  upgrade?: {
    cta: string;
    contact: string;
  };
}

export interface ChatKnowledge {
  [key: string]: string;
}