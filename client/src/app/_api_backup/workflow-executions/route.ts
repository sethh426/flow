/**
 * Workflow Executions API
 * Store and retrieve workflow execution history
 */

import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';

export const dynamic = 'force-dynamic';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  const serviceAccount = require('../../../../../serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

/**
 * GET /api/workflow-executions - Get execution history
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get('workflowId');
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    let query = db.collection('workflow_executions').where('userId', '==', userId);

    if (workflowId) {
      query = query.where('workflowId', '==', workflowId);
    }

    const snapshot = await query.orderBy('timestamp', 'desc').limit(50).get();

    const executions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      executions,
      count: executions.length,
    });
  } catch (error: any) {
    console.error('❌ Get executions error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/workflow-executions - Store execution result
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflowId, userId, executionId, status, results, errors, duration, timestamp } = body;

    if (!workflowId || !userId || !executionId) {
      return NextResponse.json(
        { error: 'workflowId, userId, and executionId are required' },
        { status: 400 }
      );
    }

    const execution = {
      workflowId,
      userId,
      executionId,
      status: status || 'completed',
      results: results || {},
      errors: errors || [],
      duration: duration || 0,
      timestamp: timestamp ? admin.firestore.Timestamp.fromDate(new Date(timestamp)) : admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('workflow_executions').add(execution);

    // Update workflow execution count
    const workflowRef = db.collection('workflows').doc(workflowId);
    await workflowRef.update({
      executionCount: admin.firestore.FieldValue.increment(1),
      lastExecutedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      executionId: docRef.id,
      execution: { id: docRef.id, ...execution },
    }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Create execution error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
