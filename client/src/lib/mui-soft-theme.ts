import { createTheme, alpha } from '@mui/material/styles';

/**
 * Soft & Subtle MUI Theme
 * Easy on the eyes with gentle colors, smooth gradients, and pristine charts
 */

export const softMuiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6366f1',
      light: '#818cf8',
      dark: '#4f46e5',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#8b5cf6',
      light: '#a78bfa',
      dark: '#7c3aed',
      contrastText: '#ffffff',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    info: {
      main: '#06b6d4',
      light: '#22d3ee',
      dark: '#0891b2',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#334155',
    },
  },
  
  typography: {
    fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    // Display - Extra large headlines
    h1: {
      fontWeight: 800,
      fontSize: 'clamp(2rem, 5vw, 3rem)',
      letterSpacing: '-0.03em',
      lineHeight: 1.1,
      color: '#0f172a',
    },
    // Section Headlines
    h2: {
      fontWeight: 700,
      fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
      color: '#0f172a',
    },
    // Subsection Titles
    h3: {
      fontWeight: 700,
      fontSize: 'clamp(1.5rem, 3vw, 1.875rem)',
      letterSpacing: '-0.01em',
      lineHeight: 1.25,
      color: '#0f172a',
    },
    // Card/Component Headlines
    h4: {
      fontWeight: 600,
      fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)',
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
      color: '#0f172a',
    },
    // Small Headlines
    h5: {
      fontWeight: 600,
      fontSize: 'clamp(1.125rem, 2vw, 1.25rem)',
      letterSpacing: 0,
      lineHeight: 1.4,
      color: '#0f172a',
    },
    // Label-style Headlines
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      letterSpacing: '0.01em',
      lineHeight: 1.5,
      color: '#334155',
    },
    // Body text - Optimized for reading
    body1: {
      fontSize: '1rem',
      lineHeight: 1.75,
      letterSpacing: '0.01em',
      color: '#334155',
    },
    // Smaller body text
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      letterSpacing: '0.01em',
      color: '#64748b',
    },
    // Caption/metadata text
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
      letterSpacing: '0.02em',
      color: '#94a3b8',
    },
    // Button text
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.025em',
      fontSize: '0.875rem',
    },
    // Overline/labels
    overline: {
      fontWeight: 600,
      fontSize: '0.75rem',
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      color: '#64748b',
    },
    // Subtitle variations
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.75,
      letterSpacing: '0.01em',
      color: '#334155',
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.6,
      letterSpacing: '0.01em',
      color: '#64748b',
    },
  },
  
  shape: {
    borderRadius: 12,
  },
  
  shadows: [
    'none',
    '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  ],
  
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '0.75rem',
          padding: '0.625rem 1.25rem',
          fontSize: '0.875rem',
          fontWeight: 600,
          boxShadow: 'none',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
          },
        },
      },
    },
    
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '1rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            borderColor: 'rgba(203, 213, 225, 0.8)',
          },
        },
      },
    },
    
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '1rem',
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        },
        elevation2: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
        elevation3: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem',
          fontWeight: 500,
          fontSize: '0.8125rem',
        },
      },
    },
    
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '0.75rem',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#cbd5e1',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: '2px',
            },
          },
        },
      },
    },
  },
});

/**
 * Soft Chart Color Palette
 * Gentle, muted colors that are easy on the eyes
 */
export const softChartColors = {
  // Primary gradient colors
  primary: ['#818cf8', '#6366f1', '#4f46e5', '#4338ca'],
  
  // Secondary/purple gradient
  secondary: ['#a78bfa', '#8b5cf6', '#7c3aed', '#6d28d9'],
  
  // Multi-color palette for diverse charts
  palette: [
    '#818cf8', // Soft indigo
    '#34d399', // Soft emerald
    '#fbbf24', // Soft amber
    '#f87171', // Soft red
    '#a78bfa', // Soft purple
    '#22d3ee', // Soft cyan
    '#fb923c', // Soft orange
    '#ec4899', // Soft pink
    '#10b981', // Soft green
    '#06b6d4', // Soft blue
  ],
  
  // Subtle background gradients for chart areas
  backgroundGradients: [
    'linear-gradient(180deg, rgba(129, 140, 248, 0.1) 0%, rgba(129, 140, 248, 0.02) 100%)',
    'linear-gradient(180deg, rgba(52, 211, 153, 0.1) 0%, rgba(52, 211, 153, 0.02) 100%)',
    'linear-gradient(180deg, rgba(251, 191, 36, 0.1) 0%, rgba(251, 191, 36, 0.02) 100%)',
    'linear-gradient(180deg, rgba(248, 113, 113, 0.1) 0%, rgba(248, 113, 113, 0.02) 100%)',
  ],
  
  // Success/warning/error states
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4',
};

/**
 * Chart Configuration for Soft, Pristine Look
 */
export const softChartConfig = {
  // Soft grid lines
  grid: {
    stroke: '#e2e8f0',
    strokeWidth: 1,
    strokeDasharray: '3 3',
  },
  
  // Smooth axis styling
  axis: {
    stroke: '#cbd5e1',
    strokeWidth: 1.5,
  },
  
  // Tick styling
  tick: {
    fill: '#64748b',
    fontSize: 12,
    fontWeight: 500,
  },
  
  // Legend styling
  legend: {
    fill: '#334155',
    fontSize: 13,
    fontWeight: 500,
  },
  
  // Tooltip styling
  tooltip: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '0.75rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    padding: '12px 16px',
    fontSize: 13,
    fontWeight: 500,
  },
  
  // Animation settings for smooth transitions
  animation: {
    duration: 800,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};
