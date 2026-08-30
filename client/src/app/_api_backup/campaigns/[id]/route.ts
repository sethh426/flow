import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, doc, getDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
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
 * GET /api/campaigns/[id]
 * Get a single campaign by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;

    const campaignRef = doc(db, 'campaigns', campaignId);
    const campaignSnap = await getDoc(campaignRef);

    if (!campaignSnap.exists()) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    const campaignData = campaignSnap.data();
    return NextResponse.json({
      campaign: {
        id: campaignSnap.id,
        ...campaignData,
        createdAt: campaignData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: campaignData.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      },
    });

  } catch (error: any) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/campaigns/[id]
 * Update a campaign
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    const updates = await request.json();

    // Remove fields that shouldn't be updated directly
    delete updates.id;
    delete updates.userId;
    delete updates.createdAt;

    const campaignRef = doc(db, 'campaigns', campaignId);
    
    // Check if campaign exists
    const campaignSnap = await getDoc(campaignRef);
    if (!campaignSnap.exists()) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Update campaign
    await updateDoc(campaignRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });

    // Fetch updated campaign
    const updatedSnap = await getDoc(campaignRef);
    const updatedData = updatedSnap.data();

    return NextResponse.json({
      message: 'Campaign updated successfully',
      campaign: {
        id: updatedSnap.id,
        ...updatedData,
        createdAt: updatedData?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: updatedData?.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      },
    });

  } catch (error: any) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/campaigns/[id]
 * Delete a campaign
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    const campaignRef = doc(db, 'campaigns', campaignId);

    // Check if campaign exists
    const campaignSnap = await getDoc(campaignRef);
    if (!campaignSnap.exists()) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Delete campaign
    await deleteDoc(campaignRef);

    return NextResponse.json({
      message: 'Campaign deleted successfully',
      campaignId,
    });

  } catch (error: any) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json(
      { error: 'Failed to delete campaign', details: error.message },
      { status: 500 }
    );
  }
}
