'use client';

import { useEffect } from 'react';
import { apiFetch } from '@/lib/api-client';

export default function ApiInterceptorInit() {
  useEffect(() => {
    // Store original fetch
    const originalFetch = window.fetch;

    // Override global fetch for API calls only
    window.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      
      // Intercept API calls
      if (url.startsWith('/api/')) {
        return apiFetch(url, init);
      }
      
      // Use original fetch for everything else
      return originalFetch(input, init);
    };

    // Cleanup on unmount
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null; // This component doesn't render anything
}
