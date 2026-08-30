/**
 * Instagram OAuth - Callback Handler
 * 
 * GET /api/instagram/callback - Handle OAuth callback
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  exchangeCodeForToken,
  getLongLivedToken,
  getInstagramAccountInfo,
  saveInstagramConnection
} from '@/lib/instagram-oauth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle error
    if (error) {
      return NextResponse.redirect(
        `/dashboard?instagram=error&message=${encodeURIComponent(error)}`
      );
    }

    if (!code || !state) {
      return NextResponse.json(
        { error: 'Invalid callback parameters' },
        { status: 400 }
      );
    }

    // Decode state to get userId
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    const { userId } = stateData;

    // Exchange code for short-lived token
    const shortTokenData = await exchangeCodeForToken(code);

    // Exchange for long-lived token
    const longTokenData = await getLongLivedToken(shortTokenData.access_token);

    // Get Instagram account info
    // Note: You'll need to get the Page ID first from Facebook Pages API
    // For now, we'll store the token and let the user select their Instagram account
    
    const expiresAt = Date.now() + (longTokenData.expires_in * 1000);

    // Save connection
    await saveInstagramConnection({
      userId,
      accessToken: longTokenData.access_token,
      instagramUserId: '', // Will be set when user selects Instagram account
      username: '',
      accountType: 'BUSINESS',
      expiresAt,
      connectedAt: new Date()
    });

    // Redirect back to dashboard
    return NextResponse.redirect('/dashboard?instagram=connected');

  } catch (error: any) {
    console.error('❌ Instagram callback error:', error);
    return NextResponse.redirect(
      `/dashboard?instagram=error&message=${encodeURIComponent(error.message)}`
    );
  }
}
