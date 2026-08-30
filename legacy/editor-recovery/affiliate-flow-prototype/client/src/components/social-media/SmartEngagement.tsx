"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Switch,
  FormControlLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  List,
  ListItem,
  Skeleton,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Comment as CommentIcon,
  Favorite as LikeIcon,
  PersonAdd as FollowIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Image as ImageIcon,
  SmartToy as AIIcon
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';

interface Post {
  id: string;
  platform: string;
  author: string;
  authorId: string;
  imageUrl?: string;
  caption?: string;
  timestamp: number;
  likes: number;
  comments: number;
  hashtags: string[];
}

interface VisionAnalysis {
  objects: string[];
  labels: string[];
  colors: string[];
  text?: string;
  faces?: number;
}

interface EngagementSettings {
  enabled: boolean;
  autoComment: boolean;
  autoLike: boolean;
  targetHashtags: string[];
  commentFrequency: number; // minutes between comments
  platforms: string[];
  avoidSpam: boolean;
}

interface SmartEngagementProps {
  connectedPlatforms: string[];
}

export default function SmartEngagement({ connectedPlatforms }: SmartEngagementProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [visionAnalysis, setVisionAnalysis] = useState<VisionAnalysis | null>(null);
  const [generatedComment, setGeneratedComment] = useState('');
  const [customComment, setCustomComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<EngagementSettings>({
    enabled: true,
    autoComment: false,
    autoLike: true,
    targetHashtags: ['fashion', 'style', 'ootd'],
    commentFrequency: 5,
    platforms: ['instagram', 'tiktok'],
    avoidSpam: true
  });
  const [engagementHistory, setEngagementHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchTargetPosts();
  }, [settings.targetHashtags, settings.platforms]);

  const fetchTargetPosts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/discover-posts?userId=${user.uid}&hashtags=${settings.targetHashtags.join(',')}&platforms=${settings.platforms.join(',')}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();
      setPosts(data.posts || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const analyzeImage = async (post: Post) => {
    if (!post.imageUrl) {
      setError('No image to analyze');
      return;
    }

    try {
      setAnalyzing(true);
      setSelectedPost(post);

      // Call Vision API to analyze image
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: post.imageUrl,
          platform: post.platform
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const data = await response.json();
      setVisionAnalysis(data.analysis);

      // Generate AI comment based on vision analysis
      await generateSmartComment(post, data.analysis);

    } catch (err) {
      console.error('Error analyzing image:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze image');
    } finally {
      setAnalyzing(false);
    }
  };

  const generateSmartComment = async (post: Post, analysis: VisionAnalysis) => {
    try {
      const response = await fetch('/api/generate-comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.uid,
          post: {
            author: post.author,
            caption: post.caption,
            hashtags: post.hashtags
          },
          visionAnalysis: analysis,
          platform: post.platform,
          avoidGeneric: settings.avoidSpam
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate comment');
      }

      const data = await response.json();
      setGeneratedComment(data.comment);
      setCustomComment(data.comment);

    } catch (err) {
      console.error('Error generating comment:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate comment');
    }
  };

  const postComment = async (postId: string, comment: string, shouldLike: boolean) => {
    if (!user || !comment.trim()) return;

    try {
      setCommenting(true);

      const response = await fetch('/api/post-engagement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          postId,
          platform: selectedPost?.platform,
          comment: comment.trim(),
          like: shouldLike
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to post engagement');
      }

      const data = await response.json();

      // Add to engagement history
      setEngagementHistory(prev => [
        {
          postId,
          platform: selectedPost?.platform,
          author: selectedPost?.author,
          comment,
          liked: shouldLike,
          timestamp: Date.now()
        },
        ...prev
      ]);

      setError(null);
      setSelectedPost(null);
      setGeneratedComment('');
      setCustomComment('');
      setVisionAnalysis(null);

      // Show success message
      alert('Successfully engaged with post!');

    } catch (err) {
      console.error('Error posting engagement:', err);
      setError(err instanceof Error ? err.message : 'Failed to post engagement');
    } finally {
      setCommenting(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" gutterBottom>
            Smart Engagement Engine
          </Typography>
          <Typography variant="body2" color="text.secondary">
            AI-powered commenting with Vision API image analysis
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.enabled}
                onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
              />
            }
            label="Enabled"
          />
          <IconButton onClick={() => setSettingsOpen(true)}>
            <SettingsIcon />
          </IconButton>
          <IconButton onClick={fetchTargetPosts} disabled={loading}>
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
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[1, 2, 3, 4].map((i) => (
              <Grid size={{ xs: 12, md: 3 }} key={i}>
                <Card>
                  <CardContent>
                    <Skeleton variant="text" width="40%" height={40} />
                    <Skeleton variant="text" width="70%" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <Card>
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent>
                    <Skeleton variant="text" width="80%" />
                    <Skeleton variant="text" width="60%" />
                    <Box sx={{ mt: 2 }}>
                      <Skeleton variant="rectangular" width="100%" height={36} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Stats */}
      {!loading && (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h4">{engagementHistory.length}</Typography>
              <Typography variant="body2" color="text.secondary">Total Engagements</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h4">
                {engagementHistory.filter(e => e.liked).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">Likes Given</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h4">{posts.length}</Typography>
              <Typography variant="body2" color="text.secondary">Target Posts</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h4">{settings.targetHashtags.length}</Typography>
              <Typography variant="body2" color="text.secondary">Target Hashtags</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      )}

      {!loading && (
      <Grid container spacing={3}>
        {/* Target Posts */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 2, height: '700px', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Target Posts
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : posts.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 4 }}>
                <Typography color="text.secondary">
                  No target posts found. Adjust your hashtags or connect more platforms.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {posts.map((post) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={post.id}>
                    <Card>
                      {post.imageUrl && (
                        <CardMedia
                          component="img"
                          height="200"
                          image={post.imageUrl}
                          alt={post.author}
                        />
                      )}
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="subtitle2">{post.author}</Typography>
                          <Chip label={post.platform} size="small" />
                        </Box>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {post.caption || 'No caption'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                          <Chip icon={<LikeIcon />} label={post.likes} size="small" />
                          <Chip icon={<CommentIcon />} label={post.comments} size="small" />
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          startIcon={analyzing && selectedPost?.id === post.id ? <CircularProgress size={16} /> : <AIIcon />}
                          onClick={() => analyzeImage(post)}
                          disabled={analyzing || !post.imageUrl}
                        >
                          Analyze & Comment
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>

        {/* Comment Panel */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: '700px', display: 'flex', flexDirection: 'column' }}>
            {selectedPost ? (
              <>
                <Typography variant="h6" gutterBottom>
                  Engage with Post
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {selectedPost.author}
                  </Typography>
                  <Chip label={selectedPost.platform} size="small" />
                </Box>

                {selectedPost.imageUrl && (
                  <img
                    src={selectedPost.imageUrl}
                    alt={selectedPost.author}
                    style={{ width: '100%', borderRadius: '8px', marginBottom: '16px' }}
                  />
                )}

                {visionAnalysis && (
                  <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      <ImageIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                      Vision Analysis:
                    </Typography>
                    {visionAnalysis.objects.length > 0 && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">Objects:</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                          {visionAnalysis.objects.slice(0, 5).map((obj, i) => (
                            <Chip key={i} label={obj} size="small" />
                          ))}
                        </Box>
                      </Box>
                    )}
                    {visionAnalysis.colors.length > 0 && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">Colors:</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                          {visionAnalysis.colors.slice(0, 3).map((color, i) => (
                            <Chip key={i} label={color} size="small" />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Paper>
                )}

                <TextField
                  label="Your Comment"
                  multiline
                  rows={6}
                  fullWidth
                  value={customComment}
                  onChange={(e) => setCustomComment(e.target.value)}
                  placeholder="AI-generated comment will appear here..."
                  sx={{ mb: 2, flex: 1 }}
                />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        defaultChecked
                        onChange={(e) => setSettings({ ...settings, autoLike: e.target.checked })}
                      />
                    }
                    label="Also Like This Post"
                  />
                  <Button
                    variant="contained"
                    startIcon={commenting ? <CircularProgress size={20} /> : <CommentIcon />}
                    onClick={() => postComment(selectedPost.id, customComment, settings.autoLike)}
                    disabled={commenting || !customComment.trim()}
                    fullWidth
                  >
                    Post Comment
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setSelectedPost(null);
                      setVisionAnalysis(null);
                      setGeneratedComment('');
                      setCustomComment('');
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                <Typography color="text.secondary">
                  Select a post to analyze and comment
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      )}

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Smart Engagement Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoComment}
                  onChange={(e) => setSettings({ ...settings, autoComment: e.target.checked })}
                />
              }
              label="Auto-Comment (automatically post AI-generated comments)"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.avoidSpam}
                  onChange={(e) => setSettings({ ...settings, avoidSpam: e.target.checked })}
                />
              }
              label="Avoid Spam Patterns (space out engagements)"
            />

            <TextField
              label="Comment Frequency (minutes)"
              type="number"
              value={settings.commentFrequency}
              onChange={(e) => setSettings({ ...settings, commentFrequency: parseInt(e.target.value) })}
              helperText="Minimum time between comments"
              disabled={!settings.autoComment}
            />

            <TextField
              label="Target Hashtags (comma-separated)"
              value={settings.targetHashtags.join(', ')}
              onChange={(e) => setSettings({ ...settings, targetHashtags: e.target.value.split(',').map(h => h.trim()) })}
              helperText="Posts with these hashtags will be targeted"
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
