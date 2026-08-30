/**
 * Simple Test Page - Minimal Error Handling Test
 */

'use client';

import { useToast } from '@/core/providers/ToastProvider';
import { Button, Box, Typography } from '@mui/material';

export default function SimpleTest() {
  const toast = useToast();

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Simple Toast Test
      </Typography>
      <Button 
        variant="contained" 
        onClick={() => toast.success('It works!')}
      >
        Test Toast
      </Button>
    </Box>
  );
}
