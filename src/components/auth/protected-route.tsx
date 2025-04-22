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
    // Extract survey ID from the path if it's a survey route
    const isSurveyRoute = location.pathname.startsWith('/survey/');
    const surveyId = isSurveyRoute ? location.pathname.split('/')[2] : null;
    
    // Redirect to login page but save the attempted location and survey ID
    return <Navigate to="/login" state={{ from: location, surveyId }} replace />;
  }

  return <>{children}</>;
} 