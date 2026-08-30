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
    const { userId, messageId, platform, recipientId, text } = body;

    if (!userId || !platform || !recipientId || !text) {
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

    // Send message to platform
    let result;
    switch (platform) {
      case 'instagram':
        result = await sendInstagramMessage(platformData, recipientId, text);
        break;
      case 'facebook':
        result = await sendFacebookMessage(platformData, recipientId, text);
        break;
      case 'twitter':
        result = await sendTwitterMessage(platformData, recipientId, text);
        break;
      case 'linkedin':
        result = await sendLinkedInMessage(platformData, recipientId, text);
        break;
      default:
        return NextResponse.json(
          { error: 'Unsupported platform' },
          { status: 400 }
        );
    }

    // Log the sent message
    await db.collection('message_history').add({
      userId,
      platform,
      recipientId,
      text,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      messageId,
      result
    });

    return NextResponse.json({
      success: true,
      platform,
      result
    });

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

async function sendInstagramMessage(platform: any, recipientId: string, text: string) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/me/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { text },
          access_token: platform.accessToken
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Instagram API error: ${JSON.stringify(error)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending Instagram message:', error);
    throw error;
  }
}

async function sendFacebookMessage(platform: any, recipientId: string, text: string) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/me/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { text },
          access_token: platform.accessToken
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Facebook API error: ${JSON.stringify(error)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending Facebook message:', error);
    throw error;
  }
}

async function sendTwitterMessage(platform: any, recipientId: string, text: string) {
  try {
    const response = await fetch(
      'https://api.twitter.com/2/dm_conversations/with/:participant_id/messages',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${platform.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          participant_id: recipientId
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Twitter API error: ${JSON.stringify(error)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending Twitter message:', error);
    throw error;
  }
}

async function sendLinkedInMessage(platform: any, recipientId: string, text: string) {
  try {
    const response = await fetch(
      'https://api.linkedin.com/v2/messages',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${platform.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipients: [recipientId],
          body: {
            text
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`LinkedIn API error: ${JSON.stringify(error)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending LinkedIn message:', error);
    throw error;
  }
}
