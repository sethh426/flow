'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import {
  MonetizationOn,
  TrendingUp,
  Campaign,
  Share,
  Star,
  EmojiEvents,
  Redeem,
  Add,
  Remove,
  Close,
  CheckCircle,
} from '@mui/icons-material';

interface Transaction {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  description: string;
  date: Date;
  icon: React.ReactElement;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: React.ReactElement;
  available: boolean;
}

export default function FlowCoins() {
  const [balance, setBalance] = useState(2450);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'earn',
      amount: 1000,
      description: 'Purchased Starter Pack',
      date: new Date(2025, 9, 12, 10, 30),
      icon: <MonetizationOn />,
    },
    {
      id: '2',
      type: 'spend',
      amount: -100,
      description: 'AI Campaign Generation',
      date: new Date(2025, 9, 12, 9, 15),
      icon: <Campaign />,
    },
    {
      id: '3',
      type: 'spend',
      amount: -50,
      description: 'Automated Content Publishing',
      date: new Date(2025, 9, 11, 16, 45),
      icon: <Share />,
    },
    {
      id: '4',
      type: 'earn',
      amount: 500,
      description: 'Purchased Booster Pack',
      date: new Date(2025, 9, 10, 14, 20),
      icon: <MonetizationOn />,
    },
    {
      id: '5',
      type: 'spend',
      amount: -200,
      description: 'AI Trend Analysis (5 products)',
      date: new Date(2025, 9, 10, 12, 0),
      icon: <TrendingUp />,
    },
  ];

  const coinPackages = [
    { 
      id: '1',
      name: 'Starter Pack', 
      coins: 1000, 
      price: '$9.99',
      bonus: 0,
      popular: false,
    },
    { 
      id: '2',
      name: 'Professional Pack', 
      coins: 5000, 
      price: '$39.99',
      bonus: 500,
      popular: true,
    },
    { 
      id: '3',
      name: 'Business Pack', 
      coins: 15000, 
      price: '$99.99',
      bonus: 3000,
      popular: false,
    },
    { 
      id: '4',
      name: 'Enterprise Pack', 
      coins: 50000, 
      price: '$299.99',
      bonus: 15000,
      popular: false,
    },
  ];

  const automationFeatures = [
    { feature: 'AI Campaign Generation', cost: '100 coins per campaign' },
    { feature: 'Automated Content Publishing', cost: '50 coins per post' },
    { feature: 'AI Trend Analysis', cost: '200 coins per analysis' },
    { feature: 'A/B Test Automation', cost: '150 coins per test' },
    { feature: 'Workflow Automation', cost: '300 coins per workflow' },
  ];

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Flow Coins
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Purchase Flow Coins to automate processes and unlock AI-powered features
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 3 }}>
        {/* Balance Card */}
        <Box>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <MonetizationOn sx={{ fontSize: 64, mb: 2, opacity: 0.9 }} />
              <Typography variant="h3" fontWeight={700} gutterBottom>
                {balance.toLocaleString()}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Flow Coins
              </Typography>
              <Box sx={{ mt: 4 }}>
                <Chip
                  icon={<TrendingUp />}
                  label="Active Automations: 12"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
              </Box>
            </CardContent>
          </Card>

          {/* Automation Features */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Automation Features
              </Typography>
              <List>
                {automationFeatures.map((item, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <MonetizationOn />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={item.feature}
                      secondary={
                        <Chip
                          label={item.cost}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ mt: 0.5 }}
                        />
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>

        {/* Purchase Packages */}
        <Box>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>
                  Purchase Flow Coins
                </Typography>
                <Chip
                  label={`${balance.toLocaleString()} coins available`}
                  color="primary"
                  icon={<MonetizationOn />}
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                {coinPackages.map((pkg) => (
                  <Box key={pkg.id}>
                    <Card
                      variant="outlined"
                      sx={{
                        height: '100%',
                        cursor: 'pointer',
                        position: 'relative',
                        border: pkg.popular ? '2px solid' : '1px solid',
                        borderColor: pkg.popular ? 'primary.main' : 'divider',
                        '&:hover': {
                          boxShadow: 3,
                          borderColor: 'primary.main',
                        },
                      }}
                      onClick={() => {
                        setSelectedPackage(pkg);
                        setPurchaseDialogOpen(true);
                      }}
                    >
                      {pkg.popular && (
                        <Chip
                          label="POPULAR"
                          color="primary"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            fontWeight: 700,
                          }}
                        />
                      )}
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                            <MonetizationOn />
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                              {pkg.name}
                            </Typography>
                            <Typography variant="h5" color="primary.main" fontWeight={700} sx={{ mb: 1 }}>
                              {pkg.price}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {pkg.coins.toLocaleString()} coins
                              {pkg.bonus > 0 && (
                                <Chip
                                  label={`+${pkg.bonus.toLocaleString()} bonus`}
                                  size="small"
                                  color="success"
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="caption" color="text.secondary">
                                Total: {(pkg.coins + pkg.bonus).toLocaleString()} coins
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  All purchases are secure and processed through Stripe
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Recent Activity
              </Typography>
              <List>
                {transactions.map((transaction) => (
                  <Box key={transaction.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: transaction.type === 'earn' ? 'success.main' : 'error.main',
                          }}
                        >
                          {transaction.icon}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={transaction.description}
                        secondary={transaction.date.toLocaleString()}
                      />
                      <Typography
                        variant="h6"
                        fontWeight={600}
                        color={transaction.type === 'earn' ? 'success.main' : 'error.main'}
                      >
                        {transaction.type === 'earn' ? '+' : ''}{transaction.amount}
                      </Typography>
                    </ListItem>
                    <Divider />
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Purchase Confirmation Dialog */}
      <Dialog open={purchaseDialogOpen} onClose={() => setPurchaseDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Confirm Purchase
            <IconButton onClick={() => setPurchaseDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        {selectedPackage && (
          <>
            <DialogContent>
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 3,
                  }}
                >
                  <MonetizationOn sx={{ fontSize: 48 }} />
                </Avatar>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  {selectedPackage.name}
                </Typography>
                <Typography variant="h4" color="primary.main" fontWeight={700} sx={{ mb: 3 }}>
                  {selectedPackage.price}
                </Typography>
                <Box
                  sx={{
                    bgcolor: 'grey.100',
                    borderRadius: 2,
                    p: 3,
                    mb: 2,
                  }}
                >
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    You will receive:
                  </Typography>
                  <Typography variant="h6" fontWeight={600} color="success.main">
                    {selectedPackage.coins.toLocaleString()} Flow Coins
                  </Typography>
                  {selectedPackage.bonus > 0 && (
                    <Typography variant="h6" fontWeight={600} color="success.main">
                      + {selectedPackage.bonus.toLocaleString()} Bonus Coins
                    </Typography>
                  )}
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h5" fontWeight={700}>
                    Total: {(selectedPackage.coins + selectedPackage.bonus).toLocaleString()} coins
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Secure payment processed by Stripe
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setPurchaseDialogOpen(false)}>Cancel</Button>
              <Button
                variant="contained"
                onClick={() => {
                  // In a real app, this would process the payment
                  setBalance(balance + selectedPackage.coins + selectedPackage.bonus);
                  setPurchaseDialogOpen(false);
                  setSelectedPackage(null);
                }}
                startIcon={<MonetizationOn />}
              >
                Complete Purchase
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
