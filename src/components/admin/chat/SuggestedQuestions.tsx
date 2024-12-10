import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { useChatStore } from '../../../store/useChatStore';
import { v4 as uuidv4 } from 'uuid';

const suggestedQuestions = [
  {
    category: "Product Management",
    questions: [
      "How do I add a new product with images and watermark?",
      "How do I organize my product categories?",
      "How can I edit an existing product's details?",
      "How do I toggle product visibility?"
    ]
  },
  {
    category: "Store Content",
    questions: [
      "How do I edit the store content sections?",
      "How do I change section visibility?",
      "How do I update section titles and descriptions?",
      "Where can I see when content was last updated?"
    ]
  },
  {
    category: "Available Features",
    questions: [
      "What product management features do I have access to?",
      "What store content features can I use?",
      "How do I use the image watermarking feature?",
      "How can I manage product attributes?"
    ]
  }
];

export const SuggestedQuestions: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { addMessage, setIsTyping } = useChatStore();

  const handleQuestionClick = (question: string) => {
    addMessage({
      id: uuidv4(),
      content: question,
      sender: 'user',
      timestamp: Date.now(),
      context: {
        sessionId: 'suggested_question',
        originalInput: question,
        category: 'suggested_question'
      }
    });
    setIsTyping(true);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-700 transition-colors"
        title="Suggested Questions"
      >
        <HelpCircle className="w-6 h-6 text-blue-400" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full right-0 mb-2 w-80 bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700"
          >
            <div className="space-y-4">
              {suggestedQuestions.map((category) => (
                <div key={category.category}>
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">
                    {category.category}
                  </h3>
                  <div className="space-y-2">
                    {category.questions.map((question) => (
                      <button
                        key={question}
                        onClick={() => handleQuestionClick(question)}
                        className="w-full text-left text-sm text-gray-400 hover:text-white hover:bg-gray-700 p-2 rounded transition-colors"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
