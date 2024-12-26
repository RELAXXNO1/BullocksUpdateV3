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

import { db } from '../lib/firebase';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import defaultStoreContent from '../lib/defaultStoreContent';

export const StoreContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storeContents, setStoreContents] = useState<StoreContent[]>(defaultStoreContent);
  const storeContentCollection = collection(db, 'storeContent');

  useEffect(() => {
    const fetchStoreContent = async () => {
      try {
        const querySnapshot = await getDocs(storeContentCollection);
        const fetchedContent = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as StoreContent));
        setStoreContents(fetchedContent);
      } catch (error) {
        console.error('Error fetching store content:', error);
      }
    };

    const createDefaultStoreContent = async () => {
      try {
        const querySnapshot = await getDocs(storeContentCollection);
        if (querySnapshot.empty) {
          for (const content of defaultStoreContent) {
            const docRef = doc(storeContentCollection, content.id);
            await setDoc(docRef, content);
          }
          fetchStoreContent();
        } else {
          fetchStoreContent();
        }
      } catch (error) {
        console.error('Error creating default store content:', error);
      }
    };

    createDefaultStoreContent();
  }, []);

  const getContentBySection = (section: string) => {
    return storeContents.find(content => content.section === section);
  };

  const updateStoreContent = async (section: string, updates: StoreContentUpdateDTO) => {
    setStoreContents(current =>
      current.map(content =>
        content.section === section
          ? {
            ...content,
            ...updates,
            lastUpdated: Date.now()
          }
          : content
      )
    );
    try {
      const content = storeContents.find(c => c.section === section);
      if (content) {
        const contentRef = doc(storeContentCollection, content.id);
        await setDoc(contentRef, { ...content, ...updates, lastUpdated: Date.now() }, { merge: true });
      }
    } catch (error) {
      console.error('Error updating store content in Firestore:', error);
    }
  };

  const createStoreContent = async (content: Omit<StoreContent, 'id' | 'lastUpdated'>) => {
    const newContent: StoreContent = {
      ...content,
      id: uuidv4(),
      lastUpdated: Date.now()
    };
    setStoreContents(current => [...current, newContent]);
    try {
      const docRef = doc(storeContentCollection, newContent.id);
      await setDoc(docRef, newContent);
    } catch (error) {
      console.error('Error creating store content in Firestore:', error);
    }
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
