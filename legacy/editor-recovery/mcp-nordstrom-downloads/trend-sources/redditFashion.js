import fetch from "node-fetch";

// Fetch trending posts from r/fashion and r/streetwear
export async function getRedditFashionTrends() {
  const subreddits = ["fashion", "streetwear"];
  let results = [];
  for (const sub of subreddits) {
    const res = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=10`);
    if (!res.ok) continue;
    const json = await res.json();
    results.push(...json.data.children.map(p => p.data.title));
  }
  return results;
}
