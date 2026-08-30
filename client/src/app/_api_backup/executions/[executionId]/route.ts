import { NextRequest, NextResponse } from 'next/server';

const WORKFLOW_EXECUTOR_URL = process.env.WORKFLOW_EXECUTOR_URL || 'http://localhost:8080';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ executionId: string }> }
) {
  try {
    const { executionId } = await params;

    const response = await fetch(
      `${WORKFLOW_EXECUTOR_URL}/api/executions/${executionId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch execution: ${response.statusText}`);
    }

    const execution = await response.json();

    return NextResponse.json(execution);
  } catch (error: any) {
    console.error('Execution fetch error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
