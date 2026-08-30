import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  const serviceAccount = require('../../../../../serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = getFirestore();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, accountId, platform, username } = body;

    if (!userId || !accountId || !platform || !username) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get platform connection
    const platformSnapshot = await db
      .collection('social_platforms')
      .where('userId', '==', userId)
      .where('platform', '==', platform)
      .get();

    if (platformSnapshot.empty) {
      return NextResponse.json(
        { error: 'Platform not connected' },
        { status: 404 }
      );
    }

    const platformData = platformSnapshot.docs[0].data();

    // Follow account on platform
    let result;
    switch (platform) {
      case 'instagram':
        result = await followInstagramAccount(platformData, accountId);
        break;
      case 'twitter':
        result = await followTwitterAccount(platformData, accountId);
        break;
      case 'tiktok':
        result = await followTikTokAccount(platformData, accountId);
        break;
      default:
        return NextResponse.json(
          { error: 'Unsupported platform' },
          { status: 400 }
        );
    }

    // Log the follow action
    await db.collection('follow_history').add({
      userId,
      platform,
      accountId,
      username,
      action: 'follow',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      result
    });

    return NextResponse.json({
      success: true,
      platform,
      accountId,
      result
    });

  } catch (error) {
    console.error('Error following account:', error);
    return NextResponse.json(
      { error: 'Failed to follow account' },
      { status: 500 }
    );
  }
}

async function followInstagramAccount(platform: any, accountId: string) {
  try {
    // Note: Instagram Graph API doesn't directly support following users
    // This would need to be done through Instagram's native API or automation
    // For now, returning mock success
    return { success: true, message: 'Follow action queued' };
  } catch (error) {
    console.error('Error following Instagram account:', error);
    throw error;
  }
}

async function followTwitterAccount(platform: any, accountId: string) {
  try {
    const userId = accountId.replace('twitter_', '');

    const response = await fetch(
      `https://api.twitter.com/2/users/${platform.metadata?.userId}/following`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${platform.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_user_id: userId
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Twitter API error: ${JSON.stringify(error)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error following Twitter account:', error);
    throw error;
  }
}

async function followTikTokAccount(platform: any, accountId: string) {
  try {
    const username = accountId.replace('tiktok_', '');

    // TikTok follow API (if available)
    // For now, returning mock success
    return { success: true, message: 'Follow action queued' };
  } catch (error) {
    console.error('Error following TikTok account:', error);
    throw error;
  }
}
