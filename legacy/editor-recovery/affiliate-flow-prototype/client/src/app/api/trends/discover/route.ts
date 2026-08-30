import { NextRequest } from 'next/server';
import { getDb, isFirebaseReady } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

// Simple mock trend generation; if Firestore available, optionally persist.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const limit = Math.min(Math.max(Number(body?.limit) || 5, 1), 20);
    const now = Date.now();
    const trends = Array.from({ length: limit }).map((_, i) => ({
      id: `trend-${now}-${i}`,
      productName: ['Wireless Earbuds','Smart Fitness Band','4K Mini Projector','Portable Solar Charger','AI Writing Assistant','USB-C Hub','Ergonomic Chair','Noise-Cancel Headset'][i % 8],
      velocity: Math.round(Math.random() * 300 + 50), // pseudo search velocity
      score: Number((Math.random() * 0.6 + 0.4).toFixed(2)),
      category: ['Tech','Productivity','Outdoors','Office'][i % 4],
      detectedAt: new Date().toISOString()
    }));

    if (isFirebaseReady()) {
      try {
        const db = getDb();
        const batch = db!.batch();
        const col = db!.collection('trends');
        trends.forEach(t => batch.set(col.doc(t.id), t, { merge: true }));
        await batch.commit();
      } catch (e) {
        console.warn('Trend persistence skipped:', e);
      }
    }
    return Response.json({ trends });
  } catch (e: any) {
    return Response.json({ error: e.message || 'Failed to discover trends' }, { status: 500 });
  }
}