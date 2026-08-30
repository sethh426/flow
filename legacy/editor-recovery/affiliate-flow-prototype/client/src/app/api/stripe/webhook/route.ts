/**
 * Stripe Webhooks - Handle Stripe events
 * 
 * POST /api/stripe/webhook - Process Stripe webhooks
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import admin from 'firebase-admin';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-09-30.clover'
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  const serviceAccount = require('@/../../serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') || '';

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout
 */
async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id || session.metadata?.userId;
  
  if (!userId) {
    console.error('No userId in checkout session');
    return;
  }

  console.log('✅ Checkout completed for user:', userId);

  // Update user subscription in Firestore
  await db.collection('users').doc(userId).update({
    stripeCustomerId: session.customer,
    subscriptionStatus: 'active',
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

/**
 * Handle subscription created
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  // Find user by Stripe customer ID
  const usersSnapshot = await db.collection('users')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();

  if (usersSnapshot.empty) {
    console.error('User not found for customer:', customerId);
    return;
  }

  const userId = usersSnapshot.docs[0].id;
  const plan = getPlanFromSubscription(subscription);

  console.log('✅ Subscription created:', userId, plan);

  // Update user document
  await db.collection('users').doc(userId).update({
    plan,
    subscriptionId: subscription.id,
    subscriptionStatus: subscription.status,
    currentPeriodEnd: new Date(((subscription as any).current_period_end as number) * 1000),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  const usersSnapshot = await db.collection('users')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();

  if (usersSnapshot.empty) {
    return;
  }

  const userId = usersSnapshot.docs[0].id;
  const plan = getPlanFromSubscription(subscription);

  console.log('✅ Subscription updated:', userId, plan, subscription.status);

  await db.collection('users').doc(userId).update({
    plan,
    subscriptionStatus: subscription.status,
    currentPeriodEnd: new Date(((subscription as any).current_period_end as number) * 1000),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

/**
 * Handle subscription deleted
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  const usersSnapshot = await db.collection('users')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();

  if (usersSnapshot.empty) {
    return;
  }

  const userId = usersSnapshot.docs[0].id;

  console.log('⚠️ Subscription cancelled:', userId);

  await db.collection('users').doc(userId).update({
    plan: 'free',
    subscriptionStatus: 'cancelled',
    subscriptionId: null,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('✅ Payment succeeded:', invoice.id);

  // Log payment in Firestore
  await db.collection('payments').add({
    invoiceId: invoice.id,
    customerId: invoice.customer,
    amount: invoice.amount_paid / 100,
    currency: invoice.currency,
    status: 'succeeded',
    createdAt: new Date(invoice.created * 1000)
  });
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.error('❌ Payment failed:', invoice.id);

  const customerId = invoice.customer as string;
  
  const usersSnapshot = await db.collection('users')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();

  if (!usersSnapshot.empty) {
    const userId = usersSnapshot.docs[0].id;

    // Update subscription status
    await db.collection('users').doc(userId).update({
      subscriptionStatus: 'past_due',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  // Log failed payment
  await db.collection('payments').add({
    invoiceId: invoice.id,
    customerId: invoice.customer,
    amount: invoice.amount_due / 100,
    currency: invoice.currency,
    status: 'failed',
    createdAt: new Date(invoice.created * 1000)
  });
}

/**
 * Get plan name from subscription
 */
function getPlanFromSubscription(subscription: Stripe.Subscription): string {
  const priceId = subscription.items.data[0]?.price.id;

  if (priceId?.includes('business')) {
    return 'business';
  } else if (priceId?.includes('pro')) {
    return 'pro';
  }

  return 'free';
}
