import type { Product, UsageLog, ScheduledPost, Timestamp } from './types';
import { addDays, subDays, startOfMonth, setDate } from 'date-fns';

// A mock Timestamp class that mimics Firestore's Timestamp behavior for client-side use.
class MockTimestamp implements Timestamp {
  seconds: number;
  nanoseconds: number;

  constructor(seconds: number, nanoseconds: number) {
    this.seconds = seconds;
    this.nanoseconds = nanoseconds;
  }

  static now(): MockTimestamp {
    const now = Date.now();
    const seconds = Math.floor(now / 1000);
    const nanoseconds = (now % 1000) * 1000000;
    return new MockTimestamp(seconds, nanoseconds);
  }

  toDate(): Date {
    return new Date(this.seconds * 1000 + this.nanoseconds / 1000000);
  }

  toMillis(): number {
    return this.seconds * 1000 + this.nanoseconds / 1000000;
  }
  
  isEqual(other: Timestamp): boolean {
    return this.seconds === other.seconds && this.nanoseconds === other.nanoseconds;
  }

  valueOf(): string {
    return `Timestamp(seconds=${this.seconds}, nanoseconds=${this.nanoseconds})`;
  }
  
  toJSON(): { seconds: number; nanoseconds: number; } {
      return { seconds: this.seconds, nanoseconds: this.nanoseconds };
  }

  toString(): string {
      return this.valueOf();
  }

  _compareTo(other: Timestamp): number {
      if (this.seconds === other.seconds) {
          return this.nanoseconds - other.nanoseconds;
      }
      return this.seconds - other.seconds;
  }
}


const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Eco-Friendly Bamboo Utensil Set',
    description: 'A sustainable and stylish alternative to single-use plastics. Perfect for travel, picnics, and everyday use. Made from 100% natural bamboo.',
    imageURL: 'https://picsum.photos/seed/prod1/600/400',
    affiliateURL: 'https://example.com/product/1',
    status: 'posted',
    approved: true,
    brandId: 'ecoware-global',
    analysis: {
      coreHooks: ['Sustainability On-the-Go', 'Ditch Plastic, Embrace Style', 'The Zero-Waste Lunch Companion'],
      targetAudience: 'Eco-conscious millennials and Gen Z who are active on social media, follow sustainability influencers, and are looking for practical ways to reduce their environmental footprint. They value aesthetics and convenience.',
      channelStrategy: [
        {
          platform: 'Instagram',
          strategy: 'Focus on visually appealing flat lays and videos showcasing the utensil set in various settings (office lunch, picnic, travel). Partner with foodie and zero-waste influencers.',
          examplePost: 'Say goodbye to flimsy plastic forks! 🍴 Our bamboo utensil set is ready for any adventure. #EcoFriendly #ZeroWaste #SustainableLiving'
        },
        {
          platform: 'Pinterest',
          strategy: 'Create pins focused on "zero-waste kits", "eco-friendly travel essentials", and "sustainable gift ideas". Highlight the product\'s aesthetic and practicality.',
          examplePost: 'The only utensil set you\'ll ever need. Pin this to your sustainable wishlist! ✨'
        }
      ],
      outreachIdeas: ['Collaborate with university eco-clubs for student discounts.', 'Partner with healthy meal prep subscription boxes to include a set.', 'Run a "show us your sustainable lunch" UGC campaign on Instagram.'],
      creativePrompts: ['A "what\'s in my bag" video featuring the utensil set.', 'A time-lapse of a week of plastic-free lunches.', 'An ASMR unboxing video.']
    }
  },
  {
    id: '2',
    name: 'Smart Aromatherapy Diffuser',
    description: 'Control your home\'s ambiance from your phone. This smart diffuser uses ultrasonic technology to create a calming mist of your favorite essential oils.',
    imageURL: 'https://picsum.photos/seed/prod2/600/400',
    affiliateURL: 'https://example.com/product/2',
    status: 'approved_for_posting',
    approved: true,
    brandId: 'zen-home-tech',
  },
  {
    id: '3',
    name: 'Portable Espresso Maker',
    description: 'Cafe-quality espresso, anywhere you go. This compact, hand-powered device is perfect for coffee lovers who are always on the move.',
    imageURL: 'https://picsum.photos/seed/prod3/600/400',
    affiliateURL: 'https://example.com/product/3',
    status: 'reviewed',
    approved: false,
    brandId: 'roam-roast',
  },
  {
    id: '4',
    name: 'Minimalist Leather Wallet',
    description: 'A slim, RFID-blocking wallet designed to hold your essentials without the bulk. Crafted from premium full-grain leather.',
    imageURL: 'https://picsum.photos/seed/prod4/600/400',
    affiliateURL: 'https://example.com/product/4',
    status: 'scraped',
    approved: false,
    brandId: 'urban-essentials',
  },
  {
    id: '5',
    name: 'Adjustable Dumbbell Set',
    description: 'Save space with this all-in-one dumbbell set. Quickly adjust the weight from 5 to 52.5 lbs. Perfect for home gyms.',
    imageURL: 'https://picsum.photos/seed/prod5/600/400',
    affiliateURL: 'https://example.com/product/5',
    status: 'rejected',
    approved: false,
    brandId: 'fit-at-home',
  },
    {
    id: '6',
    name: 'Sunrise Simulation Alarm Clock',
    description: 'Wake up naturally with a clock that simulates the sunrise. Gradually brightens to gently wake you. Also features nature sounds and an FM radio.',
    imageURL: 'https://picsum.photos/seed/prod6/600/400',
    affiliateURL: 'https://example.com/product/6',
    status: 'approved_for_posting',
    approved: true,
    brandId: 'lumina-clocks',
  },
  {
    id: '7',
    name: 'Waterproof Picnic & Beach Blanket',
    description: 'Extra large, sand-proof, and waterproof. This foldable blanket is perfect for picnics, beach days, and camping trips. Comes with a convenient carry strap.',
    imageURL: 'https://picsum.photos/seed/prod7/600/400',
    affiliateURL: 'https://example.com/product/7',
    status: 'posted',
    approved: true,
    brandId: 'outdoor-gear-co',
  },
  {
    id: '8',
    name: 'Cold Brew Coffee Maker & Pitcher',
    description: 'Make smooth, delicious cold brew at home. This simple system includes a brewing container with a stainless steel filter and a storage pitcher.',
    imageURL: 'https://picsum.photos/seed/prod8/600/400',
    affiliateURL: 'https://example.com/product/8',
    status: 'scraped',
    approved: false,
    brandId: 'kitchen-innovations',
  },
];

const MOCK_USAGE_LOGS: UsageLog[] = [
    { flowName: 'trendingProductFlow', timestamp: new MockTimestamp(1672531200, 0), inputTokens: 120, outputTokens: 850, totalTokens: 970, estimatedCost: 0.0009345 },
    { flowName: 'productAnalysisFlow', timestamp: new MockTimestamp(1672617600, 0), inputTokens: 300, outputTokens: 1200, totalTokens: 1500, estimatedCost: 0.001365 },
    { flowName: 'productCreationFlow', timestamp: new MockTimestamp(1672704000, 0), inputTokens: 50, outputTokens: 350, totalTokens: 400, estimatedCost: 0.000385 },
    { flowName: 'trendingProductFlow', timestamp: new MockTimestamp(1672790400, 0), inputTokens: 150, outputTokens: 900, totalTokens: 1050, estimatedCost: 0.0009975 },
    { flowName: 'audienceFinderFlow', timestamp: new MockTimestamp(1672876800, 0), inputTokens: 450, outputTokens: 1500, totalTokens: 1950, estimatedCost: 0.0017325 },
    { flowName: 'schedulePostsFlow', timestamp: new MockTimestamp(1672963200, 0), inputTokens: 600, outputTokens: 2500, totalTokens: 3100, estimatedCost: 0.002835 },
    { flowName: 'productAnalysisFlow', timestamp: new MockTimestamp(1673049600, 0), inputTokens: 250, outputTokens: 1100, totalTokens: 1350, estimatedCost: 0.0012425 },
];

const now = new Date();
const monthStart = startOfMonth(now);

const MOCK_SCHEDULED_POSTS: ScheduledPost[] = [
    // Past posts
    {
        id: 'post1',
        productId: '1',
        productName: 'Eco-Friendly Bamboo Utensil Set',
        content: { caption: 'Starting the week sustainably! My lunch kit is now 100% plastic-free.', hook: 'New week, new habits.', hashtags: ['#zerowaste', '#sustainability', '#eco', '#lunch'] },
        status: 'complete',
        scheduledAt: setDate(monthStart, 2),
        postedAt: setDate(monthStart, 2),
        postUrl: 'https://example.com/social/post1'
    },
    {
        id: 'post2',
        productId: '7',
        productName: 'Waterproof Picnic & Beach Blanket',
        content: { caption: 'Throwback to this amazing beach day. So glad I had my sand-proof blanket!', hook: 'Missing the sun?', hashtags: ['#beachday', '#tbt', '#outdoors'] },
        status: 'complete',
        scheduledAt: setDate(monthStart, 3),
        postedAt: setDate(monthStart, 3),
        postUrl: 'https://example.com/social/post2'
    },

    // Today's posts
    {
        id: 'post3',
        productId: '2',
        productName: 'Smart Aromatherapy Diffuser',
        content: { caption: 'Winding down with some lavender and my favorite smart diffuser. Total game changer for my evenings.', hook: 'Ready to relax?', hashtags: ['#selfcare', '#aromatherapy', '#smarthome', '#relax'] },
        status: 'queued',
        scheduledAt: new Date(new Date().setHours(9, 0, 0, 0)),
    },
     {
        id: 'post10',
        productId: '6',
        productName: 'Sunrise Simulation Alarm Clock',
        content: { caption: 'What if you could wake up to a sunrise every day?', hook: 'Morning person or not?', hashtags: ['#morningroutine', '#biohacking', '#wellness'] },
        status: 'pending',
        scheduledAt: new Date(new Date().setHours(17, 0, 0, 0)),
    },

    // Future posts
    {
        id: 'post4',
        productId: '6',
        productName: 'Sunrise Simulation Alarm Clock',
        content: { caption: 'Waking up is so much easier when it feels like a natural sunrise. Best alarm clock ever!', hook: 'Tired of loud alarms?', hashtags: ['#morningroutine', '#sunrise', '#wellness', '#smarttech'] },
        status: 'pending',
        scheduledAt: addDays(now, 1),
    },
    {
        id: 'post5',
        productId: '1',
        productName: 'Eco-Friendly Bamboo Utensil Set',
        content: { caption: 'Another day, another plastic-free meal. It\'s the small changes that make a big difference!', hook: 'Join the movement.', hashtags: ['#gogreen', '#sustainableliving', '#plasticfree', '#ecofriendly'] },
        status: 'pending',
        scheduledAt: addDays(now, 2),
    },
     {
        id: 'post6',
        productId: '2',
        productName: 'Smart Aromatherapy Diffuser',
        content: { caption: 'Setting the perfect mood for a movie night.', hook: 'What\'s your go-to scent?', hashtags: ['#movienight', '#hygge', '#essentialoils'] },
        status: 'pending',
        scheduledAt: addDays(now, 3),
    },
    {
        id: 'post7',
        productId: '7',
        productName: 'Waterproof Picnic & Beach Blanket',
        content: { caption: 'Picnic season is here! Are you ready?', hook: 'Don\'t let wet grass ruin your vibe.', hashtags: ['#picnicseason', '#spring', '#getoutside'] },
        status: 'failed',
        scheduledAt: setDate(monthStart, 5),
    },
    {
        id: 'post8',
        productId: '1',
        productName: 'Eco-Friendly Bamboo Utensil Set',
        content: { caption: 'The perfect gift for your eco-conscious friend.', hook: 'Tag a friend who needs this!', hashtags: ['#giftideas', '#ecogift', '#sustainable'] },
        status: 'pending',
        scheduledAt: addDays(now, 5),
    },
    {
        id: 'post9',
        productId: '6',
        productName: 'Sunrise Simulation Alarm Clock',
        content: { caption: 'A gentle wakeup call is a form of self-care.', hook: 'How do you start your day?', hashtags: ['#selfcare', '#goodmorning', '#mindfulness'] },
        status: 'pending',
        scheduledAt: addDays(now, 6),
    },
];


export function getMockProducts(): Product[] {
  return MOCK_PRODUCTS;
}

export function getMockUsageLogs(): UsageLog[] {
  // Make sure timestamps are converted to the right format
  return MOCK_USAGE_LOGS.map(log => ({
      ...log,
      timestamp: log.timestamp instanceof MockTimestamp ? log.timestamp.toJSON() as unknown as Timestamp : log.timestamp,
  }));
}

export function getMockScheduledPosts(): ScheduledPost[] {
    return MOCK_SCHEDULED_POSTS;
}
