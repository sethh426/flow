const express = require('express');
const bodyParser = require('body-parser');
const browserMCP = require('@browsermcp/mcp');

const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('🟢 Product-mapper is alive');
});

app.post('/map', async (req, res) => {
  console.log('🔥 /map endpoint triggered');
  console.log('📦 Received payload:', req.body);

  const { affiliateUrl, query, country } = req.body;

  if (!affiliateUrl || !query || !country) {
    return res.status(400).json({ error: 'affiliateUrl + query + country required' });
  }

  try {
    const products = await scrapeNordstromWithBrowserMCP(affiliateUrl);
    return res.json({ products });
  } catch (err) {
    console.error('❌ Scraping failed:', err);
    return res.status(500).json({ error: 'Failed to scrape product data' });
  }
});

async function scrapeNordstromWithBrowserMCP(url) {
  const { browser, page } = await browserMCP.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  const products = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('[data-testid="product-card"]')).map(card => {
      const anchor = card.querySelector('a');
      return {
        title: card.querySelector('[data-testid="product-tit]()
