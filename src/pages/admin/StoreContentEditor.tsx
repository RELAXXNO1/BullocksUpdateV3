import React, { useState } from 'react';
import { useStoreContent } from '../../contexts/StoreContentContext';
import { motion } from 'framer-motion';
import { Edit, Eye, EyeOff, Save } from 'lucide-react';

export default function StoreContentEditor() {
  const { storeContents, updateStoreContent, createStoreContent } = useStoreContent();
  const [editingContent, setEditingContent] = useState<{ [key: string]: boolean }>({});

  const handleToggleVisibility = (section: string) => {
    const content = storeContents.find(c => c.section === section);
    if (content) {
      updateStoreContent(section, { isVisible: !content.isVisible });
    }
  };

  const handleUpdateContent = (section: string, field: 'title' | 'description', value: string) => {
    updateStoreContent(section, { [field]: value });
  };

  const toggleEditMode = (section: string) => {
    setEditingContent(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 rounded-xl">
      <h1 className="text-3xl font-bold mb-8 text-white">Store Content Editor</h1>
      
      {storeContents.map(content => (
        <motion.div 
          key={content.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-lg p-6 mb-6 shadow-lg"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white capitalize">
              {content.section} Section
            </h2>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => handleToggleVisibility(content.section)}
                className="text-gray-400 hover:text-white transition-colors"
                title={content.isVisible ? 'Hide Section' : 'Show Section'}
              >
                {content.isVisible ? <Eye /> : <EyeOff />}
              </button>
              <button 
                onClick={() => toggleEditMode(content.section)}
                className="text-gray-400 hover:text-white transition-colors"
                title="Edit Section"
              >
                <Edit />
              </button>
            </div>
          </div>

          {editingContent[content.section] ? (
            <div className="space-y-4">
              <input 
                type="text"
                value={content.title}
                onChange={(e) => handleUpdateContent(content.section, 'title', e.target.value)}
                className="w-full bg-gray-700 text-white p-2 rounded"
                placeholder="Section Title"
              />
              <textarea 
                value={content.description}
                onChange={(e) => handleUpdateContent(content.section, 'description', e.target.value)}
                className="w-full bg-gray-700 text-white p-2 rounded h-24"
                placeholder="Section Description"
              />
              <button 
                onClick={() => toggleEditMode(content.section)}
                className="bg-green-600 text-white px-4 py-2 rounded flex items-center hover:bg-green-700 transition-colors"
              >
                <Save className="mr-2" /> Save Changes
              </button>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">{content.title}</h3>
              <p className="text-gray-400">{content.description}</p>
              <p className="text-xs text-gray-500 mt-2">
                Last Updated: {new Date(content.lastUpdated).toLocaleString()}
              </p>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
