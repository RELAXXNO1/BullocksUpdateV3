import { useState, useEffect } from 'react';
import AccountLayout from '../../components/layouts/AccountLayout';
import { useAuth } from '../../hooks/useAuth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { BackButton } from '../../components/ui/BackButton';

interface Order {
  id: string;
  timestamp: any; // Date of order
  cart: Array<{ // Items in the order
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number; // Total order amount
  // Include other fields as necessary based on your order data structure
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]); // Use the Order interface
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const ordersQuery = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(ordersQuery);
        const fetchedOrders = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            timestamp: data.timestamp.toDate(), // Convert timestamp to Date object
          } as Order;
        });
        setOrders(fetchedOrders);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to fetch orders. Please try again later.');
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (loading) {
    return <div>Loading orders...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <AccountLayout>
      <div className="container mx-auto px-4 py-8 relative">
        <h1 className="text-3xl font-bold text-white mb-8">Your Orders</h1>
        <div className="absolute top-0 right-0">
          <BackButton to="/store" />
        </div>
        {orders.length === 0 ? (
          <p className="text-gray-400">No orders placed yet.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6 shadow-md">
                <h2 className="text-xl font-semibold text-white mb-2">Order #{order.id}</h2>
                <p className="text-gray-300 mb-1">Date: {order.timestamp.toLocaleDateString()}</p>
                <p className="text-gray-300 mb-1">Total Items: {order.cart.reduce((sum, item) => sum + item.quantity, 0)}</p>
                <p className="text-emerald-500 font-semibold">Total Price: ${order.total}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AccountLayout>
  );
};

export default OrdersPage;
