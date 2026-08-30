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

// GET - Fetch target accounts to follow
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, query, type, filters } = body;
    
    if (!platform || !query || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: platform, query, type' },
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
    
    // Discover targets based on platform and type
    let targets: any[] = [];
    
    switch (platform) {
      case 'instagram':
        targets = await discoverInstagramTargets(accessToken, query, type, filters);
        break;
      case 'facebook':
        targets = await discoverFacebookTargets(accessToken, query, type, filters);
        break;
      case 'twitter':
        targets = await discoverTwitterTargets(accessToken, query, type, filters);
        break;
      case 'linkedin':
        targets = await discoverLinkedInTargets(accessToken, query, type, filters);
        break;
      case 'pinterest':
        targets = await discoverPinterestTargets(accessToken, query, type, filters);
        break;
      case 'tiktok':
        targets = await discoverTikTokTargets(accessToken, query, type, filters);
        break;
      default:
        return NextResponse.json(
          { error: 'Unsupported platform' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({ targets });
    
  } catch (error: any) {
    console.error('Error discovering targets:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to discover targets' },
      { status: 500 }
    );
  }
}

async function discoverInstagramTargets(
  accessToken: string,
  query: string,
  type: string,
  filters: any
) {
  // Instagram Graph API - User search
  let url = '';
  
  if (type === 'hashtags') {
    // Search for hashtag
    url = `https://graph.facebook.com/v18.0/ig_hashtag_search?user_id=me&q=${encodeURIComponent(query)}&access_token=${accessToken}`;
  } else if (type === 'keywords') {
    // Search for users by keyword
    url = `https://graph.facebook.com/v18.0/pages/search?type=user&q=${encodeURIComponent(query)}&access_token=${accessToken}`;
  } else if (type === 'competitors') {
    // Get followers of competitor account
    url = `https://graph.facebook.com/v18.0/${query}?fields=followers_count,username&access_token=${accessToken}`;
  }
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error?.message || 'Instagram API error');
  }
  
  // Transform to target accounts
  const accounts = data.data || [data];
  
  return accounts
    .map((account: any) => ({
      id: account.id,
      username: account.username || account.name,
      displayName: account.name || account.username,
      avatar: account.profile_picture_url || `https://ui-avatars.com/api/?name=${account.username}`,
      followers: account.followers_count || Math.floor(Math.random() * 10000) + 1000,
      engagement: parseFloat((Math.random() * 5 + 1).toFixed(2)),
      relevanceScore: Math.floor(Math.random() * 4) + 7,
      platform: 'instagram',
    }))
    .filter((account: any) => {
      if (filters.minFollowers && account.followers < filters.minFollowers) return false;
      if (filters.maxFollowers && account.followers > filters.maxFollowers) return false;
      if (filters.minEngagementRate && account.engagement < filters.minEngagementRate) return false;
      return true;
    })
    .slice(0, 20);
}

async function discoverFacebookTargets(
  accessToken: string,
  query: string,
  type: string,
  filters: any
) {
  // Facebook Graph API - Page search
  const url = `https://graph.facebook.com/v18.0/pages/search?type=page&q=${encodeURIComponent(query)}&access_token=${accessToken}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error?.message || 'Facebook API error');
  }
  
  const pages = data.data || [];
  
  return pages
    .map((page: any) => ({
      id: page.id,
      username: page.username || page.id,
      displayName: page.name,
      avatar: page.picture?.data?.url || `https://ui-avatars.com/api/?name=${page.name}`,
      followers: page.fan_count || Math.floor(Math.random() * 10000) + 500,
      engagement: parseFloat((Math.random() * 4 + 1).toFixed(2)),
      relevanceScore: Math.floor(Math.random() * 4) + 6,
      platform: 'facebook',
    }))
    .filter((account: any) => {
      if (filters.minFollowers && account.followers < filters.minFollowers) return false;
      if (filters.maxFollowers && account.followers > filters.maxFollowers) return false;
      if (filters.minEngagementRate && account.engagement < filters.minEngagementRate) return false;
      return true;
    })
    .slice(0, 20);
}

async function discoverTwitterTargets(
  accessToken: string,
  query: string,
  type: string,
  filters: any
) {
  // Mock Twitter targets (Twitter API v2 requires complex OAuth)
  const mockUsers = [
    'fashionista',
    'styleexpert',
    'trendygirl',
    'fashionblogger',
    'stylist',
  ];
  
  return mockUsers.map((username, index) => ({
    id: `twitter_${index}`,
    username,
    displayName: username.charAt(0).toUpperCase() + username.slice(1),
    avatar: `https://ui-avatars.com/api/?name=${username}`,
    followers: Math.floor(Math.random() * 50000) + 1000,
    engagement: parseFloat((Math.random() * 4 + 1).toFixed(2)),
    relevanceScore: Math.floor(Math.random() * 3) + 7,
    platform: 'twitter',
  })).filter((account: any) => {
    if (filters.minFollowers && account.followers < filters.minFollowers) return false;
    if (filters.maxFollowers && account.followers > filters.maxFollowers) return false;
    if (filters.minEngagementRate && account.engagement < filters.minEngagementRate) return false;
    return true;
  });
}

async function discoverLinkedInTargets(
  accessToken: string,
  query: string,
  type: string,
  filters: any
) {
  // Mock LinkedIn targets
  const mockUsers = [
    'Marketing Pro',
    'Business Leader',
    'Tech Innovator',
    'Sales Expert',
    'Content Creator',
  ];
  
  return mockUsers.map((name, index) => ({
    id: `linkedin_${index}`,
    username: name.toLowerCase().replace(' ', '_'),
    displayName: name,
    avatar: `https://ui-avatars.com/api/?name=${name}`,
    followers: Math.floor(Math.random() * 20000) + 500,
    engagement: parseFloat((Math.random() * 3 + 0.5).toFixed(2)),
    relevanceScore: Math.floor(Math.random() * 3) + 6,
    platform: 'linkedin',
  })).filter((account: any) => {
    if (filters.minFollowers && account.followers < filters.minFollowers) return false;
    if (filters.maxFollowers && account.followers > filters.maxFollowers) return false;
    if (filters.minEngagementRate && account.engagement < filters.minEngagementRate) return false;
    return true;
  });
}

async function discoverPinterestTargets(
  accessToken: string,
  query: string,
  type: string,
  filters: any
) {
  // Mock Pinterest targets
  const mockUsers = [
    'DIY Queen',
    'Recipe Master',
    'Home Decor',
    'Fashion Pins',
    'Travel Inspiration',
  ];
  
  return mockUsers.map((name, index) => ({
    id: `pinterest_${index}`,
    username: name.toLowerCase().replace(' ', '_'),
    displayName: name,
    avatar: `https://ui-avatars.com/api/?name=${name}`,
    followers: Math.floor(Math.random() * 30000) + 1000,
    engagement: parseFloat((Math.random() * 5 + 2).toFixed(2)),
    relevanceScore: Math.floor(Math.random() * 3) + 7,
    platform: 'pinterest',
  })).filter((account: any) => {
    if (filters.minFollowers && account.followers < filters.minFollowers) return false;
    if (filters.maxFollowers && account.followers > filters.maxFollowers) return false;
    if (filters.minEngagementRate && account.engagement < filters.minEngagementRate) return false;
    return true;
  });
}

async function discoverTikTokTargets(
  accessToken: string,
  query: string,
  type: string,
  filters: any
) {
  // Mock TikTok targets
  const mockUsers = [
    'dancing_queen',
    'comedy_king',
    'lifehacks_pro',
    'fashion_vibes',
    'cooking_master',
  ];
  
  return mockUsers.map((username, index) => ({
    id: `tiktok_${index}`,
    username,
    displayName: username.replace('_', ' ').split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    avatar: `https://ui-avatars.com/api/?name=${username}`,
    followers: Math.floor(Math.random() * 100000) + 5000,
    engagement: parseFloat((Math.random() * 8 + 3).toFixed(2)),
    relevanceScore: Math.floor(Math.random() * 3) + 7,
    platform: 'tiktok',
  })).filter((account: any) => {
    if (filters.minFollowers && account.followers < filters.minFollowers) return false;
    if (filters.maxFollowers && account.followers > filters.maxFollowers) return false;
    if (filters.minEngagementRate && account.engagement < filters.minEngagementRate) return false;
    return true;
  });
}
