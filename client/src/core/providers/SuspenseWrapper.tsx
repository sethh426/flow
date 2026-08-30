/**
 * Suspense Wrapper with Loading States
 * Provides seamless loading experiences
 */

'use client';

import React, { Suspense } from 'react';
import {
  Box,
  CircularProgress,
  Skeleton,
  Typography,
  LinearProgress,
} from '@mui/material';

interface SuspenseWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  type?: 'spinner' | 'skeleton' | 'linear' | 'minimal';
  message?: string;
}

/**
 * Spinner Loading
 */
const SpinnerFallback = ({ message }: { message?: string }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      gap: 2,
    }}
  >
    <CircularProgress size={50} />
    {message && (
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    )}
  </Box>
);

/**
 * Skeleton Loading (for cards/lists)
 */
const SkeletonFallback = () => (
  <Box sx={{ p: 3 }}>
    <Skeleton variant="rectangular" height={60} sx={{ mb: 2, borderRadius: 1 }} />
    <Skeleton variant="rectangular" height={200} sx={{ mb: 2, borderRadius: 1 }} />
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Skeleton variant="rectangular" height={100} sx={{ flex: 1, borderRadius: 1 }} />
      <Skeleton variant="rectangular" height={100} sx={{ flex: 1, borderRadius: 1 }} />
      <Skeleton variant="rectangular" height={100} sx={{ flex: 1, borderRadius: 1 }} />
    </Box>
  </Box>
);

/**
 * Linear Progress Loading
 */
const LinearFallback = ({ message }: { message?: string }) => (
  <Box sx={{ width: '100%' }}>
    <LinearProgress />
    {message && (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          {message}
        </Typography>
      </Box>
    )}
  </Box>
);

/**
 * Minimal Loading (just a small indicator)
 */
const MinimalFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
    <CircularProgress size={24} />
  </Box>
);

export function SuspenseWrapper({
  children,
  fallback,
  type = 'spinner',
  message,
}: SuspenseWrapperProps) {
  // Use custom fallback if provided
  if (fallback) {
    return <Suspense fallback={fallback}>{children}</Suspense>;
  }

  // Use type-based fallback
  let defaultFallback: React.ReactNode;

  switch (type) {
    case 'skeleton':
      defaultFallback = <SkeletonFallback />;
      break;
    case 'linear':
      defaultFallback = <LinearFallback message={message} />;
      break;
    case 'minimal':
      defaultFallback = <MinimalFallback />;
      break;
    case 'spinner':
    default:
      defaultFallback = <SpinnerFallback message={message} />;
  }

  return <Suspense fallback={defaultFallback}>{children}</Suspense>;
}

/**
 * Page-level Suspense (for route transitions)
 */
export function PageSuspense({ children }: { children: React.ReactNode }) {
  return (
    <SuspenseWrapper type="linear" message="Loading page...">
      {children}
    </SuspenseWrapper>
  );
}

/**
 * Component-level Suspense (for lazy-loaded components)
 */
export function ComponentSuspense({ children }: { children: React.ReactNode }) {
  return (
    <SuspenseWrapper type="skeleton">
      {children}
    </SuspenseWrapper>
  );
}

/**
 * Data-level Suspense (for API calls)
 */
export function DataSuspense({ children, message }: { children: React.ReactNode; message?: string }) {
  return (
    <SuspenseWrapper type="spinner" message={message || 'Loading data...'}>
      {children}
    </SuspenseWrapper>
  );
}

export default SuspenseWrapper;
