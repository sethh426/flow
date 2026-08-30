// apiSuggestProduct.js
// Express API endpoint for trend/product suggestion and content generation

const express = require('express');
const bodyParser = require('body-parser');
const { suggestAndPrepareProduct } = require('./trendsProductSuggestAndContent');

const app = express();
app.use(bodyParser.json());

// POST /api/suggest-product { query: "user's idea" }
app.post('/api/suggest-product', async (req, res) => {
  try {
    const userQuery = req.body.query;
    if (!userQuery) return res.status(400).json({ error: 'Missing query' });
    const trendsApiKey = process.env.GOOGLE_TRENDS_API_KEY || "";
    const results = await suggestAndPrepareProduct(userQuery, trendsApiKey);
    res.json({ bestTrend: results[0]?.trend || userQuery, products: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
