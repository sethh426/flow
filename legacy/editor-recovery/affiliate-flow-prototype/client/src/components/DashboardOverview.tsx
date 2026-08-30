'use client';

import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  LinearProgress,
  Chip,
  IconButton,
  Button,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MouseIcon from '@mui/icons-material/Mouse';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useEffect, useState } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactElement;
  color: string;
  progress?: number;
}

function StatCard({ title, value, change, icon, color, progress }: StatCardProps) {
  const isPositive = change >= 0;
  
  return (
    <Card 
      sx={{ 
        height: '100%',
        borderRadius: 3,
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        transition: 'all 0.3s',
        '&:hover': {
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
          transform: 'translateY(-4px)',
        },
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Avatar
            sx={{
              bgcolor: `${color}15`,
              color: color,
              width: 64,
              height: 64,
            }}
          >
            {icon}
          </Avatar>
          <IconButton size="small">
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          {value}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            icon={isPositive ? <TrendingUpIcon /> : <TrendingDownIcon />}
            label={`${isPositive ? '+' : ''}${change}%`}
            size="small"
            sx={{
              bgcolor: isPositive ? 'success.50' : 'error.50',
              color: isPositive ? 'success.700' : 'error.700',
              fontWeight: 600,
              '& .MuiChip-icon': {
                color: isPositive ? 'success.700' : 'error.700',
              },
            }}
          />
          <Typography variant="caption" color="text.secondary">
            vs last month
          </Typography>
        </Box>

        {progress !== undefined && (
          <Box sx={{ mt: 3 }}>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{
                height: 8,
                borderRadius: 3,
                bgcolor: `${color}15`,
                '& .MuiLinearProgress-bar': {
                  bgcolor: color,
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    revenue: 0,
    campaigns: 0,
    products: 0,
    conversions: 0,
  });

  const [selectedCard, setSelectedCard] = useState<'stats' | 'activity' | 'performers'>('stats');

  useEffect(() => {
    // Fetch real stats from API
    fetch('/api/analytics')
      .then(res => res.json())
      .then(data => {
        setStats({
          revenue: data.totalRevenue || 0,
          campaigns: data.totalCampaigns || 0,
          products: data.totalProducts || 0,
          conversions: data.totalConversions || 0,
        });
      })
      .catch(console.error);
  }, []);

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${stats.revenue.toLocaleString()}`,
      change: 12.5,
      icon: <AttachMoneyIcon />,
      color: '#22c55e',
      progress: 75,
    },
    {
      title: 'Active Campaigns',
      value: stats.campaigns,
      change: 8.2,
      icon: <ShoppingCartIcon />,
      color: '#3b82f6',
      progress: 60,
    },
    {
      title: 'Total Products',
      value: stats.products,
      change: 15.3,
      icon: <VisibilityIcon />,
      color: '#a855f7',
      progress: 85,
    },
    {
      title: 'Conversions',
      value: stats.conversions,
      change: -2.4,
      icon: <MouseIcon />,
      color: '#f59e0b',
      progress: 45,
    },
  ];

  const recentActivities = [
    {
      title: 'New campaign created',
      description: 'Summer Fashion Collection',
      time: '2 minutes ago',
      status: 'success',
    },
    {
      title: 'Product trending',
      description: 'Wireless Headphones gaining popularity',
      time: '1 hour ago',
      status: 'info',
    },
    {
      title: 'A/B test completed',
      description: 'Variant B won with 95% confidence',
      time: '3 hours ago',
      status: 'success',
    },
    {
      title: 'Low stock alert',
      description: 'Smart Watch inventory running low',
      time: '5 hours ago',
      status: 'warning',
    },
  ];

  const topPerformers = [
    {
      name: 'Winter Boots Campaign',
      revenue: '$12,450',
      conversions: 234,
      ctr: '4.2%',
    },
    {
      name: 'Tech Gadgets Bundle',
      revenue: '$9,880',
      conversions: 189,
      ctr: '3.8%',
    },
    {
      name: 'Fitness Equipment',
      revenue: '$7,320',
      conversions: 156,
      ctr: '3.5%',
    },
  ];

  return (
    <Box>
      {/* Main Content Card - No Navigation Clutter */}
      {selectedCard === 'stats' && (
        <Card sx={{ borderRadius: 3, minHeight: 600 }}>
          <CardContent sx={{ p: 6 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 4 }}>
              {statCards.map((stat, index) => (
                <StatCard {...stat} key={index} />
              ))}
            </Box>

            {/* Simple bottom navigation */}
            <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="text"
                onClick={() => setSelectedCard('activity')}
                sx={{ minHeight: 48, fontSize: '1rem', color: 'text.secondary' }}
              >
                View Recent Activity →
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {selectedCard === 'activity' && (
        <Card sx={{ borderRadius: 3, minHeight: 600 }}>
          <CardContent sx={{ p: 6 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {recentActivities.map((activity, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    bgcolor: 'grey.50',
                    display: 'flex',
                    gap: 3,
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'grey.100',
                      transform: 'translateX(8px)',
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: 
                        activity.status === 'success' ? 'success.50' :
                        activity.status === 'warning' ? 'warning.50' :
                        'info.50',
                      color:
                        activity.status === 'success' ? 'success.700' :
                        activity.status === 'warning' ? 'warning.700' :
                        'info.700',
                      fontSize: '1.5rem',
                    }}
                  >
                    {activity.status === 'success' ? '✓' : activity.status === 'warning' ? '⚠' : 'i'}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {activity.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                      {activity.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activity.time}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Simple navigation */}
            <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="text"
                onClick={() => setSelectedCard('stats')}
                sx={{ minHeight: 48, fontSize: '1rem', color: 'text.secondary' }}
              >
                ← Back to Stats
              </Button>
              <Button
                variant="text"
                onClick={() => setSelectedCard('performers')}
                sx={{ minHeight: 48, fontSize: '1rem', color: 'text.secondary' }}
              >
                View Top Performers →
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {selectedCard === 'performers' && (
        <Card sx={{ borderRadius: 3, minHeight: 600 }}>
          <CardContent sx={{ p: 6 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {topPerformers.map((campaign, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    border: '2px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'primary.50',
                      transform: 'translateX(8px)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48, fontSize: '1.25rem', fontWeight: 700 }}>
                        #{index + 1}
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {campaign.name}
                      </Typography>
                    </Box>
                    <Chip
                      label={campaign.revenue}
                      sx={{
                        bgcolor: 'success.50',
                        color: 'success.700',
                        fontWeight: 700,
                        fontSize: '1.125rem',
                        height: 40,
                        px: 2,
                        flexShrink: 0,
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 4, ml: 7 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Conversions
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {campaign.conversions}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Click Rate
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {campaign.ctr}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Simple navigation */}
            <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="text"
                onClick={() => setSelectedCard('activity')}
                sx={{ minHeight: 48, fontSize: '1rem', color: 'text.secondary' }}
              >
                ← Back to Activity
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
