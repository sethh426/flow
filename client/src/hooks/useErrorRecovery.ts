/**
 * Error Recovery Hook
 * Provides utilities for graceful error handling and recovery
 */

'use client';

import { useState, useCallback, useEffect } from 'react';

interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorCount: number;
  lastErrorTime: number;
}

interface UseErrorRecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: Error) => void;
  fallbackValue?: any;
}

export function useErrorRecovery<T>(
  asyncFunction: () => Promise<T>,
  options: UseErrorRecoveryOptions = {}
) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onError,
    fallbackValue = null,
  } = options;

  const [state, setState] = useState<ErrorState>({
    hasError: false,
    error: null,
    errorCount: 0,
    lastErrorTime: 0,
  });

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const execute = useCallback(async () => {
    setLoading(true);

    try {
      const result = await asyncFunction();
      setData(result);
      setState({
        hasError: false,
        error: null,
        errorCount: 0,
        lastErrorTime: 0,
      });
      setRetryCount(0);
      return result;
    } catch (error: any) {
      const now = Date.now();
      
      setState((prev) => ({
        hasError: true,
        error,
        errorCount: prev.errorCount + 1,
        lastErrorTime: now,
      }));

      if (onError) {
        onError(error);
      }

      // Auto-retry if under max retries
      if (retryCount < maxRetries) {
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
          execute();
        }, retryDelay * Math.pow(2, retryCount)); // Exponential backoff
      } else {
        setData(fallbackValue);
      }

      throw error;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction, retryCount, maxRetries, retryDelay, onError, fallbackValue]);

  const reset = useCallback(() => {
    setState({
      hasError: false,
      error: null,
      errorCount: 0,
      lastErrorTime: 0,
    });
    setRetryCount(0);
    setData(null);
  }, []);

  return {
    execute,
    reset,
    data,
    loading,
    error: state.error,
    hasError: state.hasError,
    errorCount: state.errorCount,
    retryCount,
    canRetry: retryCount < maxRetries,
  };
}

/**
 * Safe async hook - wraps async operations with error handling
 */
export function useSafeAsync<T>(
  asyncFunction: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const execute = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await asyncFunction();
        
        if (mounted) {
          setData(result);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err);
          console.error('useSafeAsync error:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    execute();

    return () => {
      mounted = false;
    };
  }, dependencies);

  return { data, error, loading };
}

/**
 * Retry hook - provides retry functionality
 */
export function useRetry(maxRetries = 3) {
  const [retryCount, setRetryCount] = useState(0);

  const retry = useCallback(() => {
    if (retryCount < maxRetries) {
      setRetryCount((prev) => prev + 1);
      return true;
    }
    return false;
  }, [retryCount, maxRetries]);

  const reset = useCallback(() => {
    setRetryCount(0);
  }, []);

  return {
    retry,
    reset,
    retryCount,
    canRetry: retryCount < maxRetries,
    retriesLeft: maxRetries - retryCount,
  };
}

/**
 * Network status hook - detects online/offline
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export default useErrorRecovery;
