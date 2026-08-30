/**
 * Printify Configuration
 * 
 * SECURITY NOTE: For production, this should use API routes to proxy requests
 * For prototyping: Token is temporarily hardcoded (will be moved to backend)
 */

export const PRINTIFY_CONFIG = {
  // Shop ID is safe to expose
  shopId: '25192477',
  
  // API token - TEMPORARY: Hardcoded for static export to work
  // TODO: Move to API route proxy for production security
  apiToken: process.env.NEXT_PUBLIC_PRINTIFY_API_TOKEN || 
            'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzN2Q0YmQzMDM1ZmUxMWU5YTgwM2FiN2VlYjNjY2M5NyIsImp0aSI6IjYyZTI3ZTBlNmZmOTU5MjkzNGEzNjRiM2VkNmFhZDZmMjFmMWQyMzM0ZGJlNTdjNWE0Nzc2NzYzNGJlZDg0MGM5ZDY4NDY4YjM5NTM0NzhiIiwiaWF0IjoxNzYyNTU5OTQzLjU3MDA0NiwibmJmIjoxNzYyNTU5OTQzLjU3MDA0OCwiZXhwIjoxNzk0MDk1OTQzLjU2MTg0MSwic3ViIjoiMjUzMDA2OTYiLCJzY29wZXMiOlsic2hvcHMubWFuYWdlIiwic2hvcHMucmVhZCIsImNhdGFsb2cucmVhZCIsIm9yZGVycy5yZWFkIiwib3JkZXJzLndyaXRlIiwicHJvZHVjdHMucmVhZCIsInByb2R1Y3RzLndyaXRlIiwid2ViaG9va3MucmVhZCIsIndlYmhvb2tzLndyaXRlIiwidXBsb2Fkcy5yZWFkIiwidXBsb2Fkcy53cml0ZSIsInByaW50X3Byb3ZpZGVycy5yZWFkIiwidXNlci5pbmZvIl19.aF973-dbsGu4HpuToR6JfJrPIzcOHGsh-U-_Yk9aHJaqn6uTKD7Dsud9MOcR_IrnXkC27ReXfoXS9yrRtJMYZVXiPuRBt4lpqxUXgZgdZlBCUEWefXoiNL0jqQUNKGVC5l2BFpvVLJMQ7ig4vEKeQNEen457kVO2UEo1lMQlEZ3Mvie3zVwOAh9DWQbxcghtuaLH2OMqtarlxuZ2FxRDQ_f_IHbTpacoPBsKcJDzLSMzFF2oXjiV02qqp38WSLZoynbmd0cYK34JrPBfR7eQ2mTBbFTDqahbbRNzJPVp_jPTIFx2ruRKfvWWqNzJmYQAXEDYgsOzkhiQUy6Nt5sikcxu1pumwmXgvW3KN3ntbBqj3Au3P_nfTD5Tkr5SVfXPEUjt0-R-6KzTgeDH6cQfRKzYthDVnYFdh12PBa6kQgUJsJZomTLFjkhNVS6pIvAfQnU3u9lVvRnC1CJU3Plalm4PEs4V0KuePpZHDd8g3OcADI2kxpbMTyIG_U3rUPQ89ayNFqs7ABuOUnUWTqqZvAH7yS8hSj_-7NQJUWjniAsktK0pTsy3crACsOluyt4NW7Rj09xxECZ1lHPJ8c4mnup4yGzPPJZbRfFYfIL4_YrzV_8jimuceLrHFuUKLgMthau_wwFvFA6505gZI4tyLr403euoOHQNoIz0ZnuKZzk',
  
  baseUrl: 'https://api.printify.com/v1',
};

// Helper to check if Printify is configured
export function isPrintifyConfigured(): boolean {
  return !!PRINTIFY_CONFIG.apiToken && !!PRINTIFY_CONFIG.shopId;
}

// Helper to get error message when not configured
export function getPrintifySetupMessage(): string {
  if (!PRINTIFY_CONFIG.apiToken) {
    return 'Printify API token not configured. Please add NEXT_PUBLIC_PRINTIFY_API_TOKEN to your .env.local file.';
  }
  if (!PRINTIFY_CONFIG.shopId) {
    return 'Printify shop ID not configured.';
  }
  return 'Printify is configured correctly.';
}
