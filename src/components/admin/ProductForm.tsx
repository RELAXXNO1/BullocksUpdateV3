import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, StopCircle, X, PlusCircle, CheckCircle2, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { DEFAULT_CATEGORIES, CategoryConfig } from '../../constants/categories';
import type { FormStep } from '../../types/form';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { getPhotobankImages } from '../../lib/photobank';
import { collection, addDoc, updateDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { Product, ProductFormData } from '../../types/product';

// Hugging Face Inference API Integration
const HF_API_TOKEN = process.env.REACT_APP_HF_API_TOKEN || "YOUR_HF_API_TOKEN";
const HF_ENDPOINT = "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1";

async function getHFTextResponse(userInput: string, sessionHistory: string[]): Promise<string | null> {
  try {
    const prompt = `${sessionHistory.join("\n")}\nUser: ${userInput}`;
    const response = await fetch(HF_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(HF_API_TOKEN && HF_API_TOKEN !== "YOUR_HF_API_TOKEN" ? { "Authorization": `Bearer ${HF_API_TOKEN}` } : {}),
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 150,
          temperature: 0.7,
          top_p: 0.9,
          return_full_text: false,
        },
      }),
    });
    if (!response.ok) throw new Error(`Hugging Face API Error: ${response.status} - ${response.statusText}`);
    const data = await response.json();
    return data[0]?.generated_text || null;
  } catch (error) {
    console.error("Hugging Face API error:", error);
    return null;
  }
}

async function performWebSearch(query: string): Promise<string> {
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    return `Summary: Found key details and features about "${query}" from reputable sources.`;
  } catch (error) {
    console.error("Web search error:", error);
    return "";
  }
}

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

const navigationCommands = {
  next: ['next', 'go to details', 'proceed'],
  previous: ['previous', 'go back', 'back to category'],
  submit: ['submit', 'finish', 'done'],
};

function isNavigationCommand(text: string): { command: string; type: 'next' | 'previous' | 'submit' } | null {
  const lowerText = text.toLowerCase();
  for (const [type, phrases] of Object.entries(navigationCommands)) {
    if (phrases.some(phrase => lowerText.includes(phrase))) {
      return { command: phrases[0], type: type as 'next' | 'previous' | 'submit' };
    }
  }
  return null;
}

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
        alert("Speech recognition error. Please try again.");
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
        role="button"
        aria-label={listening ? "Stop listening" : "Start listening"}
      >
        {listening ? <StopCircle className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-white" />}
      </motion.div>
      {transcript && <p className="text-sm text-gray-300 mt-2">Heard: {transcript}</p>}
    </div>
  );
};

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

export function ProductForm({ onClose, initialProduct }: { onClose?: () => void; initialProduct?: Product }) {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<FormStep>('category');
  const [formData, setFormData] = useState<ProductFormData>(() => {
    const initialPrice = initialProduct?.price
      ? Array.isArray(initialProduct.price)
        ? initialProduct.price
        : Object.entries(initialProduct.price as { [key: string]: number }).map(([label, value]) => ({ label, value }))
      : [{ label: '', value: 0 }];
    return {
      category: initialProduct?.category || '',
      name: initialProduct?.name || '',
      description: initialProduct?.description || '',
      price: initialPrice,
      attributes: initialProduct?.attributes || {},
      isVisible: initialProduct?.isVisible ?? true,
      images: initialProduct?.images || [],
      createdAt: initialProduct?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });

  const [sessionHistory, setSessionHistory] = useState<string[]>([]);
  const [voiceInputEnabled, setVoiceInputEnabled] = useState(true);
  const [autoPlayVoiceResponse, setAutoPlayVoiceResponse] = useState(false);
  const [photobankImages, setPhotobankImages] = useState<any[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>(initialProduct?.images || []);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [isLoadingPhotobank, setIsLoadingPhotobank] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const selectedCategory = DEFAULT_CATEGORIES.find(cat => cat.slug === formData.category);

  const updateFormData = (updates: Partial<ProductFormData>) => {
    setFormData(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString()
    }));
  };

  const addPriceField = () => {
    setFormData(prev => ({
      ...prev,
      price: [...prev.price, { label: '', value: 0 }]
    }));
  };

  const removePriceField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      price: prev.price.filter((_, i) => i !== index)
    }));
  };

  const updatePriceField = (index: number, field: 'label' | 'value', newValue: string | number) => {
    setFormData(prev => ({
      ...prev,
      price: prev.price.map((item, i) =>
        i === index ? { ...item, [field]: field === 'value' ? parseFloat(newValue as string) || 0 : newValue } : item
      )
    }));
  };

  useEffect(() => {
    if (formData.category && formData.price.length === 0) {
      setFormData(prev => ({
        ...prev,
        price: [{ label: '', value: 0 }]
      }));
    }
  }, [formData.category]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    const steps: FormStep[] = ['category', 'details'];
    const invalidStep = steps.find(step => {
      if (step === 'category') return !formData.category;
      if (step === 'details') {
        const basicValid = !!(
          formData.name.trim() &&
          formData.description?.trim() &&
          formData.price.some(p => p.value > 0 && p.label.trim())
        );
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
      setError(`Submission failed: Please complete all required fields in the ${invalidStep} step.`);
      setIsSubmitting(false);
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
        setError('Category not found. Please select a valid category.');
        setIsSubmitting(false);
        return;
      }
    } catch (error) {
      setError('Error fetching category. Please try again.');
      setIsSubmitting(false);
      return;
    }
    const productData: ProductFormData = {
      ...formData,
      category: categoryId,
      description: formData.description || '',
      images: selectedImages,
      price: formData.price,
      attributes: formData.attributes || {},
      isVisible: formData.isVisible,
      createdAt: formData.createdAt,
      updatedAt: formData.updatedAt
    };

    try {
      if (initialProduct) {
        const productRef = doc(db, 'products', initialProduct.id!);
        await updateDoc(productRef, productData);
      } else {
        const productsCollection = collection(db, 'products');
        await addDoc(productsCollection, productData);
      }
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose?.();
        navigate('/admin/products');
      }, 2000);
    } catch (error: any) {
      setError(`Failed to save product: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoiceInput = async (voiceText: string) => {
    const navCommand = isNavigationCommand(voiceText);
    if (navCommand) {
      switch (navCommand.type) {
        case 'next':
          if (currentStep === 'category') setCurrentStep('details');
          break;
        case 'previous':
          if (currentStep === 'details') setCurrentStep('category');
          break;
        case 'submit':
          if (currentStep === 'details') handleSubmit();
          break;
      }
      setSessionHistory(prev => [...prev, `User: ${voiceText}`]);
      return;
    }

    let finalPrompt = voiceText;
    const searchQuery = extractSearchQuery(voiceText);
    if (searchQuery) {
      const searchResults = await performWebSearch(searchQuery);
      finalPrompt += `\nWeb search results: ${searchResults}`;
    }
    updateFormData({ description: (formData.description || '') + " " + voiceText });
    setSessionHistory(prev => [...prev, `User: ${voiceText}`]);
  };

  const generateHFDescription = async () => {
    const productName = formData.name.trim();
    if (!productName) {
      setError("Please enter a product name before generating a description.");
      return;
    }
    setIsGeneratingDescription(true);
    setError(null);
    const keywords = ["diamonds", "relaxed", "euphoric", "happy", "mood-boosting", "focus", "creativity", "sleep", "3.5g", "7.0g", "14.0g", "28.0g", "1/8", "1/4", "1/2", "1", "ounce", "o.z.", "infused", "sativa", "indica", "hybrid", "on sale!", "new arrival"];
    const searchResults = await performWebSearch(productName);
    const prompt = `Generate a standard product description for a cannabis product named "${productName}" in the ${selectedCategory?.name} category. Use the following keywords where relevant: ${keywords.join(", ")}. Incorporate information from a web search: ${searchResults}. Provide a concise description highlighting key features, effects, and strain type if applicable.`;
    const suggestion = await getHFTextResponse(prompt, sessionHistory);
    if (suggestion) {
      updateFormData({ description: suggestion });
      setSessionHistory(prev => [...prev, `AI (text): ${suggestion}`]);
    } else {
      setError("Failed to generate description from Hugging Face API.");
    }
    setIsGeneratingDescription(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && currentStep === 'details') {
        handleSubmit();
      } else if (e.key === 'ArrowRight' && currentStep === 'category') {
        setCurrentStep('details');
      } else if (e.key === 'ArrowLeft' && currentStep === 'details') {
        setCurrentStep('category');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, handleSubmit]);

  useEffect(() => {
    if (formData.category) {
      setIsLoadingPhotobank(true);
      getPhotobankImages(formData.category)
        .then(images => {
          setPhotobankImages(images);
          setIsLoadingPhotobank(false);
        })
        .catch(error => {
          console.error("Error fetching photobank images:", error);
          setError("Failed to load photobank images. Please try again.");
          setIsLoadingPhotobank(false);
        });
    } else {
      setPhotobankImages([]);
    }
  }, [formData.category]);

  const renderCategoryStep = () => (
    <div className="space-y-6">
      <div className="flex justify-center space-x-4 mb-6">
        <div className={`flex items-center space-x-2 ${currentStep === 'category' ? 'text-teal-300' : 'text-teal-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'category' ? 'bg-teal-500' : 'bg-teal-700'}`}>
            1
          </div>
          <span>Category</span>
        </div>
        <div className={`flex items-center space-x-2 ${currentStep === 'details' ? 'text-teal-300' : 'text-teal-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'details' ? 'bg-teal-500' : 'bg-teal-700'}`}>
            2
          </div>
          <span>Details</span>
        </div>
      </div>
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
              aria-label={`Select ${category.name} category`}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold">{category.name}</span>
                {formData.category === category.slug && <CheckCircle2 className="w-5 h-5 text-white" />}
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
              aria-label="Create new category"
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
                  aria-label="New category name"
                />
                <button
                  onClick={() => {
                    if (!newCategory.trim()) return;
                    const slug = newCategory.toLowerCase().replace(/\s+/g, '-');
                    if (DEFAULT_CATEGORIES.find(cat => cat.slug === slug)) {
                      setError('A category with this name already exists');
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
                  aria-label="Create category"
                >
                  Create
                </button>
                <button
                  onClick={() => { setIsCreatingCategory(false); setNewCategory(''); }}
                  className="px-4 py-2 bg-teal-800 text-teal-300 rounded hover:bg-teal-700 transition-colors"
                  aria-label="Cancel category creation"
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

  const renderDetailsStep = () => {
    const categoryAttributes = selectedCategory?.attributes?.fields || [];
    return (
      <div className="space-y-6">
        <div className="flex justify-center space-x-4 mb-6">
          <div className={`flex items-center space-x-2 ${currentStep === 'category' ? 'text-teal-300' : 'text-teal-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'category' ? 'bg-teal-500' : 'bg-teal-700'}`}>
              1
            </div>
            <span>Category</span>
          </div>
          <div className={`flex items-center space-x-2 ${currentStep === 'details' ? 'text-teal-300' : 'text-teal-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'details' ? 'bg-teal-500' : 'bg-teal-700'}`}>
              2
            </div>
            <span>Details</span>
          </div>
        </div>
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
                aria-label="Product name"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-teal-300">
                Price <span className="text-red-500">*</span>
              </label>
              {formData.price.map((priceField, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={priceField.label}
                    onChange={e => updatePriceField(index, 'label', e.target.value)}
                    placeholder="Label (e.g., 3.5g, per pack)"
                    className="w-1/2 px-3 py-2 bg-teal-800 border border-teal-700 rounded text-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-teal-500 transition-all duration-300"
                    aria-label={`Price label ${index + 1}`}
                  />
                  <div className="relative w-1/2">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-400">$</span>
                    <input
                      type="number"
                      value={priceField.value || 0}
                      onChange={e => updatePriceField(index, 'value', e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full pl-6 pr-3 py-2 bg-teal-800 border border-teal-700 rounded text-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-teal-500 transition-all duration-300"
                      aria-label={`Price value ${index + 1}`}
                    />
                  </div>
                  {formData.price.length > 1 && (
                    <button
                      onClick={() => removePriceField(index)}
                      className="text-red-400 hover:text-red-300"
                      aria-label={`Remove price field ${index + 1}`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addPriceField}
                className="mt-2 flex items-center space-x-1 text-teal-300 hover:text-teal-100"
                aria-label="Add another price field"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Price Field</span>
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-teal-300">Description</label>
            <textarea
              value={formData.description ?? ''}
              onChange={e => updateFormData({ description: e.target.value })}
              placeholder="Enter product description"
              rows={4}
              className="w-full px-3 py-2 bg-teal-800 border border-teal-700 rounded text-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-teal-500 transition-all duration-300 resize-none"
              aria-label="Product description"
            />
            <Button
              onClick={generateHFDescription}
              className="mt-2"
              aria-label="Generate Hugging Face description"
              disabled={isGeneratingDescription}
            >
              {isGeneratingDescription ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white inline-block mr-2"></div>
              ) : null}
              Mixtral Describe
            </Button>
            <div
              className="w-full px-3 py-2 bg-teal-800 border border-teal-700 rounded text-teal-100 transition-all duration-300"
              style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem', pointerEvents: 'none', userSelect: 'none', opacity: 0.7 }}
              dangerouslySetInnerHTML={{ __html: applyKeywordStyling(formData.description ?? '') }}
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
                  aria-label="Enable voice input"
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
                  disabled
                />
                <span className="text-sm text-teal-300">Auto-Play AI Response (Disabled)</span>
              </label>
            </div>
          </div>
          {voiceInputEnabled && (
            <div className="space-y-4">
              <p className="text-gray-400 text-sm">Tap the orb and speak—try commands like “search for [product/strain]”, “next step”, “previous step”, or “submit”. (Text only, no audio response)</p>
              <VoiceChatOrb onVoiceInput={handleVoiceInput} />
            </div>
          )}
          <div className="mt-4">
            <button onClick={() => setShowHistory(!showHistory)} className="text-teal-300 hover:text-teal-100" aria-label="Toggle voice command history">
              {showHistory ? 'Hide' : 'Show'} Voice Command History
            </button>
            {showHistory && (
              <div className="mt-2 p-4 bg-teal-800 rounded-lg">
                {sessionHistory.map((entry, index) => (
                  <p key={index} className="text-teal-100">{entry}</p>
                ))}
              </div>
            )}
          </div>
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
                            aria-label={`${attr.label} input`}
                          />
                        );
                      case 'number':
                        return (
                          <input
                            type="number"
                            value={currentValue}
                            onChange={(e) => updateFormData({ attributes: { ...formData.attributes, [attr.name]: e.target.value } })}
                            placeholder={`Enter ${attr.label}`}
                            min={(attr as any).min}
                            max={(attr as any).max}
                            className="w-full px-3 py-2 bg-teal-800 border border-teal-700 rounded text-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            aria-label={`${attr.label} input`}
                          />
                        );
                      case 'select':
                        return (
                          <select
                            value={String(currentValue)}
                            onChange={(e) => updateFormData({ attributes: { ...formData.attributes, [attr.name]: e.target.value } })}
                            className="w-full px-3 py-2 bg-teal-800 border border-teal-700 rounded text-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            aria-label={`${attr.label} select`}
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
                                aria-label={`${attr.label} yes`}
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
                                aria-label={`${attr.label} no`}
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
                            aria-label={`${attr.label} input`}
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
              {isLoadingPhotobank ? (
                <div className="flex justify-center items-center h-48">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
                </div>
              ) : photobankImages.length > 0 ? (
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
                        role="button"
                        aria-label={`Select image ${image.id}`}
                      />
                      {selectedImages.includes(image.downloadURL) && (
                        <div className="absolute top-2 right-2 bg-teal-600 text-white rounded-full p-1">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-teal-300">No images available for this category.</p>
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
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg"
            role="alert"
            aria-label="Success message"
          >
            Product saved successfully!
          </motion.div>
        )}
        {error && (
          <div className="fixed top-4 left-4 bg-red-900 text-red-100 p-4 rounded-lg shadow-lg" role="alert" aria-label="Error message">
            {error}
          </div>
        )}
        <div className="sticky top-0 z-10 bg-teal-900/80 backdrop-blur-sm border-b border-teal-700/50 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-teal-100">{initialProduct ? 'Edit Product' : 'Create New Product'}</h2>
          <button onClick={() => onClose?.()} className="text-teal-300 hover:text-teal-100 transition-colors" aria-label="Close form">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {currentStep === 'category' && renderCategoryStep()}
          {currentStep === 'details' && renderDetailsStep()}
        </div>
        <div className="sticky bottom-0 bg-teal-900/80 backdrop-blur-sm border-t border-teal-700/50 px-6 py-4 flex justify-between items-center">
          {currentStep !== 'category' && (
            <Button variant="secondary" onClick={() => setCurrentStep('category')} className="flex items-center space-x-2" aria-label="Go to previous step">
              <ChevronLeft className="w-5 h-5" />
              <span>Previous</span>
            </Button>
          )}
          {currentStep !== 'details' ? (
            <Button variant="default" onClick={() => setCurrentStep('details')} className="ml-auto flex items-center space-x-2" aria-label="Go to next step">
              <span>Next</span>
              <ChevronRight className="w-5 h-5" />
            </Button>
          ) : (
            <Button variant="default" onClick={handleSubmit} disabled={isSubmitting} className="ml-auto" aria-label="Submit product form">
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                "Submit Product"
              )}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}