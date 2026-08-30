import { NextRequest, NextResponse } from 'next/server';

const WORKFLOW_EXECUTOR_URL = process.env.WORKFLOW_EXECUTOR_URL || 'http://localhost:8080';

export async function POST(
  request: NextRequest,
  { params }: { params: { workflowId: string } }
) {
  try {
    const { workflowId } = params;
    const input = await request.json();

    // Call workflow executor service
    const response = await fetch(
      `${WORKFLOW_EXECUTOR_URL}/api/workflows/${workflowId}/execute`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      }
    );

    if (!response.ok) {
      throw new Error(`Workflow execution failed: ${response.statusText}`);
    }

    const result = await response.json();

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Workflow execution error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { workflowId: string } }
) {
  try {
    const { workflowId } = params;

    // Get workflow status/details from Firestore
    // TODO: Implement workflow details retrieval

    return NextResponse.json({
      workflowId,
      status: 'active',
      message: 'Workflow details endpoint'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
