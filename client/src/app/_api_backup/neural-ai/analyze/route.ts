/**
 * Neural AI Analyze API Route
 * 
 * Server-side proxy for content analysis via Neural Orchestrator.
 */

import { NextRequest, NextResponse } from 'next/server';

const NEURAL_AI_BASE_URL = process.env.NEURAL_AI_URL || 
  process.env.NEXT_PUBLIC_NEURAL_AI_URL ||
  'http://localhost:5001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${NEURAL_AI_BASE_URL}/aiAnalyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: body.content,
        analysisType: body.analysisType || 'general',
        priority: body.priority || 'quality',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Neural AI analysis error:', errorText);
      return NextResponse.json(
        { success: false, error: `Neural AI error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Neural AI analyze error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
