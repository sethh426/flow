/**
 * Trend Detection API
 * Detects emerging trends and predicts their lifecycle
 */

import { NextRequest, NextResponse } from 'next/server';
import { trendPredictor } from '@/services/trendPredictorService';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId, action, ...params } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'detectEmerging':
        // Detect emerging trends
        const niche = params.niche;
        const limit = params.limit || 10;
        result = await trendPredictor.detectEmergingTrends(userId, niche, limit);
        break;

      case 'predictLifecycle':
        // Predict trend lifecycle
        if (!params.trendId) {
          return NextResponse.json(
            { error: 'trendId is required' },
            { status: 400 }
          );
        }
        result = await trendPredictor.predictTrendLifecycle(params.trendId);
        break;

      case 'findOpportunities':
        // Find best trend opportunities
        result = await trendPredictor.findTrendOpportunities(userId);
        break;

      case 'analyzeCompetitors':
        // Analyze competitor trends
        if (!params.competitorIds || !Array.isArray(params.competitorIds)) {
          return NextResponse.json(
            { error: 'competitorIds array is required' },
            { status: 400 }
          );
        }
        result = await trendPredictor.analyzeCompetitorTrends(userId, params.competitorIds);
        break;

      case 'analyzeCombinations':
        // Analyze trend combinations
        const nicheForCombos = params.niche || '';
        result = await trendPredictor.analyzeTrendCombinations(userId, nicheForCombos);
        break;

      case 'setupAlerts':
        // Setup trend alerts
        if (!params.preferences) {
          return NextResponse.json(
            { error: 'preferences object is required' },
            { status: 400 }
          );
        }
        result = await trendPredictor.setupTrendAlerts(userId, params.preferences);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported: detectEmerging, predictLifecycle, findOpportunities, analyzeCompetitors, analyzeCombinations, setupAlerts' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      action,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Trend detection error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to detect trends',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Default: detect emerging trends
    const trends = await trendPredictor.detectEmergingTrends(userId, undefined, 10);

    return NextResponse.json({
      success: true,
      trends,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Trend detection error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to detect trends',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
