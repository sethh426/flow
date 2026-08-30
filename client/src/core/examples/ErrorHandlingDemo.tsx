/**
 * Error Handling System Demo
 * Demonstrates all error recovery features
 */

'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Divider,
  Alert,
} from '@mui/material';
import {
  BugReport,
  Refresh,
  NetworkCheck,
  CloudOff,
  CheckCircle,
} from '@mui/icons-material';
import { useToast } from '@/core/providers/ToastProvider';
import { useErrorRecovery, useNetworkStatus, useSafeAsync } from '@/hooks/useErrorRecovery';
import { fetcher } from '@/lib/fetcher';
import ErrorBoundary from '@/components/ErrorBoundary';
import { SuspenseWrapper } from '@/components/SuspenseWrapper';

// Component that throws an error for testing
function BuggyComponent({ shouldError }: { shouldError: boolean }) {
  if (shouldError) {
    throw new Error('Simulated component error - testing auto-recovery!');
  }
  return (
    <Alert severity="success" icon={<CheckCircle />}>
      <Typography variant="body2">
        ✅ Component is working! Error recovery successful.
      </Typography>
    </Alert>
  );
}

export default function ErrorHandlingDemo() {
  const toast = useToast();
  const isOnline = useNetworkStatus();
  const [throwError, setThrowError] = useState(false);
  const [apiEndpoint, setApiEndpoint] = useState('/api/test');

  // Demo: useErrorRecovery hook
  const {
    execute: fetchData,
    data,
    loading,
    error,
    hasError,
    retryCount,
    canRetry,
    reset,
  } = useErrorRecovery(
    async () => {
      const response = await fetcher.get(apiEndpoint, {
        retry: 3,
        retryDelay: 1000,
      });
      return response;
    },
    {
      maxRetries: 3,
      retryDelay: 1000,
      fallbackValue: { cached: true, message: 'Using cached data' },
    }
  );

  // Demo: useSafeAsync hook
  const asyncData = useSafeAsync(
    async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { timestamp: Date.now(), status: 'loaded' };
    },
    []
  );

  // Demo handlers
  const handleToastDemo = (type: 'success' | 'error' | 'warning' | 'info') => {
    const messages = {
      success: 'Workflow saved successfully!',
      error: 'Failed to connect to server',
      warning: 'This action cannot be undone',
      info: 'New feature available in settings',
    };
    
    const titles = {
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Info',
    };

    toast[type](messages[type], titles[type]);
  };

  const handleLoadingToast = async () => {
    const loadingId = toast.loading('Processing your request...');
    
    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    toast.dismiss(loadingId);
    toast.success('Processing complete!');
  };

  const handleErrorBoundaryTest = () => {
    setThrowError(true);
    setTimeout(() => setThrowError(false), 100);
  };

  const handleApiRetryTest = async () => {
    setApiEndpoint('/api/nonexistent-endpoint');
    await fetchData();
  };

  const handleNetworkTest = () => {
    if (isOnline) {
      toast.info('You are online! Network calls will work.');
    } else {
      toast.warning('You are offline. Using cached data.');
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        🛡️ Error Handling System Demo
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Test all error recovery features - auto-retry, error boundaries, toasts, network detection
      </Typography>

      <Stack spacing={3}>
        {/* Network Status */}
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <NetworkCheck color={isOnline ? 'success' : 'error'} />
              <Typography variant="h6">Network Status</Typography>
              <Chip
                label={isOnline ? 'Online' : 'Offline'}
                color={isOnline ? 'success' : 'error'}
                size="small"
              />
            </Stack>
            <Button
              variant="outlined"
              onClick={handleNetworkTest}
              startIcon={<NetworkCheck />}
            >
              Check Network
            </Button>
          </CardContent>
        </Card>

        {/* Toast Notifications Demo */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🎉 Toast Notifications
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Click buttons to see different notification types
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleToastDemo('success')}
              >
                Success Toast
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => handleToastDemo('error')}
              >
                Error Toast
              </Button>
              <Button
                variant="contained"
                color="warning"
                onClick={() => handleToastDemo('warning')}
              >
                Warning Toast
              </Button>
              <Button
                variant="contained"
                color="info"
                onClick={() => handleToastDemo('info')}
              >
                Info Toast
              </Button>
              <Button
                variant="outlined"
                onClick={handleLoadingToast}
              >
                Loading Toast (3s)
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Error Boundary Demo */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🐛 Error Boundary (Auto-Recovery)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Throws an error that will auto-recover in 1-4 seconds
            </Typography>
            
            <ErrorBoundary>
              <Box sx={{ mb: 2 }}>
                <BuggyComponent shouldError={throwError} />
              </Box>
            </ErrorBoundary>

            <Button
              variant="contained"
              color="error"
              onClick={handleErrorBoundaryTest}
              startIcon={<BugReport />}
            >
              Trigger Component Error
            </Button>
          </CardContent>
        </Card>

        {/* API Retry Demo */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🔄 Auto-Retry API Calls
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Attempts 3 retries with exponential backoff (1s, 2s, 4s)
            </Typography>

            {loading && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Loading... (Retry attempt: {retryCount})
              </Alert>
            )}

            {hasError && error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Error:</strong> {error.message}
                </Typography>
                <Typography variant="caption">
                  Retries: {retryCount} | Can retry: {canRetry ? 'Yes' : 'No'}
                </Typography>
              </Alert>
            )}

            {data && !loading && (
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  {data.cached ? '📦 Cached data loaded' : '✅ Fresh data loaded'}
                </Typography>
                <Typography variant="caption" component="pre">
                  {JSON.stringify(data, null, 2)}
                </Typography>
              </Alert>
            )}

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                onClick={handleApiRetryTest}
                disabled={loading}
                startIcon={<Refresh />}
              >
                Test API Retry
              </Button>
              {hasError && (
                <Button variant="outlined" onClick={reset}>
                  Reset
                </Button>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Async Hook Demo */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ⚡ Safe Async Hook
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Demonstrates useSafeAsync with automatic cleanup
            </Typography>

            <SuspenseWrapper>
              {asyncData.loading ? (
                <Alert severity="info">Loading async data...</Alert>
              ) : asyncData.error ? (
                <Alert severity="error">{asyncData.error.message}</Alert>
              ) : (
                <Alert severity="success">
                  <Typography variant="body2">
                    Loaded at: {new Date(asyncData.data?.timestamp || 0).toLocaleTimeString()}
                  </Typography>
                  <Typography variant="caption">
                    Status: {asyncData.data?.status}
                  </Typography>
                </Alert>
              )}
            </SuspenseWrapper>
          </CardContent>
        </Card>

        {/* System Summary */}
        <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ✅ System Status
            </Typography>
            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.2)' }} />
            <Stack spacing={1}>
              <Chip
                label="✅ Error Boundaries Active"
                sx={{ bgcolor: 'success.main', color: 'white' }}
              />
              <Chip
                label="✅ Auto-Recovery Enabled (3 attempts)"
                sx={{ bgcolor: 'success.main', color: 'white' }}
              />
              <Chip
                label="✅ Toast Notifications Ready"
                sx={{ bgcolor: 'success.main', color: 'white' }}
              />
              <Chip
                label={`✅ Network: ${isOnline ? 'Online' : 'Offline'}`}
                sx={{ bgcolor: isOnline ? 'success.main' : 'warning.main', color: 'white' }}
              />
              <Chip
                label="✅ Smart Fetcher with Retry Logic"
                sx={{ bgcolor: 'success.main', color: 'white' }}
              />
              <Chip
                label="✅ Error Logging to Backend"
                sx={{ bgcolor: 'success.main', color: 'white' }}
              />
            </Stack>

            <Typography variant="caption" sx={{ display: 'block', mt: 2, opacity: 0.8 }}>
              💰 Cost: $0/month (vs Jam&apos;s $79-299/month)
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
