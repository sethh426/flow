'use client';

import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Tabs,
  Tab,
  Paper,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

// Affiliate Flow Branded Emoji Library
const BRANDED_EMOJIS = {
  marketing: [
    { id: 'af-chart-up', emoji: '📈', name: 'Growth Chart', border: '#667eea' },
    { id: 'af-dollar', emoji: '💰', name: 'Money Bag', border: '#10b981' },
    { id: 'af-target', emoji: '🎯', name: 'Target', border: '#f59e0b' },
    { id: 'af-rocket', emoji: '🚀', name: 'Rocket Launch', border: '#667eea' },
    { id: 'af-megaphone', emoji: '📢', name: 'Megaphone', border: '#ef4444' },
    { id: 'af-trending', emoji: '📊', name: 'Trending Up', border: '#667eea' },
    { id: 'af-bullseye', emoji: '🎪', name: 'Performance', border: '#8b5cf6' },
    { id: 'af-fire', emoji: '🔥', name: 'Hot Deal', border: '#f97316' },
  ],
  ecommerce: [
    { id: 'af-cart', emoji: '🛒', name: 'Shopping Cart', border: '#3b82f6' },
    { id: 'af-package', emoji: '📦', name: 'Package', border: '#8b5cf6' },
    { id: 'af-tag', emoji: '🏷️', name: 'Price Tag', border: '#10b981' },
    { id: 'af-gift', emoji: '🎁', name: 'Gift Box', border: '#ec4899' },
    { id: 'af-credit-card', emoji: '💳', name: 'Credit Card', border: '#6366f1' },
    { id: 'af-delivery', emoji: '🚚', name: 'Delivery', border: '#f59e0b' },
    { id: 'af-star', emoji: '⭐', name: 'Star Rating', border: '#eab308' },
    { id: 'af-shopping-bag', emoji: '🛍️', name: 'Shopping Bags', border: '#ec4899' },
  ],
  social: [
    { id: 'af-heart', emoji: '❤️', name: 'Heart', border: '#ef4444' },
    { id: 'af-thumbs-up', emoji: '👍', name: 'Thumbs Up', border: '#3b82f6' },
    { id: 'af-comment', emoji: '💬', name: 'Comment', border: '#667eea' },
    { id: 'af-share', emoji: '🔗', name: 'Share', border: '#10b981' },
    { id: 'af-camera', emoji: '📸', name: 'Camera', border: '#8b5cf6' },
    { id: 'af-video', emoji: '🎥', name: 'Video', border: '#ef4444' },
    { id: 'af-trophy', emoji: '🏆', name: 'Trophy', border: '#eab308' },
    { id: 'af-crown', emoji: '👑', name: 'Crown', border: '#f59e0b' },
  ],
  celebration: [
    { id: 'af-party', emoji: '🎉', name: 'Party Popper', border: '#ec4899' },
    { id: 'af-sparkles', emoji: '✨', name: 'Sparkles', border: '#eab308' },
    { id: 'af-confetti', emoji: '🎊', name: 'Confetti Ball', border: '#8b5cf6' },
    { id: 'af-tada', emoji: '🎈', name: 'Balloon', border: '#ef4444' },
    { id: 'af-medal', emoji: '🏅', name: 'Medal', border: '#f59e0b' },
    { id: 'af-clap', emoji: '👏', name: 'Clapping', border: '#3b82f6' },
    { id: 'af-celebrate', emoji: '🥳', name: 'Celebrating', border: '#ec4899' },
    { id: 'af-champagne', emoji: '🍾', name: 'Champagne', border: '#6366f1' },
  ],
  business: [
    { id: 'af-briefcase', emoji: '💼', name: 'Briefcase', border: '#1f2937' },
    { id: 'af-handshake', emoji: '🤝', name: 'Handshake', border: '#10b981' },
    { id: 'af-lightbulb', emoji: '💡', name: 'Idea', border: '#eab308' },
    { id: 'af-brain', emoji: '🧠', name: 'Brain', border: '#8b5cf6' },
    { id: 'af-check', emoji: '✅', name: 'Check Mark', border: '#10b981' },
    { id: 'af-laptop', emoji: '💻', name: 'Laptop', border: '#667eea' },
    { id: 'af-phone', emoji: '📱', name: 'Mobile', border: '#3b82f6' },
    { id: 'af-calendar', emoji: '📅', name: 'Calendar', border: '#ef4444' },
  ],
  emotions: [
    { id: 'af-smile', emoji: '😊', name: 'Smile', border: '#eab308' },
    { id: 'af-love', emoji: '😍', name: 'Heart Eyes', border: '#ef4444' },
    { id: 'af-wow', emoji: '😮', name: 'Wow', border: '#3b82f6' },
    { id: 'af-cool', emoji: '😎', name: 'Cool', border: '#1f2937' },
    { id: 'af-thinking', emoji: '🤔', name: 'Thinking', border: '#8b5cf6' },
    { id: 'af-wink', emoji: '😉', name: 'Wink', border: '#f59e0b' },
    { id: 'af-laugh', emoji: '😂', name: 'Laugh', border: '#eab308' },
    { id: 'af-excited', emoji: '🤩', name: 'Star Struck', border: '#ec4899' },
  ],
  food: [
    { id: 'af-pizza', emoji: '🍕', name: 'Pizza', border: '#f97316' },
    { id: 'af-burger', emoji: '🍔', name: 'Burger', border: '#f59e0b' },
    { id: 'af-coffee', emoji: '☕', name: 'Coffee', border: '#78350f' },
    { id: 'af-cake', emoji: '🍰', name: 'Cake', border: '#ec4899' },
    { id: 'af-avocado', emoji: '🥑', name: 'Avocado', border: '#10b981' },
    { id: 'af-sushi', emoji: '🍣', name: 'Sushi', border: '#ef4444' },
    { id: 'af-wine', emoji: '🍷', name: 'Wine', border: '#991b1b' },
    { id: 'af-donut', emoji: '🍩', name: 'Donut', border: '#ec4899' },
  ],
  travel: [
    { id: 'af-airplane', emoji: '✈️', name: 'Airplane', border: '#3b82f6' },
    { id: 'af-beach', emoji: '🏖️', name: 'Beach', border: '#06b6d4' },
    { id: 'af-mountain', emoji: '⛰️', name: 'Mountain', border: '#6b7280' },
    { id: 'af-camera-travel', emoji: '📷', name: 'Camera', border: '#8b5cf6' },
    { id: 'af-globe', emoji: '🌍', name: 'Globe', border: '#10b981' },
    { id: 'af-compass', emoji: '🧭', name: 'Compass', border: '#ef4444' },
    { id: 'af-luggage', emoji: '🧳', name: 'Luggage', border: '#f59e0b' },
    { id: 'af-sunset', emoji: '🌅', name: 'Sunset', border: '#f97316' },
  ],
  tech: [
    { id: 'af-robot', emoji: '🤖', name: 'Robot', border: '#667eea' },
    { id: 'af-battery', emoji: '🔋', name: 'Battery', border: '#10b981' },
    { id: 'af-wifi', emoji: '📡', name: 'WiFi', border: '#3b82f6' },
    { id: 'af-headphones', emoji: '🎧', name: 'Headphones', border: '#8b5cf6' },
    { id: 'af-keyboard', emoji: '⌨️', name: 'Keyboard', border: '#1f2937' },
    { id: 'af-cloud', emoji: '☁️', name: 'Cloud', border: '#06b6d4' },
    { id: 'af-game', emoji: '🎮', name: 'Gaming', border: '#ef4444' },
    { id: 'af-code', emoji: '💻', name: 'Code', border: '#10b981' },
  ],
};

interface BrandedEmojiPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (emoji: string, borderColor: string) => void;
}

export default function BrandedEmojiPicker({ open, onClose, onSelect }: BrandedEmojiPickerProps) {
  const [currentTab, setCurrentTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentEmojis, setRecentEmojis] = useState<Array<{ emoji: string; border: string; name: string }>>([]);
  const [emojiSize, setEmojiSize] = useState(64);

  // Load recent emojis from localStorage
  React.useEffect(() => {
    const stored = localStorage.getItem('af-recent-emojis');
    if (stored) {
      try {
        setRecentEmojis(JSON.parse(stored));
      } catch (e) {
        // Invalid JSON, ignore
      }
    }
  }, []);

  const categories = ['recent', ...Object.keys(BRANDED_EMOJIS)];
  
  let emojis: Array<{ id?: string; emoji: string; name: string; border: string }> = [];
  if (currentTab === 0) {
    emojis = recentEmojis;
  } else {
    const categoryKey = categories[currentTab] as keyof typeof BRANDED_EMOJIS;
    emojis = BRANDED_EMOJIS[categoryKey];
  }

  const filteredEmojis = searchQuery
    ? emojis.filter((e: { name: string }) => e.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : emojis;

  const handleSelect = (emoji: string, borderColor: string, name: string) => {
    // Add to recent emojis
    const newRecent = [
      { emoji, border: borderColor, name },
      ...recentEmojis.filter(e => e.emoji !== emoji).slice(0, 7) // Keep last 8
    ];
    setRecentEmojis(newRecent);
    localStorage.setItem('af-recent-emojis', JSON.stringify(newRecent));
    
    onSelect(emoji, borderColor);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6">Affiliate Flow Emoji Library</Typography>
            <Typography variant="caption" color="text.secondary">
              Branded emojis with custom borders for your content
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Search emojis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <Box sx={{ minWidth: 200 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Emoji Size: {emojiSize}px
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption">S</Typography>
              <input
                type="range"
                min="32"
                max="128"
                value={emojiSize}
                onChange={(e) => setEmojiSize(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
              <Typography variant="caption">L</Typography>
            </Box>
          </Box>
        </Box>

        <Tabs
          value={currentTab}
          onChange={(e, v) => setCurrentTab(v)}
          sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
          variant="scrollable"
          scrollButtons="auto"
        >
          {categories.map((category) => (
            <Tab key={category} label={category.charAt(0).toUpperCase() + category.slice(1)} />
          ))}
        </Tabs>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 2,
          }}
        >
          {filteredEmojis.map((item: { id?: string; emoji: string; name: string; border: string }) => (
            <Paper
              key={item.id || item.emoji}
              sx={{
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: 3,
                  borderColor: 'transparent',
                  '&:hover': {
                    borderColor: item.border,
                    transform: 'scale(1.05)',
                    boxShadow: `0 0 20px ${item.border}40`,
                  },
                }}
                onClick={() => handleSelect(item.emoji, item.border, item.name)}
              >
                <Box
                  sx={{
                    fontSize: `${emojiSize}px`,
                    mb: 1,
                    filter: `drop-shadow(0 0 8px ${item.border}80)`,
                  }}
                >
                  {item.emoji}
                </Box>
                <Typography variant="caption" display="block" noWrap>
                  {item.name}
                </Typography>
                <Box
                  sx={{
                    width: 16,
                    height: 3,
                    bgcolor: item.border,
                    margin: '4px auto 0',
                  borderRadius: 1,
                }}
              />
            </Paper>
          ))}
        </Box>        {filteredEmojis.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography color="text.secondary">No emojis found</Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Export individual branded emoji component for use in canvas
export function BrandedEmoji({ emoji, borderColor, size = 64 }: { emoji: string; borderColor: string; size?: number }) {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size,
        border: 4,
        borderColor: borderColor,
        borderRadius: 2,
        padding: 1,
        background: `linear-gradient(135deg, ${borderColor}10, ${borderColor}05)`,
        boxShadow: `0 4px 12px ${borderColor}30`,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: -2,
          borderRadius: 2,
          padding: 2,
          background: `linear-gradient(135deg, ${borderColor}, ${borderColor}80)`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        },
      }}
    >
      {emoji}
    </Box>
  );
}
