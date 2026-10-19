/** A separate HTTPS origin lets static Firebase Hosting use an OVH API. */
export function studioApiUrl(path: string): string {
  const origin = process.env.NEXT_PUBLIC_FLOW_STUDIO_API_ORIGIN?.trim();
  if (!origin) return path;
  if (!/^https:\/\/[^/]+$/.test(origin)) return path;
  return `${origin}${path}`;
}
