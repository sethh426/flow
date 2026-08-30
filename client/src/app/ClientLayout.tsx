'use client';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { QueryClient } from '@tanstack/query-core';
import { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import toast, { Toaster } from 'react-hot-toast';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { FlowBotOnboarding } from '@/features/workflow/flowbot-onboarding';
import ErrorBoundary from '@/components/ErrorBoundary';
import AppShell from '@/components/Navigation/AppShell';

// Dynamically import components that use window/browser APIs
const FlowAssistant = dynamic(() => import('@/features/workflow/FlowAssistant'), { 
  ssr: false,
  loading: () => null 
});

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicPage = pathname === '/' || pathname?.startsWith('/auth');

  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: 1,
        onError: (error) => {
          console.error('Mutation error:', error);
          toast.error(error instanceof Error ? error.message : 'An error occurred');
        },
      },
    },
  }));

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider>
            <AuthProvider>
              <FlowBotOnboarding />
              <Suspense fallback={<PageLoader />}>
                {isPublicPage ? (
                  children
                ) : (
                  <AppShell>{children}</AppShell>
                )}
              </Suspense>
              <FlowAssistant />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#1f2937',
                    color: '#fff',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                  },
                  success: {
                    duration: 2500,
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 4000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </AuthProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}