import { NextRequest } from 'next/server';
import { getDb, isFirebaseReady } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

// Minimal GET campaigns (MVP)
export async function GET() {
  if (!isFirebaseReady()) {
    return Response.json({ campaigns: [] });
  }
  const db = getDb()!;
  const snap = await db.collection('campaigns').orderBy('createdAt','desc').limit(50).get();
  return Response.json({ campaigns: snap.docs.map(d => d.data()) });
}

// Minimal POST create campaign (MVP)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, productId, productName } = body;
    if (!name || !productName) {
      return Response.json({ error: 'Missing name or productName' }, { status: 400 });
    }
    const created = {
      id: `cmp_${Date.now().toString(36)}`,
      name,
      productId: productId || null,
      productName,
      status: 'draft',
      createdAt: Date.now(),
    };
    if (isFirebaseReady()) {
      const db = getDb()!;
      await db.collection('campaigns').doc(created.id).set(created);
    }
    return Response.json({ campaign: created });
  } catch (e: any) {
    return Response.json({ error: e.message || 'Failed to create campaign' }, { status: 500 });
  }
}
