'use client';

/**
 * Pricing Page
 * Shows subscription tiers and Flow Coins packages
 * Uses mock Stripe for checkout simulation
 */

import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { MOCK_STRIPE_PRODUCTS, FLOW_COINS_PACKAGES, formatPrice, mockStripe } from '@/lib/mock-stripe';

export default function PricingPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string, tierName: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(priceId);

    try {
      // Mock Stripe checkout
      const session = await mockStripe.createCheckoutSession(
        user.uid,
        priceId,
        '/dashboard?checkout=success',
        '/pricing?checkout=canceled'
      );

      console.log('🧪 Redirecting to mock checkout:', session.url);

      // In a real app, you'd redirect to session.url
      // For now, we'll simulate instant success
      alert(`🧪 MOCK CHECKOUT\n\nYou selected: ${tierName}\nPrice ID: ${priceId}\n\nIn production, you would be redirected to Stripe checkout.\n\nClick OK to simulate successful payment.`);

      // Simulate successful checkout
      const subscription = await mockStripe.completeCheckout(session.id, user.uid);

      // In production, update user tier via webhook
      console.log('✅ Subscription created:', subscription);
      
      router.push('/dashboard?checkout=success&tier=' + tierName);
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout failed: ' + (error as Error).message);
    } finally {
      setLoading(null);
    }
  };

  const handleBuyCoins = async (packageId: string, packageName: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(packageId);

    try {
      const session = await mockStripe.createCoinsCheckoutSession(
        user.uid,
        packageId,
        '/dashboard?coins=success',
        '/pricing?coins=canceled'
      );

      alert(`🧪 MOCK COINS CHECKOUT\n\nYou selected: ${packageName}\nPackage ID: ${packageId}\n\nIn production, you would be redirected to Stripe checkout.\n\nClick OK to simulate successful payment.`);

      // Simulate successful purchase
      console.log('✅ Coins purchased');
      
      router.push('/dashboard?coins=success');
    } catch (error) {
      console.error('Coins checkout error:', error);
      alert('Checkout failed: ' + (error as Error).message);
    } finally {
      setLoading(null);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'starter':
        return 'success';
      case 'professional':
        return 'primary';
      case 'business':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const isCurrentTier = (tier: string) => {
    return userData?.tier === tier;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Choose Your Plan
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Start free, upgrade when you&apos;re ready
        </Typography>
        {userData && (
          <Chip
            label={`Current Plan: ${userData.tier.toUpperCase()}`}
            color={getTierColor(userData.tier)}
            sx={{ mt: 2 }}
          />
        )}
      </Box>

      <Alert severity="info" sx={{ mb: 4 }}>
        🧪 <strong>Mock Stripe Mode:</strong> This is using simulated payments for development. No real charges will occur.
      </Alert>

      {/* Subscription Tiers */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4, mb: 8 }}>
        {MOCK_STRIPE_PRODUCTS.map((product) => {
          const monthlyPrice = product.prices.find((p) => p.interval === 'month');
          const isCurrent = isCurrentTier(product.tier);

          return (
            <Card
              key={product.id}
              elevation={isCurrent ? 8 : 1}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                border: isCurrent ? 2 : 0,
                  borderColor: 'primary.main',
                }}
              >
                {isCurrent && (
                  <Chip
                    label="Current Plan"
                    color="primary"
                    size="small"
                    sx={{ position: 'absolute', top: 16, right: 16 }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {product.description}
                  </Typography>
                  {monthlyPrice && (
                    <Box sx={{ my: 3 }}>
                      <Typography variant="h3" component="div">
                        {formatPrice(monthlyPrice.amount)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        per month
                      </Typography>
                    </Box>
                  )}
                  <Divider sx={{ my: 2 }} />
                  <List dense>
                    {product.features.map((feature, index) => (
                      <ListItem key={index} disableGutters>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircleIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  {monthlyPrice && (
                    <Button
                      fullWidth
                      variant={isCurrent ? 'outlined' : 'contained'}
                      color="primary"
                      disabled={isCurrent || loading === monthlyPrice.id}
                      onClick={() => handleSubscribe(monthlyPrice.id, product.name)}
                    >
                      {isCurrent ? 'Current Plan' : loading === monthlyPrice.id ? 'Processing...' : 'Subscribe'}
                    </Button>
                  )}
                </CardActions>
              </Card>
          );
        })}
      </Box>

      {/* Flow Coins Packages */}
      <Divider sx={{ my: 6 }} />

      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Need More Flow Coins?
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Purchase additional Flow Coins for AI content generation
        </Typography>
        {userData && (
          <Typography variant="h6" sx={{ mt: 2 }}>
            Your Current Balance: <strong>{userData.flowCoins} Flow Coins</strong>
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3, justifyContent: 'center' }}>
        {FLOW_COINS_PACKAGES.map((pkg) => (
          <Paper key={pkg.id} elevation={2} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              {pkg.name}
            </Typography>
            {pkg.bonus && (
              <Chip label={`+${pkg.bonus} Bonus Coins!`} color="success" size="small" sx={{ mb: 2 }} />
            )}
            <Typography variant="h4" color="primary" sx={{ my: 2 }}>
              {formatPrice(pkg.price)}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {pkg.coins} {pkg.bonus ? `+ ${pkg.bonus}` : ''} Flow Coins
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 2 }}>
                ≈ {Math.floor(pkg.coins / 50)} AI operations (50 coins per 10K tokens)
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                disabled={loading === pkg.id}
                onClick={() => handleBuyCoins(pkg.id, pkg.name)}
              >
                {loading === pkg.id ? 'Processing...' : 'Purchase'}
              </Button>
            </Paper>
        ))}
      </Box>

      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Button variant="text" onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </Button>
      </Box>
    </Container>
  );
}
