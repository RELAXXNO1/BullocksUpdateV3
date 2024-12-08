import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  console.log('🔒 Protected Route Check', { 
    user, 
    loading, 
    isAdmin: user?.isAdmin 
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user || !user.isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}