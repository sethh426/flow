/**
 * Post Scheduler Component
 * 
 * Schedule Instagram posts and stories
 */

'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Chip,
  Stack
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Send as SendIcon,
  Image as ImageIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';

interface ScheduledPost {
  id?: string;
  imageUrl: string;
  caption: string;
  scheduleTime: string;
  platform: 'instagram' | 'tiktok' | 'facebook';
  type: 'feed' | 'story' | 'reel';
  status: 'scheduled' | 'published' | 'failed';
}

export default function InstagramScheduler() {
  const [post, setPost] = useState<ScheduledPost>({
    imageUrl: '',
    caption: '',
    scheduleTime: '',
    platform: 'instagram',
    type: 'feed',
    status: 'scheduled'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSchedulePost = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Validate
      if (!post.imageUrl || !post.caption) {
        setError('Image URL and caption are required');
        return;
      }

      // Call API to schedule post
      const response = await fetch('/api/instagram/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'current-user-id', // Replace with actual user ID
          imageUrl: post.imageUrl,
          caption: post.caption,
          schedule: post.scheduleTime || undefined,
          type: post.type
        })
      });

      if (!response.ok) {
        throw new Error('Failed to schedule post');
      }

      const data = await response.json();

      setSuccess(
        post.scheduleTime
          ? `Post scheduled for ${new Date(post.scheduleTime).toLocaleString()}`
          : 'Post published successfully!'
      );

      // Reset form
      setPost({
        imageUrl: '',
        caption: '',
        scheduleTime: '',
        platform: 'instagram',
        type: 'feed',
        status: 'scheduled'
      });

    } catch (err: any) {
      setError(err.message || 'Failed to schedule post');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishNow = async () => {
    setPost({ ...post, scheduleTime: '' });
    await handleSchedulePost();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        📅 Post Scheduler
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Schedule Instagram posts, stories, and reels
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Create Post
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}

              <Stack spacing={3}>
                {/* Platform Selection */}
                <FormControl fullWidth>
                  <InputLabel>Platform</InputLabel>
                  <Select
                    value={post.platform}
                    label="Platform"
                    onChange={(e) => setPost({ ...post, platform: e.target.value as any })}
                  >
                    <MenuItem value="instagram">Instagram</MenuItem>
                    <MenuItem value="tiktok">TikTok</MenuItem>
                    <MenuItem value="facebook">Facebook</MenuItem>
                  </Select>
                </FormControl>

                {/* Type Selection */}
                <FormControl fullWidth>
                  <InputLabel>Post Type</InputLabel>
                  <Select
                    value={post.type}
                    label="Post Type"
                    onChange={(e) => setPost({ ...post, type: e.target.value as any })}
                  >
                    <MenuItem value="feed">Feed Post</MenuItem>
                    <MenuItem value="story">Story</MenuItem>
                    <MenuItem value="reel">Reel</MenuItem>
                  </Select>
                </FormControl>

                {/* Image URL */}
                <TextField
                  fullWidth
                  label="Image URL"
                  value={post.imageUrl}
                  onChange={(e) => setPost({ ...post, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  InputProps={{
                    startAdornment: <ImageIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />

                {/* Caption */}
                <TextField
                  fullWidth
                  label="Caption"
                  value={post.caption}
                  onChange={(e) => setPost({ ...post, caption: e.target.value })}
                  multiline
                  rows={6}
                  placeholder="Write your caption here... Include hashtags and emojis! ✨"
                />

                <Typography variant="caption" color="text.secondary">
                  {post.caption.length} characters
                </Typography>

                {/* Schedule Time */}
                <TextField
                  fullWidth
                  label="Schedule Time (optional)"
                  type="datetime-local"
                  value={post.scheduleTime}
                  onChange={(e) => setPost({ ...post, scheduleTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  helperText="Leave empty to publish immediately"
                />

                {/* Action Buttons */}
                <Stack direction="row" spacing={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    startIcon={loading ? <CircularProgress size={20} /> : <ScheduleIcon />}
                    onClick={handleSchedulePost}
                    disabled={loading || !post.imageUrl || !post.caption || !post.scheduleTime}
                  >
                    Schedule Post
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    color="secondary"
                    startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                    onClick={handlePublishNow}
                    disabled={loading || !post.imageUrl || !post.caption}
                  >
                    Publish Now
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Preview
              </Typography>

              {post.imageUrl ? (
                <Box
                  sx={{
                    width: '100%',
                    height: 300,
                    backgroundImage: `url(${post.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: 1,
                    mb: 2
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: 300,
                    bgcolor: 'grey.100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1,
                    mb: 2
                  }}
                >
                  <Typography color="text.secondary">
                    Image preview will appear here
                  </Typography>
                </Box>
              )}

              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                {post.caption || 'Caption will appear here...'}
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip label={post.platform.toUpperCase()} size="small" color="primary" />
                <Chip label={post.type.toUpperCase()} size="small" />
                {post.scheduleTime && (
                  <Chip
                    label={`Scheduled: ${new Date(post.scheduleTime).toLocaleString()}`}
                    size="small"
                    color="secondary"
                  />
                )}
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                💡 Best Practices
              </Typography>
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                <li><Typography variant="body2">Post during peak engagement times (9-11 AM, 7-9 PM)</Typography></li>
                <li><Typography variant="body2">Use 5-10 relevant hashtags</Typography></li>
                <li><Typography variant="body2">Include a clear call-to-action</Typography></li>
                <li><Typography variant="body2">Schedule 1-3 posts per day</Typography></li>
                <li><Typography variant="body2">Maintain consistent brand voice</Typography></li>
              </ul>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
