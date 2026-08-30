/**
 * AI Costs API
 * 
 * Provides metrics and cost tracking for Smart AI Router usage
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSmartAIRouter } from '@/lib/smart-ai-router';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ai-costs
 * Returns current AI usage metrics and costs
 */
export async function GET(request: NextRequest) {
  try {
    const router = getSmartAIRouter();
    const metrics = router.getMetrics();

    return NextResponse.json({
      success: true,
      metrics: {
        totalRequests: metrics.totalRequests,
        totalCost: `$${metrics.totalCost.toFixed(6)}`,
        avgCostPerRequest: `$${metrics.avgCostPerRequest.toFixed(6)}`,
        avgLatency: `${Math.round(metrics.avgLatency)}ms`,
        tokens: {
          input: metrics.totalTokensIn.toLocaleString(),
          output: metrics.totalTokensOut.toLocaleString(),
          total: (metrics.totalTokensIn + metrics.totalTokensOut).toLocaleString()
        },
        costBreakdown: {
          inputCost: `$${((metrics.totalTokensIn / 1000) * 0.0001).toFixed(6)}`,
          outputCost: `$${((metrics.totalTokensOut / 1000) * 0.0004).toFixed(6)}`
        },
        projections: {
          costPer1000Requests: `$${(metrics.avgCostPerRequest * 1000).toFixed(2)}`,
          costPerMonth: `$${(metrics.avgCostPerRequest * 30000).toFixed(2)}`, // Assuming 1000 requests/day
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI Costs API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch AI costs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai-costs/reset
 * Reset metrics (for testing/development)
 */
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === 'reset') {
      const router = getSmartAIRouter();
      router.resetMetrics();

      return NextResponse.json({
        success: true,
        message: 'Metrics reset successfully'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('AI Costs reset error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to reset metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
