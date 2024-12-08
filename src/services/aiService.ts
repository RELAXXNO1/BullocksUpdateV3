import { AI_KNOWLEDGE, PRO_FEATURES, LOCKED_FEATURES } from '../constants/aiKnowledge';
import type { AIResponse, KnowledgeCategory } from '../types/ai';

export class AIService {
  private static instance: AIService;
  private constructor() {}

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async generateResponse(input: string): Promise<AIResponse> {
    try {
      const normalizedInput = input.toLowerCase().trim();
      
      // Check for locked feature requests
      const lockedFeature = this.checkLockedFeatures(normalizedInput);
      if (lockedFeature) {
        return await this.handleLockedFeature(lockedFeature);
      }

      // Check for premium feature requests
      const proFeature = this.checkPremiumFeatures(normalizedInput);
      if (proFeature) {
        return await this.handleProFeature(proFeature);
      }

      // Try to process knowledge base for a detailed response
      const knowledgeBaseResponse = this.processKnowledgeBase(
        this.findRelevantCategoryKey(normalizedInput), 
        normalizedInput
      );
      if (knowledgeBaseResponse) {
        return knowledgeBaseResponse;
      }

      // Find relevant category and response template
      const category = this.findRelevantCategory(normalizedInput);
      const template = AI_KNOWLEDGE.responses.find(r => 
        new RegExp(r.pattern, 'i').test(normalizedInput)
      );

      if (template) {
        return await this.handleTemplateResponse(template);
      }

      // Generate contextual response based on category
      if (category) {
        return await this.handleCategoryResponse(category, normalizedInput);
      }

      // Fallback response
      return await this.handleFallbackResponse();
    } catch (error) {
      console.error('Error generating AI response:', error);
      return this.handleErrorResponse();
    }
  }

  private async handleLockedFeature(lockedFeature: { id: string; feature: any }): Promise<AIResponse> {
    const response = {
      text: this.generateLockedFeatureResponse(lockedFeature),
      confidence: 0.9,
      requiresProFeature: true,
      proFeatureId: lockedFeature.id
    };
    return this.formatResponse(response.text).then(formattedText => ({ ...response, text: formattedText }));
  }

  private async handleProFeature(proFeature: { id: string; feature: any }): Promise<AIResponse> {
    const response = {
      text: this.generateProFeatureResponse(proFeature),
      confidence: 0.9,
      requiresProFeature: true,
      proFeatureId: proFeature.id
    };
    return this.formatResponse(response.text).then(formattedText => ({ ...response, text: formattedText }));
  }

  private async handleTemplateResponse(template: any): Promise<AIResponse> {
    const response = {
      text: template.response,
      category: template.category,
      confidence: 0.8,
      suggestions: template.followUp
    };
    return this.formatResponse(response.text).then(formattedText => ({ ...response, text: formattedText }));
  }

  private async handleCategoryResponse(category: KnowledgeCategory, input: string): Promise<AIResponse> {
    const response = this.generateCategoryResponse(category, input);
    return this.formatResponse(response.text).then(formattedText => ({ ...response, text: formattedText }));
  }

  private async handleFallbackResponse(): Promise<AIResponse> {
    const response = {
      text: "I understand you're asking about the store management system. Could you please be more specific about what you'd like to know? I can help with products, inventory, customers, orders, or analytics.",
      confidence: 0.4,
      suggestions: [
        "How do I manage products?",
        "How can I track inventory?",
        "Where can I view analytics?"
      ]
    };
    return this.formatResponse(response.text).then(formattedText => ({ ...response, text: formattedText }));
  }

  private handleErrorResponse(): AIResponse {
    return {
      text: "I apologize, but I'm having trouble processing that right now. Could you try asking in a different way?",
      requiresProFeature: false,
      confidence: 0
    };
  }

  private async formatResponse(response: string): Promise<string> {
    // Add natural conversation elements
    const greetings = [
      "Hey there! ",
      "Sure thing! ",
      "I'd be happy to help! ",
      "Great question! ",
      "Let me help you with that! "
    ];

    const transitions = [
      "Here's what you can do: ",
      "Let me break this down for you: ",
      "Here's the scoop: ",
      "Here's what I found: ",
      "Let me explain: "
    ];

    const encouragements = [
      "Feel free to ask if you need any clarification!",
      "Let me know if you need more help!",
      "Don't hesitate to ask follow-up questions!",
      "I'm here if you need more guidance!",
      "Hope this helps! Let me know if you need anything else!"
    ];

    // Randomly select conversation elements
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    const transition = transitions[Math.floor(Math.random() * transitions.length)];
    const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)];

    // Format the response
    let formattedResponse = greeting;
    
    // Add transition if response is long enough
    if (response.length > 100) {
      formattedResponse += transition;
    }

    formattedResponse += response;

    // Add encouragement for longer responses
    if (response.length > 200) {
      formattedResponse += " " + encouragement;
    }

    return formattedResponse;
  }

  private findRelevantCategory(input: string): KnowledgeCategory | null {
    return AI_KNOWLEDGE.categories.find(category =>
      category.keywords.some(keyword => input.includes(keyword))
    ) || null;
  }

  private findRelevantCategoryKey(input: string): string {
    const category = this.findRelevantCategory(input);
    return category ? category.id : 'general';
  }

  private checkLockedFeatures(input: string): { id: string; feature: any; } | null {
    for (const [id, feature] of Object.entries(LOCKED_FEATURES)) {
      if (input.includes(feature.name.toLowerCase())) {
        return { id, feature };
      }
    }
    return null;
  }

  private checkPremiumFeatures(input: string): { id: string; feature: any; } | null {
    for (const [id, feature] of Object.entries(PRO_FEATURES)) {
      if (input.includes(feature.name.toLowerCase())) {
        return { id, feature };
      }
    }
    return null;
  }

  private generateLockedFeatureResponse(lockedFeature: { id: string; feature: { name: string; description: string; preview: string; benefits: string[] } }): string {
    const { feature } = lockedFeature;
    return ` ${feature.name} is a Pro feature.\n\n` +
           `${feature.description}.\n\n` +
           `Currently: ${feature.preview}\n\n` +
           `With Pro, you'll get:\n` +
           feature.benefits.map((benefit: string) => `• ${benefit}`).join('\n') +
           `\n\nContact Travis at +1 (330) 327-3343 to unlock these features!`;
  }

  private generateProFeatureResponse(proFeature: { id: string; feature: { name: string; description: string; previewText: string; benefits: { [key: string]: string }; features: string[] } }): string {
    const { feature } = proFeature;
    
    // Type guard to ensure benefits is a valid object
    const isValidBenefits = (obj: any): obj is { [key: string]: string } => 
      obj !== null && typeof obj === 'object' && !Array.isArray(obj);
    
    // Safely handle benefits
    const benefitsEntries = isValidBenefits(feature.benefits) 
      ? Object.entries(feature.benefits)
      : [];
    
    return ` ${feature.name}\n\n` +
           `${feature.description}\n\n` +
           `Status: ${feature.previewText}\n\n` +
           `Key Benefits:\n` +
           benefitsEntries
             .map(([value]) => `• ${String(value)}`)
             .join('\n') +
           `\n\nFeatures you'll unlock:\n` +
           (Array.isArray(feature.features) ? feature.features : [])
             .map((f: string) => `• ${f}`)
             .join('\n') +
           `\n\nReady to upgrade? Contact Travis at +1 (330) 327-3343 to get started!`;
  }

  private generateCategoryResponse(category: KnowledgeCategory, _input: string): AIResponse {
    // The _input parameter is kept for potential future context-aware response generation
    return {
      text: `Let me help you with ${category.name.toLowerCase()}. ${category.description}.`,
      category: category.id,
      confidence: 0.8,
      suggestions: category.keywords?.slice(0, 3),
      requiresProFeature: false
    };
  }

  private processKnowledgeBase(key: string, input: string): AIResponse | null {
    try {
      // Use the key for more precise category matching
      const matchedCategory = AI_KNOWLEDGE.categories.find(
        category => 
          // Match by exact key or partial key match
          category.id.toLowerCase() === key.toLowerCase() ||
          key.toLowerCase().includes(category.id.toLowerCase()) ||
          // Fallback to name matching if key doesn't match
          category.name.toLowerCase().includes(key.toLowerCase())
      );

      // If no category found using the key, try general matching
      const knowledgeEntry = matchedCategory || 
        AI_KNOWLEDGE.categories.find(
          category => category.keywords.some(
            keyword => input.toLowerCase().includes(keyword.toLowerCase())
          )
        );

      // Return null if no matching category found
      if (!knowledgeEntry) {
        console.warn(`No knowledge base entry found for key: ${key}`);
        return null;
      }

      // Safely check for subcategories
      const subcategoryMatch = knowledgeEntry.subcategories?.find(
        subcat => input.toLowerCase().includes(subcat.toLowerCase())
      );

      // Determine response confidence
      const responseConfidence = subcategoryMatch ? 0.9 : 
        (matchedCategory ? 0.8 : 0.7);

      // Generate response text
      const responseText = this.generateDetailedCategoryResponse(
        knowledgeEntry, 
        subcategoryMatch, 
        input
      );

      // Construct and return AIResponse
      return {
        text: responseText,
        category: knowledgeEntry.id,
        confidence: responseConfidence,
        suggestions: [
          ...(knowledgeEntry.keywords?.slice(0, 2) || []),
          ...(subcategoryMatch ? [`More about ${subcategoryMatch}`] : []),
          // Include the original key as a potential suggestion if it's different from category
          ...(key.toLowerCase() !== knowledgeEntry.id.toLowerCase() ? [key] : [])
        ],
        requiresProFeature: knowledgeEntry.features?.some(
          feature => feature.toLowerCase().includes('pro') || 
                     feature.toLowerCase().includes('premium')
        ) || false
      };
    } catch (error) {
      // Log any unexpected errors
      console.error(`Error processing knowledge base with key: ${key}`, error);
      return null;
    }
  }

  private generateDetailedCategoryResponse(
    category: KnowledgeCategory, 
    subcategory: string | undefined, 
    input: string
  ): string {
    try {
      // Use input parameter for potential context-aware response in future
      const contextHint = input.length > 50 
        ? ` Based on your detailed query: "${input.substring(0, 50)}..."` 
        : '';

      const baseResponse = `Let me provide insights about ${category.name}${contextHint}. `;

      // If a specific subcategory is mentioned
      if (subcategory) {
        const subcatFeatures = category.features?.filter(
          feature => feature.toLowerCase().includes(subcategory.toLowerCase())
        );

        if (subcatFeatures && subcatFeatures.length > 0) {
          return baseResponse + 
            `Specifically for ${subcategory}, here are key features:\n` +
            subcatFeatures.map(feature => `• ${feature}`).join('\n') +
            `\n\nWhat specific aspect of ${subcategory} would you like to know more about?`;
        }
      }

      // Generic category response with capabilities
      const capabilitiesSummary = category.capabilities 
        ? this.processCapabilities(category.capabilities)
        : 'Comprehensive management capabilities';

      return baseResponse + 
        `\n\nKey Capabilities:\n${capabilitiesSummary}` +
        `\n\nWould you like to explore specific aspects of ${category.name}?`;
    } catch (error) {
      console.error('Error in generateDetailedCategoryResponse:', error);
      return `I encountered an issue providing details about ${category.name}. My apologies.`;
    }
  }

  private processCapabilities(capabilities: unknown): string {
    // Type guard to ensure capabilities is a valid object
    const isValidObject = (obj: unknown): obj is Record<string, unknown> => 
      obj !== null && typeof obj === 'object' && !Array.isArray(obj);

    if (!isValidObject(capabilities)) {
      return 'Unable to process capabilities';
    }

    try {
      return Object.entries(capabilities)
        .map(([key, value]) => {
          // Safely handle different types of capability values
          const operations = Array.isArray(value) 
            ? value.join(', ') 
            : isValidObject(value)
              ? Object.keys(value).join(', ') 
              : String(value);
          
          return `${key.charAt(0).toUpperCase() + key.slice(1)}: ${operations}`;
        })
        .join('\n');
    } catch (error) {
      console.error('Error processing capabilities:', error);
      return 'Comprehensive management capabilities';
    }
  }
}
