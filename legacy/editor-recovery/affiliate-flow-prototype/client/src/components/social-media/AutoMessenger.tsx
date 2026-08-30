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
  ListItemButton,
  ListItemText,
  ListItemAvatar,
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
  Divider,
  CircularProgress,
  Alert,
  Skeleton,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Send as SendIcon,
  Refresh as RefreshIcon,
  SmartToy as AIIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  platform: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: number;
  sentiment?: 'positive' | 'negative' | 'neutral' | 'question' | 'complaint';
  aiResponse?: string;
  responseStatus?: 'pending' | 'sent' | 'failed';
}

interface AutoMessengerSettings {
  enabled: boolean;
  autoReply: boolean;
  responseDelay: number; // seconds
  tone: 'professional' | 'friendly' | 'casual' | 'enthusiastic';
  maxLength: number;
  includeEmojis: boolean;
  platforms: string[];
}

interface AutoMessengerProps {
  connectedPlatforms: string[];
}

export default function AutoMessenger({ connectedPlatforms }: AutoMessengerProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AutoMessengerSettings>({
    enabled: true,
    autoReply: false,
    responseDelay: 5,
    tone: 'friendly',
    maxLength: 500,
    includeEmojis: true,
    platforms: ['instagram', 'facebook', 'twitter']
  });
  const [customResponse, setCustomResponse] = useState('');
  const [generatingResponse, setGeneratingResponse] = useState(false);

  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 30 seconds
    const interval = setInterval(fetchMessages, 30000);
    return () => clearInterval(interval);
  }, [settings.platforms]);

  const fetchMessages = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/social-messages?userId=${user.uid}&platforms=${settings.platforms.join(',')}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data.messages || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const generateAIResponse = async (message: Message) => {
    if (!user) return;

    try {
      setGeneratingResponse(true);
      
      const response = await fetch('/api/generate-message-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          message: message.text,
          senderName: message.senderName,
          platform: message.platform,
          sentiment: message.sentiment,
          settings: {
            tone: settings.tone,
            maxLength: settings.maxLength,
            includeEmojis: settings.includeEmojis
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate response');
      }

      const data = await response.json();
      
      // Update message with AI response
      setMessages(prev => prev.map(m => 
        m.id === message.id 
          ? { ...m, aiResponse: data.response, sentiment: data.sentiment }
          : m
      ));

      if (selectedMessage?.id === message.id) {
        setSelectedMessage({ ...message, aiResponse: data.response, sentiment: data.sentiment });
        setCustomResponse(data.response);
      }

      // Auto-send if enabled
      if (settings.autoReply) {
        setTimeout(() => {
          sendResponse(message.id, data.response);
        }, settings.responseDelay * 1000);
      }

    } catch (err) {
      console.error('Error generating response:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate response');
    } finally {
      setGeneratingResponse(false);
    }
  };

  const sendResponse = async (messageId: string, responseText: string) => {
    if (!user || !responseText.trim()) return;

    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    try {
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          messageId,
          platform: message.platform,
          recipientId: message.senderId,
          text: responseText
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Update message status
      setMessages(prev => prev.map(m => 
        m.id === messageId 
          ? { ...m, responseStatus: 'sent' }
          : m
      ));

      setError(null);
      setSelectedMessage(null);
      setCustomResponse('');

    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      
      // Update message status to failed
      setMessages(prev => prev.map(m => 
        m.id === messageId 
          ? { ...m, responseStatus: 'failed' }
          : m
      ));
    }
  };

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    setCustomResponse(message.aiResponse || '');
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'success';
      case 'negative': return 'error';
      case 'question': return 'info';
      case 'complaint': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'sent': return <CheckIcon color="success" fontSize="small" />;
      case 'failed': return <ErrorIcon color="error" fontSize="small" />;
      default: return null;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" gutterBottom>
            Auto-Messenger
          </Typography>
          <Typography variant="body2" color="text.secondary">
            AI-powered message responder for your social media platforms
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
          <IconButton onClick={fetchMessages} disabled={loading}>
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
                    <Skeleton variant="text" width="40%" height={40} />
                    <Skeleton variant="text" width="70%" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 2, height: 600 }}>
                <Skeleton variant="text" width="60%" height={30} sx={{ mb: 2 }} />
                {[1, 2, 3, 4, 5].map((i) => (
                  <Box key={i} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Skeleton variant="circular" width={40} height={40} />
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
            <Grid size={{ xs: 12, md: 8 }}>
              <Paper sx={{ p: 3, height: 600 }}>
                <Skeleton variant="text" width="40%" height={30} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" width="100%" height={400} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" width="100%" height={56} />
              </Paper>
            </Grid>
          </Grid>
        </>
      )}

      {/* Stats */}
      {!loading && (
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h4">{messages.length}</Typography>
              <Typography variant="body2" color="text.secondary">Total Messages</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h4">
                {messages.filter(m => m.responseStatus === 'sent').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">Responses Sent</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h4">
                {messages.filter(m => !m.aiResponse && !m.responseStatus).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">Pending</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h4">
                {messages.filter(m => m.responseStatus === 'failed').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">Failed</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      )}

      {!loading && (
      <Grid container spacing={3}>
        {/* Message List */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, height: '600px', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Incoming Messages
            </Typography>
            {loading && messages.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : messages.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 4 }}>
                <Typography color="text.secondary">
                  No messages found. Connect your social media accounts to start receiving messages.
                </Typography>
              </Box>
            ) : (
              <List>
                {messages.map((message) => (
                  <React.Fragment key={message.id}>
                    <ListItemButton
                      selected={selectedMessage?.id === message.id}
                      onClick={() => handleMessageClick(message)}
                      sx={{
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar src={message.senderAvatar}>
                          {message.senderName.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1">
                              {message.senderName}
                            </Typography>
                            <Chip
                              label={message.platform}
                              size="small"
                              sx={{ textTransform: 'capitalize' }}
                            />
                            {message.sentiment && (
                              <Chip
                                label={message.sentiment}
                                size="small"
                                color={getSentimentColor(message.sentiment)}
                              />
                            )}
                            {getStatusIcon(message.responseStatus)}
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" noWrap>
                            {message.text}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Response Panel */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: '600px', display: 'flex', flexDirection: 'column' }}>
            {selectedMessage ? (
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Respond to {selectedMessage.senderName}
                  </Typography>
                  <Chip
                    label={selectedMessage.platform}
                    size="small"
                    sx={{ textTransform: 'capitalize', mr: 1 }}
                  />
                  {selectedMessage.sentiment && (
                    <Chip
                      label={selectedMessage.sentiment}
                      size="small"
                      color={getSentimentColor(selectedMessage.sentiment)}
                    />
                  )}
                </Box>

                <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Original Message:
                  </Typography>
                  <Typography variant="body1">
                    {selectedMessage.text}
                  </Typography>
                </Paper>

                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={generatingResponse ? <CircularProgress size={20} /> : <AIIcon />}
                    onClick={() => generateAIResponse(selectedMessage)}
                    disabled={generatingResponse}
                    fullWidth
                  >
                    {generatingResponse ? 'Generating...' : 'Generate AI Response'}
                  </Button>
                </Box>

                <TextField
                  label="Your Response"
                  multiline
                  rows={8}
                  fullWidth
                  value={customResponse}
                  onChange={(e) => setCustomResponse(e.target.value)}
                  placeholder="Type your response or generate one with AI..."
                  sx={{ mb: 2, flex: 1 }}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<SendIcon />}
                    onClick={() => sendResponse(selectedMessage.id, customResponse)}
                    disabled={!customResponse.trim()}
                    fullWidth
                  >
                    Send Response
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setSelectedMessage(null);
                      setCustomResponse('');
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                <Typography color="text.secondary">
                  Select a message to respond
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      )}

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Auto-Messenger Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoReply}
                  onChange={(e) => setSettings({ ...settings, autoReply: e.target.checked })}
                />
              }
              label="Auto-Reply (automatically send AI responses)"
            />

            <TextField
              label="Response Delay (seconds)"
              type="number"
              value={settings.responseDelay}
              onChange={(e) => setSettings({ ...settings, responseDelay: parseInt(e.target.value) })}
              helperText="Delay before auto-sending response"
              disabled={!settings.autoReply}
            />

            <FormControl fullWidth>
              <InputLabel>Response Tone</InputLabel>
              <Select
                value={settings.tone}
                onChange={(e) => setSettings({ ...settings, tone: e.target.value as any })}
              >
                <MenuItem value="professional">Professional</MenuItem>
                <MenuItem value="friendly">Friendly</MenuItem>
                <MenuItem value="casual">Casual</MenuItem>
                <MenuItem value="enthusiastic">Enthusiastic</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Max Response Length"
              type="number"
              value={settings.maxLength}
              onChange={(e) => setSettings({ ...settings, maxLength: parseInt(e.target.value) })}
              helperText="Maximum characters in response"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.includeEmojis}
                  onChange={(e) => setSettings({ ...settings, includeEmojis: e.target.checked })}
                />
              }
              label="Include Emojis in Responses"
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
