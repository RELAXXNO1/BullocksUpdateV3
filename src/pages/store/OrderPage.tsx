import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/Alert';
import { useToast } from '../../components/ui/use-toast';
import { useAnalytics } from '../../hooks/useAnalytics';
import OrderForm from '../../components/store/OrderForm';

interface LocationState {
  total: number;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

interface OrderData {
    name: string;
    phone: string;
    email?: string;
    pickupTime: string;
}

const OrderPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const { trackEvent } = useAnalytics();
    const [error, setError] = useState<string | null>(null);

    // Type-safe location state
    const state = location.state as LocationState | null;

    // Track page view
    useEffect(() => {
        trackEvent('page_view', {
            page_name: 'order_page',
            total_amount: state?.total || 0
        });
    }, []);

    // Redirect if no order data is present
    if (!state?.total || !state?.items) {
        return <Navigate to="/store" replace />;
    }

    const handleOrderSubmit = async (orderData: OrderData) => {
        setError(null);

        try {
            // Track order initiation
            trackEvent('begin_checkout', {
                total_amount: state.total,
                items: state.items
            });

            const payload = {
                ...orderData,
                items: state.items,
                total: state.total,
                orderId: generateOrderId(),
                timestamp: new Date().toISOString()
            };

            // Submit order to backend
            const response = await submitOrder(payload);

            // Track successful order
            trackEvent('purchase', {
                transaction_id: response.orderId,
                value: state.total,
                items: state.items
            });

            // Show success message
            toast("Order Confirmed!", "success");

            // Navigate to admin orders page
            navigate(`/admin/orders`);
        } catch (err) {
            const errorMessage = extractErrorMessage(err);
            setError(errorMessage);
            
            // Track failed order
            trackEvent('purchase_failed', {
                error_message: errorMessage,
                total_amount: state.total
            });

            toast(errorMessage, "error");
        }
    };

    const handleClose = () => {
        trackEvent('checkout_abandoned', {
            total_amount: state.total
        });
        navigate('/store');
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-8 px-4"
        >
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/store')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white 
                             transition-colors duration-200 mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Store
                </button>


                {/* Error Alert */}
                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Product Details */}
                <div className="bg-slate-800/50 backdrop-blur-lg rounded-lg p-6 mb-6 border border-slate-700/50">
                    <h2 className="text-xl font-semibold text-white mb-4">Product Details</h2>
                    <div className="space-y-3">
                        {state?.items?.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 text-gray-300">
                                <span className="text-lg font-medium">{item.name}</span>
                                <span className="text-sm">Quantity: {item.quantity}</span>
                                <span className="text-sm">Price: ${item.price ? item.price.toFixed(2) : '0.00'}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Summary */}
                <div className="bg-slate-800/50 backdrop-blur-lg rounded-lg p-6 mb-6 
                              border border-slate-700/50">
                    <h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>
                    <div className="space-y-3">
                        <div className="border-t border-slate-700 pt-3 flex justify-between 
                                      text-lg font-semibold text-white">
                            <span>Total</span>
                            <span>${state?.total ? state.total.toFixed(2) : '0.00'}</span>
                        </div>
                    </div>
                </div>

                {/* Order Form */}
                <div className="bg-slate-800/50 backdrop-blur-lg rounded-lg border 
                              border-slate-700/50 overflow-hidden">
                    <OrderForm
                        onSubmit={handleOrderSubmit}
                        onClose={handleClose}
                        total={state.total}
                    />
                </div>
            </div>
        </motion.div>
    );
};

// Helper functions
const generateOrderId = (): string => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${randomStr}`.toUpperCase();
};

const submitOrder = async (payload: any): Promise<any> => {
    const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit order');
    }

    return response.json();
};

const extractErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unexpected error occurred';
};

export default OrderPage;
