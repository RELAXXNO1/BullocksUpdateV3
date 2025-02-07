import React from 'react';
import { Product } from '../../types/product';
import { Button } from '../ui/Button';
import { useCart } from '../../contexts/CartContext';
import { useState } from 'react';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300); // Animation duration
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">{product.name}</h2>
        <p className="text-gray-700 mb-4">{product.description}</p>
        <p className="text-gray-700 font-bold mb-4">${String(product.price)}</p>
        <div className="flex justify-end">
          <Button onClick={onClose} className="mr-4">
            Close
          </Button>
          <Button
            onClick={() => handleAddToCart(product)}
            className={isAnimating ? 'button-animate' : ''}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
