import type { 
  AIResponse, 
  ChatConfig, 
  ConversationContext,
  KnowledgeBaseEntry
} from '../types/chat';
import { KNOWLEDGE_BASE } from '../types/chat';
import { HfInference } from '@huggingface/inference';

export class ChatService {
  private config: ChatConfig;
  private conversationContext: ConversationContext;
  private hfClient: HfInference;

  constructor(config: ChatConfig) {
    if (!config || !config.apiKey || !config.model) {
      throw new Error('Invalid ChatConfig: apiKey and model are required');
    }
    this.config = config;
    this.hfClient = new HfInference(config.apiKey);
    this.conversationContext = {
      sessionId: this.generateSessionId(),
      messages: [],
      lastInteractionTimestamp: Date.now()
    };
  }

  // Expose method to update conversation context if needed
  updateConversationContext(newContext: Partial<ConversationContext>) {
    this.conversationContext = {
      ...this.conversationContext,
      ...newContext
    };
  }

  // Expose method to get current conversation context
  getConversationContext(): ConversationContext {
    return this.conversationContext;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateRelevance(input: string, entry: KnowledgeBaseEntry): number {
    const normalizedInput = this.normalizeInput(input);
    const matchedKeywords = entry.keywords.filter(keyword => 
      normalizedInput.includes(keyword.toLowerCase())
    );

    const relevanceScore = matchedKeywords.length / entry.keywords.length;
    return relevanceScore;
  }

  private findRelevantKnowledgeBase(input: string): string[] {
    const relevantContexts = KNOWLEDGE_BASE
      .filter(entry => {
        const relevance = this.calculateRelevance(input, entry);
        return relevance >= (entry.relevanceThreshold || 0.5);
      })
      .map(entry => entry.context);

    return relevantContexts;
  }

  private normalizeInput(input: string): string {
    return input.toLowerCase().trim();
  }

  async generateResponse(
    input: string, 
    context?: Partial<ConversationContext>
  ): Promise<AIResponse> {
    try {
      // Find relevant context from knowledge base
      const relevantContexts = this.findRelevantKnowledgeBase(input);
      
      // Prepare prompt with context
      const contextPrompt = relevantContexts.length > 0 
        ? `Context: ${relevantContexts.join(' ')}\n\n` 
        : '';
      
      const fullPrompt = `${contextPrompt}User Input: ${input}`;

      // Simulate AI response generation
      const aiResponse = await this.queryHuggingFace(fullPrompt);

      return {
        text: aiResponse,
        confidence: 0.8,
        suggestions: this.generateSuggestions(input),
        context: { 
          originalInput: input,
          processedAt: Date.now()
        }
      };

    } catch (error) {
      console.error('Response Generation Error:', error);
      return {
        text: 'I apologize, but I encountered an error processing your request.',
        confidence: 0.1,
        suggestions: []
      };
    }
  }

  private generateSuggestions(input: string): string[] {
    return [
      '• Be specific in your queries',
      '• Explore different aspects of the application',
      '• Ask about product management or photo uploads'
    ];
  }

  private async queryHuggingFace(prompt: string): Promise<string> {
    try {
      console.log(`Querying Hugging Face with model: ${this.config.model}`);
      console.log(`Prompt: ${prompt}`);
      console.log(`Max Tokens: ${this.config.maxTokens}`);
      console.log(`Temperature: ${this.config.temperature}`);

      const request = {
        inputs: prompt,
        parameters: {
          max_new_tokens: this.config.maxTokens || 250,
          temperature: this.config.temperature || 0.7,
          return_full_text: false
        }
      };

      const response = await this.hfClient.textGeneration({
        model: this.config.model,
        inputs: request.inputs,
        parameters: request.parameters
      });

      const generatedText = Array.isArray(response) 
        ? response[0]?.generated_text?.trim() 
        : response?.generated_text?.trim();

      if (!generatedText) {
        console.warn('No response generated');
        throw new Error('No response generated');
      }

      return generatedText;

    } catch (error) {
      console.error('Hugging Face API Error:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const testPrompt = "Hello, can you confirm you're working?";
      const response = await this.queryHuggingFace(testPrompt);
      
      if (!response) {
        console.warn('Test connection failed: No response');
        return false;
      }
      
      console.log('Test connection successful');
      return true;
    } catch (error) {
      console.error('Test connection error:', error);
      return false;
    }
  }
}
