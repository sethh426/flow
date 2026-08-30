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

    // Filter by requested platforms if specified
    const targetPlatforms = platforms.length > 0
      ? connectedPlatforms.filter(p => platforms.includes(p.platform))
      : connectedPlatforms;

    if (targetPlatforms.length === 0) {
      return NextResponse.json({
        messages: [],
        info: 'No connected platforms found'
      });
    }

    // Fetch messages from each platform
    const allMessages: any[] = [];

    for (const platform of targetPlatforms) {
      try {
        const messages = await fetchMessagesFromPlatform(platform);
        allMessages.push(...messages);
      } catch (error) {
        console.error(`Error fetching messages from ${platform.platform}:`, error);
      }
    }

    // Sort by timestamp (newest first)
    allMessages.sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({
      messages: allMessages,
      count: allMessages.length,
      platforms: targetPlatforms.map(p => p.platform)
    });

  } catch (error) {
    console.error('Error fetching social messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

async function fetchMessagesFromPlatform(platform: any): Promise<any[]> {
  const messages: any[] = [];

  switch (platform.platform) {
    case 'instagram':
      return await fetchInstagramMessages(platform);
    
    case 'facebook':
      return await fetchFacebookMessages(platform);
    
    case 'twitter':
      return await fetchTwitterMessages(platform);
    
    case 'linkedin':
      return await fetchLinkedInMessages(platform);
    
    default:
      return [];
  }
}

async function fetchInstagramMessages(platform: any): Promise<any[]> {
  try {
    // Fetch Instagram DMs using Graph API
    const response = await fetch(
      `https://graph.facebook.com/v18.0/me/conversations?access_token=${platform.accessToken}&fields=participants,messages{from,message,created_time}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Instagram messages');
    }

    const data = await response.json();
    const messages: any[] = [];

    if (data.data) {
      for (const conversation of data.data) {
        if (conversation.messages?.data) {
          for (const msg of conversation.messages.data) {
            // Only get messages from others (not from the account owner)
            if (msg.from?.id !== platform.metadata?.accountId) {
              messages.push({
                id: `instagram_${msg.id}`,
                platform: 'instagram',
                senderId: msg.from?.id || 'unknown',
                senderName: msg.from?.name || msg.from?.username || 'Unknown User',
                senderAvatar: msg.from?.profile_picture_url,
                text: msg.message,
                timestamp: new Date(msg.created_time).getTime(),
                sentiment: undefined,
                aiResponse: undefined,
                responseStatus: undefined
              });
            }
          }
        }
      }
    }

    return messages;
  } catch (error) {
    console.error('Error fetching Instagram messages:', error);
    return [];
  }
}

async function fetchFacebookMessages(platform: any): Promise<any[]> {
  try {
    // Fetch Facebook Page messages using Graph API
    const response = await fetch(
      `https://graph.facebook.com/v18.0/me/conversations?access_token=${platform.accessToken}&fields=participants,messages{from,message,created_time}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Facebook messages');
    }

    const data = await response.json();
    const messages: any[] = [];

    if (data.data) {
      for (const conversation of data.data) {
        if (conversation.messages?.data) {
          for (const msg of conversation.messages.data) {
            if (msg.from?.id !== platform.metadata?.pageId) {
              messages.push({
                id: `facebook_${msg.id}`,
                platform: 'facebook',
                senderId: msg.from?.id || 'unknown',
                senderName: msg.from?.name || 'Unknown User',
                senderAvatar: msg.from?.picture?.data?.url,
                text: msg.message,
                timestamp: new Date(msg.created_time).getTime(),
                sentiment: undefined,
                aiResponse: undefined,
                responseStatus: undefined
              });
            }
          }
        }
      }
    }

    return messages;
  } catch (error) {
    console.error('Error fetching Facebook messages:', error);
    return [];
  }
}

async function fetchTwitterMessages(platform: any): Promise<any[]> {
  try {
    // Fetch Twitter DMs using API v2
    const response = await fetch(
      'https://api.twitter.com/2/dm_conversations/with/:participant_id/dm_events',
      {
        headers: {
          'Authorization': `Bearer ${platform.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Twitter messages');
    }

    const data = await response.json();
    const messages: any[] = [];

    if (data.data) {
      for (const msg of data.data) {
        if (msg.sender_id !== platform.metadata?.userId) {
          messages.push({
            id: `twitter_${msg.id}`,
            platform: 'twitter',
            senderId: msg.sender_id,
            senderName: msg.sender_username || 'Unknown User',
            text: msg.text,
            timestamp: new Date(msg.created_at).getTime(),
            sentiment: undefined,
            aiResponse: undefined,
            responseStatus: undefined
          });
        }
      }
    }

    return messages;
  } catch (error) {
    console.error('Error fetching Twitter messages:', error);
    return [];
  }
}

async function fetchLinkedInMessages(platform: any): Promise<any[]> {
  try {
    // Fetch LinkedIn messages using API
    const response = await fetch(
      'https://api.linkedin.com/v2/messages',
      {
        headers: {
          'Authorization': `Bearer ${platform.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch LinkedIn messages');
    }

    const data = await response.json();
    const messages: any[] = [];

    if (data.elements) {
      for (const msg of data.elements) {
        messages.push({
          id: `linkedin_${msg.id}`,
          platform: 'linkedin',
          senderId: msg.from?.id || 'unknown',
          senderName: msg.from?.name || 'Unknown User',
          text: msg.body?.text || '',
          timestamp: msg.createdAt,
          sentiment: undefined,
          aiResponse: undefined,
          responseStatus: undefined
        });
      }
    }

    return messages;
  } catch (error) {
    console.error('Error fetching LinkedIn messages:', error);
    return [];
  }
}
