/**
 * Individual Product API Routes
 * Update, Delete, Schedule
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

// GET single product
export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const { productId } = params;
    const doc = await db.collection('products').doc(productId).get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: doc.id,
      ...doc.data(),
    });
  } catch (error: any) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH update product
export async function PATCH(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const { productId } = params;
    const body = await request.json();

    const updateData = {
      ...body,
      updatedAt: new Date().toISOString(),
    };

    // Remove id if present
    delete updateData.id;

    await db.collection('products').doc(productId).update(updateData);

    const updated = await db.collection('products').doc(productId).get();

    return NextResponse.json({
      success: true,
      product: {
        id: updated.id,
        ...updated.data(),
      },
    });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const { productId } = params;

    // Check if exists
    const doc = await db.collection('products').doc(productId).get();
    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    await db.collection('products').doc(productId).delete();

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product', details: error.message },
      { status: 500 }
    );
  }
}
