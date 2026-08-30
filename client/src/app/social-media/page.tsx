'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Chip,
  LinearProgress,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  Instagram as InstagramIcon,
  Facebook as FacebookIcon,
  LinkedIn as LinkedInIcon,
  Pinterest as PinterestIcon,
  Twitter as TwitterIcon,
  TrendingUp as TrendingUpIcon,
  Message as MessageIcon,
  AutoAwesome as AutoAwesomeIcon,
  ThumbUp as ThumbUpIcon,
  PersonAdd as PersonAddIcon,
  Analytics as AnalyticsIcon,
  Link as LinkIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import AutoMessenger from '@/features/social-media/AutoMessenger';
import SmartEngagement from '@/features/social-media/SmartEngagement';
import AnalyticsDashboard from '@/features/social-media/Analytics';
import AutoFollow from '@/features/social-media/AutoFollow';

interface PlatformConnection {
  platform: string;
  connected: boolean;
  username?: string;
  followers?: number;
  engagement?: number;
  icon: React.ReactNode;
  color: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function SocialMediaManager() {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [platforms, setPlatforms] = useState<PlatformConnection[]>([
    {
      platform: 'Instagram',
      connected: false,
      icon: <InstagramIcon />,
      color: '#E4405F',
    },
    {
      platform: 'TikTok',
      connected: false,
      icon: <AutoAwesomeIcon />,
      color: '#000000',
    },
    {
      platform: 'Facebook',
      connected: false,
      icon: <FacebookIcon />,
      color: '#1877F2',
    },
    {
      platform: 'Twitter',
      connected: false,
      icon: <TwitterIcon />,
      color: '#1DA1F2',
    },
    {
      platform: 'Pinterest',
      connected: false,
      icon: <PinterestIcon />,
      color: '#E60023',
    },
    {
      platform: 'LinkedIn',
      connected: false,
      icon: <LinkedInIcon />,
      color: '#0A66C2',
    },
  ]);

  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformConnection | null>(null);

  // Load connected platforms
  useEffect(() => {
    if (user?.uid) {
      loadConnectedPlatforms();
    }
  }, [user]);

  const loadConnectedPlatforms = async () => {
    try {
      const response = await fetch(`/api/social-platforms?userId=${user?.uid}`);
      if (response.ok) {
        const data = await response.json();
        // Update platforms with connection status
        setPlatforms((prev) =>
          prev.map((platform) => {
            const connected = data.platforms.find(
              (p: any) => p.platform === platform.platform.toLowerCase()
            );
            return connected
              ? {
                  ...platform,
                  connected: true,
                  username: connected.username,
                  followers: connected.followers,
                  engagement: connected.engagement,
                }
              : platform;
          })
        );
      }
    } catch (error) {
      console.error('Error loading platforms:', error);
    }
  };

  const handleConnectPlatform = (platform: PlatformConnection) => {
    setSelectedPlatform(platform);
    setConnectDialogOpen(true);
  };

  const initiateOAuthFlow = () => {
    if (!selectedPlatform || !user?.uid) return;

    // Open OAuth popup window
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      `/api/social-auth/${selectedPlatform.platform.toLowerCase()}?userId=${user.uid}`,
      'Social Media OAuth',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
    );

    // Listen for OAuth callback
    const checkPopup = setInterval(() => {
      if (popup && popup.closed) {
        clearInterval(checkPopup);
        // Reload platforms after connection
        loadConnectedPlatforms();
        setConnectDialogOpen(false);
      }
    }, 1000);
  };

  const handleDisconnectPlatform = async (platform: PlatformConnection) => {
    try {
      const response = await fetch('/api/social-platforms', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid,
          platform: platform.platform.toLowerCase(),
        }),
      });

      if (response.ok) {
        loadConnectedPlatforms();
      }
    } catch (error) {
      console.error('Error disconnecting platform:', error);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Social Media Manager
        </Typography>
        <Typography variant="body1" color="text.secondary">
          AI-powered social media automation, analytics, and engagement
        </Typography>
      </Box>

      {/* Platform Connection Cards */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Connected Platforms
        </Typography>
        <Grid container spacing={2}>
          {platforms.map((platform) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={platform.platform}>
              <Card
                sx={{
                  border: platform.connected ? `2px solid ${platform.color}` : '1px solid #e0e0e0',
                  position: 'relative',
                }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      backgroundColor: platform.connected ? platform.color : '#f5f5f5',
                      color: platform.connected ? 'white' : '#666',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      margin: '0 auto 12px',
                    }}
                  >
                    {platform.icon}
                  </Box>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    {platform.platform}
                  </Typography>
                  {platform.connected ? (
                    <>
                      <Chip
                        label="Connected"
                        size="small"
                        color="success"
                        icon={<CheckCircleIcon />}
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="caption" display="block" color="text.secondary">
                        @{platform.username}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        {platform.followers?.toLocaleString()} followers
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => handleDisconnectPlatform(platform)}
                        sx={{ mt: 1 }}
                      >
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<LinkIcon />}
                      onClick={() => handleConnectPlatform(platform)}
                      sx={{ mt: 1, backgroundColor: platform.color }}
                    >
                      Connect
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Feature Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)}>
          <Tab icon={<AnalyticsIcon />} label="Analytics" />
          <Tab icon={<MessageIcon />} label="Auto-Messenger" />
          <Tab icon={<ThumbUpIcon />} label="Smart Engagement" />
          <Tab icon={<PersonAddIcon />} label="Auto-Follow" />
        </Tabs>
      </Box>

      {/* Analytics Tab */}
      <TabPanel value={tabValue} index={0}>
        <AnalyticsDashboard connectedPlatforms={platforms.filter(p => p.connected).map(p => p.platform.toLowerCase())} />
      </TabPanel>

      {/* Auto-Messenger Tab */}
      <TabPanel value={tabValue} index={1}>
        <AutoMessenger connectedPlatforms={platforms.filter(p => p.connected).map(p => p.platform.toLowerCase())} />
      </TabPanel>

      {/* Smart Engagement Tab */}
      <TabPanel value={tabValue} index={2}>
        <SmartEngagement connectedPlatforms={platforms.filter(p => p.connected).map(p => p.platform.toLowerCase())} />
      </TabPanel>

      {/* Auto-Follow Tab */}
      <TabPanel value={tabValue} index={3}>
        <AutoFollow connectedPlatforms={platforms.filter(p => p.connected).map(p => p.platform.toLowerCase())} />
      </TabPanel>

      {/* Connection Dialog */}
      <Dialog open={connectDialogOpen} onClose={() => setConnectDialogOpen(false)}>
        <DialogTitle>
          Connect {selectedPlatform?.platform}
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            You will be redirected to {selectedPlatform?.platform} to securely authorize access.
            We will never store your password.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            After authorization, you'll be able to:
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>View analytics and insights</li>
            <li>Auto-respond to messages</li>
            <li>Engage with AI-generated comments</li>
            <li>Grow your following automatically</li>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConnectDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={initiateOAuthFlow}
            sx={{ backgroundColor: selectedPlatform?.color }}
          >
            Connect Securely
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
