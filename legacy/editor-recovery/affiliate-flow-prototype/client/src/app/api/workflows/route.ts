/**
 * Workflows API - Main Route
 * 
 * Handle workflow CRUD operations
 * GET /api/workflows - List all workflows
 * POST /api/workflows - Create new workflow
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
 * GET /api/workflows - List all workflows for user
 */
export async function GET(request: NextRequest) {
  try {
    // Get userId from query params or auth header
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Query workflows for user
    const workflowsSnapshot = await db.collection('workflows')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const workflows = workflowsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      workflows,
      count: workflows.length
    });

  } catch (error: any) {
    console.error('❌ Get workflows error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch workflows' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workflows - Create new workflow
 */
export async function POST(request: NextRequest) {
  try {
    const workflowData = await request.json();

    // Validate required fields
    if (!workflowData.userId || !workflowData.name) {
      return NextResponse.json(
        { error: 'userId and name are required' },
        { status: 400 }
      );
    }

    // Create workflow document
    const workflow = {
      userId: workflowData.userId,
      name: workflowData.name,
      description: workflowData.description || '',
      niche: workflowData.niche || 'general',
      trigger: workflowData.trigger || {
        type: 'manual',
        config: {}
      },
      stages: workflowData.stages || [],
      status: workflowData.status || 'draft',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      executionCount: 0
    };

    const docRef = await db.collection('workflows').add(workflow);

    return NextResponse.json({
      success: true,
      workflowId: docRef.id,
      workflow: {
        id: docRef.id,
        ...workflow
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Create workflow error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create workflow' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/workflows - Update existing workflow
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Workflow id is required' },
        { status: 400 }
      );
    }

    const workflowRef = db.collection('workflows').doc(id);
    const doc = await workflowRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    await workflowRef.update({
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      workflowId: id,
      workflow: { id, ...updates }
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
 * DELETE /api/workflows - Delete a workflow
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Workflow id is required' },
        { status: 400 }
      );
    }

    const workflowRef = db.collection('workflows').doc(id);
    const doc = await workflowRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    await workflowRef.delete();

    return NextResponse.json({
      success: true,
      message: 'Workflow deleted successfully',
      workflowId: id
    });

  } catch (error: any) {
    console.error('❌ Delete workflow error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete workflow' },
      { status: 500 }
    );
  }
}
