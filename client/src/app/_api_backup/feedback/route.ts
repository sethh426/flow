import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, suggestion, liked, timestamp } = body;

    if (!category || !suggestion || typeof liked !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Save feedback to Firestore
    const feedbackRef = collection(db, 'search_feedback');
    await addDoc(feedbackRef, {
      category,
      suggestion,
      liked,
      timestamp: timestamp ? new Date(timestamp) : serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Feedback API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save feedback' },
      { status: 500 }
    );
  }
}
