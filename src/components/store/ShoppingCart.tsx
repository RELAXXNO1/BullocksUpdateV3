import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from '../../contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Minus, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ShoppingCartProps {
    closeCart: () => void;
}

interface CartItem {
    product: {
        id?: string;
        name: string;
        price?: number | {
            '1.75g': number;
            '3.5g': number;
            '7g': number;
            '14g': number;
            '1oz': number;
        };
        images?: string[];
    };
    quantity: number;
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({ closeCart }) => {
    const { cart, removeFromCart, clearCart, updateQuantity } = useCart();
    const [total, setTotal] = useState(0);
    const modalRef = React.useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const calculateTotal = useCallback(() => {
        return cart.reduce((sum, item) => {
            const price = typeof item.product?.price === 'number' ? item.product.price : Math.min(...Object.values(item.product?.price || {}));
            return sum + (price || 0) * item.quantity;
        }, 0);
    }, [cart]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                closeCart();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [closeCart]);

    useEffect(() => {
        setTotal(calculateTotal());
    }, [calculateTotal]);

    const handleRemoveFromCart = (productId: string | undefined) => {
        if (!productId) return;
        removeFromCart(productId);
    };

    const handleQuantityChange = (productId: string | undefined, newQuantity: number) => {
        if (!productId) return;
        if (newQuantity > 0) {
            updateQuantity(productId, newQuantity);
        }
    };

    const handleCheckout = () => {
        navigate('/order', { state: { total, items: cart }});
    };

    const handleCloseCart = () => {
        const productsSection = document.getElementById('products-section');
        productsSection?.scrollIntoView({ behavior: 'smooth' });
        closeCart();
    };

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, x: -20 }
    };

    return (
        <motion.div
            ref={modalRef}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                       bg-slate-900/40 backdrop-blur-xl shadow-2xl z-[100] flex flex-col w-full max-w-sm 
                       rounded-2xl border border-white/10"
            style={{
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
            }}
        >
            {/* Header with glass effect */}
            <div className="p-6 border-b border-white/10 bg-white/5 rounded-t-2xl backdrop-blur-sm
                          flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-500/20 rounded-lg">
                        <ShoppingBag className="w-6 h-6 text-teal-300" />
                    </div>
                    <h2 className="text-3xl font-display bg-gradient-to-r from-teal-300 to-teal-100 
                                 bg-clip-text text-transparent">Your Cart</h2>
                </div>
                <button
                    onClick={closeCart}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300
                             transform hover:rotate-90"
                    aria-label="Close cart"
                >
                    <X className="w-5 h-5 text-gray-400" />
                </button>
            </div>

            {/* Cart Items */}
            <div className="overflow-y-auto flex-grow p-4 max-h-[60vh] bg-gradient-to-b 
                          from-slate-900/40 to-slate-800/40">
                <AnimatePresence mode="wait">
                    {cart.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center text-gray-400 py-10"
                        >
                            <div className="p-4 bg-white/5 rounded-full w-20 h-20 mx-auto mb-4
                                          backdrop-blur-sm">
                                <ShoppingBag className="w-12 h-12 text-gray-500" />
                            </div>
                            <p className="mb-4">Your cart is empty</p>
                            <button
                                onClick={handleCloseCart}
                                className="mt-4 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 
                                         hover:to-teal-400 text-white font-medium py-2 px-6 rounded-lg 
                                         transition-all duration-300 shadow-lg shadow-teal-500/20
                                         hover:shadow-teal-500/40"
                            >
                                Continue Shopping
                            </button>
                        </motion.div>
                    ) : (
                        <ul className="space-y-4">
                            <AnimatePresence>
                                {cart.map((item: CartItem) => (
                                    item.product?.id && (
                                        <motion.li
                                            key={item.product.id}
                                            variants={itemVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            layout
                                            className="flex items-center justify-between p-4 rounded-xl
                                                     bg-white/5 backdrop-blur-sm border border-white/10 
                                                     hover:bg-white/10 transition-all duration-300
                                                     shadow-lg shadow-black/10"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="relative">
                                                    <div className="absolute inset-0 bg-gradient-to-br 
                                                                  from-teal-500/20 to-transparent rounded-lg" />
                                                    <img 
                                                        src={item.product.images?.[0] || "/logos/placeholder.png"} 
                                                        alt={item.product.name}
                                                        className="w-16 h-16 object-cover rounded-lg 
                                                                 bg-slate-800 relative z-10"
                                                    />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-medium text-white">
                                                        {item.product.name}
                                                    </h3>
                                                    <p className="bg-gradient-to-r from-teal-300 to-teal-200 
                                                              bg-clip-text text-transparent font-medium">
                                                        ${typeof item.product.price === 'number' ? item.product.price.toFixed(2) : Math.min(...Object.values(item.product.price || {})).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center border border-white/10 
                                                              rounded-lg bg-slate-800/50 backdrop-blur-sm">
                                                    <button
                                                        onClick={() => handleQuantityChange(
                                                            item.product?.id, 
                                                            item.quantity - 1
                                                        )}
                                                        className="p-2 text-gray-400 hover:text-white 
                                                                 hover:bg-white/10 rounded-l-lg 
                                                                 transition-colors"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="px-4 text-white font-medium">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => handleQuantityChange(
                                                            item.product?.id, 
                                                            item.quantity + 1
                                                        )}
                                                        className="p-2 text-gray-400 hover:text-white 
                                                                 hover:bg-white/10 rounded-r-lg 
                                                                 transition-colors"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveFromCart(item.product?.id)}
                                                    className="text-red-400 hover:text-red-300 
                                                             hover:bg-red-400/10 p-2 rounded-lg 
                                                             transition-all duration-300"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </motion.li>
                                    )
                                ))}
                            </AnimatePresence>
                        </ul>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer with glass effect */}
            {cart.length > 0 && (
                <div className="p-6 border-t border-white/10 bg-white/5 rounded-b-2xl backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-gray-400">Total Items: {cart.length}</span>
                        <h3 className="text-2xl font-semibold">
                            <span className="text-gray-400">Total: </span>
                            <span className="bg-gradient-to-r from-teal-300 to-teal-100 
                                         bg-clip-text text-transparent">
                                ${typeof total === 'number' ? total.toFixed(2) : total}
                            </span>
                        </h3>
                    </div>
                    <div className="flex flex-col space-y-3">
                        <motion.button
                            onClick={handleCheckout}
                            className="w-full bg-gradient-to-r from-teal-600 to-teal-500 
                                     hover:from-teal-500 hover:to-teal-400 text-white font-medium 
                                     py-3 rounded-xl transition-all duration-300 shadow-lg 
                                     shadow-teal-500/20 hover:shadow-teal-500/40 
                                     flex items-center justify-center gap-2"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            Proceed to Checkout
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={clearCart}
                            className="w-full bg-red-500/10 hover:bg-red-500/20 
                                     text-red-400 font-medium py-3 rounded-xl 
                                     transition-all duration-300 border border-red-500/20
                                     hover:border-red-500/40"
                        >
                            Clear Cart
                        </motion.button>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default ShoppingCart;
