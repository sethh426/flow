'use client';

import React from 'react';
import { Box, Card, CardContent, Typography, Paper } from '@mui/material';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { HiTrendingUp, HiCurrencyDollar, HiUsers, HiShoppingCart } from 'react-icons/hi';
import { softChartColors } from '@/lib/mui-soft-theme';

// Sample data - replace with real data
const revenueData = [
  { month: 'Jan', revenue: 4200, clicks: 1200, conversions: 45 },
  { month: 'Feb', revenue: 5100, clicks: 1500, conversions: 62 },
  { month: 'Mar', revenue: 6200, clicks: 1800, conversions: 78 },
  { month: 'Apr', revenue: 5800, clicks: 1650, conversions: 71 },
  { month: 'May', revenue: 7200, clicks: 2100, conversions: 95 },
  { month: 'Jun', revenue: 8500, clicks: 2400, conversions: 112 },
];

const productPerformance = [
  { name: 'Electronics', value: 4500, color: softChartColors.palette[0] },
  { name: 'Fashion', value: 3200, color: softChartColors.palette[1] },
  { name: 'Home & Garden', value: 2800, color: softChartColors.palette[2] },
  { name: 'Sports', value: 2100, color: softChartColors.palette[3] },
  { name: 'Books', value: 1400, color: softChartColors.palette[4] },
];

const campaignData = [
  { name: 'Email', conversions: 245, spend: 1200 },
  { name: 'Social', conversions: 189, spend: 980 },
  { name: 'Search', conversions: 312, spend: 1500 },
  { name: 'Display', conversions: 156, spend: 850 },
];

// Stat Card Component
const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
  <Card 
    sx={{ 
      height: '100%',
      background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,1) 100%)',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 24px -4px rgba(0,0,0,0.12)',
      }
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {title}
        </Typography>
        <Box sx={{ 
          p: 1, 
          borderRadius: 2, 
          bgcolor: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icon style={{ fontSize: 20, color }} />
        </Box>
      </Box>
      <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5, color: 'text.primary' }}>
        {value}
      </Typography>
      <Typography 
        variant="body2" 
        sx={{ 
          color: change.startsWith('+') ? 'success.main' : 'error.main',
          fontWeight: 600,
          fontSize: '0.8125rem',
        }}
      >
        {change} from last month
      </Typography>
    </CardContent>
  </Card>
);

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Paper
        sx={{
          p: 2,
          bgcolor: 'rgba(255, 255, 255, 0.98)',
          border: '1px solid #e2e8f0',
          borderRadius: 2,
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
          {label}
        </Typography>
        {payload.map((entry: any, index: number) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: entry.color }} />
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
              {entry.name}: <strong style={{ color: entry.color }}>{entry.value}</strong>
            </Typography>
          </Box>
        ))}
      </Paper>
    );
  }
  return null;
};

export default function AnalyticsDashboardPage() {
  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
          Analytics Dashboard
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Track your performance with beautiful, easy-to-read charts
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
        <StatCard
          title="Total Revenue"
          value="$37,800"
          change="+18.2%"
          icon={HiCurrencyDollar}
          color={softChartColors.palette[0]}
        />
        <StatCard
          title="Conversions"
          value="463"
          change="+24.5%"
          icon={HiShoppingCart}
          color={softChartColors.palette[1]}
        />
        <StatCard
          title="Click Rate"
          value="10,650"
          change="+12.8%"
          icon={HiTrendingUp}
          color={softChartColors.palette[2]}
        />
        <StatCard
          title="Active Users"
          value="2,845"
          change="+8.3%"
          icon={HiUsers}
          color={softChartColors.palette[3]}
        />
      </Box>

      {/* Charts Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3, mb: 3 }}>
        {/* Revenue Trend - Smooth Area Chart */}
        <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
                Revenue Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={softChartColors.palette[0]} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={softChartColors.palette[0]} stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#94a3b8"
                    style={{ fontSize: '0.8125rem', fontWeight: 500 }}
                  />
                  <YAxis 
                    stroke="#94a3b8"
                    style={{ fontSize: '0.8125rem', fontWeight: 500 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={softChartColors.palette[0]}
                    strokeWidth={3}
                    fill="url(#colorRevenue)"
                    animationDuration={800}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        {/* Product Performance - Soft Pie Chart */}
        <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
                Product Categories
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={productPerformance}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    animationDuration={800}
                  >
                    {productPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ mt: 2 }}>
                {productPerformance.map((item, index) => (
                  <Box 
                    key={index}
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      mb: 1.5,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                        {item.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      ${item.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
        </Card>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
        {/* Campaign Performance - Smooth Bar Chart */}
        <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
                Campaign Performance
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={campaignData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name"
                    stroke="#94a3b8"
                    style={{ fontSize: '0.8125rem', fontWeight: 500 }}
                  />
                  <YAxis 
                    stroke="#94a3b8"
                    style={{ fontSize: '0.8125rem', fontWeight: 500 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="conversions" 
                    fill={softChartColors.palette[1]}
                    radius={[8, 8, 0, 0]}
                    animationDuration={800}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
        </Card>

        {/* Clicks & Conversions - Multi-line Chart */}
        <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
                Clicks & Conversions
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="month"
                    stroke="#94a3b8"
                    style={{ fontSize: '0.8125rem', fontWeight: 500 }}
                  />
                  <YAxis 
                    stroke="#94a3b8"
                    style={{ fontSize: '0.8125rem', fontWeight: 500 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ fontSize: '0.8125rem', fontWeight: 500 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="clicks" 
                    stroke={softChartColors.palette[4]}
                    strokeWidth={3}
                    dot={{ fill: softChartColors.palette[4], r: 5 }}
                    activeDot={{ r: 7 }}
                    animationDuration={800}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="conversions" 
                    stroke={softChartColors.palette[5]}
                    strokeWidth={3}
                    dot={{ fill: softChartColors.palette[5], r: 5 }}
                    activeDot={{ r: 7 }}
                    animationDuration={800}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
      </Box>
    </Box>
  );
}


