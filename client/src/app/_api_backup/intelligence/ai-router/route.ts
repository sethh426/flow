/**
 * Smart AI Router API
 * Routes AI tasks to the most cost-effective model
 */

import { NextRequest, NextResponse } from 'next/server';
import { smartAIRouter } from '@/services/smartAIRouterService';

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
      case 'route':
        // Route a task to best model
        if (!params.taskType || !params.prompt) {
          return NextResponse.json(
            { error: 'taskType and prompt are required' },
            { status: 400 }
          );
        }
        result = await smartAIRouter.routeTask(
          params.taskType,
          params.prompt,
          userId,
          params.options
        );
        break;

      case 'getStats':
        // Get routing statistics
        result = await smartAIRouter.getRoutingStats(userId);
        break;

      case 'trackBudget':
        // Track budget
        if (!params.monthlyBudget) {
          return NextResponse.json(
            { error: 'monthlyBudget is required' },
            { status: 400 }
          );
        }
        result = await smartAIRouter.trackBudget(userId, params.monthlyBudget);
        break;

      case 'analyzeEfficiency':
        // Analyze routing efficiency
        result = await smartAIRouter.analyzeRoutingEfficiency(userId);
        break;

      case 'routeWithFallback':
        // Route with fallback strategy
        if (!params.taskType || !params.prompt) {
          return NextResponse.json(
            { error: 'taskType and prompt are required' },
            { status: 400 }
          );
        }
        result = await smartAIRouter.routeWithFallback(
          params.taskType,
          params.prompt,
          userId,
          params.primaryModel
        );
        break;

      case 'runEnsemble':
        // Run multi-model ensemble
        if (!params.taskType || !params.prompt) {
          return NextResponse.json(
            { error: 'taskType and prompt are required' },
            { status: 400 }
          );
        }
        result = await smartAIRouter.runEnsemble(
          params.taskType,
          params.prompt,
          userId
        );
        break;

      case 'learnFromPerformance':
        // Learn from model performance
        if (!params.taskType || !params.modelUsed || params.success === undefined || !params.userSatisfaction || !params.responseTime) {
          return NextResponse.json(
            { error: 'taskType, modelUsed, success, userSatisfaction, and responseTime are required' },
            { status: 400 }
          );
        }
        await smartAIRouter.learnFromPerformance(
          userId,
          params.taskType,
          params.modelUsed,
          params.success,
          params.userSatisfaction,
          params.responseTime
        );
        result = { message: 'Performance feedback recorded' };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported: route, getStats, trackBudget, analyzeEfficiency, routeWithFallback, runEnsemble, learnFromPerformance' },
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
    console.error('AI router error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to route AI task',
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

    // Default: get routing stats
    const stats = await smartAIRouter.getRoutingStats(userId);

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI router error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get routing stats',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
