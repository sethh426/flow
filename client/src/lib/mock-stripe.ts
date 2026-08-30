/**
 * Mock Stripe Service
 * Simulates Stripe checkout, subscriptions, and webhooks for development/testing
 * Replace with real Stripe integration when ready for production
 */

export interface StripePrice {
  id: string;
  productId: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
}

export interface StripeProduct {
  id: string;
  name: string;
  description: string;
  tier: 'starter' | 'professional' | 'business';
  prices: StripePrice[];
  features: string[];
}

export interface StripeSubscription {
  id: string;
  customerId: string;
  productId: string;
  priceId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export interface StripeCheckoutSession {
  id: string;
  url: string;
  customerId: string;
  priceId: string;
  success: boolean;
}

/**
 * Mock Stripe Products matching your pricing model
 */
export const MOCK_STRIPE_PRODUCTS: StripeProduct[] = [
  {
    id: 'prod_starter_123',
    name: 'Starter Plan',
    description: 'Perfect for solopreneurs and side hustlers',
    tier: 'starter',
    prices: [
      {
        id: 'price_starter_monthly_123',
        productId: 'prod_starter_123',
        amount: 3000, // $30.00 in cents
        currency: 'usd',
        interval: 'month',
      },
    ],
    features: [
      '500 Flow Coins/month',
      'Basic AI content generation',
      'Up to 3 campaigns',
      'Email support',
    ],
  },
  {
    id: 'prod_professional_456',
    name: 'Professional Plan',
    description: 'For growing businesses and agencies',
    tier: 'professional',
    prices: [
      {
        id: 'price_professional_monthly_456',
        productId: 'prod_professional_456',
        amount: 6000, // $60.00 in cents
        currency: 'usd',
        interval: 'month',
      },
    ],
    features: [
      '1,500 Flow Coins/month',
      'Advanced AI content generation',
      'Unlimited campaigns',
      'Priority support',
      'Custom branding',
    ],
  },
  {
    id: 'prod_business_789',
    name: 'Business Plan',
    description: 'Enterprise-grade features and support',
    tier: 'business',
    prices: [
      {
        id: 'price_business_monthly_789',
        productId: 'prod_business_789',
        amount: 9000, // $90.00 in cents
        currency: 'usd',
        interval: 'month',
      },
    ],
    features: [
      '3,500 Flow Coins/month',
      'Premium AI models (GPT-4, Claude)',
      'Unlimited everything',
      'Dedicated account manager',
      'White-label options',
      'API access',
    ],
  },
];

/**
 * Mock Flow Coins packages (one-time purchases)
 */
export interface FlowCoinsPackage {
  id: string;
  name: string;
  coins: number;
  price: number; // in cents
  bonus?: number; // bonus coins
}

export const FLOW_COINS_PACKAGES: FlowCoinsPackage[] = [
  {
    id: 'coins_small_100',
    name: '500 Flow Coins',
    coins: 500,
    price: 1000, // $10
  },
  {
    id: 'coins_medium_200',
    name: '1,500 Flow Coins',
    coins: 1500,
    price: 2500, // $25
    bonus: 100, // 100 bonus coins
  },
  {
    id: 'coins_large_300',
    name: '3,500 Flow Coins',
    coins: 3500,
    price: 5000, // $50
    bonus: 350, // 350 bonus coins
  },
];

/**
 * Mock Stripe Class
 */
class MockStripe {
  private subscriptions: Map<string, StripeSubscription> = new Map();
  private checkoutSessions: Map<string, StripeCheckoutSession> = new Map();

  /**
   * Get all available products
   */
  getProducts(): StripeProduct[] {
    return MOCK_STRIPE_PRODUCTS;
  }

  /**
   * Get product by tier
   */
  getProductByTier(tier: 'starter' | 'professional' | 'business'): StripeProduct | undefined {
    return MOCK_STRIPE_PRODUCTS.find((p) => p.tier === tier);
  }

  /**
   * Create a checkout session (simulated)
   */
  async createCheckoutSession(
    userId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<StripeCheckoutSession> {
    const sessionId = `cs_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const customerId = `cus_mock_${userId}`;

    const session: StripeCheckoutSession = {
      id: sessionId,
      url: `/mock-checkout?session_id=${sessionId}`, // Mock checkout URL
      customerId,
      priceId,
      success: false,
    };

    this.checkoutSessions.set(sessionId, session);

    // Simulate redirect to mock checkout page
    console.log('🧪 Mock Stripe: Created checkout session', session);

    return session;
  }

  /**
   * Simulate successful checkout (call this from mock checkout page)
   */
  async completeCheckout(sessionId: string, userId: string): Promise<StripeSubscription> {
    const session = this.checkoutSessions.get(sessionId);
    if (!session) {
      throw new Error('Checkout session not found');
    }

    session.success = true;

    // Find the product/price
    const product = MOCK_STRIPE_PRODUCTS.find((p) =>
      p.prices.some((price) => price.id === session.priceId)
    );

    if (!product) {
      throw new Error('Product not found');
    }

    // Create subscription
    const subscription: StripeSubscription = {
      id: `sub_mock_${Date.now()}`,
      customerId: session.customerId,
      productId: product.id,
      priceId: session.priceId,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      cancelAtPeriodEnd: false,
    };

    this.subscriptions.set(subscription.id, subscription);

    console.log('🧪 Mock Stripe: Created subscription', subscription);

    return subscription;
  }

  /**
   * Get subscription by ID
   */
  getSubscription(subscriptionId: string): StripeSubscription | undefined {
    return this.subscriptions.get(subscriptionId);
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<StripeSubscription> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    subscription.cancelAtPeriodEnd = true;
    subscription.status = 'canceled';

    console.log('🧪 Mock Stripe: Canceled subscription', subscription);

    return subscription;
  }

  /**
   * Create a one-time payment for Flow Coins
   */
  async createCoinsCheckoutSession(
    userId: string,
    packageId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<StripeCheckoutSession> {
    const pkg = FLOW_COINS_PACKAGES.find((p) => p.id === packageId);
    if (!pkg) {
      throw new Error('Package not found');
    }

    const sessionId = `cs_coins_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const customerId = `cus_mock_${userId}`;

    const session: StripeCheckoutSession = {
      id: sessionId,
      url: `/mock-checkout?session_id=${sessionId}&type=coins&packageId=${packageId}`,
      customerId,
      priceId: packageId, // Using packageId as priceId for coins
      success: false,
    };

    this.checkoutSessions.set(sessionId, session);

    console.log('🧪 Mock Stripe: Created coins checkout session', session);

    return session;
  }

  /**
   * Get checkout session
   */
  getCheckoutSession(sessionId: string): StripeCheckoutSession | undefined {
    return this.checkoutSessions.get(sessionId);
  }
}

// Export singleton instance
export const mockStripe = new MockStripe();

/**
 * Helper to format price in dollars
 */
export function formatPrice(amountInCents: number): string {
  return `$${(amountInCents / 100).toFixed(2)}`;
}

/**
 * Helper to get tier monthly coins allocation
 */
export function getTierMonthlyCoins(tier: 'free' | 'starter' | 'professional' | 'business'): number {
  switch (tier) {
    case 'free':
      return 100;
    case 'starter':
      return 500;
    case 'professional':
      return 1500;
    case 'business':
      return 3500;
    default:
      return 0;
  }
}
