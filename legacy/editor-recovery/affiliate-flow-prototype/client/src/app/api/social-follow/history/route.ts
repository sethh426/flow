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

// GET - Fetch follow history
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
    
    // Get follow history
    const historyRef = db.collection('follow_history');
    const query = historyRef
      .where('platform', '==', platform)
      .orderBy('timestamp', 'desc')
      .limit(100);
    
    const historySnapshot = await query.get();
    const history: any[] = [];
    
    historySnapshot.forEach(doc => {
      history.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    
    return NextResponse.json({ history });
    
  } catch (error: any) {
    console.error('Error fetching follow history:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
