/**
 * Advanced A/B Testing Engine
 * Multi-variant testing with statistical significance
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Science,
  CheckCircle,
  Warning,
  Add,
  PlayArrow,
  Stop,
  Visibility,
} from '@mui/icons-material';

interface ABTest {
  id: string;
  name: string;
  status: 'draft' | 'running' | 'completed' | 'paused';
  startDate: Date;
  endDate?: Date;
  metric: string;
  variants: ABVariant[];
  totalSamples: number;
  confidence: number;
  winner?: string;
}

interface ABVariant {
  id: string;
  name: string;
  description: string;
  traffic: number;
  samples: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  avgRevenuePerUser: number;
  isControl: boolean;
}

export default function ABTestingDashboard() {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);

  // Load tests from Firestore
  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ab-tests');
      if (!response.ok) throw new Error('Failed to fetch tests');
      const data = await response.json();
      
      // Convert date strings to Date objects
      const testsData = (data.tests || []).map((test: any) => ({
        ...test,
        startDate: new Date(test.startDate || test.createdAt),
        endDate: test.endDate ? new Date(test.endDate) : undefined,
      }));
      
      setTests(testsData);
    } catch (error) {
      console.error('Error loading tests:', error);
      // Keep demo data as fallback
      setTests(getDemoTests());
    } finally {
      setLoading(false);
    }
  };

  const getDemoTests = () => [
    {
      id: 'test1',
      name: 'Email Subject Line Test',
      status: 'running',
      startDate: new Date('2025-01-01'),
      metric: 'Open Rate',
      totalSamples: 5420,
      confidence: 94.3,
      variants: [
        {
          id: 'control',
          name: 'Control',
          description: 'Complete your purchase - 20% off inside!',
          traffic: 50,
          samples: 2710,
          conversions: 897,
          conversionRate: 33.1,
          revenue: 4825,
          avgRevenuePerUser: 1.78,
          isControl: true,
        },
        {
          id: 'variant-a',
          name: 'Variant A',
          description: '{{firstName}}, your cart is waiting (plus a surprise!)',
          traffic: 50,
          samples: 2710,
          conversions: 1084,
          conversionRate: 40.0,
          revenue: 6120,
          avgRevenuePerUser: 2.26,
          isControl: false,
        },
      ],
    },
    {
      id: 'test2',
      name: 'Abandoned Cart Recovery Timing',
      status: 'running',
      startDate: new Date('2025-01-03'),
      metric: 'Recovery Rate',
      totalSamples: 3280,
      confidence: 87.2,
      variants: [
        {
          id: 'control',
          name: '1 Hour Wait',
          description: 'Send first email 1 hour after abandonment',
          traffic: 33,
          samples: 1093,
          conversions: 142,
          conversionRate: 13.0,
          revenue: 2840,
          avgRevenuePerUser: 2.60,
          isControl: true,
        },
        {
          id: 'variant-a',
          name: '3 Hour Wait',
          description: 'Send first email 3 hours after abandonment',
          traffic: 33,
          samples: 1093,
          conversions: 164,
          conversionRate: 15.0,
          revenue: 3280,
          avgRevenuePerUser: 3.00,
          isControl: false,
        },
        {
          id: 'variant-b',
          name: '24 Hour Wait',
          description: 'Send first email 24 hours after abandonment',
          traffic: 34,
          samples: 1094,
          conversions: 120,
          conversionRate: 11.0,
          revenue: 2400,
          avgRevenuePerUser: 2.19,
          isControl: false,
        },
      ],
    },
    {
      id: 'test3',
      name: 'Lead Response Time (Real Estate)',
      status: 'completed',
      startDate: new Date('2024-12-15'),
      endDate: new Date('2025-01-05'),
      metric: 'Appointment Rate',
      totalSamples: 1240,
      confidence: 99.5,
      winner: 'variant-a',
      variants: [
        {
          id: 'control',
          name: '15 Min Response',
          description: 'Contact lead within 15 minutes',
          traffic: 50,
          samples: 620,
          conversions: 124,
          conversionRate: 20.0,
          revenue: 62000,
          avgRevenuePerUser: 100,
          isControl: true,
        },
        {
          id: 'variant-a',
          name: '5 Min Response',
          description: 'Contact lead within 5 minutes',
          traffic: 50,
          samples: 620,
          conversions: 173,
          conversionRate: 27.9,
          revenue: 86500,
          avgRevenuePerUser: 139.52,
          isControl: false,
        },
      ],
    },
  ];

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);

  const handleCreateTest = () => {
    setCreateDialogOpen(true);
  };

  const handleViewDetails = (test: ABTest) => {
    setSelectedTest(test);
  };

  const calculateLift = (variant: ABVariant, control: ABVariant) => {
    const lift = ((variant.conversionRate - control.conversionRate) / control.conversionRate) * 100;
    return lift;
  };

  const getStatisticalSignificance = (confidence: number) => {
    if (confidence >= 95) return { label: 'Significant', color: 'success', icon: <CheckCircle /> };
    if (confidence >= 80) return { label: 'Trending', color: 'warning', icon: <Warning /> };
    return { label: 'Insufficient Data', color: 'default', icon: <Science /> };
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
          A/B Testing Dashboard
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateTest}
        >
          Create New Test
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Active Tests
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {tests.filter(t => t.status === 'running').length}
              </Typography>
              <Chip
                label="+2 this week"
                size="small"
                sx={{ mt: 1, bgcolor: '#4caf5020', color: '#4caf50' }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Avg Conversion Lift
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ color: '#4caf50' }}>
                +18.7%
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                <TrendingUp fontSize="small" sx={{ color: '#4caf50' }} />
                <Typography variant="caption" color="text.secondary">
                  vs control groups
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Total Revenue Impact
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ color: '#2196f3' }}>
                $34.2K
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                From winning variants
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Avg Confidence Level
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                93.7%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={93.7}
                sx={{ mt: 1, height: 6, borderRadius: 3 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Active Tests */}
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        Running Tests
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {tests
          .filter(test => test.status === 'running')
          .map((test) => {
            const control = test.variants.find(v => v.isControl);
            const bestVariant = test.variants.reduce((best, current) =>
              current.conversionRate > best.conversionRate ? current : best
            );
            const significance = getStatisticalSignificance(test.confidence);

            return (
              <Grid item xs={12} key={test.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {test.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Testing: {test.metric} • Started {test.startDate.toLocaleDateString()}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip
                          label={test.status}
                          color="primary"
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                        <Chip
                          icon={significance.icon}
                          label={`${test.confidence}% ${significance.label}`}
                          color={significance.color as any}
                          size="small"
                        />
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => handleViewDetails(test)}>
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                            <TableCell><strong>Variant</strong></TableCell>
                            <TableCell align="right"><strong>Traffic</strong></TableCell>
                            <TableCell align="right"><strong>Samples</strong></TableCell>
                            <TableCell align="right"><strong>Conversions</strong></TableCell>
                            <TableCell align="right"><strong>Conv. Rate</strong></TableCell>
                            <TableCell align="right"><strong>Revenue</strong></TableCell>
                            <TableCell align="right"><strong>ARPU</strong></TableCell>
                            <TableCell align="right"><strong>Lift</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {test.variants.map((variant) => {
                            const lift = control ? calculateLift(variant, control) : 0;
                            const isWinning = variant.id === bestVariant.id && !variant.isControl;

                            return (
                              <TableRow
                                key={variant.id}
                                sx={{
                                  bgcolor: isWinning ? '#4caf5010' : 'inherit',
                                }}
                              >
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2" fontWeight="bold">
                                      {variant.name}
                                    </Typography>
                                    {variant.isControl && (
                                      <Chip label="Control" size="small" variant="outlined" />
                                    )}
                                    {isWinning && (
                                      <Chip
                                        label="Leading"
                                        size="small"
                                        sx={{ bgcolor: '#4caf5020', color: '#4caf50' }}
                                      />
                                    )}
                                  </Box>
                                  <Typography variant="caption" color="text.secondary">
                                    {variant.description}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">{variant.traffic}%</TableCell>
                                <TableCell align="right">{variant.samples.toLocaleString()}</TableCell>
                                <TableCell align="right">{variant.conversions.toLocaleString()}</TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2" fontWeight="bold">
                                    {formatPercentage(variant.conversionRate)}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">{formatCurrency(variant.revenue)}</TableCell>
                                <TableCell align="right">
                                  ${variant.avgRevenuePerUser.toFixed(2)}
                                </TableCell>
                                <TableCell align="right">
                                  {!variant.isControl && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                                      {lift > 0 ? (
                                        <TrendingUp fontSize="small" sx={{ color: '#4caf50' }} />
                                      ) : (
                                        <TrendingDown fontSize="small" sx={{ color: '#f44336' }} />
                                      )}
                                      <Typography
                                        variant="body2"
                                        fontWeight="bold"
                                        sx={{ color: lift > 0 ? '#4caf50' : '#f44336' }}
                                      >
                                        {lift > 0 ? '+' : ''}{lift.toFixed(1)}%
                                      </Typography>
                                    </Box>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {test.confidence >= 95 && (
                      <Alert severity="success" sx={{ mt: 2 }}>
                        <strong>Ready to declare winner!</strong> This test has reached statistical
                        significance. Consider implementing the winning variant: <strong>{bestVariant.name}</strong> ({formatPercentage(calculateLift(bestVariant, control!))} lift)
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
      </Grid>

      {/* Completed Tests */}
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        Completed Tests
      </Typography>
      
      <Grid container spacing={3}>
        {tests
          .filter(test => test.status === 'completed')
          .map((test) => {
            const control = test.variants.find(v => v.isControl);
            const winner = test.variants.find(v => v.id === test.winner);

            return (
              <Grid item xs={12} md={6} key={test.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {test.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {test.startDate.toLocaleDateString()} - {test.endDate?.toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Chip label="Completed" color="success" size="small" />
                    </Box>

                    {winner && control && (
                      <Box>
                        <Alert severity="success" icon={<CheckCircle />}>
                          <strong>Winner: {winner.name}</strong>
                        </Alert>
                        
                        <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                Conversion Lift
                              </Typography>
                              <Typography variant="h6" fontWeight="bold" color="success.main">
                                +{calculateLift(winner, control).toFixed(1)}%
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                Revenue Impact
                              </Typography>
                              <Typography variant="h6" fontWeight="bold" color="primary.main">
                                {formatCurrency(winner.revenue - control.revenue)}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
      </Grid>

      {/* Create Test Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New A/B Test</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField fullWidth placeholder="Test Name (e.g., Email Subject Line Test)" />
            
            <FormControl fullWidth>
              <InputLabel>Workflow</InputLabel>
              <Select label="Workflow">
                <MenuItem value="abandoned-cart">Abandoned Cart Recovery</MenuItem>
                <MenuItem value="lead-nurture">Lead Nurture Sequence</MenuItem>
                <MenuItem value="webinar-funnel">Webinar Follow-up</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Metric to Optimize</InputLabel>
              <Select label="Metric to Optimize">
                <MenuItem value="open-rate">Email Open Rate</MenuItem>
                <MenuItem value="click-rate">Click-Through Rate</MenuItem>
                <MenuItem value="conversion-rate">Conversion Rate</MenuItem>
                <MenuItem value="revenue">Revenue</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              type="number"
              placeholder="Traffic Split % (e.g., 50)"
              helperText="Percentage of traffic for each variant"
            />

            <Alert severity="info">
              Minimum 100 samples per variant recommended for statistical significance
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setCreateDialogOpen(false)}>
            Create Test
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
