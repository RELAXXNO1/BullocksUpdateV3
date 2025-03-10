import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import ScrollWrapper from '../../components/store/ScrollWrapper';
import PointsOrderCard from '../../components/admin/PointsOrderCard';
import { Order } from '../../types/order'; // Import Order type

const Orders: React.FC = () => {
    const [activeOrders, setActiveOrders] = useState<Order[]>([]); // Use Order type
    const [previousOrders, setPreviousOrders] = useState<Order[]>([]);
    const [pointsOrders, setPointsOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeOrdersVisible, setActiveOrdersVisible] = useState(true);
    const [pointsOrdersVisible, setPointsOrdersVisible] = useState(false);

    const fetchOrders = async () => { // Extracted fetchOrders function
        try {
            const ordersCollection = collection(db, 'orders');
            const ordersSnapshot = await getDocs(ordersCollection);
            const ordersList = ordersSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    userId: data.userId,
                    items: data.items,
                    total: data.total,
                    status: data.status,
                    createdAt: data.createdAt,
                    isShipped: data.isShipped,
                    isPointsForJointsOrder: data.isPointsForJointsOrder,
                    name: data.name,
                    phone: data.phone,
                    email: data.email,
                    pickupTime: data.pickupTime,
                    cardName: data.cardName,
                    cardExpiry: data.cardExpiry,
                    cardCvv: data.cardCvv,
                    pointsRedeemed: data.pointsRedeemed,
                    address: data.address,
                    cart: data.cart,
                } as Order;
            });


            // Separate active, previous, and points for joints orders
            setActiveOrders(ordersList.filter(order => !order.isShipped && !order.isPointsForJointsOrder));
            setPreviousOrders(ordersList.filter(order => order.isShipped && !order.isPointsForJointsOrder));
            setPointsOrders(ordersList.filter(order => order.isPointsForJointsOrder));

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
        <div className="container mx-auto p-8 bg-gray-900 rounded-3xl shadow-lg">
            <h2 className="text-3xl font-bold text-white mb-6">Orders Dashboard</h2>

            <div className="mb-8 flex items-center justify-center space-x-4">
                <button
                    onClick={() => setActiveOrdersVisible(true)}
                    className={`${activeOrdersVisible ? 'text-white bg-emerald-600' : 'text-gray-300 hover:text-white'}
                        rounded-full px-4 py-2 font-medium text-sm focus:outline-none`}
                >
                    Active Orders
                </button>
                <button
                    onClick={() => setActiveOrdersVisible(false)}
                    className={`${!activeOrdersVisible && !pointsOrdersVisible ? 'text-white bg-emerald-600' : 'text-gray-300 hover:text-white'}
                        rounded-full px-4 py-2 font-medium text-sm focus:outline-none`}
                >
                    Previous Orders
                </button>
                 <button
                    onClick={() => {
                        setActiveOrdersVisible(false);
                        setPointsOrdersVisible(true);
                    }}
                    className={`${pointsOrdersVisible ? 'text-white bg-emerald-600' : 'text-gray-300 hover:text-white'}
                        rounded-full px-4 py-2 font-medium text-sm focus:outline-none`}
                >
                    Points for Joints Orders
                </button>
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
                                    <OrderCard key={order.id} order={order} fetchOrders={fetchOrders} />
                                ))}
                            </div>
                        )}
                    </div>
                ) : !pointsOrdersVisible ? (
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-4">Previous Orders</h3>
                        {previousOrders.length === 0 ? (
                            <div className="text-slate-400 p-4 text-center">No previous orders available.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {previousOrders.map(order => (
                                    <OrderCard key={order.id} order={order} />
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-4">Points for Joints Orders</h3>
                        {pointsOrders.length === 0 ? (
                            <div className="text-slate-400 p-4 text-center">No points for joints orders available.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pointsOrders.map(order => (
                                    <PointsOrderCard key={order.id} order={order} fetchOrders={fetchOrders} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </ScrollWrapper>
        </div >
    );
};

const OrderCard: React.FC<{ order: any, fetchOrders?: () => Promise<void> }> = ({ order, fetchOrders }) => {
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
            setIsModalOpen(false); // Close the modal after shipping
        }
    };

    const sendShipmentConfirmationEmail = async (email: string, orderId: string) => {
        // Placeholder for email sending functionality
        console.log(`Simulating sending email to: ${email} for order: ${orderId}`);
        alert(`Shipment confirmation email sent to: ${email}`); // Replace with actual email sending logic
    };

    return (
        <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl shadow-xl p-6 border border-gray-600 hover:scale-105 transition-transform duration-200">
            <h3 className="text-lg font-semibold text-white mb-3">Order ID: <span className="text-emerald-400">{order.id}</span></h3>
            <div className="text-gray-300 space-y-2">
                <p>Name: <span className="text-white">{order.name}</span></p>
                <p>Phone: <span className="text-white">{order.phone}</span></p>
                <p>Email: <span className="text-white">{order.email || 'N/A'}</span></p>
                <p>Pickup Time: <span className="text-white">{order.pickupTime}</span></p>
                {order.total !== undefined && !order.isPointsForJointsOrder && (
                    <p>Total: <span className="text-white">${order.total.toFixed(2)}</span></p>
                )}
            </div>
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
                        <a href="/admin/support-requests" className="text-sm text-blue-400 hover:text-blue-300">Questions & Concerns</a>
                    </div>
                    <div className="text-gray-300 space-y-2">
                        <p>Card Name: <span className="text-white">{order.cardName}</span></p>
                        <p>Card Expiry: <span className="text-white">{order.cardExpiry}</span></p>
                        <p>Card CVV: <span className="text-white">{order.cardCvv}</span></p>
                    </div>
                    <h4 className="text-md font-semibold text-white mt-4 mb-3">Items:</h4>
                    <div className="bg-gray-700 rounded-md p-3">
                        <CartItemsList cart={order.cart} />
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
                                setIsModalOpen(false); // Close modal after viewing details
                            }}
                            className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
                        >
                            View Details
                        </button>
                        <button
                            onClick={() => handlePointsForJoints(order)}
                            className="block w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 mt-2"
                        >
                            Points for Joints
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

const handlePointsForJoints = async (order: any) => {
    const points = Math.floor(order.total / 5);
    const userEmail = order.email;

    if (!userEmail) {
        alert("No email associated with this order to award points.");
        return;
    }

    if (isNaN(points) || points <= 0) {
        alert("Order total is not valid for awarding points.");
        return;
    }

    const confirmAward = window.confirm(`Award ${points} points to ${userEmail} for this order?`);
    if (!confirmAward) {
        return;
    }

    try {
        await awardPointsToUser(userEmail, points);
        alert(`Successfully awarded ${points} points to ${userEmail}`);
    } catch (error) {
        console.error("Error awarding points:", error);
        alert("Failed to award points. See console for details.");
    }
};

const awardPointsToUser = async (email: string, points: number) => {
    const usersCollection = collection(db, 'users');
    const userDocs = await getDocs(usersCollection);
    
    let userId = null;
    userDocs.forEach(doc => {
        if (doc.data().email === email) {
            userId = doc.id;
        }
    });

    if (!userId) {
        throw new Error("User not found with provided email.");
    }

    const userPointsDocRef = doc(db, 'userPoints', userId);
    const userPointsDoc = await getDoc(userPointsDocRef);

    if (userPointsDoc.exists()) {
        // Update existing points
        const currentPoints = userPointsDoc.data().points || 0;
        await updateDoc(userPointsDocRef, { points: currentPoints + points });
    } else {
        // Create new points document
        await setDoc(userPointsDocRef, { points: points, email: email });
    }
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
