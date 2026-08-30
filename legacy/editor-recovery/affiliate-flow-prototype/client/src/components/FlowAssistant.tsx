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
import { Box, Fab, Tooltip, Zoom, Badge } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import FlowBotDialog from './FlowBotDialog';

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

  // Generate dynamic tooltip based on user state
  const getTooltip = () => {
    return '✨ Flow Assistant - Your AI Marketing Partner';
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
                  // Dynamic gradient based on state
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
                  },
                  padding: '4px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
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
                    border: '3px solid rgba(255, 255, 255, 0.9)',
                    backgroundColor: '#f0f0f0',
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
