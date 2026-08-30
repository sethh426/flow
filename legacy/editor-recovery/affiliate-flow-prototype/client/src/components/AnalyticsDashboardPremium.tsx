'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
  Snackbar,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Menu,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  CalendarToday,
  Download,
  Refresh,
  CompareArrows,
  ShowChart,
  BarChart,
  PieChart as PieChartIcon,
  Timeline,
  AttachMoney,
  ShoppingCart,
  Visibility,
  MouseOutlined,
  MoreVert,
  DateRange,
  FilterList,
  Assessment,
  AutoAwesome,
  Insights,
  Build,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
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
  ComposedChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

interface Metric {
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  color: string;
}

interface TimeSeriesData {
  date: string;
  revenue: number;
  conversions: number;
  clicks: number;
  impressions: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Sample data generators
const generateTimeSeriesData = (days: number = 30): TimeSeriesData[] => {
  const data: TimeSeriesData[] = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: Math.floor(Math.random() * 5000) + 2000,
      conversions: Math.floor(Math.random() * 100) + 20,
      clicks: Math.floor(Math.random() * 1000) + 500,
      impressions: Math.floor(Math.random() * 10000) + 5000,
    });
  }
  return data;
};

const generateCategoryData = (): CategoryData[] => [
  { name: 'Electronics', value: 35, color: COLORS[0] },
  { name: 'Fashion', value: 25, color: COLORS[1] },
  { name: 'Home & Garden', value: 20, color: COLORS[2] },
  { name: 'Beauty', value: 12, color: COLORS[3] },
  { name: 'Sports', value: 8, color: COLORS[4] },
];

const generatePerformanceData = () => [
  { metric: 'CTR', value: 85, fullMark: 100 },
  { metric: 'Conv Rate', value: 72, fullMark: 100 },
  { metric: 'ROI', value: 90, fullMark: 100 },
  { metric: 'Engagement', value: 78, fullMark: 100 },
  { metric: 'Quality', value: 88, fullMark: 100 },
];

export default function AnalyticsDashboardPremium() {
  // State
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('area');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [dateRangeDialogOpen, setDateRangeDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // Advanced Analytics States
  const [reportBuilderOpen, setReportBuilderOpen] = useState(false);
  const [aiInsightsOpen, setAiInsightsOpen] = useState(false);
  const [benchmarkingOpen, setBenchmarkingOpen] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [benchmarkData, setBenchmarkData] = useState<any>(null);
  const [customReport, setCustomReport] = useState({
    name: '',
    metrics: [] as string[],
    dimensions: [] as string[],
    filters: [] as string[],
  });
  
  // Data
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>(generateTimeSeriesData(30));
  const [categoryData, setCategoryData] = useState<CategoryData[]>(generateCategoryData());
  const [performanceData, setPerformanceData] = useState(generatePerformanceData());

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // AI Insights Generation
  const generateAIInsights = async () => {
    setAiAnalyzing(true);
    setAiInsightsOpen(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const insights = [
        {
          id: 1,
          type: 'opportunity',
          title: 'Peak Performance Window',
          description: 'Your campaigns perform 34% better between 2-4 PM. Consider increasing budget allocation during these hours.',
          impact: 'High',
          actionable: true,
          metric: '+34% conversion rate',
        },
        {
          id: 2,
          type: 'warning',
          title: 'Declining Mobile Performance',
          description: 'Mobile conversion rates have dropped 12% in the last 7 days. Review mobile landing page experience.',
          impact: 'Medium',
          actionable: true,
          metric: '-12% mobile conversions',
        },
        {
          id: 3,
          type: 'success',
          title: 'Category Growth Leader',
          description: 'Electronics category is outperforming by 45% vs. industry average. Expand product offerings in this vertical.',
          impact: 'High',
          actionable: true,
          metric: '+45% vs benchmark',
        },
        {
          id: 4,
          type: 'insight',
          title: 'Seasonal Trend Detected',
          description: 'Historical data shows 28% revenue increase expected in next 30 days. Prepare inventory and scale campaigns.',
          impact: 'Medium',
          actionable: false,
          metric: '+28% predicted growth',
        },
      ];
      
      setAiInsights(insights);
      showSnackbar('AI insights generated successfully!');
    } catch (error) {
      showSnackbar('Failed to generate insights', 'error');
    } finally {
      setAiAnalyzing(false);
    }
  };

  // Industry Benchmarking
  const loadBenchmarkData = async () => {
    setAiAnalyzing(true);
    setBenchmarkingOpen(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1800));
      
      const benchmark = {
        yourPerformance: {
          conversionRate: 3.2,
          avgOrderValue: 87,
          clickThroughRate: 2.8,
          returnOnAdSpend: 4.5,
        },
        industryAverage: {
          conversionRate: 2.1,
          avgOrderValue: 65,
          clickThroughRate: 1.9,
          returnOnAdSpend: 3.2,
        },
        topPerformers: {
          conversionRate: 5.8,
          avgOrderValue: 125,
          clickThroughRate: 4.2,
          returnOnAdSpend: 7.8,
        },
        ranking: {
          overall: 'Top 15%',
          conversionRate: 'Top 10%',
          avgOrderValue: 'Top 20%',
          clickThroughRate: 'Top 25%',
          returnOnAdSpend: 'Top 12%',
        },
        recommendations: [
          'Focus on improving CTR to reach top 10% (increase by 1.4 points)',
          'Your AOV is strong but can be optimized with upsell strategies',
          'Conversion rate is excellent - consider case study or best practice documentation',
        ],
      };
      
      setBenchmarkData(benchmark);
      showSnackbar('Benchmark data loaded successfully!');
    } catch (error) {
      showSnackbar('Failed to load benchmarks', 'error');
    } finally {
      setAiAnalyzing(false);
    }
  };

  // Custom Report Creation
  const createCustomReport = () => {
    if (!customReport.name || customReport.metrics.length === 0) {
      showSnackbar('Please provide report name and select metrics', 'error');
      return;
    }
    
    showSnackbar(`Custom report "${customReport.name}" created successfully!`);
    setReportBuilderOpen(false);
    setCustomReport({
      name: '',
      metrics: [],
      dimensions: [],
      filters: [],
    });
  };

  const toggleMetric = (metric: string) => {
    setCustomReport(prev => ({
      ...prev,
      metrics: prev.metrics.includes(metric)
        ? prev.metrics.filter(m => m !== metric)
        : [...prev.metrics, metric],
    }));
  };

  const toggleDimension = (dimension: string) => {
    setCustomReport(prev => ({
      ...prev,
      dimensions: prev.dimensions.includes(dimension)
        ? prev.dimensions.filter(d => d !== dimension)
        : [...prev.dimensions, dimension],
    }));
  };

  // Metrics
  const metrics: Metric[] = [
    {
      name: 'Total Revenue',
      value: 87542,
      change: 12.5,
      trend: 'up',
      icon: <AttachMoney />,
      color: '#00C49F',
    },
    {
      name: 'Conversions',
      value: 2341,
      change: 8.2,
      trend: 'up',
      icon: <ShoppingCart />,
      color: '#0088FE',
    },
    {
      name: 'Total Clicks',
      value: 45678,
      change: -3.1,
      trend: 'down',
      icon: <MouseOutlined />,
      color: '#FFBB28',
    },
    {
      name: 'Impressions',
      value: 234567,
      change: 15.7,
      trend: 'up',
      icon: <Visibility />,
      color: '#FF8042',
    },
  ];

  // Load analytics
  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Regenerate data based on timeframe
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 30;
      setTimeSeriesData(generateTimeSeriesData(days));
      
      showSnackbar('Analytics refreshed successfully!');
    } catch (error) {
      showSnackbar('Failed to load analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  // Export functionality
  const exportData = async (format: 'csv' | 'pdf') => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      showSnackbar(`Exported as ${format.toUpperCase()}`);
      setExportDialogOpen(false);
    } catch (error) {
      showSnackbar('Export failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (num: number) => `$${formatNumber(num)}`;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Analytics Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track and analyze your performance metrics
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
              <MenuItem value="custom">Custom Range</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<Build />}
            onClick={() => setReportBuilderOpen(true)}
          >
            Report Builder
          </Button>
          <Button
            variant="outlined"
            startIcon={<AutoAwesome />}
            onClick={generateAIInsights}
          >
            AI Insights
          </Button>
          <Button
            variant="outlined"
            startIcon={<Insights />}
            onClick={loadBenchmarkData}
          >
            Benchmarks
          </Button>
          <Button
            variant="outlined"
            startIcon={<CalendarToday />}
            onClick={() => setDateRangeDialogOpen(true)}
          >
            Custom
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadAnalytics}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={() => setExportDialogOpen(true)}
          >
            Export
          </Button>
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {metrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                borderRadius: 4,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: `${metric.color}20`,
                      color: metric.color,
                    }}
                  >
                    {metric.icon}
                  </Box>
                  <Chip
                    icon={metric.trend === 'up' ? <TrendingUp /> : <TrendingDown />}
                    label={`${metric.change > 0 ? '+' : ''}${metric.change}%`}
                    size="small"
                    color={metric.trend === 'up' ? 'success' : 'error'}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {metric.name}
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {metric.name.includes('Revenue') ? formatCurrency(metric.value) : formatNumber(metric.value)}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={75}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: `${metric.color}20`,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: metric.color,
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Revenue Over Time */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={700}>
                  Performance Trends
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <ToggleButtonGroup
                    value={selectedMetric}
                    exclusive
                    onChange={(e, newMetric) => newMetric && setSelectedMetric(newMetric)}
                    size="small"
                  >
                    <ToggleButton value="revenue">Revenue</ToggleButton>
                    <ToggleButton value="conversions">Conversions</ToggleButton>
                    <ToggleButton value="clicks">Clicks</ToggleButton>
                  </ToggleButtonGroup>
                  <ToggleButtonGroup
                    value={chartType}
                    exclusive
                    onChange={(e, newType) => newType && setChartType(newType)}
                    size="small"
                  >
                    <ToggleButton value="line">
                      <Timeline />
                    </ToggleButton>
                    <ToggleButton value="bar">
                      <BarChart />
                    </ToggleButton>
                    <ToggleButton value="area">
                      <ShowChart />
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Box>

              <ResponsiveContainer width="100%" height={350}>
                {chartType === 'line' && (
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey={selectedMetric}
                      stroke="#0088FE"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                )}
                {chartType === 'bar' && (
                  <RechartsBarChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey={selectedMetric} fill="#0088FE" />
                  </RechartsBarChart>
                )}
                {chartType === 'area' && (
                  <AreaChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey={selectedMetric}
                      stroke="#0088FE"
                      fill="#0088FE"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Category Breakdown */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 4, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Category Breakdown
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>

              <List dense sx={{ mt: 2 }}>
                {categoryData.map((category, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: category.color,
                        mr: 2,
                      }}
                    />
                    <ListItemText
                      primary={category.name}
                      secondary={`${category.value}%`}
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Additional Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Performance Radar */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Performance Radar
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={performanceData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Performance"
                    dataKey="value"
                    stroke="#0088FE"
                    fill="#0088FE"
                    fillOpacity={0.6}
                  />
                  <RechartsTooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Multi-Metric Comparison */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Multi-Metric Comparison
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={timeSeriesData.slice(-7)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <RechartsTooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="conversions" fill="#00C49F" />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#0088FE" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Goals & Insights */}
      <Grid container spacing={3}>
        {/* Goal Tracking */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Goal Tracking
              </Typography>
              <Box sx={{ mt: 3 }}>
                {[
                  { name: 'Monthly Revenue', current: 87542, target: 100000, color: '#00C49F' },
                  { name: 'New Conversions', current: 2341, target: 3000, color: '#0088FE' },
                  { name: 'Active Campaigns', current: 18, target: 25, color: '#FFBB28' },
                ].map((goal, index) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {goal.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatNumber(goal.current)} / {formatNumber(goal.target)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(goal.current / goal.target) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: `${goal.color}20`,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: goal.color,
                        },
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {((goal.current / goal.target) * 100).toFixed(1)}% complete
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Key Insights */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Key Insights
              </Typography>
              <List>
                {[
                  { text: 'Revenue increased 12.5% compared to last period', color: 'success', icon: <TrendingUp /> },
                  { text: 'Electronics category performing best at 35%', color: 'info', icon: <Assessment /> },
                  { text: 'Click-through rate down 3.1% - needs attention', color: 'warning', icon: <TrendingDown /> },
                  { text: 'Conversion rate at 5.1% - above industry average', color: 'success', icon: <TrendingUp /> },
                ].map((insight, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        backgroundColor: `${insight.color === 'success' ? '#00C49F' : insight.color === 'warning' ? '#FFBB28' : '#0088FE'}20`,
                        color: insight.color === 'success' ? '#00C49F' : insight.color === 'warning' ? '#FFBB28' : '#0088FE',
                        mr: 2,
                      }}
                    >
                      {insight.icon}
                    </Box>
                    <ListItemText
                      primary={insight.text}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Date Range Dialog */}
      <Dialog open={dateRangeDialogOpen} onClose={() => setDateRangeDialogOpen(false)}>
        <DialogTitle>Custom Date Range</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              type="date"
              label="Start Date"
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              type="date"
              label="End Date"
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDateRangeDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setDateRangeDialogOpen(false)}>
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <DialogTitle>Export Analytics</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Choose export format:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => exportData('csv')}
                disabled={loading}
                fullWidth
              >
                Export as CSV
              </Button>
              <Button
                variant="outlined"
                onClick={() => exportData('pdf')}
                disabled={loading}
                fullWidth
              >
                Export as PDF
              </Button>
            </Box>
            {loading && <LinearProgress sx={{ mt: 2 }} />}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Custom Report Builder Dialog */}
      <Dialog open={reportBuilderOpen} onClose={() => setReportBuilderOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Build sx={{ color: 'primary.main' }} />
            Custom Report Builder
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              label="Report Name"
              value={customReport.name}
              onChange={(e) => setCustomReport(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              sx={{ mb: 3 }}
            />

            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Select Metrics
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
              {['Revenue', 'Conversions', 'Clicks', 'Impressions', 'CTR', 'CPC', 'ROI', 'ROAS'].map((metric) => (
                <Chip
                  key={metric}
                  label={metric}
                  onClick={() => toggleMetric(metric)}
                  color={customReport.metrics.includes(metric) ? 'primary' : 'default'}
                  variant={customReport.metrics.includes(metric) ? 'filled' : 'outlined'}
                />
              ))}
            </Box>

            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Group By (Dimensions)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
              {['Date', 'Campaign', 'Category', 'Product', 'Source', 'Device'].map((dim) => (
                <Chip
                  key={dim}
                  label={dim}
                  onClick={() => toggleDimension(dim)}
                  color={customReport.dimensions.includes(dim) ? 'secondary' : 'default'}
                  variant={customReport.dimensions.includes(dim) ? 'filled' : 'outlined'}
                />
              ))}
            </Box>

            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Visualization Type
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button variant="outlined" startIcon={<ShowChart />} size="small">Line Chart</Button>
              <Button variant="outlined" startIcon={<BarChart />} size="small">Bar Chart</Button>
              <Button variant="outlined" startIcon={<PieChartIcon />} size="small">Pie Chart</Button>
              <Button variant="outlined" startIcon={<Timeline />} size="small">Table</Button>
            </Box>

            {customReport.metrics.length > 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Report will include {customReport.metrics.length} metric(s) and {customReport.dimensions.length} dimension(s)
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setReportBuilderOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={createCustomReport}
            disabled={!customReport.name || customReport.metrics.length === 0}
          >
            Create Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI Insights Dialog */}
      <Dialog open={aiInsightsOpen} onClose={() => setAiInsightsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesome sx={{ color: 'primary.main' }} />
            AI-Powered Insights
          </Box>
        </DialogTitle>
        <DialogContent>
          {aiAnalyzing ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <LinearProgress sx={{ mb: 2 }} />
              <Typography color="text.secondary">
                Analyzing your data and generating actionable insights...
              </Typography>
            </Box>
          ) : (
            <Box sx={{ pt: 2 }}>
              {aiInsights.map((insight) => (
                <Card key={insight.id} sx={{ mb: 2, p: 2.5, border: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {insight.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        {insight.description}
                      </Typography>
                    </Box>
                    <Chip
                      label={insight.metric}
                      size="small"
                      color={insight.type === 'opportunity' || insight.type === 'success' ? 'success' : insight.type === 'warning' ? 'warning' : 'info'}
                      sx={{ ml: 2 }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip
                      label={`Impact: ${insight.impact}`}
                      size="small"
                      color={insight.impact === 'High' ? 'error' : 'warning'}
                      variant="outlined"
                    />
                    {insight.actionable && (
                      <Button size="small" variant="contained">
                        Take Action
                      </Button>
                    )}
                  </Box>
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setAiInsightsOpen(false)}>Close</Button>
          {!aiAnalyzing && aiInsights.length === 0 && (
            <Button variant="contained" onClick={generateAIInsights}>
              Generate Insights
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Industry Benchmarking Dialog */}
      <Dialog open={benchmarkingOpen} onClose={() => setBenchmarkingOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Insights sx={{ color: 'primary.main' }} />
            Industry Benchmarking
          </Box>
        </DialogTitle>
        <DialogContent>
          {aiAnalyzing ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <LinearProgress sx={{ mb: 2 }} />
              <Typography color="text.secondary">
                Loading industry benchmark data and comparing performance...
              </Typography>
            </Box>
          ) : benchmarkData ? (
            <Box sx={{ pt: 2 }}>
              <Card sx={{ p: 3, mb: 3, bgcolor: 'primary.50' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Overall Ranking: {benchmarkData.ranking.overall}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You're performing better than 85% of similar businesses
                </Typography>
              </Card>

              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Performance Comparison
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                {[
                  { metric: 'Conversion Rate', your: benchmarkData.yourPerformance.conversionRate, avg: benchmarkData.industryAverage.conversionRate, top: benchmarkData.topPerformers.conversionRate, unit: '%' },
                  { metric: 'Avg Order Value', your: benchmarkData.yourPerformance.avgOrderValue, avg: benchmarkData.industryAverage.avgOrderValue, top: benchmarkData.topPerformers.avgOrderValue, unit: '$' },
                  { metric: 'Click-Through Rate', your: benchmarkData.yourPerformance.clickThroughRate, avg: benchmarkData.industryAverage.clickThroughRate, top: benchmarkData.topPerformers.clickThroughRate, unit: '%' },
                  { metric: 'Return on Ad Spend', your: benchmarkData.yourPerformance.returnOnAdSpend, avg: benchmarkData.industryAverage.returnOnAdSpend, top: benchmarkData.topPerformers.returnOnAdSpend, unit: 'x' },
                ].map((item, idx) => (
                  <Card key={idx} sx={{ mb: 2, p: 2 }}>
                    <Typography variant="body2" fontWeight={600} gutterBottom>
                      {item.metric}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">You</Typography>
                        <Typography variant="h6" fontWeight={700} color="primary.main">
                          {item.unit === '$' ? '$' : ''}{item.your}{item.unit !== '$' ? item.unit : ''}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Industry Avg</Typography>
                        <Typography variant="h6">
                          {item.unit === '$' ? '$' : ''}{item.avg}{item.unit !== '$' ? item.unit : ''}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Top 10%</Typography>
                        <Typography variant="h6" color="success.main">
                          {item.unit === '$' ? '$' : ''}{item.top}{item.unit !== '$' ? item.unit : ''}
                        </Typography>
                      </Box>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(item.your / item.top) * 100}
                      sx={{ mt: 1, height: 8, borderRadius: 1 }}
                    />
                  </Card>
                ))}
              </Box>

              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Recommendations
              </Typography>
              {benchmarkData.recommendations.map((rec: string, idx: number) => (
                <Alert key={idx} severity="info" sx={{ mb: 1 }}>
                  {rec}
                </Alert>
              ))}
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setBenchmarkingOpen(false)}>Close</Button>
          {!aiAnalyzing && !benchmarkData && (
            <Button variant="contained" onClick={loadBenchmarkData}>
              Load Benchmarks
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
