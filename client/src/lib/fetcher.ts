/**
 * Network-Aware Fetcher
 * Intelligent API calls with retry, caching, and offline support
 */

'use client';

interface FetchOptions extends Omit<RequestInit, 'cache'> {
  retry?: number;
  retryDelay?: number;
  timeout?: number;
  cache?: boolean | RequestCache;
  cacheDuration?: number;
  offlineFallback?: any;
}

interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
}

class NetworkAwareFetcher {
  private cache: Map<string, CacheEntry> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();

  /**
   * Enhanced fetch with retry, timeout, and caching
   */
  async fetch(url: string, options: FetchOptions = {}): Promise<any> {
    const {
      retry = 3,
      retryDelay = 1000,
      timeout = 30000,
      cache = true,
      cacheDuration = 5 * 60 * 1000, // 5 minutes
      offlineFallback,
      ...fetchOptions
    } = options;

    // Check cache first
    if (cache && fetchOptions.method === 'GET') {
      const cached = this.getFromCache(url);
      if (cached) {
        console.log(`📦 Cache hit: ${url}`);
        return cached;
      }
    }

    // Check if request is already pending (prevents duplicate requests)
    if (this.pendingRequests.has(url)) {
      console.log(`⏳ Request already pending: ${url}`);
      return this.pendingRequests.get(url);
    }

    // Check network status
    if (!navigator.onLine && offlineFallback !== undefined) {
      console.log(`📴 Offline: returning fallback for ${url}`);
      return offlineFallback;
    }

    // Create promise for this request
    const requestPromise = this.executeRequest(
      url,
      fetchOptions,
      retry,
      retryDelay,
      timeout
    );

    this.pendingRequests.set(url, requestPromise);

    try {
      const data = await requestPromise;

      // Cache successful GET requests
      if (cache && fetchOptions.method === 'GET') {
        this.setCache(url, data, cacheDuration);
      }

      return data;
    } finally {
      this.pendingRequests.delete(url);
    }
  }

  /**
   * Execute request with retry logic
   */
  private async executeRequest(
    url: string,
    options: RequestInit,
    retries: number,
    retryDelay: number,
    timeout: number
  ): Promise<any> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`🔄 Retry attempt ${attempt}/${retries} for ${url}`);
          await this.delay(retryDelay * Math.pow(2, attempt - 1)); // Exponential backoff
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          return await response.json();
        }

        return await response.text();
      } catch (error: any) {
        lastError = error;

        // Don't retry on certain errors
        if (
          error.name === 'AbortError' ||
          error.message.includes('400') ||
          error.message.includes('401') ||
          error.message.includes('403') ||
          error.message.includes('404')
        ) {
          throw error;
        }

        // Continue to next retry
        console.warn(`❌ Request failed (attempt ${attempt + 1}/${retries + 1}):`, error.message);
      }
    }

    throw lastError || new Error('Request failed after all retries');
  }

  /**
   * Get from cache
   */
  private getFromCache(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  /**
   * Set cache
   */
  private setCache(key: string, data: any, duration: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + duration,
    });
  }

  /**
   * Clear cache
   */
  clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * GET request
   */
  async get(url: string, options?: Omit<FetchOptions, 'method'>): Promise<any> {
    return this.fetch(url, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post(url: string, body: any, options?: Omit<FetchOptions, 'method' | 'body'>): Promise<any> {
    return this.fetch(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(body),
    });
  }

  /**
   * PUT request
   */
  async put(url: string, body: any, options?: Omit<FetchOptions, 'method' | 'body'>): Promise<any> {
    return this.fetch(url, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(body),
    });
  }

  /**
   * DELETE request
   */
  async delete(url: string, options?: Omit<FetchOptions, 'method'>): Promise<any> {
    return this.fetch(url, { ...options, method: 'DELETE' });
  }

  /**
   * Batch requests (parallel with limit)
   */
  async batch(requests: Array<() => Promise<any>>, concurrency = 5): Promise<any[]> {
    const results: any[] = [];
    const executing: Promise<any>[] = [];

    for (const request of requests) {
      const promise = request().then((result) => {
        executing.splice(executing.indexOf(promise), 1);
        return result;
      });

      results.push(promise);
      executing.push(promise);

      if (executing.length >= concurrency) {
        await Promise.race(executing);
      }
    }

    return Promise.all(results);
  }
}

// Export singleton instance
export const fetcher = new NetworkAwareFetcher();

export default fetcher;
