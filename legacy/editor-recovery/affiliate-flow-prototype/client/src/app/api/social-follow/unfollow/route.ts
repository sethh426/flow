import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';

// Initialize Firebase Admin
if (!getApps().length) {
  const serviceAccountPath = path.join(process.cwd(), '..', 'serviceAccountKey.json');
  const serviceAccount = require(serviceAccountPath);
  
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore();

// POST - Unfollow an account
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, accountId, username } = body;
    
    if (!platform || !accountId || !username) {
      return NextResponse.json(
        { error: 'Missing required fields: platform, accountId, username' },
        { status: 400 }
      );
    }
    
    // Get platform connection
    const platformsRef = db.collection('social_platforms');
    const platformSnapshot = await platformsRef
      .where('platform', '==', platform)
      .limit(1)
      .get();
    
    if (platformSnapshot.empty) {
      return NextResponse.json(
        { error: 'Platform not connected' },
        { status: 404 }
      );
    }
    
    const platformDoc = platformSnapshot.docs[0];
    const accessToken = platformDoc.data().accessToken;
    const userId = platformDoc.data().userId;
    
    // Perform unfollow action
    let success = false;
    let error = null;
    
    try {
      switch (platform) {
        case 'instagram':
          await unfollowInstagram(accessToken, accountId);
          break;
        case 'facebook':
          await unfollowFacebook(accessToken, accountId);
          break;
        case 'twitter':
          await unfollowTwitter(accessToken, accountId);
          break;
        case 'linkedin':
          await unfollowLinkedIn(accessToken, accountId);
          break;
        case 'pinterest':
          await unfollowPinterest(accessToken, accountId);
          break;
        case 'tiktok':
          await unfollowTikTok(accessToken, accountId);
          break;
        default:
          throw new Error('Unsupported platform');
      }
      
      success = true;
      
    } catch (err: any) {
      error = err.message;
      success = false;
    }
    
    // Save unfollow action to history
    if (success) {
      await db.collection('follow_history').add({
        userId,
        platform,
        accountId,
        username,
        action: 'unfollow',
        timestamp: new Date().toISOString(),
        followedBack: false,
      });
    }
    
    if (!success) {
      return NextResponse.json(
        { error: error || 'Failed to unfollow account' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully unfollowed @${username}`,
    });
    
  } catch (error: any) {
    console.error('Error unfollowing account:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to unfollow account' },
      { status: 500 }
    );
  }
}

async function unfollowInstagram(accessToken: string, accountId: string) {
  // Instagram unfollow via Graph API
  const response = await fetch(
    `https://graph.facebook.com/v18.0/me/follows/${accountId}?access_token=${accessToken}`,
    { method: 'DELETE' }
  );
  
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error?.message || 'Instagram unfollow failed');
  }
  
  return { success: true };
}

async function unfollowFacebook(accessToken: string, pageId: string) {
  // Facebook page unlike
  const response = await fetch(
    `https://graph.facebook.com/v18.0/me/likes/${pageId}?access_token=${accessToken}`,
    { method: 'DELETE' }
  );
  
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error?.message || 'Facebook unfollow failed');
  }
  
  return { success: true };
}

async function unfollowTwitter(accessToken: string, userId: string) {
  // Twitter unfollow via API v2
  const response = await fetch(
    `https://api.twitter.com/2/users/me/following/${userId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );
  
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error?.message || 'Twitter unfollow failed');
  }
  
  return { success: true };
}

async function unfollowLinkedIn(accessToken: string, personId: string) {
  // LinkedIn remove connection
  // Mock implementation
  console.log(`Mock unfollow LinkedIn user ${personId}`);
  return { success: true };
}

async function unfollowPinterest(accessToken: string, userId: string) {
  // Pinterest unfollow
  const response = await fetch(
    `https://api.pinterest.com/v5/user_account/following/${userId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );
  
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Pinterest unfollow failed');
  }
  
  return { success: true };
}

async function unfollowTikTok(accessToken: string, userId: string) {
  // TikTok unfollow
  // Mock implementation
  console.log(`Mock unfollow TikTok user ${userId}`);
  return { success: true };
}
