/**
 * Error Logging API Endpoint
 * Receives frontend errors and stores them for analysis
 */

import { NextRequest, NextResponse } from 'next/server';

interface ErrorLog {
  errorId: string;
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: number;
  userAgent: string;
  url: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  userId?: string;
  sessionId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const errorLog: ErrorLog = await request.json();

    // Validate error log
    if (!errorLog.errorId || !errorLog.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Frontend Error Logged:', {
        errorId: errorLog.errorId,
        message: errorLog.message,
        severity: errorLog.severity,
        url: errorLog.url,
        timestamp: new Date(errorLog.timestamp).toISOString(),
      });
    }

    // In production, you would:
    // 1. Store in Firestore/database
    // 2. Send to error tracking service (Sentry, Rollbar, etc.)
    // 3. Alert on critical errors
    // 4. Aggregate for analytics

    // Example Firestore storage (uncomment when ready)
    /*
    const { Firestore } = await import('@google-cloud/firestore');
    const firestore = new Firestore();
    
    await firestore.collection('error_logs').doc(errorLog.errorId).set({
      ...errorLog,
      createdAt: new Date(errorLog.timestamp),
      resolved: false,
    });
    
    // Alert on critical errors
    if (errorLog.severity === 'critical') {
      await sendSlackAlert(errorLog);
    }
    */

    // Example: Send to external service
    /*
    if (process.env.SENTRY_DSN) {
      await fetch('https://sentry.io/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SENTRY_TOKEN}`,
        },
        body: JSON.stringify(errorLog),
      });
    }
    */

    return NextResponse.json(
      {
        success: true,
        errorId: errorLog.errorId,
        message: 'Error logged successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Failed to log error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to log error',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to retrieve error logs (for admin dashboard)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get('severity');
    const limit = parseInt(searchParams.get('limit') || '50');

    // In production, query from Firestore
    /*
    const { Firestore } = await import('@google-cloud/firestore');
    const firestore = new Firestore();
    
    let query = firestore.collection('error_logs')
      .orderBy('timestamp', 'desc')
      .limit(limit);
    
    if (severity) {
      query = query.where('severity', '==', severity);
    }
    
    const snapshot = await query.get();
    const errors = snapshot.docs.map(doc => doc.data());
    
    return NextResponse.json({ errors, count: errors.length });
    */

    // For now, return mock data
    return NextResponse.json({
      errors: [],
      count: 0,
      message: 'Error logging system initialized',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to retrieve errors', details: error.message },
      { status: 500 }
    );
  }
}
