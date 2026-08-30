'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Collapse,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SearchIcon from '@mui/icons-material/Search';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { TrendingProductSuggestion } from '@/ai/schemas';
import { fetcher } from '@/lib/fetcher';
import { useToast } from '@/components/ToastProvider';

export default function TrendFinder() {
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trends, setTrends] = useState<TrendingProductSuggestion[]>([]);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const toast = useToast();

  const handleSearch = async () => {
    if (!category.trim()) {
      toast.warning('Please enter a category to search');
      return;
    }

    const loadingId = toast.loading(`Searching for trending ${category}...`);
    setLoading(true);
    setError('');
    setTrends([]);

    try {
      const result = await fetcher.post('/api/find-trends', 
        { category: category.trim() },
        {
          retry: 3,
          retryDelay: 2000,
          timeout: 45000, // Longer timeout for AI processing
        }
      );

      toast.dismiss(loadingId);
      setTrends(result.suggestions || []);
      
      if (!result.suggestions || result.suggestions.length === 0) {
        toast.info('No trends found. Try a different category!');
        setError('No trends found for this category. Try a different search term.');
      } else {
        toast.success(`Found ${result.suggestions.length} trending products!`);
      }
    } catch (err: any) {
      console.error('Trend search error:', err);
      toast.dismiss(loadingId);
      toast.error('Failed to find trends', 'Check your connection and try again');
      setError(err.message || 'Failed to find trends. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCards(newExpanded);
  };

  const handleFeedback = async (trend: TrendingProductSuggestion, liked: boolean) => {
    try {
      await fetcher.post('/api/feedback', {
        category,
        suggestion: trend.name,
        liked,
        timestamp: new Date().toISOString(),
      });
      
      toast.success(liked ? 'Thanks for your feedback! 👍' : 'Feedback saved 👎');
    } catch (err) {
      console.error('Feedback error:', err);
      // Silent fail - don't annoy user with toast for feedback errors
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TrendingUpIcon sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="h4" fontWeight={700}>
            Trend Finder
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Discover trending products, services, and content ideas powered by AI market research
        </Typography>
      </Paper>

      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Category or Industry (e.g., home fitness, skincare, sustainable fashion)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          disabled={loading}
          sx={{ mb: 2 }}
          helperText="Enter a category to discover trending products and ideas"
          inputProps={{ 'aria-label': 'Category or Industry' }}
        />
        <Button
          variant="contained"
          size="large"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
          onClick={handleSearch}
          disabled={loading}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5568d3 0%, #6a3e8a 100%)',
            },
          }}
        >
          {loading ? 'Searching Trends...' : 'Find Trends'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {trends.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
            Found {trends.length} Trending Ideas
          </Typography>
          <Grid container spacing={3}>
            {trends.map((trend, index) => (
              <Grid item xs={12} key={index}>
                <Card elevation={2}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                        {trend.name}
                      </Typography>
                      <IconButton
                        onClick={() => toggleExpanded(index)}
                        sx={{
                          transform: expandedCards.has(index) ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s',
                        }}
                      >
                        <ExpandMoreIcon />
                      </IconButton>
                    </Box>

                    <Typography variant="body1" color="text.secondary" paragraph>
                      {trend.description}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={trend.targetAudience}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                        color="primary"
                        variant="outlined"
                      />
                      {trend.seoKeywords.map((keyword, i) => (
                        <Chip
                          key={i}
                          label={keyword}
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>

                    <Collapse in={expandedCards.has(index)}>
                      <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                          Why It's Trending:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {trend.reasoning}
                        </Typography>
                      </Box>
                    </Collapse>
                  </CardContent>

                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <Button
                      size="small"
                      startIcon={<ThumbUpIcon />}
                      onClick={() => handleFeedback(trend, true)}
                      sx={{ color: 'success.main' }}
                    >
                      Helpful
                    </Button>
                    <Button
                      size="small"
                      startIcon={<ThumbDownIcon />}
                      onClick={() => handleFeedback(trend, false)}
                      sx={{ color: 'error.main' }}
                    >
                      Not Helpful
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      sx={{ ml: 'auto' }}
                      onClick={() => {
                        // Navigate to Content Studio with this trend
                        window.location.hash = 'content-studio';
                      }}
                    >
                      Create Content
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}
