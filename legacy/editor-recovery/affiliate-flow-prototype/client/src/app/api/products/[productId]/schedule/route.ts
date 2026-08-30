/**
 * Product Scheduling API
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function POST(
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
    const { scheduledDate, autoPublish } = body;

    if (!scheduledDate) {
      return NextResponse.json(
        { error: 'Scheduled date is required' },
        { status: 400 }
      );
    }

    await db.collection('products').doc(productId).update({
      scheduledDate: new Date(scheduledDate).toISOString(),
      autoPublish: autoPublish ?? true,
      status: 'scheduled',
      updatedAt: new Date().toISOString(),
    });

    const updated = await db.collection('products').doc(productId).get();

    return NextResponse.json({
      success: true,
      product: {
        id: updated.id,
        ...updated.data(),
      },
    });
  } catch (error: any) {
    console.error('Error scheduling product:', error);
    return NextResponse.json(
      { error: 'Failed to schedule product', details: error.message },
      { status: 500 }
    );
  }
}
