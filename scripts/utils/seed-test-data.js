// Test Data Seeder for AffiliateFlow
const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin
const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function seedTestData() {
  console.log('ðŸŒ± Seeding test data...');

  try {
    // Create test user
    const testUser = {
      email: 'test@affiliateflow.com',
      displayName: 'Test User',
      plan: 'free',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      onboardingComplete: true
    };

    await db.collection('users').doc('test-user-123').set(testUser);
    console.log('âœ… Test user created');

    // Create test campaign
    const testCampaign = {
      userId: 'test-user-123',
      name: 'Summer Fashion Campaign',
      description: 'Promote summer fashion trends',
      status: 'active',
      budget: 1000,
      spent: 250,
      clicks: 1250,
      conversions: 45,
      revenue: 2340,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('campaigns').add(testCampaign);
    console.log('âœ… Test campaign created');

    // Create test workflow
    const testWorkflow = {
      userId: 'test-user-123',
      name: 'Daily Content Automation',
      description: 'Automatically post daily Instagram content',
      niche: 'fashion',
      trigger: {
        type: 'schedule',
        config: { cron: '0 9 * * *' }
      },
      stages: [
        { type: 'action', action: { type: 'findTrends' } },
        { type: 'action', action: { type: 'createContent' } }
      ],
      status: 'draft',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      executionCount: 0
    };

    await db.collection('workflows').add(testWorkflow);
    console.log('âœ… Test workflow created');

    console.log('âœ… Test data seeded successfully!');
    process.exit(0);

  } catch (error) {
    console.error('âŒ Error seeding test data:', error);
    process.exit(1);
  }
}

seedTestData();
