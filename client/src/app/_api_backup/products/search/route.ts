/**
 * Product Search API
 * 
 * Search products from multiple sources (Nordstrom, Amazon)
 * Generate affiliate links
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface ProductSearchRequest {
  query: string;
  source?: 'nordstrom' | 'amazon' | 'all';
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
}

export async function POST(request: NextRequest) {
  try {
    const searchRequest: ProductSearchRequest = await request.json();

    if (!searchRequest.query) {
      return NextResponse.json(
        { error: 'query is required' },
        { status: 400 }
      );
    }

    const source = searchRequest.source || 'all';
    const limit = searchRequest.limit || 20;

    let products = [];

    // Search based on source
    if (source === 'nordstrom' || source === 'all') {
      const nordstromProducts = await searchNordstrom(searchRequest);
      products.push(...nordstromProducts);
    }

    if (source === 'amazon' || source === 'all') {
      const amazonProducts = await searchAmazon(searchRequest);
      products.push(...amazonProducts);
    }

    // Apply filters
    products = applyFilters(products, searchRequest);

    // Sort by relevance (mock for now)
    products.sort((a, b) => b.score - a.score);

    // Limit results
    products = products.slice(0, limit);

    // Generate affiliate links
    products = products.map(product => ({
      ...product,
      affiliateLink: generateAffiliateLink(product)
    }));

    return NextResponse.json({
      success: true,
      products,
      count: products.length,
      source,
      query: searchRequest.query
    });

  } catch (error: any) {
    console.error('❌ Product search error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search products' },
      { status: 500 }
    );
  }
}

/**
 * Search Nordstrom products
 */
async function searchNordstrom(request: ProductSearchRequest) {
  // Call product-mapper service or MCP integration
  const productMapperUrl = process.env.PRODUCT_MAPPER_URL || 'http://localhost:8081';

  try {
    const response = await fetch(`${productMapperUrl}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: request.query,
        category: request.category,
        limit: request.limit || 10
      })
    });

    if (!response.ok) {
      console.warn('Nordstrom search failed, returning mock data');
      return getMockNordstromProducts(request);
    }

    const data = await response.json();
    return data.products || [];

  } catch (error) {
    console.warn('Nordstrom service unavailable, returning mock data');
    return getMockNordstromProducts(request);
  }
}

/**
 * Search Amazon products
 */
async function searchAmazon(request: ProductSearchRequest) {
  // TODO: Integrate Amazon Product Advertising API
  // For now, return mock data
  return getMockAmazonProducts(request);
}

/**
 * Apply price and other filters
 */
function applyFilters(products: any[], request: ProductSearchRequest) {
  let filtered = [...products];

  // Price filter
  if (request.minPrice !== undefined) {
    filtered = filtered.filter(p => p.price >= request.minPrice!);
  }
  if (request.maxPrice !== undefined) {
    filtered = filtered.filter(p => p.price <= request.maxPrice!);
  }

  // Category filter
  if (request.category) {
    filtered = filtered.filter(p => 
      p.category?.toLowerCase().includes(request.category!.toLowerCase())
    );
  }

  return filtered;
}

/**
 * Generate affiliate link
 */
function generateAffiliateLink(product: any): string {
  const affiliateId = process.env.AFFILIATE_ID || 'demo-affiliate-id';

  if (product.source === 'nordstrom') {
    // Nordstrom affiliate link format
    return `${product.url}?affiliate=${affiliateId}`;
  } else if (product.source === 'amazon') {
    // Amazon affiliate link format
    return `https://www.amazon.com/dp/${product.asin}?tag=${affiliateId}`;
  }

  return product.url;
}

/**
 * Mock Nordstrom products
 */
function getMockNordstromProducts(request: ProductSearchRequest) {
  const query = request.query.toLowerCase();
  
  return [
    {
      id: 'nord-1',
      source: 'nordstrom',
      name: `Trendy ${query} - Premium Quality`,
      description: `Beautiful ${query} perfect for any occasion. High-quality materials and expert craftsmanship.`,
      price: 89.99,
      originalPrice: 129.99,
      discount: 31,
      imageUrl: 'https://via.placeholder.com/400x600/4A90E2/ffffff?text=Product+1',
      url: 'https://nordstrom.com/product/1',
      brand: 'Designer Brand',
      category: request.category || 'Fashion',
      rating: 4.5,
      reviews: 245,
      inStock: true,
      score: 95
    },
    {
      id: 'nord-2',
      source: 'nordstrom',
      name: `Classic ${query} Collection`,
      description: `Timeless ${query} that never goes out of style. Available in multiple colors.`,
      price: 149.99,
      originalPrice: 199.99,
      discount: 25,
      imageUrl: 'https://via.placeholder.com/400x600/E24A90/ffffff?text=Product+2',
      url: 'https://nordstrom.com/product/2',
      brand: 'Luxury Brand',
      category: request.category || 'Fashion',
      rating: 4.8,
      reviews: 567,
      inStock: true,
      score: 92
    },
    {
      id: 'nord-3',
      source: 'nordstrom',
      name: `Modern ${query} - Best Seller`,
      description: `Our best-selling ${query}. Loved by thousands of customers.`,
      price: 69.99,
      originalPrice: 89.99,
      discount: 22,
      imageUrl: 'https://via.placeholder.com/400x600/90E24A/ffffff?text=Product+3',
      url: 'https://nordstrom.com/product/3',
      brand: 'Popular Brand',
      category: request.category || 'Fashion',
      rating: 4.6,
      reviews: 892,
      inStock: true,
      score: 90
    }
  ];
}

/**
 * Mock Amazon products
 */
function getMockAmazonProducts(request: ProductSearchRequest) {
  const query = request.query.toLowerCase();
  
  return [
    {
      id: 'amz-1',
      source: 'amazon',
      asin: 'B08N5WRWNW',
      name: `Amazon's Choice ${query}`,
      description: `Top-rated ${query} on Amazon. Fast shipping with Prime.`,
      price: 45.99,
      originalPrice: 59.99,
      discount: 23,
      imageUrl: 'https://via.placeholder.com/400x600/E2904A/ffffff?text=Amazon+1',
      url: 'https://amazon.com/dp/B08N5WRWNW',
      brand: 'Amazon Brand',
      category: request.category || 'General',
      rating: 4.4,
      reviews: 1523,
      inStock: true,
      prime: true,
      score: 88
    },
    {
      id: 'amz-2',
      source: 'amazon',
      asin: 'B09M3K2L7P',
      name: `Best ${query} Value Pack`,
      description: `Great value ${query}. Bestseller in its category.`,
      price: 34.99,
      originalPrice: 49.99,
      discount: 30,
      imageUrl: 'https://via.placeholder.com/400x600/4AE290/ffffff?text=Amazon+2',
      url: 'https://amazon.com/dp/B09M3K2L7P',
      brand: 'Value Brand',
      category: request.category || 'General',
      rating: 4.3,
      reviews: 2847,
      inStock: true,
      prime: true,
      score: 85
    }
  ];
}

/**
 * GET /api/products/search - Get trending products
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'trending';

    // Return trending products
    const trendingProducts = getMockNordstromProducts({ query: category, category });

    return NextResponse.json({
      success: true,
      products: trendingProducts,
      category,
      message: 'Trending products'
    });

  } catch (error: any) {
    console.error('❌ Get trending error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get trending products' },
      { status: 500 }
    );
  }
}
