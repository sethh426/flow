'use client';

import React from 'react';
import { Skeleton, Box, Card, CardContent, Stack } from '@mui/material';

interface SkeletonLoaderProps {
  variant?: 'card' | 'list' | 'table' | 'grid' | 'dashboard';
  count?: number;
}

export function CardSkeleton() {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 2 }} />
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="text" width="90%" />
          <Skeleton variant="text" width="80%" />
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <Stack spacing={2}>
      {Array.from({ length: count }).map((_, index) => (
        <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Skeleton variant="circular" width={48} height={48} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="40%" height={24} />
            <Skeleton variant="text" width="70%" height={20} />
          </Box>
          <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
        </Box>
      ))}
    </Stack>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Stack spacing={1}>
      {/* Header */}
      <Box sx={{ display: 'flex', gap: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Skeleton variant="text" width="25%" height={24} />
        <Skeleton variant="text" width="25%" height={24} />
        <Skeleton variant="text" width="25%" height={24} />
        <Skeleton variant="text" width="25%" height={24} />
      </Box>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, index) => (
        <Box key={index} sx={{ display: 'flex', gap: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Skeleton variant="text" width="25%" />
          <Skeleton variant="text" width="25%" />
          <Skeleton variant="text" width="25%" />
          <Skeleton variant="text" width="25%" />
        </Box>
      ))}
    </Stack>
  );
}

export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
      {Array.from({ length: count }).map((_, index) => (
        <Box key={index}>
          <CardSkeleton />
        </Box>
      ))}
    </Box>
  );
}

export function DashboardSkeleton() {
  return (
    <Stack spacing={3}>
      {/* Header Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Box key={index}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="60%" height={20} />
                <Skeleton variant="text" width="40%" height={40} sx={{ mt: 1 }} />
                <Skeleton variant="text" width="50%" height={16} sx={{ mt: 0.5 }} />
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Charts */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        <Box>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="30%" height={28} />
              <Skeleton variant="rectangular" height={300} sx={{ mt: 2, borderRadius: 2 }} />
            </CardContent>
          </Card>
        </Box>
        <Box>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="50%" height={28} />
              <Stack spacing={2} sx={{ mt: 2 }}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Skeleton variant="rectangular" width={40} height={40} sx={{ borderRadius: 1 }} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="60%" />
                      <Skeleton variant="text" width="40%" />
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Stack>
  );
}

export default function SkeletonLoader({ variant = 'card', count = 1 }: SkeletonLoaderProps) {
  switch (variant) {
    case 'list':
      return <ListSkeleton count={count} />;
    case 'table':
      return <TableSkeleton rows={count} />;
    case 'grid':
      return <GridSkeleton count={count} />;
    case 'dashboard':
      return <DashboardSkeleton />;
    case 'card':
    default:
      return (
        <Stack spacing={3}>
          {Array.from({ length: count }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </Stack>
      );
  }
}
