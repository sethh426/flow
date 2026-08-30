import express from 'express';
import cors from 'cors';
import { runScraper } from './scrape.js';
import { getDb } from './firebase.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'development' 
    ? ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'] 
    : process.env.CLIENT_URL
}));
app.use(express.json());
app.use(express.static('public')); // Serve static files from 'public' directory

// Simple health check endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Scraper API is running.',
    endpoints: ['POST /api/run-scraper', 'GET /api/products/pending', 'POST /api/products/:id/approve', 'POST /api/products/:id/reject']
  });
});

/**
 * API Endpoint to trigger the scraper.
 * Accepts a POST request with an optional 'scrapeLimit' in the body.
 * e.g., POST /api/run-scraper
 * Body: { "scrapeLimit": 5 }
 */
app.post('/api/run-scraper', async (req, res) => {
  console.log('Received request to run scraper...');
  // Get scrapeLimit from request body, default to 3 if not provided
  const scrapeLimit = req.body?.scrapeLimit || 3;

  try {
    // We don't `await` this, so the API can respond immediately.
    // The scraper will run in the background, preventing request timeouts.
    runScraper(scrapeLimit).catch(err => {
      console.error('Background scraper run failed:', err);
    });

    res.status(202).json({
      message: `Scraping process started in the background for up to ${scrapeLimit} items per category.`,
    });
  } catch (error) {
    console.error('Failed to start scraper:', error);
    res.status(500).json({
      message: 'Failed to start the scraping process.',
      error: error.message,
    });
  }
});

// Get all products (for dashboard)
app.get('/api/products', async (req, res) => {
  try {
    const db = getDb();
    const snapshot = await db.collection('products')
      .orderBy('timestamp', 'desc')
      .limit(20)
      .get();
    
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get stats for dashboard
app.get('/api/stats', async (req, res) => {
  try {
    const db = getDb();
    const doc = await db.collection('stats').doc('current').get();
    
    if (!doc.exists) {
      res.status(404).json({ error: 'Stats not found' });
      return;
    }
    
    res.json(doc.data());
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get categories with counts for dashboard
app.get('/api/categories', async (req, res) => {
  try {
    const db = getDb();
    const statsDoc = await db.collection('stats').doc('current').get();
    const stats = statsDoc.data();
    
    const categoryData = Object.entries(stats.categoryBreakdown).map(([name, count]) => ({
      name,
      count,
      source: name.toLowerCase().includes('trending') ? 'trending' : 'new'
    }));
    
    res.json(categoryData);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

/**
 * API Endpoint to get all products with 'pending' status.
 */
app.get('/api/products/pending', async (req, res) => {
  try {
    const db = await getDb();
    const productsRef = db.collection('products');
    const limit = parseInt(req.query.limit, 10) || 10;
    const lastVisibleTimestamp = req.query.lastVisible;

    let query = productsRef
      .where('status', '==', 'pending')
      .orderBy('timestamp', 'desc')
      .limit(limit);

    if (lastVisibleTimestamp) {
      query = query.startAfter(lastVisibleTimestamp);
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      return res.json({ products: [], lastVisible: null });
    }

    const pendingProducts = [];
    snapshot.forEach(doc => pendingProducts.push({ id: doc.id, ...doc.data() }));

    const lastVisible = snapshot.docs[snapshot.docs.length - 1].data().timestamp;
    res.json({ products: pendingProducts, lastVisible });
  } catch (error) {
    console.error('Failed to fetch pending products:', error);
    res.status(500).json({ message: 'Failed to fetch pending products.', error: error.message });
  }
});

/**
 * API Endpoint to approve a product.
 */
app.post('/api/products/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const productRef = db.collection('products').doc(id);
    await productRef.update({ status: 'approved', approved: true });
    res.json({ message: `Product ${id} approved successfully.` });
  } catch (error) {
    console.error(`Failed to approve product ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to approve product.', error: error.message });
  }
});

/**
 * API Endpoint to reject a product.
 */
app.post('/api/products/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const productRef = db.collection('products').doc(id);
    await productRef.update({ status: 'rejected', approved: false });
    res.json({ message: `Product ${id} rejected successfully.` });
  } catch (error) {
    console.error(`Failed to reject product ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to reject product.', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
