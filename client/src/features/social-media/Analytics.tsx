"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Skeleton
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface PlatformAnalytics {
  platform: string;
  followers: number;
  followersGrowth: number; // percentage
  engagementRate: number; // percentage
  posts: number;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  impressions: number;
  bestPostingTime: string;
  topHashtags: string[];
  rating: number; // 1-10
}

interface GrowthData {
  date: string;
  followers: number;
  engagement: number;
}

interface ContentPerformance {
  postId: string;
  platform: string;
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  timestamp: number;
}

interface AnalyticsProps {
  connectedPlatforms: string[];
}

export default function Analytics({ connectedPlatforms }: AnalyticsProps) {
  const { user } = useAuth();
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [analytics, setAnalytics] = useState<PlatformAnalytics[]>([]);
  const [growthData, setGrowthData] = useState<GrowthData[]>([]);
  const [topPosts, setTopPosts] = useState<ContentPerformance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPlatform, timeRange]);

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/social-analytics?userId=${user.uid}&platform=${selectedPlatform}&timeRange=${timeRange}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data.analytics || []);
      setGrowthData(data.growthData || []);
      setTopPosts(data.topPosts || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const getTotalFollowers = () => {
    return analytics.reduce((sum, a) => sum + a.followers, 0);
  };

  const getAverageEngagement = () => {
    if (analytics.length === 0) return 0;
    return analytics.reduce((sum, a) => sum + a.engagementRate, 0) / analytics.length;
  };

  const getTotalPosts = () => {
    return analytics.reduce((sum, a) => sum + a.posts, 0);
  };

  const getOverallRating = () => {
    if (analytics.length === 0) return 0;
    return analytics.reduce((sum, a) => sum + a.rating, 0) / analytics.length;
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'success';
    if (rating >= 6) return 'primary';
    if (rating >= 4) return 'warning';
    return 'error';
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 8) return 'Excellent';
    if (rating >= 6) return 'Good';
    if (rating >= 4) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" gutterBottom>
            Analytics Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track your social media growth and performance
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Platform</InputLabel>
            <Select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              label="Platform"
            >
              <MenuItem value="all">All Platforms</MenuItem>
              <MenuItem value="instagram">Instagram</MenuItem>
              <MenuItem value="facebook">Facebook</MenuItem>
              <MenuItem value="twitter">Twitter</MenuItem>
              <MenuItem value="linkedin">LinkedIn</MenuItem>
              <MenuItem value="pinterest">Pinterest</MenuItem>
              <MenuItem value="tiktok">TikTok</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Time Range"
            >
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
            </Select>
          </FormControl>
          <IconButton onClick={fetchAnalytics} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {[1, 2, 3, 4].map((i) => (
              <Grid size={{ xs: 12, md: 3 }} key={i}>
                <Card>
                  <CardContent>
                    <Skeleton variant="text" width="60%" height={40} />
                    <Skeleton variant="text" width="80%" />
                    <Skeleton variant="rectangular" width="100%" height={20} sx={{ mt: 1 }} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Paper sx={{ p: 3 }}>
                <Skeleton variant="text" width="40%" height={30} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" width="100%" height={300} />
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3 }}>
                <Skeleton variant="text" width="60%" height={30} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" width="100%" height={300} />
              </Paper>
            </Grid>
          </Grid>
        </>
      )}

      {/* Overview Stats */}
      {!loading && (
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h4">{getTotalFollowers().toLocaleString()}</Typography>
              <Typography variant="body2" color="text.secondary">Total Followers</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon color="success" fontSize="small" />
                <Typography variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                  +{analytics[0]?.followersGrowth || 0}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h4">{getAverageEngagement().toFixed(1)}%</Typography>
              <Typography variant="body2" color="text.secondary">Avg Engagement Rate</Typography>
              <Box sx={{ mt: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(getAverageEngagement() * 10, 100)} 
                  color="primary"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h4">{getTotalPosts()}</Typography>
              <Typography variant="body2" color="text.secondary">Total Posts</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Last {timeRange}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h4">{getOverallRating().toFixed(1)}</Typography>
                <StarIcon color={getRatingColor(getOverallRating()) as any} />
              </Box>
              <Typography variant="body2" color="text.secondary">Overall Rating</Typography>
              <Chip 
                label={getRatingLabel(getOverallRating())} 
                color={getRatingColor(getOverallRating()) as any}
                size="small"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      )}

      {/* Growth Charts */}
      {!loading && (
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Follower Growth
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="followers" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Engagement Rate
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="engagement" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
      )}

      {/* Platform Breakdown */}
      {!loading && (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Platform Performance
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Platform</TableCell>
                <TableCell align="right">Followers</TableCell>
                <TableCell align="right">Growth</TableCell>
                <TableCell align="right">Engagement</TableCell>
                <TableCell align="right">Posts</TableCell>
                <TableCell align="right">Rating</TableCell>
                <TableCell>Best Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : analytics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary">
                      No analytics data available. Connect your social media accounts to see insights.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                analytics.map((platform) => (
                  <TableRow key={platform.platform}>
                    <TableCell>
                      <Chip 
                        label={platform.platform} 
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {platform.followers.toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        {platform.followersGrowth >= 0 ? (
                          <TrendingUpIcon color="success" fontSize="small" />
                        ) : (
                          <TrendingDownIcon color="error" fontSize="small" />
                        )}
                        <Typography 
                          variant="body2" 
                          color={platform.followersGrowth >= 0 ? 'success.main' : 'error.main'}
                          sx={{ ml: 0.5 }}
                        >
                          {platform.followersGrowth > 0 ? '+' : ''}{platform.followersGrowth}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      {platform.engagementRate.toFixed(2)}%
                    </TableCell>
                    <TableCell align="right">
                      {platform.posts}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                        <Typography variant="body2">{platform.rating.toFixed(1)}</Typography>
                        <StarIcon color={getRatingColor(platform.rating) as any} fontSize="small" />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{platform.bestPostingTime}</Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      )}

      {/* Top Performing Posts */}
      {!loading && (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Top Performing Posts
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Platform</TableCell>
                <TableCell>Caption</TableCell>
                <TableCell align="right">Likes</TableCell>
                <TableCell align="right">Comments</TableCell>
                <TableCell align="right">Engagement</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : topPosts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary">
                      No post data available
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                topPosts.slice(0, 10).map((post, index) => (
                  <TableRow key={post.postId}>
                    <TableCell>
                      <Chip label={post.platform} size="small" sx={{ textTransform: 'capitalize' }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                        {post.caption || 'No caption'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{post.likes.toLocaleString()}</TableCell>
                    <TableCell align="right">{post.comments.toLocaleString()}</TableCell>
                    <TableCell align="right">
                      <Chip 
                        label={`${post.engagementRate.toFixed(2)}%`} 
                        color={post.engagementRate >= 5 ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(post.timestamp).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      )}
    </Box>
  );
}
