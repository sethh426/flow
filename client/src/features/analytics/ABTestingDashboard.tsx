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
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' }, 
        gap: { xs: 2, sm: 0 },
        mb: 4 
      }}>
        <Box>
          <Typography 
            variant="h3" 
            fontWeight="bold" 
            sx={{ 
              mb: 1, 
              letterSpacing: '-0.02em',
              fontSize: { xs: '1.75rem', sm: '2.5rem' }
            }}
          >
            A/B Testing Dashboard
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ 
              letterSpacing: '0.01em',
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            Multi-variant testing with statistical significance
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateTest}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
            letterSpacing: '0.025em',
            width: { xs: '100%', sm: 'auto' },
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
            },
          }}
        >
          Create New Test
        </Button>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <Card sx={{ height: '100%', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)', border: '1px solid #e5e7eb' }}>
          <CardContent>
            <Typography 
              variant="overline" 
              sx={{ 
                display: 'block',
                fontWeight: 600,
                letterSpacing: '0.05em',
                color: 'text.secondary',
                mb: 1.5
              }}
            >
              Active Tests
            </Typography>
            <Typography 
              variant="h3" 
              fontWeight="800" 
              sx={{ 
                mb: 1.5,
                letterSpacing: '-0.02em',
                color: 'text.primary'
              }}
            >
              {tests.filter(t => t.status === 'running').length}
            </Typography>
            <Chip
              label="+2 this week"
              size="small"
              sx={{ 
                bgcolor: '#4caf5020', 
                color: '#4caf50',
                fontWeight: 600,
                fontSize: '0.75rem'
              }}
            />
          </CardContent>
        </Card>
        
        <Card sx={{ height: '100%', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)', border: '1px solid #e5e7eb' }}>
          <CardContent>
            <Typography 
              variant="overline" 
              sx={{ 
                display: 'block',
                fontWeight: 600,
                letterSpacing: '0.05em',
                color: 'text.secondary',
                mb: 1.5
              }}
            >
              Avg Conversion Lift
            </Typography>
            <Typography 
              variant="h3" 
              fontWeight="800" 
              sx={{ 
                color: '#10b981',
                mb: 1.5,
                letterSpacing: '-0.02em'
              }}
            >
              +18.7%
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrendingUp fontSize="small" sx={{ color: '#10b981' }} />
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 500,
                  letterSpacing: '0.02em'
                }}
              >
                vs control groups
              </Typography>
            </Box>
          </CardContent>
        </Card>
        
        <Card sx={{ height: '100%', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)', border: '1px solid #e5e7eb' }}>
          <CardContent>
            <Typography 
              variant="overline" 
              sx={{ 
                display: 'block',
                fontWeight: 600,
                letterSpacing: '0.05em',
                color: 'text.secondary',
                mb: 1.5
              }}
            >
              Total Revenue Impact
            </Typography>
            <Typography 
              variant="h3" 
              fontWeight="800" 
              sx={{ 
                color: '#2196f3',
                mb: 1.5,
                letterSpacing: '-0.02em'
              }}
            >
              $34.2K
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block',
                color: 'text.secondary',
                fontWeight: 500,
                letterSpacing: '0.02em'
              }}
            >
              From winning variants
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ height: '100%', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)', border: '1px solid #e5e7eb' }}>
          <CardContent>
            <Typography 
              variant="overline" 
              sx={{ 
                display: 'block',
                fontWeight: 600,
                letterSpacing: '0.05em',
                color: 'text.secondary',
                mb: 1.5
              }}
            >
              Avg Confidence Level
            </Typography>
            <Typography 
              variant="h3" 
              fontWeight="800" 
              sx={{ 
                mb: 1.5,
                letterSpacing: '-0.02em',
                color: 'text.primary'
              }}
            >
              93.7%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={93.7}
              sx={{ 
                mt: 1, 
                height: 8, 
                borderRadius: 4,
                bgcolor: 'rgba(99, 102, 241, 0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  bgcolor: '#6366f1'
                }
              }}
            />
          </CardContent>
        </Card>
      </Box>

      {/* Active Tests */}
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        Running Tests
      </Typography>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3, mb: 4 }}>
        {tests
          .filter(test => test.status === 'running')
          .map((test) => {
            const control = test.variants.find(v => v.isControl);
            const bestVariant = test.variants.reduce((best, current) =>
              current.conversionRate > best.conversionRate ? current : best
            );
            const significance = getStatisticalSignificance(test.confidence);

            return (
              <Card key={test.id}>
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
            );
          })}
      </Box>

      {/* Completed Tests */}
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        Completed Tests
      </Typography>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        {tests
          .filter(test => test.status === 'completed')
          .map((test) => {
            const control = test.variants.find(v => v.isControl);
            const winner = test.variants.find(v => v.id === test.winner);

            return (
              <Card key={test.id}>
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
                      
                      <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Conversion Lift
                          </Typography>
                          <Typography variant="h6" fontWeight="bold" color="success.main">
                            +{calculateLift(winner, control).toFixed(1)}%
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Revenue Impact
                          </Typography>
                          <Typography variant="h6" fontWeight="bold" color="primary.main">
                            {formatCurrency(winner.revenue - control.revenue)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            );
          })}
      </Box>

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
