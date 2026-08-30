/**
 * Firestore Database Setup
 * Creates initial collections and sample data for FREE tier
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialize Firebase Admin (uses serviceAccountKey.json)
const serviceAccount = JSON.parse(
  readFileSync('./serviceAccountKey.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function setupFirestore() {
  console.log('\n🔥 Setting up Firestore Database');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    // 1. Create users collection structure
    console.log('👤 Creating users collection...');
    const usersRef = db.collection('users');
    const sampleUser = {
      uid: 'demo-user-123',
      email: 'demo@affiliateflow.com',
      displayName: 'Demo User',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      plan: 'free',
      settings: {
        emailNotifications: true,
        aiAssistant: true,
        theme: 'light'
      },
      stats: {
        totalCampaigns: 0,
        totalClicks: 0,
        totalEarnings: 0
      }
    };
    await usersRef.doc('demo-user-123').set(sampleUser);
    console.log('   ✅ Users collection created with demo user');

    // 2. Create campaigns collection
    console.log('\n📊 Creating campaigns collection...');
    const campaignsRef = db.collection('campaigns');
    const sampleCampaign = {
      userId: 'demo-user-123',
      name: 'Summer Fashion Trends 2025',
      description: 'Affiliate campaign for summer fashion products',
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      category: 'fashion',
      affiliateNetwork: 'nordstrom',
      products: [],
      analytics: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        revenue: 0
      },
      settings: {
        autoContent: true,
        aiOptimization: true,
        scheduleEnabled: false
      }
    };
    const campaignDoc = await campaignsRef.add(sampleCampaign);
    console.log(`   ✅ Campaigns collection created (ID: ${campaignDoc.id})`);

    // 3. Create content collection
    console.log('\n📝 Creating content collection...');
    const contentRef = db.collection('content');
    const sampleContent = {
      campaignId: campaignDoc.id,
      userId: 'demo-user-123',
      type: 'blog_post',
      title: 'Top Summer Fashion Trends to Watch',
      content: 'Discover the hottest summer fashion trends...',
      status: 'published',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      publishedAt: admin.firestore.FieldValue.serverTimestamp(),
      aiGenerated: true,
      products: [],
      seo: {
        metaTitle: 'Summer Fashion Trends 2025',
        metaDescription: 'Explore top summer fashion trends',
        keywords: ['summer fashion', 'trends', '2025']
      },
      analytics: {
        views: 0,
        shares: 0,
        conversions: 0
      }
    };
    const contentDoc = await contentRef.add(sampleContent);
    console.log(`   ✅ Content collection created (ID: ${contentDoc.id})`);

    // 4. Create analytics collection
    console.log('\n📈 Creating analytics collection...');
    const analyticsRef = db.collection('analytics');
    const sampleAnalytics = {
      userId: 'demo-user-123',
      campaignId: campaignDoc.id,
      date: admin.firestore.FieldValue.serverTimestamp(),
      metrics: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        revenue: 0,
        ctr: 0,
        conversionRate: 0
      },
      sources: {
        organic: 0,
        social: 0,
        direct: 0,
        referral: 0
      }
    };
    await analyticsRef.add(sampleAnalytics);
    console.log('   ✅ Analytics collection created');

    // 5. Create products collection
    console.log('\n🛍️  Creating products collection...');
    const productsRef = db.collection('products');
    const sampleProduct = {
      userId: 'demo-user-123',
      campaignId: campaignDoc.id,
      source: 'nordstrom',
      productId: 'demo-product-123',
      name: 'Summer Dress Collection',
      description: 'Elegant summer dresses for all occasions',
      price: 89.99,
      currency: 'USD',
      imageUrl: 'https://example.com/image.jpg',
      affiliateUrl: 'https://example.com/affiliate',
      category: 'clothing',
      addedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'active',
      performance: {
        clicks: 0,
        conversions: 0,
        revenue: 0
      }
    };
    await productsRef.add(sampleProduct);
    console.log('   ✅ Products collection created');

    // 6. Create AI tasks queue collection
    console.log('\n🤖 Creating AI tasks collection...');
    const aiTasksRef = db.collection('aiTasks');
    const sampleTask = {
      userId: 'demo-user-123',
      type: 'content_generation',
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      input: {
        prompt: 'Generate blog post about summer fashion',
        campaignId: campaignDoc.id
      },
      output: null,
      error: null
    };
    await aiTasksRef.add(sampleTask);
    console.log('   ✅ AI tasks collection created');

    console.log('\n✅ Firestore setup complete!');
    console.log('\nCollections created:');
    console.log('   • users - User profiles and settings');
    console.log('   • campaigns - Affiliate campaigns');
    console.log('   • content - Generated content pieces');
    console.log('   • analytics - Performance metrics');
    console.log('   • products - Affiliate products');
    console.log('   • aiTasks - AI generation queue');

    console.log('\n📊 Sample data added for testing');
    console.log('   Demo user: demo@affiliateflow.com');
    console.log('   Campaign: Summer Fashion Trends 2025');

    console.log('\n🔐 Next steps:');
    console.log('   1. Deploy firestore.rules for security');
    console.log('   2. Deploy firestore.indexes.json for queries');
    console.log('   3. Set up Firebase Auth');
    console.log('   4. Test with dashboard UI\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up Firestore:', error);
    process.exit(1);
  }
}

setupFirestore();
