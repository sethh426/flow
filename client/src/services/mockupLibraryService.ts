/**
 * Mockup Library Service
 * 
 * Provides access to 50+ product mockup templates across multiple categories.
 * Each mockup includes realistic visualization options for product designs.
 */

export type ProductCategory = 
  | 'apparel'
  | 'accessories'
  | 'home-living'
  | 'drinkware'
  | 'office'
  | 'tech'
  | 'bags'
  | 'outdoor';

export type MockupStyle = 
  | 'flat-lay'
  | 'model-worn'
  | 'lifestyle'
  | 'isolated'
  | 'scene'
  | '3d-render';

export interface MockupTemplate {
  id: string;
  name: string;
  category: ProductCategory;
  subcategory: string;
  blueprintId?: number; // Printify blueprint ID if available
  styles: MockupStyle[];
  printAreas: string[]; // e.g., ['front', 'back', 'sleeve']
  variants: {
    colors: string[];
    sizes: string[];
  };
  dimensions: {
    width: number;
    height: number;
  };
  popularity: number; // 1-100
  tags: string[];
  mockupUrls: {
    style: MockupStyle;
    url: string;
    thumbnailUrl: string;
  }[];
}

/**
 * Comprehensive mockup library with 50+ product types
 */
export const MOCKUP_LIBRARY: MockupTemplate[] = [
  // APPAREL (18 items)
  {
    id: 'classic-tshirt',
    name: 'Classic T-Shirt',
    category: 'apparel',
    subcategory: 'shirts',
    blueprintId: 3,
    styles: ['flat-lay', 'model-worn', 'isolated'],
    printAreas: ['front', 'back'],
    variants: {
      colors: ['white', 'black', 'navy', 'gray', 'red', 'royal-blue'],
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 100,
    tags: ['bestseller', 'unisex', 'cotton'],
    mockupUrls: []
  },
  {
    id: 'premium-hoodie',
    name: 'Premium Hoodie',
    category: 'apparel',
    subcategory: 'outerwear',
    blueprintId: 146,
    styles: ['model-worn', 'lifestyle', 'isolated'],
    printAreas: ['front', 'back'],
    variants: {
      colors: ['black', 'gray', 'navy', 'white', 'forest-green'],
      sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 95,
    tags: ['popular', 'warm', 'winter'],
    mockupUrls: []
  },
  {
    id: 'zip-hoodie',
    name: 'Zip-Up Hoodie',
    category: 'apparel',
    subcategory: 'outerwear',
    styles: ['model-worn', 'isolated'],
    printAreas: ['front', 'back'],
    variants: {
      colors: ['black', 'gray', 'navy', 'charcoal'],
      sizes: ['S', 'M', 'L', 'XL', '2XL']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 85,
    tags: ['casual', 'comfortable'],
    mockupUrls: []
  },
  {
    id: 'tank-top',
    name: 'Tank Top',
    category: 'apparel',
    subcategory: 'shirts',
    styles: ['model-worn', 'flat-lay', 'isolated'],
    printAreas: ['front', 'back'],
    variants: {
      colors: ['white', 'black', 'gray', 'navy', 'red'],
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 75,
    tags: ['summer', 'fitness', 'casual'],
    mockupUrls: []
  },
  {
    id: 'long-sleeve',
    name: 'Long Sleeve Shirt',
    category: 'apparel',
    subcategory: 'shirts',
    styles: ['model-worn', 'flat-lay', 'isolated'],
    printAreas: ['front', 'back', 'left-sleeve', 'right-sleeve'],
    variants: {
      colors: ['white', 'black', 'gray', 'navy', 'burgundy'],
      sizes: ['S', 'M', 'L', 'XL', '2XL']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 80,
    tags: ['fall', 'winter', 'comfortable'],
    mockupUrls: []
  },
  {
    id: 'sweatshirt',
    name: 'Crewneck Sweatshirt',
    category: 'apparel',
    subcategory: 'outerwear',
    styles: ['model-worn', 'flat-lay', 'isolated'],
    printAreas: ['front', 'back'],
    variants: {
      colors: ['black', 'gray', 'navy', 'white', 'maroon'],
      sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 88,
    tags: ['cozy', 'casual', 'winter'],
    mockupUrls: []
  },
  {
    id: 'v-neck-tshirt',
    name: 'V-Neck T-Shirt',
    category: 'apparel',
    subcategory: 'shirts',
    styles: ['model-worn', 'flat-lay', 'isolated'],
    printAreas: ['front', 'back'],
    variants: {
      colors: ['white', 'black', 'gray', 'navy', 'heather-blue'],
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 70,
    tags: ['casual', 'fitted', 'stylish'],
    mockupUrls: []
  },
  {
    id: 'polo-shirt',
    name: 'Polo Shirt',
    category: 'apparel',
    subcategory: 'shirts',
    styles: ['model-worn', 'isolated'],
    printAreas: ['left-chest', 'back'],
    variants: {
      colors: ['white', 'black', 'navy', 'red', 'royal-blue'],
      sizes: ['S', 'M', 'L', 'XL', '2XL']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 65,
    tags: ['business-casual', 'professional', 'golf'],
    mockupUrls: []
  },
  {
    id: 'baseball-tee',
    name: 'Baseball Raglan Tee',
    category: 'apparel',
    subcategory: 'shirts',
    styles: ['model-worn', 'flat-lay'],
    printAreas: ['front', 'back'],
    variants: {
      colors: ['white-black', 'white-red', 'white-navy', 'gray-black'],
      sizes: ['S', 'M', 'L', 'XL', '2XL']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 68,
    tags: ['sports', 'casual', 'vintage'],
    mockupUrls: []
  },
  {
    id: 'youth-tshirt',
    name: 'Youth T-Shirt',
    category: 'apparel',
    subcategory: 'shirts',
    styles: ['model-worn', 'flat-lay', 'isolated'],
    printAreas: ['front', 'back'],
    variants: {
      colors: ['white', 'black', 'navy', 'red', 'pink', 'light-blue'],
      sizes: ['YXS', 'YS', 'YM', 'YL', 'YXL']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 72,
    tags: ['kids', 'youth', 'school'],
    mockupUrls: []
  },
  {
    id: 'baby-onesie',
    name: 'Baby Onesie',
    category: 'apparel',
    subcategory: 'baby',
    styles: ['flat-lay', 'isolated'],
    printAreas: ['front'],
    variants: {
      colors: ['white', 'pink', 'blue', 'gray', 'yellow'],
      sizes: ['NB', '3M', '6M', '12M', '18M', '24M']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 78,
    tags: ['baby', 'infant', 'gift'],
    mockupUrls: []
  },
  {
    id: 'toddler-tshirt',
    name: 'Toddler T-Shirt',
    category: 'apparel',
    subcategory: 'kids',
    styles: ['model-worn', 'flat-lay'],
    printAreas: ['front', 'back'],
    variants: {
      colors: ['white', 'black', 'pink', 'blue', 'red', 'yellow'],
      sizes: ['2T', '3T', '4T', '5/6T']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 74,
    tags: ['toddler', 'kids', 'cute'],
    mockupUrls: []
  },
  {
    id: 'womens-vneck',
    name: "Women's V-Neck",
    category: 'apparel',
    subcategory: 'womens',
    styles: ['model-worn', 'flat-lay'],
    printAreas: ['front', 'back'],
    variants: {
      colors: ['white', 'black', 'pink', 'purple', 'turquoise'],
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 82,
    tags: ['womens', 'fitted', 'fashionable'],
    mockupUrls: []
  },
  {
    id: 'racerback-tank',
    name: 'Racerback Tank',
    category: 'apparel',
    subcategory: 'womens',
    styles: ['model-worn', 'flat-lay'],
    printAreas: ['front', 'back'],
    variants: {
      colors: ['white', 'black', 'pink', 'gray', 'mint'],
      sizes: ['XS', 'S', 'M', 'L', 'XL']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 76,
    tags: ['womens', 'fitness', 'athletic'],
    mockupUrls: []
  },
  {
    id: 'crop-top',
    name: 'Crop Top',
    category: 'apparel',
    subcategory: 'womens',
    styles: ['model-worn', 'isolated'],
    printAreas: ['front', 'back'],
    variants: {
      colors: ['white', 'black', 'pink', 'gray'],
      sizes: ['XS', 'S', 'M', 'L', 'XL']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 71,
    tags: ['womens', 'trendy', 'summer'],
    mockupUrls: []
  },
  {
    id: 'leggings',
    name: 'Leggings',
    category: 'apparel',
    subcategory: 'womens',
    styles: ['model-worn', 'isolated'],
    printAreas: ['all-over', 'side-panel'],
    variants: {
      colors: ['black', 'gray', 'navy', 'pattern-base'],
      sizes: ['XS', 'S', 'M', 'L', 'XL']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 84,
    tags: ['womens', 'fitness', 'yoga', 'athletic'],
    mockupUrls: []
  },
  {
    id: 'sports-bra',
    name: 'Sports Bra',
    category: 'apparel',
    subcategory: 'womens',
    styles: ['model-worn', 'isolated'],
    printAreas: ['front'],
    variants: {
      colors: ['black', 'white', 'pink', 'purple', 'teal'],
      sizes: ['XS', 'S', 'M', 'L', 'XL']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 79,
    tags: ['womens', 'fitness', 'athletic', 'active'],
    mockupUrls: []
  },
  {
    id: 'yoga-pants',
    name: 'Yoga Pants',
    category: 'apparel',
    subcategory: 'womens',
    styles: ['model-worn'],
    printAreas: ['side-panel', 'waistband'],
    variants: {
      colors: ['black', 'gray', 'navy', 'burgundy'],
      sizes: ['XS', 'S', 'M', 'L', 'XL']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 81,
    tags: ['womens', 'yoga', 'fitness', 'comfort'],
    mockupUrls: []
  },

  // ACCESSORIES (8 items)
  {
    id: 'baseball-cap',
    name: 'Baseball Cap',
    category: 'accessories',
    subcategory: 'hats',
    styles: ['isolated', 'model-worn', 'lifestyle'],
    printAreas: ['front', 'back', 'side'],
    variants: {
      colors: ['black', 'white', 'navy', 'red', 'gray', 'khaki'],
      sizes: ['One Size']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 89,
    tags: ['hat', 'casual', 'outdoor', 'sports'],
    mockupUrls: []
  },
  {
    id: 'beanie',
    name: 'Knit Beanie',
    category: 'accessories',
    subcategory: 'hats',
    styles: ['isolated', 'model-worn'],
    printAreas: ['front', 'cuff'],
    variants: {
      colors: ['black', 'gray', 'navy', 'red', 'white'],
      sizes: ['One Size']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 77,
    tags: ['winter', 'warm', 'knit'],
    mockupUrls: []
  },
  {
    id: 'bucket-hat',
    name: 'Bucket Hat',
    category: 'accessories',
    subcategory: 'hats',
    styles: ['isolated', 'model-worn'],
    printAreas: ['front', 'all-around'],
    variants: {
      colors: ['black', 'white', 'khaki', 'navy'],
      sizes: ['S/M', 'L/XL']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 73,
    tags: ['trendy', 'summer', 'festival'],
    mockupUrls: []
  },
  {
    id: 'trucker-hat',
    name: 'Trucker Hat',
    category: 'accessories',
    subcategory: 'hats',
    styles: ['isolated', 'model-worn'],
    printAreas: ['front', 'back'],
    variants: {
      colors: ['black-white', 'navy-white', 'red-white', 'gray-white'],
      sizes: ['One Size']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 75,
    tags: ['casual', 'mesh', 'breathable'],
    mockupUrls: []
  },
  {
    id: 'snapback',
    name: 'Snapback Cap',
    category: 'accessories',
    subcategory: 'hats',
    styles: ['isolated', 'model-worn'],
    printAreas: ['front', 'side'],
    variants: {
      colors: ['black', 'white', 'navy', 'red', 'gray'],
      sizes: ['One Size']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 80,
    tags: ['urban', 'streetwear', 'adjustable'],
    mockupUrls: []
  },
  {
    id: 'socks',
    name: 'Crew Socks',
    category: 'accessories',
    subcategory: 'footwear',
    styles: ['flat-lay', 'isolated'],
    printAreas: ['all-over', 'calf-area'],
    variants: {
      colors: ['white', 'black', 'gray', 'custom-pattern'],
      sizes: ['S', 'M', 'L']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 70,
    tags: ['fun', 'colorful', 'gift'],
    mockupUrls: []
  },
  {
    id: 'scarf',
    name: 'Knit Scarf',
    category: 'accessories',
    subcategory: 'winter',
    styles: ['flat-lay', 'model-worn'],
    printAreas: ['all-over'],
    variants: {
      colors: ['black', 'gray', 'navy', 'burgundy', 'cream'],
      sizes: ['One Size']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 68,
    tags: ['winter', 'warm', 'cozy'],
    mockupUrls: []
  },
  {
    id: 'bandana',
    name: 'Bandana',
    category: 'accessories',
    subcategory: 'headwear',
    styles: ['flat-lay', 'isolated'],
    printAreas: ['all-over'],
    variants: {
      colors: ['custom-pattern'],
      sizes: ['22x22']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 66,
    tags: ['versatile', 'fashion', 'accessory'],
    mockupUrls: []
  },

  // BAGS (6 items)
  {
    id: 'tote-bag',
    name: 'Canvas Tote Bag',
    category: 'bags',
    subcategory: 'everyday',
    blueprintId: 333,
    styles: ['isolated', 'lifestyle', 'flat-lay'],
    printAreas: ['front', 'back'],
    variants: {
      colors: ['natural', 'black', 'navy', 'red'],
      sizes: ['Standard']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 92,
    tags: ['eco-friendly', 'reusable', 'shopping', 'popular'],
    mockupUrls: []
  },
  {
    id: 'drawstring-bag',
    name: 'Drawstring Bag',
    category: 'bags',
    subcategory: 'sports',
    styles: ['isolated', 'lifestyle'],
    printAreas: ['front', 'back'],
    variants: {
      colors: ['black', 'navy', 'red', 'royal-blue', 'gray'],
      sizes: ['Standard']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 83,
    tags: ['gym', 'sports', 'lightweight'],
    mockupUrls: []
  },
  {
    id: 'backpack',
    name: 'Backpack',
    category: 'bags',
    subcategory: 'travel',
    styles: ['isolated', 'lifestyle', '3d-render'],
    printAreas: ['front-pocket', 'main-body'],
    variants: {
      colors: ['black', 'navy', 'gray', 'red'],
      sizes: ['Standard']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 87,
    tags: ['school', 'travel', 'storage'],
    mockupUrls: []
  },
  {
    id: 'duffel-bag',
    name: 'Duffel Bag',
    category: 'bags',
    subcategory: 'travel',
    styles: ['isolated', 'lifestyle'],
    printAreas: ['side-panel', 'end-pocket'],
    variants: {
      colors: ['black', 'navy', 'gray', 'camo'],
      sizes: ['Standard', 'Large']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 76,
    tags: ['gym', 'travel', 'durable'],
    mockupUrls: []
  },
  {
    id: 'messenger-bag',
    name: 'Messenger Bag',
    category: 'bags',
    subcategory: 'everyday',
    styles: ['isolated', 'lifestyle'],
    printAreas: ['flap', 'front-pocket'],
    variants: {
      colors: ['black', 'brown', 'gray', 'navy'],
      sizes: ['Standard']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 72,
    tags: ['professional', 'urban', 'laptop'],
    mockupUrls: []
  },
  {
    id: 'fanny-pack',
    name: 'Fanny Pack',
    category: 'bags',
    subcategory: 'travel',
    styles: ['isolated', 'model-worn'],
    printAreas: ['front'],
    variants: {
      colors: ['black', 'gray', 'neon', 'camo'],
      sizes: ['Standard']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 69,
    tags: ['trendy', 'festival', 'hands-free'],
    mockupUrls: []
  },

  // HOME & LIVING (9 items)
  {
    id: 'throw-pillow',
    name: 'Throw Pillow',
    category: 'home-living',
    subcategory: 'decor',
    styles: ['isolated', 'scene', 'flat-lay'],
    printAreas: ['front', 'both-sides'],
    variants: {
      colors: ['white-cover'],
      sizes: ['16x16', '18x18', '20x20']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 90,
    tags: ['home-decor', 'cozy', 'gift', 'popular'],
    mockupUrls: []
  },
  {
    id: 'fleece-blanket',
    name: 'Fleece Blanket',
    category: 'home-living',
    subcategory: 'textiles',
    styles: ['flat-lay', 'scene'],
    printAreas: ['all-over'],
    variants: {
      colors: ['white-base'],
      sizes: ['50x60', '60x80']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 86,
    tags: ['cozy', 'warm', 'gift', 'comfort'],
    mockupUrls: []
  },
  {
    id: 'canvas-print',
    name: 'Canvas Wall Art',
    category: 'home-living',
    subcategory: 'wall-art',
    styles: ['isolated', 'scene'],
    printAreas: ['full-canvas'],
    variants: {
      colors: ['canvas'],
      sizes: ['12x16', '16x20', '18x24', '24x36']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 88,
    tags: ['wall-art', 'decor', 'gallery-wrap'],
    mockupUrls: []
  },
  {
    id: 'framed-poster',
    name: 'Framed Poster',
    category: 'home-living',
    subcategory: 'wall-art',
    styles: ['isolated', 'scene'],
    printAreas: ['print-area'],
    variants: {
      colors: ['black-frame', 'white-frame', 'wood-frame'],
      sizes: ['12x18', '16x24', '18x24', '24x36']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 85,
    tags: ['wall-art', 'framed', 'ready-to-hang'],
    mockupUrls: []
  },
  {
    id: 'poster',
    name: 'Poster Print',
    category: 'home-living',
    subcategory: 'wall-art',
    blueprintId: 480,
    styles: ['flat-lay', 'scene'],
    printAreas: ['full-print'],
    variants: {
      colors: ['glossy', 'matte'],
      sizes: ['12x18', '16x20', '18x24', '24x36']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 82,
    tags: ['affordable', 'wall-art', 'customizable'],
    mockupUrls: []
  },
  {
    id: 'shower-curtain',
    name: 'Shower Curtain',
    category: 'home-living',
    subcategory: 'bathroom',
    styles: ['scene', 'isolated'],
    printAreas: ['all-over'],
    variants: {
      colors: ['white-base'],
      sizes: ['71x74']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 74,
    tags: ['bathroom', 'decor', 'waterproof'],
    mockupUrls: []
  },
  {
    id: 'bath-mat',
    name: 'Bath Mat',
    category: 'home-living',
    subcategory: 'bathroom',
    styles: ['flat-lay', 'scene'],
    printAreas: ['top-surface'],
    variants: {
      colors: ['white-base'],
      sizes: ['24x17', '34x21']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 71,
    tags: ['bathroom', 'absorbent', 'non-slip'],
    mockupUrls: []
  },
  {
    id: 'beach-towel',
    name: 'Beach Towel',
    category: 'home-living',
    subcategory: 'textiles',
    styles: ['flat-lay', 'scene'],
    printAreas: ['all-over'],
    variants: {
      colors: ['white-base'],
      sizes: ['30x60']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 79,
    tags: ['beach', 'summer', 'pool', 'vacation'],
    mockupUrls: []
  },
  {
    id: 'duvet-cover',
    name: 'Duvet Cover',
    category: 'home-living',
    subcategory: 'bedroom',
    styles: ['scene'],
    printAreas: ['top-surface'],
    variants: {
      colors: ['white-base'],
      sizes: ['Twin', 'Full', 'Queen', 'King']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 77,
    tags: ['bedroom', 'bedding', 'luxury'],
    mockupUrls: []
  },

  // DRINKWARE (5 items)
  {
    id: 'ceramic-mug',
    name: 'Ceramic Mug',
    category: 'drinkware',
    subcategory: 'mugs',
    blueprintId: 26,
    styles: ['isolated', 'lifestyle', '3d-render'],
    printAreas: ['wrap-around', 'front'],
    variants: {
      colors: ['white', 'black'],
      sizes: ['11oz', '15oz']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 94,
    tags: ['bestseller', 'coffee', 'gift', 'dishwasher-safe'],
    mockupUrls: []
  },
  {
    id: 'travel-mug',
    name: 'Stainless Steel Travel Mug',
    category: 'drinkware',
    subcategory: 'mugs',
    styles: ['isolated', 'lifestyle'],
    printAreas: ['wrap-around'],
    variants: {
      colors: ['stainless', 'black', 'white'],
      sizes: ['15oz']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 84,
    tags: ['insulated', 'travel', 'spill-proof'],
    mockupUrls: []
  },
  {
    id: 'water-bottle',
    name: 'Water Bottle',
    category: 'drinkware',
    subcategory: 'bottles',
    styles: ['isolated', 'lifestyle', '3d-render'],
    printAreas: ['wrap-around', 'front'],
    variants: {
      colors: ['stainless', 'white', 'black', 'blue'],
      sizes: ['20oz', '32oz']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 91,
    tags: ['eco-friendly', 'reusable', 'fitness', 'popular'],
    mockupUrls: []
  },
  {
    id: 'wine-tumbler',
    name: 'Wine Tumbler',
    category: 'drinkware',
    subcategory: 'tumblers',
    styles: ['isolated', 'lifestyle'],
    printAreas: ['wrap-around'],
    variants: {
      colors: ['stainless', 'white', 'rose-gold', 'black'],
      sizes: ['12oz']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 81,
    tags: ['wine', 'insulated', 'elegant', 'gift'],
    mockupUrls: []
  },
  {
    id: 'pint-glass',
    name: 'Pint Glass',
    category: 'drinkware',
    subcategory: 'glasses',
    styles: ['isolated', 'lifestyle'],
    printAreas: ['front', 'wrap-around'],
    variants: {
      colors: ['clear'],
      sizes: ['16oz']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 73,
    tags: ['beer', 'pub', 'gift'],
    mockupUrls: []
  },

  // OFFICE & STATIONERY (7 items)
  {
    id: 'spiral-notebook',
    name: 'Spiral Notebook',
    category: 'office',
    subcategory: 'stationery',
    styles: ['flat-lay', 'isolated', 'scene'],
    printAreas: ['front-cover', 'back-cover'],
    variants: {
      colors: ['white-cover'],
      sizes: ['5x7', '6x8', '8x10']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 86,
    tags: ['notebook', 'school', 'office', 'journal'],
    mockupUrls: []
  },
  {
    id: 'hardcover-journal',
    name: 'Hardcover Journal',
    category: 'office',
    subcategory: 'stationery',
    styles: ['flat-lay', 'isolated'],
    printAreas: ['front-cover', 'back-cover', 'spine'],
    variants: {
      colors: ['matte', 'glossy'],
      sizes: ['5x7', '8x10']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 83,
    tags: ['journal', 'premium', 'diary', 'planner'],
    mockupUrls: []
  },
  {
    id: 'sticky-notes',
    name: 'Sticky Note Pad',
    category: 'office',
    subcategory: 'stationery',
    styles: ['flat-lay', 'isolated'],
    printAreas: ['top-sheet'],
    variants: {
      colors: ['yellow', 'white', 'pink', 'blue'],
      sizes: ['3x3', '4x6']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 68,
    tags: ['office', 'organization', 'notes'],
    mockupUrls: []
  },
  {
    id: 'desk-pad',
    name: 'Desk Pad',
    category: 'office',
    subcategory: 'desk-accessories',
    styles: ['flat-lay', 'scene'],
    printAreas: ['top-surface'],
    variants: {
      colors: ['white-base'],
      sizes: ['24x12', '36x18']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 75,
    tags: ['desk', 'office', 'workspace', 'gaming'],
    mockupUrls: []
  },
  {
    id: 'mouse-pad',
    name: 'Mouse Pad',
    category: 'office',
    subcategory: 'desk-accessories',
    styles: ['flat-lay', 'scene'],
    printAreas: ['top-surface'],
    variants: {
      colors: ['white-base'],
      sizes: ['Rectangle', 'Circle', 'Extended']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 80,
    tags: ['gaming', 'office', 'computer', 'desk'],
    mockupUrls: []
  },
  {
    id: 'calendar',
    name: 'Wall Calendar',
    category: 'office',
    subcategory: 'stationery',
    styles: ['flat-lay', 'scene'],
    printAreas: ['monthly-pages', 'cover'],
    variants: {
      colors: ['full-color'],
      sizes: ['8.5x11', '11x17']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 72,
    tags: ['calendar', 'planner', 'organization', 'wall'],
    mockupUrls: []
  },
  {
    id: 'greeting-card',
    name: 'Greeting Card',
    category: 'office',
    subcategory: 'cards',
    styles: ['flat-lay', 'isolated'],
    printAreas: ['front', 'inside', 'back'],
    variants: {
      colors: ['glossy', 'matte'],
      sizes: ['5x7', 'A6']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 70,
    tags: ['card', 'gift', 'occasion', 'greeting'],
    mockupUrls: []
  },

  // TECH & ACCESSORIES (4 items)
  {
    id: 'phone-case-iphone',
    name: 'iPhone Case',
    category: 'tech',
    subcategory: 'phone-cases',
    styles: ['isolated', 'lifestyle', '3d-render'],
    printAreas: ['back'],
    variants: {
      colors: ['clear', 'black'],
      sizes: ['iPhone 12', 'iPhone 13', 'iPhone 14', 'iPhone 15']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 93,
    tags: ['phone', 'protection', 'tech', 'bestseller'],
    mockupUrls: []
  },
  {
    id: 'phone-case-samsung',
    name: 'Samsung Galaxy Case',
    category: 'tech',
    subcategory: 'phone-cases',
    styles: ['isolated', 'lifestyle', '3d-render'],
    printAreas: ['back'],
    variants: {
      colors: ['clear', 'black'],
      sizes: ['Galaxy S21', 'Galaxy S22', 'Galaxy S23', 'Galaxy S24']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 87,
    tags: ['phone', 'samsung', 'android', 'protection'],
    mockupUrls: []
  },
  {
    id: 'laptop-sleeve',
    name: 'Laptop Sleeve',
    category: 'tech',
    subcategory: 'computer',
    styles: ['isolated', 'flat-lay'],
    printAreas: ['front', 'back'],
    variants: {
      colors: ['neoprene'],
      sizes: ['13"', '15"', '16"']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 78,
    tags: ['laptop', 'protection', 'tech', 'work'],
    mockupUrls: []
  },
  {
    id: 'airpod-case',
    name: 'AirPods Case',
    category: 'tech',
    subcategory: 'audio',
    styles: ['isolated', '3d-render'],
    printAreas: ['front', 'back'],
    variants: {
      colors: ['white', 'clear'],
      sizes: ['AirPods 1/2', 'AirPods 3', 'AirPods Pro']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 82,
    tags: ['airpods', 'apple', 'audio', 'protection'],
    mockupUrls: []
  },

  // OUTDOOR & SPORTS (3 items)
  {
    id: 'sticker-pack',
    name: 'Vinyl Stickers',
    category: 'outdoor',
    subcategory: 'stickers',
    styles: ['flat-lay', 'isolated'],
    printAreas: ['full-design'],
    variants: {
      colors: ['full-color'],
      sizes: ['2"', '3"', '4"', '6"', 'Custom']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 89,
    tags: ['sticker', 'vinyl', 'waterproof', 'die-cut', 'popular'],
    mockupUrls: []
  },
  {
    id: 'yoga-mat',
    name: 'Yoga Mat',
    category: 'outdoor',
    subcategory: 'fitness',
    styles: ['flat-lay', 'scene'],
    printAreas: ['top-surface'],
    variants: {
      colors: ['white-base'],
      sizes: ['24x68', '26x72']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 80,
    tags: ['yoga', 'fitness', 'exercise', 'wellness'],
    mockupUrls: []
  },
  {
    id: 'umbrella',
    name: 'Umbrella',
    category: 'outdoor',
    subcategory: 'weather',
    styles: ['isolated', 'lifestyle'],
    printAreas: ['canopy-panels'],
    variants: {
      colors: ['black', 'navy', 'custom-pattern'],
      sizes: ['Standard']
    },
    dimensions: { width: 4500, height: 5400 },
    popularity: 67,
    tags: ['rain', 'weather', 'outdoor', 'practical'],
    mockupUrls: []
  }
];

/**
 * Get all mockups in a specific category
 */
export function getMockupsByCategory(category: ProductCategory): MockupTemplate[] {
  return MOCKUP_LIBRARY.filter(m => m.category === category);
}

/**
 * Get top N most popular mockups
 */
export function getPopularMockups(limit: number = 10): MockupTemplate[] {
  return [...MOCKUP_LIBRARY]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
}

/**
 * Search mockups by name or tags
 */
export function searchMockups(query: string): MockupTemplate[] {
  const lowerQuery = query.toLowerCase();
  return MOCKUP_LIBRARY.filter(m => 
    m.name.toLowerCase().includes(lowerQuery) ||
    m.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    m.subcategory.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get mockup by ID
 */
export function getMockupById(id: string): MockupTemplate | undefined {
  return MOCKUP_LIBRARY.find(m => m.id === id);
}

/**
 * Get category statistics
 */
export function getCategoryStats() {
  const stats: Record<ProductCategory, number> = {
    'apparel': 0,
    'accessories': 0,
    'home-living': 0,
    'drinkware': 0,
    'office': 0,
    'tech': 0,
    'bags': 0,
    'outdoor': 0
  };

  MOCKUP_LIBRARY.forEach(m => {
    stats[m.category]++;
  });

  return stats;
}

/**
 * Get all available print areas across all products
 */
export function getAllPrintAreas(): string[] {
  const areas = new Set<string>();
  MOCKUP_LIBRARY.forEach(m => {
    m.printAreas.forEach(area => areas.add(area));
  });
  return Array.from(areas).sort();
}

/**
 * Get mockups that support a specific print area
 */
export function getMockupsByPrintArea(printArea: string): MockupTemplate[] {
  return MOCKUP_LIBRARY.filter(m => m.printAreas.includes(printArea));
}
