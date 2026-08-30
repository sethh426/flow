/**
 * Neural AI Generate API Route
 * 
 * Server-side proxy to Neural Orchestrator backend.
 * Handles AI content generation with intelligent model routing.
 */

import { NextRequest, NextResponse } from 'next/server';

const NEURAL_AI_BASE_URL = process.env.NEURAL_AI_URL || 
  process.env.NEXT_PUBLIC_NEURAL_AI_URL ||
  'http://localhost:5001'; // Default to Firebase emulator

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Forward request to Neural Orchestrator
    const response = await fetch(`${NEURAL_AI_BASE_URL}/aiGenerate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: body.prompt,
        format: body.format || 'text',
        tone: body.tone || 'professional',
        length: body.length || 'medium',
        priority: body.priority || 'quality',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Neural AI error:', errorText);
      return NextResponse.json(
        { success: false, error: `Neural AI error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Neural AI route error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
