// Mock Campaign Service for Development
// This provides mock data while API routes are being migrated to Firebase Functions

export interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft';
  category: string;
  affiliateNetwork: string;
  createdAt: Date;
  analytics: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
  };
}

// Mock data
const mockCampaigns: Campaign[] = [
  {
    id: 'campaign-1',
    name: 'Summer Fashion Collection 2025',
    description: 'Promote trending summer fashion items from Nordstrom',
    status: 'active',
    category: 'fashion',
    affiliateNetwork: 'nordstrom',
    createdAt: new Date('2025-06-01'),
    analytics: {
      impressions: 12500,
      clicks: 890,
      conversions: 45,
      revenue: 2340.50,
    },
  },
  {
    id: 'campaign-2',
    name: 'Tech Gadgets for Home Office',
    description: 'Best tech products for remote workers',
    status: 'active',
    category: 'tech',
    affiliateNetwork: 'amazon',
    createdAt: new Date('2025-05-15'),
    analytics: {
      impressions: 18200,
      clicks: 1240,
      conversions: 78,
      revenue: 4567.80,
    },
  },
  {
    id: 'campaign-3',
    name: 'Beauty Essentials Guide',
    description: 'Curated beauty products for daily routines',
    status: 'paused',
    category: 'beauty',
    affiliateNetwork: 'sephora',
    createdAt: new Date('2025-04-20'),
    analytics: {
      impressions: 9500,
      clicks: 620,
      conversions: 32,
      revenue: 1890.25,
    },
  },
];

// Simulate API calls with delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const campaignService = {
  async getCampaigns(userId?: string): Promise<Campaign[]> {
    await delay(500); // Simulate network delay
    return [...mockCampaigns];
  },

  async createCampaign(data: Partial<Campaign>, userId: string): Promise<Campaign> {
    await delay(700);
    const newCampaign: Campaign = {
      id: `campaign-${Date.now()}`,
      name: data.name || 'Untitled Campaign',
      description: data.description || '',
      status: 'draft',
      category: data.category || 'fashion',
      affiliateNetwork: data.affiliateNetwork || 'amazon',
      createdAt: new Date(),
      analytics: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        revenue: 0,
      },
    };
    mockCampaigns.unshift(newCampaign);
    return newCampaign;
  },

  async updateCampaign(id: string, data: Partial<Campaign>): Promise<Campaign> {
    await delay(500);
    const index = mockCampaigns.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Campaign not found');
    
    mockCampaigns[index] = {
      ...mockCampaigns[index],
      ...data,
    };
    return mockCampaigns[index];
  },

  async toggleCampaignStatus(id: string): Promise<Campaign> {
    await delay(400);
    const index = mockCampaigns.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Campaign not found');
    
    const campaign = mockCampaigns[index];
    campaign.status = campaign.status === 'active' ? 'paused' : 'active';
    return campaign;
  },

  async deleteCampaign(id: string): Promise<void> {
    await delay(500);
    const index = mockCampaigns.findIndex(c => c.id === id);
    if (index !== -1) {
      mockCampaigns.splice(index, 1);
    }
  },
};
