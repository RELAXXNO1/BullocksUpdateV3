import React, { useState, useEffect } from 'react';
import { useCart } from '../../contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useCartToggle } from '../../contexts/CartToggleContext';
import OrderForm from './OrderForm';

interface ShoppingCartProps {
    closeCart: () => void;
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({ closeCart }) => {
    const { cart, removeFromCart, clearCart, updateQuantity } = useCart();
    const [isOrderFormVisible, setIsOrderFormVisible] = useState(false);
    const {  } = useCartToggle();
    const [total, setTotal] = useState(0);
    const modalRef = React.useRef<HTMLDivElement>(null);


    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
          if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
            closeCart();
          }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }, [closeCart]);

    useEffect(() => {
        const calculateTotal = () => {
            return cart.reduce((total, item) => total + (item.product?.price || 0) * item.quantity, 0);
        };
        setTotal(calculateTotal());
    }, [cart]);

    const handleRemoveFromCart = (productId: string | undefined) => {
        if (productId) {
            removeFromCart(productId);
        } else {
            console.error("Attempted to remove from cart with an undefined product id");
        }
    };

    const handleClearCart = () => {
        clearCart();
    };

    const handleQuantityChange = (productId: string | undefined, quantity: number) => {
         if (productId) {
            if (quantity > 0) {
                updateQuantity(productId, quantity);
            }
        } else {
            console.error("Attempted to update product quantity with an undefined product id");
        }
    };

    const handleCheckout = () => {
        setIsOrderFormVisible(true);
    };

    const handleOrderSubmit = async (orderData: any) => {
        try {
            // Here you would typically send the order data to your backend
            // For this example, we'll just log the order data
            console.log('Order submitted:', { ...orderData, cart: cart, total: total });
            setIsOrderFormVisible(false);
            clearCart();
        } catch (error) {
            console.error('Error submitting order:', error);
            // Handle error here
        }
    };

    const handleCloseCart = () => {
        const productsSection = document.getElementById('products-section');
        productsSection?.scrollIntoView({ behavior: 'smooth' });
        closeCart();
    };

    const handleCloseOrderForm = () => {
        setIsOrderFormVisible(false);
    };

    return (
        <motion.div
            ref={modalRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-800 shadow-xl z-[100] flex flex-col w-full max-w-sm rounded-xl border border-gray-700 !important"
        >
            {/* Header */}
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                <h2 className="text-3xl font-display text-teal-300">Your Cart</h2>
            </div>

            {/* Cart Items */}
            <div className="overflow-y-auto flex-grow p-4">
                {cart.length === 0 ? (
                    <div className="text-center text-gray-400 py-10">
                        Your cart is empty.
                        <button
                            onClick={handleCloseCart}
                            className="mt-4 bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-md"
                        >
                            Go to Store
                        </button>
                    </div>
                ) : (
                    <ul className="space-y-4">
                        {cart.map(item => {
                            if (!item.product?.id) {
                                console.error("Invalid product ID:", item.product);
                                return null;
                            }
                            return item.product?.id ? (
                                <motion.li
                                    key={item.product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex items-center justify-between p-4 rounded-md bg-dark-700 border border-gray-700"
                                >
                                    <div className="flex items-center space-x-4">
                                        <img src={item.product.imageUrl} alt={item.product.name} className="w-16 h-16 object-cover rounded-md" />
                                        <div>
                                            <h3 className="text-lg font-medium text-white">{item.product.name}</h3>
                                            <p className="text-gray-400 text-sm">${item.product.price?.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center border border-gray-600 rounded-md">
                                            <button
                                                onClick={() => handleQuantityChange(item.product?.id, item.quantity - 1)}
                                                className="px-2 py-1 text-gray-400 hover:text-gray-300 focus:outline-none rounded-l-md"
                                                disabled={item.quantity <= 1}
                                            >
                                                -
                                            </button>
                                            <span className="px-3 text-white">{item.quantity}</span>
                                            <button
                                                onClick={() => handleQuantityChange(item.product?.id, item.quantity + 1)}
                                                className="px-2 py-1 text-gray-400 hover:text-gray-300 focus:outline-none rounded-r-md"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveFromCart(item.product?.id)}
                                            className="text-red-500 hover:text-red-400 focus:outline-none p-1 rounded-md"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                </motion.li>
                            ) : null;
                        })}
                    </ul>
                )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
                <div className="p-4 border-t border-gray-700 bg-dark-800">
                    <div className="text-right mb-4">
                        <h3 className="text-white text-xl font-semibold">Total: <span className="font-bold">${total.toFixed(2)}</span></h3>
                    </div>
                    <div className="flex flex-col space-y-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCheckout}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-lg transition-colors shadow-md"
                        >
                            Proceed to Order Form
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleClearCart}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-colors shadow-md"
                        >
                            Clear Cart
                        </motion.button>
                    </div>
                </div>
            )}

            {/* Order Form Modal */}
            <AnimatePresence>
                {isOrderFormVisible && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-dark-900/60 backdrop-blur-sm z-[101] flex items-center justify-center"
                    >
                        <div className="bg-gradient-primary rounded-xl shadow-xl p-6 max-w-md w-full overflow-y-auto backdrop-filter backdrop-blur-lg border border-gray-700">
                            <OrderForm
                                onClose={handleCloseOrderForm}
                                onSubmit={handleOrderSubmit}
                                total={total}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ShoppingCart;
