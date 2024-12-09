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
    <header className="bg-dark-600/50 backdrop-blur-sm border-b border-dark-400/30 px-6 py-4 sticky top-0 z-40">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img 
            src={LOGO_PATH}
            alt="Bullocks Smoke Shop" 
            className="h-16 w-auto object-contain" 
          />
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 hover:bg-dark-500 rounded-lg transition-colors text-secondary-300 hover:text-white"
            >
              <Store className="h-4 w-4" />
              View Store
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 hover:bg-dark-500 rounded-lg transition-colors text-secondary-300 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}