/**
 * Printify API Service
 * Comprehensive integration with Printify for Print-on-Demand automation
 * 
 * Features:
 * - Shop management
 * - Catalog browsing (blueprints, print providers, variants)
 * - Product creation and management
 * - Image upload and management
 * - Mockup generation
 * - Publishing and order management
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface PrintifyConfig {
  apiToken: string;
  shopId?: string;
  baseUrl?: string;
}

export interface PrintifyShop {
  id: number;
  title: string;
  sales_channel: string;
}

export interface PrintifyBlueprint {
  id: number;
  title: string;
  description: string;
  brand: string;
  model: string;
  images: string[];
}

export interface PrintifyPrintProvider {
  id: number;
  title: string;
  location: {
    address1: string;
    city: string;
    country: string;
    region: string;
    zip: string;
  };
}

export interface PrintifyVariant {
  id: number;
  title: string;
  options: Record<string, string>; // e.g., { color: "Black", size: "XL" }
  placeholders: Array<{
    position: string; // "front", "back", "sleeve", etc.
    height: number;
    width: number;
  }>;
  price?: number;
  is_enabled?: boolean;
}

export interface PrintifyImage {
  id: string;
  file_name: string;
  height: number;
  width: number;
  size: number;
  mime_type: string;
  preview_url: string;
  upload_time: string;
}

export interface PrintifyProduct {
  id?: string;
  title: string;
  description: string;
  blueprint_id: number;
  print_provider_id: number;
  variants: Array<{
    id: number;
    price: number;
    is_enabled: boolean;
  }>;
  print_areas: Array<{
    variant_ids: number[];
    placeholders: Array<{
      position: string;
      images: Array<{
        id: string;
        x: number; // 0.0 to 1.0 (center = 0.5)
        y: number; // 0.0 to 1.0 (center = 0.5)
        scale: number; // 1.0 = fill print area
        angle: number; // 0-360 degrees
      }>;
    }>;
  }>;
  images?: Array<{
    src: string;
    variant_ids?: number[];
    position?: string;
    is_default?: boolean;
  }>;
  tags?: string[];
}

export interface PrintifyMockup {
  src: string;
  variant_ids: number[];
  position: string;
  is_default: boolean;
}

export interface CreateProductRequest {
  productName: string;
  description: string;
  blueprintId: number;
  printProviderId: number;
  designImageId: string;
  variants: Array<{
    variantId: number;
    price: number; // in cents
  }>;
  tags?: string[];
}

// ============================================================================
// PRINTIFY SERVICE CLASS
// ============================================================================

class PrintifyService {
  private apiToken: string;
  private shopId?: string;
  private baseUrl: string;
  private readonly RATE_LIMIT_DELAY = 100; // 100ms between requests (safe for 600/min limit)

  constructor(config: PrintifyConfig) {
    this.apiToken = config.apiToken;
    this.shopId = config.shopId;
    this.baseUrl = config.baseUrl || 'https://api.printify.com/v1';
  }

  /**
   * Make authenticated request to Printify API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, this.RATE_LIMIT_DELAY));

    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json',
      'User-Agent': 'AffiliateFlow/1.0',
      ...options.headers,
    };

    console.log(`🌐 Printify API Request: ${endpoint}`);
    console.log(`🔗 URL: ${url}`);
    console.log(`🔑 Has Token: ${!!this.apiToken}`);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log(`📊 Response Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error('❌ API Error Response:', error);
        throw new Error(
          error.message || `Printify API Error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log(`✅ API Success:`, data);
      return data;
    } catch (error) {
      console.error(`❌ Printify API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // ========================================================================
  // SHOP MANAGEMENT
  // ========================================================================

  /**
   * Get all shops for the authenticated account
   */
  async getShops(): Promise<PrintifyShop[]> {
    const response = await this.request<PrintifyShop[]>('/shops.json');
    return response;
  }

  /**
   * Set the active shop ID
   */
  setShop(shopId: string) {
    this.shopId = shopId;
  }

  // ========================================================================
  // CATALOG BROWSING
  // ========================================================================

  /**
   * Get all available product blueprints (e.g., t-shirts, mugs, posters)
   */
  async getBlueprints(): Promise<PrintifyBlueprint[]> {
    return await this.request<PrintifyBlueprint[]>('/catalog/blueprints.json');
  }

  /**
   * Get a specific blueprint by ID
   */
  async getBlueprint(blueprintId: number): Promise<PrintifyBlueprint> {
    return await this.request<PrintifyBlueprint>(
      `/catalog/blueprints/${blueprintId}.json`
    );
  }

  /**
   * Get all print providers for a specific blueprint
   */
  async getPrintProviders(blueprintId: number): Promise<PrintifyPrintProvider[]> {
    return await this.request<PrintifyPrintProvider[]>(
      `/catalog/blueprints/${blueprintId}/print_providers.json`
    );
  }

  /**
   * Get all variants for a blueprint from a specific print provider
   */
  async getVariants(
    blueprintId: number,
    printProviderId: number
  ): Promise<PrintifyVariant[]> {
    return await this.request<PrintifyVariant[]>(
      `/catalog/blueprints/${blueprintId}/print_providers/${printProviderId}/variants.json`
    );
  }

  /**
   * Get shipping information for a blueprint/provider combination
   */
  async getShipping(blueprintId: number, printProviderId: number) {
    return await this.request(
      `/catalog/blueprints/${blueprintId}/print_providers/${printProviderId}/shipping.json`
    );
  }

  // ========================================================================
  // IMAGE MANAGEMENT
  // ========================================================================

  /**
   * Upload an image by URL
   */
  async uploadImageByUrl(imageUrl: string, fileName: string): Promise<PrintifyImage> {
    return await this.request<PrintifyImage>('/uploads/images.json', {
      method: 'POST',
      body: JSON.stringify({
        file_name: fileName,
        url: imageUrl,
      }),
    });
  }

  /**
   * Upload an image by base64 content (max 5MB recommended)
   */
  async uploadImageByBase64(
    fileName: string,
    base64Content: string
  ): Promise<PrintifyImage> {
    return await this.request<PrintifyImage>('/uploads/images.json', {
      method: 'POST',
      body: JSON.stringify({
        file_name: fileName,
        contents: base64Content,
      }),
    });
  }

  /**
   * Get all uploaded images
   */
  async getUploadedImages(page = 1, limit = 10): Promise<PrintifyImage[]> {
    return await this.request<PrintifyImage[]>(
      `/uploads.json?page=${page}&limit=${limit}`
    );
  }

  /**
   * Get a specific uploaded image by ID
   */
  async getUploadedImage(imageId: string): Promise<PrintifyImage> {
    return await this.request<PrintifyImage>(`/uploads/${imageId}.json`);
  }

  /**
   * Archive an uploaded image
   */
  async archiveImage(imageId: string): Promise<void> {
    await this.request(`/uploads/${imageId}/archive.json`, {
      method: 'POST',
    });
  }

  /**
   * Upload image - convenience method that handles both base64 and URL uploads
   */
  async uploadImage(options: {
    file_name: string;
    contents?: string;
    url?: string;
  }): Promise<PrintifyImage> {
    if (options.contents) {
      return await this.uploadImageByBase64(options.file_name, options.contents);
    } else if (options.url) {
      return await this.uploadImageByUrl(options.url, options.file_name);
    } else {
      throw new Error('Either contents or url must be provided');
    }
  }

  // ========================================================================
  // PRODUCT MANAGEMENT
  // ========================================================================

  /**
   * Create a new product
   */
  async createProduct(request: CreateProductRequest): Promise<PrintifyProduct> {
    if (!this.shopId) {
      throw new Error('Shop ID is required. Call setShop() first.');
    }

    // Get variant details to build print areas
    const variants = await this.getVariants(
      request.blueprintId,
      request.printProviderId
    );

    // Build print areas for all variants
    const printAreas = [{
      variant_ids: request.variants.map(v => v.variantId),
      placeholders: variants
        .find(v => request.variants.some(rv => rv.variantId === v.id))
        ?.placeholders.map(placeholder => ({
          position: placeholder.position,
          images: [{
            id: request.designImageId,
            x: 0.5, // Center horizontally
            y: 0.5, // Center vertically
            scale: 1.0, // Fill the print area
            angle: 0,
          }],
        })) || [],
    }];

    const productData: PrintifyProduct = {
      title: request.productName,
      description: request.description,
      blueprint_id: request.blueprintId,
      print_provider_id: request.printProviderId,
      variants: request.variants.map(v => ({
        id: v.variantId,
        price: v.price,
        is_enabled: true,
      })),
      print_areas: printAreas,
      tags: request.tags || [],
    };

    return await this.request<PrintifyProduct>(
      `/shops/${this.shopId}/products.json`,
      {
        method: 'POST',
        body: JSON.stringify(productData),
      }
    );
  }

  /**
   * Get all products in the shop
   */
  async getProducts(page = 1, limit = 10): Promise<PrintifyProduct[]> {
    if (!this.shopId) {
      throw new Error('Shop ID is required. Call setShop() first.');
    }

    return await this.request<PrintifyProduct[]>(
      `/shops/${this.shopId}/products.json?page=${page}&limit=${limit}`
    );
  }

  /**
   * Get a specific product by ID
   */
  async getProduct(productId: string): Promise<PrintifyProduct> {
    if (!this.shopId) {
      throw new Error('Shop ID is required. Call setShop() first.');
    }

    return await this.request<PrintifyProduct>(
      `/shops/${this.shopId}/products/${productId}.json`
    );
  }

  /**
   * Update an existing product
   */
  async updateProduct(
    productId: string,
    updates: Partial<PrintifyProduct>
  ): Promise<PrintifyProduct> {
    if (!this.shopId) {
      throw new Error('Shop ID is required. Call setShop() first.');
    }

    return await this.request<PrintifyProduct>(
      `/shops/${this.shopId}/products/${productId}.json`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      }
    );
  }

  /**
   * Delete a product
   */
  async deleteProduct(productId: string): Promise<void> {
    if (!this.shopId) {
      throw new Error('Shop ID is required. Call setShop() first.');
    }

    await this.request(`/shops/${this.shopId}/products/${productId}.json`, {
      method: 'DELETE',
    });
  }

  /**
   * Publish a product (triggers webhook if configured)
   */
  async publishProduct(
    productId: string,
    options = {
      title: true,
      description: true,
      images: true,
      variants: true,
      tags: true,
    }
  ): Promise<void> {
    if (!this.shopId) {
      throw new Error('Shop ID is required. Call setShop() first.');
    }

    await this.request(
      `/shops/${this.shopId}/products/${productId}/publish.json`,
      {
        method: 'POST',
        body: JSON.stringify(options),
      }
    );
  }

  /**
   * Get mockup images for a product
   * Returns array of mockup URLs for different variants
   */
  async getMockups(productId: string): Promise<PrintifyMockup[]> {
    if (!this.shopId) {
      throw new Error('Shop ID is required. Call setShop() first.');
    }

    const product = await this.getProduct(productId);
    
    // Extract mockups from product images
    if (product.images && product.images.length > 0) {
      return product.images.map((img, index) => ({
        src: img.src,
        variant_ids: img.variant_ids || [],
        position: img.position || 'front',
        is_default: index === 0
      }));
    }

    return [];
  }

  // ========================================================================
  // HELPER METHODS
  // ========================================================================

  /**
   * Search blueprints by category (t-shirt, mug, poster, etc.)
   */
  async searchBlueprints(searchTerm: string): Promise<PrintifyBlueprint[]> {
    const allBlueprints = await this.getBlueprints();
    const term = searchTerm.toLowerCase();
    
    return allBlueprints.filter(
      bp =>
        bp.title.toLowerCase().includes(term) ||
        bp.description?.toLowerCase().includes(term) ||
        bp.brand.toLowerCase().includes(term)
    );
  }

  /**
   * Get popular blueprint categories
   */
  async getPopularCategories() {
    const blueprints = await this.getBlueprints();
    
    // Group by common categories
    const categories = {
      'T-Shirts': blueprints.filter(bp => 
        bp.title.toLowerCase().includes('shirt') || 
        bp.title.toLowerCase().includes('tee')
      ),
      'Mugs': blueprints.filter(bp => bp.title.toLowerCase().includes('mug')),
      'Posters': blueprints.filter(bp => 
        bp.title.toLowerCase().includes('poster') || 
        bp.title.toLowerCase().includes('print')
      ),
      'Hoodies': blueprints.filter(bp => bp.title.toLowerCase().includes('hoodie')),
      'Phone Cases': blueprints.filter(bp => bp.title.toLowerCase().includes('case')),
      'Bags': blueprints.filter(bp => 
        bp.title.toLowerCase().includes('bag') || 
        bp.title.toLowerCase().includes('tote')
      ),
    };

    return Object.entries(categories)
      .map(([name, items]) => ({
        name,
        count: items.length,
        blueprints: items.slice(0, 5), // Top 5 per category
      }))
      .filter(cat => cat.count > 0);
  }

  /**
   * Calculate optimal pricing based on cost + margin
   */
  async calculatePricing(
    blueprintId: number,
    printProviderId: number,
    marginPercentage = 40
  ): Promise<Array<{ variantId: number; cost: number; suggestedPrice: number }>> {
    const variants = await this.getVariants(blueprintId, printProviderId);
    
    // Note: Actual cost requires product creation or separate API call
    // This is a simplified version
    return variants.map(variant => ({
      variantId: variant.id,
      cost: 1000, // Placeholder - actual cost from API
      suggestedPrice: Math.round(1000 * (1 + marginPercentage / 100)),
    }));
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let printifyInstance: PrintifyService | null = null;

/**
 * Initialize Printify service with API token
 */
export function initializePrintify(config: PrintifyConfig): PrintifyService {
  printifyInstance = new PrintifyService(config);
  return printifyInstance;
}

/**
 * Get the initialized Printify service instance
 */
export function getPrintifyService(): PrintifyService {
  if (!printifyInstance) {
    throw new Error(
      'Printify service not initialized. Call initializePrintify() first.'
    );
  }
  return printifyInstance;
}

/**
 * Check if Printify is initialized
 */
export function isPrintifyInitialized(): boolean {
  return printifyInstance !== null;
}

export default PrintifyService;
