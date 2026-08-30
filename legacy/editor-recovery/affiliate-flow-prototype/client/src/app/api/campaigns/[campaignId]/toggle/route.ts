/**
 * Campaign Status Toggle API
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function POST(
  request: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    const { campaignId } = params;
    const body = await request.json();
    const { status } = body;

    if (!status || !['active', 'paused', 'draft'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status required (active, paused, draft)' },
        { status: 400 }
      );
    }

    await db.collection('campaigns').doc(campaignId).update({
      status,
      updatedAt: new Date().toISOString(),
    });

    const updated = await db.collection('campaigns').doc(campaignId).get();

    return NextResponse.json({
      success: true,
      campaign: {
        id: updated.id,
        ...updated.data(),
      },
    });
  } catch (error: any) {
    console.error('Error toggling campaign status:', error);
    return NextResponse.json(
      { error: 'Failed to update status', details: error.message },
      { status: 500 }
    );
  }
}
