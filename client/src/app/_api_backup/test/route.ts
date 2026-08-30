/**
 * Test API Endpoint for Error Handling Demo
 */

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Simulate random success/failure for testing retry logic
  const shouldFail = Math.random() > 0.5;
  
  if (shouldFail) {
    return NextResponse.json(
      { error: 'Random failure for testing retry logic' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: 'API call successful',
    timestamp: Date.now(),
    cached: false,
  });
}
