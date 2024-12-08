import React, { createContext, useState, useContext, useEffect } from 'react';
import { StoreContent, StoreContentUpdateDTO } from '../models/StoreContent';
import { v4 as uuidv4 } from 'uuid';

interface StoreContentContextType {
  storeContents: StoreContent[];
  getContentBySection: (section: string) => StoreContent | undefined;
  updateStoreContent: (section: string, updates: StoreContentUpdateDTO) => void;
  createStoreContent: (content: Omit<StoreContent, 'id' | 'lastUpdated'>) => void;
}

const StoreContentContext = createContext<StoreContentContextType | undefined>(undefined);

export const StoreContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storeContents, setStoreContents] = useState<StoreContent[]>(() => {
    // Initialize with default content if no saved content exists
    const savedContent = localStorage.getItem('storeContents');
    return savedContent ? JSON.parse(savedContent) : [
      {
        id: uuidv4(),
        section: 'hero',
        title: 'Welcome to Bullocks Smoke Shop',
        description: 'Your premier destination for quality smoking accessories and vaporizers.',
        isVisible: true,
        lastUpdated: new Date()
      },
      {
        id: uuidv4(),
        section: 'products',
        title: 'Featured Products',
        description: 'Browse our selection of premium smoking accessories',
        isVisible: true,
        lastUpdated: new Date()
      }
    ];
  });

  // Save to localStorage whenever contents change
  useEffect(() => {
    localStorage.setItem('storeContents', JSON.stringify(storeContents));
  }, [storeContents]);

  const getContentBySection = (section: string) => {
    return storeContents.find(content => content.section === section);
  };

  const updateStoreContent = (section: string, updates: StoreContentUpdateDTO) => {
    setStoreContents(current => 
      current.map(content => 
        content.section === section 
          ? { 
              ...content, 
              ...updates, 
              lastUpdated: new Date() 
            } 
          : content
      )
    );
  };

  const createStoreContent = (content: Omit<StoreContent, 'id' | 'lastUpdated'>) => {
    const newContent: StoreContent = {
      ...content,
      id: uuidv4(),
      lastUpdated: new Date()
    };
    setStoreContents(current => [...current, newContent]);
  };

  return (
    <StoreContentContext.Provider 
      value={{ 
        storeContents, 
        getContentBySection, 
        updateStoreContent, 
        createStoreContent 
      }}
    >
      {children}
    </StoreContentContext.Provider>
  );
};

export const useStoreContent = () => {
  const context = useContext(StoreContentContext);
  if (context === undefined) {
    throw new Error('useStoreContent must be used within a StoreContentProvider');
  }
  return context;
};
