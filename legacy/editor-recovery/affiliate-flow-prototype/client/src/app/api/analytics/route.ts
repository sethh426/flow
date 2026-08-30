/**
 * Analytics API - Real-time Metrics
 * Calculates actual statistics from Firestore data
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

// Required for static export
export const dynamic = 'force-static';
export const revalidate = false;

interface Campaign {
  id: string;
  status?: string;
  clicks?: number;
  conversions?: number;
  revenue?: number;
  impressions?: number;
  createdAt?: any;
  [key: string]: any;
}

interface Product {
  id: string;
  status?: string;
  views?: number;
  clicks?: number;
  sales?: number;
  revenue?: number;
  createdAt?: any;
  [key: string]: any;
}

interface AnalyticsMetrics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalProducts: number;
  approvedProducts: number;
  totalRevenue: number;
  totalConversions: number;
  totalClicks: number;
  totalImpressions: number;
  averageConversionRate: number;
  recentActivity: {
    date: string;
    campaignsCreated: number;
    productsAdded: number;
    revenue: number;
  }[];
}

// GET - Fetch real-time analytics
export async function GET(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d'; // 24h, 7d, 30d, 90d
    const userId = searchParams.get('userId') || 'anonymous';

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    switch (timeRange) {
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Fetch campaigns
    const campaignsSnapshot = await db.collection('campaigns')
      .where('userId', '==', userId)
      .get();

    const campaigns = campaignsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Fetch products
    const productsSnapshot = await db.collection('products')
      .get();

    const products = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Calculate metrics
    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter((c: Campaign) => c.status === 'active').length;
    const totalProducts = products.length;
    const approvedProducts = products.filter((p: Product) => 
      p.status === 'approved_for_posting' || p.status === 'posted'
    ).length;

    // Aggregate analytics from campaigns
    let totalRevenue = 0;
    let totalConversions = 0;
    let totalClicks = 0;
    let totalImpressions = 0;

    campaigns.forEach((campaign: Campaign) => {
      if (campaign.analytics) {
        totalRevenue += campaign.analytics.revenue || 0;
        totalConversions += campaign.analytics.conversions || 0;
        totalClicks += campaign.analytics.clicks || 0;
        totalImpressions += campaign.analytics.impressions || 0;
      }
    });

    // Aggregate analytics from products
    products.forEach((product: Product) => {
      if (product.analytics) {
        totalRevenue += product.analytics.revenue || 0;
        totalConversions += product.analytics.conversions || 0;
        totalClicks += product.analytics.clicks || 0;
        totalImpressions += (product.analytics.views || 0);
      }
    });

    // Calculate conversion rate
    const averageConversionRate = totalClicks > 0 
      ? (totalConversions / totalClicks) * 100 
      : 0;

    // Get recent activity (campaigns/products created in time range)
    const recentCampaigns = campaigns.filter((c: Campaign) => {
      const createdAt = new Date(c.createdAt);
      return createdAt >= startDate;
    });

    const recentProducts = products.filter((p: Product) => {
      const createdAt = new Date(p.createdAt);
      return createdAt >= startDate;
    });

    // Group by date for activity chart
    const activityMap = new Map<string, { campaignsCreated: number; productsAdded: number; revenue: number }>();
    
    recentCampaigns.forEach((c: Campaign) => {
      const date = new Date(c.createdAt).toISOString().split('T')[0];
      const existing = activityMap.get(date) || { campaignsCreated: 0, productsAdded: 0, revenue: 0 };
      existing.campaignsCreated += 1;
      existing.revenue += c.analytics?.revenue || 0;
      activityMap.set(date, existing);
    });

    recentProducts.forEach((p: Product) => {
      const date = new Date(p.createdAt).toISOString().split('T')[0];
      const existing = activityMap.get(date) || { campaignsCreated: 0, productsAdded: 0, revenue: 0 };
      existing.productsAdded += 1;
      existing.revenue += p.analytics?.revenue || 0;
      activityMap.set(date, existing);
    });

    const recentActivity = Array.from(activityMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const metrics: AnalyticsMetrics = {
      totalCampaigns,
      activeCampaigns,
      totalProducts,
      approvedProducts,
      totalRevenue,
      totalConversions,
      totalClicks,
      totalImpressions,
      averageConversionRate,
      recentActivity,
    };

    return NextResponse.json({ metrics });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics', details: error.message },
      { status: 500 }
    );
  }
}
