import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';

interface OrderConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({ isOpen, onClose, message }) => {
    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-slate-800/90 backdrop-blur-lg border border-slate-700/50 rounded-lg p-8 max-w-md text-center"
            >
                <h2 className="text-3xl font-bold text-white mb-6">
                    Order Confirmed!
                </h2>
                <p className="text-gray-300 mb-8">
                    {message}
                </p>
                <Button onClick={onClose} variant="secondary">
                    Close
                </Button>
            </motion.div>
        </motion.div>
    );
};
