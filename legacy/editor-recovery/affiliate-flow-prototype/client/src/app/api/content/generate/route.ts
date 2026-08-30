import { NextRequest } from 'next/server';
import { getDb, isFirebaseReady } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

// Minimal MVP content generation stub
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignId, prompt } = body;
    if (!campaignId) {
      return Response.json({ error: 'campaignId required' }, { status: 400 });
    }
    const generatedBody = `Promote ${body.productName || 'your product'}: ${prompt || 'Unlock exclusive benefits today!'} #Affiliate #Growth`;
    const content = {
      id: `cnt_${Date.now().toString(36)}`,
      campaignId,
      type: 'social_post',
      body: generatedBody,
      createdAt: Date.now(),
    };
    if (isFirebaseReady()) {
      const db = getDb()!;
      await db.collection('content').doc(content.id).set(content);
    }
    return Response.json({ content });
  } catch (e: any) {
    return Response.json({ error: e.message || 'Failed to generate content' }, { status: 500 });
  }
}
