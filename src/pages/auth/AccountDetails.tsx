import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

export default function AccountDetails() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-xl ring-1 ring-white/10 p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Account Details</h2>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <User className="h-5 w-5" /> Email
            </h3>
            <p className="text-gray-300">{user.email}</p>
          </div>
          <Link to="/" className="inline-block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg mb-4 text-center">
            Back to Store
          </Link>
          <button
            onClick={logout}
            className="mt-2 w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg"
          >
            Log Out
          </button>
        </div>
      </motion.div>
    </div>
  );
}
