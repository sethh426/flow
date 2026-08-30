import cron from 'node-cron';
import { chromium } from 'playwright';
import { getDb } from './firebase.js';
import { getNordstromCategories, selectBestCategories } from './smart-categories.js';
import { fileURLToPath } from 'url';

const delay = ms => new Promise(res => setTimeout(res, ms));

const scrapeCategory = async (browser, db, { label, url, source }, scrapeLimit) => {
  let page;
  try {
    page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const productCards = await page.$$('div[data-testid="product-card"]');
    let count = 0;
    
    for (const card of productCards) {
      if (count >= scrapeLimit) break;
      let name = '', price = '', imageURL = '', href = '', itemNumber = 'unknown';
      try {
        name = await card.$eval('h3', el => el.textContent.trim());
        price = await card.$eval('[data-testid="price"]', el => el.textContent.trim());
        imageURL = await card.$eval('img', el => el.src);
        href = await card.$eval('a', el => el.href);
        const itemNumberMatch = href.match(/\/(\d+)(?:\?|$)/);
        itemNumber = itemNumberMatch ? itemNumberMatch[1] : 'unknown';
      } catch (err) {
        console.error(`[scrapeCategory] Skipping product card due to parsing error in category "${label}":`, err.message);
        continue;
      }

      try {
        await db.collection('products').add({
          brandId: 'nordstrom',
          name,
          description: '',
          price,
          imageURL,
          affiliateURL: href,
          itemNumber,
          category: label,
          source,
          timestamp: new Date().toISOString(),
          approved: false,
          status: 'pending'
        });
      } catch (err) {
        console.error(`[scrapeCategory] Error saving product "${name}" to Firestore:`, err);
        continue;
      }

      count++;
      await delay(200);
    }
  } catch (err) {
    console.error(`[scrapeCategory] Unexpected error in category "${label}":`, err);
  } finally {
    if (page) {
      await page.close();
    }
  }
};

export const runScraper = async (scrapeLimit = 4) => {
  let browser;
  let db;
  try {
    console.log('🤖 Discovering best categories with AI...');
    console.log(`Scraping up to ${scrapeLimit} items per category.`);

    // Launch browser and connect to DB once for efficiency
    browser = await chromium.launch({ headless: true });
    db = getDb(); // Connect to Firestore
    console.log('✅ Browser launched.');

    const allCategories = await getNordstromCategories();
    const bestCategories = await selectBestCategories(allCategories);

    console.log('🕒 Running scrape for', scrapeLimit, 'items per category:', bestCategories.map(c => c.label).join(', '));
    for (const category of bestCategories) {
      await scrapeCategory(browser, db, { ...category, source: 'ai-selected' }, scrapeLimit);
    }
    console.log('✅ Scraping complete.');
  } catch (err) {
    if (err && err.message && err.message.includes('API key')) {
      console.error('❌ Google API key error: Please check your .env and ensure GOOGLE_API_KEY is set and valid.');
    } else if (err.message.includes('Firestore')) {
        console.error('❌ Firestore connection error:', err.message);
    } else {
      console.error('[runScraper] Error:', err);
    }
    // Re-throw the error so the caller can handle it, instead of exiting the process.
    throw err;
  } finally {
    if (browser) {
      await browser.close();
      console.log('✅ Browser closed.');
    }
  }
};

// This block allows the script to be run directly from the command line
// while also being importable as a module in other files (like a server).
const main = async () => {
  // Schedule the scraper to run automatically.
  // It will scrape 10 items per category when it runs on schedule.
  cron.schedule('0 6 * * *', () => {
    console.log('🕒 Running scheduled daily scrape...');
    runScraper(10).catch(err => console.error('Scheduled scrape failed:', err));
  });
  console.log('✅ Scraper is scheduled to run every day at 6 AM.');

  // For immediate testing, you can run: node scrape.js
  console.log('🚀 Running one-time scrape for testing...');
  await runScraper(2); // Scrape 2 items for a quick test run
};

// This logic ensures that the `main` function is only called when you run
// `node scrape.js` from your terminal. It won't run if you import `runScraper`.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(() => process.exit(1));
}
