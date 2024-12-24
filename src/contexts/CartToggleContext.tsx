import React, { createContext, useState, useContext, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';

interface CartToggleContextProps {
  isCartEnabled: boolean;
  setCartEnabled: (enabled: boolean) => void;
}

const CartToggleContext = createContext<CartToggleContextProps>({
  isCartEnabled: false,
  setCartEnabled: () => {},
});

export const CartToggleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCartEnabled, setIsCartEnabled] = useState(false);
  const { user } = useAuth();
  console.log('CartToggleContext user:', user);

  useEffect(() => {
    const fetchCartSetting = async () => {
      if (user) {
        const docRef = doc(db, 'cartSettings', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setIsCartEnabled(docSnap.data().enabled);
          console.log('Cart setting fetched:', docSnap.data().enabled);
        } else {
          console.log('No cart setting found, defaulting to false');
        }
      } else {
        console.log('User not logged in, defaulting to false');
      }
    };

    fetchCartSetting();
  }, [user]);


  const setCartEnabled = async (enabled: boolean) => {
    setIsCartEnabled(enabled);
    if (user) {
      const docRef = doc(db, 'cartSettings', user.uid);
      await setDoc(docRef, { enabled });
      console.log('Cart setting saved:', enabled);
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
