import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

const app = express();
app.use(express.json());

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
    res.json({ trends });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`trend-finder on ${PORT}`));
