import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageData, editPrompt, maskData, saveToDisk } = body;

    if (!imageData || !editPrompt) {
      return NextResponse.json(
        { error: 'Missing required fields: imageData, editPrompt' },
        { status: 400 }
      );
    }

    // Call the image generator service for editing
    const IMAGE_GENERATOR_URL = 
      process.env.IMAGE_GENERATOR_URL || 
      'http://localhost:5001';

    const response = await fetch(`${IMAGE_GENERATOR_URL}/api/edit-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageData,
        editPrompt,
        maskData,
        saveToDisk: saveToDisk ?? false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to edit image');
    }

    const result = await response.json();

    // Convert base64 images to data URLs
    const images = result.images.map((img: any) => ({
      ...img,
      url: `data:${img.mimeType};base64,${img.data}`,
    }));

    return NextResponse.json({
      ...result,
      images,
    });
  } catch (error: any) {
    console.error('Image editing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to edit image' },
      { status: 500 }
    );
  }
}
