import { KnowledgeBase, AIResponse } from '../types/ai';

export class EmbeddedTextModel {
  private knowledgeBase: KnowledgeBase;

  constructor(knowledgeBase: KnowledgeBase) {
    this.knowledgeBase = knowledgeBase;
  }

  private calculateSimilarity(query: string, text: string): number {
    // Basic similarity calculation using keyword matching
    const queryWords = query.toLowerCase().split(/\s+/);
    const textWords = text.toLowerCase().split(/\s+/);
    
    const matchedWords = queryWords.filter(word => 
      textWords.includes(word)
    );

    return (matchedWords.length / queryWords.length) * 100;
  }

  private findBestMatch(query: string): AIResponse {
    const { categories, responses } = this.knowledgeBase;

    // First, check for exact category match
    const categoryMatch = categories.find(category => 
      category.keywords.some(keyword => 
        query.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    if (categoryMatch) {
      const matchingResponses = responses.filter(
        response => response.category === categoryMatch.id
      );

      if (matchingResponses.length > 0) {
        const bestResponse = matchingResponses.reduce((best, current) => {
          const bestSimilarity = this.calculateSimilarity(query, best.pattern);
          const currentSimilarity = this.calculateSimilarity(query, current.pattern);
          
          return currentSimilarity > bestSimilarity ? current : best;
        });

        return {
          text: bestResponse.response,
          category: categoryMatch.name,
          confidence: 80,
          suggestions: bestResponse.followUp || []
        };
      }
    }

    // Fallback to generic response
    return {
      text: "I'm not sure I understand completely. Could you rephrase or provide more context?",
      category: 'generic',
      confidence: 30,
      suggestions: [
        "Can you be more specific?",
        "Let me help you with something else"
      ]
    };
  }

  public processQuery(query: string): AIResponse {
    try {
      return this.findBestMatch(query);
    } catch (error) {
      console.error('Error processing query:', error);
      return {
        text: "I apologize, but I'm experiencing some difficulties processing your request.",
        category: 'error',
        confidence: 0
      };
    }
  }

  // Method to update knowledge base dynamically
  public updateKnowledgeBase(newData: Partial<KnowledgeBase>) {
    this.knowledgeBase = {
      ...this.knowledgeBase,
      ...newData
    };
  }
}
