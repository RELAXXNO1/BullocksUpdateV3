import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, User, Phone, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/Alert';
import { useToast } from '../../components/ui/use-toast';
import { useAnalytics } from '../../hooks/useAnalytics';
import { addOrder } from '../../lib/firebase';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import OrderConfirmationModal from '../../components/store/OrderConfirmationModal';

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
    address: string;
    city: string;
    state: string;
    zipCode: string;
    cardName: string;
    cardExpiry: string;
    cardCvv: string;
}

// Added error extraction utility function
const extractErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    return String(error);
};

const OrderPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const { trackEvent } = useAnalytics();
    const [error] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Type-safe location state
    const state = location.state as LocationState | null;

    // Redirect if no order data is present
    if (!state?.total || !state?.items) {
        return <Navigate to="/store" replace />;
    }

    const handleOrderSubmit = async (orderData: OrderData) => {
        try {
            // Track order initiation
            trackEvent('begin_checkout', {
                total_amount: state.total,
                items: state.items
            });

             // Show success message
            toast("Order Confirmed!", "success");

            // Add order to Firestore
            await addOrder({
                name: orderData.name,
                phone: orderData.phone,
                email: orderData.email,
                address: orderData.address,
                city: orderData.city,
                state: orderData.state,
                zipCode: orderData.zipCode,
                cardName: orderData.cardName,
                cardExpiry: orderData.cardExpiry,
                cardCvv: orderData.cardCvv,
                cart: state.items,
                total: state.total,
                orderId: generateOrderId(),
                timestamp: new Date().toISOString()
            });
        } catch (err) {
            const errorMessage = extractErrorMessage(err);
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

    const [formData, setFormData] = useState<OrderData>({
        name: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        cardName: '',
        cardExpiry: '',
        cardCvv: ''
    });
    const [errors, setErrors] = useState<Partial<Record<keyof OrderData, string>>>({});

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof OrderData, string>> = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }
        
        if (!formData.phone) {
            newErrors.phone = 'Phone number is required';
        } else if (formData.phone.length < 10) {
            newErrors.phone = 'Please enter a valid phone number';
        }
        
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        
        if (!formData.address?.trim()) {
            newErrors.address = 'Address is required';
        }

        if (!formData.city?.trim()) {
            newErrors.city = 'City is required';
        }

        if (!formData.state?.trim()) {
            newErrors.state = 'State is required';
        }

        if (!formData.zipCode?.trim()) {
            newErrors.zipCode = 'Zip code is required';
        }

        if (!formData.cardName?.trim()) {
            newErrors.cardName = 'Name on card is required';
        }

        if (!formData.cardExpiry?.trim()) {
            newErrors.cardExpiry = 'Card expiry/number is required';
        }

        if (!formData.cardCvv?.trim()) {
            newErrors.cardCvv = 'Card CVV is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('handleSubmit called');
        if (validateForm()) {
            handleOrderSubmit(formData);
            setIsModalOpen(true);
        }
    };

    const handleInputChange = <K extends keyof OrderData>(field: K, value: OrderData[K]) => {
        let formattedValue = value;

        if (field === 'cardExpiry') {
            // Auto-format MM/YY
            const cleanedValue = String(value).replace(/\D/g, '');
            if (cleanedValue.length > 2) {
                formattedValue = `${cleanedValue.slice(0, 2)}/${cleanedValue.slice(2, 4)}`;
            }
             if (cleanedValue.length > 4) {
                formattedValue = `${formattedValue} ${cleanedValue.slice(4).match(/.{1,4}/g)?.join(' ')}`;
            }
        }

        setFormData(prev => ({ ...prev, [field]: formattedValue as OrderData[K] }));
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        navigate('/store');
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-8 px-4 relative"
        >
            <OrderConfirmationModal isOpen={isModalOpen} onClose={handleModalClose} />
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

                {/* Form */}
                <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-lg overflow-hidden">
                    <form onSubmit={handleSubmit} className="space-y-6 p-6">
                        {/* Contact Information Section */}
                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Name Input */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                                    <User className="w-4 h-4" />
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className="w-full bg-white/5 text-white rounded-lg p-3 
                                            border border-white/10 focus:border-emerald-500/50 
                                            focus:ring-2 focus:ring-emerald-500/20 focus:outline-none
                                            transition-all duration-300"
                                    placeholder="Enter your full name"
                                />
                                {errors.name && (
                                    <p className="text-red-400 text-sm flex items-center gap-1">
                                        <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Email Input */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                                    <Mail className="w-4 h-4" />
                                    Email (Optional)
                                </label>
                                <input
                                    type="email"
                                    value={formData.email || ''}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className="w-full bg-white/5 text-white rounded-lg p-3 
                                            border border-white/10 focus:border-emerald-500/50 
                                            focus:ring-2 focus:ring-emerald-500/20 focus:outline-none
                                            transition-all duration-300"
                                    placeholder="Optional email address"
                                />
                                {errors.email && (
                                    <p className="text-red-400 text-sm flex items-center gap-1">
                                        <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                                        {errors.email}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Phone Input with existing library */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                                <Phone className="w-4 h-4" />
                                Phone Number
                            </label>
                            <PhoneInput
                                international
                                defaultCountry="US"
                                value={formData.phone}
                                onChange={(value) => handleInputChange('phone', value || '')}
                                className="w-full bg-white/5 text-white rounded-lg 
                                        border border-white/10 focus:border-emerald-500/50 
                                        focus:ring-2 focus:ring-emerald-500/20 
                                        transition-all duration-300"
                            />
                            {errors.phone && (
                                <p className="text-red-400 text-sm flex items-center gap-1">
                                    <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                                    {errors.phone}
                                </p>
                            )}
                        </div>

                        {/* Shipping Address Section */}
                        <div className="grid md:grid-cols-3 gap-4">
                            {/* Address Input */}
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-gray-300 text-sm font-medium">
                                    Street Address
                                </label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                    className="w-full bg-white/5 text-white rounded-lg p-3 
                                            border border-white/10 focus:border-emerald-500/50 
                                            focus:ring-2 focus:ring-emerald-500/20 focus:outline-none
                                            transition-all duration-300"
                                    placeholder="1234 Main St"
                                />
                                {errors.address && (
                                    <p className="text-red-400 text-sm flex items-center gap-1">
                                        <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                                        {errors.address}
                                    </p>
                                )}
                            </div>

                            {/* Zip Code Input */}
                            <div className="space-y-2">
                                <label className="text-gray-300 text-sm font-medium">
                                    Zip Code
                                </label>
                                <input
                                    type="text"
                                    value={formData.zipCode}
                                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                                    className="w-full bg-white/5 text-white rounded-lg p-3 
                                            border border-white/10 focus:border-emerald-500/50 
                                            focus:ring-2 focus:ring-emerald-500/20 focus:outline-none
                                            transition-all duration-300"
                                    placeholder="12345"
                                />
                                {errors.zipCode && (
                                    <p className="text-red-400 text-sm flex items-center gap-1">
                                        <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                                        {errors.zipCode}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* City and State Inputs */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-gray-300 text-sm font-medium">
                                    City
                                </label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => handleInputChange('city', e.target.value)}
                                    className="w-full bg-white/5 text-white rounded-lg p-3 
                                            border border-white/10 focus:border-emerald-500/50 
                                            focus:ring-2 focus:ring-emerald-500/20 focus:outline-none
                                            transition-all duration-300"
                                    placeholder="New York"
                                />
                                {errors.city && (
                                    <p className="text-red-400 text-sm flex items-center gap-1">
                                        <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                                        {errors.city}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-gray-300 text-sm font-medium">
                                    State
                                </label>
                                <input
                                    type="text"
                                    value={formData.state}
                                    onChange={(e) => handleInputChange('state', e.target.value)}
                                    className="w-full bg-white/5 text-white rounded-lg p-3 
                                            border border-white/10 focus:border-emerald-500/50 
                                            focus:ring-2 focus:ring-emerald-500/20 focus:outline-none
                                            transition-all duration-300"
                                    placeholder="NY"
                                />
                                {errors.state && (
                                    <p className="text-red-400 text-sm flex items-center gap-1">
                                        <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                                        {errors.state}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Payment Information Section */}
                        <div className="grid md:grid-cols-3 gap-4">
                            {/* Card Name Input */}
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-gray-300 text-sm font-medium">
                                    Name on Card
                                </label>
                                <input
                                    type="text"
                                    value={formData.cardName}
                                    onChange={(e) => handleInputChange('cardName', e.target.value)}
                                    className="w-full bg-white/5 text-white rounded-lg p-3 
                                            border border-white/10 focus:border-emerald-500/50 
                                            focus:ring-2 focus:ring-emerald-500/20 focus:outline-none
                                            transition-all duration-300"
                                    placeholder="John Doe"
                                />
                                {errors.cardName && (
                                    <p className="text-red-400 text-sm flex items-center gap-1">
                                        <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                                        {errors.cardName}
                                    </p>
                                )}
                            </div>

                            {/* Card CVV Input */}
                            <div className="space-y-2">
                                <label className="text-gray-300 text-sm font-medium">
                                    CVV
                                </label>
                                <input
                                    type="text"
                                    maxLength={4}
                                    value={formData.cardCvv}
                                    onChange={(e) => handleInputChange('cardCvv', e.target.value.replace(/\D/g, ''))}
                                    className="w-full bg-white/5 text-white rounded-lg p-3 
                                            border border-white/10 focus:border-emerald-500/50 
                                            focus:ring-2 focus:ring-emerald-500/20 focus:outline-none
                                            transition-all duration-300"
                                    placeholder="123"
                                />
                                {errors.cardCvv && (
                                    <p className="text-red-400 text-sm flex items-center gap-1">
                                        <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                                        {errors.cardCvv}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Card Expiry Input */}
                        <div className="space-y-2">
                            <label className="text-gray-300 text-sm font-medium">
                                Card Expiry / Number
                            </label>
                            <input
                                type="text"
                                value={formData.cardExpiry}
                                onChange={(e) => {
                                    let value = e.target.value.replace(/\D/g, '');
                                    handleInputChange('cardExpiry', value);
                                }}
                                className="w-full bg-white/5 text-white rounded-lg p-3 
                                        border border-white/10 focus:border-emerald-500/50 
                                        focus:ring-2 focus:ring-emerald-500/20 focus:outline-none
                                        transition-all duration-300"
                                placeholder="MM/YY / 16-digit card number"
                            />
                            {errors.cardExpiry && (
                                <p className="text-red-400 text-sm flex items-center gap-1">
                                    <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                                    {errors.cardExpiry}
                                </p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 mt-8">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 
                                        font-medium py-3 px-4 rounded-lg transition-all duration-300
                                        border border-white/10 hover:border-white/20"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 
                                        hover:from-emerald-500 hover:to-emerald-400 text-white 
                                        font-medium py-3 px-4 rounded-lg transition-all duration-300
                                        shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
                            >
                                Confirm Order
                            </button>
                        </div>
                    </form>
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

export default OrderPage;
