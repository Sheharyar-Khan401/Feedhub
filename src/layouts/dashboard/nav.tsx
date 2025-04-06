import type { Theme, SxProps, Breakpoint } from '@mui/material/styles';

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import { useTheme } from '@mui/material/styles';
import ListItemButton from '@mui/material/ListItemButton';
import Drawer, { drawerClasses } from '@mui/material/Drawer';

import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { useAuth } from 'src/contexts/auth-context';

import { varAlpha } from 'src/theme/styles';

import { Logo } from 'src/components/logo';
import { Scrollbar } from 'src/components/scrollbar';

export type NavContentProps = {
  data: {
    path: string;
    title: string;
    icon: React.ReactNode;
    info?: React.ReactNode;
  }[];
  slots?: {
    topArea?: React.ReactNode;
    bottomArea?: {
      title: string;
      path: string;
      icon: React.ReactNode;
    };
  };
  sx?: SxProps<Theme>;
};

export function NavDesktop({
  sx,
  data,
  slots,
  layoutQuery,
}: NavContentProps & { layoutQuery: Breakpoint }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        pt: 2.5,
        px: 2.5,
        top: 0,
        left: 0,
        height: 1,
        display: 'none',
        position: 'fixed',
        flexDirection: 'column',
        bgcolor: 'var(--layout-nav-bg)',
        zIndex: 'var(--layout-nav-zIndex)',
        width: 'var(--layout-nav-vertical-width)',
        borderRight: `1px solid var(--layout-nav-border-color, ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)})`,
        [theme.breakpoints.up(layoutQuery)]: {
          display: 'flex',
        },
        ...sx,
      }}
    >
      <NavContent data={data} slots={slots} />
    </Box>
  );
}

// ----------------------------------------------------------------------

export function NavMobile({
  sx,
  data,
  open,
  slots,
  onClose,
}: NavContentProps & { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      sx={{
        [`& .${drawerClasses.paper}`]: {
          pt: 2.5,
          px: 2.5,
          overflow: 'unset',
          bgcolor: 'var(--layout-nav-bg)',
          width: 'var(--layout-nav-mobile-width)',
          ...sx,
        },
      }}
    >
      <NavContent data={data} slots={slots} />
    </Drawer>
  );
}

// ----------------------------------------------------------------------

export function NavContent({ data, slots, sx }: NavContentProps) {
  const pathname = usePathname();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const renderNavItem = (item: {
    path: string;
    title: string;
    icon: React.ReactNode;
    info?: React.ReactNode;
  }) => {
    const isActived = item.path === pathname;
    const isLogout = item.path === '/logout';

    return (
      <ListItem disableGutters disablePadding key={item.title}>
        <ListItemButton
          disableGutters
          component={isLogout ? 'div' : RouterLink}
          href={isLogout ? undefined : item.path}
          onClick={isLogout ? handleLogout : undefined}
          sx={{
            pl: 2,
            py: 1,
            gap: 2,
            pr: 1.5,
            borderRadius: 0.75,
            typography: 'body2',
            fontWeight: 'fontWeightMedium',
            color: isLogout ? 'error.main' : 'var(--layout-nav-item-color)',
            minHeight: 'var(--layout-nav-item-height)',
            ...(isActived && !isLogout && {
              fontWeight: 'fontWeightSemiBold',
              bgcolor: 'var(--layout-nav-item-active-bg)',
              color: 'var(--layout-nav-item-active-color)',
              '&:hover': {
                bgcolor: 'var(--layout-nav-item-hover-bg)',
              },
            }),
            ...(isLogout && {
              '&:hover': {
                bgcolor: 'error.lighter',
              },
            }),
          }}
        >
          <Box component="span" sx={{ width: 24, height: 24 }}>
            {item.icon}
          </Box>

          <Box component="span" flexGrow={1}>
            {item.title}
          </Box>

          {item.info && item.info}
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <>
      <Logo />

      {slots?.topArea}

      <Scrollbar fillContent>
        <Box component="nav" display="flex" flex="1 1 auto" flexDirection="column" sx={sx}>
          <Box component="ul" gap={0.5} display="flex" flexDirection="column">
            {data.map((item) => renderNavItem(item))}
          </Box>
        </Box>
      </Scrollbar>

      {slots?.bottomArea && (
        <Box sx={{ mt: 'auto', pb: 2 }}>
          {renderNavItem(slots.bottomArea)}
        </Box>
      )}
    </>
  );
}
