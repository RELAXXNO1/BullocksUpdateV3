import React from 'react';
import { X } from 'lucide-react';

interface CartItemProps {
    item: {
        product: {
            id?: string;
            name: string;
            price: number;
            images?: string[];
        };
        quantity: number;
    };
    onRemove: (productId: string | undefined) => void;
    onQuantityChange: (productId: string | undefined, quantity: number) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onRemove, onQuantityChange }) => {
    const handleIncrement = () => {
        if (item.product.id) {
            onQuantityChange(item.product.id, item.quantity + 1);
        }
    };

    const handleDecrement = () => {
        if (item.product.id && item.quantity > 1) {
            onQuantityChange(item.product.id, item.quantity - 1);
        }
    };

    const handleRemove = () => {
        if (item.product.id) {
            onRemove(item.product.id);
        }
    };

    return (
        <li className="flex items-center justify-between bg-dark-700 p-4 rounded-md border border-gray-700">
            <div className="flex items-center space-x-4">
                <img src={item.product.images?.[0] || '/placeholder-product.png'} alt={item.product.name} className="h-14 w-14 object-cover rounded-md" />
                <div>
                    <h3 className="text-white font-medium">{item.product.name}</h3>
                    <p className="text-gray-400 text-sm">${item.product.price?.toFixed(2)}</p>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-600 rounded-md">
                    <button
                        onClick={handleDecrement}
                        className="px-2 py-1 text-gray-400 hover:text-gray-300 focus:outline-none rounded-l-md"
                        aria-label="Decrement quantity"
                    >
                        -
                    </button>
                    <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                            if (item.product.id) {
                                onQuantityChange(item.product.id, parseInt(e.target.value))
                            }
                        }}
                        className="w-16 bg-dark-600 text-white rounded-md p-1 text-center"
                        aria-label="Quantity"
                    />
                    <button
                        onClick={handleIncrement}
                        className="px-2 py-1 text-gray-400 hover:text-gray-300 focus:outline-none rounded-r-md"
                        aria-label="Increment quantity"
                    >
                        +
                    </button>
                </div>
                <button
                    onClick={handleRemove}
                    className="text-red-500 hover:text-red-400 focus:outline-none p-1 rounded-md"
                    aria-label="Remove item"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>
        </li>
    );
};

export default CartItem;
