import React, { useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface PointsOrderCardProps {
    order: any;
    fetchOrders?: () => Promise<void>;
}

const PointsOrderCard: React.FC<PointsOrderCardProps> = ({ order, fetchOrders }) => {
    const [shipping, setShipping] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleShipOrder = async (orderId: string) => {
        setShipping(true);
        try {
            const orderDocRef = doc(db, 'orders', orderId);
            const orderDoc = await getDoc(orderDocRef);

            if (orderDoc.exists()) {
                 // Update isShipped field in orders collection instead of deleting
                await updateDoc(orderDocRef, { isShipped: true });

                console.log('Points for Joints Order shipped');
                
                // Move order to previous orders
                await updateDoc(orderDocRef, { 
                    isShipped: true,
                    isPointsForJointsOrder: false 
                });

                // Refetch orders to update the list
                if (fetchOrders) {
                    fetchOrders();
                }

            } else {
                console.error('Order not found');
            }
        } catch (error) {
            console.error('Error shipping Points for Joints order:', error);
        } finally {
            setShipping(false);
            setIsModalOpen(false);
        }
    };


    return (
        <div className="bg-gradient-to-br from-purple-800 to-purple-700 rounded-xl shadow-xl p-6 border border-purple-600 hover:scale-105 transition-transform duration-200 relative">
             <div className="absolute top-2 right-2 px-2 py-1 bg-purple-900 text-white text-xs rounded-full">
                Points for Joints Order
            </div>
            <h3 className="text-lg font-semibold text-white mb-3">Order ID: <span className="text-purple-400">{order.id}</span></h3>
            <div className="text-gray-300 space-y-2">
                <p>Name: <span className="text-white">{order.name}</span></p>
                <p>Phone: <span className="text-white">{order.phone}</span></p>
                <p>Email: <span className="text-white">{order.email || 'N/A'}</span></p>
                <p>Points Redeemed: <span className="text-white">{order.pointsRedeemed}</span></p>
            </div>
             {/* Removed Total Line */}
            <div className="mt-5 flex items-center justify-between relative">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-lg shadow-md transition-colors duration-200"
                >
                    Actions
                </button>
            </div>
            {showDetails && (
                <div className="mt-6 p-5 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-md font-semibold text-white">Customer Details:</h4>
                    </div>
                    <div className="text-gray-300 space-y-2">
                        <p>Address: <span className="text-white">{order.address}</span></p>
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg p-6 w-96">
                        <h3 className="text-xl font-semibold text-white mb-4">Actions</h3>
                        <button
                            onClick={() => handleShipOrder(order.id)}
                            className="block w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={shipping}
                        >
                            Mark Shipped
                        </button>
                        <button
                            onClick={() => {
                                setShowDetails(!showDetails);
                                setIsModalOpen(false);
                            }}
                            className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
                        >
                            View Details
                        </button>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 mt-2"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


export default PointsOrderCard;
