import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/auth-context';

type Props = {
  children: React.ReactNode;
};

export function ProtectedRoute({ children }: Props) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null; // or a loading spinner
  }

  if (!user) {
    // Redirect to login page but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
} 