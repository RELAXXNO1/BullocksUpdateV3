import { Menu, Clock, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ReactDOM from 'react-dom';
import { useUserPoints } from '../../hooks/useUserPoints';
import { useRef, useEffect, useState } from 'react';

interface UserMenuProps {
    isOpen: boolean;
    onClose: () => void;
    closeMenu: () => void;
    showAdminLink?: boolean;
}

export default function UserMenu({ isOpen, onClose, closeMenu, showAdminLink }: UserMenuProps) {
    const { user, logout } = useAuth();
    const { points, expiresAt, tier } = useUserPoints();
    const [showModal, setShowModal] = useState(false);
    const modalContentRef = useRef<HTMLDivElement>(null);

    const handleLogout = () => {
        logout();
    };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return 'text-gray-400'; // Platinum color
      case 'gold':
        return 'text-yellow-400'; // Gold color
      case 'silver':
        return 'text-gray-300'; // Silver color
      default:
        return 'text-amber-700'; // Default to amber/bronze
    }
  };

    const PointsModal = () => {
        return (
            <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-[5000] bg-black bg-opacity-50" >
                <div className="bg-dark-600/50 backdrop-blur-xl rounded-super-elegant shadow-super-elegant border border-dark-400/30 p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-transparent to-teal-500/5" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.teal.500/0.1),transparent_70%)]" />
                    <div className="relative z-10">
                        <h2 className="text-lg font-bold mb-4 text-white">Points for Joints</h2>
                        <p className="text-gray-300 mb-4 text-sm">
                            Earn <span className="font-bold">1 point</span> for every <span className="font-bold">$5</span> spent.
                            Redemption rates:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 mb-4 text-sm">
              <li>Basic: 8 points for a free joint</li>
              <li>Silver: 7 points for a free joint</li>
              <li>Gold: 6 points for a free joint</li>
              <li>Platinum: 5 points for a free premium joint</li>
            </ul>
                        <p className="text-gray-300 text-sm">
                            Must be 21+ to purchase or receive any products.
                        </p>
                        <button
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors duration-200 mt-4"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        )
    }


    const ModalContent = () => {
        return (
            <div className="fixed top-0 mt-2 z-[3000] " style={{ left: 'calc(100vw - 256px - 1rem)', display: isOpen ? 'block' : 'none' }} ref={modalContentRef}>
                <div className="bg-dark-600/50 backdrop-blur-xl rounded-super-elegant shadow-super-elegant border border-dark-400/30 p-4 relative overflow-hidden shadow-[0_0_20px_theme(colors.teal.500)]">
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-transparent to-teal-500/5" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.teal.500/0.1),transparent_70%)]" />
                    <div className="relative z-10">
                        {/* Removed close button */}
                        {user && (
                            <>
                                <div className="relative">
                                <Link
                                    to="/points-for-joints"
                                  className={`group block px-3 py-2 rounded-full relative overflow-hidden transition-all duration-200 
                                    ${points !== undefined && points >= 5
                                      ? 'text-green-500 hover:text-white hover:bg-green-500  cursor-pointer'
                                      : 'text-white hover:bg-dark-500  cursor-not-allowed'}`}
                                    onClick={(e) => {
                                        if (points !== undefined && points >= 5) {
                                            closeMenu();
                                        } else {
                                            e.preventDefault();
                                            setShowModal(true);
                                        }
                                    }}

                                >
                    Points for Joints ({points === undefined ? '0' : points})
                    {expiresAt && (
                      <span className="ml-1 text-xs text-gray-400">
                        <Clock className="inline-block w-3 h-3 mr-1" />
                        {expiresAt.toLocaleDateString()}
                      </span>
                    )}
                    <span className={`ml-1 ${getTierColor(tier || 'basic')}`}>
                      <Award className="inline-block w-4 h-4" />
                      {tier}
                    </span>
                                     <span className={`absolute inset-0 w-full h-full border border-teal-500 rounded-full transform origin-left transition-transform duration-200 ease-in-out
                                        ${points !== undefined && points >= 5 ? 'group-hover:scale-100' : 'group-hover:scale-100'}
                                        scale-0
                                    `}
        aria-hidden="true"
      />
                                </Link>
                                </div>
                                <Link
                                    to="/account"
                                    className="block px-4 py-2 text-white hover:bg-dark-500 rounded-md"
                                    onClick={closeMenu}
                                >
                                    Account Details
                                </Link>
                                <Link
                                    to="/account/orders"
                                    className="block px-4 py-2 text-white hover:bg-dark-500 rounded-md mt-2"
                                    onClick={closeMenu}
                                >
                                    View Past Orders
                                </Link>
                                {showAdminLink && user.isAdmin && (
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
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (isOpen && menuRef.current && !menuRef.current.contains(event.target as Node) && !(modalContentRef.current && modalContentRef.current.contains(event.target as Node))) {
          console.log("Closing menu");
          onClose();
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen, onClose]);

  const menuRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={onClose}
        className="group relative flex items-center justify-center text-secondary-400 hover:text-primary-400 transition-all duration-200 px-3 py-2 -m-2 hover:bg-dark-600/20 rounded-lg cursor-pointer 
                  before:absolute before:inset-0 before:bg-primary-500/10 before:opacity-0 before:transition-opacity before:rounded-lg
                  hover:before:opacity-100 
                  active:before:opacity-20"
      >
        <Menu className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
      </button>
      {user ? ReactDOM.createPortal(<ModalContent />, document.body) : null}
      {showModal && ReactDOM.createPortal(<PointsModal />, document.body)}
    </div>
  );
}
