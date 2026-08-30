'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ToggleButtonGroup,
  ToggleButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Schedule as ScheduleIcon,
  DragIndicator as DragIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Repeat as RepeatIcon,
  Public as PublicIcon,
  Add as AddIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

// Helper functions for date manipulation
const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const addHours = (date: Date, hours: number) => {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
};

const format = (date: Date, formatStr: string) => {
  if (formatStr === 'PPp') {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }
  return date.toLocaleDateString();
};

interface ScheduledPost {
  id: string;
  title: string;
  content: string;
  platform: string;
  scheduledTime: Date;
  status: 'scheduled' | 'published' | 'failed';
  timezone: string;
  recurring?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    endDate?: Date;
  };
}

interface ContentSchedulerProps {
  onSchedule?: (post: ScheduledPost) => void;
}

export default function ContentScheduler({ onSchedule }: ContentSchedulerProps) {
  const [posts, setPosts] = useState<ScheduledPost[]>([
    {
      id: '1',
      title: 'Summer Fashion Sale',
      content: 'Check out our amazing summer collection! 🌞',
      platform: 'Instagram',
      scheduledTime: addHours(new Date(), 2),
      status: 'scheduled',
      timezone: 'America/New_York',
    },
    {
      id: '2',
      title: 'Tech Gadgets Promo',
      content: 'Latest tech gadgets at unbeatable prices! 🔥',
      platform: 'Twitter',
      scheduledTime: addDays(new Date(), 1),
      status: 'scheduled',
      timezone: 'America/New_York',
    },
    {
      id: '3',
      title: 'Weekly Newsletter',
      content: 'Your weekly dose of style inspiration 💅',
      platform: 'Facebook',
      scheduledTime: addDays(new Date(), 3),
      status: 'scheduled',
      timezone: 'America/New_York',
      recurring: {
        enabled: true,
        frequency: 'weekly',
      },
    },
  ]);

  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [draggedPost, setDraggedPost] = useState<string | null>(null);

  // New post form state
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    platform: 'Instagram',
    scheduledTime: addHours(new Date(), 1),
    timezone: 'America/New_York',
    recurring: false,
    frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
  });

  const platforms = ['Instagram', 'Twitter', 'Facebook', 'LinkedIn', 'TikTok'];
  const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Australia/Sydney',
  ];

  const handleSchedulePost = () => {
    const post: ScheduledPost = {
      id: Date.now().toString(),
      title: newPost.title,
      content: newPost.content,
      platform: newPost.platform,
      scheduledTime: newPost.scheduledTime,
      status: 'scheduled',
      timezone: newPost.timezone,
      recurring: newPost.recurring
        ? {
            enabled: true,
            frequency: newPost.frequency,
          }
        : undefined,
    };

    setPosts([...posts, post]);
    toast.success('Post scheduled successfully!');
    setShowScheduleDialog(false);
    resetForm();

    if (onSchedule) {
      onSchedule(post);
    }
  };

  const handleBulkSchedule = () => {
    const bulkPosts: ScheduledPost[] = [];
    const startDate = new Date();

    for (let i = 0; i < 5; i++) {
      bulkPosts.push({
        id: `${Date.now()}-${i}`,
        title: `Bulk Post ${i + 1}`,
        content: 'Auto-generated content',
        platform: platforms[i % platforms.length],
        scheduledTime: addDays(startDate, i),
        status: 'scheduled',
        timezone: 'America/New_York',
      });
    }

    setPosts([...posts, ...bulkPosts]);
    toast.success(`${bulkPosts.length} posts scheduled!`);
    setShowBulkDialog(false);
  };

  const handleDeletePost = (id: string) => {
    setPosts(posts.filter((p) => p.id !== id));
    toast.success('Post removed from schedule');
  };

  const handleDuplicatePost = (post: ScheduledPost) => {
    const duplicate: ScheduledPost = {
      ...post,
      id: Date.now().toString(),
      title: `${post.title} (Copy)`,
      scheduledTime: addHours(post.scheduledTime, 1),
    };
    setPosts([...posts, duplicate]);
    toast.success('Post duplicated');
  };

  const handleDragStart = (id: string) => {
    setDraggedPost(id);
  };

  const handleDrop = (targetId: string) => {
    if (!draggedPost || draggedPost === targetId) return;

    const draggedIndex = posts.findIndex((p) => p.id === draggedPost);
    const targetIndex = posts.findIndex((p) => p.id === targetId);

    const newPosts = [...posts];
    const [removed] = newPosts.splice(draggedIndex, 1);
    newPosts.splice(targetIndex, 0, removed);

    setPosts(newPosts);
    setDraggedPost(null);
    toast.success('Schedule order updated');
  };

  const resetForm = () => {
    setNewPost({
      title: '',
      content: '',
      platform: 'Instagram',
      scheduledTime: addHours(new Date(), 1),
      timezone: 'America/New_York',
      recurring: false,
      frequency: 'weekly',
    });
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      Instagram: '#E4405F',
      Twitter: '#1DA1F2',
      Facebook: '#1877F2',
      LinkedIn: '#0A66C2',
      TikTok: '#000000',
    };
    return colors[platform] || '#6b7280';
  };

  return (
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              Content Scheduler
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage and schedule your social media posts
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setShowBulkDialog(true)}
            >
              Bulk Schedule
            </Button>
            <Button
              variant="contained"
              startIcon={<ScheduleIcon />}
              onClick={() => setShowScheduleDialog(true)}
            >
              New Post
            </Button>
          </Box>
        </Box>

        {/* Stats */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Scheduled
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {posts.filter((p) => p.status === 'scheduled').length}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Recurring
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {posts.filter((p) => p.recurring?.enabled).length}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary">
                This Week
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {
                  posts.filter(
                    (p) =>
                      p.scheduledTime >= new Date() &&
                      p.scheduledTime <= addDays(new Date(), 7)
                  ).length
                }
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Platforms
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {new Set(posts.map((p) => p.platform)).size}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Post Queue */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Scheduled Posts Queue
          </Typography>
          <List>
            {posts
              .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime())
              .map((post, index) => (
                <React.Fragment key={post.id}>
                  <ListItem
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      mb: 1,
                      cursor: 'grab',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                    draggable
                    onDragStart={() => handleDragStart(post.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(post.id)}
                  >
                    <IconButton size="small" sx={{ mr: 1 }}>
                      <DragIcon />
                    </IconButton>
                    <Avatar
                      sx={{
                        bgcolor: getPlatformColor(post.platform),
                        width: 40,
                        height: 40,
                        mr: 2,
                      }}
                    >
                      {post.platform[0]}
                    </Avatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {post.title}
                          </Typography>
                          {post.recurring?.enabled && (
                            <Chip
                              icon={<RepeatIcon />}
                              label={post.recurring.frequency}
                              size="small"
                              sx={{ height: 20 }}
                            />
                          )}
                          <Chip
                            label={post.status}
                            size="small"
                            color={post.status === 'scheduled' ? 'primary' : 'default'}
                            sx={{ height: 20 }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {post.content.substring(0, 60)}...
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            📅 {format(post.scheduledTime, 'PPp')} • 🌍 {post.timezone}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleDuplicatePost(post)}
                          title="Duplicate"
                        >
                          <CopyIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => setSelectedPost(post)}
                          title="Edit"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeletePost(post.id)}
                          title="Delete"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < posts.length - 1 && <Divider sx={{ my: 1 }} />}
                </React.Fragment>
              ))}
            {posts.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No scheduled posts yet. Click "New Post" to get started!
                </Typography>
              </Box>
            )}
          </List>
        </Paper>

        {/* Schedule New Post Dialog */}
        <Dialog
          open={showScheduleDialog}
          onClose={() => setShowScheduleDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Schedule New Post</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <TextField
                label="Title"
                fullWidth
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              />
              <TextField
                label="Content"
                fullWidth
                multiline
                rows={4}
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>Platform</InputLabel>
                <Select
                  value={newPost.platform}
                  onChange={(e) => setNewPost({ ...newPost, platform: e.target.value })}
                  label="Platform"
                >
                  {platforms.map((platform) => (
                    <MenuItem key={platform} value={platform}>
                      {platform}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Schedule Time"
                type="datetime-local"
                fullWidth
                value={newPost.scheduledTime.toISOString().slice(0, 16)}
                onChange={(e) => setNewPost({ ...newPost, scheduledTime: new Date(e.target.value) })}
                InputLabelProps={{ shrink: true }}
              />
              <FormControl fullWidth>
                <InputLabel>Timezone</InputLabel>
                <Select
                  value={newPost.timezone}
                  onChange={(e) => setNewPost({ ...newPost, timezone: e.target.value })}
                  label="Timezone"
                >
                  {timezones.map((tz) => (
                    <MenuItem key={tz} value={tz}>
                      {tz}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Recurring Post
                </Typography>
                <ToggleButtonGroup
                  value={newPost.recurring}
                  exclusive
                  onChange={(e, value) =>
                    value !== null && setNewPost({ ...newPost, recurring: value })
                  }
                  size="small"
                  fullWidth
                >
                  <ToggleButton value={false}>One-time</ToggleButton>
                  <ToggleButton value={true}>Recurring</ToggleButton>
                </ToggleButtonGroup>
                {newPost.recurring && (
                  <Box sx={{ mt: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>Frequency</InputLabel>
                      <Select
                        value={newPost.frequency}
                        onChange={(e) =>
                          setNewPost({
                            ...newPost,
                            frequency: e.target.value as 'daily' | 'weekly' | 'monthly',
                          })
                        }
                        label="Frequency"
                      >
                        <MenuItem value="daily">Daily</MenuItem>
                        <MenuItem value="weekly">Weekly</MenuItem>
                        <MenuItem value="monthly">Monthly</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowScheduleDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSchedulePost}
              disabled={!newPost.title || !newPost.content}
            >
              Schedule Post
            </Button>
          </DialogActions>
        </Dialog>

        {/* Bulk Schedule Dialog */}
        <Dialog
          open={showBulkDialog}
          onClose={() => setShowBulkDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Bulk Schedule Posts</DialogTitle>
          <DialogContent>
            <Box sx={{ py: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                This will create 5 posts scheduled across different platforms over the next 5 days.
              </Typography>
              <LinearProgress variant="determinate" value={0} sx={{ mb: 2 }} />
              <Typography variant="caption" color="text.secondary">
                Ready to schedule
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowBulkDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleBulkSchedule}>
              Schedule 5 Posts
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
  );
}
