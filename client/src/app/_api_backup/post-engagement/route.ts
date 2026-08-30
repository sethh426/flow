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
    const { userId, postId, platform, comment, like } = body;

    if (!userId || !postId || !platform) {
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

    // Post comment and/or like based on platform
    const results: any = {};

    if (comment && comment.trim()) {
      results.comment = await postCommentToPlatform(platform, platformData, postId, comment);
    }

    if (like) {
      results.like = await likePostOnPlatform(platform, platformData, postId);
    }

    // Log the engagement
    await db.collection('engagement_history').add({
      userId,
      platform,
      postId,
      comment: comment || null,
      liked: like || false,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      results
    });

    return NextResponse.json({
      success: true,
      platform,
      results
    });

  } catch (error) {
    console.error('Error posting engagement:', error);
    return NextResponse.json(
      { error: 'Failed to post engagement' },
      { status: 500 }
    );
  }
}

async function postCommentToPlatform(platform: string, platformData: any, postId: string, comment: string) {
  switch (platform) {
    case 'instagram':
      return await postInstagramComment(platformData, postId, comment);
    case 'tiktok':
      return await postTikTokComment(platformData, postId, comment);
    case 'twitter':
      return await postTwitterReply(platformData, postId, comment);
    default:
      throw new Error('Unsupported platform');
  }
}

async function likePostOnPlatform(platform: string, platformData: any, postId: string) {
  switch (platform) {
    case 'instagram':
      return await likeInstagramPost(platformData, postId);
    case 'tiktok':
      return await likeTikTokVideo(platformData, postId);
    case 'twitter':
      return await likeTwitterPost(platformData, postId);
    default:
      throw new Error('Unsupported platform');
  }
}

async function postInstagramComment(platformData: any, postId: string, comment: string) {
  try {
    // Extract media ID from full post ID
    const mediaId = postId.replace('instagram_', '');

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${mediaId}/comments`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: comment,
          access_token: platformData.accessToken
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Instagram API error: ${JSON.stringify(error)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error posting Instagram comment:', error);
    throw error;
  }
}

async function likeInstagramPost(platformData: any, postId: string) {
  try {
    const mediaId = postId.replace('instagram_', '');

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${mediaId}/likes`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: platformData.accessToken
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Instagram API error: ${JSON.stringify(error)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error liking Instagram post:', error);
    throw error;
  }
}

async function postTikTokComment(platformData: any, postId: string, comment: string) {
  try {
    const videoId = postId.replace('tiktok_', '');

    const response = await fetch(
      'https://open.tiktokapis.com/v2/comment/publish/',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${platformData.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_id: videoId,
          text: comment
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`TikTok API error: ${JSON.stringify(error)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error posting TikTok comment:', error);
    throw error;
  }
}

async function likeTikTokVideo(platformData: any, postId: string) {
  try {
    const videoId = postId.replace('tiktok_', '');

    const response = await fetch(
      'https://open.tiktokapis.com/v2/video/like/',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${platformData.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_id: videoId
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`TikTok API error: ${JSON.stringify(error)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error liking TikTok video:', error);
    throw error;
  }
}

async function postTwitterReply(platformData: any, postId: string, comment: string) {
  try {
    const tweetId = postId.replace('twitter_', '');

    const response = await fetch(
      'https://api.twitter.com/2/tweets',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${platformData.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: comment,
          reply: {
            in_reply_to_tweet_id: tweetId
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Twitter API error: ${JSON.stringify(error)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error posting Twitter reply:', error);
    throw error;
  }
}

async function likeTwitterPost(platformData: any, postId: string) {
  try {
    const tweetId = postId.replace('twitter_', '');

    const response = await fetch(
      `https://api.twitter.com/2/users/${platformData.metadata?.userId}/likes`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${platformData.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tweet_id: tweetId
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Twitter API error: ${JSON.stringify(error)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error liking Twitter post:', error);
    throw error;
  }
}
