import { lazy, Suspense } from 'react';
import { Outlet, useRoutes } from 'react-router-dom';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { varAlpha } from 'src/theme/styles';
import { DashboardLayout } from 'src/layouts/dashboard';
import AddFeedback from 'src/pages/add-feedback';
import UpdateFeedback from 'src/pages/update-feedback';
import SurveyVote from 'src/pages/survey-vote';

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
  return useRoutes([
    {
      element: (
        <DashboardLayout>
          <Suspense fallback={renderFallback}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      ),
      children: [
        {
          element: <Feedbacks />,
          index: true,
        },
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
      ],
    },
  ]);
}
