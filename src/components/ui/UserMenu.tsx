import { Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ReactDOM from 'react-dom';

interface UserMenuProps {
    isOpen: boolean;
    onClose: () => void;
    closeMenu: () => void;
    showAdminLink?: boolean;
}

export default function UserMenu({ isOpen, onClose, closeMenu, showAdminLink }: UserMenuProps) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return null;
  }

    const ModalContent = () => {
        return (
            <div className="fixed top-0 mt-2 z-[3000]" style={{left: 'calc(100vw - 256px - 1rem)'}}>
                <div className="bg-dark-600/50 backdrop-blur-xl rounded-super-elegant shadow-super-elegant border border-dark-400/30 p-4 relative overflow-hidden shadow-[0_0_20px_theme(colors.teal.500)]">
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-transparent to-teal-500/5" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.teal.500/0.1),transparent_70%)]" />
                    <div className="relative z-10">
                        <button onClick={() => {
                            closeMenu();
                        }} className="absolute top-2 right-2 text-gray-400 hover:text-gray-300 focus:outline-none" aria-label="Close modal">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        {user && (
                            <>
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
                                <a
                                    href="mailto:high10.verify@gmail.com"
                                    className="block px-4 py-2 text-white hover:bg-dark-500 rounded-md mt-2"
                                >
                                </a>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };

  return (
    <div className="relative">
      <button
        onClick={onClose}
        className="group relative flex items-center justify-center text-secondary-400 hover:text-primary-400 transition-all duration-200 px-3 py-2 -m-2 hover:bg-dark-600/20 rounded-lg cursor-pointer 
                  before:absolute before:inset-0 before:bg-primary-500/10 before:opacity-0 before:transition-opacity before:rounded-lg
                  hover:before:opacity-100 
                  active:before:opacity-20"
      >
        <Menu className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
      </button>
        {isOpen && ReactDOM.createPortal(<ModalContent />, document.body)}
    </div>
  );
}
