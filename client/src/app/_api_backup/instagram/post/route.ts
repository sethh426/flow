/**
 * Instagram Post API
 * 
 * Create and publish Instagram posts using Meta Graph API
 * POST /api/instagram/post - Create post
 */

import { NextRequest, NextResponse } from 'next/server';
import { getValidAccessToken } from '@/lib/instagram-oauth';

export const dynamic = 'force-dynamic';

interface PostRequest {
  userId: string;
  imageUrl: string;
  caption: string;
  schedule?: string; // ISO date string for scheduled posts
  type?: 'feed' | 'story' | 'reel';
}

export async function POST(request: NextRequest) {
  try {
    const postRequest: PostRequest = await request.json();

    if (!postRequest.userId || !postRequest.imageUrl) {
      return NextResponse.json(
        { error: 'userId and imageUrl are required' },
        { status: 400 }
      );
    }

    // Get valid access token
    const accessToken = await getValidAccessToken(postRequest.userId);

    // Create container
    const containerId = await createMediaContainer(
      accessToken,
      postRequest.imageUrl,
      postRequest.caption,
      postRequest.type || 'feed'
    );

    // Publish or schedule
    let result;
    if (postRequest.schedule) {
      result = await schedulePost(accessToken, containerId, postRequest.schedule);
    } else {
      result = await publishPost(accessToken, containerId);
    }

    return NextResponse.json({
      success: true,
      postId: result.id,
      message: postRequest.schedule ? 'Post scheduled successfully' : 'Post published successfully'
    });

  } catch (error: any) {
    console.error('❌ Instagram post error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create Instagram post' },
      { status: 500 }
    );
  }
}

/**
 * Create media container
 */
async function createMediaContainer(
  accessToken: string,
  imageUrl: string,
  caption: string,
  type: string
): Promise<string> {
  const instagramAccountId = process.env.INSTAGRAM_ACCOUNT_ID; // Store this when connecting

  const endpoint = type === 'story'
    ? `https://graph.facebook.com/v18.0/${instagramAccountId}/media`
    : `https://graph.facebook.com/v18.0/${instagramAccountId}/media`;

  const params: any = {
    image_url: imageUrl,
    caption,
    access_token: accessToken
  };

  if (type === 'story') {
    params.media_type = 'STORIES';
  }

  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`${endpoint}?${queryString}`, {
    method: 'POST'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to create media container');
  }

  const data = await response.json();
  return data.id;
}

/**
 * Publish post immediately
 */
async function publishPost(accessToken: string, containerId: string): Promise<{ id: string }> {
  const instagramAccountId = process.env.INSTAGRAM_ACCOUNT_ID;

  const response = await fetch(
    `https://graph.facebook.com/v18.0/${instagramAccountId}/media_publish?creation_id=${containerId}&access_token=${accessToken}`,
    { method: 'POST' }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to publish post');
  }

  return await response.json();
}

/**
 * Schedule post for later
 */
async function schedulePost(
  accessToken: string,
  containerId: string,
  scheduleTime: string
): Promise<{ id: string }> {
  // Instagram API doesn't support native scheduling
  // Store in Firestore for our scheduler to pick up
  const admin = require('firebase-admin');
  const db = admin.firestore();

  const scheduledPost = {
    containerId,
    accessToken,
    scheduleTime: new Date(scheduleTime),
    status: 'scheduled',
    createdAt: new Date()
  };

  const docRef = await db.collection('scheduled-posts').add(scheduledPost);

  return { id: docRef.id };
}
