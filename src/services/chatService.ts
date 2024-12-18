import type { 
  AIResponse, 
  ChatConfig, 
  ConversationContext,
} from '../types/chat';
import { HfInference } from '@huggingface/inference';
import { FallbackChatService } from './fallbackChatService';

export class ChatService {
  private config: ChatConfig;
  private conversationContext: ConversationContext;
  private hfClient: HfInference | null;

  constructor(config: ChatConfig) {
    if (!config || !config.apiKey || !config.model) {
      console.warn('Invalid ChatConfig: Using fallback service');
    }
    this.config = config;
    
    // Only initialize if API key is present
    this.hfClient = config.apiKey 
      ? new HfInference(config.apiKey) 
      : null;

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

  async generateResponse(
    input: string, 
    context?: Partial<ConversationContext>
  ): Promise<AIResponse> {
    try {
      // If no API key or client, use fallback immediately
      if (!this.hfClient) {
        return FallbackChatService.generateResponse(input, context);
      }
      
      // Prepare prompt with system instructions
      const systemInstructions = `You are an AI. 
Respond directly to the user's input. 
Provide a single, concise output.
Do not include any previous conversation history in your response.
If the input is not clear, ask for clarification.`;
      
      const fullPrompt = `${systemInstructions}\n\n${input}`;

      // Attempt Hugging Face query
      try {
        const aiResponse = await this.queryHuggingFace(fullPrompt, systemInstructions);

        // Generate dynamic suggestions based on input and context
        const suggestions = this.generateContextualSuggestions(input, []);

        return {
          text: aiResponse,
          confidence: 0.8,
          suggestions: suggestions,
          context: { 
            originalInput: input,
            processedAt: Date.now(),
            category: 'general_response'
          }
        };
      } catch (aiError) {
        // If AI query fails, use fallback
        console.warn('AI query failed, using fallback:', aiError);
        return FallbackChatService.generateResponse(input, context);
      }
    } catch (error) {
      console.error('Response Generation Error:', error);
      return FallbackChatService.generateResponse(input, context);
    }
  }

  private generateContextualSuggestions(input: string, contexts: string[]): string[] {
    // Generate suggestions based on input and relevant contexts
    const baseSuggestions = [
      'Need more details?',
      'Want to explore another topic?'
    ];

    return baseSuggestions;
  }

  async queryHuggingFace(prompt: string, systemInstructions: string): Promise<string> {
    try {
      console.log('Querying Hugging Face with prompt:', prompt);
      console.log('Using model:', this.config.model);
      
      if (!this.hfClient) {
        throw new Error('Hugging Face client not initialized');
      }
      
      const response = await this.hfClient.textGeneration({
        model: this.config.model,
        inputs: prompt,
        parameters: {
          max_new_tokens: this.config.maxTokens || 250,
          temperature: this.config.temperature || 0.7
        }
      });

      console.log('Hugging Face Response:', response);
      
      // Extract generated text, handling different response formats
      let generatedText = Array.isArray(response) 
        ? response[0]?.generated_text 
        : (response as any).generated_text || response;

      if (typeof generatedText === 'string') {
        const regex = new RegExp(`^\\s*${systemInstructions.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'gm');
        generatedText = generatedText.trim().replace(regex, '').trim();
      } else {
        generatedText = 'No response generated';
      }

      return generatedText;
    } catch (error) {
      console.error('Hugging Face Query Error:', error);
      
      // More detailed error logging
      if (error instanceof Error) {
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
      }

      throw error;
    }
  }

  // Add a method to test connection that uses fallback if needed
  async testConnection(): Promise<boolean> {
    try {
      if (!this.config.apiKey) {
        console.warn('No API key, using fallback service');
        return false;
      }

      console.log('Testing Hugging Face connection');
      console.log('API Key:', this.config.apiKey ? '[REDACTED]' : 'MISSING');
      console.log('Model:', this.config.model);

      // Ensure hfClient is not null before testing connection
      if (!this.hfClient) {
        this.hfClient = new HfInference(this.config.apiKey);
      }

      // Actual connection test
      const response = await this.hfClient.textGeneration({
        model: this.config.model,
        inputs: 'Test connection',
        parameters: {
          max_new_tokens: 10,
          temperature: 0.1
        }
      });

      console.log('Connection Test Response:', response);

      return true;
    } catch (error) {
      console.error('Connection Test Failed:', error);
      
      // More detailed error logging
      if (error instanceof Error) {
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
      }

      return false;
    }
  }
}
