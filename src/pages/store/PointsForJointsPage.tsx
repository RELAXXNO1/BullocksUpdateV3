import React from 'react';
import PointsForJointsOrderForm from '../../components/store/PointsForJointsOrderForm';
import { useAuth } from '../../hooks/useAuth';
import { addOrder } from '../../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ui/use-toast';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useUserPoints } from '../../hooks/useUserPoints';

const PointsForJointsPage: React.FC = () => {
  const { user } = useAuth();
  const { points, updateUserPoints } = useUserPoints();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackEvent } = useAnalytics();
  const pointsCost = 5;

  const handleOrderSubmit = async (orderData: any) => {
    try {
      trackEvent('begin_checkout', {
        total_amount: 0, // Points for Joints is always free
        items: orderData.cart,
      });

      // Deduct points
      if (points !== undefined) {
        const newPoints = points - pointsCost;
        await updateUserPoints(newPoints);
      }


      await addOrder({
        ...orderData,
        orderId: generateOrderId(),
        timestamp: new Date().toISOString(),
      });

      toast('Order Confirmed!', 'success');
      navigate('/order-confirmation');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to submit order';
      trackEvent('purchase_failed', {
        error_message: errorMessage,
        total_amount: 0,
      });
      toast(errorMessage, 'error');
    }
  };

  const generateOrderId = (): string => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${randomStr}`.toUpperCase();
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4 text-white">Redeem Points for a Joint</h1>
      {user ? (
        <>
          <p className="text-gray-300 mb-4">Your Points: {points !== undefined ? points : 'Loading...'}</p>
          <PointsForJointsOrderForm
            onOrderSubmit={handleOrderSubmit}
            userEmail={user.email}
            userPoints={points}
          />
        </>
      ) : (
        <p className="text-red-400">You must be logged in to redeem points.</p>
      )}
    </div>
  );
};

export default PointsForJointsPage;
