import { Box, Card, CardContent, Stack, Typography, useTheme, useMediaQuery } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Iconify } from '../iconify';

// ----------------------------------------------------------------------

type Props = {
  title: string;
  children: React.ReactNode;
  formtype: string;
};

export function AuthForm({ title, children, formtype }: Props) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  return (
      <Card
        sx={{
          width: 1,
          maxWidth: { xs: 420, md: 500 },
          boxShadow: (themeObj) => themeObj.customShadows.z24,
          position: 'relative',
          zIndex: 1,
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
          backdropFilter: 'blur(8px)',
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
          justifyContent: "center",
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={3}>
            <Box sx={{ textAlign: 'center', justifyContent:"center", mb: { xs: 2, md: 3 } }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <Iconify
                  icon={formtype === 'login' ? 'mdi:login' : 'mdi:account-plus'}
                  sx={{
                    width: 32,
                    height: 32,
                    color: theme.palette.primary.main,
                  }}
                />
              </Box>
              <Typography 
                variant={isDesktop ? 'h3' : 'h4'} 
                sx={{ 
                  mb: 1, 
                  fontWeight: 'fontWeightBold',
                  fontSize: { xs: '1.5rem', md: '2rem' }
                }}
              >
                {title}
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'text.secondary',
                  fontSize: { xs: '0.875rem', md: '1rem' }
                }}
              >
                {formtype === 'login' ? 'Sign in to your account' : 'Create your account to get started'}
              </Typography>
            </Box>
            {children}
          </Stack>
        </CardContent>
      </Card>
  );
}