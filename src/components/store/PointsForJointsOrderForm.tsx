import React, { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { Product } from '../../types/product';

interface PointsForJointsOrderFormProps {
  onOrderSubmit: (orderData: any) => void;
  userEmail: string | undefined | null;
    userPoints: number | undefined;
}

const PointsForJointsOrderForm: React.FC<PointsForJointsOrderFormProps> = ({ onOrderSubmit, userEmail, userPoints }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [shippingAddress, setShippingAddress] = useState('');
    const { addToCart } = useCart();

    const generatePointsForJointsProduct = (): Product => {
        return {
            id: 'points-for-joints',
            category: 'Special',
            name: 'Points for Joints',
            description: 'Redeem points for a free joint',
            price: 0, // Set a fixed price,
            images: ['/logos/DALL·E 2024-12-31 21.50.35 - A series of minimalistic logo designs featuring a large triangle with variations of a smaller superscript \'10\' positioned in the upper right corner. V (1)-fotor-bg-remover-20241231215642 (1).png'],
            isVisible: true,
            isFeatured: false,
            isActive: true,
        };
    }

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!userEmail) {
            alert("Email is required to create a Points for Joints order.");
            return;
        }
        if (userPoints === undefined || userPoints < 5) {
            alert("Not enough points to redeem for a joint.");
            return;
        }

        const pointsProduct = generatePointsForJointsProduct();
        addToCart(pointsProduct);

        const orderData = {
            name,
            phone,
            shippingAddress,
            email: userEmail,
            type: 'pointsForJoints', // Add a type to distinguish this order
            cart: [
                {
                    product: pointsProduct,
                    quantity: 1
                }
            ]
        };
        onOrderSubmit(orderData);
        setName('');
        setPhone('');
        setShippingAddress('');
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="p-4 bg-gray-800 rounded-lg shadow-md">
                <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300">Name</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300">Phone</label>
                    <input
                        type="tel"
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="shippingAddress" className="block text-sm font-medium text-gray-300">Shipping Address</label>
                    <input
                        type="text"
                        id="shippingAddress"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
                        required
                    />
                </div>
                <div style={{display: userPoints !== undefined && userPoints >= 5 ? 'block' : 'none'}}>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Submit Order
                    </button>
                </div>
                <div style={{display: userPoints === undefined || userPoints < 5 ? 'block' : 'none'}}>
                    <p className="text-red-400 text-sm flex items-center gap-1">
                        Not enough points to redeem for a joint.
                    </p>
                </div>


            </form>
        </div>
    );
};

export default PointsForJointsOrderForm;
