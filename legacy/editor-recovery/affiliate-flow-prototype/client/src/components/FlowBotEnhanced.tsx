'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Box,
  TextField,
  IconButton,
  Typography,
  Chip,
  Avatar,
  Paper,
  CircularProgress,
  Tooltip,
  Button,
  Divider,
} from '@mui/material';
import {
  Send,
  Close,
  Lightbulb,
  TrendingUp,
  AutoAwesome,
  Psychology,
  Speed,
  Refresh,
} from '@mui/icons-material';
import { advancedAIService, type PredictiveInsight, type TrendForecast } from '@/services/advanced-ai-service';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface FlowBotEnhancedProps {
  open: boolean;
  onClose: () => void;
  userContext?: {
    campaigns?: any[];
    products?: any[];
    analytics?: any;
  };
}

export default function FlowBotEnhanced({ open, onClose, userContext }: FlowBotEnhancedProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "👋 Hi! I'm your enhanced AI assistant with predictive insights and conversation memory. How can I help you optimize your affiliate marketing today?",
      timestamp: new Date(),
      suggestions: [
        'Show me predictive insights',
        'What are trending products?',
        'Recommend automations',
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const [showInsights, setShowInsights] = useState(false);
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [trends, setTrends] = useState<TrendForecast[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await advancedAIService.chat(
        'user-123', // Replace with actual user ID
        input,
        {
          sessionId,
          userData: userContext,
        }
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        suggestions: response.suggestions,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I'm having trouble processing that. Could you try rephrasing?",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const loadPredictiveInsights = async () => {
    if (!userContext) return;
    
    setLoading(true);
    try {
      const predictedInsights = await advancedAIService.generatePredictiveInsights(
        userContext.campaigns || [],
        userContext.products || [],
        userContext.analytics || {}
      );
      setInsights(predictedInsights);
      setShowInsights(true);
    } catch (error) {
      console.error('Insights error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTrendForecasts = async () => {
    setLoading(true);
    try {
      const forecasts = await advancedAIService.forecastTrends();
      setTrends(forecasts);
      
      const trendMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `📊 I've analyzed market trends and found ${forecasts.length} opportunities. Here are the top forecasts:

${forecasts.slice(0, 3).map((t, i) => 
  `${i + 1}. **${t.category}** - ${t.trend === 'explosive' ? '🚀' : t.trend === 'rising' ? '📈' : '➡️'} ${t.trend.toUpperCase()}
   Current Score: ${t.currentScore}/100 → Predicted: ${t.predictedScore}/100
   Keywords: ${t.keywords.join(', ')}
`).join('\n')}

Would you like me to create campaigns around any of these trends?`,
        timestamp: new Date(),
        suggestions: [
          'Create campaign for ' + forecasts[0]?.category,
          'Show more trend details',
          'Find products for these trends',
        ],
      };
      
      setMessages(prev => [...prev, trendMessage]);
    } catch (error) {
      console.error('Trends error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <Lightbulb sx={{ color: 'success.main' }} />;
      case 'warning': return <Speed sx={{ color: 'warning.main' }} />;
      case 'trend': return <TrendingUp sx={{ color: 'info.main' }} />;
      default: return <AutoAwesome sx={{ color: 'primary.main' }} />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'success';
      case 'warning': return 'warning';
      case 'trend': return 'info';
      default: return 'primary';
    }
  };

  const resetConversation = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: "🔄 Conversation reset! I'm ready for a fresh start. What would you like to explore?",
        timestamp: new Date(),
        suggestions: [
          'Analyze my campaigns',
          'Find trending products',
          'Optimize my content',
        ],
      },
    ]);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          height: '80vh',
          background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
        },
      }}
    >
      <DialogHeader>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <Psychology />
            </Avatar>
            <Box>
              <DialogTitle sx={{ p: 0, m: 0 }}>FlowBot Enhanced</DialogTitle>
              <Typography variant="caption" color="text.secondary">
                AI Assistant with Conversation Memory & Predictive Insights
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Reset Conversation">
              <IconButton onClick={resetConversation} size="small">
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title="Predictive Insights">
              <IconButton onClick={loadPredictiveInsights} size="small" color="primary">
                <Lightbulb />
              </IconButton>
            </Tooltip>
            <Tooltip title="Trend Forecasts">
              <IconButton onClick={loadTrendForecasts} size="small" color="info">
                <TrendingUp />
              </IconButton>
            </Tooltip>
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </Box>
      </DialogHeader>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', p: 0 }}>
        {/* Messages Area */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 3, pb: 1 }}>
          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                mb: 2,
              }}
            >
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  maxWidth: '75%',
                  bgcolor: message.role === 'user' ? 'primary.main' : 'background.paper',
                  color: message.role === 'user' ? 'white' : 'text.primary',
                  borderRadius: 2,
                }}
              >
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {message.content}
                </Typography>
                
                {message.suggestions && message.suggestions.length > 0 && (
                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {message.suggestions.map((suggestion, idx) => (
                      <Chip
                        key={idx}
                        label={suggestion}
                        size="small"
                        onClick={() => handleSuggestionClick(suggestion)}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                      />
                    ))}
                  </Box>
                )}
                
                <Typography variant="caption" color={message.role === 'user' ? 'rgba(255,255,255,0.7)' : 'text.secondary'} sx={{ mt: 1, display: 'block' }}>
                  {message.timestamp.toLocaleTimeString()}
                </Typography>
              </Paper>
            </Box>
          ))}
          
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
              <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="body2">FlowBot is thinking...</Typography>
                </Box>
              </Paper>
            </Box>
          )}
          
          <div ref={messagesEndRef} />
        </Box>

        <Divider />

        {/* Input Area */}
        <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              placeholder="Ask me anything about your campaigns, products, or trends..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              disabled={loading}
              multiline
              maxRows={3}
              variant="outlined"
              size="small"
            />
            <IconButton 
              color="primary" 
              onClick={handleSend}
              disabled={!input.trim() || loading}
              sx={{ 
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
                '&:disabled': { bgcolor: 'action.disabledBackground' },
              }}
            >
              <Send />
            </IconButton>
          </Box>
        </Box>

        {/* Insights Panel */}
        {showInsights && insights.length > 0 && (
          <Paper sx={{ m: 2, p: 2, maxHeight: '300px', overflowY: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">🔮 Predictive Insights</Typography>
              <IconButton size="small" onClick={() => setShowInsights(false)}>
                <Close />
              </IconButton>
            </Box>
            
            {insights.map((insight, idx) => (
              <Paper key={idx} elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                <Box sx={{ display: 'flex', alignItems: 'start', gap: 1, mb: 1 }}>
                  {getInsightIcon(insight.type)}
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle2">{insight.title}</Typography>
                      <Chip 
                        label={`${insight.confidence}% confidence`} 
                        size="small" 
                        color={getInsightColor(insight.type) as any}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {insight.description}
                    </Typography>
                    
                    {insight.actionItems && insight.actionItems.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" fontWeight="bold">Action Items:</Typography>
                        <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                          {insight.actionItems.map((item, i) => (
                            <li key={i}>
                              <Typography variant="caption">{item}</Typography>
                            </li>
                          ))}
                        </ul>
                      </Box>
                    )}
                    
                    {insight.estimatedImpact && (
                      <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                        {insight.estimatedImpact.revenue && (
                          <Chip label={`💰 ${insight.estimatedImpact.revenue > 0 ? '+' : ''}${insight.estimatedImpact.revenue}% revenue`} size="small" />
                        )}
                        {insight.estimatedImpact.engagement && (
                          <Chip label={`👥 ${insight.estimatedImpact.engagement > 0 ? '+' : ''}${insight.estimatedImpact.engagement}% engagement`} size="small" />
                        )}
                      </Box>
                    )}
                  </Box>
                </Box>
              </Paper>
            ))}
          </Paper>
        )}
      </DialogContent>
    </Dialog>
  );
}
