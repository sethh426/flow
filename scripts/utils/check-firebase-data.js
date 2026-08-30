import { getDb } from './firebase.js';

async function checkFirebaseData() {
  const db = getDb();
  
  try {
    // Check products collection
    console.log('\n=== PRODUCTS COLLECTION ===');
    const productsSnapshot = await db.collection('products').limit(5).get();
    console.log(`Total products: ${productsSnapshot.size}`);
    
    productsSnapshot.forEach(doc => {
      console.log('\nProduct:', doc.id);
      console.log(JSON.stringify(doc.data(), null, 2));
    });
    
    // Check all collections
    console.log('\n=== ALL COLLECTIONS ===');
    const collections = await db.listCollections();
    collections.forEach(collection => {
      console.log(`- ${collection.id}`);
    });
    
    // Check if there are other collections with data
    for (const collection of collections) {
      if (collection.id !== 'products') {
        const snapshot = await collection.limit(1).get();
        console.log(`\n${collection.id} collection has ${snapshot.size} documents`);
        if (!snapshot.empty) {
          console.log('Sample document:');
          snapshot.forEach(doc => {
            console.log(JSON.stringify(doc.data(), null, 2));
          });
        }
      }
    }
    
  } catch (error) {
    console.error('Error checking Firebase data:', error);
  }
}

checkFirebaseData();