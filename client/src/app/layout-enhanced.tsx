/**
 * Enhanced Root Layout with Error Handling and Toast Notifications
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientLayout from './ClientLayout';
import ErrorBoundary from '@/core/providers/ErrorBoundary';
import ToastProvider from '@/core/providers/ToastProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Affiliate Flow - Sales Workflow Automation',
  description: 'Intelligent sales workflow automation for 6+ business verticals',
  keywords: 'sales automation, workflow, dropshipping, real estate, automotive, CRM',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary
          autoRecover={true}
          recoveryAttempts={3}
          onError={(error, errorInfo) => {
            // Log to analytics/monitoring
            console.error('App-level error:', error, errorInfo);
          }}
        >
          <ToastProvider>
            <ClientLayout>{children}</ClientLayout>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
