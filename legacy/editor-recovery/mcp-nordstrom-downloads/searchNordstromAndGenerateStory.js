// searchNordstromAndGenerateStory.js
// Node.js script: Search real products on Nordstrom and generate AI-powered stories

const { chromium } = require('playwright');

// Gemini AI integration (using Google Generative AI SDK)
async function generateStory(product) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_API_KEY not set');
  const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
  const prompt = `Write a short, compelling story or value snippet about why the ${product.name} is trending or interesting. Include what makes it special or famous.`;
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No story generated.';
}

// Scrape Nordstrom for real products
async function searchNordstromProducts(trend = "shoe", maxResults = 3) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const searchUrl = `https://www.nordstrom.com/sr?keyword=${encodeURIComponent(trend)}`;
  await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-testid="product-card"]', { timeout: 15000 });
  const products = await page.$$eval('[data-testid="product-card"]', (cards, max) => {
    return cards.slice(0, max).map(card => {
      const name = card.querySelector('[data-testid="product-title"]')?.innerText || '';
      const price = card.querySelector('[data-testid="price"]')?.innerText || '';
      const image = card.querySelector('img')?.src || '';
      const url = card.querySelector('a')?.href || '';
      return { name, price, image, url };
    });
  }, maxResults);
  await browser.close();
  return products.filter(p => p.name && p.price && p.url);
}

// Main function: search and generate stories
async function searchAndGenerateStories(trend = "shoe") {
  const products = await searchNordstromProducts(trend);
  const results = [];
  for (const product of products) {
    const story = await generateStory(product);
    results.push({ ...product, story });
  }
  return results;
}

// CLI/test usage
if (require.main === module) {
  (async () => {
    const trend = process.argv[2] || "shoe";
    console.log(`Searching Nordstrom for: ${trend}\n`);
    const results = await searchAndGenerateStories(trend);
    for (const p of results) {
      console.log(`- ${p.name} (${p.price})\n  ${p.story}\n  ${p.url}\n`);
    }
  })();
}

module.exports = { searchAndGenerateStories };
