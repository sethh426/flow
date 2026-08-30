// Mock Trends Service for Development
// This provides mock data while API routes are being migrated to Firebase Functions

export interface Trend {
  id: string;
  keyword: string;
  category: string;
  searchVolume: number;
  competition: 'low' | 'medium' | 'high';
  growth: number;
  products: Array<{
    id: string;
    name: string;
    price: number;
    image: string;
    affiliateUrl: string;
  }>;
}

// Mock trending products data
const mockTrends: Trend[] = [
  {
    id: 'trend-1',
    keyword: 'sustainable fashion',
    category: 'fashion',
    searchVolume: 135000,
    competition: 'medium',
    growth: 45.2,
    products: [
      {
        id: 'prod-1',
        name: 'Organic Cotton T-Shirt',
        price: 29.99,
        image: '/placeholder-product.jpg',
        affiliateUrl: '#',
      },
      {
        id: 'prod-2',
        name: 'Recycled Denim Jeans',
        price: 89.99,
        image: '/placeholder-product.jpg',
        affiliateUrl: '#',
      },
    ],
  },
  {
    id: 'trend-2',
    keyword: 'smart home devices',
    category: 'tech',
    searchVolume: 246000,
    competition: 'high',
    growth: 78.5,
    products: [
      {
        id: 'prod-3',
        name: 'WiFi Smart Bulb Set',
        price: 45.99,
        image: '/placeholder-product.jpg',
        affiliateUrl: '#',
      },
      {
        id: 'prod-4',
        name: 'Smart Thermostat',
        price: 129.99,
        image: '/placeholder-product.jpg',
        affiliateUrl: '#',
      },
    ],
  },
  {
    id: 'trend-3',
    keyword: 'clean beauty products',
    category: 'beauty',
    searchVolume: 98000,
    competition: 'low',
    growth: 62.3,
    products: [
      {
        id: 'prod-5',
        name: 'Natural Face Serum',
        price: 42.00,
        image: '/placeholder-product.jpg',
        affiliateUrl: '#',
      },
      {
        id: 'prod-6',
        name: 'Organic Lip Balm Set',
        price: 18.50,
        image: '/placeholder-product.jpg',
        affiliateUrl: '#',
      },
    ],
  },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const trendsService = {
  async discoverTrends(query?: string): Promise<Trend[]> {
    await delay(800); // Simulate AI processing
    
    if (query) {
      // Filter trends by query
      return mockTrends.filter(trend => 
        trend.keyword.toLowerCase().includes(query.toLowerCase()) ||
        trend.category.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    return [...mockTrends];
  },

  async getTrendById(id: string): Promise<Trend | null> {
    await delay(300);
    return mockTrends.find(trend => trend.id === id) || null;
  },

  async analyzeTrend(keyword: string): Promise<Trend> {
    await delay(1200);
    
    // Generate a mock trend analysis
    const mockTrend: Trend = {
      id: `trend-${Date.now()}`,
      keyword,
      category: 'general',
      searchVolume: Math.floor(Math.random() * 200000) + 10000,
      competition: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
      growth: Math.floor(Math.random() * 100),
      products: [],
    };
    
    return mockTrend;
  },
};
