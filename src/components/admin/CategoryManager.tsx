import { useState } from 'react';
import { useCategories } from '../../hooks/useCategories';
import { CategoryConfig, CategoryAttribute, AttributeType } from '../../constants/categories';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { Plus, Trash2, Edit } from 'lucide-react';

export function CategoryManager() {
  const { 
    categories, 
    createCategory, 
    updateCategory, 
    deleteCategory, 
    addCategoryAttribute 
  } = useCategories();

  const [newCategory, setNewCategory] = useState<Partial<CategoryConfig>>({
    name: '',
    slug: '',
    description: ''
  });

  const [newAttribute, setNewAttribute] = useState<Partial<CategoryAttribute>>({
    name: '',
    label: '',
    type: 'text',
    displayOnCard: false
  });

  const [selectedCategory, setSelectedCategory] = useState<CategoryConfig | null>(null);

  const handleCreateCategory = async () => {
    try {
      if (!newCategory.name || !newCategory.slug) {
        alert('Name and slug are required');
        return;
      }

      await createCategory({
        name: newCategory.name,
        slug: newCategory.slug,
        description: newCategory.description || ''
      });
      
      // Reset form
      setNewCategory({ name: '', slug: '', description: '' });
    } catch (error) {
      console.error('Error creating category:', error);
      alert(error instanceof Error ? error.message : 'Failed to create category');
    }
  };

  const handleAddAttribute = async () => {
    try {
      if (!selectedCategory?.id || !newAttribute.name || !newAttribute.label) {
        alert('Category, attribute name, and label are required');
        return;
      }

      const attributeToAdd: CategoryAttribute = {
        name: newAttribute.name || '',
        label: newAttribute.label || '',
        type: (newAttribute.type || 'text') as AttributeType,
        displayOnCard: newAttribute.displayOnCard || false
      };

      await addCategoryAttribute(selectedCategory.id, attributeToAdd);
      
      // Reset form
      setNewAttribute({ 
        name: '', 
        label: '', 
        type: 'text', 
        displayOnCard: false 
      });
    } catch (error) {
      console.error('Error adding attribute:', error);
      alert(error instanceof Error ? error.message : 'Failed to add attribute');
    }
  };

  const handleUpdateCategory = async () => {
    try {
      if (!selectedCategory?.id) {
        alert('Category is required');
        return;
      }

      await updateCategory(selectedCategory.id, {
        name: newCategory.name || selectedCategory.name,
        slug: newCategory.slug || selectedCategory.slug,
        description: newCategory.description || selectedCategory.description
      });
      
      // Reset form
      setNewCategory({ name: '', slug: '', description: '' });
    } catch (error) {
      console.error('Error updating category:', error);
      alert(error instanceof Error ? error.message : 'Failed to update category');
    }
  };

  const attributeTypeOptions: AttributeType[] = ['text', 'number', 'select', 'boolean'];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Category Management</h1>

      {/* Create New Category Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Create New Category</h2>
        <div className="grid grid-cols-3 gap-4">
          <Input 
            placeholder="Category Name" 
            value={newCategory.name || ''}
            onChange={(e) => {
              const name = e.target.value;
              setNewCategory(prev => ({
                ...prev, 
                name, 
                slug: name.toLowerCase().replace(/\s+/g, '-')
              }));
            }}
          />
          <Input 
            placeholder="Category Slug" 
            value={newCategory.slug || ''}
            onChange={(e) => setNewCategory(prev => ({
              ...prev, 
              slug: e.target.value
            }))}
          />
          <Input 
            placeholder="Description" 
            value={newCategory.description || ''}
            onChange={(e) => setNewCategory(prev => ({
              ...prev, 
              description: e.target.value
            }))}
          />
          <Button onClick={handleCreateCategory}>
            <Plus className="mr-2" /> Create Category
          </Button>
        </div>
      </div>

      {/* Existing Categories Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Existing Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div 
              key={category.slug} 
              className="border rounded p-4 hover:shadow-md transition"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">{category.name}</h3>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setSelectedCategory(category)}
                    className="text-blue-500 hover:bg-blue-100 p-1 rounded"
                  >
                    <Edit size={16} />
                  </button>
                  {category.id && (
                    <button 
                      onClick={() => category.id && deleteCategory(category.id)}
                      className="text-red-500 hover:bg-red-100 p-1 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-gray-600 mb-2">{category.description}</p>
              
              {/* Attributes Section */}
              {selectedCategory?.id === category.id && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="font-semibold mb-2">Update Category</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Input 
                      placeholder="Category Name" 
                      value={newCategory.name || category.name}
                      onChange={(e) => setNewCategory(prev => ({
                        ...prev, 
                        name: e.target.value
                      }))}
                    />
                    <Input 
                      placeholder="Category Slug" 
                      value={newCategory.slug || category.slug}
                      onChange={(e) => setNewCategory(prev => ({
                        ...prev, 
                        slug: e.target.value
                      }))}
                    />
                    <Input 
                      placeholder="Description" 
                      value={newCategory.description || category.description}
                      onChange={(e) => setNewCategory(prev => ({
                        ...prev, 
                        description: e.target.value
                      }))}
                    />
                    <Button 
                      onClick={handleUpdateCategory}
                      className="col-span-2"
                    >
                      Update Category
                    </Button>
                  </div>

                  <h4 className="font-semibold mb-2 mt-4">Add Attribute</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Input 
                      placeholder="Attribute Name" 
                      value={newAttribute.name || ''}
                      onChange={(e) => setNewAttribute(prev => ({
                        ...prev, 
                        name: e.target.value
                      }))}
                    />
                    <Input 
                      placeholder="Label" 
                      value={newAttribute.label || ''}
                      onChange={(e) => setNewAttribute(prev => ({
                        ...prev, 
                        label: e.target.value
                      }))}
                    />
                    <Select
                      value={newAttribute.type || 'text'}
                      onChange={(e) => setNewAttribute(prev => ({
                        ...prev, 
                        type: e.target.value as AttributeType
                      }))}
                    >
                      {attributeTypeOptions.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </Select>
                    <Checkbox
                      label="Display on Card"
                      checked={newAttribute.displayOnCard || false}
                      onChange={(checked) => setNewAttribute(prev => ({
                        ...prev, 
                        displayOnCard: checked
                      }))}
                    />
                    <Button 
                      onClick={handleAddAttribute}
                      className="col-span-2"
                    >
                      <Plus className="mr-2" /> Add Attribute
                    </Button>
                  </div>

                  {/* Existing Attributes */}
                  {category.attributes?.fields && (
                    <div className="mt-4">
                      <h5 className="font-semibold mb-2">Current Attributes</h5>
                      <ul className="space-y-1 text-sm">
                        {category.attributes.fields.map((attr, index) => (
                          <li 
                            key={index} 
                            className="flex justify-between items-center"
                          >
                            <span>{attr.label} ({attr.type})</span>
                            {attr.displayOnCard && (
                              <span className="text-green-500">Card Display</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}