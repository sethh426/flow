const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function seedDemoData() {
  console.log('🌱 Seeding demo data...');

  // Seed Products
  const products = [
    {
      name: 'Wireless Noise-Cancelling Headphones',
      price: 299.99,
      category: 'Electronics',
      commission: 12.5,
      merchant: 'Best Buy',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      status: 'active',
      clicks: 1245,
      conversions: 87,
      revenue: 2609.91,
      createdAt: admin.firestore.Timestamp.now()
    },
    {
      name: 'Organic Cotton T-Shirt',
      price: 29.99,
      category: 'Fashion',
      commission: 15,
      merchant: 'Nordstrom',
      imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      status: 'active',
      clicks: 2156,
      conversions: 234,
      revenue: 1049.77,
      createdAt: admin.firestore.Timestamp.now()
    },
    {
      name: 'Smart Fitness Watch',
      price: 399.99,
      category: 'Electronics',
      commission: 10,
      merchant: 'Amazon',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
      status: 'active',
      clicks: 3421,
      conversions: 156,
      revenue: 6239.84,
      createdAt: admin.firestore.Timestamp.now()
    },
    {
      name: 'Leather Crossbody Bag',
      price: 189.99,
      category: 'Fashion',
      commission: 20,
      merchant: 'Nordstrom',
      imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400',
      status: 'active',
      clicks: 891,
      conversions: 67,
      revenue: 2547.87,
      createdAt: admin.firestore.Timestamp.now()
    },
    {
      name: 'Home Coffee Maker',
      price: 149.99,
      category: 'Home & Kitchen',
      commission: 8,
      merchant: 'Target',
      imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400',
      status: 'active',
      clicks: 1567,
      conversions: 123,
      revenue: 1475.88,
      createdAt: admin.firestore.Timestamp.now()
    }
  ];

  for (const product of products) {
    await db.collection('products').add(product);
  }
  console.log('✅ Added 5 products');

  // Seed Campaigns
  const campaigns = [
    {
      name: 'Summer Fashion Collection',
      type: 'Social Media',
      status: 'active',
      budget: 5000,
      spent: 3245.50,
      impressions: 125000,
      clicks: 4567,
      conversions: 234,
      revenue: 15678.90,
      startDate: admin.firestore.Timestamp.now(),
      createdAt: admin.firestore.Timestamp.now()
    },
    {
      name: 'Tech Gadgets Fall Promo',
      type: 'Email',
      status: 'active',
      budget: 3000,
      spent: 1890.25,
      impressions: 85000,
      clicks: 3421,
      conversions: 187,
      revenue: 12456.78,
      startDate: admin.firestore.Timestamp.now(),
      createdAt: admin.firestore.Timestamp.now()
    },
    {
      name: 'Holiday Gift Guide',
      type: 'Blog',
      status: 'draft',
      budget: 4000,
      spent: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0,
      createdAt: admin.firestore.Timestamp.now()
    }
  ];

  for (const campaign of campaigns) {
    await db.collection('campaigns').add(campaign);
  }
  console.log('✅ Added 3 campaigns');

  // Seed Categories
  const categories = [
    { name: 'Electronics', count: 2, revenue: 8849.75 },
    { name: 'Fashion', count: 2, revenue: 3597.64 },
    { name: 'Home & Kitchen', count: 1, revenue: 1475.88 }
  ];

  for (const category of categories) {
    await db.collection('categories').add(category);
  }
  console.log('✅ Added 3 categories');

  // Add overall stats
  await db.collection('stats').doc('overall').set({
    totalProducts: 5,
    totalRevenue: 13923.27,
    totalClicks: 9280,
    totalConversions: 667,
    avgConversionRate: 7.19,
    lastUpdated: admin.firestore.Timestamp.now()
  });
  console.log('✅ Added stats');

  console.log('🎉 Demo data seeded successfully!');
  process.exit(0);
}

seedDemoData().catch(err => {
  console.error('Error seeding data:', err);
  process.exit(1);
});
