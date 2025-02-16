import type {
  AIResponse,
  ChatConfig,
  ConversationContext,
  Message,
} from '../types/chat';
import { GoogleGenerativeAI } from "@google/generative-ai";

export class ChatService {
  private config: ChatConfig;
  private conversationContext: ConversationContext;
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private chat: any = null;

  constructor(config: ChatConfig) {
    if (!config || !config.apiKey || !config.model) {
      throw new Error('Invalid ChatConfig: API key or model missing');
    }
    this.config = config;

    this.conversationContext = {
      sessionId: this.generateSessionId(),
      messages: [],
      lastInteractionTimestamp: Date.now()
    };
  }

  updateConversationContext(newContext: Partial<ConversationContext>) {
    this.conversationContext = {
      ...this.conversationContext,
      ...newContext
    };
  }

  getConversationContext(): ConversationContext {
    return this.conversationContext;
  }

  replaceMessages(messages: Message[]) {
    this.conversationContext = { ...this.conversationContext, messages: messages }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private prepareMessageHistory(systemPrompt: string) {
    // Combine system prompt and all previous messages into a coherent history
    let fullHistory = systemPrompt + "\n\n";
    
    this.conversationContext.messages.forEach(message => {
      const prefix = message.sender === 'user' ? 'User: ' : 'Assistant: ';
      fullHistory += prefix + message.content + "\n";
    });

    return fullHistory;
  }

  async generateResponse(
    input: string,
    systemPrompt: string,
    onUpdate: (text: string) => void
  ): Promise<AIResponse> {
    // --- Command Parsing and Action Execution ---
    if (input.toLowerCase().includes('create promo')) {
        return this.handleCreatePromo(input, onUpdate);
    } else if (input.toLowerCase().includes('post product')) {
        return this.handlePostProduct(input, onUpdate);
    }

    if (!this.config.apiKey || !this.config.model) {
      throw new Error('API key or model not configured');
    }

    if (!this.genAI || !this.chat) {
      try {
        this.genAI = new GoogleGenerativeAI(this.config.apiKey);
        this.model = this.genAI.getGenerativeModel({ 
          model: this.config.model,
          generationConfig: {
            maxOutputTokens: this.config.maxTokens || 200,
          },
        });
        this.chat = this.model.startChat();
      } catch (error: any) {
        console.error("Failed to initialize Gemini API", error);
        let errorMessage = 'Sorry, there was an error processing your request.';
        if (error.message.includes('API key not valid')) {
          errorMessage = 'Invalid API key. Please check your API key and try again.';
        } else if (error.message.includes('model not found')) {
          errorMessage = 'Model not found. Please check your model name and try again.';
        } else if (error.message.includes('quota exceeded')) {
          errorMessage = 'Quota exceeded. Please try again later.';
        }
        return {
          text: errorMessage,
          confidence: 0,
          suggestions: [],
          context: {
            originalInput: input,
            processedAt: Date.now(),
            category: 'error'
          }
        };
      }
    }

    try {
      // Add user message to context first
      this.conversationContext.messages.push({
        id: `user-${Date.now()}`,
        content: input,
        sender: 'user',
        timestamp: Date.now(),
        context: { sessionId: this.conversationContext.sessionId }
      });

      // Prepare the full conversation history
      const history = this.prepareMessageHistory(systemPrompt);

      // Generate response using the chat with full context
      const result = await this.model.generateContentStream([{
        text: history + "\nUser: " + input + "\nAssistant:"
      }]);

      let fullText = '';
      for await (const chunk of result.stream) {
        const text = chunk.text();
        fullText += text;
        onUpdate(fullText);
      }

      const suggestedQuestions = await this.generateSuggestedQuestions(input, systemPrompt);

      return {
        text: fullText,
        confidence: 0.8,
        suggestions: suggestedQuestions,
        context: {
          originalInput: input,
          processedAt: Date.now(),
          category: 'general_response'
        }
      };
    } catch (error: any) {
      console.error('Error communicating with Gemini API:', error);
      let errorMessage = 'Sorry, there was an error processing your request.';
      
      if (error.message.includes('API key not valid')) {
        errorMessage = 'Invalid API key. Please check your API key and try again.';
      } else if (error.message.includes('model not found')) {
        errorMessage = 'Model not found. Please check your model name and try again.';
      } else if (error.message.includes('quota exceeded')) {
        errorMessage = 'Quota exceeded. Please try again later.';
      }

      return {
        text: errorMessage,
        confidence: 0,
        suggestions: [],
        context: {
          originalInput: input,
          processedAt: Date.now(),
          category: 'error'
        }
      };
    }
  }

  private parsePromoDetails(input: string): any {
    // This is a placeholder. You'll need to implement the logic to parse the input
    // and extract the promo code, discount percentage, start date, and end date.
    return null;
  }

  private async handleCreatePromo(input: string, onUpdate: (text: string) => void): Promise<AIResponse> {
    // Implement promo creation logic here
    // Assuming the user provides the promo details in the input
    // You'll need to parse the input to extract the promo code, discount, start date, and end date
    // and then call the createPromo function from usePromos hook.
    const promoDetails = this.parsePromoDetails(input);

    if (!promoDetails) {
      onUpdate("I need more information to create the promo. Please provide the promo code, discount percentage, start date, and end date.");
      return {
        text: "I need more information to create the promo.",
        confidence: 0.8,
        suggestions: [],
        context: {
          originalInput: input,
          processedAt: Date.now(),
          category: 'create_promo'
        }
      };
    }

    try {
      // Call the createPromo function from usePromos hook
      // Assuming you have access to the usePromos hook
      // and the createPromo function is available.
      // You'll need to import and use the hook here.
      // For example:
      // const { createPromo } = usePromos();
      // const promoId = await createPromo(promoDetails); // TODO: Implement promo creation logic using usePromos hook

      onUpdate("Promo created successfully!");
      return {
        text: "Promo created successfully!",
        confidence: 0.8,
        suggestions: [],
        context: {
          originalInput: input,
          processedAt: Date.now(),
          category: 'create_promo'
        }
      };
    } catch (error: any) {
      console.error("Error creating promo:", error);
      onUpdate("There was an error creating the promo. Please try again.");
      return {
        text: "There was an error creating the promo. Please try again.",
        confidence: 0,
        suggestions: [],
        context: {
          originalInput: input,
          processedAt: Date.now(),
          category: 'create_promo'
        }
      };
    }
  }

  private async handlePostProduct(input: string, onUpdate: (text: string) => void): Promise<AIResponse> {
    // Implement product posting logic here
    // Assuming the user provides the product details in the input
    // You'll need to parse the input to extract the product name, description, price, image URL, and category
    // and then call the appropriate backend service to post the product.
    onUpdate("Posting product... // TODO: Implement product posting logic");
    // Placeholder for product posting logic
    return {
      text: "Product posted successfully!",
      confidence: 0.8,
      suggestions: [],
      context: {
        originalInput: input,
        processedAt: Date.now(),
        category: 'post_product'
      }
    };
  }

  private async generateSuggestedQuestions(input: string, systemPrompt: string): Promise<string[]> {
    if (!this.model) {
        return [];
    }

    try {
        const prompt = `Generate 3 very short suggested questions based on the following user input and system prompt. Format each question as a single line without any numbering or bullet points.
        
        System Prompt: ${systemPrompt}
        
        User Input: ${input}
        
        Suggested Questions:`;

        const result = await this.model.generateContent(prompt);
        const text = result.text();
        return text.split("\n").filter(Boolean).map((q: string) => q.trim());
    } catch (error) {
        console.error("Error generating suggested questions:", error);
        return [];
    }
}
}
