import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/layout-optimized.css";
import "../styles/ui-fixes.css";
import "../styles/ui-enhancements.css";
import "../styles/mobile-optimizations.css";
import "../styles/flowbite-theme-override.css";
import "../styles/neumorphism.css";
import "../styles/typography.css";
import ClientLayout from "./ClientLayout";
import { FlowBotTasksProvider } from '@/contexts/FlowBotTasksContext';
import ErrorBoundary from "@/core/providers/ErrorBoundary";
import ToastProvider from "@/core/providers/ToastProvider";
import MuiThemeProvider from "@/core/providers/MuiThemeProvider";
import ApiInterceptorInit from "@/components/ApiInterceptorInit";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: 'swap',
  preload: false, // Only preload main font
});

export const metadata: Metadata = {
  title: "Affiliate Flow - AI-Powered Marketing Platform",
  description: "AI-powered affiliate product discovery and content generation with intelligent error handling",
  keywords: "affiliate marketing, AI content, product discovery, workflow automation",
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Affiliate Flow',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#667eea',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ApiInterceptorInit />
        <MuiThemeProvider>
          <ToastProvider>
            <ErrorBoundary
              autoRecover={true}
              recoveryAttempts={3}
            >
              <FlowBotTasksProvider>
                <ClientLayout>
                  {children}
                </ClientLayout>
              </FlowBotTasksProvider>
            </ErrorBoundary>
          </ToastProvider>
        </MuiThemeProvider>
      </body>
    </html>
  );
}