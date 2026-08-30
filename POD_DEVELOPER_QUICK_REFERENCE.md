# POD Automation - Developer Quick Reference

## 🚀 Quick Setup (5 minutes)

```bash
# 1. Set environment variables
NEXT_PUBLIC_PRINTIFY_API_TOKEN=your_token
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket

# 2. Restart dev server
npm run dev

# 3. Navigate to Printify Studio
http://localhost:3000/dashboard (click "Printify Studio")
```

## 📁 File Structure

```
client/src/
├── services/
│   ├── printifyService.ts        # Printify API integration (677 lines)
│   ├── brandAssetService.ts      # Brand management (550 lines)
│   ├── publishingService.ts      # Multi-platform publishing (580 lines)
│   ├── podOrchestrator.ts        # End-to-end automation (450 lines)
│   └── imageGenerator.ts         # AI design generation (existing)
├── features/
│   └── printify-studio/
│       └── PrintifyStudio.tsx    # Main UI component (900+ lines)
└── lib/
    └── firebase.ts               # Firebase + Storage (updated)

Documentation/
├── PRINTIFY_STUDIO_GUIDE.md           # Product creation guide
├── AUTOMATED_PUBLISHING_GUIDE.md      # Publishing guide
├── POD_AUTOMATION_MASTER_GUIDE.md     # Complete guide
└── POD_IMPLEMENTATION_SUMMARY.md      # This implementation
```

## 🔧 Core API Methods

### Printify Service
```typescript
import { initializePrintify, getPrintifyService } from '@/services/printifyService';

// Initialize
initializePrintify({ apiToken: 'YOUR_TOKEN' });
const service = getPrintifyService();

// Common operations
await service.getBlueprints();
await service.uploadImageByUrl(url, fileName);
await service.createProduct(productData);
await service.publishProduct(productId);
```

### Brand Assets
```typescript
import { uploadLogo, getLogos, createColorPalette } from '@/services/brandAssetService';

// Upload logo
const logo = await uploadLogo(file, userId, 'Logo Name');

// Get assets
const logos = await getLogos(userId);
const palettes = await getColorPalettes(userId);
```

### Publishing
```typescript
import { generateMarketingContent, publishToMultiplePlatforms } from '@/services/publishingService';

// Generate content
const content = await generateMarketingContent(name, description, audience, tone);

// Publish
const results = await publishToMultiplePlatforms(product, content, targets, credentials);
```

### Orchestration
```typescript
import { createAutonomousProduct, createProductBatch } from '@/services/podOrchestrator';

// Single product
const result = await createAutonomousProduct(config);

// Batch
const results = await createProductBatch(config, 10);
```

## 🎨 UI Integration

### Using Printify Studio
```typescript
// PrintifyStudio is already integrated in dashboard
// Access via: Dashboard → AI Studio → Printify Studio

// To customize, edit:
client/src/features/printify-studio/PrintifyStudio.tsx
```

### Adding to Another Page
```typescript
import PrintifyStudio from '@/features/printify-studio/PrintifyStudio';

export default function MyPage() {
  return <PrintifyStudio />;
}
```

## 🔑 Environment Variables

```bash
# Required for basic functionality
NEXT_PUBLIC_PRINTIFY_API_TOKEN=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=

# Optional for publishing
INSTAGRAM_ACCESS_TOKEN=
FACEBOOK_PAGE_ID=
FACEBOOK_ACCESS_TOKEN=
PINTEREST_BOARD_ID=
PINTEREST_ACCESS_TOKEN=
SHOPIFY_SHOP_DOMAIN=
SHOPIFY_ACCESS_TOKEN=
ETSY_SHOP_ID=
ETSY_ACCESS_TOKEN=
GEMINI_API_KEY=
```

## 🐛 Common Issues & Fixes

### "Printify not initialized"
```typescript
// Always initialize before using
initializePrintify({ apiToken: process.env.NEXT_PUBLIC_PRINTIFY_API_TOKEN! });
```

### "Firebase Storage error"
```typescript
// Check firebase.ts has storage export
import { db, storage } from '@/lib/firebase';
```

### "Image upload failed"
```typescript
// Ensure file is under 10MB
if (file.size > 10 * 1024 * 1024) {
  console.error('File too large');
}
```

### "Rate limit exceeded"
```typescript
// Services have built-in rate limiting
// For custom code, add delays:
await delay(100); // 100ms between requests
```

## 📊 Type Definitions

### Key Interfaces
```typescript
// Printify
interface PrintifyProduct {
  id: string;
  title: string;
  description: string;
  // ... see printifyService.ts
}

// Brand Assets
interface BrandLogo {
  id: string;
  url: string;
  isPrimary: boolean;
  // ... see brandAssetService.ts
}

// Publishing
interface PublishingResult {
  platform: string;
  success: boolean;
  postId?: string;
  // ... see publishingService.ts
}

// Orchestration
interface OrchestrationResult {
  success: boolean;
  product?: PrintifyProduct;
  analytics?: PublishingAnalytics;
  // ... see podOrchestrator.ts
}
```

## 🧪 Testing

### Manual Testing
```typescript
// 1. Test Printify connection
const service = getPrintifyService();
const shops = await service.getShops();
console.log('Connected:', shops.length > 0);

// 2. Test image generation
const design = await generateProductImage('Test', 'A test design', 'modern');
console.log('Design created:', design.images[0]);

// 3. Test brand assets
const logos = await getLogos('test_user');
console.log('Logos:', logos.length);

// 4. Test publishing
const content = await generateMarketingContent('Test', 'Description', 'general', 'casual');
console.log('Content:', content.shortCaption);
```

### Automated Testing (Recommended)
```typescript
// Add to your test suite
describe('POD Services', () => {
  test('Printify initializes', () => {
    initializePrintify({ apiToken: TEST_TOKEN });
    expect(isPrintifyInitialized()).toBe(true);
  });

  test('Creates product', async () => {
    const result = await createAutonomousProduct(testConfig);
    expect(result.success).toBe(true);
  });
});
```

## 📈 Performance Tips

### Optimize Image Upload
```typescript
// Use URL upload for images >5MB (faster)
await service.uploadImageByUrl(url, fileName);

// Use base64 for small images
await service.uploadImageByBase64(base64Data, fileName);
```

### Batch Operations
```typescript
// Don't do this (slow)
for (const idea of ideas) {
  await createAutonomousProduct(config, idea);
}

// Do this (optimized)
const results = await createProductBatch(config, ideas.length);
```

### Cache Brand Assets
```typescript
// Load once, reuse
const [logos, palettes, fonts] = await Promise.all([
  getLogos(userId),
  getColorPalettes(userId),
  getFontConfigs(userId),
]);

// Store in state or context for reuse
```

## 🔄 Workflow Examples

### Simple Product Creation
```typescript
const config = {
  userId: 'user_123',
  printifyApiToken: process.env.NEXT_PUBLIC_PRINTIFY_API_TOKEN!,
  autoPublish: false,
  publishTargets: [],
  publishCredentials: {},
  brandPreferences: { designStyle: 'modern' },
  productSettings: { priceMarkup: 40 },
};

const result = await createAutonomousProduct(config);
console.log(`Product created: ${result.product?.id}`);
```

### Full Automation
```typescript
const config = {
  userId: 'user_123',
  printifyApiToken: process.env.NEXT_PUBLIC_PRINTIFY_API_TOKEN!,
  autoPublish: true,
  publishTargets: [
    { platform: 'instagram', enabled: true },
    { platform: 'facebook', enabled: true },
  ],
  publishCredentials: {
    instagram: { accessToken: process.env.INSTAGRAM_ACCESS_TOKEN },
    facebook: { accessToken: process.env.FACEBOOK_ACCESS_TOKEN, pageId: 'PAGE_ID' },
  },
  brandPreferences: {
    useBrandLogos: true,
    useColorPalette: true,
    designStyle: 'modern',
  },
  productSettings: { priceMarkup: 40 },
};

const results = await createProductBatch(config, 5);
console.log(`Created ${results.filter(r => r.success).length}/5 products`);
```

## 📚 Additional Resources

- **PRINTIFY_STUDIO_GUIDE.md** - Product creation workflows
- **AUTOMATED_PUBLISHING_GUIDE.md** - Platform integration
- **POD_AUTOMATION_MASTER_GUIDE.md** - Complete system guide
- **POD_IMPLEMENTATION_SUMMARY.md** - Implementation details

## 🆘 Getting Help

1. Check error messages in browser console
2. Review relevant documentation guide
3. Check service implementation comments
4. Search existing GitHub issues
5. Create new issue with error details

## 🎯 Quick Commands

```bash
# Start dev server
npm run dev

# Check for errors
npm run lint

# Build for production
npm run build

# Run tests (when available)
npm test
```

---

**Last Updated**: October 30, 2025  
**Quick Start Time**: 5 minutes  
**Full Setup Time**: 30 minutes with API keys
