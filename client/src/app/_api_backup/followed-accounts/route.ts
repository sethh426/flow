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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    // Fetch accounts that were followed
    const followSnapshot = await db
      .collection('follow_history')
      .where('userId', '==', userId)
      .where('action', '==', 'follow')
      .orderBy('timestamp', 'desc')
      .limit(100)
      .get();

    const accounts = followSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.accountId,
        platform: data.platform,
        username: data.username,
        displayName: data.username,
        followers: 0,
        following: 0,
        isFollowing: true,
        followedAt: data.timestamp?.toMillis() || Date.now()
      };
    });

    return NextResponse.json({
      accounts,
      count: accounts.length
    });

  } catch (error) {
    console.error('Error fetching followed accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch followed accounts' },
      { status: 500 }
    );
  }
}
