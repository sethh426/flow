/**
 * Advanced Error Boundary with Auto-Recovery
 * Inspired by Jam - catches errors, logs them, and recovers gracefully
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  Collapse,
  IconButton,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Refresh,
  BugReport,
  ExpandMore,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Home,
} from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  autoRecover?: boolean;
  recoveryAttempts?: number;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
  isRecovering: boolean;
  showDetails: boolean;
  recoveryAttempt: number;
  lastErrorTime: number;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  private recoveryTimer: NodeJS.Timeout | null = null;
  private errorLogQueue: Array<{ error: Error; errorInfo: ErrorInfo; timestamp: number }> = [];

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      isRecovering: false,
      showDetails: false,
      recoveryAttempt: 0,
      lastErrorTime: 0,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const now = Date.now();
    const timeSinceLastError = now - this.state.lastErrorTime;

    // Log error
    this.logError(error, errorInfo);

    // Update state
    this.setState((prevState) => ({
      errorInfo,
      errorCount: timeSinceLastError < 5000 ? prevState.errorCount + 1 : 1,
      lastErrorTime: now,
    }));

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Attempt auto-recovery if enabled
    if (this.props.autoRecover !== false) {
      this.attemptAutoRecovery();
    }
  }

  componentWillUnmount() {
    if (this.recoveryTimer) {
      clearTimeout(this.recoveryTimer);
    }
  }

  /**
   * Log error to backend/console
   */
  private logError(error: Error, errorInfo: ErrorInfo) {
    const errorLog = {
      error,
      errorInfo,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorId: this.state.errorId,
    };

    // Add to queue
    this.errorLogQueue.push(errorLog);

    // Console log for development
    console.error('🐛 Error Boundary Caught:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
    });

    // Send to backend (in production)
    if (process.env.NODE_ENV === 'production') {
      this.sendErrorToBackend(errorLog);
    }
  }

  /**
   * Send error to backend for tracking
   */
  private async sendErrorToBackend(errorLog: any) {
    try {
      await fetch('/api/errors/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errorId: errorLog.errorId,
          message: errorLog.error.message,
          stack: errorLog.error.stack,
          componentStack: errorLog.errorInfo.componentStack,
          timestamp: errorLog.timestamp,
          userAgent: errorLog.userAgent,
          url: errorLog.url,
          severity: this.getErrorSeverity(errorLog.error),
        }),
      });
    } catch (err) {
      console.error('Failed to send error to backend:', err);
    }
  }

  /**
   * Determine error severity
   */
  private getErrorSeverity(error: Error): 'critical' | 'high' | 'medium' | 'low' {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'medium'; // Network errors are usually recoverable
    }
    if (message.includes('undefined') || message.includes('null')) {
      return 'high'; // Null pointer errors
    }
    if (message.includes('auth') || message.includes('permission')) {
      return 'critical'; // Auth errors
    }
    return 'low';
  }

  /**
   * Attempt automatic recovery
   */
  private attemptAutoRecovery() {
    const maxAttempts = this.props.recoveryAttempts || 3;
    
    if (this.state.recoveryAttempt >= maxAttempts) {
      console.warn('Max recovery attempts reached');
      return;
    }

    this.setState({ isRecovering: true });

    // Progressive delay: 1s, 2s, 4s
    const delay = Math.min(1000 * Math.pow(2, this.state.recoveryAttempt), 4000);

    this.recoveryTimer = setTimeout(() => {
      this.handleReset();
    }, delay);
  }

  /**
   * Reset error state and attempt recovery
   */
  private handleReset = () => {
    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      isRecovering: false,
      recoveryAttempt: prevState.recoveryAttempt + 1,
      showDetails: false,
    }));

    // Clear any cached data that might be causing issues
    if (typeof window !== 'undefined') {
      // Clear component cache (if React is caching)
      sessionStorage.removeItem('component-cache');
    }
  };

  /**
   * Manual reset (user clicked retry)
   */
  private handleManualReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isRecovering: false,
      recoveryAttempt: 0,
      errorCount: 0,
      showDetails: false,
    });
  };

  /**
   * Navigate to home
   */
  private handleGoHome = () => {
    window.location.href = '/';
  };

  /**
   * Toggle error details
   */
  private toggleDetails = () => {
    this.setState((prevState) => ({ showDetails: !prevState.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, isRecovering, showDetails, errorCount, errorId } = this.state;
      const severity = error ? this.getErrorSeverity(error) : 'low';

      // If recovering, show minimal UI
      if (isRecovering) {
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
              p: 3,
            }}
          >
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h6" color="text.secondary">
              Recovering from error...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Attempt {this.state.recoveryAttempt} of {this.props.recoveryAttempts || 3}
            </Typography>
          </Box>
        );
      }

      // Full error UI
      return (
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Card elevation={3}>
            <CardContent sx={{ p: 4 }}>
              {/* Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box
                  sx={{
                    bgcolor: severity === 'critical' ? '#f4433620' : '#ff980020',
                    color: severity === 'critical' ? '#f44336' : '#ff9800',
                    p: 2,
                    borderRadius: 2,
                  }}
                >
                  <BugReport fontSize="large" />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" fontWeight="bold">
                    Oops! Something went wrong
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Don't worry, we're fixing it automatically
                  </Typography>
                </Box>
                <Chip
                  label={severity.toUpperCase()}
                  size="small"
                  sx={{
                    bgcolor: severity === 'critical' ? '#f4433620' : '#ff980020',
                    color: severity === 'critical' ? '#f44336' : '#ff9800',
                  }}
                />
              </Box>

              {/* Status Alert */}
              <Alert
                severity={errorCount > 3 ? 'error' : 'warning'}
                icon={errorCount > 3 ? <ErrorIcon /> : <Warning />}
                sx={{ mb: 3 }}
              >
                {errorCount > 3 ? (
                  <>
                    <strong>Multiple errors detected.</strong> Please try refreshing the page or contact support.
                  </>
                ) : (
                  <>
                    <strong>We detected an issue.</strong> Our system is attempting to recover automatically.
                  </>
                )}
              </Alert>

              {/* Error Message */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Error Message:
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: 'monospace',
                    bgcolor: '#f5f5f5',
                    p: 2,
                    borderRadius: 1,
                    color: '#f44336',
                  }}
                >
                  {error?.message || 'Unknown error'}
                </Typography>
              </Box>

              {/* Error ID */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Error ID: <strong>{errorId}</strong>
                </Typography>
              </Box>

              {/* Actions */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={this.handleManualReset}
                  fullWidth
                >
                  Try Again
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Home />}
                  onClick={this.handleGoHome}
                  fullWidth
                >
                  Go Home
                </Button>
              </Box>

              {/* Technical Details (Collapsible) */}
              <Box>
                <Button
                  onClick={this.toggleDetails}
                  startIcon={<ExpandMore sx={{ transform: showDetails ? 'rotate(180deg)' : 'none' }} />}
                  size="small"
                  sx={{ mb: 1 }}
                >
                  {showDetails ? 'Hide' : 'Show'} Technical Details
                </Button>
                <Collapse in={showDetails}>
                  <Card variant="outlined" sx={{ bgcolor: '#fafafa', p: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                      Stack Trace:
                    </Typography>
                    <Typography
                      variant="caption"
                      component="pre"
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        maxHeight: '200px',
                        overflow: 'auto',
                        mb: 2,
                      }}
                    >
                      {error?.stack || 'No stack trace available'}
                    </Typography>

                    {errorInfo?.componentStack && (
                      <>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                          Component Stack:
                        </Typography>
                        <Typography
                          variant="caption"
                          component="pre"
                          sx={{
                            fontFamily: 'monospace',
                            fontSize: '11px',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            maxHeight: '200px',
                            overflow: 'auto',
                          }}
                        >
                          {errorInfo.componentStack}
                        </Typography>
                      </>
                    )}
                  </Card>
                </Collapse>
              </Box>

              {/* Auto-Recovery Info */}
              {this.props.autoRecover !== false && (
                <Alert severity="info" icon={<CheckCircle />} sx={{ mt: 3 }}>
                  <strong>Auto-recovery enabled.</strong> The page will automatically retry in a few seconds.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Container>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

export default ErrorBoundary;
