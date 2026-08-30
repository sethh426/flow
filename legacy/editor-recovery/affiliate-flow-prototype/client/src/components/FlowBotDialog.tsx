'use client';

/**
 * FlowBot Chat Dialog
 * Interactive chat interface for Flow Assistant
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Paper,
  Avatar,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import { useRouter } from 'next/navigation';
import { executeFlowBotAction } from '@/lib/flowbot-actions';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface FlowBotDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function FlowBotDialog({ open, onClose }: FlowBotDialogProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: 'Hi! I\'m Flow, your AI assistant. �\n\nI can help you:\n• Navigate the app\n• Manage campaigns & products\n• Check analytics & coins\n• Find trends\n• And much more!\n\nJust tell me what you need!',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Listen for FlowBot navigation events
  useEffect(() => {
    const handleNavigate = (e: any) => {
      const { route } = e.detail;
      router.push(route);
      onClose(); // Close dialog after navigation
    };

    window.addEventListener('flowbot-navigate', handleNavigate);
    return () => window.removeEventListener('flowbot-navigate', handleNavigate);
  }, [router, onClose]);

  const formatActionResult = (actionType: string, result: any): string => {
    if (!result.data) return result.message;

    switch (actionType) {
      case 'getCampaigns':
        return `You have ${result.data.total} campaigns (${result.data.active} active).\n\nRecent campaigns:\n${result.data.recent.map((c: any) => `• ${c.name} - ${c.clicks} clicks`).join('\n')}`;
      
      case 'getProducts':
        return `You have ${result.data.total} products.\n\nRecent products:\n${result.data.recent.map((p: any) => `• ${p.title} - $${p.price} (${p.sales} sales)`).join('\n')}`;
      
      case 'getAnalytics':
        return `Analytics (${result.data.period}):\n• Revenue: $${result.data.revenue.toLocaleString()}\n• Clicks: ${result.data.clicks.toLocaleString()}\n• Conversions: ${result.data.conversions}\n• Conversion Rate: ${result.data.conversionRate}`;
      
      case 'getTopPerformers':
        return `Top Campaigns:\n${result.data.campaigns.map((c: any) => `• ${c.name} - $${c.revenue} (ROI: ${c.roi})`).join('\n')}\n\nTop Products:\n${result.data.products.map((p: any) => `• ${p.title} - ${p.sales} sales ($${p.revenue})`).join('\n')}`;
      
      case 'getCoinsBalance':
        return `💰 Flow Coins: ${result.data.balance.toLocaleString()}\n• Earned today: ${result.data.earned_today}\n• Pending: ${result.data.pending}`;
      
      case 'getEarningOpportunities':
        return `Ways to earn coins:\n${result.data.opportunities.map((o: any) => `${o.completed ? '✅' : '⭕'} ${o.task} - ${o.coins} coins`).join('\n')}`;
      
      case 'getSystemStatus':
        return `System Status: ${result.data.status}\n• Campaigns: ${result.data.campaigns.total} (${result.data.campaigns.active} active)\n• Products: ${result.data.products.total}\n• Revenue Today: $${result.data.revenue_today}\n• Coins: ${result.data.coins_balance}\n• Scheduled Posts: ${result.data.scheduled_posts}\n• Upcoming Tasks: ${result.data.upcoming_tasks}`;
      
      case 'help':
        if (result.data.navigation) {
          return `Available actions:\n\n📍 Navigate: ${result.data.navigation.join(', ')}\n📊 Campaigns: ${result.data.campaigns.join(', ')}\n📦 Products: ${result.data.products.join(', ')}\n📈 Analytics: ${result.data.analytics.join(', ')}\n✨ Content: ${result.data.content.join(', ')}\n📅 FlowChart: ${result.data.flowchart.join(', ')}\n💰 Coins: ${result.data.flowcoins.join(', ')}\n⚙️ System: ${result.data.system.join(', ')}\n\nJust ask naturally!`;
        }
        return result.message;
      
      default:
        return result.message;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Call the FlowBot AI flow
      const response = await fetch('/api/flowbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: input,
          history: messages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('FlowBot API error:', response.status, errorData);
        throw new Error(errorData.error || errorData.details || `Failed to get response (${response.status})`);
      }

      const { answer, action } = await response.json();
      
      // Add AI response
      const botMessage: Message = {
        role: 'model',
        text: answer || 'Sorry, I couldn\'t generate a response.',
      };
      setMessages(prev => [...prev, botMessage]);

      // Execute action if present
      if (action) {
        console.log('Executing action:', action);
        const result = await executeFlowBotAction(action.type, action.parameters || {});
        
        if (result.success && result.data) {
          // Show action result
          const resultMessage: Message = {
            role: 'model',
            text: formatActionResult(action.type, result),
          };
          setMessages(prev => [...prev, resultMessage]);
        }
      }

    } catch (error) {
      console.error('FlowBot error:', error);
      const errorMessage: Message = {
        role: 'model',
        text: 'Sorry, I had trouble with that request. Could you try rephrasing? I can help with trending products, content ideas, and affiliate marketing tips! 💡',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          height: '80vh',
          maxHeight: '600px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SmartToyIcon />
          <Typography variant="h6">Flow Assistant</Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'flex-start',
                flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
              }}
            >
              <Avatar
                sx={{
                  bgcolor: message.role === 'user' ? '#fff' : 'rgba(255,255,255,0.2)',
                  color: message.role === 'user' ? '#667eea' : '#fff',
                  width: 32,
                  height: 32,
                }}
              >
                {message.role === 'user' ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
              </Avatar>
              <Paper
                sx={{
                  p: 2,
                  maxWidth: '75%',
                  bgcolor: message.role === 'user' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.15)',
                  color: message.role === 'user' ? '#333' : '#fff',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {message.text}
                </Typography>
              </Paper>
            </Box>
          ))}
          {loading && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 32, height: 32 }}>
                <SmartToyIcon fontSize="small" />
              </Avatar>
              <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
                <CircularProgress size={20} sx={{ color: 'white' }} />
              </Paper>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
          <TextField
            fullWidth
            multiline
            maxRows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Flow anything..."
            disabled={loading}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255,255,255,0.95)',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={loading || !input.trim()}
            sx={{
              bgcolor: 'white',
              color: '#667eea',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
              minWidth: '56px',
            }}
          >
            <SendIcon />
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
