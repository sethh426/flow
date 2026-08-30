import { NextRequest, NextResponse } from 'next/server';
import { findTrendingProducts } from '@/ai/flows/trending-product-flow';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category } = body;

    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }

    console.log('Finding trends for category:', category);

    // Call the server-side AI flow
    const result = await findTrendingProducts({ category });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Trend search error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to find trends',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}
