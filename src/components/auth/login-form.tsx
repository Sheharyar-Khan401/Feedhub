import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';
import { Box, IconButton, InputAdornment, Link, Stack, TextField, Alert } from '@mui/material';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { Iconify } from '../iconify';
import { AuthForm } from './auth-form';

// ----------------------------------------------------------------------

export function LoginForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/feedbacks');
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(
        err.code === 'auth/invalid-credential'
          ? 'Invalid email or password'
          : err.code === 'auth/too-many-requests'
          ? 'Too many failed attempts. Please try again later'
          : 'Login failed. Please try again'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <TextField
            name="email"
            label="Email address"
            type="email"
            required
            fullWidth
            autoComplete="email"
          />

          <TextField
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            required
            fullWidth
            autoComplete="current-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Link 
              variant="subtitle2" 
              underline="hover" 
              onClick={() => navigate('/reset-password')}
              sx={{ cursor: 'pointer' }}
            >
              Forgot password?
            </Link>
          </Box>

          <LoadingButton
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            loading={loading}
          >
            Login
          </LoadingButton>

          <Box sx={{ textAlign: 'center' }}>
            <Link variant="subtitle2" href="/register" underline="hover">
              Don&apos;t have an account? Sign up
            </Link>
          </Box>
        </Stack>
      </form>
  );
} 