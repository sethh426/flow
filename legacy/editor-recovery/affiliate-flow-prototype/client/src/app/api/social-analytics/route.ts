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
    const platform = searchParams.get('platform') || 'all';
    const timeRange = searchParams.get('timeRange') || '30d';

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    // Calculate date range
    const days = parseInt(timeRange.replace('d', ''));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch connected platforms
    const platformsSnapshot = await db
      .collection('social_platforms')
      .where('userId', '==', userId)
      .get();

    const connectedPlatforms: PlatformData[] = platformsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PlatformData));

    // Filter by platform if specified
    const targetPlatforms = platform === 'all'
      ? connectedPlatforms
      : connectedPlatforms.filter(p => p.platform === platform);

    if (targetPlatforms.length === 0) {
      return NextResponse.json({
        analytics: [],
        growthData: [],
        topPosts: [],
        info: 'No connected platforms found'
      });
    }

    // Fetch analytics for each platform
    const allAnalytics: any[] = [];
    const allGrowthData: any[] = [];
    const allTopPosts: any[] = [];

    for (const platformData of targetPlatforms) {
      try {
        const analytics = await fetchPlatformAnalytics(platformData, days);
        const growthData = await fetchGrowthData(platformData, days);
        const topPosts = await fetchTopPosts(platformData, days);

        allAnalytics.push(analytics);
        allGrowthData.push(...growthData);
        allTopPosts.push(...topPosts);
      } catch (error) {
        console.error(`Error fetching analytics for ${platformData.platform}:`, error);
      }
    }

    // Sort and aggregate growth data
    const aggregatedGrowth = aggregateGrowthData(allGrowthData, days);

    // Sort top posts by engagement
    allTopPosts.sort((a, b) => b.engagementRate - a.engagementRate);

    return NextResponse.json({
      analytics: allAnalytics,
      growthData: aggregatedGrowth,
      topPosts: allTopPosts.slice(0, 20),
      timeRange,
      platform
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

async function fetchPlatformAnalytics(platform: any, days: number): Promise<any> {
  switch (platform.platform) {
    case 'instagram':
      return await fetchInstagramAnalytics(platform, days);
    case 'facebook':
      return await fetchFacebookAnalytics(platform, days);
    case 'twitter':
      return await fetchTwitterAnalytics(platform, days);
    case 'linkedin':
      return await fetchLinkedInAnalytics(platform, days);
    default:
      return createEmptyAnalytics(platform.platform);
  }
}

async function fetchInstagramAnalytics(platform: any, days: number): Promise<any> {
  try {
    // Fetch Instagram insights
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${platform.metadata?.accountId}/insights?metric=impressions,reach,follower_count,profile_views&period=day&access_token=${platform.accessToken}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Instagram insights');
    }

    const insightsData = await response.json();

    // Fetch media
    const mediaResponse = await fetch(
      `https://graph.facebook.com/v18.0/${platform.metadata?.accountId}/media?fields=id,caption,like_count,comments_count,timestamp&limit=100&access_token=${platform.accessToken}`
    );

    const mediaData = await mediaResponse.json();

    // Calculate metrics
    const followers = insightsData.data?.find((m: any) => m.name === 'follower_count')?.values[0]?.value || 0;
    const previousFollowers = insightsData.data?.find((m: any) => m.name === 'follower_count')?.values[1]?.value || followers;
    const followersGrowth = previousFollowers > 0 ? ((followers - previousFollowers) / previousFollowers * 100) : 0;

    const totalLikes = mediaData.data?.reduce((sum: number, m: any) => sum + (m.like_count || 0), 0) || 0;
    const totalComments = mediaData.data?.reduce((sum: number, m: any) => sum + (m.comments_count || 0), 0) || 0;
    const posts = mediaData.data?.length || 0;
    const engagementRate = followers > 0 ? ((totalLikes + totalComments) / (followers * posts)) * 100 : 0;

    // Calculate best posting time
    const bestPostingTime = calculateBestPostingTime(mediaData.data || []);

    // Calculate rating (1-10)
    const rating = calculateRating(engagementRate, followersGrowth, posts);

    return {
      platform: 'instagram',
      followers,
      followersGrowth,
      engagementRate,
      posts,
      likes: totalLikes,
      comments: totalComments,
      shares: 0,
      reach: insightsData.data?.find((m: any) => m.name === 'reach')?.values[0]?.value || 0,
      impressions: insightsData.data?.find((m: any) => m.name === 'impressions')?.values[0]?.value || 0,
      bestPostingTime,
      topHashtags: extractTopHashtags(mediaData.data || []),
      rating
    };
  } catch (error) {
    console.error('Error fetching Instagram analytics:', error);
    return createEmptyAnalytics('instagram');
  }
}

async function fetchFacebookAnalytics(platform: any, days: number): Promise<any> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${platform.metadata?.pageId}/insights?metric=page_fans,page_post_engagements,page_impressions&period=day&access_token=${platform.accessToken}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Facebook insights');
    }

    const data = await response.json();

    const followers = data.data?.find((m: any) => m.name === 'page_fans')?.values[0]?.value || 0;
    const engagements = data.data?.find((m: any) => m.name === 'page_post_engagements')?.values[0]?.value || 0;

    return {
      platform: 'facebook',
      followers,
      followersGrowth: 2.5, // Mock growth
      engagementRate: followers > 0 ? (engagements / followers) * 100 : 0,
      posts: 15, // Mock
      likes: 120, // Mock
      comments: 45, // Mock
      shares: 10, // Mock
      reach: data.data?.find((m: any) => m.name === 'page_impressions')?.values[0]?.value || 0,
      impressions: 0,
      bestPostingTime: '6:00 PM',
      topHashtags: [],
      rating: 7.5
    };
  } catch (error) {
    console.error('Error fetching Facebook analytics:', error);
    return createEmptyAnalytics('facebook');
  }
}

async function fetchTwitterAnalytics(platform: any, days: number): Promise<any> {
  try {
    const response = await fetch(
      `https://api.twitter.com/2/users/${platform.metadata?.userId}?user.fields=public_metrics`,
      {
        headers: {
          'Authorization': `Bearer ${platform.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Twitter analytics');
    }

    const data = await response.json();

    const followers = data.data?.public_metrics?.followers_count || 0;

    return {
      platform: 'twitter',
      followers,
      followersGrowth: 3.2, // Mock
      engagementRate: 2.8, // Mock
      posts: data.data?.public_metrics?.tweet_count || 0,
      likes: 0,
      comments: 0,
      shares: 0,
      reach: 0,
      impressions: 0,
      bestPostingTime: '12:00 PM',
      topHashtags: [],
      rating: 6.8
    };
  } catch (error) {
    console.error('Error fetching Twitter analytics:', error);
    return createEmptyAnalytics('twitter');
  }
}

async function fetchLinkedInAnalytics(platform: any, days: number): Promise<any> {
  return createEmptyAnalytics('linkedin');
}

async function fetchGrowthData(platform: any, days: number): Promise<any[]> {
  // Generate mock growth data for the time range
  const growthData: any[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    growthData.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      platform: platform.platform,
      followers: Math.floor(Math.random() * 100) + 1000, // Mock data
      engagement: Math.floor(Math.random() * 5) + 2 // Mock engagement rate
    });
  }

  return growthData;
}

async function fetchTopPosts(platform: any, days: number): Promise<any[]> {
  // This would fetch actual posts from the platform API
  // For now, returning empty array
  return [];
}

function aggregateGrowthData(data: any[], days: number): any[] {
  const aggregated: any = {};

  data.forEach(item => {
    if (!aggregated[item.date]) {
      aggregated[item.date] = {
        date: item.date,
        followers: 0,
        engagement: 0,
        count: 0
      };
    }
    aggregated[item.date].followers += item.followers;
    aggregated[item.date].engagement += item.engagement;
    aggregated[item.date].count += 1;
  });

  return Object.values(aggregated).map((item: any) => ({
    date: item.date,
    followers: Math.floor(item.followers / item.count),
    engagement: parseFloat((item.engagement / item.count).toFixed(2))
  }));
}

function calculateBestPostingTime(posts: any[]): string {
  if (posts.length === 0) return '6:00 PM';

  // Group posts by hour and calculate engagement
  const hourEngagement: any = {};

  posts.forEach(post => {
    const hour = new Date(post.timestamp).getHours();
    const engagement = (post.like_count || 0) + (post.comments_count || 0);

    if (!hourEngagement[hour]) {
      hourEngagement[hour] = { total: 0, count: 0 };
    }
    hourEngagement[hour].total += engagement;
    hourEngagement[hour].count += 1;
  });

  // Find hour with highest average engagement
  let bestHour = 18; // Default 6 PM
  let maxAvgEngagement = 0;

  Object.keys(hourEngagement).forEach(hour => {
    const avg = hourEngagement[hour].total / hourEngagement[hour].count;
    if (avg > maxAvgEngagement) {
      maxAvgEngagement = avg;
      bestHour = parseInt(hour);
    }
  });

  const period = bestHour >= 12 ? 'PM' : 'AM';
  const displayHour = bestHour > 12 ? bestHour - 12 : (bestHour === 0 ? 12 : bestHour);
  return `${displayHour}:00 ${period}`;
}

function extractTopHashtags(posts: any[]): string[] {
  const hashtagCounts: any = {};

  posts.forEach(post => {
    const caption = post.caption || '';
    const hashtags = caption.match(/#\w+/g) || [];

    hashtags.forEach((tag: string) => {
      const normalized = tag.toLowerCase();
      hashtagCounts[normalized] = (hashtagCounts[normalized] || 0) + 1;
    });
  });

  return Object.entries(hashtagCounts)
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 5)
    .map(([tag]) => tag);
}

function calculateRating(engagementRate: number, followersGrowth: number, posts: number): number {
  let rating = 5; // Base rating

  // Engagement rate contribution (0-3 points)
  if (engagementRate >= 5) rating += 3;
  else if (engagementRate >= 3) rating += 2;
  else if (engagementRate >= 1) rating += 1;

  // Followers growth contribution (0-2 points)
  if (followersGrowth >= 5) rating += 2;
  else if (followersGrowth >= 2) rating += 1;

  // Post frequency contribution (0-1 point)
  if (posts >= 20) rating += 1;
  else if (posts >= 10) rating += 0.5;

  return Math.min(rating, 10);
}

function createEmptyAnalytics(platform: string): any {
  return {
    platform,
    followers: 0,
    followersGrowth: 0,
    engagementRate: 0,
    posts: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    reach: 0,
    impressions: 0,
    bestPostingTime: 'N/A',
    topHashtags: [],
    rating: 0
  };
}
