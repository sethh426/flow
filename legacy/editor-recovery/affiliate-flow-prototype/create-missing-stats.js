import { getDb } from './firebase.js';

async function checkAllData() {
  const db = getDb();
  
  try {
    // Get all products (not just 5)
    console.log('\n=== ALL PRODUCTS ===');
    const allProductsSnapshot = await db.collection('products').get();
    console.log(`Total products in Firebase: ${allProductsSnapshot.size}`);
    
    // Check for stats collection
    console.log('\n=== STATS COLLECTION ===');
    const statsSnapshot = await db.collection('stats').get();
    console.log(`Stats documents: ${statsSnapshot.size}`);
    
    if (!statsSnapshot.empty) {
      statsSnapshot.forEach(doc => {
        console.log(`Stats doc ${doc.id}:`, JSON.stringify(doc.data(), null, 2));
      });
    } else {
      console.log('No stats found - need to create stats');
      
      // Create stats based on current products
      const products = allProductsSnapshot.docs.map(doc => doc.data());
      const mappedProducts = products.filter(p => p.status === 'mapped').length;
      const pendingProducts = products.filter(p => p.status === 'pending').length;
      
      // Count categories
      const categoryBreakdown = {};
      products.forEach(product => {
        categoryBreakdown[product.category] = (categoryBreakdown[product.category] || 0) + 1;
      });
      
      const stats = {
        totalProducts: products.length,
        mappedProducts,
        pendingProducts,
        categoryBreakdown,
        lastUpdateTime: new Date().toISOString()
      };
      
      await db.collection('stats').doc('current').set(stats);
      console.log('Created stats:', JSON.stringify(stats, null, 2));
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAllData();