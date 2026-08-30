/**
 * Individual A/B Test API Routes
 * Update, Delete, and Statistical Analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

// Helper function to calculate statistical significance
interface VariantMetrics { impressions?: number; clicks?: number; conversions?: number; revenue?: number }
function calculateStatistics(metricsA: VariantMetrics = {}, metricsB: VariantMetrics = {}) {
  const clicksA = metricsA.clicks || 0;
  const conversionsA = metricsA.conversions || 0;
  const clicksB = metricsB.clicks || 0;
  const conversionsB = metricsB.conversions || 0;

  // Conversion rates
  const conversionRateA = clicksA > 0 ? (conversionsA / clicksA) * 100 : 0;
  const conversionRateB = clicksB > 0 ? (conversionsB / clicksB) * 100 : 0;

  // Simple confidence calculation (simplified z-test)
  // In production, use a proper statistical library
  let confidenceLevel = 0;
  let winner: 'A' | 'B' | 'inconclusive' = 'inconclusive';

  if (clicksA > 100 && clicksB > 100) {
    const pooledRate = (conversionsA + conversionsB) / (clicksA + clicksB);
    const seA = Math.sqrt(pooledRate * (1 - pooledRate) / clicksA);
    const seB = Math.sqrt(pooledRate * (1 - pooledRate) / clicksB);
    const seDiff = Math.sqrt(seA * seA + seB * seB);
    
    if (seDiff > 0) {
      const zScore = Math.abs((conversionRateA - conversionRateB) / 100 / seDiff);
      
      // Convert z-score to confidence level (simplified)
      if (zScore > 1.96) confidenceLevel = 95;
      else if (zScore > 1.645) confidenceLevel = 90;
      else if (zScore > 1.28) confidenceLevel = 80;
      
      if (confidenceLevel >= 90) {
        winner = conversionRateA > conversionRateB ? 'A' : 'B';
      }
    }
  }

  return {
    conversionRateA,
    conversionRateB,
    confidenceLevel,
    winner,
  };
}

// GET single A/B test
export async function GET(
  _request: NextRequest,
  { params }: { params: { testId: string } }
) {
  try {
    const { testId } = params;
    if (!db) return NextResponse.json({ error: 'DB not initialized' }, { status: 500 });
    const doc = await db.collection('ab-tests').doc(testId).get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'A/B test not found' },
        { status: 404 }
      );
    }

    const data = doc.data();
    
    // Calculate statistics
    const statistics = calculateStatistics(
      data?.metrics?.variantA,
      data?.metrics?.variantB
    );

    return NextResponse.json({
      id: doc.id,
      ...data,
      statistics,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching A/B test:', message);
    return NextResponse.json(
      { error: 'Failed to fetch A/B test', details: message },
      { status: 500 }
    );
  }
}

// PATCH - Update A/B test
export async function PATCH(
  request: NextRequest,
  { params }: { params: { testId: string } }
) {
  try {
    const { testId } = params;
    const body = await request.json();
    if (!db) return NextResponse.json({ error: 'DB not initialized' }, { status: 500 });

    const updateData = {
      ...body,
      updatedAt: new Date().toISOString(),
    };

    // Remove id if present
    delete updateData.id;

    // If metrics are updated, recalculate statistics
    if (updateData.metrics) {
      const statistics = calculateStatistics(
        updateData.metrics.variantA,
        updateData.metrics.variantB
      );
      updateData.statistics = statistics;
    }

    await db.collection('ab-tests').doc(testId).update(updateData);

    const updated = await db.collection('ab-tests').doc(testId).get();
    const data = updated.data();

    return NextResponse.json({
      success: true,
      test: {
        id: updated.id,
        ...data,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating A/B test:', message);
    return NextResponse.json(
      { error: 'Failed to update A/B test', details: message },
      { status: 500 }
    );
  }
}

// DELETE - Delete A/B test
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { testId: string } }
) {
  try {
    const { testId } = params;
    if (!db) return NextResponse.json({ error: 'DB not initialized' }, { status: 500 });

    // Check if exists
    const doc = await db.collection('ab-tests').doc(testId).get();
    if (!doc.exists) {
      return NextResponse.json(
        { error: 'A/B test not found' },
        { status: 404 }
      );
    }

    await db.collection('ab-tests').doc(testId).delete();

    return NextResponse.json({
      success: true,
      message: 'A/B test deleted successfully',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error deleting A/B test:', message);
    return NextResponse.json(
      { error: 'Failed to delete A/B test', details: message },
      { status: 500 }
    );
  }
}
