import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

/**
 * POST /api/campaigns/[id]/toggle
 * Toggle campaign status between active and paused
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    const body = await request.json();
    const { status } = body;

    // Validate status
    if (!['active', 'paused', 'draft'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be active, paused, or draft' },
        { status: 400 }
      );
    }

    const campaignRef = doc(db, 'campaigns', campaignId);
    
    // Check if campaign exists
    const campaignSnap = await getDoc(campaignRef);
    if (!campaignSnap.exists()) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Update status
    await updateDoc(campaignRef, {
      status,
      updatedAt: Timestamp.now(),
    });

    // Fetch updated campaign
    const updatedSnap = await getDoc(campaignRef);
    const updatedData = updatedSnap.data();

    return NextResponse.json({
      message: `Campaign ${status === 'active' ? 'activated' : status === 'paused' ? 'paused' : 'set to draft'}`,
      campaign: {
        id: updatedSnap.id,
        ...updatedData,
        createdAt: updatedData?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: updatedData?.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      },
    });

  } catch (error: any) {
    console.error('Error toggling campaign status:', error);
    return NextResponse.json(
      { error: 'Failed to toggle campaign status', details: error.message },
      { status: 500 }
    );
  }
}
