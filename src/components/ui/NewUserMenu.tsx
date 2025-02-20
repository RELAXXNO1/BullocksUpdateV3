import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from './Badge';
import PointsForJointsOrderForm from '../store/PointsForJointsOrderForm';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { addOrder } from '../../lib/firebase';
import { db } from '../../lib/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { Menu } from 'lucide-react'; // Import Menu


interface UserMenuProps {
  isOpen: boolean;
  onClose: () => void;
  closeMenu: () => void;
  showAdminLink?: boolean;
  points?: number;
}

export default function NewUserMenu({ isOpen, onClose, closeMenu, showAdminLink, points }: UserMenuProps) {
  const { user, logout } = useAuth();
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);
  const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const root = document.createElement('div');
    document.body.appendChild(root);
    setModalRoot(root);

    return () => {
      document.body.removeChild(root);
    };
  }, []);

  const handleLogout = () => {
    logout();
    closeMenu();
  };

  if (!user) {
    return null;
  }

  const handlePointsForJointsClick = () => {
    if (points !== undefined && points >= 5) {
      setIsPointsModalOpen(true);
    }
    closeMenu();
  };

  const handleOrderSubmit = async (orderData: any) => {
    try {
      await addOrder({
        name: orderData.name,
        phone: orderData.phone,
        email: orderData.email,
        shippingAddress: orderData.shippingAddress,
        cart: orderData.cart,
        total: 0,
        orderId: generateOrderId(),
        timestamp: new Date().toISOString(),
        type: orderData.type,
      });

      await deductPointsFromUser(user.uid, 5);

      console.log('Points for Joints Order Data:', orderData);
      setIsPointsModalOpen(false);
      alert("Successfully created order for Points for Joints");

    } catch (error: any) {
      console.error("Error creating Points for Joints order:", error);
      alert("Failed to create Points for Joints order: " + error.message);
    }
  };

  const deductPointsFromUser = async (userId: string, pointsToDeduct: number) => {
    const userPointsDocRef = doc(db, 'userPoints', userId);
    const userPointsDoc = await getDoc(userPointsDocRef);

    if (userPointsDoc.exists()) {
      const currentPoints = userPointsDoc.data().points || 0;
      const newPoints = Math.max(0, currentPoints - pointsToDeduct);
      await updateDoc(userPointsDocRef, { points: newPoints });
    } else {
      await setDoc(userPointsDocRef, { points: 0, email: user.email });
    }
  };

  const generateOrderId = (): string => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `PFJ-${timestamp}-${randomStr}`.toUpperCase();
  };

  const ModalContent = () => {
    return (
      <>
        <div
          className={`fixed top-0 mt-2 z-[3000] bg-dark-600/50 backdrop-blur-xl rounded-super-elegant shadow-super-elegant border border-dark-400/30 p-4 relative overflow-hidden shadow-[0_0_20px_theme(colors.teal.500)] ${isOpen ? 'block' : 'hidden'}`}
          style={{
            left: 'calc(100vw - 256px - 1rem)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-transparent to-teal-500/5" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.teal.500/0.1),transparent_70%)]" />
          <div className="relative z-10">
            {user && (
              <>
                <Link
                  to="/account"
                  className="block px-4 py-2 text-white hover:bg-dark-500 rounded-md"
                  onClick={closeMenu}
                >
                  Account Details
                  {points != null && <Badge className="ml-2">{points} Points</Badge>}
                </Link>
                <Link
                  to="/account/orders"
                  className="block px-4 py-2 text-white hover:bg-dark-500 rounded-md mt-2"
                  onClick={closeMenu}
                >
                  View Past Orders
                </Link>
                <button
                  onClick={handlePointsForJointsClick}
                  className={`block px-4 py-2 text-white hover:bg-dark-500 rounded-md mt-2 ${points === undefined || points < 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={points === undefined || points < 5}
                >
                  PointsForJoints {points !== undefined ? `(${points})` : ''}
                </button>

                {user?.isAdmin && (
                  <Link
                    to="/admin"
                    onClick={closeMenu}
                    className="block px-4 py-2 text-white hover:bg-dark-500 rounded-md mt-2"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block px-4 py-2 text-white hover:bg-dark-500 rounded-md mt-2"
                >
                  Log Out
                </button>
                <a
                  href="mailto:high10.verify@gmail.com"
                  className="block px-4 py-2 text-white hover:bg-dark-500 rounded-md mt-2"
                >
                </a>
              </>
            )}
          </div>
        </div>
        {isPointsModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold text-white mb-4">Redeem Points for Joints</h3>
              <PointsForJointsOrderForm
                onOrderSubmit={handleOrderSubmit}
                userEmail={user.email}
                userPoints={points}
              />
              <button
                onClick={() => setIsPointsModalOpen(false)}
                className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </>
    );
  };

  return modalRoot ? (
    createPortal(<ModalContent />, modalRoot)
  ) : (
    <div className="relative">
      <button
        onClick={onClose}
        className="group relative flex items-center justify-center text-secondary-400 hover:text-primary-400 transition-all duration-200 px-3 py-2 -m-2 hover:bg-dark-600/20 rounded-lg cursor-pointer 
                        before:absolute before:inset-0 before:bg-primary-500/10 before:opacity-0 before:transition-opacity before:rounded-lg
                        hover:before:opacity-100 
                        active:before:opacity-20"
        style={{ zIndex: 3000 }}
      >
        <Menu className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
      </button>
    </div>
  );
}