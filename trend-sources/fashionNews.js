import fetch from "node-fetch";

// Fetch trending fashion headlines from Vogue (RSS)
export async function getFashionNewsTrends() {
  const res = await fetch("https://www.vogue.com/rss");
  if (!res.ok) return [];
  const xml = await res.text();
  // Simple regex to extract titles from RSS (for demo)
  const matches = [...xml.matchAll(/<title><!\[CDATA\[(.*?)\]\]><\/title>/g)];
  // Remove the first title (it's usually the feed title)
  return matches.slice(1).map(m => m[1]);
}
