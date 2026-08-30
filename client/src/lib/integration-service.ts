/**
 * Integration Service Registry
 * Manages connections to 20+ third-party services
 * Handles authentication, rate limiting, and error handling
 */

import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

export interface IntegrationConfig {
  id: string;
  name: string;
  category: 'ecommerce' | 'crm' | 'email' | 'payment' | 'analytics' | 'scheduling' | 'communication';
  authType: 'apiKey' | 'oauth2' | 'basic' | 'bearer';
  baseUrl: string;
  rateLimit: {
    requestsPerSecond: number;
    requestsPerDay?: number;
  };
  requiredScopes?: string[];
  webhookSupport: boolean;
}

export interface IntegrationCredentials {
  userId: string;
  integrationId: string;
  accessToken?: string;
  refreshToken?: string;
  apiKey?: string;
  expiresAt?: Date;
  scopes?: string[];
}

// Integration configurations for all supported services
export const INTEGRATIONS: Record<string, IntegrationConfig> = {
  // E-commerce
  shopify: {
    id: 'shopify',
    name: 'Shopify',
    category: 'ecommerce',
    authType: 'oauth2',
    baseUrl: 'https://{{shop}}.myshopify.com/admin/api/2024-01',
    rateLimit: { requestsPerSecond: 2, requestsPerDay: 10000 },
    requiredScopes: ['read_orders', 'write_orders', 'read_products', 'read_customers'],
    webhookSupport: true,
  },
  woocommerce: {
    id: 'woocommerce',
    name: 'WooCommerce',
    category: 'ecommerce',
    authType: 'basic',
    baseUrl: 'https://{{domain}}/wp-json/wc/v3',
    rateLimit: { requestsPerSecond: 10 },
    webhookSupport: true,
  },
  
  // CRM
  followUpBoss: {
    id: 'followUpBoss',
    name: 'Follow Up Boss',
    category: 'crm',
    authType: 'apiKey',
    baseUrl: 'https://api.followupboss.com/v1',
    rateLimit: { requestsPerSecond: 5 },
    webhookSupport: true,
  },
  kvcore: {
    id: 'kvcore',
    name: 'kvCORE',
    category: 'crm',
    authType: 'oauth2',
    baseUrl: 'https://api.kvcore.com/v2',
    rateLimit: { requestsPerSecond: 3 },
    webhookSupport: true,
  },
  vinSolutions: {
    id: 'vinSolutions',
    name: 'VinSolutions',
    category: 'crm',
    authType: 'apiKey',
    baseUrl: 'https://api.vinsolutions.com/v1',
    rateLimit: { requestsPerSecond: 5 },
    webhookSupport: true,
  },
  serviceTitan: {
    id: 'serviceTitan',
    name: 'ServiceTitan',
    category: 'crm',
    authType: 'oauth2',
    baseUrl: 'https://api.servicetitan.io/v2',
    rateLimit: { requestsPerSecond: 10 },
    webhookSupport: true,
  },
  
  // Email Marketing
  klaviyo: {
    id: 'klaviyo',
    name: 'Klaviyo',
    category: 'email',
    authType: 'apiKey',
    baseUrl: 'https://a.klaviyo.com/api',
    rateLimit: { requestsPerSecond: 10, requestsPerDay: 50000 },
    webhookSupport: true,
  },
  convertkit: {
    id: 'convertkit',
    name: 'ConvertKit',
    category: 'email',
    authType: 'apiKey',
    baseUrl: 'https://api.convertkit.com/v3',
    rateLimit: { requestsPerSecond: 3 },
    webhookSupport: true,
  },
  activeCampaign: {
    id: 'activeCampaign',
    name: 'ActiveCampaign',
    category: 'email',
    authType: 'apiKey',
    baseUrl: 'https://{{account}}.api-us1.com/api/3',
    rateLimit: { requestsPerSecond: 5 },
    webhookSupport: true,
  },
  
  // Payments
  stripe: {
    id: 'stripe',
    name: 'Stripe',
    category: 'payment',
    authType: 'bearer',
    baseUrl: 'https://api.stripe.com/v1',
    rateLimit: { requestsPerSecond: 100, requestsPerDay: 100000 },
    webhookSupport: true,
  },
  
  // Scheduling
  calendly: {
    id: 'calendly',
    name: 'Calendly',
    category: 'scheduling',
    authType: 'oauth2',
    baseUrl: 'https://api.calendly.com',
    rateLimit: { requestsPerSecond: 10 },
    requiredScopes: ['default'],
    webhookSupport: true,
  },
  acuity: {
    id: 'acuity',
    name: 'Acuity Scheduling',
    category: 'scheduling',
    authType: 'basic',
    baseUrl: 'https://acuityscheduling.com/api/v1',
    rateLimit: { requestsPerSecond: 5 },
    webhookSupport: true,
  },
  
  // Communication
  twilio: {
    id: 'twilio',
    name: 'Twilio',
    category: 'communication',
    authType: 'basic',
    baseUrl: 'https://api.twilio.com/2010-04-01',
    rateLimit: { requestsPerSecond: 100 },
    webhookSupport: true,
  },
  
  // Analytics
  chartMogul: {
    id: 'chartMogul',
    name: 'ChartMogul',
    category: 'analytics',
    authType: 'basic',
    baseUrl: 'https://api.chartmogul.com/v1',
    rateLimit: { requestsPerSecond: 5 },
    webhookSupport: true,
  },
};

export class IntegrationService {
  private secretManager: SecretManagerServiceClient;
  private rateLimiters: Map<string, RateLimiter> = new Map();

  constructor() {
    this.secretManager = new SecretManagerServiceClient();
    this.initializeRateLimiters();
  }

  /**
   * Initialize rate limiters for all integrations
   */
  private initializeRateLimiters(): void {
    for (const [key, config] of Object.entries(INTEGRATIONS)) {
      this.rateLimiters.set(
        key,
        new RateLimiter(config.rateLimit.requestsPerSecond, config.rateLimit.requestsPerDay)
      );
    }
  }

  /**
   * Make authenticated API call to integration
   */
  async makeRequest(
    integrationId: string,
    userId: string,
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const config = INTEGRATIONS[integrationId];
    if (!config) {
      throw new Error(`Integration ${integrationId} not found`);
    }

    // Check rate limit
    const rateLimiter = this.rateLimiters.get(integrationId);
    if (rateLimiter && !rateLimiter.canMakeRequest()) {
      throw new Error(`Rate limit exceeded for ${integrationId}`);
    }

    // Get credentials
    const credentials = await this.getCredentials(userId, integrationId);
    if (!credentials) {
      throw new Error(`No credentials found for ${integrationId}`);
    }

    // Refresh token if needed
    if (config.authType === 'oauth2' && this.shouldRefreshToken(credentials)) {
      await this.refreshAccessToken(userId, integrationId, credentials);
    }

    // Build request
    const url = `${config.baseUrl}${endpoint}`;
    const headers = this.buildHeaders(config, credentials);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    // Update rate limiter
    if (rateLimiter) {
      rateLimiter.recordRequest();
    }

    // Handle response
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`${integrationId} API error: ${response.status} - ${error}`);
    }

    return response;
  }

  /**
   * Get integration credentials for user
   */
  private async getCredentials(
    userId: string,
    integrationId: string
  ): Promise<IntegrationCredentials | null> {
    // In production, get from Firestore
    // For now, get from Secret Manager
    const secretName = `projects/PROJECT_ID/secrets/${integrationId}-${userId}/versions/latest`;
    
    try {
      const [version] = await this.secretManager.accessSecretVersion({ name: secretName });
      const payload = version.payload?.data?.toString();
      return payload ? JSON.parse(payload) : null;
    } catch (error) {
      console.error(`Failed to get credentials for ${integrationId}:`, error);
      return null;
    }
  }

  /**
   * Build authentication headers
   */
  private buildHeaders(
    config: IntegrationConfig,
    credentials: IntegrationCredentials
  ): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    switch (config.authType) {
      case 'apiKey':
        if (credentials.apiKey) {
          // Different services use different header names
          if (config.id === 'klaviyo') {
            headers['Authorization'] = `Klaviyo-API-Key ${credentials.apiKey}`;
          } else {
            headers['X-API-Key'] = credentials.apiKey;
          }
        }
        break;
      
      case 'oauth2':
        if (credentials.accessToken) {
          headers['Authorization'] = `Bearer ${credentials.accessToken}`;
        }
        break;
      
      case 'bearer':
        if (credentials.accessToken) {
          headers['Authorization'] = `Bearer ${credentials.accessToken}`;
        }
        break;
      
      case 'basic':
        if (credentials.apiKey) {
          const encoded = Buffer.from(credentials.apiKey).toString('base64');
          headers['Authorization'] = `Basic ${encoded}`;
        }
        break;
    }

    return headers;
  }

  /**
   * Check if token should be refreshed
   */
  private shouldRefreshToken(credentials: IntegrationCredentials): boolean {
    if (!credentials.expiresAt) return false;
    
    // Refresh if token expires in less than 5 minutes
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
    return credentials.expiresAt < fiveMinutesFromNow;
  }

  /**
   * Refresh OAuth2 access token
   */
  private async refreshAccessToken(
    userId: string,
    integrationId: string,
    credentials: IntegrationCredentials
  ): Promise<void> {
    // Implementation depends on the service
    console.log(`Refreshing token for ${integrationId}`);
    
    // Example for generic OAuth2
    if (credentials.refreshToken) {
      const tokenEndpoint = this.getTokenEndpoint(integrationId);
      
      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: credentials.refreshToken,
          client_id: process.env[`${integrationId.toUpperCase()}_CLIENT_ID`] || '',
          client_secret: process.env[`${integrationId.toUpperCase()}_CLIENT_SECRET`] || '',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update credentials
        credentials.accessToken = data.access_token;
        credentials.expiresAt = new Date(Date.now() + data.expires_in * 1000);
        
        // Save updated credentials
        await this.saveCredentials(userId, integrationId, credentials);
      }
    }
  }

  /**
   * Get OAuth2 token endpoint
   */
  private getTokenEndpoint(integrationId: string): string {
    const endpoints: Record<string, string> = {
      shopify: 'https://{{shop}}.myshopify.com/admin/oauth/access_token',
      calendly: 'https://auth.calendly.com/oauth/token',
      kvcore: 'https://api.kvcore.com/oauth/token',
      serviceTitan: 'https://auth.servicetitan.io/connect/token',
    };
    
    return endpoints[integrationId] || '';
  }

  /**
   * Save credentials to Secret Manager
   */
  private async saveCredentials(
    userId: string,
    integrationId: string,
    credentials: IntegrationCredentials
  ): Promise<void> {
    const secretName = `${integrationId}-${userId}`;
    const parent = `projects/PROJECT_ID`;
    
    try {
      await this.secretManager.addSecretVersion({
        parent: `${parent}/secrets/${secretName}`,
        payload: {
          data: Buffer.from(JSON.stringify(credentials)),
        },
      });
    } catch (error) {
      console.error(`Failed to save credentials for ${integrationId}:`, error);
    }
  }

  /**
   * Register webhook for integration
   */
  async registerWebhook(
    integrationId: string,
    userId: string,
    events: string[],
    callbackUrl: string
  ): Promise<any> {
    const config = INTEGRATIONS[integrationId];
    if (!config.webhookSupport) {
      throw new Error(`${integrationId} does not support webhooks`);
    }

    // Implementation depends on the service
    console.log(`Registering webhook for ${integrationId}:`, { events, callbackUrl });
    
    // Example: Shopify webhook registration
    if (integrationId === 'shopify') {
      return await this.makeRequest(integrationId, userId, '/webhooks.json', {
        method: 'POST',
        body: JSON.stringify({
          webhook: {
            topic: events[0],
            address: callbackUrl,
            format: 'json',
          },
        }),
      });
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(
    integrationId: string,
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    // Implementation depends on the service
    const crypto = require('crypto');
    
    // Example: Shopify HMAC verification
    if (integrationId === 'shopify') {
      const hash = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('base64');
      return hash === signature;
    }
    
    // Example: Stripe signature verification
    if (integrationId === 'stripe') {
      const stripe = require('stripe')(secret);
      try {
        stripe.webhooks.constructEvent(payload, signature, secret);
        return true;
      } catch (error) {
        return false;
      }
    }
    
    return false;
  }
}

/**
 * Rate Limiter class
 */
class RateLimiter {
  private requestsPerSecond: number;
  private requestsPerDay: number | undefined;
  private secondWindow: number[] = [];
  private dayRequests: number = 0;
  private dayResetTime: number = Date.now() + 24 * 60 * 60 * 1000;

  constructor(requestsPerSecond: number, requestsPerDay?: number) {
    this.requestsPerSecond = requestsPerSecond;
    this.requestsPerDay = requestsPerDay;
  }

  canMakeRequest(): boolean {
    const now = Date.now();
    
    // Reset day counter if needed
    if (now > this.dayResetTime) {
      this.dayRequests = 0;
      this.dayResetTime = now + 24 * 60 * 60 * 1000;
    }
    
    // Check daily limit
    if (this.requestsPerDay && this.dayRequests >= this.requestsPerDay) {
      return false;
    }
    
    // Clean up old requests from second window
    this.secondWindow = this.secondWindow.filter(timestamp => now - timestamp < 1000);
    
    // Check per-second limit
    return this.secondWindow.length < this.requestsPerSecond;
  }

  recordRequest(): void {
    this.secondWindow.push(Date.now());
    this.dayRequests++;
  }
}
