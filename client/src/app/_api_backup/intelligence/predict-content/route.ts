/**
 * Content Performance Prediction API
 * Predicts how content will perform before publishing
 */

import { NextRequest, NextResponse } from 'next/server';
import { contentPredictor } from '@/services/contentPredictorService';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId, content } = await request.json();

    if (!userId || !content) {
      return NextResponse.json(
        { error: 'userId and content are required' },
        { status: 400 }
      );
    }

    // Validate content structure
    if (!content.contentType || !content.platform || !content.content) {
      return NextResponse.json(
        { error: 'content must include contentType, platform, and content fields' },
        { status: 400 }
      );
    }

    // Convert scheduledTime string to Date object if present
    if (content.scheduledTime && typeof content.scheduledTime === 'string') {
      content.scheduledTime = new Date(content.scheduledTime);
    }

    // Predict performance
    const prediction = await contentPredictor.predictPerformance(userId, content);

    return NextResponse.json({
      success: true,
      prediction,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Content prediction error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to predict content performance',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
