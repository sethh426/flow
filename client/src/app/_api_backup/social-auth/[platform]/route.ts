/**
 * Social Media OAuth Handler
 * Handles OAuth flows for different social media platforms
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface OAuthConfig {
  authUrl: string;
  clientId: string;
  redirectUri: string;
  scope: string[];
}

// OAuth configurations for different platforms
const getOAuthConfig = (platform: string, userId: string): OAuthConfig | null => {
  const baseRedirectUri = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUri = `${baseRedirectUri}/api/social-callback/${platform}`;

  switch (platform) {
    case 'instagram':
      return {
        authUrl: 'https://api.instagram.com/oauth/authorize',
        clientId: process.env.INSTAGRAM_CLIENT_ID || '',
        redirectUri,
        scope: ['user_profile', 'user_media', 'instagram_business_basic', 'instagram_business_manage_messages', 'instagram_business_manage_comments'],
      };

    case 'facebook':
      return {
        authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
        clientId: process.env.FACEBOOK_APP_ID || '',
        redirectUri,
        scope: ['pages_read_engagement', 'pages_manage_posts', 'pages_messaging', 'pages_read_user_content'],
      };

    case 'twitter':
      return {
        authUrl: 'https://twitter.com/i/oauth2/authorize',
        clientId: process.env.TWITTER_CLIENT_ID || '',
        redirectUri,
        scope: ['tweet.read', 'tweet.write', 'users.read', 'follows.read', 'follows.write'],
      };

    case 'linkedin':
      return {
        authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
        clientId: process.env.LINKEDIN_CLIENT_ID || '',
        redirectUri,
        scope: ['r_liteprofile', 'r_emailaddress', 'w_member_social', 'r_organization_social'],
      };

    case 'pinterest':
      return {
        authUrl: 'https://www.pinterest.com/oauth/',
        clientId: process.env.PINTEREST_APP_ID || '',
        redirectUri,
        scope: ['read_public', 'write_public', 'read_relationships', 'write_relationships'],
      };

    case 'tiktok':
      return {
        authUrl: 'https://www.tiktok.com/auth/authorize/',
        clientId: process.env.TIKTOK_CLIENT_KEY || '',
        redirectUri,
        scope: ['user.info.basic', 'video.list', 'video.publish'],
      };

    default:
      return null;
  }
};

/**
 * GET /api/social-auth/[platform] - Initiate OAuth flow
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { platform: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const platform = params.platform;

    if (!userId) {
      return new NextResponse(
        '<html><body><script>window.close();</script><p>Error: User ID required</p></body></html>',
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    const oauthConfig = getOAuthConfig(platform, userId);

    if (!oauthConfig) {
      return new NextResponse(
        '<html><body><script>window.close();</script><p>Error: Platform not supported</p></body></html>',
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    if (!oauthConfig.clientId) {
      return new NextResponse(
        `<html><body><script>window.close();</script><p>Error: ${platform} OAuth not configured</p></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Generate state parameter for security
    const state = Buffer.from(JSON.stringify({ userId, platform })).toString('base64');

    // Build authorization URL
    const authUrl = new URL(oauthConfig.authUrl);
    authUrl.searchParams.append('client_id', oauthConfig.clientId);
    authUrl.searchParams.append('redirect_uri', oauthConfig.redirectUri);
    authUrl.searchParams.append('scope', oauthConfig.scope.join(','));
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('response_type', 'code');

    // Redirect to OAuth provider
    return NextResponse.redirect(authUrl.toString());
  } catch (error: any) {
    console.error('❌ OAuth initiation error:', error);
    return new NextResponse(
      `<html><body><script>window.close();</script><p>Error: ${error.message}</p></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}
