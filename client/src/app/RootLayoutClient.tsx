'use client';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { usePathname } from 'next/navigation';
import theme from '@/theme';
import AppNavigation from '@/core/layout/AppNavigation';

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Pages that should NOT have navigation
  const noNavPages = ['/', '/login', '/signup', '/pricing'];
  const shouldShowNav = !noNavPages.includes(pathname);

  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {shouldShowNav ? (
          <AppNavigation>{children}</AppNavigation>
        ) : (
          children
        )}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}