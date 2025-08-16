import React, { useState, useEffect } from 'react';
import { useCategories } from '../../hooks/useCategories';
import { CategoryConfig, CategoryAttribute, AttributeType } from '../../constants/categories';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { Plus, Trash2, Edit, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Label } from '../ui/Label';
import { motion, AnimatePresence } from 'framer-motion';

// Modal for editing category or attribute
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <motion.div
        className="relative w-full max-w-2xl max-h-[90vh] bg-gray-900 border border-gray-700 rounded-2xl shadow-xl flex flex-col"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <Button onClick={onClose} variant="ghost" size="icon"><XCircle size={24} /></Button>
        </div>
        <div className="p-6 overflow-y-auto flex-grow">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export function CategoryManager() {
  const {
    categories,
    createCategory,
    updateCategory,
    deleteCategory,
    addCategoryAttribute,
    updateCategoryAttribute,
    deleteCategoryAttribute,
    loading,
    error
  } = useCategories();

  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [isEditAttributeModalOpen, setIsEditAttributeModalOpen] = useState(false);

  const [currentCategory, setCurrentCategory] = useState<CategoryConfig | null>(null);
  const [currentAttribute, setCurrentAttribute] = useState<CategoryAttribute | null>(null);
  const [currentAttributeIndex, setCurrentAttributeIndex] = useState<number | null>(null);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySlug, setNewCategorySlug] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');

  const [attributeForm, setAttributeForm] = useState<Partial<CategoryAttribute>>({
    name: '',
    label: '',
    type: 'text',
    displayOnCard: false,
    options: []
  });
  const [attributeOptionsInput, setAttributeOptionsInput] = useState('');

  useEffect(() => {
    if (currentCategory) {
      setNewCategoryName(currentCategory.name);
      setNewCategorySlug(currentCategory.slug);
      setNewCategoryDescription(currentCategory.description || '');
    }
  }, [currentCategory]);

  useEffect(() => {
    if (currentAttribute) {
      setAttributeForm(currentAttribute);
      setAttributeOptionsInput(currentAttribute.options?.join(', ') || '');
    } else {
      setAttributeForm({ name: '', label: '', type: 'text', displayOnCard: false, options: [] });
      setAttributeOptionsInput('');
    }
  }, [currentAttribute]);

  const handleCreateCategory = async () => {
    try {
      if (!newCategoryName || !newCategorySlug) {
        alert('Name and slug are required');
        return;
      }
      await createCategory({
        name: newCategoryName,
        slug: newCategorySlug,
        description: newCategoryDescription
      });
      setIsCreateCategoryModalOpen(false);
      setNewCategoryName('');
      setNewCategorySlug('');
      setNewCategoryDescription('');
    } catch (err: any) {
      alert(`Error creating category: ${err.message}`);
    }
  };

  const handleUpdateCategory = async () => {
    if (!currentCategory?.id) return;
    try {
      await updateCategory(currentCategory.id, {
        name: newCategoryName,
        slug: newCategorySlug,
        description: newCategoryDescription
      });
      setIsEditCategoryModalOpen(false);
      setCurrentCategory(null);
    } catch (err: any) {
      alert(`Error updating category: ${err.message}`);
    }
  };

  const handleAddAttribute = async () => {
    if (!currentCategory?.id) return;
    try {
      const attributeToAdd: CategoryAttribute = {
        name: attributeForm.name || '',
        label: attributeForm.label || '',
        type: attributeForm.type || 'text',
        displayOnCard: attributeForm.displayOnCard || false,
        options: attributeForm.type === 'select' ? attributeOptionsInput.split(',').map(s => s.trim()).filter(s => s) : undefined
      };
      await addCategoryAttribute(currentCategory.id, attributeToAdd);
      setIsEditCategoryModalOpen(false); // Close modal after adding attribute
      setCurrentCategory(null); // Reset selected category to refresh view
    } catch (err: any) {
      alert(`Error adding attribute: ${err.message}`);
    }
  };

  const handleUpdateAttribute = async () => {
    if (!currentCategory?.id || currentAttributeIndex === null || !currentAttribute) return;
    try {
      const updatedAttribute: CategoryAttribute = {
        name: attributeForm.name || '',
        label: attributeForm.label || '',
        type: attributeForm.type || 'text',
        displayOnCard: attributeForm.displayOnCard || false,
        options: attributeForm.type === 'select' ? attributeOptionsInput.split(',').map(s => s.trim()).filter(s => s) : undefined
      };
      await updateCategoryAttribute(currentCategory.id, currentAttributeIndex, updatedAttribute);
      setIsEditAttributeModalOpen(false);
      setCurrentAttribute(null);
      setCurrentAttributeIndex(null);
      setIsEditCategoryModalOpen(false); // Close category modal to refresh
      setCurrentCategory(null); // Reset selected category to refresh view
    } catch (err: any) {
      alert(`Error updating attribute: ${err.message}`);
    }
  };

  const handleDeleteAttribute = async (index: number) => {
    if (!currentCategory?.id) return;
    if (window.confirm('Are you sure you want to delete this attribute?')) {
      try {
        await deleteCategoryAttribute(currentCategory.id, index);
        setIsEditCategoryModalOpen(false); // Close category modal to refresh
        setCurrentCategory(null); // Reset selected category to refresh view
      } catch (err: any) {
        alert(`Error deleting attribute: ${err.message}`);
      }
    }
  };

  const attributeTypeOptions: AttributeType[] = ['text', 'number', 'select', 'boolean'];

  if (loading) return <div className="text-center py-10 text-white">Loading categories...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error: {error.message}</div>;

  return (
    <div className="container mx-auto p-3 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Category Management</h1>
        <Button
          onClick={() => setIsCreateCategoryModalOpen(true)}
          variant="default"
          className="font-semibold tracking-wide shadow-sm hover:shadow-md transition-all duration-200 ease-in-out text-sm sm:text-lg border border-teal-500"
        >
          <Plus className="mr-2" /> Add New Category
        </Button>
      </div>

      {/* Create Category Modal */}
      <Modal
        isOpen={isCreateCategoryModalOpen}
        onClose={() => setIsCreateCategoryModalOpen(false)}
        title="Create New Category"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="new-category-name">Category Name</Label>
            <Input
              id="new-category-name"
              placeholder="e.g., THC-A Flower"
              value={newCategoryName}
              onChange={(e) => {
                const name = e.target.value;
                setNewCategoryName(name);
                setNewCategorySlug(name.toLowerCase().replace(/\s+/g, '-'));
              }}
            />
          </div>
          <div>
            <Label htmlFor="new-category-slug">Category Slug</Label>
            <Input
              id="new-category-slug"
              placeholder="e.g., thca-flower"
              value={newCategorySlug}
              onChange={(e) => setNewCategorySlug(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="new-category-description">Description</Label>
            <Input
              id="new-category-description"
              placeholder="e.g., Premium THC-A flower strains"
              value={newCategoryDescription}
              onChange={(e) => setNewCategoryDescription(e.target.value)}
            />
          </div>
          <Button onClick={handleCreateCategory} className="w-full">
            Create Category
          </Button>
        </div>
      </Modal>

      {/* Existing Categories Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Card key={category.id || category.slug} className="bg-gray-800/50 border-gray-700 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">{category.name}</CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setCurrentCategory(category);
                    setIsEditCategoryModalOpen(true);
                  }}
                >
                  <Edit size={16} className="text-blue-400" />
                </Button>
                {category.id && ( // Only allow deleting custom categories, not default ones
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete the category "${category.name}"?`)) {
                        deleteCategory(category.id!);
                      }
                    }}
                  >
                    <Trash2 size={16} className="text-red-400" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400 mb-2">{category.description}</p>
              <p className="text-xs text-gray-500">Slug: {category.slug}</p>
              {category.attributes?.fields && category.attributes.fields.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-gray-300">Attributes:</h4>
                  <ul className="list-disc list-inside text-xs text-gray-400">
                    {category.attributes.fields.map((attr, index) => (
                      <li key={index} className="flex justify-between items-center">
                        <span>{attr.label} ({attr.type}) {attr.displayOnCard && <span className="text-teal-400">(Card)</span>}</span>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              setCurrentCategory(category);
                              setCurrentAttribute(attr);
                              setCurrentAttributeIndex(index);
                              setIsEditAttributeModalOpen(true);
                            }}
                          >
                            <Edit size={14} className="text-blue-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleDeleteAttribute(index)}
                          >
                            <Trash2 size={14} className="text-red-400" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Category Modal */}
      <Modal
        isOpen={isEditCategoryModalOpen}
        onClose={() => {
          setIsEditCategoryModalOpen(false);
          setCurrentCategory(null);
        }}
        title={`Edit Category: ${currentCategory?.name || ''}`}
      >
        {currentCategory && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-category-name">Category Name</Label>
              <Input
                id="edit-category-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-category-slug">Category Slug</Label>
              <Input
                id="edit-category-slug"
                value={newCategorySlug}
                onChange={(e) => setNewCategorySlug(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-category-description">Description</Label>
              <Input
                id="edit-category-description"
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
              />
            </div>
            <Button onClick={handleUpdateCategory} className="w-full">
              Save Category Changes
            </Button>

            <h3 className="text-xl font-bold mt-6 mb-4 text-white">Add New Attribute</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-attr-name">Attribute Name</Label>
                <Input
                  id="new-attr-name"
                  placeholder="e.g., strain"
                  value={attributeForm.name || ''}
                  onChange={(e) => setAttributeForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="new-attr-label">Label</Label>
                <Input
                  id="new-attr-label"
                  placeholder="e.g., Strain Type"
                  value={attributeForm.label || ''}
                  onChange={(e) => setAttributeForm(prev => ({ ...prev, label: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="new-attr-type">Type</Label>
                <Select
                  id="new-attr-type"
                  value={attributeForm.type || 'text'}
                  onChange={(e) => setAttributeForm(prev => ({ ...prev, type: e.target.value as AttributeType }))}
                >
                  {attributeTypeOptions.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Select>
              </div>
              {attributeForm.type === 'select' && (
                <div>
                  <Label htmlFor="new-attr-options">Options (comma-separated)</Label>
                  <Input
                    id="new-attr-options"
                    placeholder="e.g., Indica, Sativa, Hybrid"
                    value={attributeOptionsInput}
                    onChange={(e) => setAttributeOptionsInput(e.target.value)}
                  />
                </div>
              )}
              <Checkbox
                label="Display on Product Card"
                checked={attributeForm.displayOnCard || false}
                onChange={(checked) => setAttributeForm(prev => ({ ...prev, displayOnCard: checked }))}
              />
              <Button onClick={handleAddAttribute} className="w-full">
                <Plus className="mr-2" /> Add Attribute
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Attribute Modal */}
      <Modal
        isOpen={isEditAttributeModalOpen}
        onClose={() => {
          setIsEditAttributeModalOpen(false);
          setCurrentAttribute(null);
          setCurrentAttributeIndex(null);
        }}
        title={`Edit Attribute: ${currentAttribute?.label || ''}`}
      >
        {currentAttribute && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-attr-name">Attribute Name</Label>
              <Input
                id="edit-attr-name"
                value={attributeForm.name || ''}
                onChange={(e) => setAttributeForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-attr-label">Label</Label>
              <Input
                id="edit-attr-label"
                value={attributeForm.label || ''}
                onChange={(e) => setAttributeForm(prev => ({ ...prev, label: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-attr-type">Type</Label>
              <Select
                id="edit-attr-type"
                value={attributeForm.type || 'text'}
                onChange={(e) => setAttributeForm(prev => ({ ...prev, type: e.target.value as AttributeType }))}
              >
                {attributeTypeOptions.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>
            </div>
            {attributeForm.type === 'select' && (
              <div>
                <Label htmlFor="edit-attr-options">Options (comma-separated)</Label>
                <Input
                  id="edit-attr-options"
                  value={attributeOptionsInput}
                  onChange={(e) => setAttributeOptionsInput(e.target.value)}
                />
              </div>
            )}
            <Checkbox
              label="Display on Product Card"
              checked={attributeForm.displayOnCard || false}
              onChange={(checked) => setAttributeForm(prev => ({ ...prev, displayOnCard: checked }))}
            />
            <Button onClick={handleUpdateAttribute} className="w-full">
              Save Attribute Changes
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
