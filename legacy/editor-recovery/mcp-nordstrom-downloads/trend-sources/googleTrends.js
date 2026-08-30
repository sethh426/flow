import fetch from "node-fetch";

// Fetch trending fashion topics from Google Trends (using unofficial API)
export async function getGoogleTrends() {
  // Example: Use trending searches endpoint (not official, but works for demo)
  const res = await fetch("https://trends.google.com/trends/api/dailytrends?hl=en-US&ed=20250620&geo=US&ns=15");
  if (!res.ok) return [];
  const text = await res.text();
  // Google Trends API returns JSON after )]}',
  const json = JSON.parse(text.replace(/^\)\]\}',?/, ''));
  const trends = json.default.trendingSearchesDays?.[0]?.trendingSearches || [];
  // Filter for fashion/brand related topics (simple keyword match for demo)
  const keywords = ["fashion","shoes","sneaker","brand","style","dress","adidas","nike","gucci","stella","mcCartney","yeezy","bag","jacket","coat","trend"];
  return trends
    .map(t => t.title.query)
    .filter(q => keywords.some(k => q.toLowerCase().includes(k)));
}
