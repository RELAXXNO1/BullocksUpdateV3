import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import ScrollWrapper from '../../components/store/ScrollWrapper';

const Orders: React.FC = () => {
    const [activeOrders, setActiveOrders] = useState<any[]>([]);
    const [previousOrders, setPreviousOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeOrdersVisible, setActiveOrdersVisible] = useState(true);

    const fetchOrders = async () => { // Extracted fetchOrders function
        try {
            const ordersCollection = collection(db, 'orders');
            const ordersSnapshot = await getDocs(ordersCollection);
            const ordersList = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Separate active and previous orders
            setActiveOrders(ordersList.filter(order => !('isShipped' in order) || order.isShipped !== true));
            setPreviousOrders(ordersList.filter(order => ('isShipped' in order) && order.isShipped === true));

        } catch (error: any) {
            console.error('Error fetching orders:', error);
            alert('Error fetching orders: ' + error.message); // ADDED ERROR ALERT
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    if (loading) {
        return (
            <div className="p-6 bg-slate-900 rounded-lg shadow-md">
                <h2 className="text-3xl font-bold text-white mb-6">Orders Dashboard</h2>
                <p className="text-slate-400">Loading orders...</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-slate-900 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-white mb-6">Orders Dashboard</h2>

            <div className="mb-4 border-b border-slate-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveOrdersVisible(true)}
                        className={`${activeOrdersVisible ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-400'}
                            whitespace-nowrap border-b-2 py-4 px-1 font-medium text-sm focus:outline-none`}
                    >
                        Active Orders
                    </button>
                    <button
                        onClick={() => setActiveOrdersVisible(false)}
                        className={`${!activeOrdersVisible ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-400'}
                            whitespace-nowrap border-b-2 py-4 px-1 font-medium text-sm focus:outline-none`}
                    >
                        Previous Orders
                    </button>
                </nav>
            </div>

            <ScrollWrapper>
                {activeOrdersVisible ? (
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-4">Active Orders</h3>
                        {activeOrders.length === 0 ? (
                            <div className="text-slate-400 p-4 text-center">No new orders to process.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {activeOrders.map(order => (
                                    <OrderCard key={order.id} order={order} fetchOrders={fetchOrders} /> // Pass fetchOrders
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-4">Previous Orders</h3>
                        {previousOrders.length === 0 ? (
                            <div className="text-slate-400 p-4 text-center">No previous orders available.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {previousOrders.map(order => (
                                    <OrderCard key={order.id} order={order} /> // fetchOrders not needed here as previous orders are not updated
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </ScrollWrapper>
        </div>
    );
};

const OrderCard: React.FC<{ order: any, fetchOrders?: () => Promise<void> }> = ({ order, fetchOrders }) => { // fetchOrders as prop
    const [shipping, setShipping] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const handleShipOrder = async (orderId: string) => {
        setShipping(true);
        try {
            const orderDocRef = doc(db, 'orders', orderId);
            const orderDoc = await getDoc(orderDocRef);

            if (orderDoc.exists()) {
                 // Update isShipped field in orders collection instead of deleting
                await updateDoc(orderDocRef, { isShipped: true });

                console.log('Order shipped and moved to completedOrders collection');

                // Send shipment confirmation email
                if (order.email) {
                    sendShipmentConfirmationEmail(order.email, order.id);
                }
                // Refetch orders to update the list
                if (fetchOrders) { // Conditionally call fetchOrders
                    fetchOrders();
                }

            } else {
                console.error('Order not found');
            }
        } catch (error) {
            console.error('Error shipping order:', error);
        } finally {
            setShipping(false);
        }
    };

    const sendShipmentConfirmationEmail = async (email: string, orderId: string) => {
        // Placeholder for email sending functionality
        console.log(`Simulating sending email to: ${email} for order: ${orderId}`);
        alert(`Shipment confirmation email sent to: ${email}`); // Replace with actual email sending logic
    };

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-xl p-6 border-2 border-slate-700 hover:border-slate-600 transition-colors duration-200">
            <h3 className="text-lg font-semibold text-white mb-3">Order ID: <span className="text-emerald-400">{order.id}</span></h3>
            <div className="text-slate-300 space-y-2">
                <p>Name: <span className="text-white">{order.name}</span></p>
                <p>Phone: <span className="text-white">{order.phone}</span></p>
                <p>Email: <span className="text-white">{order.email || 'N/A'}</span></p>
                <p>Pickup Time: <span className="text-white">{order.pickupTime}</span></p>
                <p>Total: <span className="text-white">${order.total.toFixed(2)}</span></p>
            </div>
            <div className="mt-5 flex items-center justify-between">
                <button
                    onClick={() => handleShipOrder(order.id)}
                    className={`bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${shipping ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={shipping}
                >
                    {shipping ? 'Shipping...' : 'Mark Shipped'}
                </button>
                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
                >
                    {showDetails ? 'Hide Details' : 'View Details'}
                </button>
            </div>
            {showDetails && (
                <div className="mt-6 p-5 bg-slate-800 rounded-lg border border-slate-700">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-md font-semibold text-white">Customer Details:</h4>
                        <a href="/admin/support-requests" className="text-sm text-blue-400 hover:text-blue-300">Questions & Concerns</a>
                    </div>
                    <div className="text-slate-300 space-y-2">
                        <p>Card Name: <span className="text-white">{order.cardName}</span></p>
                        <p>Card Expiry: <span className="text-white">{order.cardExpiry}</span></p>
                        <p>Card CVV: <span className="text-white">{order.cardCvv}</span></p>
                    </div>
                    <h4 className="text-md font-semibold text-white mt-4 mb-3">Items:</h4>
                    <div className="bg-slate-700 rounded-md p-3">
                        <CartItemsList cart={order.cart} />
                    </div>
                </div>
            )}
        </div>
    );
};

const CartItemsList: React.FC<{ cart: any[] }> = ({ cart }) => {
    return (
        <ul className="list-disc list-inside">
            {cart.map((item: any) => (
                <li key={item.product.id}>
                    {item.product.name} x {item.quantity}
                </li>
            ))}
        </ul>
    );
};

export default Orders;
