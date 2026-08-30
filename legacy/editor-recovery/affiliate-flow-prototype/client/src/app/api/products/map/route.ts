import { NextRequest, NextResponse } from 'next/server';

const PRODUCT_MAPPER_URL = process.env.PRODUCT_MAPPER_URL || 'http://localhost:5002';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productName, sourceUrl, targetStore } = body;

    if (!productName) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      );
    }

    // Try to connect to Product Mapper service
    try {
      const response = await fetch(`${PRODUCT_MAPPER_URL}/map-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          sourceUrl,
          targetStore: targetStore || 'all',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          success: true,
          mappedProducts: data.matches || [],
          service: 'product-mapper',
        });
      }
    } catch (serviceError) {
      console.warn('Product Mapper service not available:', serviceError);
      // Fall through to mock data
    }

    // Fallback to mock data if service is not available
    return NextResponse.json({
      success: true,
      mappedProducts: [
        {
          name: productName,
          store: 'Amazon',
          url: `https://amazon.com/search?k=${encodeURIComponent(productName)}`,
          price: '$XX.XX',
          confidence: 0.85,
          available: true,
        },
        {
          name: productName,
          store: 'Walmart',
          url: `https://walmart.com/search?q=${encodeURIComponent(productName)}`,
          price: '$XX.XX',
          confidence: 0.78,
          available: true,
        },
      ],
      service: 'mock',
      message: 'Product Mapper service not available. Using mock data.',
    });
  } catch (error: any) {
    console.error('Product mapping error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to map product',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Health check for Product Mapper service
  try {
    const response = await fetch(`${PRODUCT_MAPPER_URL}/health`, {
      method: 'GET',
    });

    if (response.ok) {
      return NextResponse.json({
        status: 'connected',
        service: 'product-mapper',
        url: PRODUCT_MAPPER_URL,
      });
    }
  } catch (error) {
    return NextResponse.json({
      status: 'disconnected',
      service: 'product-mapper',
      url: PRODUCT_MAPPER_URL,
      message: 'Service not available. Using mock data.',
    });
  }

  return NextResponse.json({
    status: 'unknown',
  });
}
