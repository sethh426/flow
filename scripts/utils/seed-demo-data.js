import { getDb } from './firebase.js';
import { categories } from './categories.js';

// Demo product data generator
const generateDemoProducts = () => {
  const products = [];
  const brands = ['Nike', 'Adidas', 'Puma', 'New Balance', 'Under Armour'];
  const colors = ['Black', 'White', 'Blue', 'Red', 'Grey'];
  const sizes = ['S', 'M', 'L', 'XL'];
  const priceRanges = [
    { min: 29.99, max: 59.99 },
    { min: 79.99, max: 129.99 },
    { min: 149.99, max: 249.99 }
  ];

  categories.forEach(category => {
    // Generate 5-10 products per category
    const numProducts = Math.floor(Math.random() * 6) + 5;
    
    for (let i = 0; i < numProducts; i++) {
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = sizes[Math.floor(Math.random() * sizes.length)];
      const priceRange = priceRanges[Math.floor(Math.random() * priceRanges.length)];
      const price = (Math.random() * (priceRange.max - priceRange.min) + priceRange.min).toFixed(2);
      
      const product = {
        brandId: 'nordstrom',
        name: `${brand} ${category.label.replace(/^(New |Trending )?/i, '')} - ${color}`,
        description: `${brand} ${category.label.replace(/^(New |Trending )?/i, '')} in ${color}, Size ${size}`,
        price: `$${price}`,
        imageURL: `https://via.placeholder.com/300x400.png?text=${encodeURIComponent(brand)}`,
        affiliateURL: `https://www.nordstrom.com/demo/${Math.random().toString(36).substring(7)}`,
        itemNumber: Math.random().toString().substring(2, 10),
        category: category.label,
        source: category.source,
        timestamp: new Date().toISOString(),
        approved: Math.random() > 0.3, // 70% approved
        status: Math.random() > 0.3 ? 'mapped' : 'pending'
      };
      
      products.push(product);
    }
  });
  
  return products;
};

const seedDemoData = async () => {
  const db = getDb();
  const products = generateDemoProducts();
  
  console.log('🌱 Starting demo data seeding...');
  
  try {
    // Clear existing data
    const productsRef = db.collection('products');
    const snapshot = await productsRef.get();
    const deletePromises = [];
    snapshot.forEach(doc => {
      deletePromises.push(doc.ref.delete());
    });
    await Promise.all(deletePromises);
    console.log('✨ Cleared existing product data');
    
    // Add new demo products
    const addPromises = products.map(product => 
      db.collection('products').add(product)
    );
    await Promise.all(addPromises);
    
    console.log(`✅ Successfully seeded ${products.length} demo products`);
    
    // Calculate stats
    const totalProducts = products.length;
    const mappedProducts = products.filter(p => p.status === 'mapped').length;
    const pendingProducts = products.filter(p => p.status === 'pending').length;
    
    // Calculate category breakdown
    const categoryBreakdown = {};
    products.forEach(product => {
      const category = product.category;
      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
    });
    
    // Save stats
    const stats = {
      totalProducts,
      mappedProducts,
      pendingProducts,
      categoryBreakdown,
      lastUpdateTime: new Date().toISOString()
    };
    
    await db.collection('stats').doc('current').set(stats);
    console.log('📊 Successfully created stats document');
    
    // Save categories
    const categoryDocs = categories.map(cat => ({
      name: cat.label,
      count: categoryBreakdown[cat.label] || 0,
      source: cat.source,
      timestamp: new Date().toISOString()
    }));
    
    const categoryPromises = categoryDocs.map(cat => 
      db.collection('categories').add(cat)
    );
    await Promise.all(categoryPromises);
    console.log('📁 Successfully created category documents');
    
    console.log('\n✅ DEMO DATA SEEDING COMPLETE!');
    console.log(`   - ${totalProducts} products created`);
    console.log(`   - ${mappedProducts} mapped, ${pendingProducts} pending`);
    console.log(`   - ${Object.keys(categoryBreakdown).length} categories`);
    
  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
  }
};

// Run the seeding
seedDemoData()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });