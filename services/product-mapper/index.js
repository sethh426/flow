

import express from 'express';
import bodyParser from 'body-parser';
import { chromium } from 'playwright';
import { getDb } from '../../firebase.js';
import fs from 'fs';
import dotenv from 'dotenv';
import OpenAI from 'openai';
dotenv.config({ path: '../../.env' });
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// Log all uncaught errors to a file
process.on('uncaughtException', err => {
  fs.appendFileSync('product-mapper-error.log', `[${new Date().toISOString()}] Uncaught Exception: ${err.stack || err}\n`);
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', err => {
  fs.appendFileSync('product-mapper-error.log', `[${new Date().toISOString()}] Unhandled Rejection: ${err.stack || err}\n`);
  console.error('Unhandled Rejection:', err);
});

const app = express();
app.use(bodyParser.json());



// Fuzzy string matching helper (fallback)
function fuzzyMatch(str1, str2) {
  if (!str1 || !str2) return 0;
  str1 = str1.toLowerCase();
  str2 = str2.toLowerCase();
  if (str1 === str2) return 1;
  const words1 = new Set(str1.split(/\W+/));
  const words2 = new Set(str2.split(/\W+/));
  const shared = [...words1].filter(w => words2.has(w));
  return shared.length / Math.max(words1.size, words2.size);
}

// Embedding helper
async function getEmbedding(text) {
  if (!openai) return null;
  try {
    const resp = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text
    });
    return resp.data[0].embedding;
  } catch (err) {
    console.error('OpenAI embedding error:', err.message);
    return null;
  }
}

function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

app.post('/map', async (req, res) => {
  const { affiliateUrl, query, scrapeLimit = 5, selectors = {}, userId, matchThreshold = 0.5 } = req.body;
  if (!affiliateUrl) return res.status(400).send('affiliateUrl required');
  // Universal selectors with fallback defaults
  const cardSelector = selectors.card || 'div[data-testid="product-card"]';
  const nameSelector = selectors.name || 'h3';
  const priceSelector = selectors.price || '[data-testid="price"]';
  const imageSelector = selectors.image || 'img';
  const linkSelector = selectors.link || 'a';
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(affiliateUrl, { waitUntil: 'domcontentloaded' });
    const productCards = await page.$$(cardSelector);
    let count = 0;
    const db = getDb();
    const products = [];
    for (const card of productCards) {
      if (count >= scrapeLimit) break;
      let name = '', price = '', imageURL = '', href = '', itemNumber = 'unknown';
      try {
        name = await card.$eval(nameSelector, el => el.textContent.trim());
        price = await card.$eval(priceSelector, el => el.textContent.trim());
        imageURL = await card.$eval(imageSelector, el => el.src);
        href = await card.$eval(linkSelector, el => el.href);
        const itemNumberMatch = href.match(/\/(\d+)(?:\?|$)/);
        itemNumber = itemNumberMatch ? itemNumberMatch[1] : 'unknown';
      } catch (err) {
        console.error(`[scrapeCategory] Skipping product card due to parsing error:`, err.message);
        continue;
      }
      const product = {
        brandId: 'universal',
        name,
        description: '',
        price,
        imageURL,
        affiliateURL: href,
        itemNumber,
        category: query,
        source: 'api',
        timestamp: new Date().toISOString(),
        approved: false,
        status: 'pending'
      };
      try {
        await db.collection('products').add(product);
      } catch (err) {
        console.error(`[scrapeCategory] Error saving product to Firestore:`, err);
      }
      products.push(product);
      count++;
    }
    // --- Product base matching (AI embeddings) ---
    let matches = [];
    if (userId) {
      // Fetch user's product base from Firestore: products where userId matches
      const userProductsSnap = await db.collection('userProducts').where('userId', '==', userId).get();
      const userProducts = [];
      userProductsSnap.forEach(doc => userProducts.push({ id: doc.id, ...doc.data() }));

      // Precompute embeddings for user products
      let userEmbeddings = [];
      if (openai) {
        userEmbeddings = await Promise.all(userProducts.map(async p => ({
          ...p,
          embedding: await getEmbedding(p.name + ' ' + (p.description || ''))
        })));
      }

      // For each scraped product, find best match in user base
      for (const scraped of products) {
        let best = null;
        let bestScore = 0;
        let scrapedEmbedding = openai ? await getEmbedding(scraped.name + ' ' + (scraped.description || '')) : null;
        for (let i = 0; i < userProducts.length; i++) {
          let score = 0;
          if (openai && scrapedEmbedding && userEmbeddings[i].embedding) {
            score = cosineSimilarity(scrapedEmbedding, userEmbeddings[i].embedding);
          } else {
            score = fuzzyMatch(scraped.name, userProducts[i].name);
          }
          if (score > bestScore) {
            bestScore = score;
            best = userProducts[i];
          }
        }
        if (best && bestScore >= matchThreshold) {
          matches.push({ scraped, match: best, score: bestScore });
        } else {
          matches.push({ scraped, match: null, score: bestScore });
        }
      }
    }
    await browser.close();
    res.json({ products, matches });
  } catch (err) {
    if (browser) await browser.close();
    console.error(err);
    res.status(500).send(err.message);
  }
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => console.log(`🚀 product-mapper listening on ${PORT}`));
