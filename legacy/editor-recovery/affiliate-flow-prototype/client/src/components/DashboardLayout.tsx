'use client';

import { useState, ReactNode } from 'react';
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
import { logOut } from '@/lib/auth';

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
    label: 'Core Features',
    icon: <DashboardIcon />,
    items: [
      { id: 0, label: 'Dashboard', icon: <DashboardIcon />, description: 'Overview & insights' },
      { id: 1, label: 'Campaigns', icon: <CampaignIcon />, badge: 3, description: 'Manage campaigns' },
      { id: 2, label: 'Products', icon: <ShoppingCartIcon />, description: 'Product catalog' },
    ],
  },
  {
    label: 'AI Tools',
    icon: <AutoAwesomeIcon />,
    items: [
      { id: 3, label: 'Content Studio', icon: <BrushIcon />, description: 'AI content generation' },
      { id: 4, label: 'Trend Finder', icon: <TrendingUpIcon />, badge: 5, description: 'Discover trends' },
      { id: 7, label: 'FlowChart', icon: <CalendarMonthIcon />, badge: 5, description: 'AI scheduling' },
      { id: 10, label: 'Scheduler', icon: <ScheduleIcon />, description: 'Schedule posts' },
      { id: 9, label: 'Workflows', icon: <AccountTreeIcon />, badge: 2, description: 'Automation' },
    ],
  },
  {
    label: 'Analytics & Testing',
    icon: <InsightsIcon />,
    items: [
      { id: 5, label: 'Analytics', icon: <InsightsIcon />, description: 'Performance metrics' },
      { id: 6, label: 'A/B Testing', icon: <ScienceIcon />, description: 'Test & optimize' },
    ],
  },
  {
    label: 'Rewards',
    icon: <MonetizationOnIcon />,
    items: [
      { id: 8, label: 'Flow Coins', icon: <MonetizationOnIcon />, description: 'Earn rewards' },
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
    'Core Features': true,
    'AI Tools': true,
    'Analytics & Testing': true,
    'Rewards': true,
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
      <Box sx={{ flex: 1, px: 2, py: 2, overflowY: 'auto' }}>
        {navigationCategories.map((category) => (
          <Box key={category.label} sx={{ mb: 3 }}>
            {/* Category Header */}
            <ListItemButton
              onClick={() => toggleCategory(category.label)}
              sx={{
                borderRadius: 2,
                mb: 1,
                py: 1,
                px: 1.5,
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
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      py: 1.25,
                      pl: 5,
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
      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: '100%',
          bgcolor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ gap: 2, minHeight: { xs: 56, sm: 64 } }}>
          {/* Menu Toggle Button - Visible on all screens */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, color: 'text.primary' }}
          >
            <MenuIcon />
          </IconButton>

          {/* Page Title with Breadcrumb Style */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
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
              }}
            />
          </Box>

          <Box sx={{ flex: 1 }} />

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
          <IconButton onClick={handleNotificationsOpen} sx={{ color: 'text.primary' }}>
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* Profile Avatar */}
          {user && (
            <Avatar
              sx={{
                width: 38,
                height: 38,
                bgcolor: 'primary.main',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
              }}
              onClick={handleProfileMenuOpen}
            >
              {user.email?.[0]?.toUpperCase() || 'U'}
            </Avatar>
          )}
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: mobileOpen ? DRAWER_WIDTH : 0 }, flexShrink: { md: 0 }, transition: 'width 0.3s' }}
      >
        {/* Temporary Drawer - Works on all screen sizes */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          paddingTop: { xs: 'calc(56px + 24px)', sm: 'calc(64px + 24px)' }, // Toolbar height + p:3
          minHeight: '100vh',
        }}
      >
        {children}
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleProfileMenuClose}>
          <SettingsIcon sx={{ mr: 2 }} fontSize="small" />
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleSignOut}>
          <LogoutIcon sx={{ mr: 2 }} fontSize="small" />
          Sign Out
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleNotificationsClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
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
    </Box>
  );
}
