import admin from "firebase-admin";
import fs from 'fs';

// Try to connect to appy project with current credentials
async function checkAppyProject() {
  try {
    // Force appy project
    process.env.GOOGLE_CLOUD_PROJECT = 'appy-32f2xp';
    process.env.FIREBASE_PROJECT_ID = 'appy-32f2xp';

    const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));

    // Initialize with appy project ID
    const app = admin.initializeApp({
      projectId: 'appy-32f2xp',
      credential: admin.credential.cert(serviceAccount)
    }, 'appy-test');
    
    const db = admin.firestore(app);
    console.log('✅ Connected to appy-32f2xp project');
    
    // List collections
    const collections = await db.listCollections();
    console.log('\n=== COLLECTIONS IN APPY PROJECT ===');
    collections.forEach(collection => {
      console.log(`- ${collection.id}`);
    });
    
    // Check for products
    if (collections.find(c => c.id === 'products')) {
      const productsSnapshot = await db.collection('products').limit(3).get();
      console.log(`\nProducts in appy: ${productsSnapshot.size}`);
      
      productsSnapshot.forEach(doc => {
        console.log(`\nProduct ${doc.id}:`, JSON.stringify(doc.data(), null, 2));
      });
    }
    
  } catch (error) {
    console.error('Error connecting to appy project:', error.message);
    console.log('\n❌ Need to generate service account key for appy project');
    console.log('Go to: https://console.firebase.google.com/project/appy-32f2xp/settings/serviceaccounts/adminsdk');
  }
}

checkAppyProject();