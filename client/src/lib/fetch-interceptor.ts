// Global Fetch Interceptor
// Automatically intercepts all fetch calls and routes them through our API client

import { apiFetch } from './api-client';

// Store original fetch
const originalFetch = window.fetch;

// Override global fetch
window.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  
  // Only intercept API calls
  if (url.startsWith('/api/')) {
    return apiFetch(url, init);
  }
  
  // Use original fetch for everything else
  return originalFetch(input, init);
};

export {}; // Make this a module
