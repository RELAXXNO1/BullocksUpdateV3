import React, { useState, useEffect } from 'react';
import PhoneInput from 'react-phone-number-input';
import { motion } from 'framer-motion';
import { Clock, User, Phone, Mail, X, ShoppingBag } from 'lucide-react';
import 'react-phone-number-input/style.css';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

interface OrderFormProps {
    onClose: () => void;
    onSubmit: (orderData: OrderData) => void;
    total: number;
}

export interface OrderData {
    name: string;
    phone?: string;
    email: string;
    pickupTime: string;
    cardName?: string;
    cardNumber?: string;
    cardExpiry?: string;
    cardCvv?: string;
}

const OrderForm: React.FC<OrderFormProps> = ({ onClose, onSubmit, total }) => {
    const { cart } = useCart();
    const [formData, setFormData] = useState<OrderData>({
        name: '',
        phone: '',
        email: '',
        pickupTime: '',
        cardName: '',
        cardExpiry: '',
        cardCvv: ''
    });
    const [errors, setErrors] = useState<Partial<Record<keyof OrderData, string>>>({});
    const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Generate available time slots for the next 7 days
    useEffect(() => {
        const slots = [];
        const now = new Date();
        const storeOpenHour = 10; // 10 AM
        const storeCloseHour = 21; // 9 PM
        
        for (let day = 0; day < 7; day++) {
            const date = new Date(now);
            date.setDate(now.getDate() + day);
            
            for (let hour = storeOpenHour; hour <= storeCloseHour; hour++) {
                for (let minute of [0, 30]) {
                    const timeSlot = new Date(date);
                    timeSlot.setHours(hour, minute, 0);
                    
                    // Only include future time slots
                    if (timeSlot > now) {
                        slots.push(timeSlot.toISOString().slice(0, 16));
                    }
                }
            }
        }
        setAvailableTimeSlots(slots);
    }, []);

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof OrderData, string>> = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }
        
        if (formData.phone && formData.phone.length < 10) {
            newErrors.phone = 'Please enter a valid phone number';
        }
        
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        
        if (!formData.pickupTime) {
            newErrors.pickupTime = 'Please select a pickup time';
        }

        if (!formData.cardName?.trim()) {
            newErrors.cardName = 'Name on card is required';
        }

        if (!formData.cardNumber?.trim()) {
            newErrors.cardNumber = 'Card number is required';
        } else if (formData.cardNumber.length !== 16 || !/^\d+$/.test(formData.cardNumber)) {
            newErrors.cardNumber = 'Please enter a valid 16-digit card number';
        }

        if (!formData.cardExpiry?.trim()) {
            newErrors.cardExpiry = 'Card expiry is required';
        }

        if (!formData.cardCvv?.trim()) {
            newErrors.cardCvv = 'Card CVV is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            setLoading(true);
            await onSubmit(formData);
            // Send email receipt
            if (formData.email) {
                console.log('Sending email receipt to:', formData.email);
                // Placeholder for email sending logic
                // In a real application, you would use a service like SendGrid or Nodemailer
                // to send the email.
            }
             onClose();
             navigate('/store', { replace: true });
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof OrderData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).format(date);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[101] 
                     flex items-center justify-center px-4"
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-slate-900/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-md
                         border border-white/10"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                            <ShoppingBag className="w-6 h-6 text-emerald-300" />
                        </div>
                        <h2 className="text-3xl font-display bg-gradient-to-r from-emerald-300 
                                     to-emerald-100 bg-clip-text text-transparent">
                            Pickup Details
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300
                                 transform hover:rotate-90"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Input */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                            <User className="w-4 h-4" />
                            Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="w-full bg-white/5 text-white rounded-lg p-3 
                                     border border-white/10 focus:border-emerald-500/50 
                                     focus:ring-2 focus:ring-emerald-500/20 focus:outline-none
                                     transition-all duration-300"
                            placeholder="Enter your name"
                        />
                        {errors.name && (
                            <p className="text-red-400 text-sm flex items-center gap-1">
                                <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Phone Input */}
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

                    {/* Email Input */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                            <Mail className="w-4 h-4" />
                            Email (Optional)
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="w-full bg-white/5 text-white rounded-lg p-3 
                                     border border-white/10 focus:border-emerald-500/50 
                                     focus:ring-2 focus:ring-emerald-500/20 focus:outline-none
                                     transition-all duration-300"
                            placeholder="Enter your email"
                        />
                        {errors.email && (
                            <p className="text-red-400 text-sm flex items-center gap-1">
                                <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Name on Card Input */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                            <User className="w-4 h-4" />
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
                            placeholder="Enter name on card"
                        />
                        {errors.cardName && (
                            <p className="text-red-400 text-sm flex items-center gap-1">
                                <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                                {errors.cardName}
                            </p>
                        )}
                    </div>

                    {/* Card Number Input */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                            <Clock className="w-4 h-4" />
                            Card Number
                        </label>
                        <input
                            type="text"
                            value={formData.cardNumber}
                            onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                            className="w-full bg-white/5 text-white rounded-lg p-3 
                                     border border-white/10 focus:border-emerald-500/50 
                                     focus:ring-2 focus:ring-emerald-500/20 focus:outline-none
                                     transition-all duration-300"
                            placeholder="Enter 16-digit card number"
                        />
                         {errors.cardNumber && (
                            <p className="text-red-400 text-sm flex items-center gap-1">
                                <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                                {errors.cardNumber}
                            </p>
                        )}
                    </div>

                    {/* Expiration Date Input */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                            <Clock className="w-4 h-4" />
                            Expiration Date
                        </label>
                        <input
                            type="text"
                            value={formData.cardExpiry}
                            onChange={(e) => handleInputChange('cardExpiry', e.target.value)}
                            className="w-full bg-white/5 text-white rounded-lg p-3 
                                     border border-white/10 focus:border-emerald-500/50 
                                     focus:ring-2 focus:ring-emerald-500/20 focus:outline-none
                                     transition-all duration-300"
                            placeholder="MM/YY"
                        />
                        {errors.cardExpiry && (
                            <p className="text-red-400 text-sm flex items-center gap-1">
                                <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                                {errors.cardExpiry}
                            </p>
                        )}
                    </div>

                    {/* CVV Input */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                            <Clock className="w-4 h-4" />
                            CVV
                        </label>
                        <input
                            type="text"
                            value={formData.cardCvv}
                            onChange={(e) => handleInputChange('cardCvv', e.target.value)}
                            className="w-full bg-white/5 text-white rounded-lg p-3 
                                     border border-white/10 focus:border-emerald-500/50 
                                     focus:ring-2 focus:ring-emerald-500/20 focus:outline-none
                                     transition-all duration-300"
                            placeholder="Enter 3-digit code"
                        />
                         {errors.cardCvv && (
                            <p className="text-red-400 text-sm flex items-center gap-1">
                                <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                                {errors.cardCvv}
                            </p>
                        )}
                    </div>

                    {/* Pickup Time Selection */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                            <Clock className="w-4 h-4" />
                            Pickup Time
                        </label>
                        <select
                            value={formData.pickupTime}
                            onChange={(e) => handleInputChange('pickupTime', e.target.value)}
                            className="w-full bg-white/5 text-white rounded-lg p-3 
                                     border border-white/10 focus:border-emerald-500/50 
                                     focus:ring-2 focus:ring-emerald-500/20 focus:outline-none
                                     transition-all duration-300"
                        >
                            <option value="">Select pickup time</option>
                            {availableTimeSlots.map((slot) => (
                                <option key={slot} value={slot}>
                                    {formatDate(slot)}
                                </option>
                            ))}
                        </select>
                        {errors.pickupTime && (
                            <p className="text-red-400 text-sm flex items-center gap-1">
                                <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                                {errors.pickupTime}
                            </p>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                        <h3 className="text-lg font-semibold text-gray-300 mb-2">Order Summary</h3>
                        <ul className="mb-4">
                            {cart.map((item) => (
                                <li key={item.product.id} className="flex justify-between items-center py-1">
                                    <span className="text-gray-400">{item.product.name} x {item.quantity}</span>
                                    <span className="text-gray-300">${(Number(item.product.price) * item.quantity).toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="flex justify-between items-center border-t border-white/10 pt-2">
                            <span className="text-gray-300 font-medium">Total:</span>
                            <span className="text-xl font-semibold bg-gradient-to-r 
                                         from-emerald-300 to-emerald-100 bg-clip-text 
                                         text-transparent">
                                ${total.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 
                                     font-medium py-3 px-4 rounded-lg transition-all duration-300
                                     border border-white/10 hover:border-white/20"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 
                                     hover:from-emerald-500 hover:to-emerald-400 text-white 
                                     font-medium py-3 px-4 rounded-lg transition-all duration-300
                                     shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40
                                     ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Confirm Order'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default OrderForm;
