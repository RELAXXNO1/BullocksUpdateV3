import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { useCart } from '../../contexts/CartContext';

const OrderConfirmationPage: React.FC = () => {
    const navigate = useNavigate();
    const { clearCart } = useCart();

    useEffect(() => {
        clearCart();
    }, [clearCart]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-8 px-4 flex items-center justify-center"
        >
            <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-white mb-6">
                    Your order has been placed!
                </h2>
                <p className="text-gray-300 mb-8">
                    Thank you for trying High10 Everything! Your card won't be charged until the order is shipped! For questions and concerns, please contact us.
                </p>
                <Button onClick={() => navigate('/store')} variant="secondary">
                    Back to Store
                </Button>
            </div>
        </motion.div>
    );
};

export default OrderConfirmationPage;
