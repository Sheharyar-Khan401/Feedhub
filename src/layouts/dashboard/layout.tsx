import type { Theme, SxProps, Breakpoint } from '@mui/material/styles';
import { Typography } from '@mui/material';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import { getGreeting } from '@/utils/helpers';

import { Main } from './main';
import { layoutClasses } from '../classes';
import { NavMobile, NavDesktop } from './nav';
import { navData, bottomNavData } from '../config-nav-dashboard';
import { MenuButton } from '../components/menu-button';
import { LayoutSection } from '../core/layout-section';
import { HeaderSection } from '../core/header-section';
import { useAuth } from '../../contexts/auth-context';
// ----------------------------------------------------------------------

export type DashboardLayoutProps = {
  sx?: SxProps<Theme>;
  children: React.ReactNode;
  header?: {
    sx?: SxProps<Theme>;
  };
};

export function DashboardLayout({ sx, children, header }: DashboardLayoutProps) {
  const theme = useTheme();
  const { user } = useAuth();
  const [navOpen, setNavOpen] = useState(false);

  const layoutQuery: Breakpoint = 'lg';

  return (
    <LayoutSection
      /** **************************************
       * Header
       *************************************** */
      headerSection={
        <HeaderSection
          layoutQuery={layoutQuery}
          slotProps={{
            container: {
              maxWidth: false,
              sx: { px: { [layoutQuery]: 5 } },
            },
          }}
          sx={header?.sx}
          slots={{
            topArea: (
              <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
                This is an info Alert.
              </Alert>
            ),
            leftArea: (
              <>
                <MenuButton
                  onClick={() => setNavOpen(true)}
                  sx={{
                    ml: -1,
                    [theme.breakpoints.up(layoutQuery)]: { display: 'none' },
                  }}
                />
                <NavMobile 
                  data={navData} 
                  open={navOpen} 
                  onClose={() => setNavOpen(false)} 
                  slots={{ bottomArea: bottomNavData }}
                />
              </>
            ),
            rightArea: (
              <Box 
                gap={1} 
                display="flex" 
                alignItems="center"
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  backgroundColor: 'action.hover',
                  '&:hover': {
                    backgroundColor: 'action.selected',
                  }
                }}
              >
                {/* <AccountPopover /> */}
                <Box display="flex" alignItems="center" gap={1} sx={{ fontSize: '1.2rem' }}>
                  {getGreeting()}, <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.4rem' }}>{user?.displayName?? user?.email?.split('@')[0]}</Typography>
                </Box>
              </Box>
            ),
          }}
        />
      }
      /** **************************************
       * Sidebar
       *************************************** */
      sidebarSection={
        <NavDesktop 
          data={navData} 
          layoutQuery={layoutQuery} 
          slots={{ bottomArea: bottomNavData }}
        />
      }
      /** **************************************
       * Footer
       *************************************** */
      footerSection={null}
      /** **************************************
       * Style
       *************************************** */
      cssVars={{
        '--layout-nav-vertical-width': '300px',
        '--layout-dashboard-content-pt': theme.spacing(1),
        '--layout-dashboard-content-pb': theme.spacing(8),
        '--layout-dashboard-content-px': theme.spacing(5),
      }}
      sx={{
        [`& .${layoutClasses.hasSidebar}`]: {
          [theme.breakpoints.up(layoutQuery)]: {
            pl: 'var(--layout-nav-vertical-width)',
          },
        },
        ...sx,
      }}
    >
      <Main>{children}</Main>
    </LayoutSection>
  );
}
