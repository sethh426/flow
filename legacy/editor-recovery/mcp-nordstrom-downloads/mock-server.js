import express from 'express';
import cors from 'cors';
import { categories } from './categories.js';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002']
}));
app.use(express.json());

// Generate mock products
const generateMockProducts = () => {
  const products = [];
  categories.forEach((category) => {
    const count = Math.floor(Math.random() * 3) + 2; // 2-4 products per category
    for (let i = 0; i < count; i++) {
      products.push({
        id: `${category.label}-${i}`,
        name: `Demo ${category.label} Item ${i + 1}`,
        category: category.label,
        price: `$${(Math.random() * 100 + 50).toFixed(2)}`,
        status: Math.random() > 0.3 ? 'mapped' : 'pending',
        source: category.source,
        approved: Math.random() > 0.3,
        timestamp: new Date().toISOString()
      });
    }
  });
  return products;
};

const mockProducts = generateMockProducts();

// Get all products
app.get('/api/products', (req, res) => {
  res.json(mockProducts);
});

// Get stats
app.get('/api/stats', (req, res) => {
  const totalProducts = mockProducts.length;
  const mappedProducts = mockProducts.filter(p => p.status === 'mapped').length;
  const pendingProducts = mockProducts.filter(p => p.status === 'pending').length;
  
  const categoryBreakdown = mockProducts.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {});

  res.json({
    totalProducts,
    mappedProducts,
    pendingProducts,
    categoryBreakdown,
    lastUpdateTime: new Date().toISOString()
  });
});

// Get categories
app.get('/api/categories', (req, res) => {
  const categoryStats = mockProducts.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {});

  const categoryList = Object.entries(categoryStats).map(([name, count]) => ({
    name,
    count,
    source: categories.find(c => c.label === name)?.source || 'unknown'
  }));

  res.json(categoryList);
});

app.listen(PORT, () => {
  console.log(`🚀 Mock server is running on port ${PORT}`);
});