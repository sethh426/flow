import { NextRequest, NextResponse } from 'next/server';
import { searchPhotos, getCuratedPhotos } from '@/services/unsplash-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = parseInt(searchParams.get('perPage') || '30', 10);
    const orientation = searchParams.get('orientation') as 'landscape' | 'portrait' | 'squarish' | null;

    // If no query, return curated photos
    if (!query) {
      const photos = await getCuratedPhotos(page, perPage);
      return NextResponse.json({ results: photos, total: photos.length });
    }

    // Search for photos
    const result = await searchPhotos({
      query,
      page,
      perPage,
      orientation: orientation || undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in stock photos API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock photos', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
