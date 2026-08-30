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

    // Get follow history for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySnapshot = await db
      .collection('follow_history')
      .where('userId', '==', userId)
      .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(today))
      .get();

    const todayFollows = todaySnapshot.docs.filter(doc => doc.data().action === 'follow').length;
    const todayUnfollows = todaySnapshot.docs.filter(doc => doc.data().action === 'unfollow').length;

    // Get total followed count
    const totalSnapshot = await db
      .collection('follow_history')
      .where('userId', '==', userId)
      .where('action', '==', 'follow')
      .get();

    const totalFollowed = totalSnapshot.docs.length;

    // Calculate follow back rate (mock for now)
    const followBackRate = Math.floor(Math.random() * 30) + 50; // 50-80%

    return NextResponse.json({
      stats: {
        todayFollows,
        todayUnfollows,
        followBackRate,
        totalFollowed
      }
    });

  } catch (error) {
    console.error('Error fetching follow stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
