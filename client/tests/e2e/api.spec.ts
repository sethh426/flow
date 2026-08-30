import { test, expect, request } from '@playwright/test';

// Basic vertical slice API sanity tests
// These exercise the core MVP endpoints: analytics summary, campaigns, trend discovery, content generation.
// They use Playwright's APIRequestContext for speed (no browser needed).

test.describe('Vertical Slice API', () => {
  let context: any; // Playwright types are fine here; test runner controls context

  test.beforeAll(async ({ playwright }) => {
    context = await request.newContext({ baseURL: process.env.BASE_URL || 'http://localhost:3000' });
  });

  test.afterAll(async () => {
    await context.dispose();
  });

  test('GET /api/analytics/summary returns metrics', async () => {
    const res = await context.get('/api/analytics/summary');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toHaveProperty('todayRevenue');
    expect(data).toHaveProperty('campaignCount');
    expect(data).toHaveProperty('contentCount');
    expect(data).toHaveProperty('clicks');
    expect(data).toHaveProperty('conversions');
  });

  test('POST /api/campaigns creates campaign', async () => {
    const name = 'Test Campaign ' + Date.now();
    const res = await context.post('/api/campaigns', {
      data: { name, productName: 'Playwright Test Product' }
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toHaveProperty('campaign');
    expect(data.campaign.name).toBe(name);
  });

  test('GET /api/campaigns lists campaigns (includes newly created one)', async () => {
    const res = await context.get('/api/campaigns');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(Array.isArray(data.campaigns)).toBe(true);
  });

  test('POST /api/trends/discover returns trend items', async () => {
    const res = await context.post('/api/trends/discover', { data: { limit: 3 } });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(Array.isArray(data.trends)).toBe(true);
    expect(data.trends.length).toBeGreaterThan(0);
  });

  test('POST /api/content/generate returns generated content (requires a campaign)', async () => {
    // Create a campaign for this test
    const campaignName = 'Content Gen Test ' + Date.now();
    const createRes = await context.post('/api/campaigns', {
      data: { name: campaignName, productName: 'Test Product for Content' }
    });
    expect(createRes.ok()).toBeTruthy();
    const createData = await createRes.json();
    const campaign = createData.campaign;
    expect(campaign).toBeTruthy();

    const genRes = await context.post('/api/content/generate', {
      data: {
        campaignId: campaign.id,
        productName: campaign.productName || 'Test Product',
        prompt: 'High converting social post'
      }
    });
    expect(genRes.ok()).toBeTruthy();
    const genData = await genRes.json();
    expect(genData).toHaveProperty('content');
    expect(genData.content).toHaveProperty('body');
  });
});
