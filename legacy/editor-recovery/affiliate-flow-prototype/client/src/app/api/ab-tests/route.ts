/**
 * A/B Testing API - Experiment Management
 * Full CRUD operations for A/B tests with Firestore
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

interface ABTest {
  id?: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'completed' | 'paused';
  campaignId?: string;
  variantA: {
    name: string;
    description: string;
    contentUrl?: string;
    traffic: number; // Percentage 0-100
  };
  variantB: {
    name: string;
    description: string;
    contentUrl?: string;
    traffic: number; // Percentage 0-100
  };
  metrics: {
    variantA: {
      impressions: number;
      clicks: number;
      conversions: number;
      revenue: number;
    };
    variantB: {
      impressions: number;
      clicks: number;
      conversions: number;
      revenue: number;
    };
  };
  statistics?: {
    conversionRateA: number;
    conversionRateB: number;
    confidenceLevel: number;
    winner?: 'A' | 'B' | 'inconclusive';
  };
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

// GET - Fetch all A/B tests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'anonymous';
    const status = searchParams.get('status'); // Optional filter

    let query = db.collection('ab-tests').where('userId', '==', userId);
    
    if (status) {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();

    const tests = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ tests, count: tests.length });
  } catch (error: any) {
    console.error('Error fetching A/B tests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch A/B tests', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new A/B test
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      description, 
      campaignId, 
      variantA, 
      variantB,
      userId = 'anonymous'
    } = body;

    // Validation
    if (!name || !variantA || !variantB) {
      return NextResponse.json(
        { error: 'Name, variantA, and variantB are required' },
        { status: 400 }
      );
    }

    // Ensure traffic splits add up to 100
    const totalTraffic = (variantA.traffic || 50) + (variantB.traffic || 50);
    if (totalTraffic !== 100) {
      return NextResponse.json(
        { error: 'Traffic splits must add up to 100%' },
        { status: 400 }
      );
    }

    const testData: ABTest = {
      name,
      description: description || '',
      status: 'draft',
      campaignId: campaignId || null,
      variantA: {
        name: variantA.name || 'Variant A',
        description: variantA.description || '',
        contentUrl: variantA.contentUrl || '',
        traffic: variantA.traffic || 50,
      },
      variantB: {
        name: variantB.name || 'Variant B',
        description: variantB.description || '',
        contentUrl: variantB.contentUrl || '',
        traffic: variantB.traffic || 50,
      },
      metrics: {
        variantA: {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          revenue: 0,
        },
        variantB: {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          revenue: 0,
        },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId,
    };

    const docRef = await db.collection('ab-tests').add(testData);

    return NextResponse.json({
      success: true,
      testId: docRef.id,
      test: { id: docRef.id, ...testData },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating A/B test:', error);
    return NextResponse.json(
      { error: 'Failed to create A/B test', details: error.message },
      { status: 500 }
    );
  }
}
