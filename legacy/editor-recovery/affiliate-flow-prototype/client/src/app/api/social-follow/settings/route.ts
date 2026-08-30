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

// GET - Fetch auto-follow settings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    
    if (!platform) {
      return NextResponse.json(
        { error: 'Missing required parameter: platform' },
        { status: 400 }
      );
    }
    
    // Get settings from Firestore
    const settingsRef = db.collection('follow_settings');
    const settingsSnapshot = await settingsRef
      .where('platform', '==', platform)
      .limit(1)
      .get();
    
    if (settingsSnapshot.empty) {
      return NextResponse.json({ settings: null });
    }
    
    const settingsDoc = settingsSnapshot.docs[0];
    const settings = settingsDoc.data();
    
    return NextResponse.json({ settings });
    
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// POST - Save auto-follow settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, ...settings } = body;
    
    if (!platform) {
      return NextResponse.json(
        { error: 'Missing required field: platform' },
        { status: 400 }
      );
    }
    
    // Check if settings exist
    const settingsRef = db.collection('follow_settings');
    const settingsSnapshot = await settingsRef
      .where('platform', '==', platform)
      .limit(1)
      .get();
    
    if (settingsSnapshot.empty) {
      // Create new settings
      await settingsRef.add({
        platform,
        ...settings,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Update existing settings
      const settingsDoc = settingsSnapshot.docs[0];
      await settingsDoc.ref.update({
        ...settings,
        updatedAt: new Date().toISOString(),
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Settings saved successfully',
    });
    
  } catch (error: any) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save settings' },
      { status: 500 }
    );
  }
}
