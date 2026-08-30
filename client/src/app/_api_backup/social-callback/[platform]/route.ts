/**
 * Social Media OAuth Callback Handler
 * Receives OAuth callbacks and exchanges codes for access tokens
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/social-callback/[platform] - Handle OAuth callback
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { platform: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      return new NextResponse(
        `<html><body>
          <script>
            window.opener.postMessage({ type: 'oauth_error', error: '${error}' }, '*');
            window.close();
          </script>
          <p>Authorization failed: ${error}</p>
        </body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    if (!code || !state) {
      return new NextResponse(
        '<html><body><script>window.close();</script><p>Error: Missing code or state</p></body></html>',
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Decode state
    const { userId, platform } = JSON.parse(Buffer.from(state, 'base64').toString());

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(platform, code);

    if (!tokenData) {
      return new NextResponse(
        '<html><body><script>window.close();</script><p>Error: Token exchange failed</p></body></html>',
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Fetch user profile
    const profileData = await fetchUserProfile(platform, tokenData.access_token);

    // Save to database
    const saveResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/social-platforms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        platform: platform.toLowerCase(),
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        username: profileData?.username || '',
        profileId: profileData?.id || '',
        expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
        metadata: profileData || {},
      }),
    });

    if (!saveResponse.ok) {
      throw new Error('Failed to save platform connection');
    }

    // Success! Close popup and notify parent window
    return new NextResponse(
      `<html><body>
        <script>
          window.opener.postMessage({ type: 'oauth_success', platform: '${platform}' }, '*');
          setTimeout(() => window.close(), 1000);
        </script>
        <div style="font-family: system-ui; text-align: center; padding: 40px;">
          <h2>✅ Successfully connected ${platform}!</h2>
          <p>You can close this window now.</p>
        </div>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  } catch (error: any) {
    console.error('❌ OAuth callback error:', error);
    return new NextResponse(
      `<html><body>
        <script>
          window.opener.postMessage({ type: 'oauth_error', error: '${error.message}' }, '*');
          window.close();
        </script>
        <p>Error: ${error.message}</p>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}

/**
 * Exchange authorization code for access token
 */
async function exchangeCodeForToken(platform: string, code: string): Promise<any> {
  const baseRedirectUri = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUri = `${baseRedirectUri}/api/social-callback/${platform}`;

  let tokenUrl: string;
  let clientId: string;
  let clientSecret: string;

  switch (platform) {
    case 'instagram':
    case 'facebook':
      tokenUrl = 'https://graph.facebook.com/v18.0/oauth/access_token';
      clientId = process.env.FACEBOOK_APP_ID || '';
      clientSecret = process.env.FACEBOOK_APP_SECRET || '';
      break;

    case 'twitter':
      tokenUrl = 'https://api.twitter.com/2/oauth2/token';
      clientId = process.env.TWITTER_CLIENT_ID || '';
      clientSecret = process.env.TWITTER_CLIENT_SECRET || '';
      break;

    case 'linkedin':
      tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
      clientId = process.env.LINKEDIN_CLIENT_ID || '';
      clientSecret = process.env.LINKEDIN_CLIENT_SECRET || '';
      break;

    case 'pinterest':
      tokenUrl = 'https://api.pinterest.com/v5/oauth/token';
      clientId = process.env.PINTEREST_APP_ID || '';
      clientSecret = process.env.PINTEREST_APP_SECRET || '';
      break;

    case 'tiktok':
      tokenUrl = 'https://open-api.tiktok.com/oauth/access_token/';
      clientId = process.env.TIKTOK_CLIENT_KEY || '';
      clientSecret = process.env.TIKTOK_CLIENT_SECRET || '';
      break;

    default:
      throw new Error(`Platform ${platform} not supported`);
  }

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  return await response.json();
}

/**
 * Fetch user profile from platform
 */
async function fetchUserProfile(platform: string, accessToken: string): Promise<any> {
  let profileUrl: string;

  switch (platform) {
    case 'instagram':
      profileUrl = `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${accessToken}`;
      break;

    case 'facebook':
      profileUrl = `https://graph.facebook.com/me?fields=id,name,picture&access_token=${accessToken}`;
      break;

    case 'twitter':
      profileUrl = 'https://api.twitter.com/2/users/me';
      break;

    case 'linkedin':
      profileUrl = 'https://api.linkedin.com/v2/me';
      break;

    case 'pinterest':
      profileUrl = 'https://api.pinterest.com/v5/user_account';
      break;

    case 'tiktok':
      profileUrl = `https://open-api.tiktok.com/user/info/?access_token=${accessToken}`;
      break;

    default:
      return null;
  }

  const response = await fetch(profileUrl, {
    headers: platform === 'twitter' || platform === 'linkedin' || platform === 'pinterest'
      ? { 'Authorization': `Bearer ${accessToken}` }
      : {},
  });

  if (!response.ok) {
    console.error(`Failed to fetch ${platform} profile`);
    return null;
  }

  return await response.json();
}
