/**
 * Social Media Platforms API
 * Manage connected social media accounts
 */

import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';

export const dynamic = 'force-dynamic';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  const serviceAccount = require('../../../../../serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

/**
 * GET /api/social-platforms - Get connected platforms for user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const snapshot = await db
      .collection('social_platforms')
      .where('userId', '==', userId)
      .get();

    const platforms = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      platforms,
      count: platforms.length,
    });
  } catch (error: any) {
    console.error('❌ Get platforms error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/social-platforms - Add new platform connection
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      platform,
      accessToken,
      refreshToken,
      username,
      profileId,
      expiresAt,
      metadata,
    } = body;

    if (!userId || !platform || !accessToken) {
      return NextResponse.json(
        { error: 'userId, platform, and accessToken are required' },
        { status: 400 }
      );
    }

    const platformData = {
      userId,
      platform: platform.toLowerCase(),
      accessToken,
      refreshToken: refreshToken || null,
      username: username || '',
      profileId: profileId || '',
      expiresAt: expiresAt ? admin.firestore.Timestamp.fromDate(new Date(expiresAt)) : null,
      metadata: metadata || {},
      followers: 0,
      engagement: 0,
      connectedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastSyncedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('social_platforms').add(platformData);

    return NextResponse.json({
      success: true,
      platformId: docRef.id,
      platform: { id: docRef.id, ...platformData },
    }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Add platform error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/social-platforms - Disconnect platform
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, platform } = body;

    if (!userId || !platform) {
      return NextResponse.json(
        { error: 'userId and platform are required' },
        { status: 400 }
      );
    }

    const snapshot = await db
      .collection('social_platforms')
      .where('userId', '==', userId)
      .where('platform', '==', platform.toLowerCase())
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ error: 'Platform not found' }, { status: 404 });
    }

    // Delete all matching documents
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    return NextResponse.json({
      success: true,
      message: `${platform} disconnected successfully`,
    });
  } catch (error: any) {
    console.error('❌ Delete platform error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
