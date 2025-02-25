import { useEffect, useState } from 'react';

interface DiscountPopupProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
}

export const DiscountPopup = ({ product }: DiscountPopupProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(prev => prev - 1);
      if (secondsLeft <= 0) {
        setIsOpen(false);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl border border-gray-200 overflow-hidden">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-green-600">Limited Time Offer!</h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>
        
        <div className="text-center mb-6">
          <img 
            src={product.image}
            alt={product.name}
            className="max-w-full h-auto mb-4 rounded-lg border border-gray-200 p-2"
          />
          <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
          <p className="text-gray-600 mb-4">Regular price: ${product.price.toFixed(2)}</p>
          <p className="text-red-600 font-bold text-lg">20% OFF - Limited Time Only!</p>
        </div>
        
        <div className="flex justify-center mb-4">
          <span className="text-2xl font-bold text-yellow-600">Hurry! Offer ends in {secondsLeft}s</span>
        </div>
        
        <div className="flex justify-center">
          <button 
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200"
            onClick={() => {
              // Handle click action (e.g., redirect to product page or checkout)
              setIsOpen(false);
            }}
          >
            Claim Offer Now
          </button>
        </div>
      </div>
    </div>
  );
};
