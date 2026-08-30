// mcpSearchProductsAndGenerateStory.js
// MCP-compatible wrapper for AffiliateFlow product search, story generation, and Firestore save

const { searchProductsAndGenerateStories } = require('./searchProductsAndGenerateStory');
const { saveProductToFirestore } = require('./firestoreSaveProduct');

/**
 * MCP handler: Accepts a trend/topic and userId, returns products + stories, saves to Firestore
 * @param {object} input - { trend: string, userId: string }
 * @returns {Promise<object>} - { products: [ ... ], trend: string, timestamp: string }
 */
async function mcpSearchProductsAndGenerateStory(input) {
  const trend = input?.trend || 'shoe';
  const userId = input?.userId || 'demo-user';
  const products = await searchProductsAndGenerateStories(trend);
  // Save each product to Firestore for the user
  const saved = [];
  for (const product of products) {
    const docId = await saveProductToFirestore(userId, product);
    saved.push({ ...product, firestoreId: docId });
  }
  return {
    trend,
    products: saved,
    timestamp: new Date().toISOString(),
    mcp: true // flag for MCP workflows
  };
}

// CLI usage for testing
if (require.main === module) {
  const trend = process.argv[2] || 'shoe';
  const userId = process.argv[3] || 'demo-user';
  mcpSearchProductsAndGenerateStory({ trend, userId }).then(result => {
    console.log(JSON.stringify(result, null, 2));
  });
}

module.exports = { mcpSearchProductsAndGenerateStory };
