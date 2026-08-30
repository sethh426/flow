/**
 * Products API Routes
 * Full CRUD operations with Firestore
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

// GET all products
export async function GET(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const productsRef = db.collection('products');
    const snapshot = await productsRef.orderBy('createdAt', 'desc').get();

    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ products, count: products.length });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error.message },
      { status: 500 }
    );
  }
}

// POST create new product
export async function POST(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { title, description, price, category, affiliateLink, imageUrl, source } = body;

    // Validation
    if (!title || !price) {
      return NextResponse.json(
        { error: 'Title and price are required' },
        { status: 400 }
      );
    }

    const productData = {
      title,
      description: description || '',
      price,
      category: category || 'general',
      affiliateLink: affiliateLink || '',
      imageUrl: imageUrl || '',
      source: source || 'manual',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      analytics: {
        views: 0,
        clicks: 0,
        conversions: 0,
        revenue: 0,
      },
    };

    const docRef = await db.collection('products').add(productData);

    return NextResponse.json({
      success: true,
      productId: docRef.id,
      product: { id: docRef.id, ...productData },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product', details: error.message },
      { status: 500 }
    );
  }
}
