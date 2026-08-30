'use client';

/**
 * Mock Stripe Checkout Page
 * Simulates the Stripe checkout experience for testing
 */

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container, Typography, Box, Paper, Button, CircularProgress, Alert } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { mockStripe, MOCK_STRIPE_PRODUCTS, FLOW_COINS_PACKAGES } from '@/lib/mock-stripe';

function MockCheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productName, setProductName] = useState('');

  const sessionId = searchParams.get('session_id');
  const type = searchParams.get('type');
  const packageId = searchParams.get('packageId');

  useEffect(() => {
    if (!sessionId) {
      setError('Invalid checkout session');
      setLoading(false);
      return;
    }

    // Simulate loading checkout page
    setTimeout(() => {
      const session = mockStripe.getCheckoutSession(sessionId);

      if (!session) {
        setError('Checkout session not found');
        setLoading(false);
        return;
      }

      if (type === 'coins' && packageId) {
        const pkg = FLOW_COINS_PACKAGES.find((p) => p.id === packageId);
        setProductName(pkg?.name || 'Flow Coins Package');
      } else {
        const product = MOCK_STRIPE_PRODUCTS.find((p) =>
          p.prices.some((price) => price.id === session.priceId)
        );
        setProductName(product?.name || 'Subscription Plan');
      }

      setLoading(false);
    }, 1000);
  }, [sessionId, type, packageId]);

  const handleComplete = () => {
    if (type === 'coins') {
      router.push('/dashboard?coins=success');
    } else {
      router.push('/dashboard?checkout=success');
    }
  };

  const handleCancel = () => {
    router.push('/pricing?checkout=canceled');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error">{error}</Alert>
        <Button fullWidth variant="contained" onClick={() => router.push('/pricing')} sx={{ mt: 2 }}>
          Back to Pricing
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            🧪 Mock Stripe Checkout
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This is a simulated payment page for testing
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>Development Mode:</strong> No real payment will be processed
        </Alert>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Order Summary
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {productName}
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Session ID: {sessionId}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            fullWidth
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={handleComplete}
          >
            Simulate Successful Payment
          </Button>
          <Button fullWidth variant="outlined" color="error" onClick={handleCancel}>
            Cancel
          </Button>
        </Box>

        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
          In production, this would be the real Stripe checkout page
        </Typography>
      </Paper>
    </Container>
  );
}

export default function MockCheckoutPage() {
  return (
    <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>}>
      <MockCheckoutContent />
    </Suspense>
  );
}
