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

// POST - Follow an account
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, accountId, username, withLike, withComment } = body;
    
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
    
    // Perform follow action
    let success = false;
    let error = null;
    
    try {
      switch (platform) {
        case 'instagram':
          await followInstagram(accessToken, accountId);
          break;
        case 'facebook':
          await followFacebook(accessToken, accountId);
          break;
        case 'twitter':
          await followTwitter(accessToken, accountId);
          break;
        case 'linkedin':
          await followLinkedIn(accessToken, accountId);
          break;
        case 'pinterest':
          await followPinterest(accessToken, accountId);
          break;
        case 'tiktok':
          await followTikTok(accessToken, accountId);
          break;
        default:
          throw new Error('Unsupported platform');
      }
      
      success = true;
      
      // Optionally like recent posts
      if (withLike) {
        try {
          await likeRecentPosts(platform, accessToken, accountId);
        } catch (err) {
          console.error('Error liking posts:', err);
        }
      }
      
      // Optionally comment on posts
      if (withComment) {
        try {
          await commentOnPosts(platform, accessToken, accountId);
        } catch (err) {
          console.error('Error commenting:', err);
        }
      }
      
    } catch (err: any) {
      error = err.message;
      success = false;
    }
    
    // Save follow action to history
    if (success) {
      await db.collection('follow_history').add({
        userId,
        platform,
        accountId,
        username,
        action: 'follow',
        timestamp: new Date().toISOString(),
        followedBack: false,
        withLike,
        withComment,
      });
    }
    
    if (!success) {
      return NextResponse.json(
        { error: error || 'Failed to follow account' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully followed @${username}`,
    });
    
  } catch (error: any) {
    console.error('Error following account:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to follow account' },
      { status: 500 }
    );
  }
}

async function followInstagram(accessToken: string, accountId: string) {
  // Instagram follow via Graph API
  const response = await fetch(
    `https://graph.facebook.com/v18.0/me/follows?target_id=${accountId}&access_token=${accessToken}`,
    { method: 'POST' }
  );
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error?.message || 'Instagram follow failed');
  }
  
  return data;
}

async function followFacebook(accessToken: string, pageId: string) {
  // Facebook page like
  const response = await fetch(
    `https://graph.facebook.com/v18.0/me/likes?page_id=${pageId}&access_token=${accessToken}`,
    { method: 'POST' }
  );
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error?.message || 'Facebook follow failed');
  }
  
  return data;
}

async function followTwitter(accessToken: string, userId: string) {
  // Twitter follow via API v2
  const response = await fetch(
    `https://api.twitter.com/2/users/me/following`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ target_user_id: userId }),
    }
  );
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error?.message || 'Twitter follow failed');
  }
  
  return data;
}

async function followLinkedIn(accessToken: string, personId: string) {
  // LinkedIn connection request
  // Mock implementation - LinkedIn API requires complex setup
  console.log(`Mock follow LinkedIn user ${personId}`);
  return { success: true };
}

async function followPinterest(accessToken: string, userId: string) {
  // Pinterest follow
  const response = await fetch(
    `https://api.pinterest.com/v5/user_account/following`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    }
  );
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Pinterest follow failed');
  }
  
  return data;
}

async function followTikTok(accessToken: string, userId: string) {
  // TikTok follow
  // Mock implementation - TikTok API follow endpoint
  console.log(`Mock follow TikTok user ${userId}`);
  return { success: true };
}

async function likeRecentPosts(platform: string, accessToken: string, accountId: string) {
  // Like 2-3 recent posts from the account
  console.log(`Liking recent posts for ${platform} account ${accountId}`);
  
  // Implementation would fetch recent posts and like them
  // This is a mock for now
  return { success: true };
}

async function commentOnPosts(platform: string, accessToken: string, accountId: string) {
  // Comment on 1-2 recent posts from the account
  console.log(`Commenting on posts for ${platform} account ${accountId}`);
  
  // Would use the Smart Engagement system to generate contextual comments
  return { success: true };
}
