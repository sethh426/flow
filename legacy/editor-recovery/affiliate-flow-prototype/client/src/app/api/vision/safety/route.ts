/**
 * Vision API - Brand Safety Check Endpoint
 * 
 * Checks if image and text content is brand-safe
 * POST /api/vision/safety
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, text } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'imageUrl is required' },
        { status: 400 }
      );
    }

    // Call vision-analyzer service
    const visionServiceUrl = process.env.VISION_ANALYZER_URL || 'http://localhost:8083';
    
    const response = await fetch(`${visionServiceUrl}/safety`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl,
        text
      })
    });

    if (!response.ok) {
      throw new Error('Brand safety check failed');
    }

    const data = await response.json();

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('❌ Brand safety check error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check brand safety' },
      { status: 500 }
    );
  }
}
