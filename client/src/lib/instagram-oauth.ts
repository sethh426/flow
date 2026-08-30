/**
 * Instagram OAuth Library
 * 
 * Handles Instagram Business API OAuth flow
 * Store and manage access tokens securely
 */

import admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  const serviceAccount = require('@/../../serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

interface InstagramAccount {
  userId: string;
  accessToken: string;
  instagramUserId: string;
  username: string;
  accountType: 'BUSINESS' | 'CREATOR';
  expiresAt: number;
  refreshToken?: string;
  connectedAt: Date;
}

/**
 * Get Instagram OAuth URL
 */
export function getInstagramAuthUrl(userId: string): string {
  const appId = process.env.INSTAGRAM_APP_ID;
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI || 'http://localhost:3000/api/instagram/callback';
  
  const scope = 'instagram_basic,instagram_content_publish,pages_read_engagement,pages_manage_posts';
  const state = Buffer.from(JSON.stringify({ userId, timestamp: Date.now() })).toString('base64');

  return `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code&state=${state}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code: string): Promise<{ access_token: string; token_type: string }> {
  const appId = process.env.INSTAGRAM_APP_ID;
  const appSecret = process.env.INSTAGRAM_APP_SECRET;
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI || 'http://localhost:3000/api/instagram/callback';

  const response = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: appId,
      client_secret: appSecret,
      redirect_uri: redirectUri,
      code
    })
  });

  if (!response.ok) {
    throw new Error('Failed to exchange code for token');
  }

  return await response.json();
}

/**
 * Get long-lived access token
 */
export async function getLongLivedToken(shortLivedToken: string): Promise<{ access_token: string; token_type: string; expires_in: number }> {
  const appId = process.env.INSTAGRAM_APP_ID;
  const appSecret = process.env.INSTAGRAM_APP_SECRET;

  const response = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`
  );

  if (!response.ok) {
    throw new Error('Failed to get long-lived token');
  }

  return await response.json();
}

/**
 * Get Instagram Business Account ID
 */
export async function getInstagramAccountId(accessToken: string, pageId: string): Promise<{ instagram_business_account: { id: string } }> {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${accessToken}`
  );

  if (!response.ok) {
    throw new Error('Failed to get Instagram account ID');
  }

  return await response.json();
}

/**
 * Get Instagram account info
 */
export async function getInstagramAccountInfo(accessToken: string, instagramAccountId: string): Promise<any> {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${instagramAccountId}?fields=username,name,account_type,media_count,followers_count,follows_count&access_token=${accessToken}`
  );

  if (!response.ok) {
    throw new Error('Failed to get Instagram account info');
  }

  return await response.json();
}

/**
 * Save Instagram connection to Firestore
 */
export async function saveInstagramConnection(connection: InstagramAccount): Promise<void> {
  await db.collection('instagram-accounts').doc(connection.userId).set({
    ...connection,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

/**
 * Get Instagram connection from Firestore
 */
export async function getInstagramConnection(userId: string): Promise<InstagramAccount | null> {
  const doc = await db.collection('instagram-accounts').doc(userId).get();
  
  if (!doc.exists) {
    return null;
  }

  return doc.data() as InstagramAccount;
}

/**
 * Check if token is expired
 */
export function isTokenExpired(connection: InstagramAccount): boolean {
  return Date.now() > connection.expiresAt;
}

/**
 * Refresh Instagram access token
 */
export async function refreshInstagramToken(userId: string): Promise<string> {
  const connection = await getInstagramConnection(userId);
  
  if (!connection) {
    throw new Error('Instagram account not connected');
  }

  // Get new long-lived token
  const tokenData = await getLongLivedToken(connection.accessToken);

  // Update connection with new token
  const expiresAt = Date.now() + (tokenData.expires_in * 1000);
  
  await db.collection('instagram-accounts').doc(userId).update({
    accessToken: tokenData.access_token,
    expiresAt,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return tokenData.access_token;
}

/**
 * Disconnect Instagram account
 */
export async function disconnectInstagram(userId: string): Promise<void> {
  await db.collection('instagram-accounts').doc(userId).delete();
}

/**
 * Get valid access token (refresh if needed)
 */
export async function getValidAccessToken(userId: string): Promise<string> {
  const connection = await getInstagramConnection(userId);
  
  if (!connection) {
    throw new Error('Instagram account not connected');
  }

  // Check if token needs refresh (refresh 7 days before expiry)
  const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
  if (Date.now() + sevenDaysInMs > connection.expiresAt) {
    return await refreshInstagramToken(userId);
  }

  return connection.accessToken;
}
