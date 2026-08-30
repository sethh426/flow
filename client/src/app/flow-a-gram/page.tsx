'use client';

import { Box, Typography, CircularProgress } from '@mui/material';

export default function ContentStudioPage() {
  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <CircularProgress />
      <Typography sx={{ mt: 2 }}>Content Studio - Coming Soon</Typography>
    </Box>
  );
}
