
import { NextResponse } from 'next/server';

// This is an API route, not a page with a UI.
// It's used for health checks by monitoring services.
export async function GET() {
  try {
    // In a real application, you might add checks here to verify
    // database connectivity or other critical services.
    // For now, if the app is running, we'll consider it healthy.
    
    return NextResponse.json(
      { status: 'ok', timestamp: new Date().toISOString() },
      { status: 200 }
    );
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { status: 'error', message: (error as Error).message },
      { status: 500 }
    );
  }
}
