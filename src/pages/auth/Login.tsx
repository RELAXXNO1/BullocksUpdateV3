import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader } from 'lucide-react';
import { BackButton } from '../../components/ui/BackButton';
import { motion } from 'framer-motion';
import { LOGO_PATH } from '../../config/constants';
import { PasswordInput } from '../../components/ui/PasswordInput';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { isAdmin } = await login(email, password);
      navigate(isAdmin ? '/admin/dashboard' : '/');
    } catch (err) {
      setError('Invalid login credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-dark-600 via-dark-500 to-dark-600" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,theme(colors.teal.500/0.15),transparent)] pointer-events-none" />
      <div className="absolute top-4 left-4">
        <BackButton to="/" label="Back to Store" />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      > 
        <div className="bg-dark-600/50 backdrop-blur-xl rounded-2xl shadow-super-elegant border border-dark-400/30 p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-transparent to-teal-500/5" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.teal.500/0.1),transparent_70%)]" />
          <div className="relative z-10">
            <div className="text-center mb-8">
              <img 
                src={LOGO_PATH}
                alt="Bullocks Smoke Shop"
                className="h-24 mx-auto mb-6"
              />
              <h2 className="text-3xl font-display font-bold mb-2 bg-gradient-to-r from-teal-300 via-teal-400 to-teal-300 bg-clip-text text-transparent">
                Welcome Back
              </h2>
              <p className="text-gray-400 mt-2">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-red-500/10 border border-red-500/50 rounded-lg p-3"
                >
                  <p className="text-red-500 text-sm">{error}</p>
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-dark-500/50 border border-dark-400/30 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 shadow-[0_0_15px_rgba(20,184,166,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.4)]"
              >
                {loading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-teal-400 hover:text-teal-300">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}