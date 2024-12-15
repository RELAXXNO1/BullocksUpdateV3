import React, { createContext, useState, useContext } from 'react';

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

  const setCartEnabled = (enabled: boolean) => {
    setIsCartEnabled(enabled);
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
