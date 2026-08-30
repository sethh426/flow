// import OpenAI from "openai";
import { chromium } from "playwright";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { getAllTrends } from "./trend-sources/index.js";
import path from "path";
import fs from "fs";
dotenv.config();

// Extra check: try to load .env manually if dotenv fails
if (!process.env.GEMINI_API_KEY) {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      if (line.startsWith("GEMINI_API_KEY=")) {
        const key = line.split("=")[1]?.trim();
        if (key) {
          process.env.GEMINI_API_KEY = key;
          console.log("[Fallback] Loaded GEMINI_API_KEY from .env manually.");
        }
      }
    }
  }
}

// Remove BOM from .env if present
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  let envContent = fs.readFileSync(envPath);
  // Remove UTF-8 BOM if present
  if (envContent[0] === 0xef && envContent[1] === 0xbb && envContent[2] === 0xbf) {
    envContent = envContent.slice(3);
    fs.writeFileSync(envPath, envContent);
    console.log("[Fix] Removed BOM from .env file.");
  }
}

// --- BEGIN: Force rewrite .env file as UTF-8 without BOM ---
try {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf-8");
    // Remove BOM if present
    if (envContent.charCodeAt(0) === 0xFEFF) {
      envContent = envContent.slice(1);
    }
    // Only keep the correct line
    const lines = envContent.split(/\r?\n/).filter(line => line.startsWith("GEMINI_API_KEY="));
    if (lines.length > 0) {
      fs.writeFileSync(envPath, lines[0], { encoding: "utf8", flag: "w" });
      console.log("[Fix] Rewrote .env file as UTF-8 without BOM and with only GEMINI_API_KEY line.");
    }
  }
} catch (e) {
  console.error("[Fix] Failed to rewrite .env file:", e);
}
// --- END: Force rewrite .env file as UTF-8 without BOM ---

// --- FORCE OVERWRITE .env FILE WITH CORRECT CONTENT ---
try {
  const envPath = path.resolve(process.cwd(), ".env");
  const correctLine = "GEMINI_API_KEY=REDACTED_GOOGLE_API_KEY";
  fs.writeFileSync(envPath, correctLine, { encoding: "utf8", flag: "w" });
  process.env.GEMINI_API_KEY = "REDACTED_SECRET";
  console.log("[Fix] Overwrote .env file and set GEMINI_API_KEY in process.env.");
} catch (e) {
  console.error("[Fix] Failed to overwrite .env file:", e);
}
// --- END FORCE OVERWRITE ---

console.log('Loaded GEMINI_API_KEY:'REDACTED_SECRET'[set]' : '[not set]');
console.log('GEMINI_API_KEY length:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Update Gemini API endpoint and model name for latest API
const GEMINI_API_MODEL = "models/gemini-pro";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

// --- Gemini token usage tracking ---
let geminiInputTokens = 0;
let geminiOutputTokens = 0;

function countTokens(text) {
  // Approximate: 1 token ≈ 4 characters (for English, rough estimate)
  return Math.ceil(text.length / 4);
}

async function geminiChat(prompt) {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set in .env");
  geminiInputTokens += countTokens(prompt);
  const response = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });
  if (!response.ok) {
    let errorText = await response.text();
    console.error("Gemini API error response:", errorText);
    throw new Error("Gemini API error: " + response.statusText + "\n" + errorText);
  }
  const data = await response.json();
  const output = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  geminiOutputTokens += countTokens(output);
  return output;
}

// Scrape Nordstrom homepage for category links
export async function getNordstromCategories() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://www.nordstrom.com/', { waitUntil: 'domcontentloaded' });

  // Scrape all visible category links from the homepage nav
  const categories = await page.$$eval('nav a', links =>
    links
      .filter(link => link.href && link.textContent.trim().length > 0)
      .map(link => ({ label: link.textContent.trim(), url: link.href }))
  );

  await browser.close();
  return categories;
}

// Use Gemini API to select the best categories
export async function selectBestCategories(categories) {
  const prompt = `Given this list of Nordstrom categories, select the 3 most trending or high-value categories for online shoppers. Return only a JSON array of objects with 'label' and 'url'.\n\n${JSON.stringify(categories, null, 2)}`;
  const text = await geminiChat(prompt);
  try {
    return JSON.parse(text);
  } catch {
    // fallback: try to extract JSON from text
    const match = text.match(/\[.*\]/s);
    return match ? JSON.parse(match[0]) : [];
  }
}

// Search Nordstrom for a product by keyword (basic implementation)
export async function searchNordstromForProduct(keyword) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://www.nordstrom.com/', { waitUntil: 'domcontentloaded' });
  await page.fill('input[type="search"]', keyword);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(3000); // Wait for results to load
  // Scrape first product result
  const product = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="product-card"]');
    if (!el) return null;
    const name = el.querySelector('[data-testid="product-title"]')?.textContent?.trim();
    const price = el.querySelector('[data-testid="price"]')?.textContent?.trim();
    const url = el.querySelector('a')?.href;
    const itemNumber = el.getAttribute('data-product-id') || null;
    return { name, price, affiliateURL: url, itemNumber };
  });
  await browser.close();
  return product;
}

// Use Gemini API to select the best trending products
export async function selectBestTrendingProducts(trends, products) {
  const prompt = `You are a fashion trend researcher. Here are trending topics and products from Google Trends, Reddit, and fashion news: \n${JSON.stringify(trends, null, 2)}\n\nHere are products found at Nordstrom for those trends: \n${JSON.stringify(products, null, 2)}\n\nSelect the 3 most in-demand, trending products that are currently available at Nordstrom. For each, return: name, price, affiliateURL, itemNumber, and a short explanation of why it's trending. If a trending product is not available, suggest the closest alternative. Return only a JSON array of objects as described.`;
  const text = await geminiChat(prompt);
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\[.*\]/s);
    return match ? JSON.parse(match[0]) : [];
  }
}

// Example usage
(async () => {
  try {
    const categories = await getNordstromCategories();
    const best = await selectBestCategories(categories);
    console.log('Best categories:', best);

    // Example usage: advanced trend research
    const trends = await getAllTrends();
    const products = [];
    for (const trend of trends.slice(0, 10)) { // Limit for demo
      const product = await searchNordstromForProduct(trend);
      if (product) products.push({ ...product, trend });
    }
    const bestTrending = await selectBestTrendingProducts(trends, products);
    console.log('Best trending products:', bestTrending);

    // Write token usage to a file for visualization
    fs.writeFileSync(
      "gemini_token_usage.json",
      JSON.stringify({ input_tokens: geminiInputTokens, output_tokens: geminiOutputTokens }, null, 2)
    );
    console.log(`Token usage for this run: input=${geminiInputTokens}, output=${geminiOutputTokens}`);
  } catch (err) {
    console.error('Error in workflow:', err);
    if (process.env.GEMINI_API_KEY === undefined) {
      console.error('GEMINI_API_KEY is not set. Please add it to your .env file.');
    }
  }
})();
