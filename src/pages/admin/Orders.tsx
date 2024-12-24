import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useCartToggle } from '../../contexts/CartToggleContext';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';

const Orders: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { isCartEnabled } = useCartToggle();
    console.log('isCartEnabled:', isCartEnabled);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const ordersCollection = collection(db, 'orders');
                const ordersSnapshot = await getDocs(ordersCollection);
                const ordersList = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setOrders(ordersList);
                console.log('Fetched orders:', ordersList);
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
                    <table className="w-full text-left border-collapse border border-slate-700 text-slate-300">
                        <thead className="bg-slate-700">
                            <tr>
                                <th className="py-2 px-3 border border-slate-700 text-slate-300">Order ID</th>
                                <th className="py-2 px-3 border border-slate-700 text-slate-300">Name</th>
                                <th className="py-2 px-3 border border-slate-700 text-slate-300">Phone</th>
                                <th className="py-2 px-3 border border-slate-700 text-slate-300">Email</th>
                                <th className="py-2 px-3 border border-slate-700 text-slate-300">Pickup Time</th>
                                <th className="py-2 px-3 border border-slate-700 text-slate-300">Total</th>
                                <th className="py-2 px-3 border border-slate-700 text-slate-300">Items</th>
                                <th className="py-2 px-3 border border-slate-700 text-slate-300">Cart</th>
                            </tr>
                        </thead>
                        <tbody className="bg-slate-900">
                            {orders.length === 0 ? (
                                <tr className="text-slate-400">
                                    <td colSpan={8} className="py-4 px-3 text-center">No orders yet.</td>
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
    const { isCartEnabled, setCartEnabled } = useCartToggle();

    const handleToggleCart = () => {
        setCartEnabled(!isCartEnabled);
    };

    return (
        <tr className="border-b border-slate-700 hover:bg-slate-700">
            <td className="py-2 px-3 border border-slate-700 text-slate-400">{order.id}</td>
            <td className="py-2 px-3 border border-slate-700 text-slate-400">{order.name}</td>
            <td className="py-2 px-3 border border-slate-700 text-slate-400">{order.phone}</td>
            <td className="py-2 px-3 border border-slate-700 text-slate-400">{order.email || 'N/A'}</td>
            <td className="py-2 px-3 border border-slate-700 text-slate-400">{order.pickupTime}</td>
            <td className="py-2 px-3 border border-slate-700 text-slate-400">${order.total.toFixed(2)}</td>
            <td className="py-2 px-3 border border-slate-700 text-slate-400">
                <CartItemsList cart={order.cart} />
            </td>
            <td className="py-2 px-3 border border-slate-700 text-slate-400">
              <div className="flex items-center">
                <span className="mr-2">Enable Cart Functionality</span>
                <ToggleSwitch
                  checked={isCartEnabled}
                  onChange={handleToggleCart}
                />
              </div>
            </td>
        </tr>
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
