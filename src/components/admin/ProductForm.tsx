import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, PlusCircle, CheckCircle2, Mic, StopCircle, Volume2 } from 'lucide-react';
import { collection, addDoc, updateDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { Product, ProductFormData } from '../../types/product';
import { DEFAULT_CATEGORIES, CategoryConfig } from '../../constants/categories';
import type { FormStep } from '../../types/form';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { getPhotobankImages } from '../../lib/photobank';
import { useAuth } from '../../hooks/useAuth';

//
// Gemini 2.0 API Integration for Voice (replace with your actual API key/endpoint)
//
const GEMINI_API_KEY = "AIzaSyD5P9YNGVe8UydYJdSARhBY2pOdTquqq34";
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2:streamGenerateContent";

async function getGeminiVoiceResponse(userInput: string, sessionHistory: string[]): Promise<string | null> {
  try {
    const payload = {
      contents: [{ role: "user", parts: [{ text: userInput }] }],
      sessionHistory,
      responseModalities: ["AUDIO"],
      speechConfig: { voice: "charon", speakingRate: 1.0 }
    };
    const response = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": GEMINI_API_KEY
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`Gemini API Error: ${response.status}`);
    const data = await response.json();
    // Assume the audio response URL is in data.responses[0].audio
    return data.responses?.[0]?.audio || null;
  } catch (error) {
    console.error("Gemini API error:", error);
    return null;
  }
}

//
// Simulated Web Search Function: In production, replace with an actual API call.
// This function returns a summary string based on the query provided.
//
async function performWebSearch(query: string): Promise<string> {
  try {
    // Simulated delay and result
    await new Promise(resolve => setTimeout(resolve, 500));
    return `Summary: Found key details and features about "${query}" from reputable sources.`;
  } catch (error) {
    console.error("Web search error:", error);
    return "";
  }
}

//
// Utility function to extract a search query if the voice command indicates a lookup.
//
function extractSearchQuery(voiceText: string): string | null {
  const lower = voiceText.toLowerCase();
  let query: string | null = null;
  if (lower.includes("search for")) {
    const match = voiceText.match(/search for (.+)/i);
    if (match && match[1]) {
      query = match[1].trim();
    }
  } else if (lower.includes("lookup")) {
    const match = voiceText.match(/lookup (.+)/i);
    if (match && match[1]) {
      query = match[1].trim();
    }
  }
  return query;
}

//
// VoiceChatOrb Component – Handles voice input and triggers the onVoiceInput callback.
//
const VoiceChatOrb: React.FC<{ onVoiceInput: (text: string) => void }> = ({ onVoiceInput }) => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const result = event.results[0][0].transcript;
        setTranscript(result);
        onVoiceInput(result);
        setListening(false);
      };
      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event);
        setListening(false);
      };
      recognitionRef.current = recognition;
    }
  }, [onVoiceInput]);

  const startListening = () => {
    if (recognitionRef.current) {
      setListening(true);
      setTranscript("");
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  const pulseVariants = {
    idle: { scale: 1, boxShadow: "0px 0px 0px rgba(0, 150, 136, 0)" },
    listening: {
      scale: [1, 1.2, 1],
      boxShadow: [
        "0px 0px 0px rgba(100, 100, 255, 0.5)",
        "0px 0px 20px rgba(100, 100, 255, 0.8)",
        "0px 0px 0px rgba(100, 100, 255, 0.5)"
      ],
      transition: { repeat: Infinity, duration: 1.5 }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <motion.div
        className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 cursor-pointer shadow-lg"
        variants={pulseVariants}
        animate={listening ? "listening" : "idle"}
        onClick={() => (listening ? stopListening() : startListening())}
      >
        {listening ? <StopCircle className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-white" />}
      </motion.div>
      {transcript && <p className="text-sm text-gray-300 mt-2">Heard: {transcript}</p>}
    </div>
  );
};

//
// Utility: Apply Keyword Styling to product description preview.
//
export const applyKeywordStyling = (description: string) => {
  if (!description) return "";
  const KEYWORDS = ["diamonds", "relaxed", "euphoric", "happy", "mood-boosting", "focus", "creativity", "sleep", "3.5g", "7.0g", "14.0g", "28.0g", "1/8", "1/4", "1/2", "1", "ounce", "o.z.", "infused", "sativa", "indica", "hybrid", "on sale!", "new arrival"];
  const styledDescription = description.split(" ").map(word => {
      if (KEYWORDS.includes(word.toLowerCase())) {
          return `<span style="font-weight: bold; font-style: italic; color: teal; text-shadow: 0 0 5px rgb(14, 15, 4);">${word}</span>`;
      }
      return word;
  }).join(" ");
  return styledDescription;
};

//
// Main ProductForm Component – Combines multi-step product creation with enhanced voice-to-voice AI integration.
//
export function ProductForm({ onClose, initialProduct }: { onClose?: () => void; initialProduct?: Product }) {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Multi-step state
  const [currentStep, setCurrentStep] = useState<FormStep>('category');

  // Form data state with default structure
  const [formData, setFormData] = useState<ProductFormData>(() => ({
    category: initialProduct?.category || '',
    name: initialProduct?.name || '',
    description: initialProduct?.description || '',
    price: initialProduct?.price || { '1.75g': 0, '3.5g': 0, '7g': 0, '14g': 0, '1oz': 0 },
    attributes: initialProduct?.attributes || {},
    isVisible: initialProduct?.isVisible ?? true,
    images: initialProduct?.images || [],
    createdAt: initialProduct?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));

  // AI and voice integration state
  const [sessionHistory, setSessionHistory] = useState<string[]>([]);
  const [aiAudio, setAiAudio] = useState<string | null>(null);
  const [voiceInputEnabled, setVoiceInputEnabled] = useState(true);
  const [autoPlayVoiceResponse, setAutoPlayVoiceResponse] = useState(false);

  // Category and photobank states
  const [photobankImages, setPhotobankImages] = useState<any[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>(initialProduct?.images || []);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const handlePreviousStep = () => {
    if (currentStep === 'details') {
      setCurrentStep('category');
    }
  };

  const selectedCategory = useMemo(() =>
    DEFAULT_CATEGORIES.find(cat => cat.slug === formData.category),
    [formData.category]
  );

  // Helper to update form data consistently.
  const updateFormData = useCallback((updates: Partial<ProductFormData>) => {
    setFormData(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString()
    }));
  }, []);

  // Normalize price structure.
  const normalizePrice = (price: number | { [key: string]: number } | undefined): { '1.75g': number; '3.5g': number; '7g': number; '14g': number; '1oz': number } => {
    const defaultPrice = { '1.75g': 0, '3.5g': 0, '7g': 0, '14g': 0, '1oz': 0 };
    if (price === undefined) return defaultPrice;
    if (typeof price === 'number') return { ...defaultPrice, '1.75g': price };
    const normalized = { ...defaultPrice, ...price };
    return {
      '1.75g': normalized['1.75g'] || 0,
      '3.5g': normalized['3.5g'] || 0,
      '7g': normalized['7g'] || 0,
      '14g': normalized['14g'] || 0,
      '1oz': normalized['1oz'] || 0
    };
  };

  // Enhanced voice input handler: if the input indicates a search/lookup, execute a web search
  // and combine the results with the original prompt.
  const handleVoiceInput = async (voiceText: string) => {
    let finalPrompt = voiceText;
    const searchQuery = extractSearchQuery(voiceText);
    if (searchQuery) {
      const searchResults = await performWebSearch(searchQuery);
      finalPrompt += `\nWeb search results: ${searchResults}`;
    }
    // Update description with the spoken text
    updateFormData({ description: formData.description + " " + voiceText });
    setSessionHistory(prev => [...prev, `User: ${voiceText}`]);
    const aiResponseAudio = await getGeminiVoiceResponse(finalPrompt, sessionHistory);
    if (aiResponseAudio) {
      setAiAudio(aiResponseAudio);
      setSessionHistory(prev => [...prev, `AI (audio): ${aiResponseAudio}`]);
      if (autoPlayVoiceResponse) {
        new Audio(aiResponseAudio).play().catch(err => console.error("Auto-play error:", err));
      }
    }
  };

  // Handle form submission (saving product to Firebase)
  const handleSubmit = useCallback(async () => {
    const steps: FormStep[] = ['category', 'details'];
    const invalidStep = steps.find(step => {
      if (step === 'category') return !formData.category;
      if (step === 'details') {
        const basicValid = !!(formData.name.trim() && formData.description.trim() &&
          (typeof formData.price === 'number'
            ? formData.price > 0
            : (typeof formData.price === 'object' && Object.values(formData.price).some(price => price > 0))));
        const categoryAttributes = selectedCategory?.attributes?.fields || [];
        const attributesValid = categoryAttributes.every(attr => {
          const value = formData.attributes?.[attr.name];
          if (!attr.required) return true;
          if (attr.type === 'text') return value && String(value).trim() !== '';
          if (attr.type === 'number') return value !== undefined && value !== null && value !== '';
          if (attr.type === 'select') return value && value !== '';
          if (attr.type === 'boolean') return value !== undefined;
          return true;
        });
        return !(basicValid && attributesValid && selectedImages.length > 0);
      }
      return false;
    });
    if (invalidStep) {
      console.warn(`Submission failed: Invalid step ${invalidStep}`);
      return;
    }
    let categoryId = formData.category;
    try {
      const categoriesCollection = collection(db, 'categories');
      const q = query(categoriesCollection, where('slug', '==', formData.category));
      const categorySnapshot = await getDocs(q);
      if (!categorySnapshot.empty) {
        categoryId = categorySnapshot.docs[0].id;
      } else {
        alert('Category not found. Please select a valid category.');
        return;
      }
    } catch (error) {
      console.error('Error fetching category:', error);
      alert('Error fetching category. Please try again.');
      return;
    }
    const normalizedPrice = normalizePrice(formData.price);
    const productData: ProductFormData = {
      ...formData,
      category: categoryId,
      description: formData.description || '',
      images: selectedImages,
      price: normalizedPrice,
      attributes: Object.fromEntries(
        Object.entries(formData.attributes || {}).map(([key, value]) => [key, value !== undefined ? String(value) : ''])
      ),
      createdAt: initialProduct?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      if (initialProduct) {
        const productRef = doc(db, 'products', initialProduct.id!);
        await updateDoc(productRef, productData);
      } else {
        const productsCollection = collection(db, 'products');
        await addDoc(productsCollection, productData);
      }
      onClose?.();
      navigate('/admin/products');
    } catch (error: any) {
      console.error("Error saving product:", error);
      alert(`Failed to save product: ${error.message}`);
    }
  }, [formData, selectedImages, initialProduct, navigate, onClose, sessionHistory, selectedCategory]);

  // Fetch photobank images whenever a category is selected.
  useEffect(() => {
    if (formData.category) {
      getPhotobankImages(formData.category)
        .then(images => setPhotobankImages(images))
        .catch(error => console.error("Error fetching photobank images:", error));
    } else {
      setPhotobankImages([]);
    }
  }, [formData.category]);

  // Render Category Selection Step.
  const renderCategoryStep = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-teal-100 mb-4">Select Product Category</h3>
      <div className="bg-teal-900/80 border border-teal-700/50 rounded-xl p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {DEFAULT_CATEGORIES.map((category) => (
            <button
              key={category.slug}
              onClick={() => updateFormData({ category: category.slug })}
              className={`p-4 rounded-lg text-left transition-all duration-300 ${formData.category === category.slug
                ? 'bg-teal-600 text-white ring-2 ring-teal-500'
                : 'bg-teal-800 text-teal-200 hover:bg-teal-700'}`}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold">{category.name}</span>
                {formData.category === category.slug && (<CheckCircle2 className="w-5 h-5 text-white" />)}
              </div>
              <p className="text-xs text-teal-300 mt-1 line-clamp-2">{category.description}</p>
            </button>
          ))}
        </div>
        <div className="mt-6 border-t border-teal-700/50 pt-6">
          {!isCreatingCategory ? (
            <button
              onClick={() => setIsCreatingCategory(true)}
              className="w-full flex items-center justify-center space-x-2 bg-teal-800 text-teal-300 hover:bg-teal-700 py-3 rounded-lg transition-colors duration-300"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Create New Category</span>
            </button>
          ) : (
            <div className="space-y-4">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter new category name"
                  className="flex-grow px-3 py-2 bg-teal-800 border border-teal-700 rounded text-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-teal-500"
                />
                <button
                  onClick={() => {
                    if (!newCategory.trim()) return;
                    const slug = newCategory.toLowerCase().replace(/\s+/g, '-');
                    if (DEFAULT_CATEGORIES.find(cat => cat.slug === slug)) {
                      alert('A category with this name already exists');
                      return;
                    }
                    const newCategoryConfig: CategoryConfig = {
                      slug,
                      name: newCategory,
                      description: `${newCategory} category`,
                      attributes: { fields: [] },
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString()
                    };
                    DEFAULT_CATEGORIES.push(newCategoryConfig);
                    updateFormData({ category: slug });
                    setIsCreatingCategory(false);
                    setNewCategory('');
                  }}
                  disabled={!newCategory.trim()}
                  className="px-4 py-2 bg-teal-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-teal-500 transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => { setIsCreatingCategory(false); setNewCategory(''); }}
                  className="px-4 py-2 bg-teal-800 text-teal-300 rounded hover:bg-teal-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render Details Step: includes fields for name, price, description (with enhanced AI voice input), attributes and image selection.
  const renderDetailsStep = () => {
    const categoryAttributes = selectedCategory?.attributes?.fields || [];
    const priceObject = typeof formData.price === 'object' && formData.price !== null
      ? formData.price
      : { '1.75g': 0, '3.5g': 0, '7g': 0, '14g': 0, '1oz': 0 };
    const PriceKeys = ['1.75g', '3.5g', '7g', '14g', '1oz'] as const;
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-teal-100 mb-4">
          Product Details for {selectedCategory?.name}
        </h3>
        <div className="bg-teal-900/80 border border-teal-700/50 rounded-xl p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-teal-300">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => updateFormData({ name: e.target.value })}
                placeholder="Enter product name"
                className="w-full px-3 py-2 bg-teal-800 border border-teal-700 rounded text-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-teal-500 transition-all duration-300"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-teal-300">
                Price <span className="text-red-500">*</span>
              </label>
              {typeof formData.price === 'number' ? (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-400">$</span>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={e => updateFormData({ price: { '1.75g': e.target.value ? parseFloat(e.target.value) : 0, '3.5g': 0, '7g': 0, '14g': 0, '1oz': 0 } })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full pl-6 pr-3 py-2 bg-teal-800 border border-teal-700 rounded text-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-teal-500 transition-all duration-300"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {PriceKeys.map((key) => (
                    <div key={key} className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-400">$</span>
                      <input
                        type="number"
                        value={priceObject[key]}
                        onChange={e => updateFormData({
                          price: { ...priceObject, [key]: e.target.value ? parseFloat(e.target.value) : 0 }
                        })}
                        placeholder={key}
                        min="0"
                        step="0.01"
                        className="w-full pl-6 pr-3 py-2 bg-teal-800 border border-teal-700 rounded text-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-teal-500 transition-all duration-300"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-teal-300">Description</label>
            <textarea
              value={formData.description || ''}
              onChange={e => updateFormData({ description: e.target.value })}
              placeholder="Enter product description"
              rows={4}
              className="w-full px-3 py-2 bg-teal-800 border border-teal-700 rounded text-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-teal-500 transition-all duration-300 resize-none"
            />
            <div
              className="w-full px-3 py-2 bg-teal-800 border border-teal-700 rounded text-teal-100 transition-all duration-300"
              style={{ whiteSpace: 'pre-wrap', marginTop: '-1rem', pointerEvents: 'none', userSelect: 'none', opacity: 0.7 }}
              dangerouslySetInnerHTML={{ __html: applyKeywordStyling(formData.description || '') }}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={voiceInputEnabled}
                  onChange={() => setVoiceInputEnabled(!voiceInputEnabled)}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-teal-300 rounded"
                />
                <span className="text-sm text-teal-300">Enable Voice Input</span>
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={autoPlayVoiceResponse}
                  onChange={() => setAutoPlayVoiceResponse(!autoPlayVoiceResponse)}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-teal-300 rounded"
                />
                <span className="text-sm text-teal-300">Auto-Play AI Response</span>
              </label>
            </div>
          </div>
          {voiceInputEnabled && (
            <div className="space-y-4">
              <p className="text-gray-400 text-sm">Tap the orb below and speak—try commands like “search for [product/strain]” for enhanced descriptions.</p>
              <VoiceChatOrb onVoiceInput={handleVoiceInput} />
            </div>
          )}
          {aiAudio && (
            <div className="mt-4">
              <Button onClick={() => new Audio(aiAudio).play()} className="flex items-center space-x-2">
                <Volume2 className="w-5 h-5" />
                <span>Hear AI Response</span>
              </Button>
            </div>
          )}
          {selectedCategory && categoryAttributes.length > 0 && (
            <div className="mt-6 space-y-6 border-t border-teal-700/50 pt-6">
              <h3 className="text-lg font-semibold text-teal-100">{selectedCategory.name} Specific Attributes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categoryAttributes.map((attr) => {
                  const currentValue = formData.attributes?.[attr.name] || '';
                  const renderAttributeInput = () => {
                    switch (attr.type) {
                      case 'text':
                        return (
                          <input
                            type="text"
                            value={String(currentValue)}
                            onChange={(e) => updateFormData({ attributes: { ...formData.attributes, [attr.name]: e.target.value } })}
                            placeholder={`Enter ${attr.label}`}
                            className="w-full px-3 py-2 bg-teal-800 border border-teal-700 rounded text-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        );
                      case 'number':
                        return (
                          <input
                            type="number"
                            value={currentValue}
                            onChange={(e) => updateFormData({ attributes: { ...formData.attributes, [attr.name]: e.target.value } })}
                            placeholder={`Enter ${attr.label}`}
                            min={attr.min}
                            max={attr.max}
                            className="w-full px-3 py-2 bg-teal-800 border border-teal-700 rounded text-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        );
                      case 'select':
                        return (
                          <select
                            value={String(currentValue)}
                            onChange={(e) => updateFormData({ attributes: { ...formData.attributes, [attr.name]: e.target.value } })}
                            className="w-full px-3 py-2 bg-teal-800 border border-teal-700 rounded text-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          >
                            <option value="">Select {attr.label}</option>
                            {attr.options?.map((option: string) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        );
                      case 'boolean':
                        return (
                          <div className="flex items-center space-x-3">
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name={attr.name}
                                value="1"
                                checked={currentValue === '1'}
                                onChange={() => updateFormData({ attributes: { ...formData.attributes, [attr.name]: '1' } })}
                                className="text-teal-500 focus:ring-teal-500"
                              />
                              <span>Yes</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name={attr.name}
                                value="0"
                                checked={currentValue === '0'}
                                onChange={() => updateFormData({ attributes: { ...formData.attributes, [attr.name]: '0' } })}
                                className="text-teal-500 focus:ring-teal-500"
                              />
                              <span>No</span>
                            </label>
                          </div>
                        );
                      default:
                        return (
                          <input
                            type="text"
                            value={String(currentValue)}
                            onChange={(e) => updateFormData({ attributes: { ...formData.attributes, [attr.name]: e.target.value } })}
                            placeholder={`Enter ${attr.label}`}
                            className="w-full px-3 py-2 bg-teal-800 border border-teal-700 rounded text-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        );
                    }
                  };
                  return (
                    <div key={attr.name} className="space-y-2">
                      <label className="block text-sm font-semibold text-teal-300">
                        {attr.label} {attr.required && <span className="text-red-600">*</span>}
                      </label>
                      {renderAttributeInput()}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {user && !authLoading && (
            <div className="mt-6 space-y-4 border-t border-teal-700/50 pt-6">
              <h3 className="text-lg font-semibold text-teal-100">Select Product Images</h3>
              {photobankImages.length > 0 && (
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {photobankImages.map((image) => (
                    <div
                      key={image.id}
                      className={`relative rounded-lg overflow-hidden shadow-md ${selectedImages.includes(image.downloadURL) ? 'ring-2 ring-teal-500' : ''}`}
                    >
                      <img
                        src={image.downloadURL}
                        alt="Product"
                        className="w-full h-48 object-cover cursor-pointer"
                        onClick={() => {
                          if (selectedImages.includes(image.downloadURL)) {
                            setSelectedImages(prev => prev.filter(url => url !== image.downloadURL));
                          } else {
                            setSelectedImages(prev => [...prev, image.downloadURL]);
                          }
                        }}
                      />
                      {selectedImages.includes(image.downloadURL) && (
                        <div className="absolute top-2 right-2 bg-teal-600 text-white rounded-full p-1">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        className="relative w-full max-w-2xl max-h-[90vh] bg-teal-950 rounded-2xl shadow-2xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        <div className="sticky top-0 z-10 bg-teal-900/80 backdrop-blur-sm border-b border-teal-700/50 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-teal-100">{initialProduct ? 'Edit Product' : 'Create New Product'}</h2>
          <button onClick={() => onClose?.()} className="text-teal-300 hover:text-teal-100 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          <AnimatePresence mode="wait">
            {currentStep === 'category' && renderCategoryStep()}
            {currentStep === 'details' && renderDetailsStep()}
          </AnimatePresence>
        </div>
        <div className="sticky bottom-0 bg-teal-900/80 backdrop-blur-sm border-t border-teal-700/50 px-6 py-4 flex justify-between items-center">
          {currentStep !== 'category' && (
            <Button variant="secondary" onClick={handlePreviousStep} className="flex items-center space-x-2">
              <ChevronLeft className="w-5 h-5" />
              <span>Previous</span>
            </Button>
          )}
          {currentStep !== 'details' ? (
            <Button variant="default" onClick={() => setCurrentStep('details')} className="ml-auto flex items-center space-x-2">
              <span>Next</span>
              <ChevronRight className="w-5 h-5" />
            </Button>
          ) : (
            <Button variant="default" onClick={handleSubmit} className="ml-auto">
              Submit Product
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
