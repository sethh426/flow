/**
 * Revenue Forecasting API
 * Predicts future revenue based on historical data and trends
 */

import { NextRequest, NextResponse } from 'next/server';
import { revenueForecaster } from '@/services/revenueForecastService';

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
      case 'forecast':
        // Forecast revenue for a period
        const period = params.period || 'month';
        const startDate = params.startDate ? new Date(params.startDate) : undefined;
        result = await revenueForecaster.forecastRevenue(userId, period, startDate);
        break;

      case 'predictDecision':
        // Predict impact of a decision
        if (!params.decision) {
          return NextResponse.json(
            { error: 'decision type is required' },
            { status: 400 }
          );
        }
        result = await revenueForecaster.predictDecisionImpact(
          userId,
          params.decision,
          params.decisionParams || {}
        );
        break;

      case 'runScenario':
        // Run scenario modeling
        if (!params.scenarios) {
          return NextResponse.json(
            { error: 'scenarios array is required' },
            { status: 400 }
          );
        }
        result = await revenueForecaster.runScenarioModel(userId, params.scenarios);
        break;

      case 'optimizeBudget':
        // Get budget optimization recommendations
        result = await revenueForecaster.optimizeBudget(userId);
        break;

      case 'predictCampaignROI':
        // Predict campaign ROI
        if (!params.campaignId) {
          return NextResponse.json(
            { error: 'campaignId is required' },
            { status: 400 }
          );
        }
        result = await revenueForecaster.predictCampaignROI(userId, params.campaignId);
        break;

      case 'detectAnomalies':
        // Detect revenue anomalies
        result = await revenueForecaster.detectAnomalies(userId);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported: forecast, predictDecision, runScenario, optimizeBudget, predictCampaignROI, detectAnomalies' },
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
    console.error('Revenue forecasting error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to forecast revenue',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
