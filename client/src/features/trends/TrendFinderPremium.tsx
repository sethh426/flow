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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  LinearProgress,
  Snackbar,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Tabs,
  Tab,
  Paper,
  Tooltip,
  Menu,
  List,
  ListItem,
  ListItemText,
  Divider,
  Badge,
} from '@mui/material';
import Grid2 from '@/components/Grid2';
import {
  Search,
  TrendingUp,
  TrendingDown,
  Bookmark,
  BookmarkBorder,
  Download,
  Refresh,
  MoreVert,
  Add,
  NotificationsActive,
  CompareArrows,
  CalendarToday,
  FilterList,
  ShowChart,
  BarChart,
  PieChart,
  Timeline,
  Delete,
  Edit,
  Share,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Trend {
  id: string;
  name: string;
  category: string;
  score: number;
  change: number;
  volume: number;
  competition: 'low' | 'medium' | 'high';
  opportunity: number;
  timeframe: string;
  data: { date: string; value: number }[];
}

interface SavedSearch {
  id: string;
  query: string;
  category: string;
  timestamp: Date;
  resultsCount: number;
}

interface TrendAlert {
  id: string;
  trendName: string;
  threshold: number;
  enabled: boolean;
}

const CATEGORIES = [
  'All Categories',
  'Electronics',
  'Fashion',
  'Home & Garden',
  'Beauty',
  'Sports & Outdoors',
  'Toys & Games',
  'Health & Wellness',
  'Books & Media',
];

const TIMEFRAMES = ['24h', '7d', '30d', '90d', 'Custom'];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Sample data generator
const generateTrendData = (days: number = 30): { date: string; value: number }[] => {
  const data = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.floor(Math.random() * 100) + 20,
    });
  }
  return data;
};

const SAMPLE_TRENDS: Trend[] = [
  {
    id: '1',
    name: 'Wireless Earbuds',
    category: 'Electronics',
    score: 92,
    change: 15.3,
    volume: 125000,
    competition: 'high',
    opportunity: 78,
    timeframe: '30d',
    data: generateTrendData(30),
  },
  {
    id: '2',
    name: 'Smart Home Devices',
    category: 'Electronics',
    score: 88,
    change: 12.1,
    volume: 98000,
    competition: 'medium',
    opportunity: 85,
    timeframe: '30d',
    data: generateTrendData(30),
  },
  {
    id: '3',
    name: 'Sustainable Fashion',
    category: 'Fashion',
    score: 85,
    change: 22.5,
    volume: 87000,
    competition: 'low',
    opportunity: 92,
    timeframe: '30d',
    data: generateTrendData(30),
  },
  {
    id: '4',
    name: 'Fitness Trackers',
    category: 'Sports & Outdoors',
    score: 81,
    change: 8.7,
    volume: 76000,
    competition: 'high',
    opportunity: 65,
    timeframe: '30d',
    data: generateTrendData(30),
  },
  {
    id: '5',
    name: 'Indoor Plants',
    category: 'Home & Garden',
    score: 78,
    change: 18.9,
    volume: 65000,
    competition: 'low',
    opportunity: 88,
    timeframe: '30d',
    data: generateTrendData(30),
  },
];

export default function TrendFinderPremium() {
  // State
  const [trends, setTrends] = useState<Trend[]>(SAMPLE_TRENDS);
  const [filteredTrends, setFilteredTrends] = useState<Trend[]>(SAMPLE_TRENDS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [timeframe, setTimeframe] = useState('30d');
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');
  const [selectedTrends, setSelectedTrends] = useState<string[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [alerts, setAlerts] = useState<TrendAlert[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [savedSearchDialogOpen, setSavedSearchDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [currentTab, setCurrentTab] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Filtering
  useEffect(() => {
    let filtered = trends;

    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== 'All Categories') {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }

    setFilteredTrends(filtered);
  }, [searchQuery, categoryFilter, trends]);

  // Search trends
  const searchTrends = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      showSnackbar('Trends refreshed successfully!');
    } catch (error) {
      showSnackbar('Failed to refresh trends', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Saved searches
  const saveSearch = () => {
    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      query: searchQuery || 'All',
      category: categoryFilter,
      timestamp: new Date(),
      resultsCount: filteredTrends.length,
    };
    setSavedSearches([newSearch, ...savedSearches]);
    showSnackbar('Search saved successfully!');
  };

  const loadSavedSearch = (search: SavedSearch) => {
    setSearchQuery(search.query === 'All' ? '' : search.query);
    setCategoryFilter(search.category);
    setSavedSearchDialogOpen(false);
    showSnackbar(`Loaded search: ${search.query}`);
  };

  const deleteSavedSearch = (id: string) => {
    setSavedSearches(savedSearches.filter(s => s.id !== id));
    showSnackbar('Search deleted');
  };

  // Alerts
  const createAlert = () => {
    if (!selectedTrend) return;
    
    const newAlert: TrendAlert = {
      id: Date.now().toString(),
      trendName: selectedTrend.name,
      threshold: 80,
      enabled: true,
    };
    setAlerts([...alerts, newAlert]);
    setAlertDialogOpen(false);
    showSnackbar(`Alert created for ${selectedTrend.name}`);
  };

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
    showSnackbar('Alert deleted');
  };

  // Menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, trend: Trend) => {
    setAnchorEl(event.currentTarget);
    setSelectedTrend(trend);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Export
  const exportData = (format: 'csv' | 'pdf') => {
    showSnackbar(`Exporting as ${format.toUpperCase()}...`);
    handleMenuClose();
  };

  // Competition color
  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  // Chart data for comparison
  const comparisonData = selectedTrends.length > 0
    ? trends.find(t => t.id === selectedTrends[0])?.data || []
    : [];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Trend Finder
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Discover trending products and opportunities
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Bookmark />}
            onClick={() => setSavedSearchDialogOpen(true)}
          >
            <Badge badgeContent={savedSearches.length} color="primary">
              Saved
            </Badge>
          </Button>
          <Button
            variant="outlined"
            startIcon={<NotificationsActive />}
            onClick={() => setAlertDialogOpen(true)}
          >
            <Badge badgeContent={alerts.filter(a => a.enabled).length} color="error">
              Alerts
            </Badge>
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={searchTrends}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Search & Filters */}
      <Card sx={{ mb: 3, borderRadius: 4 }}>
        <CardContent>
          <Grid2 container spacing={2} alignItems="center">
            <Grid2 size={{ xs: 12, md: 5 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search trends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Category"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  {CATEGORIES.map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Timeframe</InputLabel>
                <Select
                  value={timeframe}
                  label="Timeframe"
                  onChange={(e) => setTimeframe(e.target.value)}
                >
                  {TIMEFRAMES.map(tf => (
                    <MenuItem key={tf} value={tf}>{tf}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 2 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={saveSearch}
                startIcon={<BookmarkBorder />}
              >
                Save Search
              </Button>
            </Grid2>
          </Grid2>
        </CardContent>
      </Card>

      {/* View Mode Toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="chart">
              <ShowChart sx={{ mr: 1 }} /> Charts
            </ToggleButton>
            <ToggleButton value="table">
              <BarChart sx={{ mr: 1 }} /> Table
            </ToggleButton>
          </ToggleButtonGroup>

          {viewMode === 'chart' && (
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
          )}
        </Box>

        <Typography variant="body2" color="text.secondary">
          {filteredTrends.length} trends found
        </Typography>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Chart View */}
      {viewMode === 'chart' && (
        <Grid2 container spacing={3}>
          {filteredTrends.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((trend) => (
            <Grid2 size={{ xs: 12, md: 6 }} key={trend.id}>
              <Card
                sx={{
                  borderRadius: 4,
                  transition: 'all 0.3s ease',
                  minHeight: 450,
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        {trend.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                        <Chip label={trend.category} size="small" />
                        <Chip
                          label={`${trend.competition} competition`}
                          size="small"
                          color={getCompetitionColor(trend.competition) as any}
                        />
                        <Chip
                          icon={trend.change > 0 ? <TrendingUp /> : <TrendingDown />}
                          label={`${trend.change > 0 ? '+' : ''}${trend.change}%`}
                          size="small"
                          color={trend.change > 0 ? 'success' : 'error'}
                        />
                      </Box>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, trend)}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>

                  <Grid2 container spacing={2} sx={{ mb: 2 }}>
                    <Grid2 size={{ xs: 4 }}>
                      <Typography variant="caption" color="text.secondary">
                        Trend Score
                      </Typography>
                      <Typography variant="h5" fontWeight={700} color="primary.main">
                        {trend.score}
                      </Typography>
                    </Grid2>
                    <Grid2 size={{ xs: 4 }}>
                      <Typography variant="caption" color="text.secondary">
                        Volume
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {(trend.volume / 1000).toFixed(0)}K
                      </Typography>
                    </Grid2>
                    <Grid2 size={{ xs: 4 }}>
                      <Typography variant="caption" color="text.secondary">
                        Opportunity
                      </Typography>
                      <Typography variant="h6" fontWeight={600} color="success.main">
                        {trend.opportunity}%
                      </Typography>
                    </Grid2>
                  </Grid2>

                  {trend.data && trend.data.length > 0 && (
                    <Box sx={{ mt: 2, width: '100%', height: 200, overflow: 'hidden' }}>
                      {chartType === 'line' && (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={trend.data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <RechartsTooltip />
                            <Line type="monotone" dataKey="value" stroke="#0088FE" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                      {chartType === 'bar' && (
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsBarChart data={trend.data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <RechartsTooltip />
                            <Bar dataKey="value" fill="#0088FE" />
                          </RechartsBarChart>
                        </ResponsiveContainer>
                      )}
                      {chartType === 'area' && (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={trend.data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <RechartsTooltip />
                            <Area type="monotone" dataKey="value" stroke="#0088FE" fill="#0088FE" fillOpacity={0.3} />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid2>
          ))}
        </Grid2>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <Card sx={{ borderRadius: 4 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Trend Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>Change</TableCell>
                  <TableCell>Volume</TableCell>
                  <TableCell>Competition</TableCell>
                  <TableCell>Opportunity</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTrends.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((trend) => (
                  <TableRow key={trend.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {trend.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={trend.category} size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} color="primary.main">
                        {trend.score}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={trend.change > 0 ? <TrendingUp /> : <TrendingDown />}
                        label={`${trend.change > 0 ? '+' : ''}${trend.change}%`}
                        size="small"
                        color={trend.change > 0 ? 'success' : 'error'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {(trend.volume / 1000).toFixed(0)}K
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={trend.competition}
                        size="small"
                        color={getCompetitionColor(trend.competition) as any}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="success.main">
                        {trend.opportunity}%
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, trend)}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredTrends.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Card>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { setCompareDialogOpen(true); handleMenuClose(); }}>
          <CompareArrows sx={{ mr: 1 }} /> Compare
        </MenuItem>
        <MenuItem onClick={() => { setAlertDialogOpen(true); handleMenuClose(); }}>
          <NotificationsActive sx={{ mr: 1 }} /> Create Alert
        </MenuItem>
        <MenuItem onClick={() => exportData('csv')}>
          <Download sx={{ mr: 1 }} /> Export CSV
        </MenuItem>
        <MenuItem onClick={() => exportData('pdf')}>
          <Download sx={{ mr: 1 }} /> Export PDF
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Share sx={{ mr: 1 }} /> Share
        </MenuItem>
      </Menu>

      {/* Saved Searches Dialog */}
      <Dialog open={savedSearchDialogOpen} onClose={() => setSavedSearchDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Saved Searches</DialogTitle>
        <DialogContent>
          {savedSearches.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No saved searches yet
              </Typography>
            </Box>
          ) : (
            <List>
              {savedSearches.map((search) => (
                <Box key={search.id}>
                  <ListItem
                    secondaryAction={
                      <IconButton edge="end" onClick={() => deleteSavedSearch(search.id)}>
                        <Delete />
                      </IconButton>
                    }
                    sx={{ cursor: 'pointer' }}
                    onClick={() => loadSavedSearch(search)}
                  >
                    <ListItemText
                      primary={`${search.query} - ${search.category}`}
                      secondary={`${search.resultsCount} results • ${search.timestamp.toLocaleDateString()}`}
                    />
                  </ListItem>
                  <Divider />
                </Box>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSavedSearchDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Alert Dialog */}
      <Dialog open={alertDialogOpen} onClose={() => setAlertDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Trend Alerts</DialogTitle>
        <DialogContent>
          <List>
            {alerts.map((alert) => (
              <Box key={alert.id}>
                <ListItem
                  secondaryAction={
                    <Box>
                      <IconButton onClick={() => toggleAlert(alert.id)}>
                        <NotificationsActive color={alert.enabled ? 'primary' : 'disabled'} />
                      </IconButton>
                      <IconButton edge="end" onClick={() => deleteAlert(alert.id)}>
                        <Delete />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={alert.trendName}
                    secondary={`Threshold: ${alert.threshold}% • ${alert.enabled ? 'Active' : 'Disabled'}`}
                  />
                </ListItem>
                <Divider />
              </Box>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAlertDialogOpen(false)}>Close</Button>
          {selectedTrend && (
            <Button variant="contained" onClick={createAlert}>
              Create Alert
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
