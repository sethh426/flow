'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Slider,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Badge,
  Paper,
} from '@mui/material';
import {
  Add,
  PlayArrow,
  Pause,
  Stop,
  Delete,
  Edit,
  EmojiEvents,
  Science,
  TrendingUp,
  TrendingDown,
  People,
  CalendarToday,
  Speed,
  Assessment,
  CheckCircle,
  Warning,
  Info,
  Close,
  ContentCopy,
  Refresh,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'completed' | 'paused';
  variantA: Variant;
  variantB: Variant;
  targetAudience: {
    trafficSplit: number; // Percentage for B variant
    totalUsers?: number;
  };
  metrics: {
    variantA: Metrics;
    variantB: Metrics;
  };
  statistics?: Statistics;
  duration: number; // days
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
}

interface Variant {
  name: string;
  description: string;
  imageUrl?: string;
  ctaText?: string;
  ctaColor?: string;
}

interface Metrics {
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  conversionRate: number;
}

interface Statistics {
  confidenceLevel: number;
  pValue: number;
  winner?: 'A' | 'B' | 'inconclusive';
  sampleSize: number;
  uplift: number;
}

const SAMPLE_TESTS: ABTest[] = [
  {
    id: '1',
    name: 'Product Page CTA Color Test',
    description: 'Testing blue vs green call-to-action button',
    status: 'running',
    variantA: {
      name: 'Control (Blue Button)',
      description: 'Original blue CTA button',
      ctaText: 'Buy Now',
      ctaColor: '#0088FE',
    },
    variantB: {
      name: 'Variant (Green Button)',
      description: 'New green CTA button',
      ctaText: 'Buy Now',
      ctaColor: '#00C49F',
    },
    targetAudience: {
      trafficSplit: 50,
      totalUsers: 10000,
    },
    metrics: {
      variantA: {
        impressions: 5234,
        clicks: 628,
        conversions: 125,
        revenue: 12450,
        ctr: 12.0,
        conversionRate: 19.9,
      },
      variantB: {
        impressions: 5198,
        clicks: 702,
        conversions: 154,
        revenue: 15380,
        ctr: 13.5,
        conversionRate: 21.9,
      },
    },
    statistics: {
      confidenceLevel: 95.2,
      pValue: 0.048,
      winner: 'B',
      sampleSize: 10432,
      uplift: 23.5,
    },
    duration: 14,
    startDate: new Date('2025-09-27'),
    endDate: new Date('2025-10-11'),
    createdAt: new Date('2025-09-20'),
  },
  {
    id: '2',
    name: 'Headline Copy Test',
    description: 'Testing different headline variations',
    status: 'completed',
    variantA: {
      name: 'Original Headline',
      description: 'Save 20% Today',
    },
    variantB: {
      name: 'New Headline',
      description: 'Limited Time: 20% Off',
    },
    targetAudience: {
      trafficSplit: 50,
      totalUsers: 8000,
    },
    metrics: {
      variantA: {
        impressions: 4123,
        clicks: 453,
        conversions: 89,
        revenue: 8900,
        ctr: 11.0,
        conversionRate: 19.6,
      },
      variantB: {
        impressions: 4089,
        clicks: 522,
        conversions: 118,
        revenue: 11800,
        ctr: 12.8,
        conversionRate: 22.6,
      },
    },
    statistics: {
      confidenceLevel: 98.5,
      pValue: 0.015,
      winner: 'B',
      sampleSize: 8212,
      uplift: 32.6,
    },
    duration: 7,
    startDate: new Date('2025-09-13'),
    endDate: new Date('2025-09-20'),
    createdAt: new Date('2025-09-10'),
  },
];

const WIZARD_STEPS = ['Test Details', 'Variants', 'Audience', 'Review'];

export default function ABTestingPremium() {
  // State
  const [tests, setTests] = useState<ABTest[]>(SAMPLE_TESTS);
  const [loading, setLoading] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [resultsDialogOpen, setResultsDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  // Wizard form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 14,
    variantA: {
      name: 'Control (A)',
      description: '',
      ctaText: '',
      ctaColor: '#0088FE',
    },
    variantB: {
      name: 'Variant (B)',
      description: '',
      ctaText: '',
      ctaColor: '#00C49F',
    },
    trafficSplit: 50,
  });

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Wizard navigation
  const handleNext = () => {
    if (activeStep === WIZARD_STEPS.length - 1) {
      createTest();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const resetWizard = () => {
    setActiveStep(0);
    setFormData({
      name: '',
      description: '',
      duration: 14,
      variantA: {
        name: 'Control (A)',
        description: '',
        ctaText: '',
        ctaColor: '#0088FE',
      },
      variantB: {
        name: 'Variant (B)',
        description: '',
        ctaText: '',
        ctaColor: '#00C49F',
      },
      trafficSplit: 50,
    });
  };

  // CRUD operations
  const createTest = () => {
    const newTest: ABTest = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      status: 'draft',
      variantA: formData.variantA,
      variantB: formData.variantB,
      targetAudience: {
        trafficSplit: formData.trafficSplit,
      },
      metrics: {
        variantA: {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          revenue: 0,
          ctr: 0,
          conversionRate: 0,
        },
        variantB: {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          revenue: 0,
          ctr: 0,
          conversionRate: 0,
        },
      },
      duration: formData.duration,
      createdAt: new Date(),
    };

    setTests([newTest, ...tests]);
    setWizardOpen(false);
    resetWizard();
    showSnackbar('A/B test created successfully!');
  };

  const startTest = (testId: string) => {
    setTests(tests.map(t => 
      t.id === testId 
        ? { ...t, status: 'running', startDate: new Date() }
        : t
    ));
    showSnackbar('Test started!');
  };

  const pauseTest = (testId: string) => {
    setTests(tests.map(t => 
      t.id === testId 
        ? { ...t, status: 'paused' }
        : t
    ));
    showSnackbar('Test paused');
  };

  const stopTest = (testId: string) => {
    setTests(tests.map(t => 
      t.id === testId 
        ? { ...t, status: 'completed', endDate: new Date() }
        : t
    ));
    showSnackbar('Test completed!');
  };

  const deleteTest = () => {
    if (selectedTest) {
      setTests(tests.filter(t => t.id !== selectedTest.id));
      setDeleteDialogOpen(false);
      setSelectedTest(null);
      showSnackbar('Test deleted');
    }
  };

  const duplicateTest = (test: ABTest) => {
    const duplicate = {
      ...test,
      id: Date.now().toString(),
      name: `${test.name} (Copy)`,
      status: 'draft' as const,
      createdAt: new Date(),
    };
    setTests([duplicate, ...tests]);
    showSnackbar('Test duplicated');
  };

  // Calculate sample size
  const calculateSampleSize = () => {
    // Simplified calculation
    const baselineConversionRate = 0.05; // 5%
    const minimumDetectableEffect = 0.20; // 20% improvement
    const sampleSize = Math.ceil((16 * baselineConversionRate * (1 - baselineConversionRate)) / Math.pow(baselineConversionRate * minimumDetectableEffect, 2));
    return sampleSize;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'success';
      case 'completed': return 'primary';
      case 'paused': return 'warning';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  const getWinnerIcon = (winner?: 'A' | 'B' | 'inconclusive') => {
    if (winner === 'A' || winner === 'B') return <EmojiEvents sx={{ color: '#FFD700' }} />;
    if (winner === 'inconclusive') return <Warning color="warning" />;
    return null;
  };

  // Render wizard steps
  const renderWizardStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Test Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Product Page CTA Test"
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what you're testing and why"
            />
            <Box>
              <Typography variant="body2" gutterBottom>
                Test Duration: {formData.duration} days
              </Typography>
              <Slider
                value={formData.duration}
                onChange={(e, value) => setFormData({ ...formData, duration: value as number })}
                min={1}
                max={30}
                marks
                valueLabelDisplay="auto"
              />
            </Box>
          </Box>
        );
      
      case 1:
        return (
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, border: '2px solid', borderColor: 'primary.main' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Variant A (Control)
                  </Typography>
                  <TextField
                    fullWidth
                    label="Name"
                    value={formData.variantA.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      variantA: { ...formData.variantA, name: e.target.value }
                    })}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Description"
                    value={formData.variantA.description}
                    onChange={(e) => setFormData({
                      ...formData,
                      variantA: { ...formData.variantA, description: e.target.value }
                    })}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="CTA Text"
                    value={formData.variantA.ctaText}
                    onChange={(e) => setFormData({
                      ...formData,
                      variantA: { ...formData.variantA, ctaText: e.target.value }
                    })}
                    sx={{ mb: 2 }}
                  />
                  <Box>
                    <Typography variant="caption" display="block" gutterBottom>
                      CTA Color
                    </Typography>
                    <TextField
                      type="color"
                      value={formData.variantA.ctaColor}
                      onChange={(e) => setFormData({
                        ...formData,
                        variantA: { ...formData.variantA, ctaColor: e.target.value }
                      })}
                      fullWidth
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, border: '2px solid', borderColor: 'success.main' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Variant B (Test)
                  </Typography>
                  <TextField
                    fullWidth
                    label="Name"
                    value={formData.variantB.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      variantB: { ...formData.variantB, name: e.target.value }
                    })}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Description"
                    value={formData.variantB.description}
                    onChange={(e) => setFormData({
                      ...formData,
                      variantB: { ...formData.variantB, description: e.target.value }
                    })}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="CTA Text"
                    value={formData.variantB.ctaText}
                    onChange={(e) => setFormData({
                      ...formData,
                      variantB: { ...formData.variantB, ctaText: e.target.value }
                    })}
                    sx={{ mb: 2 }}
                  />
                  <Box>
                    <Typography variant="caption" display="block" gutterBottom>
                      CTA Color
                    </Typography>
                    <TextField
                      type="color"
                      value={formData.variantB.ctaColor}
                      onChange={(e) => setFormData({
                        ...formData,
                        variantB: { ...formData.variantB, ctaColor: e.target.value }
                      })}
                      fullWidth
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );
      
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Card sx={{ p: 3, mb: 3, bgcolor: 'info.50', borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Sample Size Calculator
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Based on a 5% baseline conversion rate and 20% minimum detectable effect:
              </Typography>
              <Typography variant="h4" fontWeight={700} color="primary.main">
                {calculateSampleSize().toLocaleString()} visitors per variant
              </Typography>
            </Card>

            <Typography variant="body2" gutterBottom fontWeight={600}>
              Traffic Split: {formData.trafficSplit}% to Variant B
            </Typography>
            <Slider
              value={formData.trafficSplit}
              onChange={(e, value) => setFormData({ ...formData, trafficSplit: value as number })}
              min={0}
              max={100}
              marks={[
                { value: 0, label: '0%' },
                { value: 50, label: '50%' },
                { value: 100, label: '100%' },
              ]}
              valueLabelDisplay="auto"
            />
            
            <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                Traffic Distribution:
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Box sx={{ flex: 1, textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight={700} color="primary.main">
                    {100 - formData.trafficSplit}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Variant A (Control)
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box sx={{ flex: 1, textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight={700} color="success.main">
                    {formData.trafficSplit}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Variant B (Test)
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        );
      
      case 3:
        return (
          <Box sx={{ mt: 2 }}>
            <Card sx={{ p: 3, mb: 2 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                {formData.name || 'Unnamed Test'}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {formData.description || 'No description'}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Duration
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {formData.duration} days
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Traffic Split
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {100 - formData.trafficSplit}% / {formData.trafficSplit}%
                  </Typography>
                </Grid>
              </Grid>
            </Card>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card sx={{ p: 2, bgcolor: 'primary.50' }}>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                    Variant A
                  </Typography>
                  <Typography variant="body2">{formData.variantA.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formData.variantA.description}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card sx={{ p: 2, bgcolor: 'success.50' }}>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                    Variant B
                  </Typography>
                  <Typography variant="body2">{formData.variantB.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formData.variantB.description}
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );
      
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            A/B Testing
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create and manage split tests for your campaigns
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setWizardOpen(true)}
          size="large"
        >
          Create New Test
        </Button>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Tests Grid */}
      <Grid container spacing={3}>
        {tests.map((test) => (
          <Grid item xs={12} md={6} lg={4} key={test.id}>
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {test.name}
                    </Typography>
                    <Chip
                      label={test.status}
                      size="small"
                      color={getStatusColor(test.status) as any}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </Box>
                  {getWinnerIcon(test.statistics?.winner)}
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {test.description}
                </Typography>

                {test.status !== 'draft' && test.statistics && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Confidence Level
                      </Typography>
                      <Typography variant="caption" fontWeight={700}>
                        {test.statistics.confidenceLevel.toFixed(1)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={test.statistics.confidenceLevel}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                )}

                {test.statistics?.winner && (
                  <Card sx={{ p: 2, mb: 2, bgcolor: test.statistics.winner === 'B' ? 'success.50' : 'primary.50' }}>
                    <Typography variant="body2" fontWeight={700} gutterBottom>
                      {test.statistics.winner === 'inconclusive' 
                        ? 'Inconclusive Results' 
                        : `Winner: Variant ${test.statistics.winner}`}
                    </Typography>
                    {test.statistics.winner !== 'inconclusive' && (
                      <Typography variant="caption" color="text.secondary">
                        +{test.statistics.uplift.toFixed(1)}% improvement
                      </Typography>
                    )}
                  </Card>
                )}

                <Grid container spacing={1} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Variant A Conv.
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {test.metrics.variantA.conversionRate.toFixed(1)}%
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Variant B Conv.
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {test.metrics.variantB.conversionRate.toFixed(1)}%
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {test.status === 'draft' && (
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<PlayArrow />}
                      onClick={() => startTest(test.id)}
                    >
                      Start
                    </Button>
                  )}
                  {test.status === 'running' && (
                    <>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Pause />}
                        onClick={() => pauseTest(test.id)}
                      >
                        Pause
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<Stop />}
                        onClick={() => stopTest(test.id)}
                      >
                        Stop
                      </Button>
                    </>
                  )}
                  {test.status === 'paused' && (
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<PlayArrow />}
                      onClick={() => startTest(test.id)}
                    >
                      Resume
                    </Button>
                  )}
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Assessment />}
                    onClick={() => {
                      setSelectedTest(test);
                      setResultsDialogOpen(true);
                    }}
                  >
                    Results
                  </Button>
                  <IconButton
                    size="small"
                    onClick={() => duplicateTest(test)}
                  >
                    <ContentCopy fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedTest(test);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create Test Wizard */}
      <Dialog
        open={wizardOpen}
        onClose={() => {
          setWizardOpen(false);
          resetWizard();
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Create A/B Test
          <IconButton
            onClick={() => {
              setWizardOpen(false);
              resetWizard();
            }}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ mb: 3, mt: 2 }}>
            {WIZARD_STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderWizardStep()}
        </DialogContent>
        <DialogActions>
          <Button disabled={activeStep === 0} onClick={handleBack}>
            Back
          </Button>
          <Button variant="contained" onClick={handleNext}>
            {activeStep === WIZARD_STEPS.length - 1 ? 'Create Test' : 'Next'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Results Dialog */}
      <Dialog
        open={resultsDialogOpen}
        onClose={() => setResultsDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Test Results: {selectedTest?.name}
          <IconButton
            onClick={() => setResultsDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedTest && (
            <Box sx={{ mt: 2 }}>
              {/* Statistical Significance */}
              {selectedTest.statistics && (
                <Card sx={{ p: 3, mb: 3, bgcolor: 'primary.50', borderRadius: 3 }}>
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          Confidence Level
                        </Typography>
                        <Typography variant="h3" fontWeight={700} color="primary.main">
                          {selectedTest.statistics.confidenceLevel.toFixed(1)}%
                        </Typography>
                        {selectedTest.statistics.confidenceLevel >= 95 ? (
                          <Chip label="Statistically Significant" color="success" size="small" sx={{ mt: 1 }} />
                        ) : (
                          <Chip label="Not Significant" color="warning" size="small" sx={{ mt: 1 }} />
                        )}
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          P-Value
                        </Typography>
                        <Typography variant="h3" fontWeight={700}>
                          {selectedTest.statistics.pValue.toFixed(3)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          Sample Size
                        </Typography>
                        <Typography variant="h3" fontWeight={700}>
                          {selectedTest.statistics.sampleSize.toLocaleString()}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Card>
              )}

              {/* Comparison Table */}
              <TableContainer component={Paper} sx={{ borderRadius: 3, mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Metric</TableCell>
                      <TableCell align="center">Variant A</TableCell>
                      <TableCell align="center">Variant B</TableCell>
                      <TableCell align="center">Difference</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell fontWeight={600}>Impressions</TableCell>
                      <TableCell align="center">{selectedTest.metrics.variantA.impressions.toLocaleString()}</TableCell>
                      <TableCell align="center">{selectedTest.metrics.variantB.impressions.toLocaleString()}</TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={`${((selectedTest.metrics.variantB.impressions - selectedTest.metrics.variantA.impressions) / selectedTest.metrics.variantA.impressions * 100).toFixed(1)}%`}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell fontWeight={600}>Clicks</TableCell>
                      <TableCell align="center">{selectedTest.metrics.variantA.clicks.toLocaleString()}</TableCell>
                      <TableCell align="center">{selectedTest.metrics.variantB.clicks.toLocaleString()}</TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={`${((selectedTest.metrics.variantB.clicks - selectedTest.metrics.variantA.clicks) / selectedTest.metrics.variantA.clicks * 100).toFixed(1)}%`}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell fontWeight={600}>CTR</TableCell>
                      <TableCell align="center">{selectedTest.metrics.variantA.ctr.toFixed(2)}%</TableCell>
                      <TableCell align="center">{selectedTest.metrics.variantB.ctr.toFixed(2)}%</TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          icon={selectedTest.metrics.variantB.ctr > selectedTest.metrics.variantA.ctr ? <TrendingUp /> : <TrendingDown />}
                          label={`${((selectedTest.metrics.variantB.ctr - selectedTest.metrics.variantA.ctr) / selectedTest.metrics.variantA.ctr * 100).toFixed(1)}%`}
                          color={selectedTest.metrics.variantB.ctr > selectedTest.metrics.variantA.ctr ? 'success' : 'error'}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell fontWeight={600}>Conversions</TableCell>
                      <TableCell align="center">{selectedTest.metrics.variantA.conversions}</TableCell>
                      <TableCell align="center">{selectedTest.metrics.variantB.conversions}</TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          icon={selectedTest.metrics.variantB.conversions > selectedTest.metrics.variantA.conversions ? <TrendingUp /> : <TrendingDown />}
                          label={`${((selectedTest.metrics.variantB.conversions - selectedTest.metrics.variantA.conversions) / selectedTest.metrics.variantA.conversions * 100).toFixed(1)}%`}
                          color={selectedTest.metrics.variantB.conversions > selectedTest.metrics.variantA.conversions ? 'success' : 'error'}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell fontWeight={600}>Conversion Rate</TableCell>
                      <TableCell align="center">{selectedTest.metrics.variantA.conversionRate.toFixed(2)}%</TableCell>
                      <TableCell align="center">{selectedTest.metrics.variantB.conversionRate.toFixed(2)}%</TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          icon={selectedTest.metrics.variantB.conversionRate > selectedTest.metrics.variantA.conversionRate ? <TrendingUp /> : <TrendingDown />}
                          label={`${((selectedTest.metrics.variantB.conversionRate - selectedTest.metrics.variantA.conversionRate) / selectedTest.metrics.variantA.conversionRate * 100).toFixed(1)}%`}
                          color={selectedTest.metrics.variantB.conversionRate > selectedTest.metrics.variantA.conversionRate ? 'success' : 'error'}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell fontWeight={600}>Revenue</TableCell>
                      <TableCell align="center">${selectedTest.metrics.variantA.revenue.toLocaleString()}</TableCell>
                      <TableCell align="center">${selectedTest.metrics.variantB.revenue.toLocaleString()}</TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          icon={selectedTest.metrics.variantB.revenue > selectedTest.metrics.variantA.revenue ? <TrendingUp /> : <TrendingDown />}
                          label={`${((selectedTest.metrics.variantB.revenue - selectedTest.metrics.variantA.revenue) / selectedTest.metrics.variantA.revenue * 100).toFixed(1)}%`}
                          color={selectedTest.metrics.variantB.revenue > selectedTest.metrics.variantA.revenue ? 'success' : 'error'}
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Winner Declaration */}
              {selectedTest.statistics?.winner && selectedTest.statistics.winner !== 'inconclusive' && (
                <Card sx={{ p: 3, bgcolor: 'success.50', borderRadius: 3, textAlign: 'center' }}>
                  <EmojiEvents sx={{ fontSize: 48, color: '#FFD700', mb: 2 }} />
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    Variant {selectedTest.statistics.winner} is the Winner!
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {selectedTest.statistics.uplift.toFixed(1)}% improvement with {selectedTest.statistics.confidenceLevel.toFixed(1)}% confidence
                  </Typography>
                </Card>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResultsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Test</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedTest?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={deleteTest}>
            Delete
          </Button>
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
