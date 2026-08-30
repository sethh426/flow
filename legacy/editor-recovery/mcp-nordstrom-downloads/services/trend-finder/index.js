import express from 'express';
import fetch from 'node-fetch';
import { getDb } from '../../firebase.js';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const app = express();
app.use(express.json());

// --- Google Secret Manager helper ---

/**
 * Fetch a secret value from Google Secret Manager
 * @param {string} secretName
 * @returns {Promise<string|null>}
 */
export async function getSecret(secretName) {
  try {
    const client = new SecretManagerServiceClient();
    const projectId = process.env.GOOGLE_CLOUD_PROJECT;
    if (!projectId) throw new Error('GOOGLE_CLOUD_PROJECT env var not set');
    const [version] = await client.accessSecretVersion({
      name: `projects/${projectId}/secrets/${secretName}/versions/latest`
    });
    return version.payload.data.toString();
  } catch (err) {
    console.error('SecretManager error:', err.message);
    return null;
  }
}

app.post('/find', async (req, res) => {
  const { query = "fashion" } = req.body;
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) return res.status(500).send('GEMINI_API_KEY or GOOGLE_API_KEY not set');
  try {
    // Call Gemini/Vertex AI for trend suggestions
    const prompt = `List 5 trending product or fashion topics for: ${query}`;
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    // Parse trends from Gemini response (split by line or comma)
    const trends = text.split(/\n|,|\d+\./).map(t => t.trim()).filter(Boolean);
    // Save to Firestore
    const db = getDb();
    const doc = await db.collection('trends').add({
      query,
      trends,
      timestamp: new Date().toISOString(),
      status: 'pending',
      approved: false
    });
    res.json({ trends, firestoreId: doc.id });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// Example endpoint to fetch APIFY_TOKEN from Secret Manager
app.get('/apify-token', async (req, res) => {
  const token = await getSecret('APIFY_TOKEN');
  if (token) {
    res.json({ token });
  } else {
    res.status(500).json({ error: 'Could not fetch APIFY_TOKEN from Secret Manager' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`trend-finder on ${PORT}`));
