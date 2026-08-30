'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Avatar, Chip, LinearProgress, IconButton, Typography, Button, Paper, ToggleButtonGroup, ToggleButton, Fade, Grow, Slide, Zoom } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MouseIcon from '@mui/icons-material/Mouse';
import CampaignIcon from '@mui/icons-material/Campaign';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TrendingUpSharpIcon from '@mui/icons-material/TrendingUpSharp';
import BrushIcon from '@mui/icons-material/Brush';
import InsightsIcon from '@mui/icons-material/Insights';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import RefreshIcon from '@mui/icons-material/Refresh';
import toast from 'react-hot-toast';
// Data hooks
import { useAnalytics } from '../../hooks/useAnalytics';
import { useCampaigns } from '../../hooks/useCampaigns';
import { useDiscoverTrends } from '../../hooks/useTrends';
import { useGenerateContent } from '../../hooks/useGenerateContent';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { IntelligenceWidget } from '@/components/dashboard/IntelligenceWidget';

// Futuristic Cyberpunk Theme
const neonColors = {
  cyan: '#00f0ff',
  magenta: '#ff00ff',
  purple: '#9d4edd',
  blue: '#4cc9f0',
  pink: '#ff006e',
  green: '#06ffa5',
  yellow: '#ffbe0b',
};

// Keyframe animations
const pulseAnimation = {
  '@keyframes pulse': {
    '0%, 100%': { opacity: 1, transform: 'scale(1)' },
    '50%': { opacity: 0.8, transform: 'scale(1.05)' },
  },
};

const shimmerAnimation = {
  '@keyframes shimmer': {
    '0%': { backgroundPosition: '-200% 0' },
    '100%': { backgroundPosition: '200% 0' },
  },
};

const glowAnimation = {
  '@keyframes glow': {
    '0%, 100%': { boxShadow: '0 0 5px rgba(0, 240, 255, 0.5), 0 0 20px rgba(0, 240, 255, 0.3)' },
    '50%': { boxShadow: '0 0 20px rgba(0, 240, 255, 0.8), 0 0 40px rgba(0, 240, 255, 0.5)' },
  },
};

const scanlineAnimation = {
  '@keyframes scanline': {
    '0%': { transform: 'translateY(-100%)' },
    '100%': { transform: 'translateY(100%)' },
  },
};

const floatAnimation = {
  '@keyframes float': {
    '0%, 100%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-15px)' },
  },
};

const slideInLeft = {
  '@keyframes slideInLeft': {
    '0%': { transform: 'translateX(-100%)', opacity: 0 },
    '100%': { transform: 'translateX(0)', opacity: 1 },
  },
};

const slideInRight = {
  '@keyframes slideInRight': {
    '0%': { transform: 'translateX(100%)', opacity: 0 },
    '100%': { transform: 'translateX(0)', opacity: 1 },
  },
};

// Glassmorphic card style
const glassCard = {
  background: 'rgba(10, 10, 30, 0.7)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(0, 240, 255, 0.2)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    border: '1px solid rgba(0, 240, 255, 0.5)',
    boxShadow: '0 8px 32px rgba(0, 240, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
    transform: 'translateY(-4px)',
  },
};

export default function DashboardContent() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showGoals, setShowGoals] = useState(false);

  // React Query hooks
  const analyticsQuery = useAnalytics();
  const campaignsQuery = useCampaigns();
  const discoverTrends = useDiscoverTrends();
  const generateContent = useGenerateContent();

  // Local UI state derived from mutations
  const creatingCampaign = campaignsQuery.create.isPending;
  const generatingContent = generateContent.isPending;
  const discoveringTrends = discoverTrends.isPending;
  const trends = discoverTrends.data || [];
  const analytics = analyticsQuery.data || null;
  const campaigns = campaignsQuery.data || [];
  const isLoadingAnalytics = analyticsQuery.isLoading || analyticsQuery.isFetching;
  const isLoadingCampaigns = campaignsQuery.isLoading || campaignsQuery.isFetching;

  const statCards = [
    {
      title: 'Total Revenue Today',
      value: analytics ? `$${analytics.todayRevenue.toLocaleString()}` : '—',
      change: analytics ? '+LIVE' : '—',
      trend: 'up',
      icon: <AttachMoneyIcon />,
      color: '#10b981',
      bgColor: '#ecfdf5',
      subtext: 'Synthetic estimate',
      loading: isLoadingAnalytics,
    },
    {
      title: 'Active Campaigns',
      value: analytics ? analytics.campaignCount.toString() : '—',
      change: campaigns.length ? `${campaigns.length}` : '—',
      trend: 'up',
      icon: <CampaignIcon />,
      color: '#3b82f6',
      bgColor: '#eff6ff',
      subtext: 'Stored campaigns',
      loading: isLoadingCampaigns,
    },
    {
      title: 'Total Clicks',
      value: analytics ? analytics.clicks.toLocaleString() : '—',
      change: '+LIVE',
      trend: 'up',
      icon: <MouseIcon />,
      color: '#8b5cf6',
      bgColor: '#f5f3ff',
      subtext: 'Synthetic metric',
      loading: isLoadingAnalytics,
    },
    {
      title: 'Conversions',
      value: analytics ? analytics.conversions.toLocaleString() : '—',
      change: '+LIVE',
      trend: 'up',
      icon: <ShoppingCartIcon />,
      color: '#f59e0b',
      bgColor: '#fffbeb',
      subtext: 'Derived rate',
      loading: isLoadingAnalytics,
    },
  ];

  const handleQuickAction = async (action: string) => {
    if (action === 'New Campaign') {
      campaignsQuery.create.mutate({ name: 'Quick Campaign', productName: 'Wireless Earbuds' }, {
        onSuccess: () => toast.success('Campaign created'),
        onError: () => toast.error('Campaign creation failed')
      });
    } else if (action === 'Find Trends') {
      discoverTrends.mutate(5, {
        onSuccess: (data) => toast.success(`Discovered ${data.length} trends`),
        onError: () => toast.error('Trend discovery failed')
      });
    } else if (action === 'AI Content') {
      if (!campaigns.length) {
        toast('Create a campaign first', { icon: '⚠️' });
        return;
      }
      const firstCampaign = campaigns[0];
      generateContent.mutate({ campaignId: firstCampaign.id, productName: firstCampaign.productName, prompt: 'Boost engagement with a persuasive post' }, {
        onSuccess: () => toast.success('Content generated'),
        onError: () => toast.error('Content generation failed')
      });
    } else if (action === 'Analytics') {
      analyticsQuery.refetch();
      toast.success('Analytics refreshed');
    }
  };

  const quickActions = [
    {
      label: 'New Campaign',
      icon: <RocketLaunchIcon />,
      color: '#3b82f6',
      bgColor: '#eff6ff',
      description: 'Launch a new affiliate campaign',
    },
    {
      label: 'Find Trends',
      icon: <TrendingUpSharpIcon />,
      color: '#10b981',
      bgColor: '#ecfdf5',
      description: 'Discover trending products',
    },
    {
      label: 'AI Content',
      icon: <AutoAwesomeIcon />,
      color: '#8b5cf6',
      bgColor: '#f5f3ff',
      description: 'Generate content with AI',
    },
    {
      label: 'Analytics',
      icon: <InsightsIcon />,
      color: '#f59e0b',
      bgColor: '#fffbeb',
      description: 'View detailed analytics',
    },
  ];

  // Chart data based on time range
  const getRevenueData = () => {
    const ranges = {
      '7d': [
        { date: 'Mon', revenue: 4200, clicks: 2400, conversions: 145 },
        { date: 'Tue', revenue: 5100, clicks: 2800, conversions: 172 },
        { date: 'Wed', revenue: 4800, clicks: 2600, conversions: 158 },
        { date: 'Thu', revenue: 6200, clicks: 3200, conversions: 195 },
        { date: 'Fri', revenue: 7500, clicks: 3800, conversions: 234 },
        { date: 'Sat', revenue: 8200, clicks: 4100, conversions: 267 },
        { date: 'Sun', revenue: 6400, clicks: 3300, conversions: 201 },
      ],
      '30d': Array.from({ length: 30 }, (_, i) => ({
        date: `Day ${i + 1}`,
        revenue: Math.floor(Math.random() * 5000) + 3000,
        clicks: Math.floor(Math.random() * 2000) + 2000,
        conversions: Math.floor(Math.random() * 150) + 100,
      })),
      '90d': Array.from({ length: 90 }, (_, i) => ({
        date: `Day ${i + 1}`,
        revenue: Math.floor(Math.random() * 8000) + 2000,
        clicks: Math.floor(Math.random() * 3000) + 1500,
        conversions: Math.floor(Math.random() * 200) + 80,
      })),
    };
    return ranges[timeRange];
  };

  const categoryPerformance = [
    { name: 'Electronics', value: 35, color: '#3b82f6' },
    { name: 'Fashion', value: 25, color: '#ec4899' },
    { name: 'Home & Garden', value: 20, color: '#10b981' },
    { name: 'Health & Beauty', value: 12, color: '#f59e0b' },
    { name: 'Other', value: 8, color: '#6b7280' },
  ];

  // Goals data
  const goals = [
    {
      id: 1,
      title: 'Monthly Revenue Target',
      current: 47284,
      target: 60000,
      unit: '$',
      color: '#10b981',
    },
    {
      id: 2,
      title: 'Active Campaigns Goal',
      current: 24,
      target: 30,
      unit: '',
      color: '#3b82f6',
    },
    {
      id: 3,
      title: 'Conversion Rate Target',
      current: 6.8,
      target: 8.0,
      unit: '%',
      color: '#f59e0b',
    },
    {
      id: 4,
      title: 'Click-through Rate',
      current: 4.2,
      target: 5.0,
      unit: '%',
      color: '#8b5cf6',
    },
  ];

  // Comparison data (current vs previous period)
  const comparisonData = {
    revenue: { current: 47284, previous: 42150, change: 12.2 },
    clicks: { current: 18400, previous: 16980, change: 8.4 },
    conversions: { current: 1247, previous: 1084, change: 15.0 },
    campaigns: { current: 24, previous: 21, change: 14.3 },
  };

  // AI-powered insights
  const insights = [
    {
      id: 1,
      type: 'positive',
      title: 'Strong Weekend Performance',
      description: 'Your campaigns show 35% higher engagement on weekends. Consider increasing ad spend on Fridays-Sundays.',
      priority: 'high',
    },
    {
      id: 2,
      type: 'warning',
      title: 'Electronics Category Slowing',
      description: 'Electronics conversion rate dropped 5% this week. Review product selection and pricing.',
      priority: 'medium',
    },
    {
      id: 3,
      type: 'info',
      title: 'Fashion Trend Emerging',
      description: 'Sustainable fashion products showing 45% higher click-through rates. Explore this niche.',
      priority: 'high',
    },
  ];

  // Simulate real-time data refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    toast.success('Refreshing dashboard data...');
    Promise.all([analyticsQuery.refetch(), campaignsQuery.refetch()])
      .finally(() => {
        setIsRefreshing(false);
        toast.success('Dashboard updated!');
      });
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // In production, this would fetch real data
      console.log('Auto-refreshing dashboard data...');
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const aiInsights = [
    {
      title: '🚀 Top Opportunity',
      message: 'Tech accessories showing 45% growth - consider new campaign',
      action: 'View Trends',
      severity: 'success',
    },
    {
      title: '⚡ Performance Alert',
      message: '3 campaigns performing 20% above average - scale them up',
      action: 'View Campaigns',
      severity: 'info',
    },
    {
      title: '💡 AI Suggestion',
      message: 'Best posting time: 2-4 PM EST based on your audience',
      action: 'Schedule Post',
      severity: 'default',
    },
  ];

  const recentActivity = [
    { campaign: 'Summer Fashion Sale', revenue: '$2,340', status: 'active', performance: 92 },
    { campaign: 'Tech Gadgets Promo', revenue: '$1,890', status: 'active', performance: 85 },
    { campaign: 'Home Decor Bundle', revenue: '$1,456', status: 'active', performance: 78 },
    { campaign: 'Fitness Equipment', revenue: '$987', status: 'paused', performance: 65 },
  ];

  const topProducts = [
    { name: 'Wireless Headphones', sales: 234, revenue: '$7,020', category: 'Electronics' },
    { name: 'Cotton T-Shirt', sales: 189, revenue: '$5,670', category: 'Fashion' },
    { name: 'Smart Watch', sales: 156, revenue: '$6,240', category: 'Electronics' },
    { name: 'Leather Bag', sales: 142, revenue: '$4,260', category: 'Fashion' },
    { name: 'Coffee Maker', sales: 128, revenue: '$3,840', category: 'Home' },
  ];

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3 },
      maxWidth: '1400px',
      margin: '0 auto',
      minHeight: '100vh',
      bgcolor: '#f8fafc'
    }}>
      {/* Compact Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5 }}>
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Today: <strong style={{ color: '#10b981' }}>+$5,240</strong> revenue
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <ToggleButtonGroup
            value={timeRange}
            exclusive
            onChange={(_, value) => value && setTimeRange(value)}
            size="small"
            sx={{ bgcolor: 'white', borderRadius: 2 }}
          >
            <ToggleButton value="7d">7D</ToggleButton>
            <ToggleButton value="30d">30D</ToggleButton>
            <ToggleButton value="90d">90D</ToggleButton>
          </ToggleButtonGroup>
          
          <IconButton onClick={handleRefresh} disabled={isRefreshing} sx={{ bgcolor: 'white' }}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* AI Command Center - Central Hub */}
      <Card sx={{
        borderRadius: 4,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }
      }}>
        <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                🤖 AI Command Center
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 500 }}>
                Your intelligent affiliate automation hub
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip label="AI-Powered" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
              <Chip label="Real-time" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
            </Box>
          </Box>

          <Box sx={{ display:'flex', flexWrap:'wrap', gap:24 }}>
            {statCards.slice(0,4).map((stat, index) => (
              <Box key={index} sx={{ flex:'1 1 240px', maxWidth:'100%' }}>
                <Card sx={{
                  borderRadius: 3,
                  bgcolor: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                    bgcolor: 'rgba(255,255,255,0.25)'
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{
                        bgcolor: stat.bgColor,
                        color: stat.color,
                        width: 48,
                        height: 48,
                        boxShadow: 2
                      }}>
                        {stat.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.8, fontWeight: 600 }}>
                          {stat.title}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: 'white' }}>
                          {stat.value}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={stat.loading ? 'Loading…' : stat.change}
                        size="small"
                        sx={{
                          bgcolor: stat.trend === 'up' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          color: stat.trend === 'up' ? '#10b981' : '#ef4444',
                          fontWeight: 700,
                          border: `1px solid ${stat.trend === 'up' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                        }}
                        icon={stat.trend === 'up' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                      />
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        {stat.subtext}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Intelligence Dashboard */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <AutoAwesomeIcon sx={{ fontSize: 32, color: '#9d4edd' }} />
          AI Intelligence & Predictions
        </Typography>
        <IntelligenceWidget userId="demo-user" />
      </Box>

      {/* Tools & Features Hub */}
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <FlashOnIcon sx={{ fontSize: 32, color: '#3b82f6' }} />
          Your AI Tools & Features
        </Typography>

  <Box sx={{ display:'flex', flexWrap:'wrap', gap:24 }}>
          {/* Enhanced Quick Actions */}
          {[
            {
              label: 'Workflow Builder',
              icon: <SmartToyIcon sx={{ fontSize: 28 }} />,
              color: '#3b82f6',
              bgColor: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              description: 'Create automated affiliate workflows',
              route: '/workflows',
              features: ['Visual Builder', 'AI Automation', 'Real-time Execution']
            },
            {
              label: 'Content Studio',
              icon: <BrushIcon sx={{ fontSize: 28 }} />,
              color: '#8b5cf6',
              bgColor: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
              description: 'AI-powered content creation & scheduling',
              route: '/content-studio',
              features: ['AI Writing', 'Image Editor', 'Social Scheduler']
            },
            {
              label: 'Trend Finder',
              icon: <TrendingUpSharpIcon sx={{ fontSize: 28 }} />,
              color: '#10b981',
              bgColor: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
              description: 'Discover trending products with AI',
              route: '/flow-finder',
              features: ['Neural Analysis', 'Market Insights', 'Auto Discovery']
            },
            {
              label: 'Campaign Manager',
              icon: <CampaignIcon sx={{ fontSize: 28 }} />,
              color: '#f59e0b',
              bgColor: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
              description: 'Advanced campaign management & analytics',
              route: '/campaigns',
              features: ['A/B Testing', 'Performance Tracking', 'Auto Optimization']
            },
            {
              label: 'Social Media Suite',
              icon: <RocketLaunchIcon sx={{ fontSize: 28 }} />,
              color: '#ec4899',
              bgColor: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
              description: 'Automated social media management',
              route: '/social-media',
              features: ['Auto Follow', 'Smart Engagement', 'Analytics']
            },
            {
              label: 'Analytics Dashboard',
              icon: <InsightsIcon sx={{ fontSize: 28 }} />,
              color: '#06b6d4',
              bgColor: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)',
              description: 'Comprehensive analytics & insights',
              route: '/analytics',
              features: ['Real-time Data', 'AI Insights', 'Custom Reports']
            }
          ].map((tool, index) => (
            <Box key={index} sx={{ flex:'1 1 340px' }}>
              <Card
                onClick={() => {
                  toast.success(`Opening ${tool.label}...`);
                  setTimeout(() => router.push(tool.route), 300);
                }}
                sx={{
                  cursor: 'pointer',
                  borderRadius: 4,
                  background: tool.bgColor,
                  border: `2px solid ${tool.color}20`,
                  transition: 'all 0.3s ease',
                  height: '100%',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 12px 40px ${tool.color}30`,
                    borderColor: tool.color,
                    '& .tool-icon': {
                      transform: 'scale(1.1) rotate(5deg)',
                    }
                  }
                }}
              >
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar
                      className="tool-icon"
                      sx={{
                        bgcolor: tool.color,
                        color: 'white',
                        width: 56,
                        height: 56,
                        boxShadow: 3,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {tool.icon}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: tool.color }}>
                        {tool.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                        {tool.description}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 'auto' }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      {tool.features.map((feature, idx) => (
                        <Chip
                          key={idx}
                          label={feature}
                          size="small"
                          sx={{
                            fontSize: '0.7rem',
                            height: 24,
                            bgcolor: 'rgba(255,255,255,0.8)',
                            color: tool.color,
                            fontWeight: 600
                          }}
                        />
                      ))}
                    </Box>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        bgcolor: tool.color,
                        borderRadius: 2,
                        fontWeight: 600,
                        '&:hover': {
                          bgcolor: tool.color,
                          opacity: 0.9,
                          transform: 'translateY(-1px)'
                        }
                      }}
                    >
                      Launch Tool
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>

  {/* Unified AI Insights - Aggregated from all tools */}
      <Card sx={{
        borderRadius: 4,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid rgba(0,0,0,0.06)',
        mb: 4,
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <AutoAwesomeIcon sx={{ fontSize: 28, color: '#8b5cf6' }} />
            AI Platform Intelligence
          </Typography>

          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, fontSize: '1.1rem' }}>
            🚀 Powered by AI • Real-time Analytics • Automated Workflows
          </Typography>

          <Box sx={{ display:'flex', flexWrap:'wrap', gap:24 }}>
            {[
              {
                title: 'Trend Opportunity',
                description: 'AI detected rising interest in "wireless earbuds" - 340% increase in searches. Create a campaign now?',
                type: 'opportunity',
                tool: 'Trend Finder',
                action: 'Create Campaign',
                route: '/campaigns',
                icon: <TrendingUpSharpIcon />,
                color: '#10b981'
              },
              {
                title: 'Content Optimization',
                description: 'Your top-performing content is about "tech gadgets". Generate 5 similar posts to boost engagement by 25%.',
                type: 'optimization',
                tool: 'Content Studio',
                action: 'Generate Content',
                route: '/content-studio',
                icon: <BrushIcon />,
                color: '#8b5cf6'
              },
              {
                title: 'Workflow Enhancement',
                description: 'Campaign #247 could benefit from automated follow-ups. Save 3 hours/week with smart automation.',
                type: 'automation',
                tool: 'Workflow Builder',
                action: 'Optimize Workflow',
                route: '/workflows',
                icon: <SmartToyIcon />,
                color: '#3b82f6'
              },
              {
                title: 'Social Media Boost',
                description: 'Instagram engagement up 45% this week. Schedule 3 posts to maintain momentum.',
                type: 'engagement',
                tool: 'Social Media Suite',
                action: 'Schedule Posts',
                route: '/social-media',
                icon: <RocketLaunchIcon />,
                color: '#ec4899'
              }
            ].map((insight, index) => (
              <Box key={index} sx={{ flex:'1 1 480px', minWidth:300 }}>
                <Card sx={{
                  borderRadius: 3,
                  border: `2px solid ${insight.color}30`,
                  bgcolor: 'white',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 25px ${insight.color}20`,
                    borderColor: insight.color
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'start', gap: 2, mb: 2 }}>
                      <Avatar sx={{
                        bgcolor: `${insight.color}15`,
                        color: insight.color,
                        width: 40,
                        height: 40
                      }}>
                        {insight.icon}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                          {insight.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
                          {insight.description}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip
                        label={insight.tool}
                        size="small"
                        sx={{
                          bgcolor: `${insight.color}15`,
                          color: insight.color,
                          fontWeight: 600
                        }}
                      />
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => {
                          toast.success(`Opening ${insight.tool}...`);
                          setTimeout(() => router.push(insight.route), 300);
                        }}
                        sx={{
                          bgcolor: insight.color,
                          '&:hover': { bgcolor: insight.color, opacity: 0.9 },
                          borderRadius: 2,
                          fontWeight: 600
                        }}
                      >
                        {insight.action}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* AI Insights & Activity Feed */}
      <Box sx={{ display:'flex', flexWrap:'wrap', gap:32 }}>
        {/* AI Insights Panel */}
        <Box sx={{ flex:'1 1 600px', minWidth:300 }}>
          <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ bgcolor: '#8b5cf6', color: 'white' }}>
                  <AutoAwesomeIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    AI-Powered Insights
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Real-time intelligence for your affiliate business
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {insights.map((insight) => (
                  <Card
                    key={insight.id}
                    sx={{
                      borderRadius: 3,
                      border: '2px solid',
                      borderColor: insight.type === 'positive' ? '#10b981' : insight.type === 'warning' ? '#f59e0b' : '#3b82f6',
                      bgcolor: insight.type === 'positive' ? '#ecfdf5' : insight.type === 'warning' ? '#fffbeb' : '#eff6ff',
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {insight.title}
                        </Typography>
                        <Chip
                          label={insight.priority.toUpperCase()}
                          size="small"
                          color={insight.priority === 'high' ? 'error' : 'default'}
                        />
                      </Box>
                      <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                        {insight.description}
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{
                          borderRadius: 2,
                          fontWeight: 600,
                          borderColor: insight.type === 'positive' ? '#10b981' : insight.type === 'warning' ? '#f59e0b' : '#3b82f6',
                          color: insight.type === 'positive' ? '#10b981' : insight.type === 'warning' ? '#f59e0b' : '#3b82f6',
                        }}
                      >
                        Take Action
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </CardContent>
          </Card>
  </Box>

    {/* Activity Feed & Quick Stats */}
    <Box sx={{ flex:'1 1 340px', minWidth:300 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Recent Activity */}
            <Card sx={{ borderRadius: 4, boxShadow: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FlashOnIcon />
                  Recent Activity
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {recentActivity.map((activity, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'grey.50',
                        border: '1px solid',
                        borderColor: 'grey.200',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: 'grey.100',
                          transform: 'translateX(4px)'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {activity.campaign}
                        </Typography>
                        <Chip
                          label={activity.status}
                          size="small"
                          color={activity.status === 'active' ? 'success' : 'default'}
                          sx={{ fontSize: '0.7rem', height: 24 }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Revenue: <strong style={{ color: '#10b981' }}>{activity.revenue}</strong>
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Performance Goals */}
            <Card sx={{ borderRadius: 4, boxShadow: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmojiEventsIcon />
                  Performance Goals
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {goals.map((goal) => (
                    <Box key={goal.id}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {goal.title}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: goal.color }}>
                          {goal.current}{goal.unit}/{goal.target}{goal.unit}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(goal.current / goal.target) * 100}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: goal.color,
                            borderRadius: 4
                          }
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>

      {/* Discovered Trends Section (from AI discovery) */}
      {trends.length > 0 && (
        <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <TrendingUpSharpIcon sx={{ color: '#10b981' }} />
              Discovered Trends
            </Typography>
            <Box sx={{ display:'flex', flexWrap:'wrap', gap:24 }}>
              {trends.map((trend:any) => (
                <Box key={trend.id} sx={{ flex:'1 1 300px', minWidth:260 }}>
                  <Card sx={{ borderRadius:3, border:'2px solid #10b98120', transition:'0.2s', '&:hover':{ borderColor:'#10b981', boxShadow:4 } }}>
                    <CardContent sx={{ p:3 }}>
                      <Box sx={{ display:'flex', alignItems:'center', gap:2, mb:1 }}>
                        <Avatar sx={{ bgcolor:'#10b981', color:'white' }}><TrendingUpIcon /></Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight:700 }}>{trend.productName}</Typography>
                          <Typography variant="caption" sx={{ color:'text.secondary' }}>Velocity {trend.velocity} • Score {trend.score}</Typography>
                        </Box>
                      </Box>
                      <Chip size="small" label={trend.category} sx={{ mb:2, bgcolor:'#ecfdf5', color:'#047857', fontWeight:600 }} />
                      <Button
                        size="small"
                        variant="contained"
                        disabled={creatingCampaign}
                        onClick={() => campaignsQuery.create.mutate({ name: `${trend.productName} Campaign`, productName: trend.productName }, { onSuccess: () => toast.success('Campaign created from trend') })}
                        sx={{ bgcolor:'#10b981', '&:hover':{ bgcolor:'#059669' }, borderRadius:2, fontWeight:600 }}
                      >
                        {creatingCampaign ? 'Creating...' : 'Create Campaign'}
                      </Button>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Data Visualization Section */}
      <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <InsightsIcon sx={{ color: '#3b82f6' }} />
            Revenue Analytics
          </Typography>

          <Box sx={{ height: 400, mb: 3 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getRevenueData()}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Revenue ($)"
                  strokeWidth={3}
                />
                <Area
                  type="monotone"
                  dataKey="conversions"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorConversions)"
                  name="Conversions"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>

          {/* Category Performance */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Category Performance
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowComparison(!showComparison)}
              sx={{ borderRadius: 2 }}
            >
              {showComparison ? 'Hide' : 'Show'} Comparison
            </Button>
          </Box>

          <Box sx={{ display:'flex', flexWrap:'wrap', gap:32 }}>
            <Box sx={{ flex:'1 1 600px', minWidth:300 }}>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryPerformance}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Box>
            <Box sx={{ flex:'1 1 340px', minWidth:300 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {categoryPerformance.map((category, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        bgcolor: category.color
                      }}
                    />
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {category.name}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {category.value}%
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Comparison View */}
      {showComparison && (
        <Grow in={showComparison}>
          <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Period Comparison
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => setShowComparison(false)}
                  sx={{ borderRadius: 2 }}
                >
                  Hide Comparison
                </Button>
              </Box>
              <Box sx={{ display:'flex', flexWrap:'wrap', gap:24 }}>
                {Object.entries(comparisonData).map(([key, data]) => (
                  <Box key={key} sx={{ flex:'1 1 240px', minWidth:220 }}>
                    <Card sx={{
                      borderRadius: 3,
                      border: '2px solid #e5e7eb',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: '#3b82f6',
                        transform: 'translateY(-2px)',
                        boxShadow: 4
                      }
                    }}>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, textTransform: 'capitalize', mb: 2 }}>
                          {key}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
                          <Typography variant="h3" sx={{ fontWeight: 800, color: '#10b981' }}>
                            {key === 'revenue' ? `$${data.current.toLocaleString()}` : data.current.toLocaleString()}
                          </Typography>
                          <Chip
                            label={`+${data.change}%`}
                            icon={<TrendingUpIcon />}
                            sx={{
                              bgcolor: '#ecfdf5',
                              color: '#10b981',
                              fontWeight: 700
                            }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          vs previous period: {key === 'revenue' ? `$${data.previous.toLocaleString()}` : data.previous.toLocaleString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grow>
      )}

      {/* Footer with Quick Links */}
      <Box sx={{
        mt: 4,
        pt: 3,
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 3
      }}>
        <Typography variant="body2" color="text.secondary">
          🚀 Powered by AI • Real-time Analytics • Automated Workflows
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button size="small" variant="text" onClick={() => router.push('/workflows')}>
            Create Workflow
          </Button>
          <Button size="small" variant="text" onClick={() => router.push('/analytics')}>
            View Reports
          </Button>
          <Button size="small" variant="text" onClick={() => router.push('/content-studio')}>
            Content Studio
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
