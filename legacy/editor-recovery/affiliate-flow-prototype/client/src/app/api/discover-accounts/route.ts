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
    const minFollowers = parseInt(searchParams.get('minFollowers') || '100');
    const maxFollowers = parseInt(searchParams.get('maxFollowers') || '100000');

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
        accounts: [],
        info: 'No connected platforms found'
      });
    }

    // Discover accounts from each platform
    const allAccounts: any[] = [];

    for (const platform of targetPlatforms) {
      try {
        const accounts = await discoverAccountsFromPlatform(
          platform,
          hashtags,
          minFollowers,
          maxFollowers
        );
        allAccounts.push(...accounts);
      } catch (error) {
        console.error(`Error discovering accounts from ${platform.platform}:`, error);
      }
    }

    // Remove duplicates and sort by engagement rate
    const uniqueAccounts = Array.from(
      new Map(allAccounts.map(a => [a.id, a])).values()
    );

    uniqueAccounts.sort((a, b) => (b.engagementRate || 0) - (a.engagementRate || 0));

    return NextResponse.json({
      accounts: uniqueAccounts.slice(0, 50), // Limit to 50 accounts
      count: uniqueAccounts.length,
      platforms: targetPlatforms.map(p => p.platform),
      hashtags
    });

  } catch (error) {
    console.error('Error discovering accounts:', error);
    return NextResponse.json(
      { error: 'Failed to discover accounts' },
      { status: 500 }
    );
  }
}

async function discoverAccountsFromPlatform(
  platform: any,
  hashtags: string[],
  minFollowers: number,
  maxFollowers: number
): Promise<any[]> {
  switch (platform.platform) {
    case 'instagram':
      return await discoverInstagramAccounts(platform, hashtags, minFollowers, maxFollowers);
    case 'twitter':
      return await discoverTwitterAccounts(platform, hashtags, minFollowers, maxFollowers);
    case 'tiktok':
      return await discoverTikTokAccounts(platform, hashtags, minFollowers, maxFollowers);
    default:
      return [];
  }
}

async function discoverInstagramAccounts(
  platform: any,
  hashtags: string[],
  minFollowers: number,
  maxFollowers: number
): Promise<any[]> {
  try {
    const accounts: any[] = [];

    for (const hashtag of hashtags.slice(0, 3)) {
      // Search for hashtag
      const hashtagResponse = await fetch(
        `https://graph.facebook.com/v18.0/ig_hashtag_search?user_id=${platform.metadata?.accountId}&q=${hashtag}&access_token=${platform.accessToken}`
      );

      if (!hashtagResponse.ok) continue;

      const hashtagData = await hashtagResponse.json();

      if (hashtagData.data && hashtagData.data[0]) {
        const hashtagId = hashtagData.data[0].id;

        // Get top media for this hashtag
        const mediaResponse = await fetch(
          `https://graph.facebook.com/v18.0/${hashtagId}/top_media?user_id=${platform.metadata?.accountId}&fields=id,username,owner&access_token=${platform.accessToken}`
        );

        if (mediaResponse.ok) {
          const mediaData = await mediaResponse.json();

          if (mediaData.data) {
            for (const media of mediaData.data.slice(0, 10)) {
              if (!media.owner) continue;

              // Fetch user details
              const userResponse = await fetch(
                `https://graph.facebook.com/v18.0/${media.owner.id}?fields=username,name,profile_picture_url,followers_count,follows_count,media_count&access_token=${platform.accessToken}`
              );

              if (userResponse.ok) {
                const userData = await userResponse.json();

                const followers = userData.followers_count || 0;

                if (followers >= minFollowers && followers <= maxFollowers) {
                  // Calculate engagement rate (mock for now)
                  const engagementRate = Math.random() * 5 + 1; // 1-6%

                  accounts.push({
                    id: `instagram_${userData.username}`,
                    platform: 'instagram',
                    username: userData.username,
                    displayName: userData.name || userData.username,
                    avatar: userData.profile_picture_url,
                    followers,
                    following: userData.follows_count || 0,
                    engagementRate,
                    isFollowing: false
                  });
                }
              }
            }
          }
        }
      }
    }

    return accounts;
  } catch (error) {
    console.error('Error discovering Instagram accounts:', error);
    return [];
  }
}

async function discoverTwitterAccounts(
  platform: any,
  hashtags: string[],
  minFollowers: number,
  maxFollowers: number
): Promise<any[]> {
  try {
    const accounts: any[] = [];

    for (const hashtag of hashtags.slice(0, 3)) {
      const response = await fetch(
        `https://api.twitter.com/2/tweets/search/recent?query=%23${hashtag}&max_results=20&expansions=author_id&user.fields=public_metrics,profile_image_url`,
        {
          headers: {
            'Authorization': `Bearer ${platform.accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        if (data.includes?.users) {
          for (const user of data.includes.users) {
            const followers = user.public_metrics?.followers_count || 0;

            if (followers >= minFollowers && followers <= maxFollowers) {
              const engagementRate = Math.random() * 4 + 1;

              accounts.push({
                id: `twitter_${user.username}`,
                platform: 'twitter',
                username: user.username,
                displayName: user.name || user.username,
                avatar: user.profile_image_url,
                followers,
                following: user.public_metrics?.following_count || 0,
                engagementRate,
                isFollowing: false
              });
            }
          }
        }
      }
    }

    return accounts;
  } catch (error) {
    console.error('Error discovering Twitter accounts:', error);
    return [];
  }
}

async function discoverTikTokAccounts(
  platform: any,
  hashtags: string[],
  minFollowers: number,
  maxFollowers: number
): Promise<any[]> {
  try {
    const accounts: any[] = [];

    for (const hashtag of hashtags.slice(0, 3)) {
      const response = await fetch(
        `https://open.tiktokapis.com/v2/research/user/search/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${platform.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: hashtag,
            max_count: 10
          })
        }
      );

      if (response.ok) {
        const data = await response.json();

        if (data.data?.users) {
          for (const user of data.data.users) {
            const followers = user.follower_count || 0;

            if (followers >= minFollowers && followers <= maxFollowers) {
              accounts.push({
                id: `tiktok_${user.username}`,
                platform: 'tiktok',
                username: user.username,
                displayName: user.display_name || user.username,
                avatar: user.avatar_url,
                followers,
                following: user.following_count || 0,
                engagementRate: Math.random() * 6 + 2,
                isFollowing: false
              });
            }
          }
        }
      }
    }

    return accounts;
  } catch (error) {
    console.error('Error discovering TikTok accounts:', error);
    return [];
  }
}
