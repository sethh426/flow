'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useRouter } from 'next/navigation';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface FlowBotDialogProps {
  open: boolean;
  onClose: () => void;
}

const STARTER_PROMPTS = [
  'Help me choose a product to sell',
  'Plan my next campaign',
  'Review my performance',
];

const INITIAL_MESSAGE: Message = {
  role: 'model',
  text: 'Hi, I’m Flow. I can help you choose products, plan campaigns, understand performance, and find the right control page. This preview uses safe sample guidance until the live endpoints are connected.',
};

function getMockResponse(question: string): string {
  const normalized = question.toLowerCase();

  if (normalized.includes('sell') || normalized.includes('product')) {
    return 'Start with Product Intelligence. Pick one product with clear demand, a healthy margin, and content you can demonstrate visually. Then create one campaign and three content variants before expanding. Open Products from the left navigation when you are ready.';
  }
  if (normalized.includes('campaign')) {
    return 'A solid campaign starts with one audience, one offer, and one measurable goal. Build the offer in Campaigns, prepare the creative in Content Studio, then use Analytics to compare clicks, conversions, and revenue.';
  }
  if (normalized.includes('performance') || normalized.includes('analytics') || normalized.includes('revenue')) {
    return 'Use Analytics to compare conversion rate, revenue, and campaign-level attribution. The values currently shown are sample data, so treat them as layout and workflow examples until the Firebase endpoints are connected.';
  }
  if (normalized.includes('workflow') || normalized.includes('automat')) {
    return 'Open Workflows to map the trigger, approval step, publishing action, and reporting step. Keep the first workflow in draft mode until each connected service has passed its endpoint check.';
  }
  if (normalized.includes('trend')) {
    return 'Use Trends to shortlist opportunities, then validate margin and audience fit in Products. In mock mode, trend scores are examples and should not be used as live market evidence.';
  }

  return 'I can help with products, campaigns, trends, workflows, and performance. Tell me what you want to accomplish, and I’ll suggest the shortest safe path through the control center.';
}

export default function FlowBotDialog({ open, onClose }: FlowBotDialogProps) {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const isMockMode = (process.env.NEXT_PUBLIC_API_MODE || 'mock') !== 'live';

  useEffect(() => {
    const handleNavigate = (event: Event) => {
      const route = (event as CustomEvent<{ route?: string }>).detail?.route;
      if (!route) return;
      router.push(route);
      onClose();
    };

    window.addEventListener('flowbot-navigate', handleNavigate);
    return () => window.removeEventListener('flowbot-navigate', handleNavigate);
  }, [router, onClose]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, loading]);

  const sendMessage = async (prompt?: string) => {
    const question = (prompt ?? input).trim();
    if (!question || loading) return;

    const history = [...messages];
    setMessages((previous) => [...previous, { role: 'user', text: question }]);
    setInput('');
    setLoading(true);

    try {
      if (isMockMode) {
        await new Promise((resolve) => setTimeout(resolve, 350));
        setMessages((previous) => [...previous, { role: 'model', text: getMockResponse(question) }]);
        return;
      }

      const response = await fetch('/api/flowbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, history }),
      });

      if (!response.ok) throw new Error(`Flow Assistant request failed (${response.status})`);
      const payload = await response.json() as { answer?: string };
      setMessages((previous) => [
        ...previous,
        { role: 'model', text: payload.answer || 'I could not generate a response. Please try a shorter question.' },
      ]);
    } catch (error) {
      console.error('Flow Assistant error:', error);
      setMessages((previous) => [
        ...previous,
        {
          role: 'model',
          text: 'The live assistant endpoint is unavailable right now. You can still use the left navigation to open Products, Campaigns, Analytics, or Workflows.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{
        zIndex: 1600,
        '& .MuiDialog-container': {
          alignItems: { xs: 'stretch', sm: 'center' },
        },
        '& .MuiDialog-paper': {
          width: { xs: '100vw !important', sm: 'min(760px, calc(100vw - 32px))' },
          maxWidth: { xs: 'none !important', sm: '760px' },
          height: { xs: '100dvh', sm: 'min(680px, calc(100dvh - 32px))' },
          maxHeight: { xs: '100dvh', sm: 'calc(100dvh - 32px)' },
          margin: { xs: '0 !important', sm: '16px !important' },
          borderRadius: { xs: '0 !important', sm: '16px !important' },
        },
      }}
      fullWidth
      maxWidth="md"
      scroll="paper"
      aria-labelledby="flow-assistant-title"
      PaperProps={{
        className: 'flow-assistant-dialog',
        sx: {
          overflow: 'hidden !important',
          border: { sm: '1px solid rgba(148,163,184,0.22)' },
          backgroundColor: '#0b1120',
          backgroundImage: 'radial-gradient(circle at top left, rgba(126,34,206,0.18), transparent 38%)',
          color: 'white',
          boxShadow: '0 28px 80px rgba(2,6,23,0.55)',
        },
      }}
    >
      <DialogTitle
        id="flow-assistant-title"
        sx={{
          p: { xs: '16px !important', sm: '18px 20px !important' },
          borderBottom: '1px solid rgba(148,163,184,0.18)',
          background: 'linear-gradient(120deg, rgba(126,34,206,0.5), rgba(67,56,202,0.35), rgba(37,99,235,0.25))',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 38, height: 38, bgcolor: 'rgba(255,255,255,0.14)', color: 'white' }}>
            <SmartToyIcon fontSize="small" />
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography component="span" sx={{ display: 'block', color: 'white', fontWeight: 700, fontSize: '1.05rem' }}>
              Flow Assistant
            </Typography>
            <Typography component="span" sx={{ display: 'block', color: 'rgba(226,232,240,0.8)', fontSize: '0.75rem' }}>
              {isMockMode ? 'Preview guidance • no live actions' : 'Connected guidance'}
            </Typography>
          </Box>
          <IconButton onClick={onClose} aria-label="Close Flow Assistant" sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.08)', '&:hover': { bgcolor: 'rgba(255,255,255,0.16)' } }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ minHeight: 0, p: '0 !important', overflow: 'hidden !important' }}>
        <Box sx={{ display: 'flex', height: '100%', minHeight: 0, flexDirection: 'column' }}>
          <Box
            aria-live="polite"
            sx={{
              minHeight: 0,
              flex: 1,
              overflowY: 'auto',
              px: { xs: 2, sm: 2.5 },
              py: 2,
              overscrollBehavior: 'contain',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {messages.map((message, index) => (
                <Box key={`${message.role}-${index}`} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flexDirection: message.role === 'user' ? 'row-reverse' : 'row' }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: message.role === 'user' ? '#4f46e5' : 'rgba(148,163,184,0.16)', color: 'white' }}>
                    {message.role === 'user' ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
                  </Avatar>
                  <Paper
                    elevation={0}
                    sx={{
                      maxWidth: { xs: 'calc(100% - 42px)', sm: '78%' },
                      px: 1.75,
                      py: 1.25,
                      borderRadius: message.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                      bgcolor: message.role === 'user' ? '#4f46e5' : 'rgba(30,41,59,0.92)',
                      border: '1px solid',
                      borderColor: message.role === 'user' ? 'rgba(129,140,248,0.8)' : 'rgba(148,163,184,0.16)',
                      color: 'white',
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'inherit', whiteSpace: 'pre-wrap', lineHeight: 1.65, overflowWrap: 'anywhere' }}>
                      {message.text}
                    </Typography>
                  </Paper>
                </Box>
              ))}

              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(148,163,184,0.16)', color: 'white' }}>
                    <SmartToyIcon fontSize="small" />
                  </Avatar>
                  <Paper elevation={0} sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(30,41,59,0.92)', color: 'white', px: 1.5, py: 1, border: '1px solid rgba(148,163,184,0.16)' }}>
                    <CircularProgress size={16} sx={{ color: '#c4b5fd' }} />
                    <Typography variant="body2" sx={{ color: 'inherit' }}>Thinking…</Typography>
                  </Paper>
                </Box>
              ) : null}
              <div ref={messagesEndRef} />
            </Box>
          </Box>

          {messages.length === 1 ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' }, gap: 1, borderTop: '1px solid rgba(148,163,184,0.12)', px: { xs: 2, sm: 2.5 }, py: 1.25 }}>
              {STARTER_PROMPTS.map((prompt) => (
                <Button
                  key={prompt}
                  type="button"
                  size="small"
                  startIcon={<AutoAwesomeIcon fontSize="small" />}
                  onClick={() => sendMessage(prompt)}
                  sx={{ width: '100%', minWidth: 0, minHeight: '40px !important', padding: '6px 8px !important', borderRadius: 999, color: '#ddd6fe', border: '1px solid rgba(196,181,253,0.28)', bgcolor: 'rgba(76,29,149,0.16)', textTransform: 'none', fontSize: '0.8rem !important', lineHeight: '1.3 !important', whiteSpace: 'normal !important', overflow: 'hidden !important', '&:hover': { bgcolor: 'rgba(76,29,149,0.3)' } }}
                >
                  {prompt}
                </Button>
              ))}
            </Box>
          ) : null}
        </Box>
      </DialogContent>

      <DialogActions sx={{ display: 'block', borderTop: '1px solid rgba(148,163,184,0.18)', bgcolor: 'rgba(15,23,42,0.96)', p: '12px 16px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            minRows={1}
            maxRows={4}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask Flow about products, campaigns, or workflows…"
            disabled={loading}
            inputProps={{ 'aria-label': 'Message Flow Assistant' }}
            sx={{
              '& .MuiOutlinedInput-root': {
                minHeight: 48,
                bgcolor: '#111827',
                color: 'white',
                '& fieldset': { borderColor: 'rgba(148,163,184,0.28)' },
                '&:hover fieldset': { borderColor: 'rgba(196,181,253,0.55)' },
                '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
              },
              '& textarea::placeholder': { color: '#94a3b8', opacity: 1 },
            }}
          />
          <Button
            variant="contained"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            aria-label="Send message"
            sx={{
              minWidth: '48px !important',
              width: 48,
              height: 48,
              p: '0 !important',
              borderRadius: '12px !important',
              background: 'linear-gradient(135deg, #9333ea, #4f46e5, #2563eb)',
              '&:hover': { background: 'linear-gradient(135deg, #7e22ce, #4338ca, #1d4ed8)' },
            }}
          >
            <SendIcon />
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
