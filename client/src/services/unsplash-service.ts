import { createApi } from 'unsplash-js';

// Get Unsplash access key from environment
const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || '';

// Initialize Unsplash API client
const unsplash = createApi({
  accessKey,
});

export interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string | null;
  description: string | null;
  user: {
    name: string;
    username: string;
    profile_image: {
      small: string;
    };
  };
  width: number;
  height: number;
}

export interface SearchPhotosParams {
  query: string;
  page?: number;
  perPage?: number;
  orientation?: 'landscape' | 'portrait' | 'squarish';
}

/**
 * Search for photos on Unsplash
 */
export async function searchPhotos({
  query,
  page = 1,
  perPage = 30,
  orientation,
}: SearchPhotosParams): Promise<{ results: UnsplashPhoto[]; total: number }> {
  try {
    const result = await unsplash.search.getPhotos({
      query,
      page,
      perPage,
      orientation,
    });

    if (result.errors) {
      console.error('Unsplash API errors:', result.errors);
      throw new Error(result.errors[0]);
    }

    return {
      results: result.response?.results as UnsplashPhoto[] || [],
      total: result.response?.total || 0,
    };
  } catch (error) {
    console.error('Error searching photos:', error);
    throw error;
  }
}

/**
 * Get curated photos (editorial feed)
 */
export async function getCuratedPhotos(page = 1, perPage = 30): Promise<UnsplashPhoto[]> {
  try {
    const result = await unsplash.photos.list({
      page,
      perPage,
    });

    if (result.errors) {
      console.error('Unsplash API errors:', result.errors);
      throw new Error(result.errors[0]);
    }

    return (result.response?.results as UnsplashPhoto[]) || [];
  } catch (error) {
    console.error('Error fetching curated photos:', error);
    throw error;
  }
}

/**
 * Track photo download (required by Unsplash API guidelines)
 */
export async function trackDownload(photoId: string): Promise<void> {
  try {
    await unsplash.photos.trackDownload({ downloadLocation: photoId });
  } catch (error) {
    console.error('Error tracking download:', error);
  }
}

/**
 * Get popular categories for quick search
 */
export const POPULAR_CATEGORIES = [
  'fashion',
  'lifestyle',
  'business',
  'technology',
  'nature',
  'food',
  'travel',
  'fitness',
  'beauty',
  'home',
  'pets',
  'art',
] as const;

export type PhotoCategory = typeof POPULAR_CATEGORIES[number];
