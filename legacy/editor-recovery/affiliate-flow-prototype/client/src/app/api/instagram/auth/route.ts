/**
 * Instagram OAuth - Start Authentication
 * 
 * GET /api/instagram/auth - Redirect to Instagram OAuth
 */

import { NextRequest, NextResponse } from 'next/server';
import { getInstagramAuthUrl } from '@/lib/instagram-oauth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Generate Instagram OAuth URL
    const authUrl = getInstagramAuthUrl(userId);

    // Redirect to Instagram OAuth
    return NextResponse.redirect(authUrl);

  } catch (error: any) {
    console.error('❌ Instagram auth error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start Instagram auth' },
      { status: 500 }
    );
  }
}
