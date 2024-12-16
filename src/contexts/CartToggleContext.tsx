import React, { createContext, useState, useContext, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';

interface CartToggleContextProps {
  isCartEnabled: boolean;
  setCartEnabled: (enabled: boolean) => void;
}

const CartToggleContext = createContext<CartToggleContextProps>({
  isCartEnabled: true,
  setCartEnabled: () => {},
});

export const CartToggleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCartEnabled, setIsCartEnabled] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCartSetting = async () => {
      if (user?.isAdmin) {
        const docRef = doc(db, 'settings', 'cartVisibility');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setIsCartEnabled(docSnap.data().enabled);
        }
      }
    };

    fetchCartSetting();
  }, [user?.isAdmin]);


  const setCartEnabled = async (enabled: boolean) => {
    setIsCartEnabled(enabled);
    if (user?.isAdmin) {
      const docRef = doc(db, 'settings', 'cartVisibility');
      await setDoc(docRef, { enabled });
    }
  };

  return (
    <CartToggleContext.Provider value={{ isCartEnabled, setCartEnabled }}>
      {children}
    </CartToggleContext.Provider>
  );
};

export const useCartToggle = () => {
  return useContext(CartToggleContext);
};
