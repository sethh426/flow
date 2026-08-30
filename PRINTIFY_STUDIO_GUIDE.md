# Printify Product Studio - Integration Guide

## 🎨 Overview

The **Printify Product Studio** is a comprehensive Print-on-Demand (POD) solution integrated into AffiliateFlow that automates the entire process of creating, customizing, and publishing products to Printify and social media platforms.

## ✨ Features

### 1. **AI Design Generator**
- Generate custom product designs using Gemini AI
- Multiple style options: Realistic, Artistic, Minimalist, Modern
- Direct integration with existing image generation service
- Auto-optimization for print areas

### 2. **Product Template Browser**
- Browse 100+ Printify product blueprints (t-shirts, mugs, posters, hoodies, etc.)
- View available variants (colors, sizes, materials)
- Get print provider information
- Calculate shipping costs

### 3. **Brand Asset Manager**
- Store and organize brand logos
- Manage color palettes
- Save font preferences
- Quick-apply brand presets

### 4. **Live Product Mockups**
- Generate realistic product mockups
- Preview designs on actual products
- Configure pricing and variants
- Add product tags

### 5. **Automated Publishing**
- One-click publishing to Instagram, Facebook, Pinterest
- AI-generated product descriptions and captions
- Optimized hashtags for each platform
- Website embed code generation

## 🚀 Getting Started

### Prerequisites

1. **Printify Account**
   - Sign up at [printify.com](https://printify.com)
   - Create at least one shop (API or connected to e-commerce platform)

2. **API Token**
   - Go to Printify → Account → Connections
   - Generate a Personal Access Token
   - Required scopes:
     - `shops.read` - Access shops
     - `catalog.read` - Browse product catalog
     - `products.read` & `products.write` - Create/manage products
     - `uploads.read` & `uploads.write` - Upload images

### Setup

1. Navigate to **Dashboard → AI Studio → Printify Studio**

2. Enter your Printify API Token when prompted

3. The system will automatically:
   - Connect to your Printify account
   - Load available shops
   - Fetch product catalog
   - Initialize the studio

## 📋 Workflow Guide

### Complete Product Creation Flow

#### Step 1: Create Design
1. Describe your design idea in natural language
2. Select a style (realistic, artistic, minimalist, modern)
3. Add product name and description
4. Click "Generate Design with AI"
5. Review generated designs

#### Step 2: Select Product Template
1. Browse product categories
2. Click on a product template (e.g., "Premium T-Shirt")
3. View available variants and print providers
4. Select "Use This Template"

#### Step 3: Configure Product
1. Review product variants (colors, sizes)
2. Set pricing (cost + your margin)
3. Add product tags
4. Customize branding elements

#### Step 4: Preview Mockup
1. View design on selected product
2. Adjust placement and sizing
3. Review product details
4. Confirm pricing

#### Step 5: Publish
1. Select publishing platforms:
   - Instagram
   - Facebook
   - Pinterest
   - Website
2. AI generates platform-specific content
3. Click "Publish to All Platforms"

## 🔧 Technical Implementation

### Service Architecture

```
client/src/services/printifyService.ts
├── Authentication (API Token)
├── Shop Management
├── Catalog Browsing
│   ├── Blueprints (Product Types)
│   ├── Print Providers
│   ├── Variants (Colors, Sizes)
│   └── Shipping Info
├── Image Management
│   ├── Upload by URL
│   ├── Upload by Base64
│   └── Image Library
└── Product Operations
    ├── Create Product
    ├── Update Product
    ├── Delete Product
    └── Publish Product
```

### API Integration

**Base URL:** `https://api.printify.com/v1`

**Rate Limits:**
- Global: 600 requests/minute
- Catalog: 100 requests/minute
- Publishing: 200 requests/30 minutes

**Authentication:**
```typescript
headers: {
  'Authorization': `Bearer ${apiToken}`,
  'Content-Type': 'application/json',
  'User-Agent': 'AffiliateFlow/1.0'
}
```

### Key API Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `GET /shops.json` | Get all shops |
| `GET /catalog/blueprints.json` | Browse product catalog |
| `GET /catalog/blueprints/{id}/print_providers.json` | Get print providers |
| `GET /catalog/blueprints/{id}/print_providers/{pid}/variants.json` | Get variants |
| `POST /uploads/images.json` | Upload design image |
| `POST /shops/{sid}/products.json` | Create product |
| `POST /shops/{sid}/products/{pid}/publish.json` | Publish product |

## 💡 Usage Examples

### Example 1: Create a T-Shirt with AI Design

```typescript
// 1. Generate design
const design = await generateProductImage(
  'Mountain Sunset T-Shirt',
  'Minimalist mountain landscape at sunset',
  'minimalist'
);

// 2. Upload to Printify
const service = getPrintifyService();
const uploadedImage = await service.uploadImageByUrl(
  design.images[0].url,
  'mountain-sunset.png'
);

// 3. Create product
const product = await service.createProduct({
  productName: 'Mountain Sunset T-Shirt',
  description: 'Beautiful minimalist design perfect for outdoor enthusiasts',
  blueprintId: 5, // T-shirt blueprint
  printProviderId: 99, // Monster Digital
  designImageId: uploadedImage.id,
  variants: [
    { variantId: 45740, price: 2499 }, // Black / M - $24.99
    { variantId: 45742, price: 2499 }, // White / M - $24.99
  ],
  tags: ['t-shirt', 'nature', 'minimalist'],
});

// 4. Publish
await service.publishProduct(product.id);
```

### Example 2: Browse and Select Products

```typescript
const service = getPrintifyService();

// Get popular categories
const categories = await service.getPopularCategories();
// Returns: T-Shirts, Mugs, Posters, Hoodies, Phone Cases, Bags

// Search for specific products
const mugs = await service.searchBlueprints('mug');
// Returns all mug blueprints

// Get variants for a specific product
const variants = await service.getVariants(77, 12); // Blueprint 77, Provider 12
// Returns all color/size combinations
```

### Example 3: Calculate Optimal Pricing

```typescript
const service = getPrintifyService();

// Get pricing suggestions (40% margin)
const pricing = await service.calculatePricing(
  5,   // T-shirt blueprint
  99,  // Monster Digital provider
  40   // 40% profit margin
);

// Returns:
// [
//   { variantId: 45740, cost: 1000, suggestedPrice: 1400 }, // $10 → $14
//   { variantId: 45742, cost: 1000, suggestedPrice: 1400 },
//   ...
// ]
```

## 🎯 Automation Workflows

### Workflow 1: Product Creation to Social Media

```
1. User describes product idea
   ↓
2. AI generates design image
   ↓
3. Image uploaded to Printify
   ↓
4. Product created with variants
   ↓
5. Mockups generated
   ↓
6. AI writes descriptions + hashtags
   ↓
7. Published to social platforms
   ↓
8. Analytics tracked
```

### Workflow 2: Trend to Product

```
1. Trend Finder identifies popular niche
   ↓
2. AI generates relevant design
   ↓
3. Multiple product variations created
   ↓
4. A/B testing setup
   ↓
5. Best performers promoted
   ↓
6. Revenue tracked in Analytics
```

## 📊 Data Flow

```
┌─────────────────────────────────────┐
│  Printify Studio UI Component       │
│  (PrintifyStudio.tsx)                │
└───────────┬─────────────────────────┘
            │
            ├─────────────────────────┐
            │                         │
            ▼                         ▼
┌─────────────────────┐   ┌──────────────────────┐
│  Printify Service    │   │  Image Generator     │
│  (printifyService.ts)│   │  (imageGenerator.ts) │
└──────────┬───────────┘   └──────────┬───────────┘
           │                          │
           ▼                          ▼
┌─────────────────────┐   ┌──────────────────────┐
│  Printify API        │   │  Gemini AI (Imagen3) │
│  api.printify.com    │   │  Image Generation    │
└──────────────────────┘   └──────────────────────┘
```

## 🔐 Security

### API Token Storage
- Tokens stored in `localStorage` on client
- Never committed to repository
- Use environment variables for server-side operations
- Rotate tokens regularly

### Best Practices
1. **Never expose tokens in client code**
2. **Use server-side proxy for sensitive operations**
3. **Implement rate limiting**
4. **Validate all user inputs**
5. **Handle errors gracefully**

## 📈 Future Enhancements

### Planned Features

1. **Template Marketplace**
   - Pre-made design templates
   - Community-submitted designs
   - One-click product creation

2. **Bulk Operations**
   - Create multiple products at once
   - Batch pricing updates
   - Mass publishing

3. **Advanced Analytics**
   - Product performance tracking
   - Sales forecasting
   - Inventory optimization

4. **Integration Extensions**
   - Shopify sync
   - Etsy integration
   - Amazon Merch
   - Redbubble connector

5. **AI Enhancements**
   - Style transfer
   - Design variations
   - Trend prediction
   - Seasonal recommendations

## 🐛 Troubleshooting

### Common Issues

**Issue: "Failed to initialize Printify service"**
- Verify API token is correct
- Check token scopes include required permissions
- Ensure shop exists in Printify account

**Issue: "Image upload failed"**
- Check image size (recommended < 5MB)
- Use URL upload for larger files
- Verify image format (PNG, JPG, JPEG supported)

**Issue: "Product creation failed"**
- Verify blueprint and print provider IDs
- Check variant IDs are valid
- Ensure design meets DPI requirements

**Issue: "Rate limit exceeded"**
- Wait 1 minute and retry
- Implement request queuing
- Consider caching catalog data

## 📚 Resources

- [Printify API Documentation](https://developers.printify.com/)
- [Printify Help Center](https://help.printify.com/)
- [Image Generation Best Practices](./IMAGE_GENERATION_GUIDE.md)
- [POD Business Guide](./POD_BUSINESS_GUIDE.md)

## 🤝 Support

For issues or questions:
1. Check this documentation
2. Review error messages in browser console
3. Check Printify API status
4. Contact support@affiliateflow.com

---

**Last Updated:** 2024
**Version:** 1.0.0
**Status:** Production Ready ✅
