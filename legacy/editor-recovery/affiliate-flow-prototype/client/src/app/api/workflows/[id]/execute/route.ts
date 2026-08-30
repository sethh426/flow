/**
 * Workflows API - Execute Workflow
 * 
 * POST /api/workflows/[id]/execute - Execute workflow
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
 * POST /api/workflows/[id]/execute - Execute workflow
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { input = {} } = await request.json();

    // Get workflow
    const workflowDoc = await db.collection('workflows').doc(id).get();

    if (!workflowDoc.exists) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    const workflow = workflowDoc.data();

    if (workflow?.status !== 'active' && workflow?.status !== 'draft') {
      return NextResponse.json(
        { error: 'Workflow is not active' },
        { status: 400 }
      );
    }

    // Create execution record
    const execution = {
      workflowId: id,
      userId: workflow.userId,
      input,
      status: 'running',
      startedAt: admin.firestore.FieldValue.serverTimestamp(),
      stages: {}
    };

    const executionRef = await db.collection('workflow-executions').add(execution);

    // Call workflow-executor service
    const workflowExecutorUrl = process.env.WORKFLOW_EXECUTOR_URL || 'http://localhost:8082';
    
    // Send workflow to executor (non-blocking)
    fetch(`${workflowExecutorUrl}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        executionId: executionRef.id,
        workflowId: id,
        workflow,
        input
      })
    }).catch(error => {
      console.error('❌ Workflow executor error:', error);
    });

    // Update workflow execution count
    await db.collection('workflows').doc(id).update({
      executionCount: admin.firestore.FieldValue.increment(1),
      lastExecutedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return NextResponse.json({
      success: true,
      executionId: executionRef.id,
      message: 'Workflow execution started',
      status: 'running'
    });

  } catch (error: any) {
    console.error('❌ Execute workflow error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to execute workflow' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/workflows/[id]/execute - Get execution status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const executionId = searchParams.get('executionId');

    if (!executionId) {
      // Return last 10 executions
      const executionsSnapshot = await db.collection('workflow-executions')
        .where('workflowId', '==', id)
        .orderBy('startedAt', 'desc')
        .limit(10)
        .get();

      const executions = executionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return NextResponse.json({
        success: true,
        executions
      });
    }

    // Get specific execution
    const executionDoc = await db.collection('workflow-executions').doc(executionId).get();

    if (!executionDoc.exists) {
      return NextResponse.json(
        { error: 'Execution not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      execution: {
        id: executionDoc.id,
        ...executionDoc.data()
      }
    });

  } catch (error: any) {
    console.error('❌ Get execution status error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get execution status' },
      { status: 500 }
    );
  }
}
