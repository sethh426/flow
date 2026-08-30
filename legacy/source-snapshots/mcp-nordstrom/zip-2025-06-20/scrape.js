const { chromium } = require("playwright");
const db = require("./firebase");
const categories = require("./categories");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let total = 0;

  for (const cat of categories) {
    console.log("Scraping:", cat.label);
    await page.goto(cat.url, { waitUntil: "networkidle" });

    const products = await page.locator('[data-testid="product-card"]').elementHandles();
    const count = Math.min(products.length, 5); // Max 5 per category

    for (let i = 0; i < count; i++) {
      const el = products[i];

      const name = await el.$eval("h3", node => node.textContent.trim());
      const price = await el.$eval('[data-testid="price"]', node => node.textContent.trim());
      const image = await el.$eval("img", img => img.src);
      const href = await el.$eval("a", a => a.href);
      const itemNumberMatch = href.match(/\/(\d{6,})/);
      const itemNumber = itemNumberMatch ? itemNumberMatch[1] : "unknown";

      const doc = {
        brandId: "nordstrom",
        name,
        description: "",
        imageURL: image,
        affiliateURL: href,
        itemNumber,
        category: cat.label,
        source: cat.source,
        approved: false,
        status: "pending",
        timestamp: new Date().toISOString()
      };

      await db.collection("products").add(doc);
      console.log("Added:", name);
      total++;
    }
  }

  console.log(`✅ Done. ${total} products pushed to Firestore.`);
  await browser.close();
})();
