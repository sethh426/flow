import { getGoogleTrends } from "./googleTrends.js";
import { getRedditFashionTrends } from "./redditFashion.js";
import { getFashionNewsTrends } from "./fashionNews.js";

// Aggregate all trend sources
export async function getAllTrends() {
  const [google, reddit, news] = await Promise.all([
    getGoogleTrends(),
    getRedditFashionTrends(),
    getFashionNewsTrends()
  ]);
  // Combine, dedupe, and return
  const all = [...google, ...reddit, ...news];
  return [...new Set(all)].filter(Boolean);
}
