'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Avatar, Chip, LinearProgress, IconButton, Typography, Button, Paper, Grid, ToggleButtonGroup, ToggleButton, Fade, Grow, Slide, Zoom } from '@mui/material';
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
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Keyframe animations
const pulseAnimation = {
  '@keyframes pulse': {
    '0%, 100%': {
      opacity: 1,
      transform: 'scale(1)',
    },
    '50%': {
      opacity: 0.9,
      transform: 'scale(1.02)',
    },
  },
};

const shimmerAnimation = {
  '@keyframes shimmer': {
    '0%': {
      backgroundPosition: '-200% 0',
    },
    '100%': {
      backgroundPosition: '200% 0',
    },
  },
};

const floatAnimation = {
  '@keyframes float': {
    '0%, 100%': {
      transform: 'translateY(0px)',
    },
    '50%': {
      transform: 'translateY(-10px)',
    },
  },
};

const bounceAnimation = {
  '@keyframes bounce': {
    '0%, 100%': {
      transform: 'translateY(0)',
    },
    '50%': {
      transform: 'translateY(-5px)',
    },
  },
};

export default function DashboardContent() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showGoals, setShowGoals] = useState(true);

  // Mock data for professional demo
  const statCards = [
    {
      title: 'Total Revenue',
      value: '$47,284',
      change: '+12.5%',
      trend: 'up',
      icon: <AttachMoneyIcon />,
      color: '#10b981',
      bgColor: '#ecfdf5',
      subtext: 'vs last month',
    },
    {
      title: 'Active Campaigns',
      value: '24',
      change: '+3',
      trend: 'up',
      icon: <CampaignIcon />,
      color: '#3b82f6',
      bgColor: '#eff6ff',
      subtext: 'this week',
    },
    {
      title: 'Total Clicks',
      value: '18.4K',
      change: '+8.2%',
      trend: 'up',
      icon: <MouseIcon />,
      color: '#8b5cf6',
      bgColor: '#f5f3ff',
      subtext: 'past 7 days',
    },
    {
      title: 'Conversions',
      value: '1,247',
      change: '+15.3%',
      trend: 'up',
      icon: <ShoppingCartIcon />,
      color: '#f59e0b',
      bgColor: '#fffbeb',
      subtext: 'conversion rate: 6.8%',
    },
  ];

  const handleQuickAction = (action: string) => {
    const actions: Record<string, () => void> = {
      'New Campaign': () => {
        toast.success('Opening campaign creator...');
        // In a real app, this would open a modal or navigate to campaign page
        setTimeout(() => router.push('/campaigns'), 500);
      },
      'Find Trends': () => {
        toast.success('Loading trend finder...');
        setTimeout(() => router.push('/flow-finder'), 500);
      },
      'AI Content': () => {
        toast.success('Opening content studio...');
        setTimeout(() => router.push('/content-studio'), 500);
      },
      'Analytics': () => {
        toast.success('Loading analytics dashboard...');
        setTimeout(() => router.push('/analytics'), 500);
      },
    };

    if (actions[action]) {
      actions[action]();
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
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Dashboard updated!');
    }, 1500);
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Hero Section */}
      <Paper
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 4,
          p: 4,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                Welcome back! <FlashOnIcon sx={{ fontSize: 40 }} />
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 400 }}>
                Your campaigns generated <strong>$5,240</strong> today
              </Typography>
            </Box>
            <Chip
              label="October 2025"
              sx={{
                bgcolor: 'rgba(255,255,255,0.25)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.3)',
              }}
            />
          </Box>
          
          {/* Quick Stats Row */}
          <Box sx={{ display: 'flex', gap: 4, mt: 3 }}>
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                Active Campaigns
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                24
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                Flow Coins
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                1,840
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                Active Users
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                8.2K
              </Typography>
            </Box>
          </Box>
        </Box>
        
        {/* Decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -100,
            left: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }}
        />
      </Paper>

      {/* Quick Actions */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <RocketLaunchIcon /> Quick Actions
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
          {quickActions.map((action, index) => (
            <Zoom in={true} timeout={400 + index * 100} key={index}>
              <Card
                onClick={() => handleQuickAction(action.label)}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  borderRadius: 3,
                  border: '2px solid transparent',
                  ...floatAnimation,
                  '&:hover': {
                    borderColor: action.color,
                    transform: 'translateY(-8px) scale(1.03)',
                    boxShadow: `0 12px 24px ${action.color}40`,
                    animation: 'float 2s ease-in-out infinite',
                  },
                  '&:active': {
                    transform: 'translateY(-2px) scale(0.98)',
                  },
                }}
              >
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      bgcolor: action.bgColor,
                      color: action.color,
                      width: 64,
                      height: 64,
                      margin: '0 auto 16px',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'rotate(10deg) scale(1.1)',
                      },
                    }}
                  >
                    {action.icon}
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {action.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </CardContent>
              </Card>
            </Zoom>
          ))}
        </Box>
      </Box>

      {/* AI Insights */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <SmartToyIcon /> AI Insights & Recommendations
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
          {aiInsights.map((insight, index) => (
            <Card key={index}
                sx={{
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: insight.severity === 'success' ? '#10b981' : insight.severity === 'info' ? '#3b82f6' : '#e5e7eb',
                  bgcolor: insight.severity === 'success' ? '#ecfdf540' : insight.severity === 'info' ? '#eff6ff40' : '#f9fafb',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                    {insight.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {insight.message}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    {insight.action}
                  </Button>
                </CardContent>
              </Card>
          ))}
        </Box>
      </Box>

      {/* Stats Cards Grid */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Performance Overview
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2.5 }}>
          {statCards.map((stat, index) => (
            <Grow in={true} timeout={300 + index * 100} key={index}>
              <Card
                sx={{
                  background: 'white',
                  borderRadius: 3,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  border: '2px solid transparent',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  ...pulseAnimation,
                  ...shimmerAnimation,
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    transform: 'translateY(-8px) scale(1.02)',
                    borderColor: stat.color,
                    animation: 'pulse 2s ease-in-out infinite',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `linear-gradient(90deg, transparent, ${stat.color}15, transparent)`,
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 2s linear infinite',
                    },
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${stat.color}, ${stat.color}99)`,
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: stat.bgColor,
                        color: stat.color,
                        width: 56,
                        height: 56,
                        ...bounceAnimation,
                        transition: 'all 0.3s',
                        '&:hover': {
                          animation: 'bounce 1s ease-in-out infinite',
                        },
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                    <Chip
                      icon={stat.trend === 'up' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                      label={stat.change}
                      size="small"
                      sx={{
                        bgcolor: stat.trend === 'up' ? '#ecfdf5' : '#fef2f2',
                        color: stat.trend === 'up' ? '#10b981' : '#ef4444',
                        fontWeight: 700,
                        border: 'none',
                        height: 28,
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'scale(1.1)',
                        },
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    {stat.subtext}
                  </Typography>
                </CardContent>
              </Card>
            </Grow>
          ))}
        </Box>
      </Box>

      {/* Goals Section */}
      {showGoals && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmojiEventsIcon /> Goals & Targets
            </Typography>
            <IconButton size="small" onClick={() => setShowGoals(false)}>
              <MoreVertIcon />
            </IconButton>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
            {goals.map((goal) => {
              const progress = (goal.current / goal.target) * 100;
              const isCompleted = progress >= 100;
              return (
                <Card key={goal.id} sx={{ borderRadius: 3, border: `2px solid ${isCompleted ? '#10b981' : '#e5e7eb'}` }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {goal.title}
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                          {goal.unit === '$' ? `$${goal.current.toLocaleString()}` : `${goal.current}${goal.unit}`}
                          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            / {goal.unit === '$' ? `$${goal.target.toLocaleString()}` : `${goal.target}${goal.unit}`}
                          </Typography>
                        </Typography>
                      </Box>
                      {isCompleted && (
                        <Chip
                          icon={<EmojiEventsIcon />}
                          label="Achieved!"
                          size="small"
                          sx={{ bgcolor: '#ecfdf5', color: '#10b981', fontWeight: 700 }}
                        />
                      )}
                    </Box>
                    <Box sx={{ position: 'relative', mb: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(progress, 100)}
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          bgcolor: '#e5e7eb',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: goal.color,
                            borderRadius: 5,
                          },
                        }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {progress.toFixed(1)}% complete
                      {!isCompleted && ` • ${goal.unit === '$' ? `$${(goal.target - goal.current).toLocaleString()}` : `${(goal.target - goal.current).toFixed(1)}${goal.unit}`} remaining`}
                    </Typography>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Box>
      )}

      {/* Comparison View */}
      {showComparison && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Period Comparison
            </Typography>
            <Button size="small" onClick={() => setShowComparison(false)}>
              Hide
            </Button>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
            {Object.entries(comparisonData).map(([key, data]) => (
              <Card key={key} sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize', fontWeight: 600 }}>
                    {key}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mt: 1 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {key === 'revenue' ? `$${data.current.toLocaleString()}` : data.current.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        vs {key === 'revenue' ? `$${data.previous.toLocaleString()}` : data.previous.toLocaleString()}
                      </Typography>
                    </Box>
                    <Chip
                      label={`+${data.change}%`}
                      size="small"
                      icon={<TrendingUpIcon />}
                      sx={{
                        bgcolor: '#ecfdf5',
                        color: '#10b981',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* AI Insights Panel */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeIcon /> AI-Powered Insights
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, 1fr)' }, gap: 2 }}>
          {insights.map((insight) => (
            <Card
              key={insight.id}
              sx={{
                borderRadius: 3,
                border: '2px solid',
                borderColor: insight.type === 'positive' ? '#10b981' : insight.type === 'warning' ? '#f59e0b' : '#3b82f6',
                bgcolor: insight.type === 'positive' ? '#ecfdf540' : insight.type === 'warning' ? '#fffbeb40' : '#eff6ff40',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {insight.title}
                  </Typography>
                  <Chip
                    label={insight.priority.toUpperCase()}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      bgcolor: insight.priority === 'high' ? '#fef2f2' : '#f3f4f6',
                      color: insight.priority === 'high' ? '#ef4444' : '#6b7280',
                    }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {insight.description}
                </Typography>
                <Button
                  size="small"
                  sx={{ mt: 2, fontWeight: 600 }}
                  endIcon={<TrendingUpIcon />}
                >
                  Take Action
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Analytics Charts Section */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            <InsightsIcon /> Performance Analytics
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              size="small"
              variant={showComparison ? 'contained' : 'outlined'}
              onClick={() => setShowComparison(!showComparison)}
            >
              {showComparison ? 'Hide' : 'Show'} Comparison
            </Button>
            <ToggleButtonGroup
              value={timeRange}
              exclusive
              onChange={(e, value) => value && setTimeRange(value)}
              size="small"
            >
              <ToggleButton value="7d">7 Days</ToggleButton>
              <ToggleButton value="30d">30 Days</ToggleButton>
              <ToggleButton value="90d">90 Days</ToggleButton>
            </ToggleButtonGroup>
            <IconButton 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              sx={{ 
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' }
                }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Revenue Trend Chart */}
        <Card sx={{ borderRadius: 3, mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              Revenue & Conversions Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
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
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  name="Revenue ($)"
                />
                <Area 
                  type="monotone" 
                  dataKey="conversions" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorConversions)" 
                  name="Conversions"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Clicks Chart & Category Distribution */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                Click Performance
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={getRevenueData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar dataKey="clicks" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                Category Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryPerformance}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Main Content Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
        {/* Recent Campaigns Performance */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Campaign Performance
              </Typography>
              <IconButton size="small">
                <MoreVertIcon />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {recentActivity.map((activity, index) => (
                <Box key={index}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: activity.status === 'active' ? '#ecfdf5' : '#f3f4f6',
                          color: activity.status === 'active' ? '#10b981' : '#6b7280',
                          width: 40,
                          height: 40,
                        }}
                      >
                        <CampaignIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {activity.campaign}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {activity.revenue} revenue
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={activity.status}
                      size="small"
                      sx={{
                        bgcolor: activity.status === 'active' ? '#ecfdf5' : '#f3f4f6',
                        color: activity.status === 'active' ? '#10b981' : '#6b7280',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={activity.performance}
                      sx={{
                        flex: 1,
                        height: 8,
                        borderRadius: 4,
                        bgcolor: '#f3f4f6',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: activity.performance > 80 ? '#10b981' : activity.performance > 60 ? '#f59e0b' : '#ef4444',
                          borderRadius: 4,
                        },
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 40 }}>
                      {activity.performance}%
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Top Products
              </Typography>
              <EmojiEventsIcon sx={{ color: '#f59e0b' }} />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {topProducts.map((product, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    borderRadius: 2,
                    bgcolor: index === 0 ? '#fffbeb' : '#f9fafb',
                    border: '1px solid',
                    borderColor: index === 0 ? '#fef3c7' : '#f3f4f6',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      sx={{
                        bgcolor: index === 0 ? '#f59e0b' : '#6b7280',
                        color: 'white',
                        width: 32,
                        height: 32,
                        fontSize: '0.875rem',
                        fontWeight: 700,
                      }}
                    >
                      {index + 1}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {product.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {product.sales} sales
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#10b981' }}>
                    {product.revenue}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Quick Stats Banner */}
      <Card
        sx={{
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                🚀 You're crushing it this month!
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Your campaigns are performing 23% better than last month
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  92%
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Success Rate
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  15
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Days Active
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  $2.8k
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Avg/Campaign
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
