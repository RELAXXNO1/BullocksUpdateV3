import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, UserX } from 'lucide-react';
import AccountDetailsModal from '../../components/auth/AccountDetailsModal';
import { Button } from '../../components/ui/Button';

export default function AccountManagement() {
  const { user, deleteAccount, logout } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      await logout();
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
    }
  };

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
          <h2 className="text-2xl font-bold mb-6 text-center">Account Management</h2>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-4">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <Link to="/" className="inline-block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg mb-4 text-center">
            Back to Store
          </Link>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Email</h3>
            <p className="text-gray-300">{user.email}</p>
          </div>

          <Button onClick={() => setIsModalOpen(true)} variant="secondary" className="w-full mb-4">
            View Account Details
          </Button>

          <div className="border-t border-slate-700 pt-6">
            <h3 className="text-lg font-semibold mb-2 text-red-500 flex items-center gap-2">
              <UserX className="h-5 w-5" /> Delete Account
            </h3>
            <p className="text-gray-400 mb-4">
              Deleting your account will permanently remove all your data.
            </p>
            <button
              onClick={() => setShowDeleteConfirmation(true)}
              className="w-full py-2 px-4 bg-red-600/10 border border-red-500/50 text-red-500 rounded-lg hover:bg-red-600/20 transition-colors"
            >
              Delete Account
            </button>
          </div>

          {showDeleteConfirmation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full">
                <div className="flex items-center justify-center mb-4">
                  <AlertTriangle className="h-12 w-12 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-center mb-4 text-red-500">
                  Confirm Account Deletion
                </h3>
                <p className="text-center text-gray-300 mb-6">
                  Are you sure you want to permanently delete your account? 
                  This action cannot be undone.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowDeleteConfirmation(false)}
                    className="flex-1 py-2 px-4 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
        <AccountDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </motion.div>
    </div>
  );
}
