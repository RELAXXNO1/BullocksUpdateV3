import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const Orders: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const ordersCollection = collection(db, 'orders');
                const ordersSnapshot = await getDocs(ordersCollection);
                const ordersList = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setOrders(ordersList.filter(order => !('isShipped' in order) || order.isShipped !== true));
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) {
        return (
            <div className="p-4">
                <h2 className="text-2xl font-bold text-white mb-4">Orders and Shipping</h2>
                <p className="text-slate-400">Loading orders...</p>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold text-white mb-4">Orders and Shipping</h2>
            {loading ? (
                <p className="text-slate-400">Loading orders...</p>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-slate-700">
                    <table className="w-full table-fixed text-left border-collapse border border-slate-700 text-slate-300">
                        <thead className="bg-slate-700">
                            <tr>
                                <th className="w-1/10 py-2 px-3 border border-slate-700 text-slate-300">Order ID</th>
                                <th className="w-1/10 py-2 px-3 border border-slate-700 text-slate-300">Name</th>
                                <th className="w-1/10 py-2 px-3 border border-slate-700 text-slate-300">Phone</th>
                                <th className="w-1/10 py-2 px-3 border border-slate-700 text-slate-300">Email</th>
                                <th className="w-1/10 py-2 px-3 border border-slate-700 text-slate-300">Pickup Time</th>
                                <th className="w-1/10 py-2 px-3 border border-slate-700 text-slate-300">Total</th>
                                <th className="w-1/10 py-2 px-3 border border-slate-700 text-slate-300 hidden-sm">Card Name</th>
                                <th className="w-1/10 py-2 px-3 border border-slate-700 text-slate-300 hidden-sm">Card Expiry</th>
                                <th className="w-1/10 py-2 px-3 border border-slate-700 text-slate-300 hidden-sm">Card CVV</th>
                                <th className="w-1/10 py-2 px-3 border border-slate-700 text-slate-300">Items</th>
                                <th className="w-1/10 py-2 px-3 border border-slate-700 text-slate-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-slate-900">
                            {orders.length === 0 ? (
                                <tr className="text-slate-400">
                                    <td colSpan={11} className="py-4 px-3 text-center">No orders yet.</td>
                                </tr>
                            ) : (
                                orders.map(order => (
                                    <OrderRow key={order.id} order={order} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const OrderRow: React.FC<{ order: any }> = ({ order }) => {
    const [shipping, setShipping] = useState(false);

    const handleShipOrder = async (orderId: string) => {
        setShipping(true);
        try {
            const orderDocRef = doc(db, 'orders', orderId);
            const orderDoc = await getDoc(orderDocRef);

            if (orderDoc.exists()) {
                 // Update isShipped field in orders collection instead of deleting
                await updateDoc(orderDocRef, { isShipped: true });

                console.log('Order shipped and moved to completedOrders collection');
            } else {
                console.error('Order not found');
            }
        } catch (error) {
            console.error('Error shipping order:', error);
        } finally {
            setShipping(false);
        }
    };

    const [showDetails, setShowDetails] = useState(false);

    return (
        <>
        <tr className="border-b border-slate-700 hover:bg-slate-700">
            <td className="py-2 px-3 border border-slate-700 text-slate-400">{order.id}</td>
            <td className="py-2 px-3 border border-slate-700 text-slate-400">{order.name}</td>
            <td className="py-2 px-3 border border-slate-700 text-slate-400">{order.phone}</td>
            <td className="py-2 px-3 border border-slate-700 text-slate-400">{order.email || 'N/A'}</td>
            <td className="py-2 px-3 border border-slate-700 text-slate-400">{order.pickupTime}</td>
            <td className="py-2 px-3 border border-slate-700 text-slate-400">${order.total.toFixed(2)}</td>
            <td className="py-2 px-3 border border-slate-700 text-slate-400 hidden-sm">{order.cardName}</td>
            <td className="py-2 px-3 border border-slate-700 text-slate-400 hidden-sm">{order.cardExpiry}</td>
            <td className="py-2 px-3 border border-slate-700 text-slate-400 hidden-sm">{order.cardCvv}</td>
            <td className="py-2 px-3 border border-slate-700 text-slate-400">
                <CartItemsList cart={order.cart} />
            </td>
            <td className="py-2 px-3 border border-slate-700 text-slate-400">
                <button
                    onClick={() => handleShipOrder(order.id)}
                    className="bg-emerald-500 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded"
                    disabled={shipping}
                >
                    {shipping ? 'Shipping...' : 'Shipped'}
                </button>
                 <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2"
                >
                    {showDetails ? 'Hide Details' : 'Details'}
                </button>
            </td>
        </tr>
         {showDetails && (
            <tr className="border-b border-slate-700 hover:bg-slate-700">
                <td colSpan={11} className="py-2 px-3 border border-slate-700 text-slate-400">
                    <p>Card Name: {order.cardName}</p>
                    <p>Card Expiry: {order.cardExpiry}</p>
                    <p>Card CVV: {order.cardCvv}</p>
                </td>
            </tr>
        )}
        </>
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
