import * as tf from '@tensorflow/tfjs';
import { UniversalSentenceEncoder } from '@tensorflow-models/universal-sentence-encoder';
import { PREDEFINED_KNOWLEDGE, PRO_FEATURES } from '../constants/chatKnowledge';

let model: UniversalSentenceEncoder | null = null;
let isInitialized = false;

export async function initGPT2() {
  if (isInitialized) return;
  
  try {
    await tf.ready();
    model = await UniversalSentenceEncoder.load();
    isInitialized = true;
  } catch (error) {
    console.error('Failed to initialize GPT-2:', error);
    throw error;
  }
}

export async function generateResponse(input: string): Promise<string> {
  if (!model) {
    throw new Error('Model not initialized');
  }

  try {
    // Check for predefined responses first
    if (input.toLowerCase().includes('development time') || 
        input.toLowerCase().includes('how long') || 
        input.toLowerCase().includes('time spent')) {
      return "Let me fetch that information for you...\n\n" + PREDEFINED_KNOWLEDGE.development;
    }

    // Check for premium features
    for (const [key, details] of Object.entries(PRO_FEATURES)) {
      if (input.toLowerCase().includes(key.toLowerCase()) || 
          input.toLowerCase().includes(details.name.toLowerCase())) {
        return `${details.name} is a premium feature available with Bullocks AI Pro.

Features include:
${details.features.map(f => '• ' + f).join('\n')}

${details.description}

Contact Travis at +1 (330) 327-3343 to unlock this feature!`;
      }
    }

    // Encode input for semantic similarity
    const inputEmbedding = await model.embed(input.toLowerCase());
    
    // Find most relevant predefined knowledge
    let bestMatch = '';
    let highestSimilarity = -1;

    for (const [key, value] of Object.entries(PREDEFINED_KNOWLEDGE)) {
      const keyEmbedding = await model.embed(key.toLowerCase());
      const similarity = tf.matMul(inputEmbedding, keyEmbedding.transpose()).dataSync()[0];

      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        bestMatch = value;
      }
    }

    // Return best match if similarity is above threshold
    if (highestSimilarity > 0.5) {
      return bestMatch;
    }

    // Default response for unknown queries
    return "Sorry, I'm not here for that. Do you have any other questions about our products, categories, or features?";
  } catch (error) {
    console.error('Error generating response:', error);
    return "I'm having trouble processing that request. Please try again.";
  }
}