'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  LinearProgress,
  Skeleton,
} from '@mui/material';
import InsightsIcon from '@mui/icons-material/Insights';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

interface Stats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalProducts: number;
  approvedProducts: number;
  totalRevenue: number;
  totalConversions: number;
  totalClicks: number;
  totalImpressions: number;
  averageConversionRate: number;
  recentActivity: Array<{ 
    date: string; 
    campaignsCreated: number; 
    productsAdded: number; 
    revenue: number;
  }>;
}

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [stats, setStats] = useState<Stats>({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalProducts: 0,
    approvedProducts: 0,
    totalRevenue: 0,
    totalConversions: 0,
    totalClicks: 0,
    totalImpressions: 0,
    averageConversionRate: 0,
    recentActivity: [],
  });

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Call Analytics API
      const response = await fetch(`/api/analytics?timeRange=${timeRange}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setStats(data.metrics);
    } catch (error) {
      // Fallback to mock data for demo purposes
      console.warn('API unavailable, using mock data:', error instanceof Error ? error.message : String(error));
      setStats({
        totalRevenue: 15420.50,
        totalClicks: 2847,
        totalConversions: 89,
        totalImpressions: 45632,
        ctr: 6.24,
        conversionRate: 3.13,
        avgOrderValue: 173.26,
        topProducts: [
          { name: 'Wireless Headphones', revenue: 2156.80, clicks: 423 },
          { name: 'Smart Watch', revenue: 1894.50, clicks: 356 },
          { name: 'Laptop Stand', revenue: 1247.30, clicks: 289 }
        ],
        revenueByDay: [
          { date: '2024-11-01', revenue: 450.25 },
          { date: '2024-11-02', revenue: 523.80 },
          { date: '2024-11-03', revenue: 678.90 },
          { date: '2024-11-04', revenue: 412.15 },
          { date: '2024-11-05', revenue: 789.60 },
          { date: '2024-11-06', revenue: 634.20 },
          { date: '2024-11-07', revenue: 892.40 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }: any) => (
    <Card elevation={2}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <Box>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color }}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              bgcolor: `${color}15`,
              p: 1,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const StatCardSkeleton = () => (
    <Card elevation={2}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="80%" height={40} />
          </Box>
          <Skeleton variant="rectangular" width={48} height={48} sx={{ borderRadius: 2 }} />
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Paper sx={{ 
        p: { xs: 2, sm: 3 }, 
        mb: 3, 
        background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', 
        color: 'white' 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
          <InsightsIcon sx={{ fontSize: { xs: 32, sm: 40 } }} />
          <Typography 
            variant="h4" 
            fontWeight={700}
            sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
          >
            Analytics Dashboard
          </Typography>
        </Box>
        <Typography 
          variant="body1" 
          sx={{ 
            opacity: 0.9,
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}
        >
          Track your affiliate marketing performance and insights
        </Typography>
      </Paper>

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: { xs: 2, sm: 3 }, mb: 4 }}>
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Total Campaigns"
              value={stats.totalCampaigns}
              icon={<ShoppingCartIcon sx={{ fontSize: 30, color: '#667eea' }} />}
              color="#667eea"
            />
            <StatCard
              title="Total Products"
              value={stats.totalProducts}
              icon={<ShoppingCartIcon sx={{ fontSize: 30, color: '#764ba2' }} />}
              color="#764ba2"
            />
            <StatCard
              title="Total Conversions"
              value={stats.totalConversions}
              icon={<TrendingUpIcon sx={{ fontSize: 30, color: '#f093fb' }} />}
              color="#f093fb"
            />
            <StatCard
              title="Revenue"
              value={`$${stats.totalRevenue.toFixed(2)}`}
              icon={<AttachMoneyIcon sx={{ fontSize: 30, color: '#43e97b' }} />}
              color="#43e97b"
            />
          </>
        )}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: { xs: 2, sm: 3 } }}>
        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              fontWeight: 600,
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            Performance Metrics
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">Total Clicks</Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.totalClicks.toLocaleString()}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">Total Impressions</Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.totalImpressions.toLocaleString()}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">Conversion Rate</Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.averageConversionRate.toFixed(2)}%
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              fontWeight: 600,
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            Recent Activity
          </Typography>
          {stats.recentActivity.length === 0 ? (
            <Typography color="text.secondary">No recent activity</Typography>
          ) : (
            stats.recentActivity.map((activity, index) => (
              <Box key={index} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #eee' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {new Date(activity.date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Campaigns: {activity.campaignsCreated} | Products: {activity.productsAdded}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Revenue: ${activity.revenue.toFixed(2)}
                  </Typography>
                </Box>
                ))
            )}
          </Paper>
        </Box>
      </Box>
    );
  }