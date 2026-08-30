'use client';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { softMuiTheme } from '@/lib/mui-soft-theme';

export default function MuiThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={softMuiTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
