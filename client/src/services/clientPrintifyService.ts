/**
 * Client-side Printify Service Wrapper
 * Integrates Printify API with Affiliate Flow platform
 */

import PrintifyService from './printifyService';
import { PRINTIFY_CONFIG } from '@/config/printify';

// Initialize Printify service with configuration
const printifyService = new PrintifyService({
  apiToken: PRINTIFY_CONFIG.apiToken,
  shopId: PRINTIFY_CONFIG.shopId,
  baseUrl: PRINTIFY_CONFIG.baseUrl,
});

// Mock data for demo mode
const MOCK_BLUEPRINTS = [
  {
    id: 5,
    title: 'Unisex Heavy Cotton Tee',
    description: 'Classic fit, double-needle sleeve and bottom hem',
    brand: 'Gildan',
    model: '5000',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'],
  },
  {
    id: 6,
    title: 'Unisex Hoodie',
    description: 'Air-jet spun yarn, quarter-turned to eliminate center crease',
    brand: 'Gildan',
    model: '18500',
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400'],
  },
  {
    id: 77,
    title: 'White Glossy Mug',
    description: 'Ceramic 11oz mug with glossy finish',
    brand: 'Generic',
    model: 'MUG-11',
    images: ['https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400'],
  },
  {
    id: 145,
    title: 'Unisex Sweatshirt',
    description: 'Classic fit with ribbed cuffs and hem',
    brand: 'Gildan',
    model: '18000',
    images: ['https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=400'],
  },
  {
    id: 201,
    title: 'Phone Case',
    description: 'Slim flexible rubber case for iPhone',
    brand: 'Generic',
    model: 'CASE-IP',
    images: ['https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400'],
  },
  {
    id: 301,
    title: 'Canvas Print',
    description: '16x20 inch gallery wrapped canvas',
    brand: 'Generic',
    model: 'CANVAS-16x20',
    images: ['https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=400'],
  },
  {
    id: 401,
    title: 'Tote Bag',
    description: 'Cotton canvas tote with interior pocket',
    brand: 'Generic',
    model: 'TOTE-STD',
    images: ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400'],
  },
  {
    id: 501,
    title: 'Throw Pillow',
    description: '16x16 inch pillow with zipper cover',
    brand: 'Generic',
    model: 'PILLOW-16',
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400'],
  },
];

const MOCK_PROVIDERS = [
  {
    id: 99,
    title: 'Printify Express (USA)',
    location: {
      address1: '123 Main St',
      city: 'Los Angeles',
      country: 'USA',
      region: 'CA',
      zip: '90001',
    },
  },
  {
    id: 100,
    title: 'SwiftPrint Global',
    location: {
      address1: '456 Industrial Blvd',
      city: 'New York',
      country: 'USA',
      region: 'NY',
      zip: '10001',
    },
  },
];

const MOCK_VARIANTS = [
  {
    id: 17390,
    title: 'Black / S',
    options: { Color: 'Black', Size: 'S' },
    placeholders: [{ position: 'front', height: 3000, width: 3000 }],
  },
  {
    id: 17391,
    title: 'Black / M',
    options: { Color: 'Black', Size: 'M' },
    placeholders: [{ position: 'front', height: 3000, width: 3000 }],
  },
  {
    id: 17392,
    title: 'Black / L',
    options: { Color: 'Black', Size: 'L' },
    placeholders: [{ position: 'front', height: 3000, width: 3000 }],
  },
  {
    id: 17393,
    title: 'Black / XL',
    options: { Color: 'Black', Size: 'XL' },
    placeholders: [{ position: 'front', height: 3000, width: 3000 }],
  },
  {
    id: 17394,
    title: 'White / S',
    options: { Color: 'White', Size: 'S' },
    placeholders: [{ position: 'front', height: 3000, width: 3000 }],
  },
  {
    id: 17395,
    title: 'White / M',
    options: { Color: 'White', Size: 'M' },
    placeholders: [{ position: 'front', height: 3000, width: 3000 }],
  },
  {
    id: 17396,
    title: 'White / L',
    options: { Color: 'White', Size: 'L' },
    placeholders: [{ position: 'front', height: 3000, width: 3000 }],
  },
  {
    id: 17397,
    title: 'White / XL',
    options: { Color: 'White', Size: 'XL' },
    placeholders: [{ position: 'front', height: 3000, width: 3000 }],
  },
];

// Demo mode flag - set to true to use mock data
const USE_DEMO_MODE = true;

/**
 * Get Printify catalog for product selection
 */
export async function getPrintifyCatalog() {
  try {
    console.log('📡 Fetching Printify blueprints...');
    console.log('🎭 Demo Mode:', USE_DEMO_MODE);
    console.log('🔑 API Token available:', !!PRINTIFY_CONFIG.apiToken);
    console.log('🏪 Shop ID:', PRINTIFY_CONFIG.shopId);
    
    let blueprints;
    
    if (USE_DEMO_MODE) {
      // Use mock data for demo
      console.log('🎭 Using DEMO MODE with mock blueprints');
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      blueprints = MOCK_BLUEPRINTS;
    } else {
      // Use real Printify API
      blueprints = await printifyService.getBlueprints();
    }
    
    console.log('📦 Received blueprints:', blueprints.length);
    
    // Group by category for easier browsing
    const catalog = {
      apparel: blueprints.filter(b => 
        b.title.toLowerCase().includes('shirt') ||
        b.title.toLowerCase().includes('hoodie') ||
        b.title.toLowerCase().includes('sweatshirt')
      ),
      accessories: blueprints.filter(b =>
        b.title.toLowerCase().includes('mug') ||
        b.title.toLowerCase().includes('bag') ||
        b.title.toLowerCase().includes('hat') ||
        b.title.toLowerCase().includes('phone')
      ),
      home: blueprints.filter(b =>
        b.title.toLowerCase().includes('poster') ||
        b.title.toLowerCase().includes('canvas') ||
        b.title.toLowerCase().includes('pillow') ||
        b.title.toLowerCase().includes('blanket')
      ),
      all: blueprints,
    };

    return catalog;
  } catch (error) {
    console.error('Failed to fetch Printify catalog:', error);
    throw error;
  }
}

/**
 * Get details for a specific product blueprint
 */
export async function getBlueprintDetails(blueprintId: number) {
  try {
    if (USE_DEMO_MODE) {
      console.log('🎭 DEMO: Getting blueprint details for', blueprintId);
      await new Promise(resolve => setTimeout(resolve, 300));
      const blueprint = MOCK_BLUEPRINTS.find(b => b.id === blueprintId) || MOCK_BLUEPRINTS[0];
      return { 
        blueprint, 
        providers: MOCK_PROVIDERS 
      };
    }
    
    const [blueprint, providers] = await Promise.all([
      printifyService.getBlueprint(blueprintId),
      printifyService.getPrintProviders(blueprintId),
    ]);

    return { blueprint, providers };
  } catch (error) {
    console.error(`Failed to fetch blueprint ${blueprintId}:`, error);
    throw error;
  }
}

/**
 * Get variants (sizes, colors) for a specific blueprint and provider
 */
export async function getProductVariants(blueprintId: number, printProviderId: number) {
  try {
    if (USE_DEMO_MODE) {
      console.log('🎭 DEMO: Getting variants for blueprint', blueprintId, 'provider', printProviderId);
      await new Promise(resolve => setTimeout(resolve, 300));
      return MOCK_VARIANTS;
    }
    
    return await printifyService.getVariants(blueprintId, printProviderId);
  } catch (error) {
    console.error(`Failed to fetch variants for ${blueprintId}/${printProviderId}:`, error);
    throw error;
  }
}

/**
 * Upload design image to Printify
 */
export async function uploadDesignImage(file: File) {
  try {
    if (USE_DEMO_MODE) {
      console.log('🎭 DEMO: Uploading image', file.name);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate upload
      return {
        id: `demo_${Date.now()}`,
        file_name: file.name,
        height: 3000,
        width: 3000,
        size: file.size,
        mime_type: file.type,
        preview_url: URL.createObjectURL(file),
        upload_time: new Date().toISOString(),
      };
    }
    
    // Convert file to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:image/...;base64, prefix
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    return await printifyService.uploadImage({
      file_name: file.name,
      contents: base64,
    });
  } catch (error) {
    console.error('Failed to upload image:', error);
    throw error;
  }
}

/**
 * Create a new product on Printify
 */
export async function createPrintifyProduct(params: {
  title: string;
  description: string;
  blueprintId: number;
  printProviderId: number;
  designImageId: string;
  variants: Array<{
    variantId: number;
    price: number; // in dollars
  }>;
  tags?: string[];
}) {
  try {
    if (USE_DEMO_MODE) {
      console.log('🎭 DEMO: Creating product', params.title);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate creation
      return {
        id: `demo_product_${Date.now()}`,
        title: params.title,
        description: params.description,
        created_at: new Date().toISOString(),
        tags: params.tags || [],
      };
    }
    
    // Convert prices to cents
    const variantsInCents = params.variants.map(v => ({
      variantId: v.variantId,
      price: Math.round(v.price * 100),
    }));

    const product = await printifyService.createProduct({
      productName: params.title,
      description: params.description,
      blueprintId: params.blueprintId,
      printProviderId: params.printProviderId,
      designImageId: params.designImageId,
      variants: variantsInCents,
      tags: params.tags,
    });

    return product;
  } catch (error) {
    console.error('Failed to create product:', error);
    throw error;
  }
}

/**
 * Get all products from Printify shop
 */
export async function getPrintifyProducts() {
  try {
    return await printifyService.getProducts();
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw error;
  }
}

/**
 * Publish product to connected sales channel
 */
export async function publishProduct(productId: string) {
  try {
    return await printifyService.publishProduct(productId);
  } catch (error) {
    console.error(`Failed to publish product ${productId}:`, error);
    throw error;
  }
}

/**
 * Delete a product from Printify
 */
export async function deleteProduct(productId: string) {
  try {
    await printifyService.deleteProduct(productId);
  } catch (error) {
    console.error(`Failed to delete product ${productId}:`, error);
    throw error;
  }
}

/**
 * Generate mockups for a product
 */
export async function generateMockups(productId: string) {
  try {
    return await printifyService.getMockups(productId);
  } catch (error) {
    console.error(`Failed to generate mockups for ${productId}:`, error);
    throw error;
  }
}

export default printifyService;
