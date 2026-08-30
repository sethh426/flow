const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Firestore database reference
const db = admin.firestore();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'YOUR_API_KEY');

/**
 * Scheduled function - runs daily to scrape new products
 * Configure in Firebase Console: Extensions > Cloud Scheduler
 */
exports.scheduledProductScraper = functions.pubsub
  .schedule('0 0 * * *') // Every day at midnight
  .timeZone('America/New_York')
  .onRun(async (context) => {
    console.log('Running scheduled product scraper...');
    
    try {
      // Import and run your scraper
      const { runScraper } = require('../scrape.js');
      await runScraper(5); // Scrape 5 products per category
      
      console.log('Scheduled scraping completed');
      return null;
    } catch (error) {
      console.error('Scheduled scraping failed:', error);
      throw error;
    }
  });

/**
 * Gemini AI - Generate product descriptions
 */
exports.generateProductDescription = functions.https.onCall(async (data, context) => {
  const { productId } = data;
  
  try {
    // Get product
    const productDoc = await db.collection('products').doc(productId).get();
    const product = productDoc.data();
    
    // Generate description with Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Create an engaging, SEO-friendly product description for: ${product.name} in the ${product.category} category. Price: ${product.price}. Make it compelling for affiliate marketing.`;
    
    const result = await model.generateContent(prompt);
    const description = result.response.text();
    
    // Update product with AI-generated description
    await db.collection('products').doc(productId).update({
      aiDescription: description,
      descriptionGeneratedAt: new Date().toISOString()
    });
    
    return { success: true, description };
  } catch (error) {
    console.error('Error generating description:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Gemini AI - Analyze trending topics
 */
exports.analyzeTrends = functions.https.onCall(async (data, context) => {
  try {
    // Get recent products
    const snapshot = await db.collection('products')
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();
    
    const products = snapshot.docs.map(doc => doc.data());
    const categories = products.map(p => p.category);
    
    // Analyze with Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Analyze these fashion categories and identify emerging trends: ${categories.join(', ')}. Provide 3-5 key trend insights.`;
    
    const result = await model.generateContent(prompt);
    const trends = result.response.text();
    
    // Save trends to Firestore
    await db.collection('trends').add({
      analysis: trends,
      generatedAt: new Date().toISOString(),
      productCount: products.length
    });
    
    return { success: true, trends };
  } catch (error) {
    console.error('Error analyzing trends:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Pub/Sub - Event-driven product approval workflow
 */
exports.onProductApproved = functions.firestore
  .document('products/{productId}')
  .onUpdate(async (change, context) => {
    const newValue = change.after.data();
    const previousValue = change.before.data();
    
    // Check if product was just approved
    if (newValue.status === 'approved' && previousValue.status !== 'approved') {
      console.log(`Product ${context.params.productId} was approved`);
      
      // Trigger downstream events
      // 1. Update stats
      await updateStats();
      
      // 2. Generate AI description if not exists
      if (!newValue.aiDescription) {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const prompt = `Create a compelling affiliate marketing description for: ${newValue.name}`;
        const result = await model.generateContent(prompt);
        
        await change.after.ref.update({
          aiDescription: result.response.text()
        });
      }
      
      // 3. Publish to Pub/Sub for external integrations
      const pubsub = new admin.pubsub.PubSub();
      await pubsub.topic('product-approved').publishMessage({
        data: Buffer.from(JSON.stringify({
          productId: context.params.productId,
          product: newValue
        }))
      });
    }
    
    return null;
  });

/**
 * Analytics endpoint - Get detailed metrics
 */
exports.getAnalytics = functions.https.onRequest(async (req, res) => {
  try {
    const snapshot = await db.collection('products').get();
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const analytics = {
      total: products.length,
      byStatus: {
        pending: products.filter(p => p.status === 'pending').length,
        approved: products.filter(p => p.status === 'approved').length,
        rejected: products.filter(p => p.status === 'rejected').length,
      },
      byCategory: {},
      bySource: {},
      recentActivity: products.slice(0, 10)
    };
    
    // Count by category
    products.forEach(p => {
      analytics.byCategory[p.category] = (analytics.byCategory[p.category] || 0) + 1;
      analytics.bySource[p.source] = (analytics.bySource[p.source] || 0) + 1;
    });
    
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Webhook endpoint - Receive external product data
 */
exports.webhookProductImport = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }
  
  const { apiKey, products } = req.body;
  
  // Validate API key (store in environment variables)
  if (apiKey !== process.env.WEBHOOK_API_KEY) {
    return res.status(401).send('Unauthorized');
  }
  
  try {
    const batch = db.batch();
    
    products.forEach(product => {
      const docRef = db.collection('products').doc();
      batch.set(docRef, {
        ...product,
        status: 'pending',
        approved: false,
        timestamp: new Date().toISOString(),
        source: 'webhook'
      });
    });
    
    await batch.commit();
    
    res.json({ success: true, imported: products.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function
async function updateStats() {
  const snapshot = await db.collection('products').get();
  const products = snapshot.docs.map(doc => doc.data());
  
  const stats = {
    totalProducts: products.length,
    mappedProducts: products.filter(p => p.status === 'approved').length,
    pendingProducts: products.filter(p => p.status === 'pending').length,
    categoryBreakdown: {},
    lastUpdateTime: new Date().toISOString()
  };
  
  products.forEach(p => {
    stats.categoryBreakdown[p.category] = (stats.categoryBreakdown[p.category] || 0) + 1;
  });
  
  await db.collection('stats').doc('current').set(stats);
}
