import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Label } from '../ui/Label';
import { DEFAULT_CATEGORIES } from '../../config/categories';
import { validateProductForm } from '../../utils/productValidation';
import type { Product, ProductFormData, ProductCategory } from '../../types/product';

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onClose: () => void;
}

export function ProductForm({ product, onSubmit, onClose }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    category: product?.category || '',
    imageUrl: product?.imageUrl || '',
    isVisible: product?.isVisible ?? true,
    attributes: {} // Always initialize attributes as an empty object
  });
  const [imageFile, setImageFile] = useState<File>();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    const validationResult = validateProductForm({ ...formData, imageFile });
    
    if (!validationResult.valid) {
      setErrors(validationResult.errors);
      setLoading(false);
      return;
    }

    try {
      await onSubmit({ ...formData, imageFile });
    } catch (error) {
      if (error instanceof Error) {
        setErrors([error.message]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg max-w-xl w-full">
        <div className="flex justify-between items-center p-4 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
          <h2 className="text-xl font-semibold">
            {product ? 'Edit Product' : 'Add Product'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {errors.length > 0 && (
            <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg mb-4">
              <ul>
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <Label className="mb-1">Name</Label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div>
            <Label className="mb-1">Description</Label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1">Price</Label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                min="0"
                step="0.01"
                className="w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div>
              <Label className="mb-1">Category</Label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  category: e.target.value as ProductCategory,
                  attributes: {} // Reset attributes when category changes
                })}
                className="w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              >
                <option value="">Select Category</option>
                {DEFAULT_CATEGORIES.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Category-specific attributes */}
          {formData.category && (
            <div className="space-y-4">
              <Label className="mb-1">Category Attributes</Label>
              <div className="grid grid-cols-2 gap-4">
                {DEFAULT_CATEGORIES
                  .find(cat => cat.slug === formData.category)
                  ?.attributes?.fields.map((field) => (
                    <div key={field.name} className="space-y-2">
                      <Label className="mb-1">{field.label}</Label>
                      {field.type === 'select' ? (
                        <select
                          value={formData.attributes?.[field.name] || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            attributes: {
                              ...formData.attributes,
                              [field.name]: e.target.value
                            }
                          })}
                          className="w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        >
                          <option value="">Select {field.label}</option>
                          {field.options?.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          className="w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                          value={formData.attributes?.[field.name] || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            attributes: {
                              ...formData.attributes,
                              [field.name]: field.type === 'number' 
                                ? parseFloat(e.target.value) 
                                : e.target.value
                            }
                          })}
                        />
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="flex items-center space-x-4 mt-4">
            <Label>Product Visibility</Label>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isVisible}
                onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                className="mr-2"
              />
              <span>{formData.isVisible ? 'Visible in Store' : 'Hidden from Store'}</span>
            </div>
          </div>

          <div>
            <Label>Product Image</Label>
            <input
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              className="w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:flex file:items-center file:gap-2"
            />
            {formData.imageUrl && (
              <div className="mt-2">
                <img
                  src={formData.imageUrl}
                  alt="Product preview"
                  className="w-32 h-32 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 sticky bottom-0 bg-slate-800 border-t border-slate-700 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="h-4 w-4" /> Save Product</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}