import { getDb } from '../firebase.js';
import { categories } from '../categories.js';

const demoProducts = [
  {
    brandId: 'nordstrom',
    name: "Men's Nike Air Max 270 Sneaker",
    description: 'Popular athletic sneaker with Air Max cushioning',
    price: '$150.00',
    imageURL: 'https://n.nordstrommedia.com/id/sr3/88edff6f-8429-42c6-b33a-283fb0716787.jpeg',
    affiliateURL: 'https://www.nordstrom.com/s/nike-air-max-270-sneaker-men/5093859',
    itemNumber: '5093859',
    category: "New Men's Sneakers",
    source: 'new',
    timestamp: new Date().toISOString(),
    approved: true,
    status: 'mapped'
  },
  {
    brandId: 'nordstrom',
    name: "MARC JACOBS The Tote Bag",
    description: 'Classic canvas tote with designer logo',
    price: '$195.00',
    imageURL: 'https://n.nordstrommedia.com/id/sr3/b13ac0d0-6f85-4e92-a290-3b00f4b5032e.jpeg',
    affiliateURL: 'https://www.nordstrom.com/s/marc-jacobs-the-tote-bag/5531355',
    itemNumber: '5531355',
    category: "Trending Women's Handbags",
    source: 'trending',
    timestamp: new Date().toISOString(),
    approved: true,
    status: 'mapped'
  },
  {
    brandId: 'nordstrom',
    name: "Vince Camuto Welland Boot",
    description: 'Stylish leather boot with side zipper',
    price: '$169.00',
    imageURL: 'https://n.nordstrommedia.com/id/sr3/2f5c8c8f-4401-4230-8364-c003e4ad0c1c.jpeg',
    affiliateURL: 'https://www.nordstrom.com/s/vince-camuto-welland-boot-women/5876234',
    itemNumber: '5876234',
    category: "New Women's Shoes",
    source: 'new',
    timestamp: new Date().toISOString(),
    approved: false,
    status: 'pending'
  }
];

const demoStats = {
  totalProducts: 156,
  mappedProducts: 134,
  pendingProducts: 22,
  categoryBreakdown: {
    "New Men's Sneakers": 28,
    "Trending Women's Handbags": 35,
    "New Women's Shoes": 45,
    "Trending Men's Jackets": 18,
    "New Men's Pants": 30
  },
  lastUpdateTime: new Date().toISOString()
};

async function seedDemoData() {
  const db = getDb();
  
  try {
    console.log('🌱 Starting demo data seeding...');

    // Clear existing data
    const collections = ['products', 'stats'];
    for (const collection of collections) {
      const snapshot = await db.collection(collection).get();
      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log(`✔️ Cleared ${collection} collection`);
    }

    // Add demo products
    for (const product of demoProducts) {
      await db.collection('products').add(product);
    }
    console.log('✔️ Added demo products');

    // Add stats
    await db.collection('stats').doc('current').set(demoStats);
    console.log('✔️ Added demo stats');

    console.log('✅ Demo data seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    process.exit(1);
  }
}

seedDemoData();