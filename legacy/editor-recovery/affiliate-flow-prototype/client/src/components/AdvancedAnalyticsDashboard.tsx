'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  LinearProgress,
  Tooltip,
  IconButton,
  Avatar,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  Visibility,
  MouseOutlined,
  ShoppingCart,
  FilterList,
  Download,
  Refresh,
  Timeline,
  PieChart,
  BarChart,
  ShowChart,
  AutoGraph,
  Insights,
} from '@mui/icons-material';
import { advancedAIService, type PredictiveInsight } from '@/services/advanced-ai-service';

interface MetricCard {
  title: string;
  value: string;
  change: number;
  icon: JSX.Element;
  color: string;
  subtitle?: string;
}

interface ConversionFunnelStep {
  name: string;
  count: number;
  percentage: number;
  dropoff?: number;
}

interface CohortData {
  cohort: string;
  retention: number[];
  revenue: number;
  users: number;
}

export default function AdvancedAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - Replace with real API calls
  const [metrics] = useState<MetricCard[]>([
    {
      title: 'Total Revenue',
      value: '$24,582',
      change: 12.5,
      icon: <AttachMoney />,
      color: 'success.main',
      subtitle: '+$2,741 vs last period',
    },
    {
      title: 'Conversion Rate',
      value: '3.42%',
      change: 8.3,
      icon: <ShoppingCart />,
      color: 'primary.main',
      subtitle: '0.26% improvement',
    },
    {
      title: 'Avg. Order Value',
      value: '$87.50',
      change: -2.1,
      icon: <MouseOutlined />,
      color: 'warning.main',
      subtitle: '-$1.85 vs last period',
    },
    {
      title: 'Total Visitors',
      value: '45,283',
      change: 15.7,
      icon: <Visibility />,
      color: 'info.main',
      subtitle: '+6,142 new visitors',
    },
  ]);

  const [conversionFunnel] = useState<ConversionFunnelStep[]>([
    { name: 'Visitors', count: 45283, percentage: 100 },
    { name: 'Product Views', count: 12847, percentage: 28.4, dropoff: 71.6 },
    { name: 'Add to Cart', count: 3842, percentage: 8.5, dropoff: 70.1 },
    { name: 'Checkout', count: 2156, percentage: 4.8, dropoff: 43.9 },
    { name: 'Purchase', count: 1548, percentage: 3.4, dropoff: 28.2 },
  ]);

  const [cohortAnalysis] = useState<CohortData[]>([
    { cohort: 'Week 1', retention: [100, 65, 42, 28, 18], revenue: 12500, users: 1250 },
    { cohort: 'Week 2', retention: [100, 68, 45, 31, 22], revenue: 15200, users: 1420 },
    { cohort: 'Week 3', retention: [100, 72, 51, 38, 28], revenue: 18700, users: 1680 },
    { cohort: 'Week 4', retention: [100, 75, 58, 45, 35], revenue: 22400, users: 1950 },
  ]);

  const [topPerformers] = useState([
    { name: 'Summer Sale Campaign', revenue: '$8,542', roi: 245, conversions: 342 },
    { name: 'Tech Gadgets Bundle', revenue: '$6,890', roi: 189, conversions: 278 },
    { name: 'Fitness Equipment', revenue: '$5,234', roi: 156, conversions: 198 },
    { name: 'Home Decor Collection', revenue: '$4,567', roi: 142, conversions: 165 },
    { name: 'Fashion Accessories', revenue: '$3,921', roi: 128, conversions: 142 },
  ]);

  useEffect(() => {
    loadPredictiveInsights();
  }, [timeRange]);

  const loadPredictiveInsights = async () => {
    setLoading(true);
    try {
      // Mock data for demo
      const mockInsights = await advancedAIService.generatePredictiveInsights(
        [], // campaigns
        [], // products
        {} // analytics
      );
      setInsights(mockInsights);
    } catch (error) {
      console.error('Failed to load insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPredictiveInsights();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleExport = () => {
    // Export logic
    console.log('Exporting analytics data...');
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'success.main';
    if (change < 0) return 'error.main';
    return 'text.secondary';
  };

  const getChangeIcon = (change: number) => {
    return change > 0 ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            📊 Advanced Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time insights, predictive analytics, and comprehensive reporting
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="24h">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
              <MenuItem value="1y">Last Year</MenuItem>
            </Select>
          </FormControl>
          
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              <Refresh className={refreshing ? 'rotating' : ''} />
            </IconButton>
          </Tooltip>
          
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleExport}
          >
            Export Report
          </Button>
        </Box>
      </Box>

      {refreshing && <LinearProgress sx={{ mb: 2 }} />}

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {metrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Avatar sx={{ bgcolor: metric.color, opacity: 0.15 }}>
                    {metric.icon}
                  </Avatar>
                  <Chip
                    icon={getChangeIcon(metric.change)}
                    label={`${metric.change > 0 ? '+' : ''}${metric.change}%`}
                    size="small"
                    sx={{ 
                      color: getChangeColor(metric.change),
                      bgcolor: `${getChangeColor(metric.change)}15`,
                      fontWeight: 'bold',
                    }}
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {metric.title}
                </Typography>
                <Typography variant="h4" gutterBottom>
                  {metric.value}
                </Typography>
                {metric.subtitle && (
                  <Typography variant="caption" color="text.secondary">
                    {metric.subtitle}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Conversion Funnel */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <FilterList />
              <Typography variant="h6">Conversion Funnel</Typography>
            </Box>
            
            {conversionFunnel.map((step, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">{step.name}</Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {step.count.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {step.percentage.toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={step.percentage}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'action.hover',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: `hsl(${220 - index * 30}, 70%, 50%)`,
                    },
                  }}
                />
                {step.dropoff !== undefined && (
                  <Typography variant="caption" color="error.main">
                    {step.dropoff.toFixed(1)}% drop-off
                  </Typography>
                )}
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Top Performers */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Timeline />
              <Typography variant="h6">Top Performers</Typography>
            </Box>
            
            {topPerformers.map((item, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={`#${index + 1}`}
                      size="small"
                      sx={{ 
                        minWidth: 40,
                        bgcolor: index === 0 ? 'primary.main' : 'action.hover',
                        color: index === 0 ? 'white' : 'text.primary',
                      }}
                    />
                    <Typography variant="body2">{item.name}</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="bold" color="success.main">
                    {item.revenue}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, ml: 6 }}>
                  <Chip label={`${item.roi}% ROI`} size="small" />
                  <Chip label={`${item.conversions} conversions`} size="small" variant="outlined" />
                </Box>
                {index < topPerformers.length - 1 && <Divider sx={{ mt: 2 }} />}
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Cohort Analysis */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <AutoGraph />
              <Typography variant="h6">Cohort Retention Analysis</Typography>
            </Box>
            
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid #e0e0e0' }}>
                      <Typography variant="body2" fontWeight="bold">Cohort</Typography>
                    </th>
                    <th style={{ textAlign: 'right', padding: '12px', borderBottom: '2px solid #e0e0e0' }}>
                      <Typography variant="body2" fontWeight="bold">Users</Typography>
                    </th>
                    <th style={{ textAlign: 'right', padding: '12px', borderBottom: '2px solid #e0e0e0' }}>
                      <Typography variant="body2" fontWeight="bold">Revenue</Typography>
                    </th>
                    {[0, 1, 2, 3, 4].map((week) => (
                      <th key={week} style={{ textAlign: 'center', padding: '12px', borderBottom: '2px solid #e0e0e0' }}>
                        <Typography variant="body2" fontWeight="bold">Week {week}</Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cohortAnalysis.map((cohort, index) => (
                    <tr key={index}>
                      <td style={{ padding: '12px', borderBottom: '1px solid #f0f0f0' }}>
                        <Typography variant="body2">{cohort.cohort}</Typography>
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #f0f0f0', textAlign: 'right' }}>
                        <Typography variant="body2">{cohort.users}</Typography>
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #f0f0f0', textAlign: 'right' }}>
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          ${cohort.revenue.toLocaleString()}
                        </Typography>
                      </td>
                      {cohort.retention.map((retention, weekIndex) => (
                        <td key={weekIndex} style={{ padding: '12px', borderBottom: '1px solid #f0f0f0', textAlign: 'center' }}>
                          <Chip
                            label={`${retention}%`}
                            size="small"
                            sx={{
                              bgcolor: `rgba(76, 175, 80, ${retention / 100})`,
                              color: retention > 50 ? 'white' : 'text.primary',
                              fontWeight: 'bold',
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Paper>
        </Grid>

        {/* Predictive Insights */}
        {insights.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Insights />
                <Typography variant="h6">🔮 Predictive Insights</Typography>
                <Chip label="AI-Powered" size="small" color="primary" />
              </Box>
              
              <Grid container spacing={2}>
                {insights.map((insight, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle2">{insight.title}</Typography>
                          <Chip 
                            label={`${insight.confidence}% confidence`} 
                            size="small"
                            color={insight.confidence > 80 ? 'success' : 'default'}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {insight.description}
                        </Typography>
                        
                        {insight.estimatedImpact && (
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {insight.estimatedImpact.revenue && (
                              <Chip 
                                icon={<AttachMoney />}
                                label={`${insight.estimatedImpact.revenue > 0 ? '+' : ''}${insight.estimatedImpact.revenue}%`} 
                                size="small"
                                color="success"
                              />
                            )}
                            {insight.estimatedImpact.engagement && (
                              <Chip 
                                label={`${insight.estimatedImpact.engagement > 0 ? '+' : ''}${insight.estimatedImpact.engagement}% engagement`} 
                                size="small"
                              />
                            )}
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>

      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .rotating {
          animation: rotate 1s linear infinite;
        }
      `}</style>
    </Box>
  );
}
