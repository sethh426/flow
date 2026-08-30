/**
 * Hybrid ML/Rules Business Classifier
 * 
 * Uses a combination of:
 * 1. Pattern matching (keywords, industry codes)
 * 2. Simple decision tree logic (revenue, team size, goals)
 * 3. Confidence scoring for auto-routing
 * 
 * Future enhancement: Replace with scikit-learn model trained on real data
 */

export interface ClassificationResult {
  vertical: string;
  confidence: number;
  reasoning: string[];
  alternativeVerticals: Array<{ vertical: string; confidence: number }>;
  autoRoute: boolean;
  requiresReview: boolean;
}

export interface BusinessProfile {
  businessName: string;
  industry: string;
  website?: string;
  businessType?: string;
  monthlyRevenue: string;
  teamSize: string;
  primaryGoal: string;
  biggestChallenge: string;
  currentTools: string;
}

// Keyword patterns for each vertical
const VERTICAL_PATTERNS = {
  dropshipping: {
    keywords: [
      'shopify', 'woocommerce', 'ecommerce', 'online store', 'dropship',
      'etsy', 'amazon fba', 'print on demand', 'pod', 'oberlo', 'dsers',
      'aliexpress', 'retail', 'products', 'inventory', 'cart',
    ],
    industries: ['retail', 'ecommerce', 'online sales', 'fashion', 'beauty'],
    revenue: ['0-10k', '10k-50k', '50k-100k'],
  },
  realEstate: {
    keywords: [
      'real estate', 'realtor', 'agent', 'broker', 'property', 'homes',
      'listings', 'mls', 'idx', 'showing', 'open house', 'buyer', 'seller',
      'zillow', 'trulia', 'redfin',
    ],
    industries: ['real estate', 'property management', 'residential', 'commercial'],
    revenue: ['10k-50k', '50k-100k', '100k-500k'],
  },
  automotive: {
    keywords: [
      'dealership', 'auto', 'cars', 'vehicles', 'automotive', 'dealer',
      'test drive', 'financing', 'trade-in', 'used cars', 'new cars',
      'vinsolutions', 'dealertrack', 'elead',
    ],
    industries: ['automotive', 'car sales', 'vehicle', 'dealership'],
    revenue: ['100k-500k', '500k+'],
  },
  tradeServices: {
    keywords: [
      'plumber', 'plumbing', 'electrician', 'electrical', 'hvac', 'heating',
      'cooling', 'contractor', 'handyman', 'repair', 'service', 'maintenance',
      'installation', 'roofing', 'landscaping', 'painting',
    ],
    industries: ['home services', 'trades', 'construction', 'repair', 'maintenance'],
    revenue: ['0-10k', '10k-50k', '50k-100k'],
  },
  digitalProducts: {
    keywords: [
      'saas', 'software', 'app', 'digital', 'online course', 'ebook',
      'subscription', 'membership', 'training', 'education', 'webinar',
      'stripe', 'recurring', 'mrr', 'churn', 'freemium',
    ],
    industries: ['software', 'saas', 'digital products', 'education', 'training'],
    revenue: ['0-10k', '10k-50k', '50k-100k', '100k-500k'],
  },
  personalBrand: {
    keywords: [
      'coach', 'coaching', 'consultant', 'consulting', 'speaker', 'author',
      'influencer', 'creator', 'expert', 'trainer', 'mentor', 'advisor',
      'thought leader', 'personal brand', 'keynote',
    ],
    industries: ['coaching', 'consulting', 'speaking', 'training', 'personal development'],
    revenue: ['0-10k', '10k-50k', '50k-100k', '100k-500k'],
  },
};

// Goal-to-vertical mapping
const GOAL_MAPPING = {
  'increase-conversions': ['dropshipping', 'digitalProducts', 'realEstate'],
  'reduce-response-time': ['realEstate', 'tradeServices', 'automotive'],
  'automate-follow-ups': ['realEstate', 'tradeServices', 'personalBrand'],
  'recover-abandoned': ['dropshipping', 'digitalProducts'],
  'scale-operations': ['tradeServices', 'automotive', 'digitalProducts'],
};

/**
 * Calculate keyword match score
 */
function calculateKeywordScore(text: string, keywords: string[]): number {
  const normalizedText = text.toLowerCase();
  let matches = 0;
  
  keywords.forEach((keyword) => {
    if (normalizedText.includes(keyword.toLowerCase())) {
      matches++;
    }
  });
  
  // Return percentage of keywords matched
  return (matches / keywords.length) * 100;
}

/**
 * Calculate industry match score
 */
function calculateIndustryScore(industry: string, validIndustries: string[]): number {
  const normalizedIndustry = industry.toLowerCase();
  
  for (const validIndustry of validIndustries) {
    if (normalizedIndustry.includes(validIndustry.toLowerCase())) {
      return 100;
    }
  }
  
  return 0;
}

/**
 * Calculate revenue match score
 */
function calculateRevenueScore(revenue: string, validRevenues: string[]): number {
  if (validRevenues.includes(revenue)) {
    return 100;
  }
  return 50; // Partial match
}

/**
 * Calculate goal alignment score
 */
function calculateGoalScore(goal: string, vertical: string): number {
  const alignedVerticals = GOAL_MAPPING[goal as keyof typeof GOAL_MAPPING] || [];
  
  if (alignedVerticals.includes(vertical)) {
    return 100;
  }
  
  return 0;
}

/**
 * Main classification function
 */
export function classifyBusiness(profile: BusinessProfile): ClassificationResult {
  const scores: Record<string, { score: number; reasoning: string[] }> = {};
  
  // Calculate scores for each vertical
  Object.entries(VERTICAL_PATTERNS).forEach(([vertical, patterns]) => {
    const reasoning: string[] = [];
    let totalScore = 0;
    
    // Keyword matching (40% weight)
    const combinedText = `${profile.businessName} ${profile.industry} ${profile.website || ''} ${profile.biggestChallenge} ${profile.currentTools}`;
    const keywordScore = calculateKeywordScore(combinedText, patterns.keywords);
    totalScore += keywordScore * 0.4;
    
    if (keywordScore > 10) {
      reasoning.push(`Matched ${Math.round(keywordScore)}% of ${vertical} keywords`);
    }
    
    // Industry matching (30% weight)
    const industryScore = calculateIndustryScore(profile.industry, patterns.industries);
    totalScore += industryScore * 0.3;
    
    if (industryScore > 0) {
      reasoning.push(`Industry aligns with ${vertical}`);
    }
    
    // Revenue matching (15% weight)
    const revenueScore = calculateRevenueScore(profile.monthlyRevenue, patterns.revenue);
    totalScore += revenueScore * 0.15;
    
    // Goal alignment (15% weight)
    const goalScore = calculateGoalScore(profile.primaryGoal, vertical);
    totalScore += goalScore * 0.15;
    
    if (goalScore > 0) {
      reasoning.push(`Primary goal aligns with ${vertical} workflows`);
    }
    
    scores[vertical] = { score: totalScore, reasoning };
  });
  
  // Explicit business type override (highest priority)
  if (profile.businessType && scores[profile.businessType]) {
    scores[profile.businessType].score += 30; // Boost by 30 points
    scores[profile.businessType].reasoning.push('Explicitly selected by user');
  }
  
  // Sort by score
  const sortedVerticals = Object.entries(scores)
    .sort(([, a], [, b]) => b.score - a.score);
  
  const topVertical = sortedVerticals[0];
  const topScore = Math.min(100, topVertical[1].score); // Cap at 100
  
  // Get alternatives (confidence > 40)
  const alternatives = sortedVerticals
    .slice(1)
    .filter(([, data]) => data.score > 40)
    .map(([vertical, data]) => ({
      vertical,
      confidence: Math.min(100, Math.round(data.score)),
    }));
  
  // Determine routing
  const autoRoute = topScore >= 95;
  const requiresReview = topScore < 70;
  
  return {
    vertical: topVertical[0],
    confidence: Math.round(topScore),
    reasoning: topVertical[1].reasoning,
    alternativeVerticals: alternatives,
    autoRoute,
    requiresReview,
  };
}

/**
 * Decision tree rules for edge cases
 */
export function applyBusinessRules(
  classification: ClassificationResult,
  profile: BusinessProfile
): ClassificationResult {
  const rules: Array<{
    condition: (p: BusinessProfile) => boolean;
    action: (c: ClassificationResult) => ClassificationResult;
    priority: number;
  }> = [
    // Rule 1: High revenue + no physical products = likely SaaS/Digital
    {
      priority: 1,
      condition: (p) => 
        (p.monthlyRevenue === '100k-500k' || p.monthlyRevenue === '500k+') &&
        !p.industry.toLowerCase().includes('product') &&
        !p.industry.toLowerCase().includes('retail'),
      action: (c) => {
        if (c.vertical !== 'digitalProducts' && c.confidence < 90) {
          return {
            ...c,
            vertical: 'digitalProducts',
            confidence: Math.max(c.confidence, 85),
            reasoning: [...c.reasoning, 'Rule: High revenue + digital model = SaaS/Digital'],
          };
        }
        return c;
      },
    },
    
    // Rule 2: Contains "real estate" or "realtor" = Real Estate
    {
      priority: 2,
      condition: (p) => 
        p.industry.toLowerCase().includes('real estate') ||
        p.industry.toLowerCase().includes('realtor') ||
        p.businessName.toLowerCase().includes('realty'),
      action: (c) => ({
        ...c,
        vertical: 'realEstate',
        confidence: 98,
        reasoning: [...c.reasoning, 'Rule: Explicit real estate identifier'],
        autoRoute: true,
      }),
    },
    
    // Rule 3: Trade service keywords + local focus = Trade Services
    {
      priority: 3,
      condition: (p) => {
        const tradeKeywords = ['plumber', 'electrician', 'hvac', 'contractor', 'repair'];
        const text = `${p.businessName} ${p.industry}`.toLowerCase();
        return tradeKeywords.some(keyword => text.includes(keyword));
      },
      action: (c) => ({
        ...c,
        vertical: 'tradeServices',
        confidence: 96,
        reasoning: [...c.reasoning, 'Rule: Trade service keyword detected'],
        autoRoute: true,
      }),
    },
    
    // Rule 4: Coaching/Speaking keywords = Personal Brand
    {
      priority: 4,
      condition: (p) => {
        const brandKeywords = ['coach', 'speaker', 'consultant', 'author'];
        const text = `${p.businessName} ${p.industry}`.toLowerCase();
        return brandKeywords.some(keyword => text.includes(keyword));
      },
      action: (c) => {
        if (c.confidence < 85) {
          return {
            ...c,
            vertical: 'personalBrand',
            confidence: Math.max(c.confidence, 88),
            reasoning: [...c.reasoning, 'Rule: Personal brand keywords detected'],
          };
        }
        return c;
      },
    },
    
    // Rule 5: Shopify/WooCommerce = Dropshipping
    {
      priority: 5,
      condition: (p) => {
        const ecomKeywords = ['shopify', 'woocommerce', 'etsy', 'amazon fba'];
        const text = `${p.currentTools} ${p.website}`.toLowerCase();
        return ecomKeywords.some(keyword => text.includes(keyword));
      },
      action: (c) => ({
        ...c,
        vertical: 'dropshipping',
        confidence: 95,
        reasoning: [...c.reasoning, 'Rule: E-commerce platform detected'],
        autoRoute: true,
      }),
    },
  ];
  
  // Apply rules in priority order
  let result = classification;
  const sortedRules = rules.sort((a, b) => a.priority - b.priority);
  
  for (const rule of sortedRules) {
    if (rule.condition(profile)) {
      result = rule.action(result);
    }
  }
  
  return result;
}

/**
 * Complete classification pipeline
 */
export function classifyBusinessComplete(profile: BusinessProfile): ClassificationResult {
  // Step 1: ML-style scoring
  const mlClassification = classifyBusiness(profile);
  
  // Step 2: Apply business rules
  const finalClassification = applyBusinessRules(mlClassification, profile);
  
  // Step 3: Final confidence adjustments
  if (finalClassification.confidence >= 95) {
    finalClassification.autoRoute = true;
    finalClassification.requiresReview = false;
  } else if (finalClassification.confidence >= 70) {
    finalClassification.autoRoute = false;
    finalClassification.requiresReview = false;
  } else {
    finalClassification.autoRoute = false;
    finalClassification.requiresReview = true;
  }
  
  return finalClassification;
}

/**
 * Get human-readable confidence level
 */
export function getConfidenceLevel(confidence: number): string {
  if (confidence >= 95) return 'Very High';
  if (confidence >= 85) return 'High';
  if (confidence >= 70) return 'Moderate';
  if (confidence >= 50) return 'Low';
  return 'Very Low';
}

/**
 * Get recommended action based on confidence
 */
export function getRecommendedAction(confidence: number): string {
  if (confidence >= 95) {
    return 'Auto-route to recommended workflow immediately';
  } else if (confidence >= 70) {
    return 'Route to workflow with monitoring';
  } else {
    return 'Queue for manual review by onboarding team';
  }
}
