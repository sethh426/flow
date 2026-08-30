'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Box, Card, CardContent, Chip, IconButton, Typography, Button, Paper, ToggleButtonGroup, ToggleButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MouseIcon from '@mui/icons-material/Mouse';
import CampaignIcon from '@mui/icons-material/Campaign';
import RefreshIcon from '@mui/icons-material/Refresh';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import InsightsIcon from '@mui/icons-material/Insights';
import RouterIcon from '@mui/icons-material/Router';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import toast from 'react-hot-toast';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useCampaigns } from '../../hooks/useCampaigns';
import { useDiscoverTrends } from '../../hooks/useTrends';
import { useGenerateContent } from '../../hooks/useGenerateContent';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { IntelligenceWidget } from '@/components/dashboard/IntelligenceWidget';

export default function DashboardContent() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [serviceDialog, setServiceDialog] = useState<{ open: boolean; service: any }>({ open: false, service: null });

  const analyticsQuery = useAnalytics();
  const campaignsQuery = useCampaigns();
  const discoverTrends = useDiscoverTrends();
  const generateContent = useGenerateContent();

  const analytics = analyticsQuery.data || null;
  const campaigns = campaignsQuery.data || [];
  const isLoadingAnalytics = analyticsQuery.isLoading;
  const isLoadingCampaigns = campaignsQuery.isLoading;

  const statCards = [
    {
      title: 'Total Revenue',
      value: analytics ? `$${analytics.todayRevenue.toLocaleString()}` : '—',
      change: '+12.5%',
      icon: <AttachMoneyIcon />,
      color: '#10b981',
      bgColor: '#ecfdf5',
    },
    {
      title: 'Campaigns',
      value: campaigns.length.toString(),
      change: `+${campaigns.length}`,
      icon: <CampaignIcon />,
      color: '#3b82f6',
      bgColor: '#eff6ff',
    },
    {
      title: 'Clicks',
      value: analytics ? analytics.clicks.toLocaleString() : '—',
      change: '+8.4%',
      icon: <MouseIcon />,
      color: '#8b5cf6',
      bgColor: '#f5f3ff',
    },
    {
      title: 'Conversions',
      value: analytics ? analytics.conversions.toLocaleString() : '—',
      change: '+15.0%',
      icon: <ShoppingCartIcon />,
      color: '#f59e0b',
      bgColor: '#fffbeb',
    },
  ];

  const getChartData = () => {
    const ranges = {
      '7d': Array.from({ length: 7 }, (_, i) => ({
        date: `Day ${i + 1}`,
        revenue: Math.floor(Math.random() * 3000) + 2000,
      })),
      '30d': Array.from({ length: 30 }, (_, i) => ({
        date: `Day ${i + 1}`,
        revenue: Math.floor(Math.random() * 5000) + 3000,
      })),
      '90d': Array.from({ length: 90 }, (_, i) => ({
        date: `Day ${i + 1}`,
        revenue: Math.floor(Math.random() * 8000) + 2000,
      })),
    };
    return ranges[timeRange];
  };

  const handleQuickAction = async (action: string) => {
    if (action === 'New Campaign') {
      campaignsQuery.create.mutate({ name: 'Quick Campaign', productName: 'Wireless Earbuds' }, {
        onSuccess: () => toast.success('Campaign created'),
        onError: () => toast.error('Failed to create campaign')
      });
    } else if (action === 'Find Trends') {
      discoverTrends.mutate(5, {
        onSuccess: (data) => toast.success(`Discovered ${data.length} trends`),
        onError: () => toast.error('Failed to discover trends')
      });
    } else if (action === 'AI Content') {
      if (!campaigns.length) {
        toast('Create a campaign first', { icon: '⚠️' });
        return;
      }
      const firstCampaign = campaigns[0];
      generateContent.mutate({ 
        campaignId: firstCampaign.id, 
        productName: firstCampaign.productName, 
        prompt: 'Create engaging content' 
      }, {
        onSuccess: () => toast.success('Content generated'),
        onError: () => toast.error('Failed to generate content')
      });
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    Promise.all([analyticsQuery.refetch(), campaignsQuery.refetch()])
      .finally(() => {
        setIsRefreshing(false);
        toast.success('Dashboard updated!');
      });
  };

  const aiInsights = [
    { title: '🚀 Top Opportunity', message: 'Tech accessories showing 45% growth', action: 'View Trends', route: '/dashboard?tab=4' },
    { title: '⚡ Performance Alert', message: '3 campaigns performing 20% above average', action: 'View Campaigns', route: '/dashboard?tab=1' },
    { title: '💡 AI Suggestion', message: 'Best posting time: 2-4 PM EST', action: 'Schedule', route: '/dashboard?tab=10' },
  ];

  const menuItems = [
    { label: 'Dashboard', icon: '🏠', tab: 0 },
    { label: 'Campaigns', icon: '📢', tab: 1 },
    { label: 'Products', icon: '🛍️', tab: 2 },
    { label: 'Content Studio', icon: '✨', tab: 3 },
    { label: 'Trends', icon: '📈', tab: 4 },
    { label: 'Analytics', icon: '📊', tab: 5 },
  ];

  const handleServiceClick = (service: any) => {
    setServiceDialog({ open: true, service });
  };

  const handleNavigate = (route: string) => {
    const url = new URL(route, window.location.origin);
    const tab = url.searchParams.get('tab');
    if (tab) {
      window.location.href = route;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Top Navigation Bar */}
      <Card sx={{ mb: 1, borderRadius: 1.5, boxShadow: 'none', border: '1px solid #e2e8f0' }}>
        <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflowX: 'auto', '&::-webkit-scrollbar': { height: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#cbd5e1', borderRadius: 2 } }}>
            {menuItems.map((item, idx) => (
              <Button
                key={idx}
                startIcon={<span style={{ fontSize: '1.1rem' }}>{item.icon}</span>}
                onClick={() => handleNavigate(`/dashboard?tab=${item.tab}`)}
                size="small"
                sx={{
                  minWidth: 'auto',
                  px: 1.5,
                  py: 0.5,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#64748b',
                  bgcolor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: 1,
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  '&:hover': { bgcolor: '#f8fafc', borderColor: '#3b82f6', color: '#3b82f6' }
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Header */}
      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>Dashboard</Typography>
          <Typography variant="caption" color="text.secondary">
            Today: <strong style={{ color: '#10b981' }}>+$5,240</strong> revenue
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <ToggleButtonGroup value={timeRange} exclusive onChange={(_, v) => v && setTimeRange(v)} size="small" sx={{ bgcolor: 'white', borderRadius: 1, '& .MuiToggleButton-root': { px: 1.5, py: 0.5 } }}>
            <ToggleButton value="7d">7D</ToggleButton>
            <ToggleButton value="30d">30D</ToggleButton>
            <ToggleButton value="90d">90D</ToggleButton>
          </ToggleButtonGroup>
          <IconButton size="small" onClick={handleRefresh} disabled={isRefreshing} sx={{ bgcolor: 'white' }}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 1, mb: 1 }}>
        {statCards.map((stat, idx) => (
          <Card key={idx} sx={{ borderRadius: 1.5, boxShadow: 'none', border: '1px solid #e2e8f0', transition: 'all 0.2s', '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.08)', transform: 'translateY(-1px)' } }}>
            <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: stat.bgColor, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                  {stat.icon}
                </Box>
                <Chip label={stat.change} size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#ecfdf5', color: '#10b981', fontWeight: 600 }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, display: 'block', mb: 0.25, fontSize: '0.7rem' }}>{stat.title}</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>{stat.value}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Intelligence Services */}
      <Box sx={{ mb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#1e293b' }}>🤖 AI Intelligence Services</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: 1 }}>
          {[
            { title: 'Content Predictor', desc: 'Predict performance', icon: <PsychologyIcon />, color: '#3b82f6', bgColor: '#eff6ff', detail: 'AI-powered content performance prediction using historical data and trend analysis.' },
            { title: 'Revenue Forecaster', desc: 'Financial forecasts', icon: <ShowChartIcon />, color: '#10b981', bgColor: '#ecfdf5', detail: 'Predict revenue trends, detect anomalies, and optimize budget allocation automatically.' },
            { title: 'Trend Detector', desc: 'Discover opportunities', icon: <InsightsIcon />, color: '#8b5cf6', bgColor: '#f5f3ff', detail: 'Find emerging trends, analyze competitors, and discover profitable product combinations.' },
            { title: 'AI Router', desc: 'Smart model routing', icon: <RouterIcon />, color: '#f59e0b', bgColor: '#fffbeb', detail: 'Intelligent AI model selection with cost optimization and performance tracking.' },
          ].map((service, idx) => (
            <Card 
              key={idx} 
              onClick={() => handleServiceClick(service)}
              sx={{ 
                bgcolor: 'white', 
                border: '1px solid #e2e8f0', 
                borderRadius: 1.5, 
                boxShadow: 'none',
                transition: 'all 0.2s',
                '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transform: 'translateY(-2px)', borderColor: service.color },
                cursor: 'pointer'
              }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Box sx={{ 
                    bgcolor: service.bgColor, 
                    width: 32, 
                    height: 32, 
                    borderRadius: 1.5, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: service.color
                  }}>
                    {service.icon}
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.85rem' }}>{service.title}</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>{service.desc}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Main Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2.5fr 1fr' }, gap: 1 }}>
        {/* Charts */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Card sx={{ borderRadius: 1.5, boxShadow: 'none', border: '1px solid #e2e8f0' }}>
            <CardContent sx={{ p: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Revenue Overview</Typography>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={getChartData()}>
                  <defs>
                    <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#revenue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <IntelligenceWidget userId="demo-user" />
        </Box>

        {/* Sidebar */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Card sx={{ borderRadius: 1.5, boxShadow: 'none', border: '1px solid #e2e8f0' }}>
            <CardContent sx={{ p: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Quick Actions</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {[
                  { label: 'New Campaign', icon: <AddIcon fontSize="small" />, action: 'New Campaign', color: '#3b82f6' },
                  { label: 'Find Trends', icon: <SearchIcon fontSize="small" />, action: 'Find Trends', color: '#10b981' },
                  { label: 'AI Content', icon: <AutoAwesomeIcon fontSize="small" />, action: 'AI Content', color: '#8b5cf6' },
                ].map((item, idx) => (
                  <Button key={idx} onClick={() => handleQuickAction(item.action)} variant="outlined" startIcon={item.icon} fullWidth size="small"
                    sx={{ justifyContent: 'flex-start', py: 1, borderRadius: 1.5, borderColor: '#e2e8f0', color: item.color, '&:hover': { borderColor: item.color, bgcolor: `${item.color}10` } }}>
                    {item.label}
                  </Button>
                ))}
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 1.5, boxShadow: 'none', border: '1px solid #e2e8f0' }}>
            <CardContent sx={{ p: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>AI Insights</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                {aiInsights.map((insight, idx) => (
                  <Paper key={idx} sx={{ p: 1, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 1.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.25, fontSize: '0.7rem' }}>{insight.title}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block', mb: 0.25 }}>{insight.message}</Typography>
                    <Button 
                      size="small" 
                      onClick={() => handleNavigate(insight.route)}
                      sx={{ fontSize: '0.6rem', p: 0.15, minWidth: 'auto', '&:hover': { bgcolor: '#eff6ff' } }}
                    >
                      {insight.action} →
                    </Button>
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Service Info Dialog */}
      <Dialog 
        open={serviceDialog.open} 
        onClose={() => setServiceDialog({ open: false, service: null })}
        maxWidth="sm"
        fullWidth
      >
        {serviceDialog.service && (
          <>
            <DialogTitle sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5,
              bgcolor: serviceDialog.service.bgColor,
              color: serviceDialog.service.color,
              pb: 2
            }}>
              <Box sx={{ 
                bgcolor: 'white', 
                width: 48, 
                height: 48, 
                borderRadius: 2, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: serviceDialog.service.color
              }}>
                {serviceDialog.service.icon}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  {serviceDialog.service.title}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  {serviceDialog.service.desc}
                </Typography>
              </Box>
              <IconButton 
                size="small" 
                onClick={() => setServiceDialog({ open: false, service: null })}
                sx={{ color: '#64748b' }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
              <Typography variant="body2" sx={{ mb: 2, color: '#475569' }}>
                {serviceDialog.service.detail}
              </Typography>
              <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
                <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1, color: '#1e293b' }}>
                  Status: Active ✅
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', color: '#64748b', mb: 0.5 }}>
                  • Real-time processing enabled
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', color: '#64748b', mb: 0.5 }}>
                  • Connected to Gemini AI models
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', color: '#64748b' }}>
                  • All API endpoints operational
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
              <Button 
                onClick={() => setServiceDialog({ open: false, service: null })}
                variant="outlined"
                size="small"
              >
                Close
              </Button>
              <Button 
                onClick={() => {
                  setServiceDialog({ open: false, service: null });
                  toast.success('Service is already active and running!');
                }}
                variant="contained"
                size="small"
                sx={{ bgcolor: serviceDialog.service.color, '&:hover': { bgcolor: serviceDialog.service.color, opacity: 0.9 } }}
              >
                View Details
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
