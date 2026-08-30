'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ToastProvider';
import { onAuthChange } from '@/lib/auth';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

interface Campaign {
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

export default function CampaignManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'fashion',
    affiliateNetwork: 'nordstrom',
  });
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused' | 'draft'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'revenue' | 'name'>('recent');
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const toast = useToast();

  // Get current user
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setCurrentUser(user);
      if (user) {
        loadCampaigns(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  // Campaign templates
  const campaignTemplates = [
    {
      id: 'product-launch',
      name: 'Product Launch Campaign',
      icon: '🚀',
      description: 'Perfect for launching new affiliate products',
      category: 'fashion',
      network: 'nordstrom',
    },
    {
      id: 'seasonal-sale',
      name: 'Seasonal Sale Campaign',
      icon: '🎉',
      description: 'Holiday and seasonal promotions',
      category: 'lifestyle',
      network: 'amazon',
    },
    {
      id: 'influencer-collab',
      name: 'Influencer Collaboration',
      icon: '🤝',
      description: 'Partner with influencers',
      category: 'beauty',
      network: 'sephora',
    },
    {
      id: 'content-series',
      name: 'Content Series Campaign',
      icon: '📚',
      description: 'Multi-post content strategy',
      category: 'tech',
      network: 'amazon',
    },
  ];

  const loadCampaigns = async (userId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/campaigns?userId=${userId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load campaigns');
      }

      // Convert Firestore timestamps to Date objects
      const campaignsData = data.campaigns.map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt),
      }));
      
      setCampaigns(campaignsData);
    } catch (error: any) {
      console.error('Error loading campaigns:', error);
      toast.error('Failed to load campaigns', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = () => {
    setEditingCampaign(null);
    setFormData({
      name: '',
      description: '',
      category: 'fashion',
      affiliateNetwork: 'nordstrom',
    });
    setOpenDialog(true);
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      description: campaign.description,
      category: campaign.category,
      affiliateNetwork: campaign.affiliateNetwork,
    });
    setOpenDialog(true);
  };

  const handleSaveCampaign = async () => {
    if (!currentUser) {
      toast.error('Authentication required', 'Please log in to create campaigns');
      return;
    }

    if (!formData.name.trim()) {
      toast.warning('Please enter a campaign name');
      return;
    }

    const loadingId = toast.loading(editingCampaign ? 'Updating campaign...' : 'Creating campaign...');
    
    try {
      if (editingCampaign) {
        // Update existing campaign
        const response = await fetch(`/api/campaigns/${editingCampaign.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to update campaign');
        }

        toast.dismiss(loadingId);
        toast.success('Campaign updated successfully!');
      } else {
        // Create new campaign
        const response = await fetch('/api/campaigns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            userId: currentUser.uid,
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to create campaign');
        }

        toast.dismiss(loadingId);
        toast.success('Campaign created successfully!', `${formData.name} is now active`);
      }
      
      setOpenDialog(false);
      await loadCampaigns(currentUser.uid);
    } catch (error: any) {
      console.error('Error saving campaign:', error);
      toast.dismiss(loadingId);
      toast.error('Failed to save campaign', error.message);
    }
  };

  const handleToggleStatus = async (campaign: Campaign) => {
    if (!currentUser) {
      toast.error('Authentication required');
      return;
    }

    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    
    try {
      const response = await fetch(`/api/campaigns/${campaign.id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update status');
      }

      await loadCampaigns(currentUser.uid);
      toast.success(
        newStatus === 'active' ? 'Campaign activated' : 'Campaign paused',
        campaign.name
      );
    } catch (error: any) {
      toast.error('Failed to update status', error.message);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!currentUser) {
      toast.error('Authentication required');
      return;
    }

    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    if (!confirm('Are you sure you want to delete this campaign?')) return;

    const loadingId = toast.loading('Deleting campaign...');
    
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete campaign');
      }

      await loadCampaigns(currentUser.uid);
      toast.dismiss(loadingId);
      toast.success('Campaign deleted', campaign.name);
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.dismiss(loadingId);
      toast.error('Failed to delete campaign', error.message);
    }
  };

  const handleDuplicateCampaign = (campaign: Campaign) => {
    setFormData({
      name: `${campaign.name} (Copy)`,
      description: campaign.description,
      category: campaign.category,
      affiliateNetwork: campaign.affiliateNetwork,
    });
    setEditingCampaign(null);
    setOpenDialog(true);
  };

  const handleCreateFromTemplate = (template: any) => {
    setFormData({
      name: template.name,
      description: template.description,
      category: template.category,
      affiliateNetwork: template.network,
    });
    setTemplateDialogOpen(false);
    setOpenDialog(true);
  };

  // Filter and sort campaigns
  const filteredCampaigns = campaigns
    .filter(c => filterStatus === 'all' || c.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'revenue') return b.analytics.revenue - a.analytics.revenue;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'paused':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Loading state for authentication */}
      {!currentUser && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography color="text.secondary">Loading your campaigns...</Typography>
          </Box>
        </Box>
      )}

      {/* Main content */}
      {currentUser && (
        <>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Campaign Manager
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filteredCampaigns.length} campaigns • {campaigns.filter(c => c.status === 'active').length} active
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setTemplateDialogOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            Templates
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateCampaign}
            sx={{ borderRadius: 2 }}
          >
            New Campaign
          </Button>
        </Box>
      </Box>

      {/* Filters & Sort */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            label="Status"
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="paused">Paused</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            label="Sort By"
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <MenuItem value="recent">Most Recent</MenuItem>
            <MenuItem value="revenue">Highest Revenue</MenuItem>
            <MenuItem value="name">Name A-Z</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ flex: 1 }} />
        
        <Chip
          label={`Total Revenue: $${campaigns.reduce((sum, c) => sum + c.analytics.revenue, 0).toLocaleString()}`}
          color="success"
          sx={{ fontWeight: 600 }}
        />
      </Box>

      {/* Loading */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Campaigns Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
        {filteredCampaigns.map((campaign) => (
          <Box key={campaign.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Status & Actions */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Chip
                    label={campaign.status.toUpperCase()}
                    color={getStatusColor(campaign.status)}
                    size="small"
                  />
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleToggleStatus(campaign)}
                      color="primary"
                      title={campaign.status === 'active' ? 'Pause' : 'Activate'}
                    >
                      {campaign.status === 'active' ? <PauseIcon /> : <PlayIcon />}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDuplicateCampaign(campaign)}
                      color="primary"
                      title="Duplicate"
                    >
                      <AddIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEditCampaign(campaign)}
                      color="primary"
                      title="Edit"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteCampaign(campaign.id)}
                      color="error"
                      title="Delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                {/* Campaign Info */}
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {campaign.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {campaign.description}
                </Typography>

                {/* Meta Info */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip label={campaign.category} size="small" variant="outlined" />
                  <Chip label={campaign.affiliateNetwork} size="small" variant="outlined" />
                </Box>

                {/* Analytics */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 1,
                    mt: 2,
                    pt: 2,
                    borderTop: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Impressions
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {campaign.analytics.impressions.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Clicks
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {campaign.analytics.clicks.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Conversions
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {campaign.analytics.conversions}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Revenue
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="success.main">
                      ${campaign.analytics.revenue.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>

                {/* View Details */}
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<TrendingUpIcon />}
                  sx={{ mt: 2 }}
                >
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </Box>
        ))}

        {/* Empty State */}
        {!loading && campaigns.length === 0 && (
          <Box sx={{ gridColumn: '1 / -1' }}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No campaigns yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Create your first affiliate campaign to get started
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateCampaign}
                >
                  Create Campaign
                </Button>
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Campaign Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Summer Fashion Trends 2025"
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your campaign..."
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                label="Category"
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <MenuItem value="fashion">Fashion</MenuItem>
                <MenuItem value="beauty">Beauty</MenuItem>
                <MenuItem value="home">Home & Living</MenuItem>
                <MenuItem value="tech">Technology</MenuItem>
                <MenuItem value="fitness">Fitness</MenuItem>
                <MenuItem value="food">Food & Beverage</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Affiliate Network</InputLabel>
              <Select
                value={formData.affiliateNetwork}
                label="Affiliate Network"
                onChange={(e) =>
                  setFormData({ ...formData, affiliateNetwork: e.target.value })
                }
              >
                <MenuItem value="nordstrom">Nordstrom</MenuItem>
                <MenuItem value="amazon">Amazon Associates</MenuItem>
                <MenuItem value="shareasale">ShareASale</MenuItem>
                <MenuItem value="cj">CJ Affiliate</MenuItem>
                <MenuItem value="impact">Impact</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSaveCampaign}
            variant="contained"
            disabled={!formData.name.trim()}
          >
            {editingCampaign ? 'Save Changes' : 'Create Campaign'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Templates Dialog */}
      <Dialog open={templateDialogOpen} onClose={() => setTemplateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h5" fontWeight={700}>
            Campaign Templates
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Start with a pre-built campaign template
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, mt: 1 }}>
            {campaignTemplates.map((template) => (
              <Card
                key={template.id}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '2px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
                onClick={() => handleCreateFromTemplate(template)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Typography variant="h4">{template.icon}</Typography>
                    <Chip label={template.category} size="small" color="primary" variant="outlined" />
                  </Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {template.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {template.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      </>
      )}
    </Box>
  );
}
