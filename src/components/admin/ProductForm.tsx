import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PlusCircle, CheckCircle2, ChevronLeft, ChevronRight, AlertTriangle, Check, ImageIcon, Loader2 as Loader } from 'lucide-react';
import { DEFAULT_CATEGORIES, CategoryConfig, CategoryAttribute } from '../../constants/categories';
import type { FormStep } from '../../types/form';
import { Button } from '../ui/Button';
import { getPhotobankImages, PhotobankImage } from '../../lib/photobank';
import { addProduct, updateProduct } from '../../lib/firebase'; // Import addProduct and updateProduct
import type { Product, ProductFormData } from '../../types/product';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Select } from '../ui/Select';

// ProgressBar Component
const ProgressBar: React.FC<{ currentStep: FormStep }> = ({ currentStep }) => {
  const steps: FormStep[] = ['category', 'details'];
  const currentStepIndex = steps.indexOf(currentStep);

  return (
    <div className="w-full max-w-md mx-auto mb-12">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center text-center">
              <motion.div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                initial={false}
                animate={{
                  backgroundColor: index <= currentStepIndex ? '#14b8a6' : '#374151',
                  color: index <= currentStepIndex ? '#ffffff' : '#9ca3af',
                }}
                transition={{ duration: 0.3 }}
              >
                {index < currentStepIndex ? <Check size={24} /> : index + 1}
              </motion.div>
              <p className={`mt-2 text-sm font-medium transition-colors ${index <= currentStepIndex ? 'text-white' : 'text-gray-400'}`}>
                {step.charAt(0).toUpperCase() + step.slice(1)}
              </p>
            </div>
            {index < steps.length - 1 && (
              <motion.div className="flex-1 h-1 mx-4 rounded bg-gray-700">
                <motion.div
                  className="h-full rounded bg-teal-500"
                  initial={{ width: '0%' }}
                  animate={{ width: index < currentStepIndex ? '100%' : '0%' }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
              </motion.div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// CategoryStep Component
const CategoryStep: React.FC<{
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
}> = ({ selectedCategory, onSelectCategory }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const handleCreateCategory = () => {
    if (newCategoryName.trim()) {
      // In a real app, you would save this to the backend.
      console.log("Creating new category:", newCategoryName);
      // For this demo, we won't actually add it to the list.
      setIsCreating(false);
      setNewCategoryName("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Product Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {DEFAULT_CATEGORIES.map((category) => (
            <button
              key={category.slug}
              onClick={() => onSelectCategory(category.slug)}
              className={`p-4 rounded-lg text-left transition-all duration-300 transform hover:-translate-y-1 ${
                selectedCategory === category.slug
                  ? 'bg-teal-600 text-white ring-2 ring-teal-400 shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold">{category.name}</span>
                {selectedCategory === category.slug && <CheckCircle2 className="w-5 h-5 text-white" />}
              </div>
              <p className="text-xs text-gray-400 mt-1">{category.description}</p>
            </button>
          ))}
        </div>
        <div className="mt-6 border-t border-gray-700 pt-6">
          {!isCreating ? (
            <Button variant="outline" onClick={() => setIsCreating(true)} className="w-full">
              <PlusCircle className="w-5 h-5 mr-2" />
              Create New Category
            </Button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="text"
                value={newCategoryName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCategoryName(e.target.value)}
                placeholder="New category name"
                className="flex-grow"
              />
              <div className="flex gap-2">
                <Button onClick={handleCreateCategory}>Create</Button>
                <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// ImagePicker Component
const ImagePicker: React.FC<{
  category: string;
  selectedImages: string[];
  onImageSelectionChange: (images: string[]) => void;
}> = ({ category, selectedImages, onImageSelectionChange }) => {
    const [images, setImages] = useState<PhotobankImage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!category) return;
        setIsLoading(true);
        setError(null);
        getPhotobankImages(category)
            .then(setImages)
            .catch(() => setError("Failed to load images."))
            .finally(() => setIsLoading(false));
    }, [category]);

    const handleSelectImage = (url: string) => {
        const newSelection = selectedImages.includes(url)
            ? selectedImages.filter(imgUrl => imgUrl !== url)
            : [...selectedImages, url];
        onImageSelectionChange(newSelection);
    };

    return (
        <Card>
            <CardHeader><CardTitle>Product Images</CardTitle></CardHeader>
            <CardContent>
                {isLoading && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="w-full h-32 bg-gray-700 rounded-lg animate-pulse"></div>
                        ))}
                    </div>
                )}
                {!isLoading && error && <p className="text-red-400">{error}</p>}
                {!isLoading && !error && images.length === 0 && (
                    <div className="text-center py-10">
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-500" />
                        <h3 className="mt-2 text-sm font-medium text-gray-400">No images found</h3>
                        <p className="mt-1 text-sm text-gray-500">No photobank images available for this category.</p>
                    </div>
                )}
                {!isLoading && !error && images.length > 0 && (
                     <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                        {images.map(image => (
                            <div
                                key={image.id}
                                className="relative rounded-lg overflow-hidden cursor-pointer group"
                                onClick={() => handleSelectImage(image.url || image.base64 || '')}
                            >
                                {image.url || image.base64 ? (
                                    <img
                                        src={image.url || (image.base64 && image.base64.startsWith('data:') ? image.base64 : `data:image/jpeg;base64,${image.base64}`)}
                                        alt="Photobank"
                                        className="w-full h-32 object-cover transition-transform group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-32 bg-gray-700 flex items-center justify-center text-gray-400">
                                        <ImageIcon className="w-10 h-10" />
                                    </div>
                                )}
                                <div className={`absolute inset-0 bg-black/50 transition-opacity ${selectedImages.includes(image.url || image.base64 || '') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>
                                {selectedImages.includes(image.url || image.base64 || '') && (
                                    <div className="absolute top-2 right-2 bg-teal-500 text-white rounded-full p-1 shadow-lg">
                                        <Check size={16} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};


// AttributeInputs Component
const AttributeInputs: React.FC<{
  category: CategoryConfig | undefined; // Changed Category to CategoryConfig
  attributes: { [key: string]: string | number };
  onAttributeChange: (name: string, value: string | number) => void;
}> = ({ category, attributes, onAttributeChange }) => {
  const fields = category?.attributes?.fields || [];
  if (fields.length === 0) return null;

  const renderField = (field: CategoryAttribute) => { // Changed AttributeField to CategoryAttribute
    const value = attributes[field.name] || '';
    switch (field.type) {
      case 'number':
        return <Input id={field.name} type="number" value={value} placeholder={field.placeholder} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onAttributeChange(field.name, parseFloat(e.target.value) || 0)} />;
      case 'select':
        return (
          <Select id={field.name} value={value as string} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onAttributeChange(field.name, e.target.value)}>
            <option value="">Select...</option>
            {field.options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
          </Select>
        );
      case 'text':
      default:
        return <Input id={field.name} type="text" value={value} placeholder={field.placeholder} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onAttributeChange(field.name, e.target.value)} />;
    }
  };
  
  return (
    <Card>
      <CardHeader><CardTitle>{category?.name} Attributes</CardTitle></CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field: CategoryAttribute) => ( // Changed AttributeField to CategoryAttribute
          <div key={field.name}>
            <Label htmlFor={field.name}>{field.label}</Label>
            {renderField(field)}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};


// Main ProductForm Component
interface ProductFormProps {
  onClose: () => void;
  initialProduct?: Product;
}

export function ProductForm({ onClose, initialProduct }: ProductFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>('category');
  const [formData, setFormData] = useState<ProductFormData>(() => {
    const defaultPrice = { '0.5g': 0, '1g': 0, '1.75g': 0, '3.5g': 0, '7g': 0, '14g': 0, '1oz': 0 };
    return {
      category: initialProduct?.category || '',
      name: initialProduct?.name || '',
      description: initialProduct?.description || '',
      price: { ...defaultPrice, ...(initialProduct?.price || {}) as Record<string, number> }, // Ensured price is object
      attributes: (initialProduct?.attributes || {}) as Record<string, string | number>, // Ensured attributes is object
      isVisible: initialProduct?.isVisible ?? true,
      images: initialProduct?.images || [], // Ensured images is array
      createdAt: initialProduct?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const selectedCategoryData = DEFAULT_CATEGORIES.find(cat => cat.slug === formData.category);

  const updateFormData = useCallback(<K extends keyof ProductFormData,>(key: K, value: ProductFormData[K]) => {
    setFormData(prev => ({
      ...prev,
      [key]: value,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const handleValidation = () => {
    if (currentStep === 'details') {
      if (!formData.name.trim()) {
        setError("Product name is required.");
        return false;
      }
    }
    setError(null);
    return true;
  };

  const handleNextStep = () => {
    if (handleValidation()) {
      setCurrentStep('details');
    }
  };
  
  const handleSubmit = async () => {
    if (!handleValidation()) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    console.log("Submitting product data:", formData);
    try {
      if (initialProduct?.id) {
        await updateProduct(initialProduct.id, formData);
      } else {
        await addProduct(formData);
      }
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (e: any) {
      setError(`Failed to save product: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const priceKeys = ['0.5g', '1g', '1.75g', '3.5g', '7g', '14g', '1oz'] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <motion.div
        className="relative w-full max-w-4xl max-h-[90vh] bg-gray-900 border border-gray-700 rounded-2xl shadow-xl flex flex-col"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-2xl font-bold text-white">{initialProduct ? 'Edit Product' : 'Create New Product'}</h2>
          <Button onClick={onClose} variant="ghost" size="icon"><X size={24} /></Button>
        </div>

        <div className="p-8 overflow-y-auto flex-grow">
          <ProgressBar currentStep={currentStep} />
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 'category' ? (
                <CategoryStep
                  selectedCategory={formData.category}
                  onSelectCategory={(slug) => updateFormData('category', slug)}
                />
              ) : (
                <div className="space-y-6">
                  <Card>
                    <CardHeader><CardTitle>Product Details</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="product-name">Product Name</Label>
                        <Input id="product-name" value={formData.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('name', e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="product-description">Description</Label>
                        <Textarea id="product-description" value={formData.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateFormData('description', e.target.value)} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle>Pricing (per weight)</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {priceKeys.map(key => (
                        <div key={key}>
                          <Label htmlFor={`price-${key}`}>{key}</Label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                            <Input
                              id={`price-${key}`}
                              type="number"
                              className="pl-7"
                              value={formData.price[key] || ''}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const newPrice = { ...formData.price, [key]: parseFloat(e.target.value) || 0 };
                                updateFormData('price', newPrice);
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  
                  <AttributeInputs
                    category={selectedCategoryData}
                    attributes={formData.attributes}
                    onAttributeChange={(name, value) => {
                      const newAttributes = { ...formData.attributes, [name]: value };
                      updateFormData('attributes', newAttributes);
                    }}
                  />

                  <ImagePicker 
                    category={formData.category}
                    selectedImages={formData.images}
                    onImageSelectionChange={(images) => updateFormData('images', images)}
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="px-6 py-4 border-t border-gray-700 flex justify-between items-center flex-shrink-0">
          <Button variant="outline" onClick={() => setCurrentStep('category')} disabled={currentStep === 'category'}>
            <ChevronLeft className="w-5 h-5 mr-2" /> Previous
          </Button>
          {currentStep === 'category' ? (
            <Button onClick={handleNextStep} disabled={!formData.category}>
              Next <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader className="w-5 h-5 mr-2 animate-spin" />}
              {isSubmitting ? 'Submitting...' : (initialProduct ? 'Save Changes' : 'Submit Product')}
            </Button>
          )}
        </div>
        
        <AnimatePresence>
          {error && (
            <motion.div
              className="absolute bottom-20 right-6 bg-red-500 text-white p-3 rounded-lg flex items-center gap-2 shadow-lg"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            >
              <AlertTriangle size={20} /> {error}
              <button onClick={() => setError(null)} className="absolute top-1 right-1 text-red-200 hover:text-white"><X size={14} /></button>
            </motion.div>
          )}
          {success && (
            <motion.div
              className="absolute bottom-20 right-6 bg-green-500 text-white p-3 rounded-lg flex items-center gap-2 shadow-lg"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            >
              <CheckCircle2 size={20} /> Product saved successfully!
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
