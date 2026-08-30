const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Create Express app
const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Simple health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'AffiliateFlow API is running.',
    endpoints: [
      'GET /products',
      'GET /stats',
      'GET /categories',
      'GET /products/pending',
      'POST /products/:id/approve',
      'POST /products/:id/reject'
    ]
  });
});

// Get stats for dashboard
app.get('/stats', async (req, res) => {
  try {
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
app.get('/categories', async (req, res) => {
  try {
    const statsDoc = await db.collection('stats').doc('current').get();
    const stats = statsDoc.data();
    
    if (!stats || !stats.categoryBreakdown) {
      res.json([]);
      return;
    }
    
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

// Get all products with 'pending' status
app.get('/products/pending', async (req, res) => {
  try {
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

// Approve a product
app.post('/products/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const productRef = db.collection('products').doc(id);
    await productRef.update({ status: 'approved', approved: true });
    res.json({ message: `Product ${id} approved successfully.` });
  } catch (error) {
    console.error(`Failed to approve product ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to approve product.', error: error.message });
  }
});

// Reject a product
app.post('/products/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const productRef = db.collection('products').doc(id);
    await productRef.update({ status: 'rejected', approved: false });
    res.json({ message: `Product ${id} rejected successfully.` });
  } catch (error) {
    console.error(`Failed to reject product ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to reject product.', error: error.message });
  }
});

// Export the Express app as a Cloud Function
exports.api = functions.https.onRequest(app);

// Import and export all automation functions (commented out until firebase-functions v2)
// const automations = require('./automations');
// exports.scheduledProductScraper = automations.scheduledProductScraper;
// exports.generateProductDescription = automations.generateProductDescription;
// exports.analyzeTrends = automations.analyzeTrends;
// exports.onProductApproved = automations.onProductApproved;
// exports.getAnalytics = automations.getAnalytics;
// exports.webhookProductImport = automations.webhookProductImport;
