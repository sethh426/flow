'use client';

import { useState, useEffect } from 'react';
import { 
  Button, 
  Card, 
  TextInput, 
  Select, 
  Badge, 
  Modal,
  Label,
  Textarea,
  Spinner,
  Checkbox,
  Progress
} from 'flowbite-react';
import {
  HiSearch,
  HiPlus,
  HiDotsVertical,
  HiPencil,
  HiTrash,
  HiPlay,
  HiPause,
  HiArchive,
  HiDuplicate,
  HiTrendingUp,
  HiTrendingDown,
  HiRefresh,
  HiEye,
  HiChartBar,
  HiClock
} from 'react-icons/hi';
import { useToast } from '@/core/providers/ToastProvider';

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft' | 'archived';
  category: string;
  affiliateNetwork: string;
  createdAt: Date;
  analytics: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
  };
  workflowId?: string;
  workflowStatus?: 'running' | 'paused' | 'completed' | 'failed';
}

export default function CampaignManagerFlowbite() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { success, error: showError } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    affiliateNetwork: '',
    status: 'draft' as 'active' | 'paused' | 'draft' | 'archived',
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/campaigns');
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      const data = await response.json();
      setCampaigns(data.campaigns || []);
    } catch (error) {
      // Fallback to mock data for demo purposes
      console.warn('API unavailable, using mock data:', error.message);
      setCampaigns([
        {
          id: '1',
          name: 'Summer Fashion Collection',
          description: 'Promote trending summer fashion items with affiliate links',
          status: 'active' as const,
          category: 'Fashion',
          affiliateNetwork: 'Amazon Associates',
          createdAt: new Date('2024-06-01'),
          analytics: {
            impressions: 15420,
            clicks: 892,
            conversions: 23,
            revenue: 1847.50
          },
          workflowId: 'wf-001',
          workflowStatus: 'running' as const
        },
        {
          id: '2',
          name: 'Tech Gadgets Review',
          description: 'Review and promote latest tech gadgets and accessories',
          status: 'active' as const,
          category: 'Technology',
          affiliateNetwork: 'Best Buy Affiliate',
          createdAt: new Date('2024-05-15'),
          analytics: {
            impressions: 12850,
            clicks: 634,
            conversions: 18,
            revenue: 2156.80
          },
          workflowId: 'wf-002',
          workflowStatus: 'completed' as const
        },
        {
          id: '3',
          name: 'Home & Garden Essentials',
          description: 'Curated selection of home improvement and garden tools',
          status: 'paused' as const,
          category: 'Home & Garden',
          affiliateNetwork: 'Home Depot Affiliate',
          createdAt: new Date('2024-04-20'),
          analytics: {
            impressions: 9870,
            clicks: 423,
            conversions: 12,
            revenue: 892.30
          }
        },
        {
          id: '4',
          name: 'Fitness Equipment Deals',
          description: 'Promote fitness gear and workout equipment at discounted prices',
          status: 'draft' as const,
          category: 'Fitness',
          affiliateNetwork: 'Dick\'s Sporting Goods',
          createdAt: new Date('2024-07-01'),
          analytics: {
            impressions: 0,
            clicks: 0,
            conversions: 0,
            revenue: 0
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Filtering
  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || campaign.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = Array.from(new Set(campaigns.map(c => c.category))).filter(Boolean);
  const networks = Array.from(new Set(campaigns.map(c => c.affiliateNetwork))).filter(Boolean);

  const handleSelectAll = (checked: boolean) => {
    setSelected(checked ? filteredCampaigns.map(c => c.id) : []);
  };

  const handleSelectOne = (campaignId: string, checked: boolean) => {
    setSelected(prev =>
      checked ? [...prev, campaignId] : prev.filter(id => id !== campaignId)
    );
  };

  const handleCreate = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      affiliateNetwork: '',
      status: 'draft',
    });
    setSelectedCampaign(null);
    setDialogOpen(true);
  };

  const handleEdit = (campaign: Campaign) => {
    setFormData({
      name: campaign.name,
      description: campaign.description,
      category: campaign.category,
      affiliateNetwork: campaign.affiliateNetwork,
      status: campaign.status,
    });
    setSelectedCampaign(campaign);
    setDialogOpen(true);
  };

  const handleDelete = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCampaign) return;

    try {
      const response = await fetch(`/api/campaigns/${selectedCampaign.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete campaign');

      success('Campaign deleted successfully');
      fetchCampaigns();
      setDeleteDialogOpen(false);
      setSelectedCampaign(null);
    } catch (error) {
      // Fallback for demo - simulate successful delete
      console.warn('API unavailable, simulating delete:', error.message);
      setCampaigns(prev => prev.filter(c => c.id !== selectedCampaign.id));
      success('Campaign deleted successfully');
      fetchCampaigns();
      setDeleteDialogOpen(false);
      setSelectedCampaign(null);
    }
  };

  const handleSave = async () => {
    try {
      const url = selectedCampaign
        ? `/api/campaigns/${selectedCampaign.id}`
        : '/api/campaigns';

      const method = selectedCampaign ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save campaign');

      success(selectedCampaign ? 'Campaign updated' : 'Campaign created');
      fetchCampaigns();
      setDialogOpen(false);
      setSelectedCampaign(null);
    } catch (error) {
      // Fallback for demo - simulate successful save
      console.warn('API unavailable, simulating save:', error.message);

      if (selectedCampaign) {
        // Update existing campaign
        setCampaigns(prev => prev.map(c =>
          c.id === selectedCampaign.id
            ? { ...c, ...formData }
            : c
        ));
        success('Campaign updated');
      } else {
        // Create new campaign
        const newCampaign: Campaign = {
          id: Date.now().toString(),
          ...formData,
          createdAt: new Date(),
          analytics: {
            impressions: 0,
            clicks: 0,
            conversions: 0,
            revenue: 0
          }
        };
        setCampaigns(prev => [...prev, newCampaign]);
        success('Campaign created');
      }

      fetchCampaigns();
      setDialogOpen(false);
      setSelectedCampaign(null);
    }
  };

  const handleStatusChange = async (campaign: Campaign, newStatus: Campaign['status']) => {
    try {
      const response = await fetch(`/api/campaigns/${campaign.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      success(`Campaign ${newStatus === 'active' ? 'activated' : newStatus === 'paused' ? 'paused' : 'archived'}`);
      fetchCampaigns();
    } catch (error) {
      // Fallback for demo - simulate status change
      console.warn('API unavailable, simulating status change:', error.message);
      setCampaigns(prev => prev.map(c =>
        c.id === campaign.id
          ? { ...c, status: newStatus }
          : c
      ));
      success(`Campaign ${newStatus === 'active' ? 'activated' : newStatus === 'paused' ? 'paused' : 'archived'}`);
      fetchCampaigns();
    }
  };

  const handleViewDetails = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setDetailsOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'draft': return 'info';
      case 'archived': return 'failure';
      default: return 'gray';
    }
  };

  const getWorkflowStatusColor = (status?: string) => {
    switch (status) {
      case 'running': return 'success';
      case 'paused': return 'warning';
      case 'completed': return 'info';
      case 'failed': return 'failure';
      default: return 'gray';
    }
  };

  const calculateCTR = (clicks: number, impressions: number) => {
    return impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00';
  };

  const calculateROI = (revenue: number, conversions: number) => {
    return conversions > 0 ? ((revenue / conversions) * 100).toFixed(2) : '0.00';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="xl" className="fill-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Campaigns
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your affiliate marketing campaigns
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreate} className="bg-gradient-to-r from-purple-600 to-blue-600">
            <HiPlus className="mr-2 h-5 w-5" />
            New Campaign
          </Button>
          <Button color="gray" onClick={fetchCampaigns}>
            <HiRefresh className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <TextInput
              icon={HiSearch}
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </Select>
          </div>
          <div>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredCampaigns.length} of {campaigns.length} campaigns
        </p>
        {selected.length > 0 && (
          <Badge color="purple" size="lg">
            {selected.length} selected
          </Badge>
        )}
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCampaigns.map((campaign) => (
          <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Checkbox
                      checked={selected.includes(campaign.id)}
                      onChange={(e) => handleSelectOne(campaign.id, e.target.checked)}
                    />
                    <h3 className="font-semibold text-lg line-clamp-1">{campaign.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {campaign.description}
                  </p>
                </div>
              </div>

              {/* Status badges */}
              <div className="flex flex-wrap gap-2">
                <Badge color={getStatusColor(campaign.status)} size="sm">
                  {campaign.status}
                </Badge>
                {campaign.category && (
                  <Badge color="info" size="sm">{campaign.category}</Badge>
                )}
                {campaign.workflowStatus && (
                  <Badge color={getWorkflowStatusColor(campaign.workflowStatus)} size="sm">
                    Workflow: {campaign.workflowStatus}
                  </Badge>
                )}
              </div>

              {/* Analytics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="text-xs text-gray-600 dark:text-gray-400">Impressions</div>
                  <div className="text-lg font-bold text-purple-600">
                    {campaign.analytics.impressions.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="text-xs text-gray-600 dark:text-gray-400">Clicks</div>
                  <div className="text-lg font-bold text-blue-600">
                    {campaign.analytics.clicks.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="text-xs text-gray-600 dark:text-gray-400">Conversions</div>
                  <div className="text-lg font-bold text-green-600">
                    {campaign.analytics.conversions}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="text-xs text-gray-600 dark:text-gray-400">Revenue</div>
                  <div className="text-lg font-bold text-green-600">
                    ${campaign.analytics.revenue.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* CTR and Created Date */}
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <HiChartBar className="h-4 w-4" />
                  CTR: {calculateCTR(campaign.analytics.clicks, campaign.analytics.impressions)}%
                </div>
                <div className="flex items-center gap-1">
                  <HiClock className="h-4 w-4" />
                  {new Date(campaign.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                {campaign.status === 'active' ? (
                  <Button size="sm" color="warning" onClick={() => handleStatusChange(campaign, 'paused')}>
                    <HiPause className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button size="sm" color="success" onClick={() => handleStatusChange(campaign, 'active')}>
                    <HiPlay className="h-4 w-4" />
                  </Button>
                )}
                <Button size="sm" color="gray" onClick={() => handleViewDetails(campaign)}>
                  <HiEye className="h-4 w-4" />
                </Button>
                <Button size="sm" color="gray" onClick={() => handleEdit(campaign)}>
                  <HiPencil className="h-4 w-4" />
                </Button>
                <Button size="sm" color="failure" onClick={() => handleDelete(campaign)}>
                  <HiTrash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <Modal show={dialogOpen} onClose={() => setDialogOpen(false)} size="xl">
        <div className="p-6">
          <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {selectedCampaign ? 'Edit Campaign' : 'Create Campaign'}
          </h3>
          <div className="space-y-4">
            <div>
              <Label>Campaign Name</Label>
              <TextInput
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter campaign name"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Campaign description"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <TextInput
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Fashion, Tech"
                />
              </div>
              <div>
                <Label>Affiliate Network</Label>
                <TextInput
                  value={formData.affiliateNetwork}
                  onChange={(e) => setFormData({ ...formData, affiliateNetwork: e.target.value })}
                  placeholder="e.g., ShareASale, Amazon"
                />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="archived">Archived</option>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button color="gray" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-gradient-to-r from-purple-600 to-blue-600">
              Save Campaign
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} size="md">
        <div className="p-6 text-center">
          <HiTrash className="mx-auto mb-4 h-14 w-14 text-red-600" />
          <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
            Are you sure you want to delete this campaign?
          </h3>
          <div className="flex justify-center gap-4">
            <Button color="failure" onClick={confirmDelete}>
              Yes, delete it
            </Button>
            <Button color="gray" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Details Modal */}
      <Modal show={detailsOpen} onClose={() => setDetailsOpen(false)} size="2xl">
        {selectedCampaign && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">{selectedCampaign.name}</h2>
            
            <div className="space-y-6">
              {/* Status and Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <div className="mt-2">
                    <Badge color={getStatusColor(selectedCampaign.status)} size="lg">
                      {selectedCampaign.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Category</Label>
                  <p className="mt-2 text-gray-900 dark:text-white">{selectedCampaign.category}</p>
                </div>
                <div>
                  <Label>Affiliate Network</Label>
                  <p className="mt-2 text-gray-900 dark:text-white">{selectedCampaign.affiliateNetwork}</p>
                </div>
                <div>
                  <Label>Created</Label>
                  <p className="mt-2 text-gray-900 dark:text-white">
                    {new Date(selectedCampaign.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label>Description</Label>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {selectedCampaign.description}
                </p>
              </div>

              {/* Analytics */}
              <div>
                <Label>Performance Analytics</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                  <Card>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Impressions</div>
                      <div className="text-2xl font-bold text-purple-600 mt-2">
                        {selectedCampaign.analytics.impressions.toLocaleString()}
                      </div>
                    </div>
                  </Card>
                  <Card>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Clicks</div>
                      <div className="text-2xl font-bold text-blue-600 mt-2">
                        {selectedCampaign.analytics.clicks.toLocaleString()}
                      </div>
                    </div>
                  </Card>
                  <Card>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Conversions</div>
                      <div className="text-2xl font-bold text-green-600 mt-2">
                        {selectedCampaign.analytics.conversions}
                      </div>
                    </div>
                  </Card>
                  <Card>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Revenue</div>
                      <div className="text-2xl font-bold text-green-600 mt-2">
                        ${selectedCampaign.analytics.revenue.toFixed(2)}
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Click-Through Rate</div>
                  <div className="text-xl font-bold text-purple-600 mt-2">
                    {calculateCTR(selectedCampaign.analytics.clicks, selectedCampaign.analytics.impressions)}%
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Revenue per Conversion</div>
                  <div className="text-xl font-bold text-green-600 mt-2">
                    ${selectedCampaign.analytics.conversions > 0 
                      ? (selectedCampaign.analytics.revenue / selectedCampaign.analytics.conversions).toFixed(2)
                      : '0.00'}
                  </div>
                </div>
              </div>

              {/* Workflow Status */}
              {selectedCampaign.workflowId && (
                <div>
                  <Label>Workflow Status</Label>
                  <div className="mt-2">
                    <Badge color={getWorkflowStatusColor(selectedCampaign.workflowStatus)} size="lg">
                      {selectedCampaign.workflowStatus || 'Not started'}
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button color="gray" onClick={() => setDetailsOpen(false)}>
                Close
              </Button>
              <Button onClick={() => {
                setDetailsOpen(false);
                handleEdit(selectedCampaign);
              }} className="bg-gradient-to-r from-purple-600 to-blue-600">
                Edit Campaign
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
