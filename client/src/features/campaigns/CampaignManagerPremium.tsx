'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Checkbox,
  Avatar,
  Tooltip,
  LinearProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Archive as ArchiveIcon,
  ContentCopy as CopyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
  AccountTree as WorkflowIcon,
  AutoAwesome,
  Insights as InsightsIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import workflowExecutionService from '@/services/workflow-execution';

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

type Order = 'asc' | 'desc';

export default function CampaignManager() {
  const { user } = useAuth(); // Get user from auth context
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState<keyof Campaign>('createdAt');
  const [order, setOrder] = useState<Order>('desc');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [activeView, setActiveView] = useState<'campaigns' | 'create' | 'analytics'>('campaigns');
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const [availableWorkflows, setAvailableWorkflows] = useState<any[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('');
  const [inventoryDialogOpen, setInventoryDialogOpen] = useState(false);

  // Advanced Features State
  const [optimizationDialogOpen, setOptimizationDialogOpen] = useState(false);
  const [predictionDialogOpen, setPredictionDialogOpen] = useState(false);
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [competitorDialogOpen, setCompetitorDialogOpen] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any>(null);
  const [budgetAllocation, setBudgetAllocation] = useState<any[]>([]);
  const [competitorData, setCompetitorData] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    affiliateNetwork: '',
    status: 'draft' as Campaign['status'],
  });

  useEffect(() => {
    if (user) {
      fetchCampaigns();
    }
    fetchAvailableWorkflows();
  }, [user]); // Add user as dependency

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      
      // Get userId from auth context
      if (!user?.uid) {
        console.log('No user ID available');
        setCampaigns([]);
        return;
      }
      
      const response = await fetch(`/api/campaigns?userId=${user.uid}`);
      const data = await response.json();
      
      // Check if response has campaigns array
      const campaignsList = data.campaigns || data;
      
      if (Array.isArray(campaignsList)) {
        setCampaigns(campaignsList.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
        })));
      } else {
        console.error('Invalid campaigns data format:', data);
        setCampaigns([]);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      showSnackbar('Failed to load campaigns', 'error');
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableWorkflows = async () => {
    try {
      // Simulate fetching workflows - in production this would be from your API
      const mockWorkflows = [
        { id: 'wf-1', name: 'Welcome Series', description: 'Automated welcome email sequence' },
        { id: 'wf-2', name: 'Product Launch', description: 'Social media posting automation' },
        { id: 'wf-3', name: 'Re-engagement', description: 'Win back inactive customers' },
        { id: 'wf-4', name: 'Flash Sale', description: 'Time-limited promotion workflow' },
      ];
      setAvailableWorkflows(mockWorkflows);
    } catch (error) {
      console.error('Error fetching workflows:', error);
    }
  };

  const handleCreateFromWorkflow = async () => {
    if (!selectedWorkflowId) {
      showSnackbar('Please select a workflow', 'error');
      return;
    }

    try {
      setLoading(true);
      const workflow = availableWorkflows.find(w => w.id === selectedWorkflowId);
      if (!workflow) return;

      // Create a mock Workflow object from the selected workflow
      const mockWorkflow = {
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
        nodes: [],
        edges: [],
        status: 'active' as const,
        createdAt: new Date(),
      };

      const newCampaign = await workflowExecutionService.createCampaignFromWorkflow(mockWorkflow);
      
      showSnackbar(`Campaign created from workflow: ${workflow.name}`, 'success');
      setWorkflowDialogOpen(false);
      setSelectedWorkflowId('');
      fetchCampaigns();
    } catch (error) {
      showSnackbar('Failed to create campaign from workflow', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkWorkflow = async (campaignId: string, workflowId: string) => {
    try {
      await workflowExecutionService.linkWorkflowToCampaign(workflowId, campaignId);
      showSnackbar('Workflow linked to campaign', 'success');
      fetchCampaigns();
    } catch (error) {
      showSnackbar('Failed to link workflow', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  // Advanced Features Handlers
  const handleGetOptimizations = async () => {
    try {
      setAiAnalyzing(true);
      setOptimizationDialogOpen(true);

      // Mock AI optimization suggestions
      const mockSuggestions = [
        {
          id: 1,
          title: 'Optimize Ad Schedule',
          description: 'Your campaigns perform 34% better between 6-9 PM. Adjust ad schedule accordingly.',
          impact: 'High',
          effort: 'Low',
          expectedIncrease: '+34%',
        },
        {
          id: 2,
          title: 'Refine Audience Targeting',
          description: 'Focus on 25-34 age group showing 2.3x higher conversion rates.',
          impact: 'High',
          effort: 'Medium',
          expectedIncrease: '+28%',
        },
        {
          id: 3,
          title: 'Update Creative Assets',
          description: 'Video content outperforms static images by 45%. Consider adding more video ads.',
          impact: 'Medium',
          effort: 'High',
          expectedIncrease: '+18%',
        },
        {
          id: 4,
          title: 'Bid Strategy Adjustment',
          description: 'Switch to automated bidding to reduce CPA by estimated 12%.',
          impact: 'Medium',
          effort: 'Low',
          expectedIncrease: '+12%',
        },
      ];

      setTimeout(() => {
        setOptimizationSuggestions(mockSuggestions);
        setAiAnalyzing(false);
      }, 1500);
    } catch (error) {
      showSnackbar('Failed to generate optimizations', 'error');
      setAiAnalyzing(false);
    }
  };

  const handleGetPredictions = async () => {
    try {
      setAiAnalyzing(true);
      setPredictionDialogOpen(true);

      // Mock performance predictions
      const mockPredictions = {
        nextMonth: {
          revenue: 15420,
          conversions: 847,
          clicks: 12350,
          confidence: 89,
        },
        trends: [
          { month: 'Jan', actual: 8500, predicted: 8700 },
          { month: 'Feb', actual: 9200, predicted: 9100 },
          { month: 'Mar', actual: 10100, predicted: 10300 },
          { month: 'Apr', actual: 11500, predicted: 11200 },
          { month: 'May', actual: 12800, predicted: 13100 },
          { month: 'Jun', actual: null, predicted: 15420 },
        ],
        insights: [
          'Revenue expected to grow 20% next month',
          'Seasonal trend shows strong Q2 performance',
          'Current trajectory suggests 180K annual revenue',
        ],
      };

      setTimeout(() => {
        setPredictions(mockPredictions);
        setAiAnalyzing(false);
      }, 1500);
    } catch (error) {
      showSnackbar('Failed to generate predictions', 'error');
      setAiAnalyzing(false);
    }
  };

  const handleSmartBudget = async () => {
    try {
      setAiAnalyzing(true);
      setBudgetDialogOpen(true);

      // Mock smart budget allocation
      const mockAllocation = [
        {
          campaign: 'Summer Fashion Campaign',
          currentBudget: 5000,
          suggestedBudget: 7500,
          roi: 3.2,
          reason: 'High ROI - increase investment',
        },
        {
          campaign: 'Tech Accessories Promo',
          currentBudget: 3000,
          suggestedBudget: 3500,
          roi: 2.8,
          reason: 'Strong performer - moderate increase',
        },
        {
          campaign: 'Home Decor Sale',
          currentBudget: 4000,
          suggestedBudget: 2500,
          roi: 1.2,
          reason: 'Underperforming - reduce budget',
        },
        {
          campaign: 'Beauty Products Launch',
          currentBudget: 2000,
          suggestedBudget: 2000,
          roi: 2.0,
          reason: 'Optimal allocation - maintain',
        },
      ];

      setTimeout(() => {
        setBudgetAllocation(mockAllocation);
        setAiAnalyzing(false);
      }, 1500);
    } catch (error) {
      showSnackbar('Failed to generate budget recommendations', 'error');
      setAiAnalyzing(false);
    }
  };

  const handleCompetitorAnalysis = async () => {
    try {
      setAiAnalyzing(true);
      setCompetitorDialogOpen(true);

      // Mock competitor analysis
      const mockCompetitors = [
        {
          name: 'Competitor A',
          adSpend: '$45K/mo',
          topKeywords: ['fashion deals', 'summer sale', 'trendy clothes'],
          avgCPC: '$1.20',
          estimatedTraffic: '125K',
          opportunities: 'Target untapped keywords: "sustainable fashion", "eco-friendly"',
        },
        {
          name: 'Competitor B',
          adSpend: '$32K/mo',
          topKeywords: ['discount fashion', 'clearance sale', 'outlet deals'],
          avgCPC: '$0.95',
          estimatedTraffic: '98K',
          opportunities: 'Lower CPC strategy possible in clearance segment',
        },
        {
          name: 'Competitor C',
          adSpend: '$28K/mo',
          topKeywords: ['luxury fashion', 'designer brands', 'premium style'],
          avgCPC: '$2.10',
          estimatedTraffic: '67K',
          opportunities: 'Premium segment shows less competition',
        },
      ];

      setTimeout(() => {
        setCompetitorData(mockCompetitors);
        setAiAnalyzing(false);
      }, 1500);
    } catch (error) {
      showSnackbar('Failed to analyze competitors', 'error');
      setAiAnalyzing(false);
    }
  };

  const handleSort = (property: keyof Campaign) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = filteredCampaigns.map((c) => c.id);
      setSelected(newSelected);
    } else {
      setSelected([]);
    }
  };

  const handleSelectOne = (id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, campaign: Campaign) => {
    setAnchorEl(event.currentTarget);
    setSelectedCampaign(campaign);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    if (selectedCampaign) {
      setFormData({
        name: selectedCampaign.name,
        description: selectedCampaign.description,
        category: selectedCampaign.category,
        affiliateNetwork: selectedCampaign.affiliateNetwork,
        status: selectedCampaign.status,
      });
      setDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    if (!selectedCampaign) return;

    try {
      await fetch(`/api/campaigns/${selectedCampaign.id}`, { method: 'DELETE' });
      showSnackbar('Campaign deleted successfully', 'success');
      fetchCampaigns();
      setDeleteDialogOpen(false);
      setSelectedCampaign(null);
    } catch (error) {
      showSnackbar('Failed to delete campaign', 'error');
    }
  };

  const handleToggleStatus = async (campaign: Campaign) => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    
    try {
      await fetch(`/api/campaigns/${campaign.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      showSnackbar(`Campaign ${newStatus}`, 'success');
      fetchCampaigns();
    } catch (error) {
      showSnackbar('Failed to update campaign', 'error');
    }
    handleMenuClose();
  };

  const handleBulkAction = async (action: 'activate' | 'pause' | 'delete') => {
    try {
      if (action === 'delete') {
        await Promise.all(selected.map(id => 
          fetch(`/api/campaigns/${id}`, { method: 'DELETE' })
        ));
        showSnackbar(`${selected.length} campaigns deleted`, 'success');
      } else {
        const newStatus = action === 'activate' ? 'active' : 'paused';
        await Promise.all(selected.map(id =>
          fetch(`/api/campaigns/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
          })
        ));
        showSnackbar(`${selected.length} campaigns ${newStatus}`, 'success');
      }
      setSelected([]);
      fetchCampaigns();
    } catch (error) {
      showSnackbar('Bulk action failed', 'error');
    }
  };

  const handleSave = async () => {
    try {
      if (!user?.uid) {
        showSnackbar('You must be logged in to save campaigns', 'error');
        return;
      }

      const url = selectedCampaign 
        ? `/api/campaigns/${selectedCampaign.id}`
        : '/api/campaigns';
      
      const method = selectedCampaign ? 'PATCH' : 'POST';

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userId: user.uid }),
      });

      showSnackbar(
        selectedCampaign ? 'Campaign updated' : 'Campaign created',
        'success'
      );
      setDialogOpen(false);
      setSelectedCampaign(null);
      setFormData({
        name: '',
        description: '',
        category: '',
        affiliateNetwork: '',
        status: 'draft',
      });
      fetchCampaigns();
    } catch (error) {
      showSnackbar('Failed to save campaign', 'error');
    }
  };

  // Filter and sort campaigns
  const filteredCampaigns = campaigns
    .filter(campaign => {
      const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           campaign.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      
      if (!aValue && !bValue) return 0;
      if (!aValue) return 1;
      if (!bValue) return -1;
      
      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });

  const paginatedCampaigns = filteredCampaigns.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'draft': return 'default';
      case 'archived': return 'error';
    }
  };

  const calculateCTR = (campaign: Campaign) => {
    if (campaign.analytics.impressions === 0) return 0;
    return ((campaign.analytics.clicks / campaign.analytics.impressions) * 100).toFixed(2);
  };

  const calculateConversionRate = (campaign: Campaign) => {
    if (campaign.analytics.clicks === 0) return 0;
    return ((campaign.analytics.conversions / campaign.analytics.clicks) * 100).toFixed(2);
  };

  return (
    <Box>
      {/* Main Content Card - No clutter */}
      {activeView === 'campaigns' && (
        <Card sx={{ borderRadius: 3, minHeight: 600 }}>
          <CardContent sx={{ p: 6 }}>
            {/* Toolbar with search and advanced features */}
            <Box sx={{ mb: 4, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ flex: 1, maxWidth: 400 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              
              {/* Advanced Feature Buttons */}
              <Button
                variant="outlined"
                startIcon={<AutoAwesome />}
                onClick={handleGetOptimizations}
                sx={{ whiteSpace: 'nowrap' }}
              >
                AI Optimize
              </Button>
              <Button
                variant="outlined"
                startIcon={<TrendingUpIcon />}
                onClick={handleGetPredictions}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Predictions
              </Button>
              <Button
                variant="outlined"
                startIcon={<InsightsIcon />}
                onClick={handleSmartBudget}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Smart Budget
              </Button>
              <Button
                variant="outlined"
                startIcon={<InsightsIcon />}
                onClick={handleCompetitorAnalysis}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Competitors
              </Button>
            </Box>

            {loading && <LinearProgress sx={{ mb: 3 }} />}

            {/* Campaigns Table */}
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={selected.length > 0 && selected.length < filteredCampaigns.length}
                        checked={filteredCampaigns.length > 0 && selected.length === filteredCampaigns.length}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Campaign
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Status
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Clicks
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Conversions
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Revenue
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Actions
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedCampaigns.map((campaign) => {
                    const isSelected = selected.indexOf(campaign.id) !== -1;
                    
                    return (
                      <TableRow
                        key={campaign.id}
                        selected={isSelected}
                        hover
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isSelected}
                            onChange={() => handleSelectOne(campaign.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {campaign.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                {campaign.category} • {campaign.affiliateNetwork}
                              </Typography>
                              {campaign.workflowId && (
                                <Tooltip title={`Workflow: ${campaign.workflowStatus || 'active'}`}>
                                  <Chip
                                    icon={<WorkflowIcon />}
                                    label="Automated"
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                    sx={{ fontSize: '0.7rem', height: 20 }}
                                  />
                                </Tooltip>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={campaign.status}
                            color={getStatusColor(campaign.status)}
                            size="medium"
                            sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body1">
                            {campaign.analytics.clicks.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body1">
                            {campaign.analytics.conversions}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>
                            ${campaign.analytics.revenue.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            onClick={(e) => handleMenuOpen(e, campaign)}
                            sx={{ width: 48, height: 48 }}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {paginatedCampaigns.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No campaigns found
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          Create your first campaign to get started!
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={filteredCampaigns.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25]}
            />

            {/* Simple bottom action */}
            <Box sx={{ mt: 4, pt: 4, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<WorkflowIcon />}
                onClick={() => setWorkflowDialogOpen(true)}
                sx={{ minHeight: 56, px: 6, fontSize: '1.125rem' }}
              >
                Create from Workflow
              </Button>
              <Button
                variant="contained"
                onClick={() => setActiveView('create')}
                sx={{ minHeight: 56, px: 6, fontSize: '1.125rem' }}
              >
                Create New Campaign
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {activeView === 'create' && (
        <Card sx={{ borderRadius: 3, minHeight: 600 }}>
          <CardContent sx={{ p: 6 }}>
            <Box sx={{ maxWidth: 600, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <TextField
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
                required
                autoFocus
                placeholder="Campaign Name"
                InputProps={{ style: { fontSize: '1.25rem' } }}
              />
              
              <TextField
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                fullWidth
                multiline
                rows={4}
                placeholder="Description"
                InputProps={{ style: { fontSize: '1.125rem' } }}
              />
              
              <TextField
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                fullWidth
                placeholder="Category (e.g., Fashion, Technology, Home & Garden)"
                InputProps={{ style: { fontSize: '1.125rem' } }}
              />
              
              <TextField
                value={formData.affiliateNetwork}
                onChange={(e) => setFormData({ ...formData, affiliateNetwork: e.target.value })}
                fullWidth
                placeholder="Affiliate Network (e.g., Amazon Associates, ShareASale)"
                InputProps={{ style: { fontSize: '1.125rem' } }}
              />

              {/* Inventory Solutions Helper */}
              <Box sx={{ 
                p: 3, 
                borderRadius: 2, 
                bgcolor: 'info.50', 
                border: '1px solid', 
                borderColor: 'info.200',
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}>
                <Typography variant="body1" color="text.secondary">
                  Don&apos;t have products to sell?
                </Typography>
                <Button
                  variant="text"
                  color="primary"
                  onClick={() => setInventoryDialogOpen(true)}
                  sx={{ 
                    alignSelf: 'flex-start', 
                    fontSize: '1rem',
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  See our product solutions →
                </Button>
              </Box>

              <Box sx={{ display: 'flex', gap: 3, mt: 4 }}>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => {
                    setFormData({
                      name: '',
                      description: '',
                      category: '',
                      affiliateNetwork: '',
                      status: 'draft',
                    });
                    setActiveView('campaigns');
                  }}
                  sx={{ minHeight: 56, flex: 1, fontSize: '1.125rem' }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSave}
                  sx={{ minHeight: 56, flex: 2, fontSize: '1.125rem' }}
                >
                  Create Campaign
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {activeView === 'analytics' && (
        <Card sx={{ borderRadius: 3, minHeight: 600 }}>
          <CardContent sx={{ p: 6 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 4 }}>
              Campaign Analytics Overview
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
              <Box sx={{ p: 4, borderRadius: 3, bgcolor: 'primary.50', border: '2px solid', borderColor: 'primary.200' }}>
                <Typography variant="h3" fontWeight={700} color="primary.main">
                  {campaigns.filter(c => c.status === 'active').length}
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
                  Active Campaigns
                </Typography>
              </Box>

              <Box sx={{ p: 4, borderRadius: 3, bgcolor: 'success.50', border: '2px solid', borderColor: 'success.200' }}>
                <Typography variant="h3" fontWeight={700} color="success.main">
                  ${campaigns.reduce((sum, c) => sum + c.analytics.revenue, 0).toLocaleString()}
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
                  Total Revenue
                </Typography>
              </Box>

              <Box sx={{ p: 4, borderRadius: 3, bgcolor: 'info.50', border: '2px solid', borderColor: 'info.200' }}>
                <Typography variant="h3" fontWeight={700} color="info.main">
                  {campaigns.reduce((sum, c) => sum + c.analytics.clicks, 0).toLocaleString()}
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
                  Total Clicks
                </Typography>
              </Box>

              <Box sx={{ p: 4, borderRadius: 3, bgcolor: 'warning.50', border: '2px solid', borderColor: 'warning.200' }}>
                <Typography variant="h3" fontWeight={700} color="warning.main">
                  {campaigns.reduce((sum, c) => sum + c.analytics.conversions, 0)}
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
                  Total Conversions
                </Typography>
              </Box>
            </Box>

            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mt: 6, mb: 3 }}>
              Top Performing Campaigns
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {campaigns
                .sort((a, b) => b.analytics.revenue - a.analytics.revenue)
                .slice(0, 5)
                .map((campaign, index) => (
                  <Box
                    key={campaign.id}
                    sx={{
                      p: 4,
                      borderRadius: 3,
                      border: '2px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'primary.50',
                      },
                    }}
                  >
                    <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, fontSize: '1.5rem', fontWeight: 700 }}>
                      #{index + 1}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={600}>
                        {campaign.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {campaign.analytics.clicks.toLocaleString()} clicks • {campaign.analytics.conversions} conversions
                      </Typography>
                    </Box>
                    <Typography variant="h5" fontWeight={700} color="success.main">
                      ${campaign.analytics.revenue.toLocaleString()}
                    </Typography>
                  </Box>
                ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 2 }} fontSize="small" />
          Edit
        </MenuItem>
        <MenuItem onClick={() => selectedCampaign && handleToggleStatus(selectedCampaign)}>
          {selectedCampaign?.status === 'active' ? <PauseIcon sx={{ mr: 2 }} fontSize="small" /> : <PlayIcon sx={{ mr: 2 }} fontSize="small" />}
          {selectedCampaign?.status === 'active' ? 'Pause' : 'Activate'}
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <CopyIcon sx={{ mr: 2 }} fontSize="small" />
          Duplicate
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 2 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Campaign</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
              placeholder="Campaign Name"
            />
            <TextField
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
              placeholder="Description"
            />
            <TextField
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              fullWidth
              placeholder="Category (e.g., Fashion, Technology, Home & Garden)"
            />
            <TextField
              value={formData.affiliateNetwork}
              onChange={(e) => setFormData({ ...formData, affiliateNetwork: e.target.value })}
              fullWidth
              placeholder="Affiliate Network (e.g., Amazon Associates, ShareASale)"
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Campaign['status'] })}
                label="Status"
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="paused">Paused</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDialogOpen(false)} size="large">Cancel</Button>
          <Button variant="contained" onClick={handleSave} size="large">Update</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Campaign?</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete &quot;{selectedCampaign?.name}&quot;? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} size="large">Cancel</Button>
          <Button variant="contained" color="error" onClick={confirmDelete} size="large">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Create from Workflow Dialog */}
      <Dialog open={workflowDialogOpen} onClose={() => setWorkflowDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WorkflowIcon />
            Create Campaign from Workflow
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
              Select a workflow to automatically create and configure a campaign with pre-built automation
            </Typography>

            {availableWorkflows.length === 0 ? (
              <Alert severity="info">
                No workflows available. Create a workflow first to use this feature.
              </Alert>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {availableWorkflows.map((workflow) => (
                  <Card
                    key={workflow.id}
                    sx={{
                      cursor: 'pointer',
                      border: selectedWorkflowId === workflow.id ? '2px solid' : '1px solid',
                      borderColor: selectedWorkflowId === workflow.id ? 'primary.main' : 'divider',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        transform: 'translateY(-2px)',
                        boxShadow: 3,
                      },
                    }}
                    onClick={() => setSelectedWorkflowId(workflow.id)}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: selectedWorkflowId === workflow.id ? 'primary.main' : 'grey.200',
                            width: 56,
                            height: 56,
                            flexShrink: 0,
                          }}
                        >
                          <WorkflowIcon />
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography 
                            variant="h6" 
                            fontWeight={700} 
                            gutterBottom
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {workflow.name}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{
                              lineHeight: 1.5,
                              mb: selectedWorkflowId === workflow.id ? 1 : 0,
                            }}
                          >
                            {workflow.description}
                          </Typography>
                          {selectedWorkflowId === workflow.id && (
                            <Chip
                              label="Selected"
                              color="primary"
                              size="small"
                              sx={{ mt: 1, fontWeight: 600 }}
                            />
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}

            {loading && (
              <Box sx={{ mt: 3 }}>
                <LinearProgress />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                  Creating campaign from workflow...
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setWorkflowDialogOpen(false)} size="large">Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateFromWorkflow}
            disabled={!selectedWorkflowId || loading}
            size="large"
            startIcon={<AddIcon />}
          >
            Create Campaign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Inventory Solutions Dialog */}
      <Dialog 
        open={inventoryDialogOpen} 
        onClose={() => setInventoryDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h5" fontWeight={700}>
              Product Solutions for Your Campaigns
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
              Don&apos;t have products to sell yet? We&apos;ve got you covered! Choose from our solutions to start earning with your campaigns.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Printify Integration */}
              <Card
                sx={{
                  border: '2px solid',
                  borderColor: 'primary.main',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'start', gap: 3 }}>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 72,
                        height: 72,
                        fontSize: '2rem',
                        flexShrink: 0,
                      }}
                    >
                      🖨️
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        Printify Integration
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
                        Connect with Printify&apos;s print-on-demand platform. Create and sell custom products with:
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label="No Inventory Required" size="small" color="success" />
                          <Chip label="Custom Designs" size="small" color="success" />
                          <Chip label="Automatic Fulfillment" size="small" color="success" />
                        </Box>
                      </Box>
                      <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        sx={{ 
                          fontSize: '1rem', 
                          fontWeight: 600,
                          textTransform: 'none',
                          py: 1.5
                        }}
                      >
                        Connect Printify Account
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Designated Inventory - Coming Soon */}
              <Card
                sx={{
                  border: '2px solid',
                  borderColor: 'info.main',
                  position: 'relative',
                  overflow: 'visible',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: -12,
                    right: 24,
                    bgcolor: 'warning.main',
                    color: 'white',
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    boxShadow: 3,
                  }}
                >
                  COMING SOON
                </Box>
                <CardContent sx={{ p: 4, mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'start', gap: 3 }}>
                    <Avatar
                      sx={{
                        bgcolor: 'info.main',
                        width: 72,
                        height: 72,
                        fontSize: '2rem',
                        flexShrink: 0,
                      }}
                    >
                      📦
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        Affiliate Flow Designated Inventory
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
                        Sell physical products curated by Affiliate Flow. We provide the inventory, you market and earn:
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Chip label="Pre-Vetted Products" size="small" color="info" />
                          <Chip label="Competitive Pricing" size="small" color="info" />
                          <Chip label="Dropshipping Support" size="small" color="info" />
                        </Box>
                      </Box>
                      <Button
                        variant="outlined"
                        size="large"
                        fullWidth
                        disabled
                        sx={{ 
                          fontSize: '1rem', 
                          fontWeight: 600,
                          textTransform: 'none',
                          py: 1.5
                        }}
                      >
                        Get Notified When Available
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Info Box */}
              <Box sx={{ 
                p: 3, 
                borderRadius: 2, 
                bgcolor: 'grey.100',
                border: '1px dashed',
                borderColor: 'grey.400'
              }}>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  <strong>Note:</strong> All campaigns require trackable product links/URLs. These solutions help you source products to sell without managing physical inventory yourself.
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setInventoryDialogOpen(false)} 
            size="large"
            variant="contained"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI Optimization Dialog */}
      <Dialog open={optimizationDialogOpen} onClose={() => setOptimizationDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesome sx={{ color: 'primary.main' }} />
            AI Campaign Optimization
          </Box>
        </DialogTitle>
        <DialogContent>
          {aiAnalyzing ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <LinearProgress sx={{ mb: 2 }} />
              <Typography color="text.secondary">Analyzing campaigns and generating recommendations...</Typography>
            </Box>
          ) : (
            <Box sx={{ pt: 2 }}>
              {optimizationSuggestions.map((suggestion) => (
                <Card key={suggestion.id} sx={{ mb: 2, p: 3, border: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {suggestion.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {suggestion.description}
                      </Typography>
                    </Box>
                    <Chip 
                      label={`${suggestion.expectedIncrease} Expected`} 
                      color="success" 
                      size="small" 
                      sx={{ ml: 2 }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip label={`Impact: ${suggestion.impact}`} size="small" color={suggestion.impact === 'High' ? 'error' : 'warning'} />
                    <Chip label={`Effort: ${suggestion.effort}`} size="small" variant="outlined" />
                    <Button size="small" variant="contained" sx={{ ml: 'auto' }} onClick={() => showSnackbar(`Applied suggestion: ${suggestion.title}`, 'success')}>
                      Apply Suggestion
                    </Button>
                  </Box>
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOptimizationDialogOpen(false)}>Close</Button>
          {!aiAnalyzing && optimizationSuggestions.length === 0 && (
            <Button variant="contained" onClick={handleGetOptimizations}>
              Get Recommendations
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Performance Predictions Dialog */}
      <Dialog open={predictionDialogOpen} onClose={() => setPredictionDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon sx={{ color: 'primary.main' }} />
            Performance Predictions
          </Box>
        </DialogTitle>
        <DialogContent>
          {aiAnalyzing ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <LinearProgress sx={{ mb: 2 }} />
              <Typography color="text.secondary">Analyzing historical data and generating forecasts...</Typography>
            </Box>
          ) : predictions ? (
            <Box sx={{ pt: 2 }}>
              <Card sx={{ p: 3, mb: 3, bgcolor: 'primary.50' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Next Month Forecast
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mt: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Revenue</Typography>
                    <Typography variant="h5" fontWeight={700} color="success.main">
                      ${predictions.nextMonth.revenue.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Conversions</Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {predictions.nextMonth.conversions}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Confidence</Typography>
                    <Typography variant="h5" fontWeight={700} color="primary.main">
                      {predictions.nextMonth.confidence}%
                    </Typography>
                  </Box>
                </Box>
              </Card>

              <Typography variant="h6" fontWeight={600} gutterBottom>
                Key Insights
              </Typography>
              <Box sx={{ mb: 3 }}>
                {predictions.insights.map((insight: string, idx: number) => (
                  <Alert key={idx} severity="info" sx={{ mb: 1 }}>
                    {insight}
                  </Alert>
                ))}
              </Box>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setPredictionDialogOpen(false)}>Close</Button>
          {!aiAnalyzing && !predictions && (
            <Button variant="contained" onClick={handleGetPredictions}>
              Generate Predictions
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Smart Budget Allocation Dialog */}
      <Dialog open={budgetDialogOpen} onClose={() => setBudgetDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InsightsIcon sx={{ color: 'primary.main' }} />
            Smart Budget Allocation
          </Box>
        </DialogTitle>
        <DialogContent>
          {aiAnalyzing ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <LinearProgress sx={{ mb: 2 }} />
              <Typography color="text.secondary">Calculating optimal budget distribution...</Typography>
            </Box>
          ) : (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                AI-powered recommendations to optimize your budget allocation across campaigns
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Campaign</TableCell>
                      <TableCell align="right">Current</TableCell>
                      <TableCell align="right">Suggested</TableCell>
                      <TableCell align="right">ROI</TableCell>
                      <TableCell>Recommendation</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {budgetAllocation.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.campaign}</TableCell>
                        <TableCell align="right">${item.currentBudget.toLocaleString()}</TableCell>
                        <TableCell align="right">
                          <Typography 
                            fontWeight={600}
                            color={item.suggestedBudget > item.currentBudget ? 'success.main' : item.suggestedBudget < item.currentBudget ? 'error.main' : 'text.primary'}
                          >
                            ${item.suggestedBudget.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={`${item.roi.toFixed(1)}x`} 
                            size="small" 
                            color={item.roi >= 2.5 ? 'success' : item.roi >= 1.5 ? 'warning' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {item.reason}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ mt: 3, p: 2, bgcolor: 'info.50', borderRadius: 2 }}>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Recommended Actions:
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  • Increase budget for high-ROI campaigns<br />
                  • Reduce spending on underperforming campaigns<br />
                  • Reallocate savings to top performers
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setBudgetDialogOpen(false)}>Close</Button>
          {!aiAnalyzing && budgetAllocation.length === 0 && (
            <Button variant="contained" onClick={handleSmartBudget}>
              Generate Recommendations
            </Button>
          )}
          {budgetAllocation.length > 0 && (
            <Button variant="contained">Apply All Suggestions</Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Competitor Analysis Dialog */}
      <Dialog open={competitorDialogOpen} onClose={() => setCompetitorDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InsightsIcon sx={{ color: 'primary.main' }} />
            Competitor Analysis
          </Box>
        </DialogTitle>
        <DialogContent>
          {aiAnalyzing ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <LinearProgress sx={{ mb: 2 }} />
              <Typography color="text.secondary">Analyzing competitor strategies and market positioning...</Typography>
            </Box>
          ) : (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Insights about your top competitors&apos; advertising strategies and opportunities
              </Typography>

              {competitorData.map((competitor, idx) => (
                <Card key={idx} sx={{ mb: 2, p: 3, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {competitor.name}
                  </Typography>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Monthly Ad Spend</Typography>
                      <Typography variant="body1" fontWeight={600}>{competitor.adSpend}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Avg CPC</Typography>
                      <Typography variant="body1" fontWeight={600}>{competitor.avgCPC}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Est. Traffic</Typography>
                      <Typography variant="body1" fontWeight={600}>{competitor.estimatedTraffic}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Top Keywords</Typography>
                      <Typography variant="body2">{competitor.topKeywords.length}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Top Keywords:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                      {competitor.topKeywords.map((keyword: string, i: number) => (
                        <Chip key={i} label={keyword} size="small" />
                      ))}
                    </Box>
                  </Box>

                  <Alert severity="success" sx={{ mt: 2 }}>
                    <Typography variant="body2" fontWeight={600} gutterBottom>
                      Opportunity:
                    </Typography>
                    <Typography variant="caption">
                      {competitor.opportunities}
                    </Typography>
                  </Alert>
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setCompetitorDialogOpen(false)}>Close</Button>
          {!aiAnalyzing && competitorData.length === 0 && (
            <Button variant="contained" onClick={handleCompetitorAnalysis}>
              Analyze Competitors
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
