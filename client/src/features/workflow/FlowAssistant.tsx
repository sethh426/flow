'use client';

/**
 * Flow Assistant - Enhanced AI Avatar Component
 * Features:
 * - Pulsing and glowing animations
 * - Real-time notification badge
 * - Dynamic tooltips based on user tier
 * - Interactive click handlers
 * - "Thinking" animation when processing
 */

import { useState, useEffect } from 'react';
import { Box, Fab, Tooltip, Zoom, Badge, Chip, Typography, Paper, Grow, Fade } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import FlowBotDialog from './FlowBotDialog';
import { useRouter, usePathname } from 'next/navigation';

// Pulsing shadow animation
const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7);
  }
  50% {
    box-shadow: 0 0 0 20px rgba(102, 126, 234, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0);
  }
`;

// Glowing aura animation
const glow = keyframes`
  0%, 100% {
    filter: drop-shadow(0 0 8px rgba(102, 126, 234, 0.5));
  }
  50% {
    filter: drop-shadow(0 0 20px rgba(102, 126, 234, 0.8));
  }
`;

// Rotation for "thinking" state
const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

// Styled image component
const AvatarImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: '50%',
});

interface FlowAssistantProps {
  onClick?: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: number;
  showNotifications?: boolean;
}

export default function FlowAssistant({ 
  onClick, 
  position = 'bottom-right',
  size = 80,
  showNotifications = true 
}: FlowAssistantProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [isThinking, setIsThinking] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState<string | null>(null);
  const [suggestionVisible, setSuggestionVisible] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Simulate dynamic notifications (replace with real Firebase listener)
  useEffect(() => {
    // Demo: Randomly add notifications
    const interval = setInterval(() => {
      if (Math.random() > 0.95) {
        setNotifications((prev) => Math.min(prev + 1, 9)); // Max 9
      }
    }, 15000); // Every 15 seconds

    return () => clearInterval(interval);
  }, []);

  // Proactive guidance system
  useEffect(() => {
    const getContextualSuggestion = () => {
      const hour = new Date().getHours();
      const isNewUser = !localStorage.getItem('flow-tutorial-completed');

      // Time-based suggestions
      if (hour >= 9 && hour <= 11) {
        return "🌅 Good morning! Ready to find trending products for today's campaigns?";
      } else if (hour >= 14 && hour <= 16) {
        return "⏰ Afternoon boost! Time to check your campaign performance and optimize.";
      } else if (hour >= 18 && hour <= 20) {
        return "🌆 Evening wrap-up! Let's review today's results and plan tomorrow's content.";
      }

      // Page-specific suggestions
      switch (pathname) {
        case '/':
        case '/dashboard':
          if (isNewUser) {
            return "👋 Welcome! Find trending products to start.";
          }
          return "📊 Dashboard loaded! Check your stats or create a new workflow to keep the momentum going.";
        
        case '/products':
          return "🛍️ Product catalog ready! Try searching for trending items or create affiliate content.";
        
        case '/workflows':
          return "⚡ Workflow Builder open! Design automated processes to streamline your affiliate marketing.";
        
        case '/content-studio':
          return "🎨 Content Studio active! Generate AI-powered content for your products and campaigns.";
        
        case '/campaigns':
          return "🚀 Campaign Manager ready! Launch new campaigns or optimize existing ones for better results.";
        
        case '/analytics':
          return "📈 Analytics dashboard! Dive deep into your performance data and discover insights.";
        
        default:
          return "💡 I'm here to help! Click me anytime for guidance on your next steps.";
      }
    };

    // Show suggestion after a delay
    const timer = setTimeout(() => {
      const suggestion = getContextualSuggestion();
      setCurrentSuggestion(suggestion);
      setSuggestionVisible(true);

      // Hide suggestion after 8 seconds
      setTimeout(() => {
        setSuggestionVisible(false);
        setTimeout(() => setCurrentSuggestion(null), 300); // Allow fade out
      }, 8000);
    }, 3000); // Show after 3 seconds on page load

    return () => clearTimeout(timer);
  }, [pathname]);

  // Generate dynamic tooltip based on user state
  // Generate dynamic tooltip based on context
  const getTooltip = () => {
    if (notifications > 0) {
      return `🔔 ${notifications} new update${notifications > 1 ? 's' : ''} - Click to see!`;
    }

    if (isThinking) {
      return '🤔 Processing your request...';
    }

    // Context-aware tooltips
    switch (pathname) {
      case '/':
      case '/dashboard':
        return '📊 Dashboard Guide - Click for personalized marketing tips!';
      case '/products':
        return '🛍️ Product Assistant - Find trending items and create content!';
      case '/workflows':
        return '⚡ Workflow Expert - Design automated marketing processes!';
      case '/content-studio':
        return '🎨 Content Creator - Generate AI-powered marketing materials!';
      case '/campaigns':
        return '🚀 Campaign Strategist - Launch and optimize affiliate campaigns!';
      case '/analytics':
        return '📈 Data Analyst - Uncover insights to boost performance!';
      case '/social-media':
        return '📱 Social Media Manager - Automate your social presence!';
      default:
        return '✨ Flow Assistant - Your AI Marketing Partner - Click for help!';
    }
  };

  // Calculate position
  const getPosition = () => {
    switch (position) {
      case 'bottom-right':
        return { bottom: 24, right: 24 };
      case 'bottom-left':
        return { bottom: 24, left: 24 };
      case 'top-right':
        return { top: 24, right: 24 };
      case 'top-left':
        return { top: 24, left: 24 };
      default:
        return { bottom: 24, right: 24 };
    }
  };

  // Handle click interaction
  const handleClick = () => {
    // Clear notifications
    setNotifications(0);
    
    if (onClick) {
      onClick();
    } else {
      // Open the FlowBot chat dialog
      setDialogOpen(true);
    }
  };

  return (
    <>
      <FlowBotDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
      
      {/* Proactive Suggestion Bubble */}
      {currentSuggestion && (
        <Fade in={suggestionVisible}>
          <Paper
            elevation={8}
            sx={{
              position: 'fixed',
              ...getPosition(),
              ...(position.includes('right') 
                ? { right: 100, top: '50%', transform: 'translateY(-50%)' }
                : { left: 100, top: '50%', transform: 'translateY(-50%)' }
              ),
              maxWidth: 280,
              p: 2,
              borderRadius: 3,
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(102, 126, 234, 0.2)',
              zIndex: 1301,
              '&::before': {
                content: '""',
                position: 'absolute',
                ...(position.includes('right') 
                  ? { right: -8, top: '50%', transform: 'translateY(-50%)' }
                  : { left: -8, top: '50%', transform: 'translateY(-50%)' }
                ),
                width: 0,
                height: 0,
                borderStyle: 'solid',
                borderWidth: '8px 8px 8px 0',
                borderColor: 'transparent rgba(255, 255, 255, 0.95) transparent transparent',
                filter: 'drop-shadow(2px 0 4px rgba(0,0,0,0.1))',
              },
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
              {currentSuggestion}
            </Typography>
          </Paper>
        </Fade>
      )}

      <Zoom in={true}>
        <Box
          sx={{
            position: 'fixed',
            ...getPosition(),
            zIndex: 1300, // Above drawer (1200) and AppBar (1201)
          }}
        >
          <Tooltip 
            title={getTooltip()} 
            placement={position.includes('right') ? 'left' : 'right'}
            arrow
          >
            <Badge 
              badgeContent={showNotifications ? notifications : 0} 
              color="error"
              overlap="circular"
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              sx={{
                '& .MuiBadge-badge': {
                  zIndex: 1002, // Above the FAB
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  minWidth: 20,
                  height: 20,
                  borderRadius: '10px',
                  border: '2px solid white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                },
              }}
            >
              <Fab
                onClick={handleClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                sx={{
                  width: size,
                  height: size,
                  // Vibrant gradient - always visible
                  background: isThinking
                    ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' // Pink when thinking
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple normal
                  // Dynamic animation
                  animation: isThinking
                    ? `${rotate} 1s linear infinite, ${glow} 0.5s infinite`
                    : `${pulse} 2s infinite, ${glow} 3s infinite`,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease, background 0.5s ease',
                  transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                  '&:hover': {
                    background: isThinking
                      ? 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)'
                      : 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                    transform: 'scale(1.15)',
                  },
                  padding: '4px',
                  boxShadow: '0 12px 32px rgba(102, 126, 234, 0.5), 0 4px 16px rgba(118, 75, 162, 0.3)',
                  border: '3px solid rgba(255, 255, 255, 0.95)',
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid rgba(255, 255, 255, 0.8)',
                    backgroundColor: '#ffffff',
                    boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <AvatarImage
                    src="/flow-avatar.png"
                    alt="Flow Assistant"
                    onError={(e) => {
                      console.error('Failed to load Flow avatar image at /flow-avatar.png');
                      // Fallback: show placeholder
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </Box>
              </Fab>
            </Badge>
          </Tooltip>
        </Box>
      </Zoom>
    </>
  );
}
