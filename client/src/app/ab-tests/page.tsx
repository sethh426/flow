'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
} from '@mui/material';
import Grid2 from '@/components/Grid2';
import {
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  Science as ScienceIcon,
} from '@mui/icons-material';
import { useToast } from '@/hooks/use-toast';

interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'completed' | 'paused';
  campaignId?: string;
  variantA: {
    name: string;
    description: string;
    traffic: number;
  };
  variantB: {
    name: string;
    description: string;
    traffic: number;
  };
  metrics: {
    variantA: {
      impressions: number;
      clicks: number;
      conversions: number;
      revenue: number;
    };
    variantB: {
      impressions: number;
      clicks: number;
      conversions: number;
      revenue: number;
    };
  };
  statistics?: {
    conversionRateA: number;
    conversionRateB: number;
    confidenceLevel: number;
    winner?: 'A' | 'B' | 'inconclusive';
  };
  createdAt: string;
}

export default function ABTestingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTest, setNewTest] = useState({
    name: '',
    description: '',
    variantAName: 'Variant A',
    variantADesc: '',
    variantBName: 'Variant B',
    variantBDesc: '',
    trafficSplit: 50,
  });

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ab-tests');
      if (!response.ok) throw new Error('Failed to fetch tests');
      
      const data = await response.json();
      setTests(data.tests || []);
    } catch (error: any) {
      console.error('Error loading tests:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load A/B tests',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTest = async () => {
    try {
      const response = await fetch('/api/ab-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTest.name,
          description: newTest.description,
          variantA: {
            name: newTest.variantAName,
            description: newTest.variantADesc,
            traffic: newTest.trafficSplit,
          },
          variantB: {
            name: newTest.variantBName,
            description: newTest.variantBDesc,
            traffic: 100 - newTest.trafficSplit,
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to create test');

      toast({
        title: 'Test Created!',
        description: 'A/B test has been created successfully',
      });

      setCreateDialogOpen(false);
      setNewTest({
        name: '',
        description: '',
        variantAName: 'Variant A',
        variantADesc: '',
        variantBName: 'Variant B',
        variantBDesc: '',
        trafficSplit: 50,
      });
      loadTests();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create test',
      });
    }
  };

  const handleUpdateStatus = async (testId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/ab-tests/${testId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update test');

      toast({
        title: 'Status Updated',
        description: `Test is now ${newStatus}`,
      });

      loadTests();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update test status',
      });
    }
  };

  const handleDelete = async (testId: string) => {
    if (!confirm('Are you sure you want to delete this test?')) return;

    try {
      const response = await fetch(`/api/ab-tests/${testId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete test');

      toast({
        title: 'Test Deleted',
        description: 'A/B test has been removed',
      });

      loadTests();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete test',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'success';
      case 'completed': return 'primary';
      case 'paused': return 'warning';
      default: return 'default';
    }
  };

  const getWinnerColor = (winner?: string) => {
    if (winner === 'A') return '#4caf50';
    if (winner === 'B') return '#2196f3';
    return '#9e9e9e';
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              A/B Testing
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Run experiments and optimize your campaigns with statistical confidence
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              px: 3,
            }}
          >
            Create Test
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Chip label={`Total Tests: ${tests.length}`} color="primary" variant="outlined" />
          <Chip label={`Running: ${tests.filter(t => t.status === 'running').length}`} color="success" variant="outlined" />
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Tests Grid */}
      {tests.length === 0 && !loading ? (
        <Card sx={{ p: 8, textAlign: 'center' }}>
          <ScienceIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No A/B tests yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your first test to start optimizing your campaigns
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Test
          </Button>
        </Card>
      ) : (
        <Grid2 container spacing={3}>
          {tests.map((test) => (
            <Grid2 size={{ xs: 12 }} key={test.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {test.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {test.description}
                      </Typography>
                      <Chip label={test.status} color={getStatusColor(test.status) as any} size="small" />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {test.status === 'draft' && (
                        <Tooltip title="Start Test">
                          <IconButton onClick={() => handleUpdateStatus(test.id, 'running')} color="success">
                            <PlayIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {test.status === 'running' && (
                        <Tooltip title="Pause Test">
                          <IconButton onClick={() => handleUpdateStatus(test.id, 'paused')} color="warning">
                            <PauseIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {test.status === 'paused' && (
                        <Tooltip title="Resume Test">
                          <IconButton onClick={() => handleUpdateStatus(test.id, 'running')} color="success">
                            <PlayIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {(test.status === 'running' || test.status === 'paused') && (
                        <Tooltip title="Complete Test">
                          <IconButton onClick={() => handleUpdateStatus(test.id, 'completed')} color="primary">
                            <StopIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete Test">
                        <IconButton onClick={() => handleDelete(test.id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Variants Comparison */}
                  <Grid2 container spacing={2}>
                    {/* Variant A */}
                    <Grid2 size={{ xs: 12, md: 6 }}>
                      <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                            {test.variantA.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {test.variantA.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                            Traffic: {test.variantA.traffic}%
                          </Typography>
                          <Box sx={{ mt: 2, p: 1.5, bgcolor: 'white', borderRadius: 1 }}>
                            <Typography variant="caption" display="block">
                              Impressions: {test.metrics.variantA.impressions.toLocaleString()}
                            </Typography>
                            <Typography variant="caption" display="block">
                              Clicks: {test.metrics.variantA.clicks.toLocaleString()}
                            </Typography>
                            <Typography variant="caption" display="block">
                              Conversions: {test.metrics.variantA.conversions.toLocaleString()}
                            </Typography>
                            <Typography variant="caption" display="block">
                              Revenue: ${test.metrics.variantA.revenue.toFixed(2)}
                            </Typography>
                            {test.statistics && (
                              <Typography variant="caption" display="block" sx={{ mt: 1, fontWeight: 600 }}>
                                Conversion Rate: {test.statistics.conversionRateA.toFixed(2)}%
                              </Typography>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid2>

                    {/* Variant B */}
                    <Grid2 size={{ xs: 12, md: 6 }}>
                      <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                            {test.variantB.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {test.variantB.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                            Traffic: {test.variantB.traffic}%
                          </Typography>
                          <Box sx={{ mt: 2, p: 1.5, bgcolor: 'white', borderRadius: 1 }}>
                            <Typography variant="caption" display="block">
                              Impressions: {test.metrics.variantB.impressions.toLocaleString()}
                            </Typography>
                            <Typography variant="caption" display="block">
                              Clicks: {test.metrics.variantB.clicks.toLocaleString()}
                            </Typography>
                            <Typography variant="caption" display="block">
                              Conversions: {test.metrics.variantB.conversions.toLocaleString()}
                            </Typography>
                            <Typography variant="caption" display="block">
                              Revenue: ${test.metrics.variantB.revenue.toFixed(2)}
                            </Typography>
                            {test.statistics && (
                              <Typography variant="caption" display="block" sx={{ mt: 1, fontWeight: 600 }}>
                                Conversion Rate: {test.statistics.conversionRateB.toFixed(2)}%
                              </Typography>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid2>
                  </Grid2>

                  {/* Statistical Results */}
                  {test.statistics && test.statistics.confidenceLevel > 0 && (
                    <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Statistical Analysis
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 3 }}>
                        <Typography variant="body2">
                          Confidence Level: <strong>{test.statistics.confidenceLevel}%</strong>
                        </Typography>
                        <Typography variant="body2" sx={{ color: getWinnerColor(test.statistics.winner) }}>
                          Winner: <strong>
                            {test.statistics.winner === 'A' ? test.variantA.name :
                             test.statistics.winner === 'B' ? test.variantB.name :
                             'Inconclusive'}
                          </strong>
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid2>
          ))}
        </Grid2>
      )}

      {/* Create Test Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New A/B Test</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Test Name"
              fullWidth
              value={newTest.name}
              onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
              placeholder="e.g., Homepage Button Color Test"
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={newTest.description}
              onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
              placeholder="Describe what you're testing..."
            />
            
            <Typography variant="subtitle2" sx={{ mt: 2 }}>Variant A</Typography>
            <TextField
              label="Variant A Name"
              fullWidth
              value={newTest.variantAName}
              onChange={(e) => setNewTest({ ...newTest, variantAName: e.target.value })}
            />
            <TextField
              label="Variant A Description"
              fullWidth
              value={newTest.variantADesc}
              onChange={(e) => setNewTest({ ...newTest, variantADesc: e.target.value })}
            />

            <Typography variant="subtitle2" sx={{ mt: 2 }}>Variant B</Typography>
            <TextField
              label="Variant B Name"
              fullWidth
              value={newTest.variantBName}
              onChange={(e) => setNewTest({ ...newTest, variantBName: e.target.value })}
            />
            <TextField
              label="Variant B Description"
              fullWidth
              value={newTest.variantBDesc}
              onChange={(e) => setNewTest({ ...newTest, variantBDesc: e.target.value })}
            />

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Traffic Split: {newTest.trafficSplit}% / {100 - newTest.trafficSplit}%
              </Typography>
              <input
                type="range"
                min="10"
                max="90"
                value={newTest.trafficSplit}
                onChange={(e) => setNewTest({ ...newTest, trafficSplit: parseInt(e.target.value) })}
                style={{ width: '100%' }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateTest}
            variant="contained"
            disabled={!newTest.name || !newTest.variantAName || !newTest.variantBName}
          >
            Create Test
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
