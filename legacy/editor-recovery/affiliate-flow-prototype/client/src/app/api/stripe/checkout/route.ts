/**
 * Stripe Checkout - Create Checkout Session
 * 
 * POST /api/stripe/checkout - Create Stripe checkout session for subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-09-30.clover'
});

interface CheckoutRequest {
  userId: string;
  plan: 'free' | 'pro' | 'business';
  billingPeriod: 'monthly' | 'yearly';
}

// Price IDs (create these in Stripe Dashboard)
const PRICE_IDS = {
  pro_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly',
  pro_yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || 'price_pro_yearly',
  business_monthly: process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID || 'price_business_monthly',
  business_yearly: process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID || 'price_business_yearly'
};

export async function POST(request: NextRequest) {
  try {
    const checkoutRequest: CheckoutRequest = await request.json();

    if (!checkoutRequest.userId || !checkoutRequest.plan) {
      return NextResponse.json(
        { error: 'userId and plan are required' },
        { status: 400 }
      );
    }

    if (checkoutRequest.plan === 'free') {
      return NextResponse.json(
        { error: 'Free plan does not require checkout' },
        { status: 400 }
      );
    }

    // Get price ID
    const priceKey = `${checkoutRequest.plan}_${checkoutRequest.billingPeriod}` as keyof typeof PRICE_IDS;
    const priceId = PRICE_IDS[priceKey];

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: checkoutRequest.userId + '@affiliateflow.com', // Replace with real email
      client_reference_id: checkoutRequest.userId,
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?upgrade=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?upgrade=cancelled`,
      metadata: {
        userId: checkoutRequest.userId,
        plan: checkoutRequest.plan,
        billingPeriod: checkoutRequest.billingPeriod
      }
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url
    });

  } catch (error: any) {
    console.error('❌ Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
