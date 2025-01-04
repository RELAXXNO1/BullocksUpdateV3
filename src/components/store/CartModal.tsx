import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useCart } from '../../contexts/CartContext';
import CartItem from './CartItem';

interface CartModalProps {
  onClose: () => void;
  cartIconRef: HTMLButtonElement | null;
}

const CartModal: React.FC<CartModalProps> = ({ onClose, cartIconRef }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { cart, removeFromCart, updateQuantity } = useCart();

  // Function to handle closing the modal when clicking outside
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose();
    }
  }, [onClose]);

  // Function to handle closing the modal with the Escape key
  const handleEscapePress = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
      // Add event listeners when the modal is open
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapePress);

      // Focus the modal content for accessibility
      if (modalRef.current) {
        modalRef.current.focus();
      }

    return () => {
      // Cleanup event listeners when the component unmounts
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapePress);
    };
  }, [handleClickOutside, handleEscapePress]);

  useEffect(() => {
    if (!cartIconRef || !modalRef.current) {
      return;
    }

    const cartIconRect = cartIconRef.getBoundingClientRect();
    const modalRect = modalRef.current.getBoundingClientRect();

    // Calculate the ideal position to align with the cart icon
    let modalTop = cartIconRect.bottom + 10; // Add some spacing
    let modalLeft = cartIconRect.left - (modalRect.width / 2) + (cartIconRect.width / 2);

    // Ensure the modal doesn't go off-screen horizontally
    const viewportWidth = window.innerWidth;
    if (modalLeft < 10) {
      modalLeft = 10;
    } else if (modalLeft + modalRect.width + 10 > viewportWidth) {
      modalLeft = viewportWidth - modalRect.width - 10;
    }

    modalRef.current.style.top = `${modalTop}px`;
    modalRef.current.style.left = `${modalLeft}px`;
  }, [cartIconRef]);


  // Use createPortal to render the modal at the end of the document body
  return createPortal(
    <div className="fixed z-[60] inset-0 bg-black/50 flex items-start justify-center overflow-y-auto" aria-modal="true" role="dialog">
      <div
        ref={modalRef}
        className="bg-green-400/10 backdrop-blur-md border border-green-300/30 p-6 rounded-md shadow-xl absolute z-[61] focus:outline-none w-[90vw] max-w-md"
        tabIndex={-1} // Make the div focusable for accessibility
      >
        <div className="flex justify-between items-center mb-4 border-b border-green-300/30 pb-2">
          <h2 className="text-xl font-bold text-black dark:text-white drop-shadow-[0_0_2px_theme(colors.teal.500)]" id="cart-modal-title">
            Your Cart
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            aria-label="Close Cart"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <ul className="mb-4 space-y-2">
          {cart.map(item => (
            <CartItem 
              key={item.product.id}
              item={item}
              onRemove={removeFromCart}
              onQuantityChange={updateQuantity}
            />
          ))}
        </ul>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="hover:text-teal-300 transition-colors duration-200 relative group overflow-hidden bg-dark-600/50 rounded-md px-3 py-2 before:absolute before:inset-0 before:bg-teal-500/10 before:opacity-0 before:transition-opacity before:rounded-md hover:before:opacity-100 active:before:opacity-20 mr-2"
          >
            <span className="block text-gray-100 drop-shadow-[0_0_2px_teal-500]">Continue Shopping</span>
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-300 transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" aria-hidden="true" />
          </button>
          <button className="hover:text-teal-300 transition-colors duration-200 relative group overflow-hidden bg-dark-600/50 rounded-md px-3 py-2 before:absolute before:inset-0 before:bg-teal-500/10 before:opacity-0 before:transition-opacity before:rounded-md hover:before:opacity-100 active:before:opacity-20 text-white">
            <span className="block text-gray-100 drop-shadow-[0_0_2px_teal-500]">Checkout</span>
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-300 transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>,
    document.body // Render the modal at the end of the body
  );
};

export default CartModal;
