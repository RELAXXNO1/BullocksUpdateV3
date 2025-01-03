import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Store } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { LOGO_PATH } from '../../config/constants';

export default function AdminHeader() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');  
  };

  return (
    <header className="bg-dark-600/50 backdrop-blur-sm border-b border-dark-400/30 px-3 sm:px-6 py-3 sm:py-4 sticky top-0 z-50 h-[60px]">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img 
            src={LOGO_PATH}
            alt="High10 Wellness" 
            className="h-12 sm:h-16 w-auto object-contain drop-shadow-[0_0_8px_theme(colors.teal.500)]"
          />
          <h1 className="text-lg sm:text-xl font-bold hidden sm:block">Admin Dashboard</h1>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 px-2 sm:px-4 py-2 hover:bg-dark-500 rounded-lg transition-colors text-secondary-300 hover:text-white text-sm sm:text-base"
            >
              <Store className="h-4 w-4" />
              <span className="hidden sm:inline">View Store</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-2 sm:px-4 py-2 hover:bg-dark-500 rounded-lg transition-colors text-secondary-300 hover:text-white text-sm sm:text-base"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
