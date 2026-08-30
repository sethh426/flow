import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, platform } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Missing imageUrl parameter' },
        { status: 400 }
      );
    }

    // Call Vision Analyzer service (running on port 8083)
    const response = await fetch('http://localhost:8083/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl,
        features: ['objects', 'labels', 'colors', 'text', 'faces']
      }),
    });

    if (!response.ok) {
      throw new Error('Vision Analyzer service error');
    }

    const visionData = await response.json();

    // Transform Vision API response to our format
    const analysis = {
      objects: visionData.objects || [],
      labels: visionData.labels || [],
      colors: visionData.colors || [],
      text: visionData.text || '',
      faces: visionData.faces || 0
    };

    return NextResponse.json({
      analysis,
      platform,
      imageUrl
    });

  } catch (error) {
    console.error('Error analyzing image:', error);
    
    // If Vision Analyzer is not running, return mock data
    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      return NextResponse.json({
        analysis: {
          objects: ['fashion item', 'clothing', 'accessory'],
          labels: ['style', 'trendy', 'modern'],
          colors: ['vibrant', 'neutral', 'bold'],
          text: '',
          faces: 0
        },
        platform: request.json().then(b => b.platform),
        imageUrl: request.json().then(b => b.imageUrl),
        warning: 'Vision Analyzer service not available, using mock data'
      });
    }

    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
}
