/**
 * Vision API - Image Analysis Endpoint
 * 
 * Analyzes product images using Google Cloud Vision API
 * POST /api/vision/analyze
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, saveToFirestore = false } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'imageUrl is required' },
        { status: 400 }
      );
    }

    // Call vision-analyzer service
    const visionServiceUrl = process.env.VISION_ANALYZER_URL || 'http://localhost:8083';
    
    const response = await fetch(`${visionServiceUrl}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl,
        saveToFirestore
      })
    });

    if (!response.ok) {
      throw new Error('Vision analysis failed');
    }

    const data = await response.json();

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('❌ Vision analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze image' },
      { status: 500 }
    );
  }
}
