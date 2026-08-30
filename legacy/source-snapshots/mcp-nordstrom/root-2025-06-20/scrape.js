// scrape.js
// Main Playwright MCP scraper for Nordstrom

const { chromium } = require('playwright');
const db = require('./firebase');
const categories = require('./categories');

async function scrapeCategory(category, maxItems = 5) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(category.url, { waitUntil: 'domcontentloaded' });

  // Wait for product cards to load
  await page.waitForSelector('[data-testid="product-card"]');
  const products = await page.$$('[data-testid="product-card"]');
  let scraped = 0;

  for (const product of products) {
    if (scraped >= maxItems) break;
    try {
      const name = await product.$eval('h3', el => el.textContent.trim());
      const price = await product.$eval('[data-testid="price"]', el => el.textContent.trim());
      const imageURL = await product.$eval('img', el => el.src);
      const productURL = await product.$eval('a', el => el.href);
      // Extract item number from URL (e.g., /item/7140291)
      const itemNumberMatch = productURL.match(/\/item\/(\d+)/);
      const itemNumber = itemNumberMatch ? itemNumberMatch[1] : '';

      // Write to Firestore
      await db.collection('products').add({
        brandId: 'nordstrom',
        name,
        price,
        imageURL,
        affiliateURL: productURL,
        itemNumber,
        category: category.label,
        source: category.source,
        timestamp: new Date().toISOString(),
        approved: false,
        status: 'pending'
      });
      scraped++;
      console.log(`Added: ${name} (${itemNumber})`);
    } catch (err) {
      console.error('Error scraping product:', err.message);
    }
  }
  await browser.close();
}

async function main() {
  let total = 0;
  for (const category of categories) {
    await scrapeCategory(category, 5); // 5 items per category
    total += 5;
  }
  console.log(`Done. Scraped ~${total} products.`);
  process.exit(0);
}

main();
