import { isFirebaseReady, getDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let campaignCount = 0;
    let contentCount = 0;
    if (isFirebaseReady()) {
      const db = getDb()!;
      const cmpSnap = await db.collection('campaigns').get();
      const cntSnap = await db.collection('content').get();
      campaignCount = cmpSnap.size;
      contentCount = cntSnap.size;
    }
    // Synthetic metrics for now
    const todayRevenue = Number((campaignCount * 17.35 + contentCount * 3.1).toFixed(2));
    const clicks = campaignCount * 40 + Math.round(Math.random() * 50);
    const conversions = Math.round(clicks * 0.07);
    return Response.json({ campaignCount, contentCount, todayRevenue, clicks, conversions });
  } catch (e: any) {
    return Response.json({ error: e.message || 'Failed to load summary' }, { status: 500 });
  }
}