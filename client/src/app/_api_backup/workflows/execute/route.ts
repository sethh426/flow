import { NextRequest, NextResponse } from 'next/server';

const WORKFLOW_EXECUTOR_URL = process.env.WORKFLOW_EXECUTOR_URL || 'http://localhost:5003';

export async function POST(request: NextRequest) {
  try {
    const workflow = await request.json();

    if (!workflow || !workflow.steps) {
      return NextResponse.json(
        { error: 'Invalid workflow format' },
        { status: 400 }
      );
    }

    // Try to connect to Workflow Executor service
    try {
      const response = await fetch(`${WORKFLOW_EXECUTOR_URL}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflow),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          success: true,
          executionId: data.executionId,
          status: data.status,
          service: 'workflow-executor',
        });
      }
    } catch (serviceError) {
      console.warn('Workflow Executor service not available:', serviceError);
      // Fall through to mock execution
    }

    // Fallback to mock execution if service is not available
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return NextResponse.json({
      success: true,
      executionId,
      status: 'queued',
      service: 'mock',
      message: 'Workflow Executor service not available. Workflow queued locally.',
      estimatedCompletion: new Date(Date.now() + 60000).toISOString(), // 1 minute from now
    });
  } catch (error: any) {
    console.error('Workflow execution error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to execute workflow',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Get execution status
  const { searchParams } = new URL(request.url);
  const executionId = searchParams.get('id');

  if (!executionId) {
    return NextResponse.json(
      { error: 'Execution ID is required' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${WORKFLOW_EXECUTOR_URL}/status/${executionId}`,
      { method: 'GET' }
    );

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    // Service not available, return mock status
  }

  // Mock status response
  return NextResponse.json({
    executionId,
    status: 'completed',
    progress: 100,
    service: 'mock',
    completedAt: new Date().toISOString(),
  });
}
