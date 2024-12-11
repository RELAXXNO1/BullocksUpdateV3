import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

export default function ProtectedRoute({ children, requiredRole = 'admin' }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  console.log('🔒 Protected Route Check', { 
    user, 
    loading, 
    isAdmin: user?.isAdmin 
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'admin' && !user.isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}