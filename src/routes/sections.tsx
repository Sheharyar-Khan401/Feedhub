import { lazy, Suspense } from 'react';
import { Outlet, useRoutes, Navigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { varAlpha } from 'src/theme/styles';
import { DashboardLayout } from 'src/layouts/dashboard';
import { AuthLayout } from 'src/layouts/auth';
import { SimpleLayout } from 'src/layouts/simple';
import { ProtectedRoute } from 'src/components/auth/protected-route';
import { useAuth } from 'src/contexts/auth-context';
import AddFeedback from 'src/pages/add-feedback';
import UpdateFeedback from 'src/pages/update-feedback';
import SurveyVote from 'src/pages/survey-vote';
import { AuthForm } from 'src/components/auth/auth-form';
import { RegisterForm } from 'src/components/auth/register-form';
import { LoginForm } from 'src/components/auth/login-form';
import { ResetPasswordForm } from 'src/components/auth/reset-password-form';

export const HomePage = lazy(() => import('src/pages/home'));
export const Feedbacks = lazy(() => import('src/pages/feedbacks'));

const renderFallback = (
  <Box display="flex" alignItems="center" justifyContent="center" flex="1 1 auto">
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

export function Router() {
  const { user, loading } = useAuth();
  const routes = useRoutes([
    // Public routes
    {
      element: (
        <SimpleLayout>
          <Suspense fallback={renderFallback}>
            <Outlet />
          </Suspense>
        </SimpleLayout>
      ),
      children: [
        {
          path: '/',
          element: user ? <Navigate to="/feedbacks" replace /> : <Navigate to="/login" replace />,
        },
      ],
    },
    // Auth routes
    {
      element: (
        <AuthLayout>
          <Suspense fallback={renderFallback}>
            <Outlet />
          </Suspense>
        </AuthLayout>
      ),
      children: [
        {
          path: 'register',
          element: <AuthForm formtype="register" title="Create account!" children={<RegisterForm />} />,
        },
        {
          path: 'login',
          element: <AuthForm formtype="login" title="Welcome!" children={<LoginForm />} />,
        },
        {
          path: 'reset-password',
          element: <AuthForm formtype="reset" title="Reset Password" children={<ResetPasswordForm />} />,
        },
      ],
    },
    // Protected routes
    {
      element: (
        <ProtectedRoute>
          <DashboardLayout>
            <Suspense fallback={renderFallback}>
              <Outlet />
            </Suspense>
          </DashboardLayout>
        </ProtectedRoute>
      ),
      children: [
        {
          path: 'feedbacks',
          element: <Feedbacks />,
        },
        {
          path: 'add-feedback',
          element: <AddFeedback />,
        },
        {
          path: 'update-feedback/:id',
          element: <UpdateFeedback />,
        },
        {
          path: 'survey/:id',
          element: <SurveyVote />,
        },
        {
          path: '/',
          element: <Navigate to="/feedbacks" replace />,
        },
      ],
    },
  ]);

  if (loading) {
    return renderFallback;
  }

  return routes;
}
