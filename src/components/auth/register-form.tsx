import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';
import { Box, IconButton, InputAdornment, Link, Stack, TextField, Alert } from '@mui/material';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { Iconify } from '../iconify';
import { AuthForm } from './auth-form';

// ----------------------------------------------------------------------

export function RegisterForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        fullName,
        email,
        createdAt: new Date(),
      });

      // Navigate to the dashboard
      navigate('/feedbacks');
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(
        err.code === 'auth/email-already-in-use'
          ? 'This email is already registered. Please try logging in instead.'
          : 'Registration failed. Please try again.'
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
            name="fullName"
            label="Full name"
            required
            fullWidth
          />

          <TextField
            name="email"
            label="Email address"
            type="email"
            required
            fullWidth
          />

          <TextField
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            required
            fullWidth
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

          <LoadingButton
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            loading={loading}
          >
            Create account
          </LoadingButton>

          <Box sx={{ textAlign: 'center' }}>
            <Link variant="subtitle2" href="/login" underline="hover">
              Already have an account? Sign in
            </Link>
          </Box>
        </Stack>
      </form>
  );
} 