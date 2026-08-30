// Universal API Client with Mock Fallbacks
// Handles all API calls gracefully when routes don't exist

import { campaignService } from '@/services/mockCampaignService';
import { trendsService } from '@/services/mockTrendsService';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Mock response generators
const mockResponses: Record<string, (body?: any) => Promise<any>> = {
  // FlowBot
  '/api/flowbot': async (body) => ({
    response: `I understand you want to ${body?.message || 'get help'}. As a demo, I can help you create campaigns, find trends, and optimize your affiliate marketing strategy. What would you like to do?`,
    suggestions: ['Create a campaign', 'Find trending products', 'Analyze performance'],
  }),

  // Workflows
  '/api/workflows/execute': async (body) => ({
    executionId: `exec_${Date.now()}`,
    status: 'running',
    message: 'Workflow started successfully',
  }),
  '/api/workflows': async (body) => ({
    workflows: [
      {
        id: 'wf_1',
        name: 'Daily Content Automation',
        status: 'active',
        steps: 3,
        lastRun: new Date().toISOString(),
      },
    ],
  }),
  '/api/workflows/recommended': async () => ({
    workflows: [
      {
        id: 'rec_1',
        name: 'Product Research Pipeline',
        description: 'Find and analyze trending products automatically',
        steps: ['Find trends', 'Analyze competition', 'Create campaign'],
      },
    ],
  }),

  // Products
  '/api/products': async (body) => {
    if (body && body.name) {
      return {
        product: {
          id: `prod_${Date.now()}`,
          name: body.name,
          price: body.price || 99.99,
          category: body.category || 'general',
          createdAt: new Date().toISOString(),
        },
      };
    }
    return {
      products: [
        {
          id: 'prod_1',
          title: 'Premium Wireless Headphones',
          price: 199.99,
          category: 'Electronics',
          status: 'active',
          source: 'affiliate',
          affiliateLink: 'https://example.com/headphones',
          imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
          description: 'High-quality wireless headphones with noise cancellation',
          stockLevel: 50,
          createdAt: '2024-01-15T10:00:00Z',
          analytics: {
            views: 1250,
            clicks: 89,
            conversions: 12,
            revenue: 2399.88,
            ctr: 7.1,
          },
        },
        {
          id: 'printify_1',
          title: 'Custom Printed T-Shirt',
          price: 24.99,
          category: 'Apparel',
          status: 'active',
          source: 'printify',
          affiliateLink: '',
          imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
          description: 'Soft cotton t-shirt with your custom design',
          stockLevel: 999,
          createdAt: new Date().toISOString(),
          analytics: {
            views: 845,
            clicks: 67,
            conversions: 8,
            revenue: 199.92,
            ctr: 7.9,
          },
        },
        {
          id: 'printify_2',
          title: 'Coffee Mug - 11oz',
          price: 14.99,
          category: 'Home',
          status: 'active',
          source: 'printify',
          affiliateLink: '',
          imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400',
          description: 'White ceramic mug perfect for morning coffee',
          stockLevel: 999,
          createdAt: new Date().toISOString(),
          analytics: {
            views: 520,
            clicks: 41,
            conversions: 5,
            revenue: 74.95,
            ctr: 7.9,
          },
        },
      ],
    };
  },

  // Content Generation
  '/api/generate-content': async (body) => ({
    content: {
      title: 'Amazing Product Review',
      body: `Check out this incredible ${body?.productName || 'product'}! It's perfect for anyone looking for quality and value. With its outstanding features and competitive pricing, this is a must-have item. #affiliate #review #recommended`,
      hashtags: ['affiliate', 'review', 'recommended', 'shopping'],
      imagePrompt: 'Professional product photography, clean background, modern aesthetic',
    },
  }),

  // Social Media
  '/api/social-platforms': async () => ({
    platforms: [
      { id: 'instagram', name: 'Instagram', connected: false, icon: 'instagram' },
      { id: 'tiktok', name: 'TikTok', connected: false, icon: 'tiktok' },
      { id: 'youtube', name: 'YouTube', connected: false, icon: 'youtube' },
    ],
  }),
  '/api/instagram/post': async (body) => ({
    success: true,
    postId: `post_${Date.now()}`,
    message: 'Post scheduled successfully',
  }),
  '/api/post-engagement': async () => ({
    engagement: {
      likes: Math.floor(Math.random() * 1000),
      comments: Math.floor(Math.random() * 100),
      shares: Math.floor(Math.random() * 50),
    },
  }),

  // AI Features
  '/api/analyze-image': async () => ({
    analysis: {
      objects: ['product', 'background'],
      mood: 'professional',
      quality: 'high',
      suggestions: ['Add brighter lighting', 'Center the subject'],
    },
  }),
  '/api/generate-comment': async (body) => ({
    comment: `Love this! 😍 ${body?.context || 'Great post!'}`,
  }),
  '/api/generate-message-response': async (body) => ({
    response: `Thanks for your message! I'd be happy to help with ${body?.message || 'that'}. Let me know if you have any questions!`,
  }),
  '/api/send-message': async () => ({
    success: true,
    messageId: `msg_${Date.now()}`,
  }),

  // Image Editor
  '/api/edit-image': async (body) => ({
    editedImage: body?.image || '/placeholder.jpg',
    message: 'Image edited successfully',
  }),

  // Error Logging (silent success)
  '/api/errors/log': async () => ({ logged: true }),

  // Workflow Executions
  '/api/workflow-executions': async () => ({
    executions: [
      {
        id: `exec_${Date.now()}`,
        workflowId: 'wf_1',
        status: 'completed',
        startedAt: new Date().toISOString(),
      },
    ],
  }),
};

// Check if endpoint has mock
function hasMockResponse(url: string): boolean {
  return Object.keys(mockResponses).some(pattern => url.includes(pattern));
}

// Get mock response
async function getMockResponse(url: string, body?: any): Promise<any> {
  const matchedPattern = Object.keys(mockResponses).find(pattern => url.includes(pattern));
  if (matchedPattern) {
    const generator = mockResponses[matchedPattern];
    return generator(body);
  }
  throw new Error(`No mock response for ${url}`);
}

// Universal fetch wrapper
export async function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  // Handle campaigns with existing service
  if (url.includes('/api/campaigns')) {
    const method = options?.method || 'GET';
    let mockData: any;

    try {
      const body = options?.body ? JSON.parse(options.body as string) : undefined;

      if (method === 'GET') {
        mockData = { campaigns: await campaignService.getCampaigns() };
      } else if (method === 'POST') {
        mockData = { campaign: await campaignService.createCampaign(body, 'demo-user') };
      } else if (method === 'PATCH') {
        const id = url.split('/').pop();
        mockData = { campaign: await campaignService.updateCampaign(id!, body) };
      } else if (method === 'DELETE') {
        const id = url.split('/').pop();
        await campaignService.deleteCampaign(id!);
        mockData = { success: true };
      }

      return new Response(JSON.stringify(mockData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // Handle trends with existing service
  if (url.includes('/api/trends')) {
    try {
      const trends = await trendsService.discoverTrends();
      return new Response(JSON.stringify({ trends }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // Handle other mocked endpoints
  if (hasMockResponse(url)) {
    try {
      const body = options?.body ? JSON.parse(options.body as string) : undefined;
      const mockData = await getMockResponse(url, body);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));

      return new Response(JSON.stringify(mockData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // If no mock exists, try real fetch (will fail gracefully)
  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    // Return a generic error response
    console.warn(`API call failed for ${url}, no mock available`);
    return new Response(
      JSON.stringify({ 
        error: 'Service temporarily unavailable',
        message: 'This feature is currently being updated. Please try again later.',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Helper for easy usage
export async function apiCall<T = any>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await apiFetch(url, options);
  const data = await response.json();
  
  if (!response.ok) {
    throw new ApiError(response.status, data.error || 'Request failed');
  }
  
  return data;
}
