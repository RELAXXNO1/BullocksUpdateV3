import { PREDEFINED_KNOWLEDGE } from '../constants/chatKnowledge';
import type { 
  AIResponse, 
  ConversationContext 
} from '../types/chat';

export class FallbackChatService {
  private static calculateRelevance(input: string, knowledgeKey: string): number {
    const normalizedInput = input.toLowerCase().trim();
    const knowledgeText = PREDEFINED_KNOWLEDGE[knowledgeKey]?.toLowerCase() || '';
    
    const inputWords = normalizedInput.split(/\s+/);
    const matchedWords = inputWords.filter(word => 
      knowledgeText.includes(word)
    );

    return matchedWords.length / inputWords.length;
  }

  static generateResponse(
    input: string, 
    context?: Partial<ConversationContext>
  ): AIResponse {
    // Find most relevant predefined knowledge
    const relevanceScores = Object.keys(PREDEFINED_KNOWLEDGE)
      .map(key => ({
        key, 
        relevance: this.calculateRelevance(input, key)
      }))
      .filter(item => item.relevance > 0.3)
      .sort((a, b) => b.relevance - a.relevance);

    if (relevanceScores.length > 0) {
      const topMatch = relevanceScores[0];
      return {
        text: PREDEFINED_KNOWLEDGE[topMatch.key],
        confidence: topMatch.relevance,
        suggestions: [
          'Need more details?',
          'Want to explore another topic?'
        ],
        context: {
          originalInput: input,
          category: topMatch.key,
          processedAt: Date.now()
        }
      };
    }

    // Generic fallback response
    return {
      text: `I'm not sure I fully understand. Could you rephrase your question? 
        I can help with topics like products, categories, content, and analytics.`,
      confidence: 0.1,
      suggestions: [
        'Ask about products',
        'Inquire about store features',
        'Request help'
      ],
      context: {
        originalInput: input,
        processedAt: Date.now()
      }
    };
  }
}
