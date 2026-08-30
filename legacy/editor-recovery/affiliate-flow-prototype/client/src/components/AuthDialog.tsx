'use client';

import React, { useState } from 'react';
import { useToast } from '@/components/ToastProvider';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  Google as GoogleIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { signUpWithEmail, signInWithEmail, signInWithGoogle } from '@/lib/auth';

interface AuthDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthDialog({ open, onClose, onSuccess }: AuthDialogProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const handleEmailAuth = async () => {
    setError('');
    
    // Validation
    if (!email || !password) {
      toast.warning('Please fill in all fields');
      return;
    }
    
    if (isSignUp && password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (isSignUp && password.length < 6) {
      toast.warning('Password must be at least 6 characters');
      return;
    }

    const loadingId = toast.loading(isSignUp ? 'Creating your account...' : 'Signing in...');
    setLoading(true);

    try {
      const result = isSignUp 
        ? await signUpWithEmail(email, password)
        : await signInWithEmail(email, password);

      if (result.error) {
        toast.dismiss(loadingId);
        toast.error('Authentication failed', result.error);
        setError(result.error);
      } else {
        console.log('Auth success:', result.user);
        toast.dismiss(loadingId);
        toast.success(
          isSignUp ? 'Account created!' : 'Welcome back!',
          `Signed in as ${email}`
        );
        onSuccess?.();
        onClose();
      }
    } catch (err: any) {
      toast.dismiss(loadingId);
      toast.error('Authentication failed', err.message);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    const loadingId = toast.loading('Signing in with Google...');
    setLoading(true);

    try {
      const result = await signInWithGoogle();
      
      if (result.error) {
        toast.dismiss(loadingId);
        toast.error('Google sign-in failed', result.error);
        setError(result.error);
      } else {
        console.log('Google auth success:', result.user);
        toast.dismiss(loadingId);
        toast.success('Signed in with Google!', `Welcome ${result.user?.email}`);
        onSuccess?.();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight="bold">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Google Sign-In */}
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleAuth}
            disabled={loading}
            sx={{ mb: 2, py: 1.5 }}
          >
            Continue with Google
          </Button>

          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          {/* Email/Password Form */}
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            sx={{ mb: 2 }}
          />

          {isSignUp && (
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              sx={{ mb: 2 }}
            />
          )}

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleEmailAuth}
            disabled={loading}
            sx={{ py: 1.5, mb: 2 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : isSignUp ? (
              'Create Account'
            ) : (
              'Sign In'
            )}
          </Button>

          {/* Toggle Sign Up/Sign In */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <Button
                variant="text"
                size="small"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
                disabled={loading}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </Button>
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
