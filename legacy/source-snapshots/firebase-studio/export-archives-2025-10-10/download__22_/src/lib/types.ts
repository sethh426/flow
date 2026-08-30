
import type { ProductAnalysisOutput } from '@/ai/flows/product-analysis-flow';
import type { TrendingProductSuggestion } from '@/ai/flows/trending-product-flow';
import type { BrandStrategyOutput } from '@/ai/flows/brand-ambassador-flow';
import type { AudienceFinderOutput } from '@/ai/flows/audience-finder-flow';

// This is a stand-in for the real Firebase Timestamp type to avoid
// depending on the Firebase package in our pure type definitions.
// The mock data implementation creates objects that conform to this.
export interface Timestamp {
  seconds: number;
  nanoseconds: number;
  toDate(): Date;
  toMillis(): number;
  isEqual(other: Timestamp): boolean;
  valueOf(): string;
  toJSON(): { seconds: number, nanoseconds: number };
  toString(): string;
  _compareTo(other: Timestamp): number;
}


export interface Product {
  id: string;
  brandId?: string;
  name: string;
  description: string;
  imageURL: string;
  affiliateURL: string;
  approved: boolean;
  itemNumber?: string;
  status?: 'scraped' | 'reviewed' | 'approved_for_posting' | 'posted' | 'rejected';
  analysis?: ProductAnalysisOutput;
}

export interface UsageLog {
  id?: string;
  flowName: string;
  timestamp: Timestamp;
  inputTokens: number;
  outputTokens: number;

  totalTokens: number;
  estimatedCost: number;
}

export interface Feedback {
    id?: string;
    category: string;
    suggestions: string[];
    rating: 'good' | 'bad';
    critique?: string;
    timestamp: Timestamp;
}

export interface FAQ {
    id?: string;
    question: string;
    answer: string;
    timestamp: Timestamp;
}

export interface ScheduledPost {
    id: string;
    productId: string;
    productName: string;
    content: {
        caption: string;
        hook: string;
        hashtags: string[];
    };
    status: 'pending' | 'queued' | 'complete' | 'failed';
    scheduledAt: Date;
    postedAt?: Date;
    platform?: 'instagram' | 'facebook' | 'twitter';
    postUrl?: string;
    error?: string;
}

// Represents a central project that aggregates all AI-generated strategies.
export interface Project {
    id: string;
    name: string;
    description?: string;
    createdAt: Date;
    // Each of these can be null until the analysis is performed and saved.
    brandStrategy: BrandStrategyOutput | null;
    productAnalysis: ProductAnalysisOutput | null;
    audienceAnalysis: AudienceFinderOutput | null;
}
