
const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const admin = require('firebase-admin');
const { VertexAI } = require('@google-cloud/vertexai');

// Use the stealth plugin to make the scraper appear more human-like
chromium.use(stealth);

// Initialize Firebase Admin SDK for Firestore access.
try {
  admin.initializeApp();
} catch (e) {
  console.log('Firebase Admin already initialized.');
}

// Initialize Vertex AI
const vertex_ai = new VertexAI({ project: process.env.GCLOUD_PROJECT, location: 'us-central1' });
const model = 'gemini-1.5-flash-001'; // Using Gemini 1.5 Flash for its speed and large context window

const generativeModel = vertex_ai.getGenerativeModel({
  model: model,
  generationConfig: {
    'maxOutputTokens': 8192,
    'temperature': 0.1, // Lower temperature for more predictable, structured output
    'topP': 0.95,
    'responseMimeType': 'application/json', // Request JSON output directly
  },
  safetySettings: [ // Relax safety settings to avoid blocking e-commerce content
    { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_ONLY_HIGH" },
    { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_ONLY_HIGH" },
    { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_ONLY_HIGH" },
    { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_ONLY_HIGH" }
  ],
});


/**
 * An intelligent, AI-powered scraper.
 * This function navigates to a URL, gets the page's HTML, and uses an LLM
 * to extract structured data based on a provided prompt.
 *
 * @param {object} req The Express.js request object.
 * @param {object} res The Express.js response object.
 */
exports.handler = async (req, res) => {
  // Set CORS headers for all responses
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
    return;
  }

  // The service now accepts a generic searchURL and an extractionPrompt.
  const { searchURL, affiliateAccountId, extractionPrompt } = req.body;

  if (!searchURL || !affiliateAccountId) {
    return res.status(400).json({ error: 'Missing "searchURL" or "affiliateAccountId" in request body.' });
  }

  // The default prompt for backward compatibility with the product scraper flow.
  const defaultPrompt = `
      You are an expert web scraping agent. Your task is to analyze the provided HTML of an e-commerce search results page and extract product information.

      Here is the HTML content:
      \`\`\`html
      {{{bodyHtml}}}
      \`\`\`

      Analyze the HTML to identify the main container holding the list of products. For each product, extract the following information:
      1.  'name': The full product title.
      2.  'price': The displayed price as a string (e.g., "$19.99").
      3.  'url': The absolute URL to the product's detail page. If the URL is relative (e.g., "/product/123"), prepend it with the base URL of the site.
      4.  'imageURL': The source URL of the main product image. Ensure it's a high-quality, absolute URL.

      Return ONLY a valid JSON array of product objects. Do not include any items that are clearly ads or non-product links. Focus on the organic search results. Your entire response must be a single JSON array.
  `;

  const finalPromptTemplate = extractionPrompt || defaultPrompt;

  console.log(`Starting AI scrape for URL: "${searchURL}" with account: ${affiliateAccountId}`);
  
  let browser;
  try {
    console.log("Launching headless browser with stealth mode...");
    // Launch browser using the patched playwright-extra
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        // Use a realistic user agent to avoid bot detection
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    });
    const page = await context.newPage();

    console.log(`Navigating to ${searchURL}`);
    await page.goto(searchURL, { waitUntil: 'networkidle', timeout: 60000 });
    
    // Wait for a generic selector that indicates content has loaded.
    await page.waitForSelector('body', { timeout: 10000 });
    const bodyHtml = await page.content();
    console.log(`Successfully fetched HTML content of the page. Length: ${bodyHtml.length}`);
    await browser.close();
    browser = null; // Mark browser as closed.

    // Inject the fetched HTML into the prompt template.
    const finalPrompt = finalPromptTemplate.replace('{{{bodyHtml}}}', bodyHtml);
    
    console.log("Sending HTML to Gemini for extraction...");
    const aiResponse = await generativeModel.generateContent(finalPrompt);
    
    const responsePart = aiResponse?.response?.candidates?.[0]?.content?.parts?.[0];
    if (!responsePart || !responsePart.text) {
        throw new Error("AI did not return valid content. It may have been blocked by safety settings or returned an empty response.");
    }
    
    const jsonText = responsePart.text;
    let items;
    try {
        items = JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse AI response as JSON:", jsonText);
        throw new Error("The AI returned content that was not valid JSON.");
    }
    
    // This handles both cases: where the AI returns a direct array, or an object with the array inside (e.g., { "products": [...] } or { "summary": "..." })
    const resultData = Array.isArray(items) ? items : items;
    // Intelligently find the array within the object if it exists.
    const productArray = Array.isArray(resultData) ? resultData : (resultData[Object.keys(resultData).find(k => Array.isArray(resultData[k]))] || []);

    // If the result isn't an array at this point, it could be a summary object, which is valid.
    if (!Array.isArray(productArray) && typeof resultData === 'object' && resultData !== null) {
        console.log(`AI successfully extracted a summary object.`);
        return res.status(200).json(resultData);
    }

    if (!Array.isArray(productArray)) {
         throw new Error("The AI response was not in the expected format of a JSON array or an object containing data.");
    }
    
    console.log(`AI successfully extracted ${productArray.length} items.`);

    // Check if affiliateURL needs to be constructed. Only the product scraper flow needs this.
    if (productArray.length > 0 && productArray[0].url && !productArray[0].affiliateURL) {
      const itemsWithAffiliateLink = productArray.map(item => {
          if (!item.url) return item;
          try {
            const url = new URL(item.url);
            url.searchParams.set('tag', affiliateAccountId); // Append affiliate tag
            return {
                ...item,
                affiliateURL: url.toString(),
            };
          } catch(e) {
            console.warn(`Invalid URL found for item ${item.name}: ${item.url}`);
            return item;
          }
      });
      return res.status(200).json(itemsWithAffiliateLink);
    }

    res.status(200).json(resultData);

  } catch (error) {
    console.error('An error occurred during the scraping process:', error);
    res.status(500).json({ error: 'Failed to scrape products.', details: error.message });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
