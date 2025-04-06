import type { BoxProps } from '@mui/material/Box';
import type { Breakpoint } from '@mui/material/styles';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

import { layoutClasses } from 'src/layouts/classes';
import { Container } from '@mui/material';

// ----------------------------------------------------------------------

type MainProps = BoxProps & {
  layoutQuery: Breakpoint;
};

export function Main({ sx, children, layoutQuery, ...other }: MainProps) {
  const theme = useTheme();

  const renderContent = (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems:"center",
      }}
    >
      {children}
    </Container>
  );

  return (
    <Box
      component="main"
      className={layoutClasses.main}
      sx={{
        display: 'flex',
        flex: '1 1 auto',
        alignItems: 'center',
        flexDirection: 'column',
        height: "100vh",
        p: theme.spacing(3, 2, 10, 2),
        [theme.breakpoints.up(layoutQuery)]: {
          justifyContent: 'center',
          p: theme.spacing(10, 0, 10, 0),
        },
        ...sx,
      }}
      {...other}
    >
      {renderContent}
    </Box>
  );
}
