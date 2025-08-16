import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { useUserPoints } from '../../hooks/useUserPoints';
import { OrderConfirmationModal } from './PointsForJointsConfirmationModal';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select } from '../ui/Select';

interface PointsForJointsOrderFormProps {
  onOrderSubmit: (orderData: any) => void;
  userEmail: string | undefined | null;
}

const PointsForJointsOrderForm: React.FC<PointsForJointsOrderFormProps> = ({ onOrderSubmit, userEmail }) => {
    const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { points, updateUserPoints } = useUserPoints();
    const [orderError, setOrderError] = useState('');
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [pointsToRedeem, setPointsToRedeem] = useState<number>(1000); // Default to 1000 points

    const handleOrder = async () => {
        if (!name || !address || !phone) {
            setOrderError('Please fill in all fields.');
            return;
        }
        if (points === undefined) {
            setOrderError('Could not fetch your points. Please try again.');
            return;
        }

        if (points < pointsToRedeem) {
            setOrderError('Not enough points to redeem.');
            return;
        }
        if (pointsToRedeem % 8 !== 0) {
            setOrderError('Points to redeem must be in intervals of 8.');
            return;
        }


        try {
            await updateUserPoints(points - pointsToRedeem);
            setIsOrderConfirmed(true);
            setIsModalOpen(true);
            setOrderError('');

            // Prepare order data
            const orderData = {
                name,
                address,
                phone,
                pointsRedeemed: pointsToRedeem,
                orderType: 'Free Joints (Points Redemption)',
                userEmail: userEmail,
                timestamp: new Date(),
            };
            onOrderSubmit({...orderData, isPointsForJointsOrder: true }); // Add isPointsForJointsOrder
        } catch (error: any) {
            console.error("Error redeeming points for joints:", error);
            setOrderError('Failed to redeem points. Please try again later.');
        }
    };

    const generatePointsOptions = () => {
        if (points === undefined) return [];
        const options = [];
        for (let i = 8; i <= points; i += 8) {
            options.push(<option key={i} value={i}>{i} points</option>);
        }
        return options;
    };


    return (
        <div>
            {orderError && (
                <div className="text-red-500 font-semibold mb-4 p-4 bg-gray-800 rounded-lg shadow-md">
                    {orderError}
                </div>
            )}

            {isOrderConfirmed ? (
                <div className="text-green-500 font-semibold mb-4 p-4 bg-gray-800 rounded-lg shadow-md">
                    Thanks for your loyalty to High10Everything!! Your free Joints will be shipped free of charge!!!
                    <Button onClick={() => setIsOrderConfirmed(false)} variant="secondary" className="mt-4">Redeem Another</Button>
                </div>
            ) : (
                <form onSubmit={(e) => { e.preventDefault(); handleOrder(); }} className="space-y-4">
                    <p>Redeem points for free joints.</p>
                    {points !== undefined ? (
                        <p>Your current points: {points}</p>
                    ) : (
                        <p>Loading points...</p>
                    )}

                    <div>
                        <Label htmlFor="pointsToRedeem">Points to Redeem (intervals of 8)</Label>
                        <Select
                            id="pointsToRedeem"
                            value={pointsToRedeem}
                            onChange={(e) => setPointsToRedeem(Number(e.target.value))}
                        >
                            {generatePointsOptions()}
                        </Select>
                    </div>


                    <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your Full Name"
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="address">Shipping Address</Label>
                        <Input
                            id="address"
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Your Shipping Address"
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Your Phone Number"
                            required
                        />
                    </div>
                    <Button type="submit" disabled={points === undefined || points < pointsToRedeem || pointsToRedeem < 8 || pointsToRedeem % 8 !== 0}>
                        Redeem Points
                    </Button>
                </form>
            )}
            <OrderConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                message={`Your order for free joints has been placed and ${pointsToRedeem} points have been deducted from your account. Thank you for your loyalty!`}
            />
        </div>
    );
};

export default PointsForJointsOrderForm;
