'use client';

/**
 * Flow Autopilot - Autonomous Agent Controller
 * 
 * This component makes Flow fly around the interface and control the app
 * like an MCP server, but with visual feedback!
 */

import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Fade, Zoom } from '@mui/material';
import { keyframes } from '@mui/material/styles';

interface FlowPosition {
  x: number;
  y: number;
}

interface FlowCommand {
  type: 'flyTo' | 'click' | 'type' | 'navigate' | 'think' | 'celebrate';
  target?: string;
  data?: any;
  message?: string;
}

interface FlowAutopilotProps {
  enabled?: boolean;
  onStatusChange?: (status: string) => void;
}

// Animation for particle trail
const particleTrail = keyframes`
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.5);
  }
`;

// Animation for thought bubble
const thoughtBubble = keyframes`
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.8);
  }
  50% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-10px) scale(0.8);
  }
`;

export default function FlowAutopilot({ enabled = false, onStatusChange }: FlowAutopilotProps) {
  const [position, setPosition] = useState<FlowPosition>({ x: window.innerWidth - 100, y: window.innerHeight - 100 });
  const [isFlying, setIsFlying] = useState(false);
  const [currentThought, setCurrentThought] = useState<string | null>(null);
  const [trail, setTrail] = useState<FlowPosition[]>([]);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  // Connect to backend orchestrator via WebSocket
  useEffect(() => {
    if (!enabled) return;

    // Use environment variable for WebSocket URL, fallback to localhost
    const wsUrl = process.env.NEXT_PUBLIC_FLOW_ORCHESTRATOR_WS 
      || (typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'ws://localhost:8080/flow-autopilot'
        : 'wss://flow-orchestrator-xxxxx-uc.a.run.app/flow-autopilot'); // Replace with actual Cloud Run URL after deployment

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('🤖 Flow Autopilot connected to orchestrator at', wsUrl);
      onStatusChange?.('connected');
    };

    ws.onmessage = (event) => {
      const command: FlowCommand = JSON.parse(event.data);
      handleCommand(command);
    };

    ws.onerror = (error) => {
      console.error('❌ Flow Autopilot connection error:', error);
      onStatusChange?.('error');
    };

    ws.onclose = () => {
      console.log('🔌 Flow Autopilot disconnected');
      onStatusChange?.('disconnected');
    };

    return () => {
      ws.close();
    };
  }, [enabled]);

  // Handle commands from backend
  const handleCommand = useCallback(async (command: FlowCommand) => {
    switch (command.type) {
      case 'think':
        showThought(command.message || 'Thinking...');
        break;
      
      case 'flyTo':
        if (command.target) {
          await flyToElement(command.target);
        }
        break;
      
      case 'click':
        if (command.target) {
          await clickElement(command.target);
        }
        break;
      
      case 'navigate':
        if (command.data?.route) {
          await navigateTo(command.data.route);
        }
        break;
      
      case 'celebrate':
        await celebrate(command.message);
        break;
    }
  }, []);

  // Show thought bubble
  const showThought = (message: string) => {
    setCurrentThought(message);
    setTimeout(() => setCurrentThought(null), 3000);
  };

  // Fly to an element
  const flyToElement = async (selector: string): Promise<void> => {
    return new Promise((resolve) => {
      const element = document.querySelector(selector) as HTMLElement;
      if (!element) {
        console.warn(`Element not found: ${selector}`);
        resolve();
        return;
      }

      const rect = element.getBoundingClientRect();
      const targetPos = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };

      setIsFlying(true);
      setTargetElement(element);

      // Create trail effect
      const trailInterval = setInterval(() => {
        setTrail((prev) => [...prev, { ...position }].slice(-10));
      }, 50);

      // Animate to position
      const duration = 1000;
      const start = Date.now();
      const startPos = { ...position };

      const animate = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-in-out)
        const eased = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        setPosition({
          x: startPos.x + (targetPos.x - startPos.x) * eased,
          y: startPos.y + (targetPos.y - startPos.y) * eased,
        });

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          clearInterval(trailInterval);
          setIsFlying(false);
          setTrail([]);
          
          // Highlight the element
          element.style.outline = '3px solid #667eea';
          element.style.outlineOffset = '4px';
          element.style.transition = 'all 0.3s ease';
          
          setTimeout(() => {
            element.style.outline = '';
            element.style.outlineOffset = '';
          }, 1000);
          
          resolve();
        }
      };

      animate();
    });
  };

  // Click an element
  const clickElement = async (selector: string): Promise<void> => {
    await flyToElement(selector);
    
    return new Promise((resolve) => {
      const element = document.querySelector(selector) as HTMLElement;
      if (element) {
        showThought('Clicking...');
        
        // Visual click effect
        const flash = document.createElement('div');
        flash.style.cssText = `
          position: fixed;
          left: ${position.x - 30}px;
          top: ${position.y - 30}px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(102,126,234,0.5) 0%, rgba(102,126,234,0) 70%);
          pointer-events: none;
          animation: flash 0.5s ease-out;
          z-index: 10000;
        `;
        document.body.appendChild(flash);
        
        setTimeout(() => {
          element.click();
          flash.remove();
          resolve();
        }, 300);
      } else {
        resolve();
      }
    });
  };

  // Navigate to a route
  const navigateTo = async (route: string): Promise<void> => {
    showThought(`Navigating to ${route}...`);
    await new Promise((resolve) => setTimeout(resolve, 500));
    window.location.href = route;
  };

  // Celebration animation
  const celebrate = async (message?: string): Promise<void> => {
    showThought(message || '🎉 Success!');
    
    // Create sparkles
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const sparkle = document.createElement('div');
        const angle = (Math.PI * 2 * i) / 10;
        const distance = 50;
        
        sparkle.innerHTML = '✨';
        sparkle.style.cssText = `
          position: fixed;
          left: ${position.x}px;
          top: ${position.y}px;
          font-size: 20px;
          pointer-events: none;
          z-index: 10000;
          animation: sparkle 1s ease-out forwards;
        `;
        
        document.body.appendChild(sparkle);
        
        setTimeout(() => {
          sparkle.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;
          sparkle.style.opacity = '0';
        }, 10);
        
        setTimeout(() => sparkle.remove(), 1000);
      }, i * 100);
    }
  };

  if (!enabled) return null;

  return (
    <>
      {/* Add CSS animations */}
      <style jsx global>{`
        @keyframes flash {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        
        @keyframes sparkle {
          0% { transform: translate(0, 0) scale(0); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(1); opacity: 0; }
        }
      `}</style>

      {/* Trail particles */}
      {trail.map((pos, i) => (
        <Box
          key={i}
          sx={{
            position: 'fixed',
            left: pos.x - 4,
            top: pos.y - 4,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            pointerEvents: 'none',
            zIndex: 9998,
            opacity: (i / trail.length) * 0.5,
            animation: `${particleTrail} 0.5s ease-out forwards`,
          }}
        />
      ))}

      {/* Flow Avatar */}
      <Zoom in={true}>
        <Box
          sx={{
            position: 'fixed',
            left: position.x - 40,
            top: position.y - 40,
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: isFlying
              ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: isFlying
              ? '0 8px 32px rgba(240, 147, 251, 0.6)'
              : '0 8px 24px rgba(102, 126, 234, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            transform: isFlying ? 'scale(1.2)' : 'scale(1)',
            zIndex: 9999,
            pointerEvents: 'none',
            border: '3px solid rgba(255, 255, 255, 0.9)',
          }}
        >
          <Box
            component="img"
            src="/flow-avatar.png"
            alt="Flow Autopilot"
            sx={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
        </Box>
      </Zoom>

      {/* Thought Bubble */}
      <Fade in={!!currentThought}>
        <Box
          sx={{
            position: 'fixed',
            left: position.x + 50,
            top: position.y - 60,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: '12px 16px',
            borderRadius: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            maxWidth: '200px',
            zIndex: 10000,
            pointerEvents: 'none',
            animation: `${thoughtBubble} 3s ease-in-out`,
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-10px',
              left: '20px',
              width: 0,
              height: 0,
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderTop: '10px solid rgba(255, 255, 255, 0.95)',
            },
          }}
        >
          <Typography variant="body2" color="text.primary">
            {currentThought}
          </Typography>
        </Box>
      </Fade>

      {/* Target element highlight ring */}
      {targetElement && (
        <Box
          sx={{
            position: 'fixed',
            left: targetElement.getBoundingClientRect().left - 10,
            top: targetElement.getBoundingClientRect().top - 10,
            width: targetElement.getBoundingClientRect().width + 20,
            height: targetElement.getBoundingClientRect().height + 20,
            border: '3px solid #667eea',
            borderRadius: '8px',
            pointerEvents: 'none',
            zIndex: 9997,
            animation: 'pulse 1s infinite',
          }}
        />
      )}
    </>
  );
}
