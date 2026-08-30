'use client';

import { Box, Typography, Button } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';

interface EmptyStateProps {
  icon: SvgIconComponent;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 8,
        px: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 300,
      }}
    >
      <Icon
        sx={{
          fontSize: 80,
          color: 'text.disabled',
          mb: 2,
          opacity: 0.5,
        }}
      />
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          fontWeight: 600,
          color: 'text.primary',
          mb: 1,
        }}
      >
        {title}
      </Typography>
      <Typography
        color="text.secondary"
        sx={{
          mb: 3,
          maxWidth: 400,
          fontSize: '0.95rem',
        }}
      >
        {description}
      </Typography>
      {actionLabel && onAction && (
        <Button
          variant="contained"
          onClick={onAction}
          startIcon={actionIcon}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
