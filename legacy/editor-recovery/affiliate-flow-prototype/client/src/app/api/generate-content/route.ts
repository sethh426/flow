import { NextRequest, NextResponse } from 'next/server';

const IMAGE_GENERATOR_URL = process.env.IMAGE_GENERATOR_URL || 'http://localhost:5001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { template, prompt, settings, aspectRatio, type } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Call image generator service
    const response = await fetch(`${IMAGE_GENERATOR_URL}/api/generate-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        productName: settings.productName,
        style: 'modern',
        purpose: template,
        saveToDisk: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.error || 'Image generation failed' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Return the first generated image
    if (data.images && data.images.length > 0) {
      const image = data.images[0];
      
      // Convert base64 to data URL
      const imageUrl = `data:${image.mimeType};base64,${image.data}`;
      
      return NextResponse.json({
        imageUrl,
        videoUrl: type === 'video' ? imageUrl : null, // For now, video uses same as image
        metadata: {
          fileName: image.fileName,
          template,
          settings,
        },
      });
    }

    return NextResponse.json(
      { error: 'No images generated' },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('Content generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
