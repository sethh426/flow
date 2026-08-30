"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
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
  Card,
  CardContent,
  Grid,
  Divider,
  Tabs,
  Tab,
  Skeleton
} from '@mui/material';
import {
  PersonAdd as FollowIcon,
  PersonRemove as UnfollowIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';

interface TargetAccount {
  id: string;
  platform: string;
  username: string;
  displayName: string;
  avatar?: string;
  followers: number;
  following: number;
  engagementRate?: number;
  isFollowing: boolean;
  followedAt?: number;
}

interface AutoFollowSettings {
  enabled: boolean;
  dailyLimit: number;
  minFollowers: number;
  maxFollowers: number;
  targetHashtags: string[];
  targetAccounts: string[];
  autoUnfollow: boolean;
  unfollowAfterDays: number;
  platforms: string[];
}

interface AutoFollowProps {
  connectedPlatforms: string[];
}

export default function AutoFollow({ connectedPlatforms }: AutoFollowProps) {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [targetAccounts, setTargetAccounts] = useState<TargetAccount[]>([]);
  const [followedAccounts, setFollowedAccounts] = useState<TargetAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AutoFollowSettings>({
    enabled: false,
    dailyLimit: 50,
    minFollowers: 100,
    maxFollowers: 100000,
    targetHashtags: ['fashion', 'style'],
    targetAccounts: [],
    autoUnfollow: true,
    unfollowAfterDays: 7,
    platforms: ['instagram', 'twitter']
  });
  const [stats, setStats] = useState({
    todayFollows: 0,
    todayUnfollows: 0,
    followBackRate: 0,
    totalFollowed: 0
  });

  useEffect(() => {
    if (tabValue === 0) {
      discoverTargetAccounts();
    } else {
      fetchFollowedAccounts();
    }
  }, [tabValue, settings.targetHashtags, settings.platforms]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/follow-stats?userId=${user.uid}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const discoverTargetAccounts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/discover-accounts?userId=${user.uid}&hashtags=${settings.targetHashtags.join(',')}&platforms=${settings.platforms.join(',')}&minFollowers=${settings.minFollowers}&maxFollowers=${settings.maxFollowers}`
      );

      if (!response.ok) {
        throw new Error('Failed to discover accounts');
      }

      const data = await response.json();
      setTargetAccounts(data.accounts || []);
      setError(null);
    } catch (err) {
      console.error('Error discovering accounts:', err);
      setError(err instanceof Error ? err.message : 'Failed to discover accounts');
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowedAccounts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/followed-accounts?userId=${user.uid}`);

      if (!response.ok) {
        throw new Error('Failed to fetch followed accounts');
      }

      const data = await response.json();
      setFollowedAccounts(data.accounts || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching followed accounts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch followed accounts');
    } finally {
      setLoading(false);
    }
  };

  const followAccount = async (account: TargetAccount) => {
    if (!user) return;

    // Check daily limit
    if (stats.todayFollows >= settings.dailyLimit) {
      setError(`Daily follow limit reached (${settings.dailyLimit}). Try again tomorrow.`);
      return;
    }

    try {
      setFollowing(true);

      const response = await fetch('/api/follow-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          accountId: account.id,
          platform: account.platform,
          username: account.username
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to follow account');
      }

      // Update local state
      setTargetAccounts(prev => prev.filter(a => a.id !== account.id));
      setStats(prev => ({ ...prev, todayFollows: prev.todayFollows + 1, totalFollowed: prev.totalFollowed + 1 }));
      setError(null);

    } catch (err) {
      console.error('Error following account:', err);
      setError(err instanceof Error ? err.message : 'Failed to follow account');
    } finally {
      setFollowing(false);
    }
  };

  const unfollowAccount = async (account: TargetAccount) => {
    if (!user) return;

    try {
      setFollowing(true);

      const response = await fetch('/api/unfollow-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          accountId: account.id,
          platform: account.platform
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to unfollow account');
      }

      // Update local state
      setFollowedAccounts(prev => prev.filter(a => a.id !== account.id));
      setStats(prev => ({ ...prev, todayUnfollows: prev.todayUnfollows + 1 }));
      setError(null);

    } catch (err) {
      console.error('Error unfollowing account:', err);
      setError(err instanceof Error ? err.message : 'Failed to unfollow account');
    } finally {
      setFollowing(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" gutterBottom>
            Auto-Follow System
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Strategic growth automation for your social media
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
          <IconButton onClick={tabValue === 0 ? discoverTargetAccounts : fetchFollowedAccounts} disabled={loading}>
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
                    <Skeleton variant="text" width="60%" height={40} />
                    <Skeleton variant="text" width="70%" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ mb: 2 }}>
            <Skeleton variant="rectangular" width={200} height={48} />
          </Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 2, height: 600 }}>
                <Skeleton variant="text" width="40%" height={30} sx={{ mb: 2 }} />
                {[1, 2, 3, 4, 5].map((i) => (
                  <Box key={i} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                      <Skeleton variant="circular" width={56} height={56} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" width="80%" />
                        <Skeleton variant="text" width="40%" />
                      </Box>
                    </Box>
                    <Skeleton variant="rectangular" width="100%" height={1} />
                  </Box>
                ))}
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 2, height: 600 }}>
                <Skeleton variant="text" width="40%" height={30} sx={{ mb: 2 }} />
                {[1, 2, 3, 4].map((i) => (
                  <Box key={i} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                      <Skeleton variant="circular" width={56} height={56} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" width="80%" />
                      </Box>
                    </Box>
                    <Skeleton variant="rectangular" width="100%" height={1} />
                  </Box>
                ))}
              </Paper>
            </Grid>
          </Grid>
        </>
      )}

      {/* Stats */}
      {!loading && (
        <>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h4">{stats.todayFollows}/{settings.dailyLimit}</Typography>
              <Typography variant="body2" color="text.secondary">Today&apos;s Follows</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h4">{stats.followBackRate}%</Typography>
              <Typography variant="body2" color="text.secondary">Follow Back Rate</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h4">{stats.totalFollowed}</Typography>
              <Typography variant="body2" color="text.secondary">Total Followed</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h4">{stats.todayUnfollows}</Typography>
              <Typography variant="body2" color="text.secondary">Today&apos;s Unfollows</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label={`Target Accounts (${targetAccounts.length})`} />
          <Tab label={`Following (${followedAccounts.length})`} />
        </Tabs>
      </Paper>

      {/* Target Accounts */}
      {tabValue === 0 && (
        <Paper sx={{ p: 2, height: '600px', overflow: 'auto' }}>
          <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              placeholder="Search by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
              }}
            />
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : targetAccounts.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <Typography color="text.secondary">
                No target accounts found. Adjust your hashtags or settings.
              </Typography>
            </Box>
          ) : (
            <List>
              {targetAccounts
                .filter(account => 
                  searchQuery === '' || 
                  account.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  account.displayName.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((account) => (
                  <React.Fragment key={account.id}>
                    <ListItem
                      secondaryAction={
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<FollowIcon />}
                          onClick={() => followAccount(account)}
                          disabled={following || stats.todayFollows >= settings.dailyLimit}
                        >
                          Follow
                        </Button>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar src={account.avatar}>
                          {account.username.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1">
                              {account.displayName}
                            </Typography>
                            <Chip
                              label={account.platform}
                              size="small"
                              sx={{ textTransform: 'capitalize' }}
                            />
                            {account.engagementRate && account.engagementRate >= 3 && (
                              <Chip
                                icon={<TrendingUpIcon />}
                                label={`${account.engagementRate}%`}
                                size="small"
                                color="success"
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            @{account.username} • {account.followers.toLocaleString()} followers
                          </Typography>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
            </List>
          )}
        </Paper>
      )}

      {/* Following Accounts */}
      {tabValue === 1 && (
        <Paper sx={{ p: 2, height: '600px', overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : followedAccounts.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <Typography color="text.secondary">
                No followed accounts yet. Start following accounts from the Target Accounts tab.
              </Typography>
            </Box>
          ) : (
            <List>
              {followedAccounts.map((account) => {
                const daysSinceFollow = account.followedAt 
                  ? Math.floor((Date.now() - account.followedAt) / (1000 * 60 * 60 * 24))
                  : 0;
                const shouldUnfollow = settings.autoUnfollow && daysSinceFollow >= settings.unfollowAfterDays;

                return (
                  <React.Fragment key={account.id}>
                    <ListItem
                      secondaryAction={
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<UnfollowIcon />}
                          onClick={() => unfollowAccount(account)}
                          disabled={following}
                          color={shouldUnfollow ? 'warning' : 'primary'}
                        >
                          Unfollow
                        </Button>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar src={account.avatar}>
                          {account.username.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1">
                              {account.displayName}
                            </Typography>
                            <Chip
                              label={account.platform}
                              size="small"
                              sx={{ textTransform: 'capitalize' }}
                            />
                            {shouldUnfollow && (
                              <Chip
                                label="Auto-unfollow ready"
                                size="small"
                                color="warning"
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            @{account.username} • Followed {daysSinceFollow} days ago
                          </Typography>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                );
              })}
            </List>
          )}
        </Paper>
      )}
        </>
      )}

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Auto-Follow Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <TextField
              label="Daily Follow Limit"
              type="number"
              value={settings.dailyLimit}
              onChange={(e) => setSettings({ ...settings, dailyLimit: parseInt(e.target.value) })}
              helperText="Maximum follows per day (platform limits apply)"
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Min Followers"
                type="number"
                value={settings.minFollowers}
                onChange={(e) => setSettings({ ...settings, minFollowers: parseInt(e.target.value) })}
                fullWidth
              />
              <TextField
                label="Max Followers"
                type="number"
                value={settings.maxFollowers}
                onChange={(e) => setSettings({ ...settings, maxFollowers: parseInt(e.target.value) })}
                fullWidth
              />
            </Box>

            <TextField
              label="Target Hashtags (comma-separated)"
              value={settings.targetHashtags.join(', ')}
              onChange={(e) => setSettings({ ...settings, targetHashtags: e.target.value.split(',').map(h => h.trim()) })}
              helperText="Accounts using these hashtags will be targeted"
              fullWidth
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoUnfollow}
                  onChange={(e) => setSettings({ ...settings, autoUnfollow: e.target.checked })}
                />
              }
              label="Auto-Unfollow (unfollow accounts that don't follow back)"
            />

            <TextField
              label="Unfollow After (days)"
              type="number"
              value={settings.unfollowAfterDays}
              onChange={(e) => setSettings({ ...settings, unfollowAfterDays: parseInt(e.target.value) })}
              helperText="Days to wait before auto-unfollowing"
              disabled={!settings.autoUnfollow}
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
