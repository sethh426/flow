'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Alert,
  LinearProgress,
  Divider,
  Skeleton,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Email,
  Payment,
  Store,
  Cloud,
  Api,
  Check,
  Settings,
  Add,
  Link as LinkIcon,
} from '@mui/icons-material';

interface Integration {
  id: string;
  name: string;
  category: 'social' | 'email' | 'payment' | 'crm' | 'ecommerce' | 'storage';
  description: string;
  icon: React.ReactNode;
  status: 'connected' | 'available' | 'configuring';
  features: string[];
}

export default function IntegrationHub() {
  const [tabValue, setTabValue] = useState(0);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [credentials, setCredentials] = useState({ apiKey: '', apiSecret: '', endpoint: '' });
  const [errors, setErrors] = useState({ apiKey: '', apiSecret: '' });
  const [touched, setTouched] = useState({ apiKey: false, apiSecret: false });
  const [integrations, setIntegrations] = useState<Integration[]>([
    // Social Media
    {
      id: 'facebook',
      name: 'Facebook',
      category: 'social',
      description: 'Share products and content to Facebook pages and groups',
      icon: <Facebook />,
      status: 'available',
      features: ['Auto-post', 'Engagement tracking', 'Ad sync'],
    },
    {
      id: 'twitter',
      name: 'Twitter / X',
      category: 'social',
      description: 'Tweet products and monitor mentions',
      icon: <Twitter />,
      status: 'connected',
      features: ['Auto-tweet', 'Hashtag tracking', 'Analytics'],
    },
    {
      id: 'instagram',
      name: 'Instagram',
      category: 'social',
      description: 'Share visual content and track engagement',
      icon: <Instagram />,
      status: 'available',
      features: ['Story posts', 'Feed posts', 'Insights'],
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      category: 'social',
      description: 'Professional network integration for B2B',
      icon: <LinkedIn />,
      status: 'available',
      features: ['Company posts', 'Lead gen', 'Analytics'],
    },
    // Email
    {
      id: 'mailchimp',
      name: 'Mailchimp',
      category: 'email',
      description: 'Email marketing and automation',
      icon: <Email />,
      status: 'connected',
      features: ['Campaign creation', 'List management', 'Automation'],
    },
    {
      id: 'sendgrid',
      name: 'SendGrid',
      category: 'email',
      description: 'Transactional email service',
      icon: <Email />,
      status: 'available',
      features: ['Transactional emails', 'Templates', 'Analytics'],
    },
    // Payment
    {
      id: 'stripe',
      name: 'Stripe',
      category: 'payment',
      description: 'Payment processing and subscriptions',
      icon: <Payment />,
      status: 'connected',
      features: ['Payment processing', 'Subscriptions', 'Invoices'],
    },
    {
      id: 'paypal',
      name: 'PayPal',
      category: 'payment',
      description: 'Online payment solution',
      icon: <Payment />,
      status: 'available',
      features: ['Checkout', 'Subscriptions', 'Invoicing'],
    },
    // CRM
    {
      id: 'hubspot',
      name: 'HubSpot',
      category: 'crm',
      description: 'Customer relationship management',
      icon: <Store />,
      status: 'available',
      features: ['Contact management', 'Sales pipeline', 'Marketing automation'],
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      category: 'crm',
      description: 'Enterprise CRM platform',
      icon: <Store />,
      status: 'available',
      features: ['Lead management', 'Opportunity tracking', 'Reports'],
    },
    // Ecommerce
    {
      id: 'shopify',
      name: 'Shopify',
      category: 'ecommerce',
      description: 'Ecommerce platform integration',
      icon: <Store />,
      status: 'available',
      features: ['Product sync', 'Order management', 'Inventory'],
    },
    {
      id: 'woocommerce',
      name: 'WooCommerce',
      category: 'ecommerce',
      description: 'WordPress ecommerce plugin',
      icon: <Store />,
      status: 'available',
      features: ['Product import', 'Order sync', 'Stock management'],
    },
    // Storage
    {
      id: 'dropbox',
      name: 'Dropbox',
      category: 'storage',
      description: 'Cloud file storage and sharing',
      icon: <Cloud />,
      status: 'available',
      features: ['File storage', 'Asset library', 'Team sharing'],
    },
    {
      id: 'googledrive',
      name: 'Google Drive',
      category: 'storage',
      description: 'Google cloud storage',
      icon: <Cloud />,
      status: 'connected',
      features: ['Document storage', 'Collaboration', 'Backup'],
    },
  ]);

  const categories = [
    { value: 0, label: 'All Integrations', key: 'all' },
    { value: 1, label: 'Social Media', key: 'social' },
    { value: 2, label: 'Email Marketing', key: 'email' },
    { value: 3, label: 'Payment', key: 'payment' },
    { value: 4, label: 'CRM', key: 'crm' },
    { value: 5, label: 'Ecommerce', key: 'ecommerce' },
    { value: 6, label: 'Storage', key: 'storage' },
  ];

  const filteredIntegrations = tabValue === 0
    ? integrations
    : integrations.filter(i => i.category === categories[tabValue].key);

  const connectedCount = integrations.filter(i => i.status === 'connected').length;

  useEffect(() => {
    // Simulate loading integrations
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const validateField = (name: string, value: string) => {
    if (name === 'apiKey') {
      if (!value.trim()) return 'API Key is required';
      if (value.length < 10) return 'API Key must be at least 10 characters';
    }
    if (name === 'apiSecret') {
      if (!value.trim()) return 'API Secret is required';
      if (value.length < 10) return 'API Secret must be at least 10 characters';
    }
    return '';
  };

  const handleFieldChange = (name: 'apiKey' | 'apiSecret' | 'endpoint', value: string) => {
    setCredentials(prev => ({ ...prev, [name]: value }));
    if (name !== 'endpoint') {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleFieldBlur = (name: 'apiKey' | 'apiSecret') => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, credentials[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleConnect = (integration: Integration) => {
    setSelectedIntegration(integration);
    setConfigDialogOpen(true);
    setCredentials({ apiKey: '', apiSecret: '', endpoint: '' });
    setErrors({ apiKey: '', apiSecret: '' });
    setTouched({ apiKey: false, apiSecret: false });
  };

  const handleSaveConnection = async () => {
    if (!selectedIntegration) return;

    // Validate all fields
    const apiKeyError = validateField('apiKey', credentials.apiKey);
    const apiSecretError = validateField('apiSecret', credentials.apiSecret);
    
    setErrors({ apiKey: apiKeyError, apiSecret: apiSecretError });
    setTouched({ apiKey: true, apiSecret: true });

    if (apiKeyError || apiSecretError) {
      return;
    }
    
    setConnecting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIntegrations(prev => prev.map(i =>
      i.id === selectedIntegration.id ? { ...i, status: 'connected' as const } : i
    ));
    
    setConnecting(false);
    setConfigDialogOpen(false);
    setSelectedIntegration(null);
  };

  const handleDisconnect = async (integration: Integration) => {
    if (!confirm(`Disconnect from ${integration.name}?`)) return;
    
    setIntegrations(prev => prev.map(i =>
      i.id === integration.id ? { ...i, status: 'available' as const } : i
    ));
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          fontWeight={700} 
          gutterBottom
          sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
        >
          Integration Hub
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
        >
          Connect your favorite tools and services to automate your workflow
        </Typography>
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
        <Card sx={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)', border: '1px solid #e5e7eb' }}>
          <CardContent>
            <Typography variant="caption" color="text.secondary">
              Connected Services
            </Typography>
            <Typography variant="h3" fontWeight={700} color="primary.main">
              {connectedCount}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)', border: '1px solid #e5e7eb' }}>
          <CardContent>
            <Typography variant="caption" color="text.secondary">
              Available Integrations
            </Typography>
            <Typography variant="h3" fontWeight={700}>
              {integrations.length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)', border: '1px solid #e5e7eb' }}>
          <CardContent>
            <Typography variant="caption" color="text.secondary">
              Categories
            </Typography>
            <Typography variant="h3" fontWeight={700}>
              6
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Category Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {categories.map((cat) => (
            <Tab key={cat.value} label={cat.label} />
          ))}
        </Tabs>
      </Card>

      {/* Integrations Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: { xs: 2, sm: 3 } }}>
        {loading ? (
          // Show skeleton loaders
          Array.from({ length: 6 }).map((_, index) => (
            <Card
              key={index}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e5e7eb',
              }}
            >
              <CardContent sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="60%" height={24} />
                    </Box>
                  </Box>
                  <Skeleton variant="rounded" width={80} height={24} />
                </Box>
                <Skeleton variant="text" width="90%" height={20} sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Skeleton variant="rounded" width={80} height={24} />
                  <Skeleton variant="rounded" width={100} height={24} />
                  <Skeleton variant="rounded" width={90} height={24} />
                </Box>
                <Skeleton variant="rectangular" width="100%" height={36} sx={{ borderRadius: 1 }} />
              </CardContent>
            </Card>
          ))
        ) : (
          filteredIntegrations.map((integration) => (
          <Card
            key={integration.id}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.3s',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e5e7eb',
              '&:hover': {
                boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
                transform: 'translateY(-4px)',
              },
            }}
          >
              <CardContent sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', mb: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: integration.status === 'connected' ? 'success.50' : 'grey.100',
                      color: integration.status === 'connected' ? 'success.main' : 'grey.600',
                    }}
                  >
                    {integration.icon}
                  </Box>
                  <Chip
                    label={integration.status === 'connected' ? 'Connected' : 'Available'}
                    size="small"
                    color={integration.status === 'connected' ? 'success' : 'default'}
                    icon={integration.status === 'connected' ? <Check /> : <Api />}
                  />
                </Box>

                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {integration.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {integration.description}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Features:
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                  {integration.features.map((feature, idx) => (
                    <Chip key={idx} label={feature} size="small" variant="outlined" />
                  ))}
                </Box>
              </CardContent>

              <Box sx={{ p: 2, pt: 0 }}>
                {integration.status === 'connected' ? (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Settings />}
                      fullWidth
                      onClick={() => handleConnect(integration)}
                    >
                      Configure
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDisconnect(integration)}
                      fullWidth
                    >
                      Disconnect
                    </Button>
                  </Box>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={<LinkIcon />}
                    fullWidth
                    onClick={() => handleConnect(integration)}
                  >
                    Connect
                  </Button>
                )}
              </Box>
            </Card>
          ))
        )}
      </Box>

      {/* Configuration Dialog */}
      <Dialog open={configDialogOpen} onClose={() => setConfigDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedIntegration && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {selectedIntegration.icon}
              Configure {selectedIntegration.name}
            </Box>
          )}
        </DialogTitle>
        <DialogContent>
          {connecting ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <LinearProgress sx={{ mb: 2 }} />
              <Typography color="text.secondary">
                Connecting to {selectedIntegration?.name}...
              </Typography>
            </Box>
          ) : (
            <Box sx={{ pt: 2 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Enter your API credentials to connect {selectedIntegration?.name}
              </Alert>

              <TextField
                label="API Key"
                value={credentials.apiKey}
                onChange={(e) => handleFieldChange('apiKey', e.target.value)}
                onBlur={() => handleFieldBlur('apiKey')}
                error={touched.apiKey && !!errors.apiKey}
                helperText={touched.apiKey && errors.apiKey}
                fullWidth
                required
                sx={{ mb: 2 }}
                placeholder="Enter your API key"
              />
              <TextField
                label="API Secret"
                type="password"
                value={credentials.apiSecret}
                onChange={(e) => handleFieldChange('apiSecret', e.target.value)}
                onBlur={() => handleFieldBlur('apiSecret')}
                error={touched.apiSecret && !!errors.apiSecret}
                helperText={touched.apiSecret && errors.apiSecret}
                fullWidth
                required
                sx={{ mb: 2 }}
                placeholder="Enter your API secret"
              />
              <TextField
                label="Endpoint URL (Optional)"
                value={credentials.endpoint}
                onChange={(e) => handleFieldChange('endpoint', e.target.value)}
                fullWidth
                placeholder="https://api.example.com"
              />

              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Enable automatic sync"
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setConfigDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveConnection}
            disabled={connecting || !credentials.apiKey || !credentials.apiSecret}
          >
            {selectedIntegration?.status === 'connected' ? 'Update' : 'Connect'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
