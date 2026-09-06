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
const mockCampaigns: Campaign[] = [];

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
