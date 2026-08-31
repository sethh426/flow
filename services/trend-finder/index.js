import express from 'express';
import { getDb, verifyIdToken } from './firebase.js';

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));

async function requireFirebaseUser(req, res, next) {
  const authorization = req.get('authorization') || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return res.status(401).json({ error: 'A Firebase ID token is required.' });
  }

  try {
    req.user = await verifyIdToken(match[1]);
    return next();
  } catch (error) {
    console.warn('Trend Finder rejected an invalid ID token:', error.message);
    return res.status(401).json({ error: 'The Firebase ID token is invalid or expired.' });
  }
}

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'trend-finder' });
});

app.get('/ready', (req, res) => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
  res.status(hasGeminiKey ? 200 : 503).json({
    status: hasGeminiKey ? 'ready' : 'not-ready',
    service: 'trend-finder',
  });
});

app.post('/find', requireFirebaseUser, async (req, res) => {
  const query = typeof req.body?.query === 'string' ? req.body.query.trim() : 'fashion';

  if (!query || query.length > 200) {
    return res.status(400).json({ error: 'query must contain between 1 and 200 characters.' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Trend generation is not configured.' });
  }

  try {
    const prompt = `List 5 trending product or fashion topics for: ${query}`;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    if (!response.ok) {
      console.error('Gemini trend request failed with status:', response.status);
      return res.status(502).json({ error: 'Trend generation failed.' });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const trends = text.split(/\n|,|\d+\./).map((trend) => trend.trim()).filter(Boolean);
    const db = getDb();
    const doc = await db.collection('trends').add({
      query,
      trends,
      requestedBy: req.user.uid,
      timestamp: new Date().toISOString(),
      status: 'pending',
      approved: false,
    });

    return res.json({ trends, firestoreId: doc.id });
  } catch (error) {
    console.error('Trend generation failed:', {
      name: error.name,
      code: error.code || error.cause?.code || 'unknown',
    });
    return res.status(500).json({ error: 'Trend generation failed.' });
  }
});

const port = Number.parseInt(process.env.PORT || '8082', 10);
app.listen(port, () => console.log(`trend-finder listening on ${port}`));
