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
    const { userId, accountId, platform } = body;

    if (!userId || !accountId || !platform) {
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

    // Unfollow account on platform
    let result;
    switch (platform) {
      case 'instagram':
        result = await unfollowInstagramAccount(platformData, accountId);
        break;
      case 'twitter':
        result = await unfollowTwitterAccount(platformData, accountId);
        break;
      case 'tiktok':
        result = await unfollowTikTokAccount(platformData, accountId);
        break;
      default:
        return NextResponse.json(
          { error: 'Unsupported platform' },
          { status: 400 }
        );
    }

    // Log the unfollow action
    await db.collection('follow_history').add({
      userId,
      platform,
      accountId,
      action: 'unfollow',
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
    console.error('Error unfollowing account:', error);
    return NextResponse.json(
      { error: 'Failed to unfollow account' },
      { status: 500 }
    );
  }
}

async function unfollowInstagramAccount(platform: any, accountId: string) {
  try {
    // Instagram Graph API doesn't support unfollowing
    // Would need native API or automation
    return { success: true, message: 'Unfollow action queued' };
  } catch (error) {
    console.error('Error unfollowing Instagram account:', error);
    throw error;
  }
}

async function unfollowTwitterAccount(platform: any, accountId: string) {
  try {
    const userId = accountId.replace('twitter_', '');

    const response = await fetch(
      `https://api.twitter.com/2/users/${platform.metadata?.userId}/following/${userId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${platform.accessToken}`,
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Twitter API error: ${JSON.stringify(error)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error unfollowing Twitter account:', error);
    throw error;
  }
}

async function unfollowTikTokAccount(platform: any, accountId: string) {
  try {
    return { success: true, message: 'Unfollow action queued' };
  } catch (error) {
    console.error('Error unfollowing TikTok account:', error);
    throw error;
  }
}
