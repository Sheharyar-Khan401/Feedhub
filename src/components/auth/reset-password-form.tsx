import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';
import { Box, Stack, TextField, Alert, Typography } from '@mui/material';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase';
import { AuthForm } from './auth-form';

export function ResetPasswordForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err: any) {
      console.error('Password reset failed:', err);
      setError(
        err.code === 'auth/user-not-found'
          ? 'No account found with this email address'
          : 'Failed to send password reset email. Please try again.'
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

        {success ? (
          <>
            <Alert severity="success">
              Password reset email sent! Please check your inbox.
            </Alert>
            <Typography variant="body2" color="text.secondary" align="center">
              We&apos;ve sent you an email with instructions to reset your password.
              Please check your inbox and follow the link provided.
            </Typography>
            <LoadingButton
              fullWidth
              size="large"
              variant="contained"
              onClick={() => navigate('/login')}
            >
              Return to Login
            </LoadingButton>
          </>
        ) : (
          <>
            <TextField
              name="email"
              label="Email address"
              type="email"
              required
              fullWidth
              autoComplete="email"
            />

            <LoadingButton
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              loading={loading}
            >
              Reset Password
            </LoadingButton>

            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="body2"
                color="text.secondary"
                onClick={() => navigate('/login')}
                sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              >
                Back to login
              </Typography>
            </Box>
          </>
        )}
      </Stack>
    </form>
  );
} 