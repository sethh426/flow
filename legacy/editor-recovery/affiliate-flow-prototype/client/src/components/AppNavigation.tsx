'use client';

import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Divider,
  Collapse,
  Chip,
  useMediaQuery,
  useTheme,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  AutoAwesome as WorkflowIcon,
  Create as ContentIcon,
  TrendingUp as TrendsIcon,
  Analytics as AnalyticsIcon,
  Image as ImageIcon,
  Campaign as CampaignIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';

const DRAWER_WIDTH = 280;

interface NavigationItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string | number;
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <DashboardIcon />,
  },
  {
    label: 'Workflow Builder',
    path: '/workflows',
    icon: <WorkflowIcon />,
    badge: 'NEW',
  },
  {
    label: 'Flow-a-Gram',
    path: '/flow-a-gram',
    icon: <ContentIcon />,
  },
  {
    label: 'Flow-Finder',
    path: '/flow-finder',
    icon: <TrendsIcon />,
  },
  {
    label: 'FlowTime',
    path: '/flowtime',
    icon: <AnalyticsIcon />,
    badge: 'NEW',
  },
  {
    label: 'Analytics',
    path: '/analytics',
    icon: <AnalyticsIcon />,
  },
  {
    label: 'Image Editor',
    path: '/image-editor',
    icon: <ImageIcon />,
  },
  {
    label: 'Campaigns',
    path: '/campaigns',
    icon: <CampaignIcon />,
  },
];

interface AppNavigationProps {
  children: React.ReactNode;
}

export default function AppNavigation({ children }: AppNavigationProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDesktopOpen(!desktopOpen);
    }
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const toggleSection = (label: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(label)) {
      newExpanded.delete(label);
    } else {
      newExpanded.add(label);
    }
    setExpandedSections(newExpanded);
  };

  const renderNavigationItem = (item: NavigationItem, depth = 0) => {
    const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections.has(item.label);

    return (
      <React.Fragment key={item.path}>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            onClick={() => {
              if (hasChildren) {
                toggleSection(item.label);
              } else {
                handleNavigate(item.path);
              }
            }}
            sx={{
              minHeight: 48,
              justifyContent: desktopOpen ? 'initial' : 'center',
              px: 2.5,
              pl: 2.5 + depth * 2,
              bgcolor: isActive ? 'primary.main' : 'transparent',
              color: isActive ? 'primary.contrastText' : 'text.primary',
              '&:hover': {
                bgcolor: isActive ? 'primary.dark' : 'action.hover',
              },
              borderRadius: 1,
              mx: 1,
              mb: 0.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: desktopOpen ? 2 : 'auto',
                justifyContent: 'center',
                color: isActive ? 'primary.contrastText' : 'inherit',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              sx={{ 
                opacity: desktopOpen ? 1 : 0,
                display: desktopOpen ? 'block' : 'none',
              }}
            />
            {item.badge && desktopOpen && (
              <Chip
                label={item.badge}
                size="small"
                color="secondary"
                sx={{ 
                  height: 20, 
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              />
            )}
            {hasChildren && desktopOpen && (
              isExpanded ? <ExpandLess /> : <ExpandMore />
            )}
          </ListItemButton>
        </ListItem>
        {hasChildren && (
          <Collapse in={isExpanded && desktopOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map((child) => renderNavigationItem(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo and Toggle */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: desktopOpen ? 'space-between' : 'center',
          px: 2,
          py: 2,
          minHeight: 64,
        }}
      >
        {desktopOpen && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
                fontSize: '1.2rem',
              }}
            >
              AF
            </Box>
            <Typography variant="h6" fontWeight={700} noWrap>
              Affiliate Flow
            </Typography>
          </Box>
        )}
        <IconButton onClick={handleDrawerToggle}>
          <ChevronLeftIcon />
        </IconButton>
      </Box>

      <Divider />

      {/* Navigation Items */}
      <Box sx={{ overflowY: 'auto', flex: 1, py: 2 }}>
        <List>
          {navigationItems.map((item) => renderNavigationItem(item))}
        </List>
      </Box>

      <Divider />

      {/* Settings */}
      <List>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleNavigate('/settings')}
            sx={{
              minHeight: 48,
              justifyContent: desktopOpen ? 'initial' : 'center',
              px: 2.5,
              mx: 1,
              mb: 1,
              borderRadius: 1,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: desktopOpen ? 2 : 'auto',
                justifyContent: 'center',
              }}
            >
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText
              primary="Settings"
              sx={{ 
                opacity: desktopOpen ? 1 : 0,
                display: desktopOpen ? 'block' : 'none',
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile App Bar */}
      {isMobile && (
        <AppBar
          position="fixed"
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" fontWeight={700}>
              Affiliate Flow
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        open={desktopOpen}
        sx={{
          display: { xs: 'none', md: 'block' },
          width: desktopOpen ? DRAWER_WIDTH : 65,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: desktopOpen ? DRAWER_WIDTH : 65,
            boxSizing: 'border-box',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: isMobile ? 8 : 0,
          width: { md: `calc(100% - ${desktopOpen ? DRAWER_WIDTH : 65}px)` },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
