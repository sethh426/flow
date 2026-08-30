/**
 * Analytics & Metrics Dashboard Component
 * Real-time business metrics with conversion tracking
 */

'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  People,
  Email,
  Speed,
  Timeline,
  Refresh,
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  color: string;
  target?: number;
  unit?: string;
}

interface ConversionFunnelStep {
  name: string;
  visitors: number;
  converted: number;
  conversionRate: number;
}

interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
}

interface WorkflowPerformance {
  workflowName: string;
  executions: number;
  completionRate: number;
  avgDuration: number;
  revenue: number;
}

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [loading, setLoading] = useState(false);
  
  // Metric cards data
  const metrics: MetricCard[] = [
    {
      title: 'Total Revenue',
      value: '$47,294',
      change: 23.5,
      changeType: 'increase',
      icon: <AttachMoney />,
      color: '#4caf50',
      target: 50000,
      unit: '$',
    },
    {
      title: 'Conversion Rate',
      value: '8.7%',
      change: 2.3,
      changeType: 'increase',
      icon: <TrendingUp />,
      color: '#2196f3',
      target: 10,
      unit: '%',
    },
    {
      title: 'Active Workflows',
      value: 127,
      change: 12,
      changeType: 'increase',
      icon: <Timeline />,
      color: '#ff9800',
    },
    {
      title: 'Email Open Rate',
      value: '34.2%',
      change: -1.5,
      changeType: 'decrease',
      icon: <Email />,
      color: '#9c27b0',
      target: 35,
      unit: '%',
    },
    {
      title: 'Avg Response Time',
      value: '2.4min',
      change: -15.2,
      changeType: 'increase',
      icon: <Speed />,
      color: '#00bcd4',
    },
    {
      title: 'Total Customers',
      value: 1843,
      change: 8.7,
      changeType: 'increase',
      icon: <People />,
      color: '#e91e63',
    },
  ];

  // Revenue trend data
  const revenueData: RevenueData[] = [
    { date: 'Jan 1', revenue: 4200, orders: 32, avgOrderValue: 131.25 },
    { date: 'Jan 2', revenue: 5100, orders: 38, avgOrderValue: 134.21 },
    { date: 'Jan 3', revenue: 4800, orders: 35, avgOrderValue: 137.14 },
    { date: 'Jan 4', revenue: 6200, orders: 45, avgOrderValue: 137.78 },
    { date: 'Jan 5', revenue: 7100, orders: 52, avgOrderValue: 136.54 },
    { date: 'Jan 6', revenue: 6800, orders: 48, avgOrderValue: 141.67 },
    { date: 'Jan 7', revenue: 8300, orders: 59, avgOrderValue: 140.68 },
  ];

  // Conversion funnel data
  const funnelData: ConversionFunnelStep[] = [
    { name: 'Website Visitors', visitors: 10000, converted: 10000, conversionRate: 100 },
    { name: 'Product Views', visitors: 10000, converted: 4200, conversionRate: 42 },
    { name: 'Add to Cart', visitors: 4200, converted: 1680, conversionRate: 40 },
    { name: 'Checkout Started', visitors: 1680, converted: 1176, conversionRate: 70 },
    { name: 'Purchase Complete', visitors: 1176, converted: 870, conversionRate: 74 },
  ];

  // Workflow performance data
  const workflowPerformance: WorkflowPerformance[] = [
    {
      workflowName: 'Abandoned Cart Recovery',
      executions: 342,
      completionRate: 87.4,
      avgDuration: 24.5,
      revenue: 18420,
    },
    {
      workflowName: 'Lead Nurture - 5min Response',
      executions: 218,
      completionRate: 92.1,
      avgDuration: 3.2,
      revenue: 12850,
    },
    {
      workflowName: 'Post-Purchase Upsell',
      executions: 156,
      completionRate: 78.2,
      avgDuration: 48.0,
      revenue: 8940,
    },
    {
      workflowName: 'Review Request Automation',
      executions: 289,
      completionRate: 95.8,
      avgDuration: 72.0,
      revenue: 0,
    },
    {
      workflowName: 'Webinar Follow-up Sequence',
      executions: 124,
      completionRate: 81.5,
      avgDuration: 168.0,
      revenue: 6820,
    },
  ];

  // Traffic sources
  const trafficSources = [
    { name: 'Organic Search', value: 4200, color: '#4caf50' },
    { name: 'Paid Ads', value: 2800, color: '#2196f3' },
    { name: 'Social Media', value: 1900, color: '#9c27b0' },
    { name: 'Email', value: 1500, color: '#ff9800' },
    { name: 'Direct', value: 1100, color: '#00bcd4' },
  ];

  const handleRefresh = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Analytics Dashboard
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value as '24h' | '7d' | '30d' | '90d')}
            >
              <MenuItem value="24h">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
            </Select>
          </FormControl>
          
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Metric Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' }, gap: 3, mb: 4 }}>
        {metrics.map((metric, index) => (
          <Box key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box
                    sx={{
                      bgcolor: `${metric.color}20`,
                      color: metric.color,
                      p: 1,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {metric.icon}
                  </Box>
                  {metric.changeType === 'increase' ? (
                    <TrendingUp sx={{ color: '#4caf50' }} />
                  ) : metric.changeType === 'decrease' ? (
                    <TrendingDown sx={{ color: '#f44336' }} />
                  ) : null}
                </Box>

                <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
                  {metric.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {metric.title}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={`${metric.change > 0 ? '+' : ''}${metric.change}%`}
                    size="small"
                    sx={{
                      bgcolor:
                        metric.changeType === 'increase'
                          ? '#4caf5020'
                          : metric.changeType === 'decrease'
                          ? '#f4433620'
                          : '#9e9e9e20',
                      color:
                        metric.changeType === 'increase'
                          ? '#4caf50'
                          : metric.changeType === 'decrease'
                          ? '#f44336'
                          : '#9e9e9e',
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    vs last period
                  </Typography>
                </Box>

                {metric.target && (
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Progress to Goal
                      </Typography>
                      <Typography variant="caption" fontWeight="bold">
                        {formatPercentage((parseFloat(metric.value.toString().replace(/[^0-9.]/g, '')) / metric.target) * 100)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((parseFloat(metric.value.toString().replace(/[^0-9.]/g, '')) / metric.target) * 100, 100)}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Charts Row 1 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3, mb: 4 }}>
        {/* Revenue Trend */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Revenue Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4caf50" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#4caf50" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4caf50"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Traffic Sources */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Traffic Sources
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={trafficSources}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {trafficSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Conversion Funnel */}
      <Box sx={{ mb: 4 }}>
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Conversion Funnel
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {funnelData.map((step, index) => (
                  <Box key={index}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {step.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {step.converted.toLocaleString()} visitors
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          {formatPercentage(step.conversionRate)}
                        </Typography>
                      </Box>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={step.conversionRate}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: index === 0 ? '#4caf50' : index === funnelData.length - 1 ? '#2196f3' : '#ff9800',
                        },
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Workflow Performance Table */}
      <Box>
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Workflow Performance
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell><strong>Workflow Name</strong></TableCell>
                      <TableCell align="right"><strong>Executions</strong></TableCell>
                      <TableCell align="right"><strong>Completion Rate</strong></TableCell>
                      <TableCell align="right"><strong>Avg Duration</strong></TableCell>
                      <TableCell align="right"><strong>Revenue</strong></TableCell>
                      <TableCell align="right"><strong>ROI</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {workflowPerformance.map((workflow, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{workflow.workflowName}</TableCell>
                        <TableCell align="right">{workflow.executions}</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={formatPercentage(workflow.completionRate)}
                            size="small"
                            sx={{
                              bgcolor: workflow.completionRate > 90 ? '#4caf5020' : '#ff980020',
                              color: workflow.completionRate > 90 ? '#4caf50' : '#ff9800',
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">{workflow.avgDuration}h</TableCell>
                        <TableCell align="right">
                          {workflow.revenue > 0 ? formatCurrency(workflow.revenue) : '-'}
                        </TableCell>
                        <TableCell align="right">
                          {workflow.revenue > 0 ? (
                            <Chip
                              label={`+${formatPercentage((workflow.revenue / 1000) * 10)}`}
                              size="small"
                              sx={{ bgcolor: '#4caf5020', color: '#4caf50' }}
                            />
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
