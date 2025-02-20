import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

export default function ProtectedRoute({ children, requiredRole = 'user' }: ProtectedRouteProps) {
  const { user, loading, initialLoadingComplete, isLoggedIn } = useAuth();

  console.log('🔒 Protected Route Check', {
    user,
    loading,
    isAdmin: user?.isAdmin,
    requiredRole,
    initialLoadingComplete,
    isLoggedIn
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  console.log('🔒 Protected Route - Before user check', { user, loading, initialLoadingComplete, isLoggedIn });

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!loading && requiredRole === 'admin' && !user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
