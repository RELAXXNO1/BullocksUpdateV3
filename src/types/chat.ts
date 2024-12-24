// chat.ts
import { GoogleGenerativeAI,  Content, Part } from '@google/generative-ai';

export interface Message {
    id: string;
    content: string;
    sender: 'user' | 'ai' | 'system';
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
    systemPrompt?: string;
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


export class ChatService {
    private apiKey: string;
    private model: string;
    private messages: Message[] = [];

    constructor(config: ChatConfig) {
        this.apiKey = config.apiKey;
        this.model = config.model;
    }

     async generateResponse(text: string, prompt: string): Promise<AIResponse | null> {
         try {
                const genAI = new GoogleGenerativeAI(this.apiKey);
                const model = genAI.getGenerativeModel({ model: this.model });

                const history = this.messages.map(message => ({
                  role: message.sender === 'user' ? 'user' : 'model',
                  parts: [{ text: message.content }] as Part[]
                })) as Content[]
                 const chat = model.startChat({
                      history
                     });
              const result = await chat.sendMessage(`${prompt} \n ${text}`);
              const responseText = result.response.text();
               if(responseText){
                   return {text: responseText, confidence: 1} as AIResponse;
               }
                return null

          } catch (error) {
                console.error('Error generating response:', error);
                return null;
          }
    }
     replaceMessages(messages: Message[], onUpdate?: (messages: Message[]) => void): void {
         this.messages = messages;
       if(onUpdate){
            onUpdate(this.messages);
       }
    }


    getMessages(): Message[] {
        return this.messages;
    }
}