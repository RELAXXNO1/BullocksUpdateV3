import { useState } from 'react';
import AccountLayout from '../../components/layouts/AccountLayout';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AlertTriangle, Mail, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/Alert';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/use-toast';

const AccountDetailsPage = () => {
  const { user, deleteAccount, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailChangeError, setEmailChangeError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false); // Added loading state for delete button

  const handleDeleteAccount = async () => {
    setDeleteLoading(true); // Set loading to true when delete starts
    try {
      await deleteAccount();
      await logout();
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
    } finally {
      setDeleteLoading(false); // Set loading back to false when delete finishes (success or error)
    }
  };

  const handleChangeEmail = async () => {
    setIsChangingEmail(true);
    setEmailChangeError('');
    if (!newEmail) {
      setEmailChangeError('Please enter a new email address.');
      setIsChangingEmail(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setEmailChangeError('Please enter a valid email address.');
      setIsChangingEmail(false);
      return;
    }

    try {
      await (user as any)?.updateEmail(newEmail); // casting user to any to avoid typescript error
      toast('Email updated successfully!', 'success');
      // You might want to re-fetch user data or reload the page here
    } catch (err) {
      setEmailChangeError(err instanceof Error ? err.message : 'Failed to update email');
    } finally {
      setIsChangingEmail(false);
    }
  };


  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <AccountLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Account Details</h1>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-lg p-6 shadow-md mb-6">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5" /> Email
          </h2>
          <p className="text-gray-300 mb-4">{user.email}</p>

          {!isChangingEmail ? (
            <Button onClick={() => setIsChangingEmail(true)} variant="secondary">
              Change Email
            </Button>
          ) : (
            <div className="space-y-4 mt-4">
              <Input 
                type="email" 
                placeholder="New email address" 
                value={newEmail} 
                onChange={(e) => setNewEmail(e.target.value)} 
                error={emailChangeError} // Corrected error prop
              />
              {emailChangeError && (
                <p className="text-red-400 text-sm flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                  {emailChangeError}
                </p>
              )}
              <div className="flex gap-2">
                <Button onClick={handleChangeEmail} disabled={isChangingEmail}>
                  {isChangingEmail ? 'Loading...' : 'Confirm Change'}
                </Button>
                <Button variant="ghost" onClick={() => setIsChangingEmail(false)} disabled={isChangingEmail}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>


        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-lg p-6 shadow-md mb-6">
          <Link to="/account/orders" className="inline-block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-center">
            View Past Orders
          </Link>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-lg p-6 shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-red-500 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" /> Delete Account
          </h2>
          <p className="text-gray-400 mb-4">
            Permanently remove your account and all your data.
          </p>
          <Button
            onClick={() => setShowDeleteConfirmation(true)}
            variant="destructive"
            disabled={deleteLoading} // Use deleteLoading state to disable button
          >
            {deleteLoading ? 'Loading...' : 'Delete Account'}
          </Button>
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
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteConfirmation(false)}
                  disabled={deleteLoading} // Disable cancel button during deletion as well
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading} // Disable delete button during deletion
                >
                  {deleteLoading ? 'Loading...' : 'Delete'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </AccountLayout>
  );
};

export default AccountDetailsPage;
