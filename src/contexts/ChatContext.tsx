import React, { 
  createContext, 
  useState, 
  useContext, 
  useCallback, 
  useMemo 
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { 
  Message, 
  ConversationContext, 
  AIModelStatus,
  ResponseFormat
} from '../types/chat';
import { ChatService } from '../services/chatService';
import { PREDEFINED_KNOWLEDGE } from '../constants/chatKnowledge';

// Enhanced response formatting utility
function formatResponse(text: string, context?: any): string {
  // Clean and format the response
  let formattedText = text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Capitalize first letter of sentences
    .replace(/(^|\.\s+)(\w)/g, (match) => match.toUpperCase())
    // Ensure proper punctuation
    .replace(/([.!?])\s*([a-z])/g, (match, punctuation, letter) => 
      `${punctuation} ${letter.toUpperCase()}`)
    .trim();

  // Add contextual insights if available
  if (context && context.category) {
    switch(context.category) {
      case 'user_query':
        formattedText = `Based on your query about ${context.originalInput}, here's what I found:\n\n${formattedText}`;
        break;
      case 'complex_task':
        formattedText = `Let me help you break down this task:\n\n${formattedText}`;
        break;
    }
  }

  return formattedText;
}

// Create a system prompt generator
function createSystemPrompt(context?: ConversationContext): string {
  return `You are an advanced AI assistant designed to provide clear, helpful, and professionally formatted responses. Your key objectives are:

1. Understand Context Deeply:
   - Carefully analyze the user's input
   - Provide precise, relevant information
   - Ask clarifying questions if the query is ambiguous

2. Response Guidelines:
   - Use a friendly, professional tone
   - Write in clear, concise language
   - Break complex information into digestible paragraphs
   - Provide structured, actionable insights

3. Special Instructions:
   - Always capitalize the first letter of sentences
   - Use proper punctuation
   - Avoid unnecessary technical jargon
   - Tailor responses to the user's apparent expertise level

Current Conversation Context:
- Session ID: ${context?.sessionId || 'New Session'}
- Previous Interactions: ${context?.messages?.length || 0} messages
- Last Interaction: ${context ? new Date(context.lastInteractionTimestamp).toLocaleString() : 'None'}

Respond professionally and helpfully, ensuring your output is clear, structured, and directly addresses the user's needs.`;
}

// Define the shape of the chat context
interface ChatContextType {
  conversationContext: ConversationContext;
  modelStatus: AIModelStatus;
  addMessage: (content: string, sender: 'user' | 'ai', userName?: string) => void;
  generateAIResponse: (input: string) => Promise<void>;
  resetConversation: () => void;
  initializeModel: () => Promise<void>;
  setConversationContext: (context: ConversationContext) => void;
  suggestedQuestions: string[];
}

// Create the context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Chat Provider Component
export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Configuration for chat service
  const config = useMemo(() => ({
    apiKey: import.meta.env.VITE_HUGGINGFACE_API_KEY || '',
    model: 'Qwen/Qwen2-VL-7B-Instruct',
    maxTokens: 350,
    temperature: 0.7,
    topP: 0.9,
    presencePenalty: 0.5
  }), []);

  // Initial conversation context with default values
  const [conversationContext, setConversationContext] = useState<ConversationContext>(() => {
    const sessionId = uuidv4();
    const systemPrompt = createSystemPrompt();
    const defaultResponseFormat: ResponseFormat = {
      type: 'default',
      style: 'professional',
      emoji: true,
      maxLength: 350
    };

    return {
      sessionId,
      messages: [],
      lastInteractionTimestamp: Date.now(),
      systemPrompt,
      responseFormat: defaultResponseFormat
    };
  });

  // Model status state
  const [modelStatus, setModelStatus] = useState<AIModelStatus>({
    isInitializing: false,
    isReady: false,
    temperature: 0.7,
    color: 'red'
  });

  // Chat service instance
  const chatService = useMemo(() => new ChatService(config), [config]);

  // Add message to conversation
  const addMessage = useCallback((content: string, sender: 'user' | 'ai', userName?: string) => {
    const newMessage: Message = {
      id: uuidv4(),
      content: sender === 'ai' && userName 
        ? `Hello, ${userName}! ${content}` 
        : content,
      sender,
      timestamp: Date.now(),
      context: {
        sessionId: conversationContext.sessionId,
        originalInput: content,
        category: sender === 'user' ? 'user_query' : 'ai_response',
        userName: userName
      }
    };

    setConversationContext(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      lastInteractionTimestamp: Date.now()
    }));
  }, [conversationContext.sessionId]);

  // State for suggested questions
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);

  // Model initialization
  const initializeModel = useCallback(async () => {
    try {
      if (!config.apiKey) {
        throw new Error('Hugging Face API key is missing');
      }

      setModelStatus(prev => ({ ...prev, isInitializing: true, color: 'yellow' }));
      
      await chatService.testConnection();
      
      setModelStatus({
        isInitializing: false,
        isReady: true,
        temperature: config.temperature,
        color: 'green'
      });
    } catch (error) {
      console.error('Model Initialization Error:', error);
      setModelStatus({
        isInitializing: false,
        isReady: false,
        temperature: 0,
        color: 'red'
      });
      
      addMessage(
        'I apologize, but our AI service is experiencing temporary difficulties. ' +
        'Please try again in a few moments or contact support if the issue persists.', 
        'ai'
      );
    }
  }, [chatService, config, addMessage]);

  // Generate AI response
  const generateAIResponse = useCallback(async (input: string) => {
    if (!modelStatus.isReady) {
      addMessage(
        'I\'m just warming up! Please give me a moment to prepare my response. ' +
        'We\'ll be ready to chat very soon.', 
        'ai'
      );
      
      try {
        await initializeModel();
      } catch (initError) {
        console.error('Failed to reinitialize model:', initError);
        addMessage(
          'I\'m experiencing some technical difficulties at the moment. ' +
          'Our team is working to resolve this. Please try again shortly.', 
          'ai'
        );
        return;
      }
    }

    try {
      // Generate system prompt with current conversation context
      const systemPrompt = createSystemPrompt(conversationContext);

      // Enhanced response generation with more context
      const aiResponse = await chatService.generateResponse(input, {
        systemPrompt,
        responseFormat: conversationContext.responseFormat || {
          type: 'default',
          style: 'professional',
          maxLength: 350
        }
      });
      
      if (!aiResponse.text) {
        throw new Error('Empty AI response');
      }

      // Extract and store suggested questions
      const newSuggestedQuestions = aiResponse.context?.suggestedQuestions || 
        aiResponse.suggestions || 
        [];
      setSuggestedQuestions(newSuggestedQuestions);

      // Format the response with additional context
      const formattedResponse = formatResponse(aiResponse.text, {
        category: 'user_query',
        originalInput: input
      });

      // Add contextual suggestions if available
      const finalResponse = `${formattedResponse}\n\n${
        newSuggestedQuestions.length > 0
          ? 'Related suggestions: ' + newSuggestedQuestions.join(', ') 
          : ''
      }`.trim();

      addMessage(finalResponse, 'ai');
    } catch (error) {
      console.error('AI Response Generation Error:', error);
      
      // More informative fallback response
      const fallbackResponse = `I apologize, but I'm having trouble fully processing your request. 
Here's some general guidance to help you:

${PREDEFINED_KNOWLEDGE['help']}

Could you rephrase your query or provide more context? I'm here to help!`;
      
      addMessage(fallbackResponse, 'ai');
    }
  }, [addMessage, modelStatus.isReady, initializeModel, conversationContext, chatService]);

  // Reset conversation
  const resetConversation = useCallback(() => {
    const newSessionId = uuidv4();
    const systemPrompt = createSystemPrompt();
    const defaultResponseFormat: ResponseFormat = {
      type: 'default',
      style: 'professional',
      emoji: true,
      maxLength: 350
    };

    setConversationContext({
      sessionId: newSessionId,
      messages: [{
        id: uuidv4(),
        content: PREDEFINED_KNOWLEDGE['help'],
        sender: 'ai',
        timestamp: Date.now(),
        context: {
          sessionId: newSessionId,
          category: 'ai_welcome',
          originalInput: 'Initial conversation start'
        }
      }],
      lastInteractionTimestamp: Date.now(),
      systemPrompt,
      responseFormat: defaultResponseFormat
    });
  }, []);

  // Provide context value
  const contextValue = useMemo(() => ({
    conversationContext,
    modelStatus,
    addMessage,
    generateAIResponse,
    resetConversation,
    initializeModel,
    setConversationContext,
    suggestedQuestions
  }), [
    conversationContext, 
    modelStatus, 
    addMessage, 
    generateAIResponse, 
    resetConversation, 
    initializeModel,
    setConversationContext,
    suggestedQuestions
  ]);

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook to use chat context
export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

// Custom hook to access chat state
export const useChatState = () => {
  const { 
    conversationContext, 
    modelStatus,
    addMessage, 
    generateAIResponse, 
    resetConversation,
    initializeModel,
    setConversationContext,
    suggestedQuestions
  } = useChatContext();

  // Create a state for system prompt
  const [systemPrompt, setSystemPrompt] = useState<string>(
    createSystemPrompt(conversationContext)
  );

  // Update conversation context
  const updateConversationContext = useCallback((updates: Partial<ConversationContext>) => {
    // Directly use the setConversationContext from the provider
    const updatedContext = {
      ...conversationContext,
      ...updates,
      responseFormat: updates.responseFormat 
        ? { ...conversationContext.responseFormat, ...updates.responseFormat } 
        : conversationContext.responseFormat
    };
    
    // Update the conversation context in the provider
    setConversationContext(updatedContext);
    
    // Update system prompt if needed
    if (updates.systemPrompt) {
      setSystemPrompt(updates.systemPrompt);
    }
  }, [conversationContext, setConversationContext]);

  // Return enhanced state
  return {
    messages: conversationContext.messages,
    sessionId: conversationContext.sessionId,
    modelStatus,
    addMessage,
    generateAIResponse,
    resetConversation,
    initializeModel,
    currentTopic: conversationContext.currentTopic,
    lastInteractionTimestamp: conversationContext.lastInteractionTimestamp,
    systemPrompt,
    updateConversationContext,
    suggestedQuestions
  };
};