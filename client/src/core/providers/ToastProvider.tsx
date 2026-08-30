/**
 * Toast Notification System
 * Seamless, non-intrusive notifications for user feedback
 */

'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  Slide,
  SlideProps,
  IconButton,
  Box,
  LinearProgress,
} from '@mui/material';
import {
  Close,
  CheckCircle,
  Error,
  Warning,
  Info,
} from '@mui/icons-material';

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'destructive';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
  action?: React.ReactNode;
  progress?: boolean;
}

interface ToastContextType {
  toast: (options: { title?: string; description: string; variant?: ToastType }) => void;
  showToast: (
    type: ToastType,
    message: string,
    options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>
  ) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  loading: (message: string) => string; // Returns toast ID
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (
      type: ToastType,
      message: string,
      options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>
    ) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const toast: Toast = {
        id,
        type,
        message,
        duration: options?.duration ?? 6000,
        title: options?.title,
        action: options?.action,
        progress: options?.progress,
      };

      setToasts((prev) => [...prev, toast]);

      // Auto-dismiss (unless it's a loading toast)
      if (!options?.progress && toast.duration) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, toast.duration);
      }

      return id;
    },
    []
  );

  const success = useCallback(
    (message: string, title?: string) => {
      showToast('success', message, { title });
    },
    [showToast]
  );

  const error = useCallback(
    (message: string, title?: string) => {
      showToast('error', message, { title, duration: 8000 });
    },
    [showToast]
  );

  const warning = useCallback(
    (message: string, title?: string) => {
      showToast('warning', message, { title, duration: 7000 });
    },
    [showToast]
  );

  const info = useCallback(
    (message: string, title?: string) => {
      showToast('info', message, { title });
    },
    [showToast]
  );

  const loading = useCallback(
    (message: string) => {
      return showToast('info', message, {
        progress: true,
        duration: undefined,
      });
    },
    [showToast]
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Shadcn/ui compatible toast function
  const toast = useCallback(
    (options: { title?: string; description: string; variant?: ToastType }) => {
      // Map 'destructive' to 'error' for compatibility
      const type = options.variant === 'destructive' ? 'error' : (options.variant || 'info');
      showToast(type, options.description, { title: options.title });
    },
    [showToast]
  );

  const handleClose = useCallback((id: string) => {
    dismiss(id);
  }, [dismiss]);

  return (
    <ToastContext.Provider
      value={{ toast, showToast, success, error, warning, info, loading, dismiss }}
    >
      {children}
      
      {/* Render toasts */}
      {toasts.map((toast, index) => (
        <Snackbar
          key={toast.id}
          open={true}
          TransitionComponent={SlideTransition}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          data-testid={`toast-${toast.type}`}
          sx={{
            bottom: `${index * 80 + 24}px !important`,
            transition: 'bottom 0.3s ease',
          }}
        >
          <Alert
            severity={toast.type === 'destructive' ? 'error' : toast.type}
            data-testid={`toast-alert-${toast.type}`}
            aria-live="polite"
            aria-atomic="true"
            icon={
              toast.type === 'success' ? <CheckCircle /> :
              (toast.type === 'error' || toast.type === 'destructive') ? <Error /> :
              toast.type === 'warning' ? <Warning /> :
              <Info />
            }
            action={
              <>
                {toast.action}
                <IconButton
                  size="small"
                  aria-label="close notification"
                  color="inherit"
                  onClick={() => handleClose(toast.id)}
                  data-testid="toast-close-button"
                >
                  <Close fontSize="small" />
                </IconButton>
              </>
            }
            sx={{
              width: '100%',
              minWidth: '300px',
              maxWidth: '500px',
              boxShadow: 4,
            }}
          >
            {toast.title && (
              <AlertTitle data-testid="toast-title">{toast.title}</AlertTitle>
            )}
            <span data-testid="toast-message">{toast.message}</span>
            {toast.progress && (
              <Box sx={{ mt: 1 }} data-testid="toast-progress">
                <LinearProgress />
              </Box>
            )}
          </Alert>
        </Snackbar>
      ))}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    const error: Error = new (globalThis.Error)('useToast must be used within a ToastProvider');
    throw error;
  }
  return context;
}

export default ToastProvider;
