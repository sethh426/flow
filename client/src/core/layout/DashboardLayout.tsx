'use client';

import { useState, ReactNode, useEffect } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Chip,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Collapse,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CampaignIcon from '@mui/icons-material/Campaign';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BrushIcon from '@mui/icons-material/Brush';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InsightsIcon from '@mui/icons-material/Insights';
import ScienceIcon from '@mui/icons-material/Science';
import LogoutIcon from '@mui/icons-material/Logout';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ImageIcon from '@mui/icons-material/Image';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import { logOut } from '@/lib/auth';
import ThemeToggle from '@/components/ThemeToggle';

const DRAWER_WIDTH = 280;

interface NavigationItem {
  id: number;
  label: string;
  icon: React.ReactElement;
  badge?: number;
  description?: string;
}

interface NavigationCategory {
  label: string;
  items: NavigationItem[];
  icon?: React.ReactElement;
}

const navigationCategories: NavigationCategory[] = [
  {
    label: 'Core',
    icon: <DashboardIcon />,
    items: [
      { id: 0, label: 'Dashboard', icon: <DashboardIcon />, description: 'Overview & insights' },
      { id: 1, label: 'Campaigns', icon: <CampaignIcon />, badge: 3, description: 'Manage campaigns' },
      { id: 2, label: 'Products', icon: <ShoppingCartIcon />, description: 'Product catalog' },
    ],
  },
  {
    label: 'AI Studio',
    icon: <AutoAwesomeIcon />,
    items: [
      { id: 3, label: 'Content Studio', icon: <BrushIcon />, description: 'AI content & images' },
      { id: 4, label: 'Trend Finder', icon: <TrendingUpIcon />, badge: 5, description: 'Discover trends' },
      { id: 11, label: 'Printify Studio', icon: <LocalPrintshopIcon />, description: 'Print-on-Demand products' },
    ],
  },
  {
    label: 'Automation',
    icon: <AccountTreeIcon />,
    items: [
      { id: 9, label: 'Workflows', icon: <AccountTreeIcon />, badge: 2, description: 'Automation flows' },
      { id: 10, label: 'Scheduler', icon: <ScheduleIcon />, description: 'Schedule posts' },
    ],
  },
  {
    label: 'Analytics',
    icon: <InsightsIcon />,
    items: [
      { id: 5, label: 'Analytics', icon: <InsightsIcon />, description: 'Performance metrics' },
      { id: 6, label: 'A/B Testing', icon: <ScienceIcon />, description: 'Test & optimize' },
    ],
  },
];

// Intelligent context-aware suggestions
const getSuggestedNext = (currentTab: number): string => {
  const suggestions: Record<number, string> = {
    0: 'Next: Find Trends',           // From Overview → Find trends
    1: 'Next: Create Content',        // From Campaigns → Create content
    2: 'Next: Create Content',        // From Products → Create content
    3: 'Next: View Analytics',        // From Content → Check analytics
    4: 'Next: Add Products',          // From Trends → Add products
    5: 'Next: Run A/B Test',          // From Analytics → Test variations
    6: 'Next: View Analytics',        // From A/B → Check results
    7: 'Next: View Flow Coins',       // From FlowChart → Check rewards
    8: 'Next: Find Trends',           // From Flow Coins → Find trends
    9: 'Next: Create Campaign',       // From Workflows → Create campaign
  };
  return suggestions[currentTab] || 'Next: Overview';
};

const getNextSuggestedTab = (currentTab: number): number => {
  const nextTab: Record<number, number> = {
    0: 4, // Overview → Trend Finder
    1: 3, // Campaigns → Content Studio
    2: 3, // Products → Content Studio
    3: 5, // Content → Analytics
    4: 2, // Trends → Products
    5: 6, // Analytics → A/B Testing
    6: 5, // A/B → Analytics
    7: 8, // FlowChart → Flow Coins
    8: 4, // Flow Coins → Trend Finder
    9: 1, // Workflows → Campaigns
  };
  return nextTab[currentTab] || 0;
};

interface DashboardLayoutProps {
  children: ReactNode;
  currentTab: number;
  onTabChange: (tab: number) => void;
  user?: any;
}

export default function DashboardLayout({ children, currentTab, onTabChange, user }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Core': true,
    'AI Studio': true,
    'Automation': false,
    'Analytics': false,
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const handleSignOut = async () => {
    await logOut();
    handleProfileMenuClose();
  };

  // Keyboard shortcuts for navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only handle keyboard shortcuts if user is not typing in an input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Alt+number shortcuts for quick navigation
      if (event.altKey && !event.shiftKey && !event.ctrlKey) {
        const num = parseInt(event.key);
        if (!isNaN(num) && num >= 0 && num <= 9) {
          event.preventDefault();
          onTabChange(num);
        }
      }

      // Alt+M to toggle mobile menu
      if (event.altKey && event.key.toLowerCase() === 'm') {
        event.preventDefault();
        handleDrawerToggle();
      }

      // Alt+N for notifications
      if (event.altKey && event.key.toLowerCase() === 'n' && notificationsAnchor === null) {
        event.preventDefault();
        const notifButton = document.querySelector('[aria-label="View notifications"]') as HTMLElement;
        if (notifButton) {
          notifButton.click();
        }
      }

      // Escape to close menus
      if (event.key === 'Escape') {
        if (mobileOpen) setMobileOpen(false);
        if (anchorEl) setAnchorEl(null);
        if (notificationsAnchor) setNotificationsAnchor(null);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [mobileOpen, anchorEl, notificationsAnchor, onTabChange]);

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#1a1f2e' }}>
      {/* Logo */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 800,
            fontSize: '1.3rem',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
          }}
        >
          AF
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'white', lineHeight: 1.2 }}>
            Affiliate Flow
          </Typography>
          <Typography variant="caption" sx={{ color: '#93c5fd' }}>
            Marketing Platform
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, px: 2, py: 2, overflowY: 'auto' }} className="stagger-children">
        {navigationCategories.map((category) => (
          <Box key={category.label} sx={{ mb: 3 }}>
            {/* Category Header */}
            <ListItemButton
              onClick={() => toggleCategory(category.label)}
              aria-label={`${category.label} category`}
              aria-expanded={expandedCategories[category.label]}
              sx={{
                borderRadius: 2,
                mb: 1,
                py: { xs: 1.25, md: 1 },
                px: 1.5,
                minHeight: { xs: 48, md: 'auto' },
                bgcolor: 'rgba(255, 255, 255, 0.03)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                },
              }}
            >
              <ListItemIcon sx={{ color: '#667eea', minWidth: 36 }}>
                {category.icon}
              </ListItemIcon>
              <ListItemText
                primary={category.label}
                primaryTypographyProps={{
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  color: '#93c5fd',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              />
              {expandedCategories[category.label] ? (
                <ExpandLess sx={{ color: 'rgba(255,255,255,0.4)' }} />
              ) : (
                <ExpandMore sx={{ color: 'rgba(255,255,255,0.4)' }} />
              )}
            </ListItemButton>

            {/* Category Items */}
            <Collapse in={expandedCategories[category.label]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {category.items.map((item) => (
                  <ListItemButton
                    key={item.id}
                    selected={currentTab === item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      if (isMobile) setMobileOpen(false);
                    }}
                    aria-label={`Navigate to ${item.label}`}
                    aria-current={currentTab === item.id ? 'page' : undefined}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      py: { xs: 1.5, md: 1.25 },
                      pl: 5,
                      minHeight: { xs: 48, md: 'auto' },
                      color: 'rgba(255,255,255,0.7)',
                      transition: 'all 0.2s ease',
                      '&.Mui-selected': {
                        bgcolor: 'linear-gradient(90deg, rgba(102, 126, 234, 0.25) 0%, rgba(118, 75, 162, 0.25) 100%)',
                        color: 'white',
                        boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                        borderLeft: '3px solid #667eea',
                        '&:hover': {
                          bgcolor: 'linear-gradient(90deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)',
                        },
                      },
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                        color: 'white',
                        transform: 'translateX(2px)',
                      },
                      '&:focus-visible': {
                        outline: '2px solid #667eea',
                        outlineOffset: 2,
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: currentTab === item.id ? '#667eea' : '#93c5fd', minWidth: 36 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      secondary={item.description}
                      primaryTypographyProps={{
                        fontWeight: currentTab === item.id ? 600 : 400,
                        fontSize: '0.9rem',
                        color: currentTab === item.id ? '#ffffff' : '#93c5fd',
                      }}
                      secondaryTypographyProps={{
                        fontSize: '0.7rem',
                        color: currentTab === item.id ? 'rgba(147, 197, 253, 0.9)' : 'rgba(147, 197, 253, 0.7)',
                      }}
                    />
                    {item.badge && (
                      <Chip
                        label={item.badge}
                        size="small"
                        sx={{
                          height: 20,
                          minWidth: 20,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          bgcolor: '#667eea',
                          color: 'white',
                          '& .MuiChip-label': {
                            px: 0.75,
                          },
                        }}
                      />
                    )}
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          </Box>
        ))}
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* User Section */}
      {user && (
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2,
              borderRadius: 2,
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              cursor: 'pointer',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.08)',
              },
            }}
            onClick={handleProfileMenuOpen}
          >
            <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main', boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)' }}>
              {user.email?.[0]?.toUpperCase() || 'U'}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.displayName || 'User'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#93c5fd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                {user.email}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      {/* Skip to Main Content Link - Accessibility */}
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: 'absolute',
          left: '-9999px',
          zIndex: 9999,
          padding: 2,
          bgcolor: 'primary.main',
          color: 'white',
          textDecoration: 'none',
          borderRadius: 1,
          '&:focus': {
            left: '50%',
            top: 2,
            transform: 'translateX(-50%)',
          },
        }}
      >
        Skip to main content
      </Box>

      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        component="header"
        role="banner"
        sx={{
          width: '100%',
          bgcolor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ gap: 2, minHeight: { xs: 56, sm: 64 } }}>
          {/* Menu Toggle Button - Mobile only */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
            aria-controls="navigation-drawer"
            sx={{ 
              mr: 2, 
              color: 'text.primary',
              display: { xs: 'flex', md: 'none' },
            }}
          >
            <MenuIcon />
          </IconButton>

          {/* Page Title with Breadcrumb Style */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700, 
                color: 'text.primary',
                fontSize: { xs: '1.1rem', sm: '1.5rem' }, // Smaller on mobile
              }}
            >
              {navigationCategories.flatMap(cat => cat.items).find(item => item.id === currentTab)?.label || 'Dashboard'}
            </Typography>
            <Chip
              label="LIVE"
              size="small"
              sx={{
                height: 20,
                bgcolor: 'success.main',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.7rem',
                display: { xs: 'none', sm: 'flex' }, // Hide on very small screens
              }}
            />
          </Box>

          <Box sx={{ flex: 1 }} />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Flow Coins Balance - Updated Style */}
          <Box
            onClick={() => onTabChange(8)}
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: 1,
              bgcolor: 'linear-gradient(135deg, #FFF9E6 0%, #FFF3CC 100%)',
              px: 2,
              py: 0.75,
              borderRadius: 3,
              cursor: 'pointer',
              border: '1px solid #FFD54F',
              '&:hover': {
                bgcolor: '#FFF9E6',
                boxShadow: '0 2px 8px rgba(255, 193, 7, 0.2)',
              },
            }}
          >
            <MonetizationOnIcon sx={{ color: '#F57C00', fontSize: 20 }} />
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#F57C00' }}>
              2,450
            </Typography>
          </Box>

          {/* Notifications */}
          <IconButton 
            onClick={handleNotificationsOpen} 
            aria-label="View notifications"
            aria-controls="notifications-menu"
            aria-haspopup="true"
            aria-expanded={Boolean(notificationsAnchor)}
            sx={{ 
              color: 'text.primary',
              minWidth: { xs: 48, md: 'auto' },
              minHeight: { xs: 48, md: 'auto' },
            }}
          >
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* Profile Avatar */}
          {user && (
            <IconButton
              onClick={handleProfileMenuOpen}
              aria-label="User profile menu"
              aria-controls="profile-menu"
              aria-haspopup="true"
              aria-expanded={Boolean(anchorEl)}
              sx={{
                p: 0,
                minWidth: { xs: 48, md: 'auto' },
                minHeight: { xs: 48, md: 'auto' },
              }}
            >
              <Avatar
                sx={{
                  width: 38,
                  height: 38,
                  bgcolor: 'primary.main',
                  boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                }}
              >
                {user.email?.[0]?.toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Box
        component="nav"
        aria-label="Main navigation"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 }, display: 'none' }}
      >
        {/* Mobile Drawer - Temporary */}
        <Drawer
          id="navigation-drawer"
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ 
            keepMounted: true,
          }}
          sx={{
            display: 'none',
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop Drawer - Permanent */}
        <Drawer
          variant="permanent"
          sx={{
            display: 'none',
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: DRAWER_WIDTH,
              borderRight: '1px solid rgba(255,255,255,0.1)',
              position: 'fixed',
              height: '100vh',
              overflowY: 'auto',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        id="main-content"
        component="main"
        role="main"
        aria-label="Main content"
        sx={{
          flexGrow: 1,
          p: 1,
          width: '100%',
          paddingTop: { xs: 'calc(56px + 8px)', sm: 'calc(64px + 8px)' },
          paddingBottom: { xs: 'calc(56px + 8px)', sm: 1 },
          minHeight: '100vh',
        }}
      >
        {children}
      </Box>

      {/* Mobile Bottom Navigation */}
      <Box
        component="nav"
        aria-label="Mobile quick navigation"
        role="navigation"
        sx={{
          display: { xs: 'block', md: 'none' },
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: 'white',
          borderTop: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
          zIndex: (theme) => theme.zIndex.appBar,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            height: 56,
            px: 1,
          }}
        >
          <IconButton
            onClick={() => onTabChange(0)}
            aria-label="Go to Dashboard"
            aria-current={currentTab === 0 ? 'page' : undefined}
            sx={{
              flexDirection: 'column',
              gap: 0.5,
              minWidth: 48,
              minHeight: 48,
              color: currentTab === 0 ? 'primary.main' : 'text.secondary',
            }}
          >
            <DashboardIcon fontSize="small" />
            <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
              Dashboard
            </Typography>
          </IconButton>

          <IconButton
            onClick={() => onTabChange(1)}
            aria-label="Go to Campaigns"
            aria-current={currentTab === 1 ? 'page' : undefined}
            sx={{
              flexDirection: 'column',
              gap: 0.5,
              minWidth: 48,
              minHeight: 48,
              color: currentTab === 1 ? 'primary.main' : 'text.secondary',
            }}
          >
            <CampaignIcon fontSize="small" />
            <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
              Campaigns
            </Typography>
          </IconButton>

          <IconButton
            onClick={() => onTabChange(3)}
            aria-label="Go to AI Tools"
            aria-current={currentTab === 3 ? 'page' : undefined}
            sx={{
              flexDirection: 'column',
              gap: 0.5,
              minWidth: 48,
              minHeight: 48,
              color: currentTab === 3 ? 'primary.main' : 'text.secondary',
            }}
          >
            <AutoAwesomeIcon fontSize="small" />
            <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
              AI Tools
            </Typography>
          </IconButton>

          <IconButton
            onClick={() => onTabChange(5)}
            aria-label="Go to Analytics"
            aria-current={currentTab === 5 ? 'page' : undefined}
            sx={{
              flexDirection: 'column',
              gap: 0.5,
              minWidth: 48,
              minHeight: 48,
              color: currentTab === 5 ? 'primary.main' : 'text.secondary',
            }}
          >
            <InsightsIcon fontSize="small" />
            <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
              Analytics
            </Typography>
          </IconButton>

          <IconButton
            onClick={handleDrawerToggle}
            aria-label="Open full navigation menu"
            aria-expanded={mobileOpen}
            aria-controls="navigation-drawer"
            sx={{
              flexDirection: 'column',
              gap: 0.5,
              minWidth: 48,
              minHeight: 48,
              color: 'text.secondary',
            }}
          >
            <MenuIcon fontSize="small" />
            <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
              More
            </Typography>
          </IconButton>
        </Box>
      </Box>

      {/* Profile Menu */}
      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        MenuListProps={{
          'aria-labelledby': 'profile-button',
          role: 'menu',
        }}
      >
        <MenuItem onClick={handleProfileMenuClose} role="menuitem">
          <SettingsIcon sx={{ mr: 2 }} fontSize="small" aria-hidden="true" />
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleSignOut} role="menuitem">
          <LogoutIcon sx={{ mr: 2 }} fontSize="small" aria-hidden="true" />
          Sign Out
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        id="notifications-menu"
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleNotificationsClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        MenuListProps={{
          'aria-labelledby': 'notifications-button',
          role: 'menu',
        }}
        PaperProps={{
          sx: { width: 360, maxHeight: 400 }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Notifications
          </Typography>
          <Typography variant="caption" color="text.secondary">
            You have 4 unread messages
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleNotificationsClose}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              New campaign created
            </Typography>
            <Typography variant="caption" color="text.secondary">
              2 minutes ago
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleNotificationsClose}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Trending product found
            </Typography>
            <Typography variant="caption" color="text.secondary">
              1 hour ago
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleNotificationsClose}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              A/B test completed
            </Typography>
            <Typography variant="caption" color="text.secondary">
              3 hours ago
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleNotificationsClose}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Analytics report ready
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Yesterday
            </Typography>
          </Box>
        </MenuItem>
      </Menu>
      
      {/* Flow Assistant is rendered globally in ClientLayout - do not duplicate */}
    </Box>
  );
}
