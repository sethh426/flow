// trendsProductSuggestAndContent.js
// Uses Google Trends API, Google Shopping scraping, and Gemini for fact-based content

const { chromium } = require('playwright');
const { google } = require('googleapis');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// 1. Get top related trends using Google Trends API
async function getTopTrends(query, apiKey, geo = 'US') {
  const trends = google.trends({ version: 'v1beta', auth: apiKey });
  // NOTE: The official Trends API is in preview and may require special access.
  // This is a placeholder for the official call. Replace with your actual API usage.
  // See: https://developers.google.com/trends/api/reference/rest
  // Example: trends.getRelatedQueries({ keyword: query, geo })
  // For now, fallback to a static array if API is not available.
  return [query];
}

// 2. Search Google Shopping for real products
async function searchGoogleShopping(trend, maxResults = 3) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const searchUrl = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(trend)}`;
  await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('div.sh-dgr__grid-result', { timeout: 15000 });
  const products = await page.$$eval('div.sh-dgr__grid-result', (cards, max) => {
    return cards.slice(0, max).map(card => {
      const name = card.querySelector('h4, h3')?.innerText || '';
      const price = card.querySelector('.T14wmb')?.innerText || '';
      const image = card.querySelector('img')?.src || '';
      const url = card.querySelector('a')?.href || '';
      const description = card.querySelector('.EI11Pd')?.innerText || '';
      return { name, price, image, url, description };
    });
  }, maxResults);
  await browser.close();
  return products.filter(p => p.name && p.price && p.url);
}

// 3. Generate fact-based content using Gemini
async function generateFactBasedContent(product, trendFacts) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_API_KEY not set');
  const prompt = `Given these facts about the product and trend, summarize for social media. Do not invent or add anything not present in the facts.\n\nProduct: ${product.name}\nDescription: ${product.description}\nTrend facts: ${trendFacts.join(' ')}\n`;
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No content generated.';
}

// 4. Main workflow
async function suggestAndPrepareProduct(userQuery, trendsApiKey) {
  // Step 1: Get top trends
  const trends = await getTopTrends(userQuery, trendsApiKey);
  const bestTrend = trends[0];
  // Step 2: Search Google Shopping for best trend
  const products = await searchGoogleShopping(bestTrend);
  // Step 3: For each product, generate fact-based content
  const results = [];
  for (const product of products) {
    const content = await generateFactBasedContent(product, trends);
    results.push({ ...product, trend: bestTrend, content });
  }
  return results;
}

// CLI/test usage
if (require.main === module) {
  (async () => {
    const userQuery = process.argv[2] || "shoe";
    const trendsApiKey = process.env.GOOGLE_TRENDS_API_KEY || "";
    console.log(`Finding best trend and products for: ${userQuery}\n`);
    const results = await suggestAndPrepareProduct(userQuery, trendsApiKey);
    for (const p of results) {
      console.log(`- ${p.name} (${p.price})\n  ${p.content}\n  ${p.url}\n`);
    }
  })();
}

module.exports = { suggestAndPrepareProduct };
