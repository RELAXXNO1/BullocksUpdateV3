import React, { useState } from 'react';

interface OrderFormProps {
    onClose: () => void;
    onSubmit: (orderData: any) => void;
    total: number;
}

const OrderForm: React.FC<OrderFormProps> = ({ onClose, onSubmit, total }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [pickupTime, setPickupTime] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ name, phone, email, pickupTime });
    };

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-slate-900 bg-opacity-50 z-[101] flex items-center justify-center">
            <div className="bg-slate-800 p-6 rounded-lg shadow-xl w-96">
                <h2 className="text-2xl font-bold text-white mb-4">Order Details</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="mb-2">
                        <label className="block text-slate-300 text-sm font-medium mb-1">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-700 text-white rounded-md p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div className="mb-2">
                        <label className="block text-slate-300 text-sm font-medium mb-1">Phone Number</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-slate-700 text-white rounded-md p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div className="mb-2">
                        <label className="block text-slate-300 text-sm font-medium mb-1">Email (Optional)</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-700 text-white rounded-md p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                    </div>
                    <div className="mb-2">
                        <label className="block text-slate-300 text-sm font-medium mb-1">Preferred Pickup Time</label>
                         <input
                            type="datetime-local"
                            value={pickupTime}
                            onChange={(e) => setPickupTime(e.target.value)}
                            className="w-full bg-slate-700 text-white rounded-md p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="bg-slate-600 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded-elegant transition-elegant">Cancel</button>
                        <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-elegant transition-elegant">Submit Order</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OrderForm;
