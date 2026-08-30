/**
 * Workflows API - Individual Workflow Operations
 * 
 * GET /api/workflows/[id] - Get workflow details
 * PATCH /api/workflows/[id] - Update workflow
 * DELETE /api/workflows/[id] - Delete workflow
 */

import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';

export const dynamic = 'force-dynamic';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  const serviceAccount = require('@/../../serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

/**
 * GET /api/workflows/[id] - Get workflow details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const doc = await db.collection('workflows').doc(id).get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      workflow: {
        id: doc.id,
        ...doc.data()
      }
    });

  } catch (error: any) {
    console.error('❌ Get workflow error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch workflow' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/workflows/[id] - Update workflow
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const updates = await request.json();

    // Remove fields that shouldn't be updated directly
    delete updates.id;
    delete updates.userId;
    delete updates.createdAt;
    delete updates.executionCount;

    // Add updated timestamp
    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await db.collection('workflows').doc(id).update(updates);

    // Get updated workflow
    const doc = await db.collection('workflows').doc(id).get();

    return NextResponse.json({
      success: true,
      workflow: {
        id: doc.id,
        ...doc.data()
      }
    });

  } catch (error: any) {
    console.error('❌ Update workflow error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update workflow' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workflows/[id] - Delete workflow
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await db.collection('workflows').doc(id).delete();

    return NextResponse.json({
      success: true,
      message: 'Workflow deleted successfully'
    });

  } catch (error: any) {
    console.error('❌ Delete workflow error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete workflow' },
      { status: 500 }
    );
  }
}
