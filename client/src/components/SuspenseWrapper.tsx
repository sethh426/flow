'use client';

import React, { Suspense, ReactNode } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface SuspenseWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  message?: string;
}

export default function SuspenseWrapper({
  children,
  fallback,
  message = 'Loading...'
}: SuspenseWrapperProps) {
  const defaultFallback = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200,
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
}

export { SuspenseWrapper };