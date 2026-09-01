import { getApps, initializeApp } from 'firebase-admin/app';
import { DecodedIdToken, getAuth } from 'firebase-admin/auth';

if (getApps().length === 0) {
  initializeApp();
}

export const allowedCorsOrigins: Array<string | RegExp> = [
  'https://flowearlyadopters.web.app',
  'https://flowearlyadopters.firebaseapp.com',
  'https://affiliateflow-abzfy.web.app',
  'https://affiliateflow-abzfy.firebaseapp.com',
  /^https:\/\/flowearlyadopters--[a-z0-9-]+\.web\.app$/,
  /^http:\/\/localhost:\d+$/,
];

function isAllowedOrigin(origin: string): boolean {
  return allowedCorsOrigins.some((allowed) => (
    typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
  ));
}

export function handleCors(req: any, res: any): boolean {
  const origin = req.get('origin') || '';

  if (origin && !isAllowedOrigin(origin)) {
    res.status(403).json({ error: 'Origin is not allowed by CORS.' });
    return true;
  }

  if (origin) {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Vary', 'Origin');
  }

  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
    return true;
  }

  return false;
}

export async function requireFirebaseUser(req: any, res: any): Promise<DecodedIdToken | null> {
  const authorization = req.get('authorization') || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    res.status(401).json({ error: 'A Firebase ID token is required.' });
    return null;
  }

  try {
    return await getAuth().verifyIdToken(match[1], true);
  } catch (error: any) {
    console.warn('Rejected Firebase ID token', {
      code: error?.code || 'unknown',
    });
    res.status(401).json({ error: 'The Firebase ID token is invalid or expired.' });
    return null;
  }
}

export function isAdmin(user: DecodedIdToken): boolean {
  return user.admin === true || user.role === 'admin';
}

export function isLiveAiEnabled(): boolean {
  return process.env.ENABLE_LIVE_AI === 'true';
}

export function requireLiveAi(res: any): boolean {
  if (isLiveAiEnabled()) {
    return true;
  }

  res.status(503).json({
    error: 'AI features are not enabled.',
    code: 'AI_NOT_CONFIGURED',
  });
  return false;
}
