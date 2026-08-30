import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

interface PlatformData {
  id: string;
  platform: string;
  userId: string;
  accessToken: string;
  refreshToken?: string;
  [key: string]: any;
}

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  const serviceAccount = require('../../../../../serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = getFirestore();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const hashtags = searchParams.get('hashtags')?.split(',') || [];
    const platforms = searchParams.get('platforms')?.split(',') || [];

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    // Fetch connected platforms
    const platformsSnapshot = await db
      .collection('social_platforms')
      .where('userId', '==', userId)
      .get();

    const connectedPlatforms: PlatformData[] = platformsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PlatformData));

    // Filter by requested platforms
    const targetPlatforms = platforms.length > 0
      ? connectedPlatforms.filter(p => platforms.includes(p.platform))
      : connectedPlatforms;

    if (targetPlatforms.length === 0) {
      return NextResponse.json({
        posts: [],
        info: 'No connected platforms found'
      });
    }

    // Fetch posts from each platform
    const allPosts: any[] = [];

    for (const platform of targetPlatforms) {
      try {
        const posts = await fetchPostsFromPlatform(platform, hashtags);
        allPosts.push(...posts);
      } catch (error) {
        console.error(`Error fetching posts from ${platform.platform}:`, error);
      }
    }

    // Sort by timestamp (newest first)
    allPosts.sort((a, b) => b.timestamp - a.timestamp);

    // Limit to 50 posts
    const limitedPosts = allPosts.slice(0, 50);

    return NextResponse.json({
      posts: limitedPosts,
      count: limitedPosts.length,
      platforms: targetPlatforms.map(p => p.platform),
      hashtags
    });

  } catch (error) {
    console.error('Error discovering posts:', error);
    return NextResponse.json(
      { error: 'Failed to discover posts' },
      { status: 500 }
    );
  }
}

async function fetchPostsFromPlatform(platform: any, hashtags: string[]): Promise<any[]> {
  switch (platform.platform) {
    case 'instagram':
      return await fetchInstagramPosts(platform, hashtags);
    
    case 'tiktok':
      return await fetchTikTokPosts(platform, hashtags);
    
    case 'twitter':
      return await fetchTwitterPosts(platform, hashtags);
    
    default:
      return [];
  }
}

async function fetchInstagramPosts(platform: any, hashtags: string[]): Promise<any[]> {
  try {
    const posts: any[] = [];

    for (const hashtag of hashtags.slice(0, 3)) { // Limit to 3 hashtags
      const response = await fetch(
        `https://graph.facebook.com/v18.0/ig_hashtag_search?user_id=${platform.metadata?.accountId}&q=${hashtag}&access_token=${platform.accessToken}`
      );

      if (!response.ok) continue;

      const hashtagData = await response.json();
      
      if (hashtagData.data && hashtagData.data[0]) {
        const hashtagId = hashtagData.data[0].id;

        // Get recent media for this hashtag
        const mediaResponse = await fetch(
          `https://graph.facebook.com/v18.0/${hashtagId}/recent_media?user_id=${platform.metadata?.accountId}&fields=id,media_type,media_url,permalink,caption,timestamp,like_count,comments_count,username&access_token=${platform.accessToken}`
        );

        if (mediaResponse.ok) {
          const mediaData = await mediaResponse.json();

          if (mediaData.data) {
            for (const media of mediaData.data.slice(0, 10)) { // Limit to 10 per hashtag
              if (media.media_type === 'IMAGE' || media.media_type === 'CAROUSEL_ALBUM') {
                posts.push({
                  id: `instagram_${media.id}`,
                  platform: 'instagram',
                  author: media.username,
                  authorId: media.id,
                  imageUrl: media.media_url,
                  caption: media.caption || '',
                  timestamp: new Date(media.timestamp).getTime(),
                  likes: media.like_count || 0,
                  comments: media.comments_count || 0,
                  hashtags: extractHashtags(media.caption || '')
                });
              }
            }
          }
        }
      }
    }

    return posts;
  } catch (error) {
    console.error('Error fetching Instagram posts:', error);
    return [];
  }
}

async function fetchTikTokPosts(platform: any, hashtags: string[]): Promise<any[]> {
  try {
    // TikTok API for hashtag search
    const posts: any[] = [];

    for (const hashtag of hashtags.slice(0, 3)) {
      const response = await fetch(
        `https://open.tiktokapis.com/v2/research/video/query/?fields=id,video_description,create_time,like_count,comment_count,cover_image_url`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${platform.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: {
              and: [{ field_name: 'hashtag_name', operation: 'EQ', field_values: [hashtag] }]
            },
            max_count: 10
          })
        }
      );

      if (response.ok) {
        const data = await response.json();

        if (data.data?.videos) {
          for (const video of data.data.videos) {
            posts.push({
              id: `tiktok_${video.id}`,
              platform: 'tiktok',
              author: video.username || 'Unknown',
              authorId: video.author_id || 'unknown',
              imageUrl: video.cover_image_url,
              caption: video.video_description || '',
              timestamp: video.create_time * 1000,
              likes: video.like_count || 0,
              comments: video.comment_count || 0,
              hashtags: extractHashtags(video.video_description || '')
            });
          }
        }
      }
    }

    return posts;
  } catch (error) {
    console.error('Error fetching TikTok posts:', error);
    return [];
  }
}

async function fetchTwitterPosts(platform: any, hashtags: string[]): Promise<any[]> {
  try {
    const posts: any[] = [];

    for (const hashtag of hashtags.slice(0, 3)) {
      const response = await fetch(
        `https://api.twitter.com/2/tweets/search/recent?query=%23${hashtag}&max_results=10&tweet.fields=created_at,public_metrics,attachments&expansions=attachments.media_keys&media.fields=url`,
        {
          headers: {
            'Authorization': `Bearer ${platform.accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        if (data.data) {
          for (const tweet of data.data) {
            const media = data.includes?.media?.find((m: any) => 
              tweet.attachments?.media_keys?.includes(m.media_key)
            );

            if (media && media.type === 'photo') {
              posts.push({
                id: `twitter_${tweet.id}`,
                platform: 'twitter',
                author: tweet.author_id || 'Unknown',
                authorId: tweet.author_id || 'unknown',
                imageUrl: media.url,
                caption: tweet.text || '',
                timestamp: new Date(tweet.created_at).getTime(),
                likes: tweet.public_metrics?.like_count || 0,
                comments: tweet.public_metrics?.reply_count || 0,
                hashtags: extractHashtags(tweet.text || '')
              });
            }
          }
        }
      }
    }

    return posts;
  } catch (error) {
    console.error('Error fetching Twitter posts:', error);
    return [];
  }
}

function extractHashtags(text: string): string[] {
  const hashtagRegex = /#(\w+)/g;
  const matches = text.match(hashtagRegex);
  return matches ? matches.map(h => h.substring(1).toLowerCase()) : [];
}
