/**
 * Vision API - OCR Text Extraction Endpoint
 * 
 * Extracts text from product images
 * POST /api/vision/ocr
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'imageUrl is required' },
        { status: 400 }
      );
    }

    // Call vision-analyzer service
    const visionServiceUrl = process.env.VISION_ANALYZER_URL || 'http://localhost:8083';
    
    const response = await fetch(`${visionServiceUrl}/ocr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl
      })
    });

    if (!response.ok) {
      throw new Error('OCR extraction failed');
    }

    const data = await response.json();

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('❌ OCR extraction error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to extract text' },
      { status: 500 }
    );
  }
}
