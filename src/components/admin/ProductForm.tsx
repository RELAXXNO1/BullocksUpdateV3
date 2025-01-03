import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, PlusCircle, CheckCircle2 } from 'lucide-react';
import { collection, addDoc, updateDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { Product, ProductFormData } from '../../types/product';
import { DEFAULT_CATEGORIES } from '../../constants/categories';
import type { CategoryConfig } from '../../constants/categories';
import type { FormStep } from '../../types/form';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { getPhotobankImages } from '../../lib/photobank';
import { useAuth } from '../../hooks/useAuth';

type ProductFormProps = {
  onClose?: () => void;
  initialProduct?: Product;
  };

const KEYWORDS = ["diamonds", "relaxed", "euphoric", "happy", "mood-boosting", "focus", "creativity", "sleep", "3.5g", "7.0g", "14.0g", "28.0g", "1/8", "1/4", "1/2", "1", "ounce", "o.z.", "infused", "sativa", "indica", "hybrid", "on sale!", "new arrival"];

export const applyKeywordStyling = (description: string) => {
    if (!description) return "";

    const styledDescription = description.split(" ").map(word => {
        if (KEYWORDS.includes(word.toLowerCase())) {
            return `<span style="font-weight: bold; font-style: italic; color: teal; text-shadow: 0 0 5px rgba(0, 128, 128, 0.8);">${word}</span>`;
        }
        return word;
    }).join(" ");

    return styledDescription;
};

export function ProductForm({ onClose, initialProduct }: ProductFormProps) {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState<FormStep>('category');
    const [formData, setFormData] = useState<ProductFormData>(() => ({
        category: initialProduct?.category || '',
        name: initialProduct?.name || '',
        description: initialProduct?.description || '',
        price: initialProduct?.price || 0,
        attributes: initialProduct?.attributes || {},
        isVisible: initialProduct?.isVisible ?? true,
        images: initialProduct?.images || [],
        createdAt: initialProduct?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }));

    const [photobankImages, setPhotobankImages] = useState<any[]>([]);
    const [selectedImages, setSelectedImages] = useState<string[]>(
        initialProduct?.images || []
    );

    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [newCategory, setNewCategory] = useState('');

    const selectedCategory = useMemo(() =>
        DEFAULT_CATEGORIES.find(cat => cat.slug === formData.category),
        [formData.category]
    );

    const updateFormData = useCallback((updates: Partial<ProductFormData>) => {
        setFormData(prev => {
            const updatedAttributes = updates.attributes
                ? Object.fromEntries(
                    Object.entries(updates.attributes).map(([key, value]) => [
                        key,
                        typeof value === 'boolean'
                            ? (value ? '1' : '0')
                            : (value !== undefined ? String(value) : '')
                    ])
                )
                : prev.attributes;

            return {
                ...prev,
                ...updates,
                attributes: {
                    ...prev.attributes,
                    ...updatedAttributes
                },
                updatedAt: new Date().toISOString()
            };
        });
    }, []);

    const validateStep = useCallback(() => {
        const categoryAttributes = selectedCategory?.attributes?.fields || [];

        switch (currentStep) {
            case 'category':
                return !!formData.category;

            case 'details':
                const basicDetailsValid = !!(
                    formData.name.trim() &&
                    (formData.description || '').trim() &&
                    formData.price > 0
                );

                const attributesValid = categoryAttributes.every(attr => {
                    const value = formData.attributes?.[attr.name];
                    if (!attr.required) return true;

                    switch (attr.type) {
                        case 'text':
                            return value && String(value).trim() !== '';
                        case 'number':
                            return value !== undefined && value !== null && value !== '';
                        case 'select':
                            return value && value !== '';
                        case 'boolean':
                            return value !== undefined;
                        default:
                            return true;
                    }
                });

                return basicDetailsValid && attributesValid && selectedImages.length > 0;

            default:
                return false;
        }
    }, [currentStep, formData, selectedCategory, selectedImages]);

    const handleNextStep = useCallback(() => {
        if (!validateStep()) {
            console.warn(`Invalid input for step: ${currentStep}`);
            return;
        }

        const stepOrder: FormStep[] = ['category', 'details'];
        const currentIndex = stepOrder.indexOf(currentStep);
        if (currentIndex < stepOrder.length - 1) {
            setCurrentStep(stepOrder[currentIndex + 1]);
        }
    }, [currentStep, validateStep]);

    const handlePreviousStep = useCallback(() => {
        const stepOrder: FormStep[] = ['category', 'details'];
        const currentIndex = stepOrder.indexOf(currentStep);
        if (currentIndex > 0) {
            setCurrentStep(stepOrder[currentIndex - 1]);
        }
    }, [currentStep]);

    const handleSubmit = useCallback(async () => {
        const steps: FormStep[] = ['category', 'details'];
        const invalidStep = steps.find(step => !validateStep());

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
                console.error('Category not found for slug:', formData.category);
                alert('Category not found. Please select a valid category.');
                return;
            }
        } catch (error) {
            console.error('Error fetching category:', error);
            alert('Error fetching category. Please try again.');
            return;
        }

        const productData: ProductFormData = {
            ...formData,
            category: categoryId,
            description: formData.description || '',
            images: selectedImages,
            attributes: Object.fromEntries(
                Object.entries(formData.attributes || {}).map(([key, value]) => [
                    key,
                    value !== undefined ? String(value) : ''
                ])
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
    }, [formData, selectedImages, initialProduct, navigate, onClose, validateStep]);

    const renderCategoryStep = () => (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-teal-100 mb-4">
                Select Product Category
            </h3>

            <div className="bg-teal-900/80 border border-teal-700/50 rounded-xl p-6 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {DEFAULT_CATEGORIES.map((category) => (
                        <button
                            key={category.slug}
                            onClick={() => updateFormData({ category: category.slug })}
                            className={`
                p-4 rounded-lg text-left transition-all duration-300
                ${formData.category === category.slug
                                    ? 'bg-teal-600 text-white ring-2 ring-teal-500'
                                    : 'bg-teal-800 text-teal-200 hover:bg-teal-700'}
              `}
                        >
                            <div className="flex justify-between items-center">
                                <span className="font-semibold">{category.name}</span>
                                {formData.category === category.slug && (
                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                )}
                            </div>
                            <p className="text-xs text-teal-300 mt-1 line-clamp-2">
                                {category.description}
                            </p>
                        </button>
                    ))}
                </div>

                <div className="mt-6 border-t border-teal-700/50 pt-6">
                    {!isCreatingCategory ? (
                        <button
                            onClick={() => setIsCreatingCategory(true)}
                            className="w-full flex items-center justify-center space-x-2
                bg-teal-800 text-teal-300 hover:bg-teal-700
                py-3 rounded-lg transition-colors duration-300"
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
                                    className="flex-grow px-3 py-2 bg-teal-800 border border-teal-700
                    rounded text-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-500
                    placeholder-teal-500"
                                />
                                <button
                                    onClick={() => {
                                        if (!newCategory.trim()) return;

                                        const slug = newCategory.toLowerCase().replace(/\s+/g, '-');

                                        const existingCategory = DEFAULT_CATEGORIES.find(
                                            cat => cat.slug === slug
                                        );

                                        if (existingCategory) {
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
                                    className="px-4 py-2 bg-teal-600 text-white rounded
                    disabled:opacity-50 disabled:cursor-not-allowed
                    hover:bg-teal-500 transition-colors"
                                >
                                    Create
                                </button>
                                <button
                                    onClick={() => {
                                        setIsCreatingCategory(false);
                                        setNewCategory('');
                                    }}
                                    className="px-4 py-2 bg-teal-800 text-teal-300
                    rounded hover:bg-teal-700 transition-colors"
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
        const selectedCategory = DEFAULT_CATEGORIES.find(cat => cat.slug === formData.category);
        const categoryAttributes = selectedCategory?.attributes?.fields || [];

        return (
            <div className="space-y-6">
                <h3 className="text-xl font-semibold text-teal-100 mb-4">
                    Product Details for {selectedCategory?.name}
                </h3>

                <div className="bg-teal-900/80 border border-teal-700/50 rounded-xl p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label
                                htmlFor="productName"
                                className="block text-sm font-medium text-teal-300"
                            >
                                Product Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="productName"
                                type="text"
                                value={formData.name}
                                onChange={(e) => updateFormData({ name: e.target.value })}
                                placeholder="Enter product name"
                                className="w-full px-3 py-2 bg-teal-800 border border-teal-700 rounded text-teal-100
                  focus:outline-none focus:ring-2 focus:ring-teal-500
                  placeholder-teal-500 transition-all duration-300"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="productPrice"
                                className="block text-sm font-medium text-teal-300"
                            >
                                Price <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-400">$</span>
                                <input
                                    id="productPrice"
                                    type="number"
                                    value={formData.price || ''}
                                    onChange={(e) => updateFormData({
                                        price: e.target.value ? parseFloat(e.target.value) : 0
                                    })}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    className="w-full pl-6 pr-3 py-2 bg-teal-800 border border-teal-700 rounded text-teal-100
                    focus:outline-none focus:ring-2 focus:ring-teal-500
                    placeholder-teal-500 transition-all duration-300"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="productDescription"
                            className="block text-sm font-medium text-teal-300"
                        >
                            Description
                        </label>
                        <textarea
                            id="productDescription"
                            value={formData.description || ''}
                            onChange={(e) => updateFormData({ description: e.target.value })}
                            placeholder="Enter product description"
                            rows={4}
                            className="w-full px-3 py-2 bg-teal-800 border border-teal-700 rounded text-teal-100
                focus:outline-none focus:ring-2 focus:ring-teal-500
                placeholder-teal-500 transition-all duration-300 resize-none"
                        />
                        <div
                            className="w-full px-3 py-2 bg-teal-800 border border-teal-700 rounded text-teal-100
                  transition-all duration-300"
                            style={{ whiteSpace: 'pre-wrap', marginTop: '-1rem', pointerEvents: 'none', userSelect: 'none', opacity: 0.7 }}
                            dangerouslySetInnerHTML={{ __html: applyKeywordStyling(formData.description || '') }}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                            <input
                                id="productVisibility"
                                type="checkbox"
                                checked={formData.isVisible}
                                onChange={(e) => updateFormData({ isVisible: e.target.checked })}
                                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-teal-300 rounded"
                            />
                            <label
                                htmlFor="productVisibility"
                                className="text-sm text-teal-300"
                            >
                                Make this product visible to customers
                            </label>
                        </div>
                    </div>

                    {categoryAttributes.length > 0 && (
                        <div className="mt-6 space-y-6 border-t border-teal-700/50 pt-6">
                            <h3 className="text-lg font-semibold text-teal-100">
                                {selectedCategory?.name} Specific Attributes
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {categoryAttributes.map((attr) => {
                                    const renderAttributeInput = (attr: any) => {
                                        const currentValue = formData.attributes?.[attr.name] || '';

                                        const commonInputProps = {
                                            id: attr.name,
                                            name: attr.name,
                                            className: "w-full px-3 py-2 bg-teal-800 border border-teal-700 rounded text-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-500",
                                            value: currentValue,
                                            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
                                                updateFormData({
                                                    attributes: {
                                                        ...formData.attributes,
                                                        [attr.name]: e.target.value
                                                    }
                                                });
                                            },
                                            required: attr.required
                                        };

                                        switch (attr.type) {
                                            case 'text':
                                                return (
                                                    <input
                                                        type="text"
                                                        {...commonInputProps}
                                                        placeholder={`Enter ${attr.label}`}
                                                    />
                                                );

                                            case 'number':
                                                return (
                                                    <input
                                                        type="number"
                                                        {...commonInputProps}
                                                        placeholder={`Enter ${attr.label}`}
                                                        min={attr.min}
                                                        max={attr.max}
                                                    />
                                                );

                                            case 'select':
                                                return (
                                                    <select {...commonInputProps}>
                                                        <option value="">Select {attr.label}</option>
                                                        {attr.options?.map((option: string) => (
                                                            <option key={option} value={option}>
                                                                {option}
                                                            </option>
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
                                                                onChange={() => updateFormData({
                                                                    attributes: {
                                                                        ...formData.attributes,
                                                                        [attr.name]: '1'
                                                                    }
                                                                })}
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
                                                                onChange={() => updateFormData({
                                                                    attributes: {
                                                                        ...formData.attributes,
                                                                        [attr.name]: '0'
                                                                    }
                                                                })}
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
                                                        {...commonInputProps}
                                                        placeholder={`Enter ${attr.label}`}
                                                    />
                                                );
                                        }
                                    };

                                    return (
                                        <div key={attr.name} className="space-y-2">
                                            <label className="block text-sm font-semibold text-teal-300">
                                                {attr.label} {attr.required && <span className="text-red-600">*</span>}
                                            </label>
                                            {renderAttributeInput(attr)}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    {user && !authLoading && (
                        <div className="mt-6 space-y-4 border-t border-teal-700/50 pt-6">
                            <h3 className="text-lg font-semibold text-teal-100">
                                Select Product Images
                            </h3>
                            {photobankImages.length > 0 && (
                                <div className="grid grid-cols-4 gap-4 mt-4">
                                    {photobankImages.map((image) => (
                                        <div
                                            key={image.id}
                                            className={`relative rounded-lg overflow-hidden shadow-md ${selectedImages.includes(image.downloadURL) ? 'ring-2 ring-teal-500' : ''}`}
                                        >
                                            <img
                                                src={image.downloadURL}
                                                alt={`Product Image`}
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

    useEffect(() => {
        if (formData.category) {
            getPhotobankImages(formData.category)
                .then(images => {
                    console.log('Fetched images:', images);
                    setPhotobankImages(images);
                })
                .catch(error => console.error("Error fetching photobank images:", error));
        } else {
            setPhotobankImages([]);
        }
    }, [formData.category]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="relative w-full max-w-2xl max-h-[90vh] bg-teal-950 rounded-2xl shadow-2xl overflow-hidden"
            >
                <div className="sticky top-0 z-10 bg-teal-900/80 backdrop-blur-sm border-b border-teal-700/50 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-teal-100">
                        {initialProduct ? 'Edit Product' : 'Create New Product'}
                    </h2>
                    <button
                        onClick={() => { onClose?.() }}
                        className="text-teal-300 hover:text-teal-100 transition-colors"
                    >
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
                        <Button
                            variant="secondary"
                            onClick={handlePreviousStep}
                            className="flex items-center space-x-2"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span>Previous</span>
                        </Button>
                    )}

                    {currentStep !== 'details' ? (
                        <Button
                            variant="default"
                            onClick={handleNextStep}
                            className="ml-auto flex items-center space-x-2"
                        >
                            <span>Next</span>
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                    ) : (
                        <Button
                            variant="default"
                            onClick={handleSubmit}
                            className="ml-auto"
                        >
                            Submit Product
                        </Button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
