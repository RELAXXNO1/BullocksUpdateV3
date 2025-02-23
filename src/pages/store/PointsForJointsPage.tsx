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
  const { points, tier, expiresAt } = useUserPoints();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackEvent } = useAnalytics();

  const handleOrderSubmit = async (orderData: any) => {
    try {
      trackEvent('begin_checkout', {
        total_amount: 0, // Points for Joints is always free
        items: orderData.cart,
      });

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
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-6">
        Points for Joints Loyalty Program
      </h1>

      <div className="bg-gray-800/75 p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-semibold text-white mb-4">How it Works</h2>
        <p className="text-gray-300 mb-4">
          Earn <span className="font-bold">1 point</span> for every <span className="font-bold">$5</span> you spend
          on products (excluding items in the "Special" category).  Redeem your points for free joints!
        </p>
        <p className="text-gray-300">
          Your points expire <span className="font-bold">30 days</span> after they are earned.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-6 mb-4">Tier Benefits</h2>
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse border border-gray-700">
            <thead>
              <tr className="bg-gray-700 text-white">
                <th className="px-4 py-2 text-left">Tier</th>
                <th className="px-4 py-2 text-left">Points Required</th>
                <th className="px-4 py-2 text-left">Redemption</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="bg-gray-800">
                <td className="border border-gray-700 px-4 py-2">Basic</td>
                <td className="border border-gray-700 px-4 py-2">0+</td>
                <td className="border border-gray-700 px-4 py-2">8 points for a pre-roll</td>
              </tr>
              <tr className="bg-gray-900">
                <td className="border border-gray-700 px-4 py-2">Silver</td>
                <td className="border border-gray-700 px-4 py-2">250+</td>
                <td className="border border-gray-700 px-4 py-2">7 points to redeem</td>
              </tr>
              <tr className="bg-gray-800">
                <td className="border border-gray-700 px-4 py-2">Gold</td>
                <td className="border border-gray-700 px-4 py-2">500+</td>
                <td className="border border-gray-700 px-4 py-2">6 points to redeem</td>
              </tr>
              <tr className="bg-gray-900">
                <td className="border border-gray-700 px-4 py-2">Platinum</td>
                <td className="border border-gray-700 px-4 py-2">1000+</td>
                <td className="border border-gray-700 px-4 py-2">5 points to redeem</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {user ? (
        <div className="bg-gray-800/75 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-3">Redeem Points</h2>
          <p className="text-gray-300 mb-4">
            Your Points: {points !== undefined ? points : 'Loading...'} |  Tier: {tier}  {expiresAt && (
              <span className="ml-2 text-sm text-gray-400">
                (Expires: {expiresAt.toLocaleDateString()})
              </span>
            )}
          </p>
          <PointsForJointsOrderForm
            onOrderSubmit={handleOrderSubmit}
            userEmail={user.email}
          />
        </div>
      ) : (
        <p className="text-red-400 bg-gray-800/75 p-6 rounded-lg shadow-lg">You must be logged in to redeem points.</p>
      )}
    </div>
  );
};

export default PointsForJointsPage;
