import { expect, test } from '@playwright/test';

test.describe('Phase zero product coherence', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(120_000);

  test('opens the canonical creator with explicit preview status', async ({ page }) => {
    await page.goto('/content-studio');

    await expect(page.getByRole('heading', { name: 'Campaign Creator', exact: true }).last()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('creator-preview-notice')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('content-studio-tabs')).toBeVisible();

    const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(documentWidth).toBeLessThanOrEqual(viewportWidth + 1);
  });

  test('labels video templates as framing previews', async ({ page }) => {
    await page.goto('/content-studio');
    await page.getByTestId('template-tiktok-video').click();

    await expect(page.getByTestId('video-framing-notice')).toContainText(
      'storyboard, timeline, captions, audio, and MP4 renderer',
    );
  });

  test('loads an honest empty campaign state instead of waiting forever without Firebase auth', async ({ page }) => {
    await page.goto('/campaigns');

    await expect(page.getByTestId('campaign-preview-notice')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Campaign Manager' })).toBeVisible();
    await expect(page.getByTestId('campaigns-loading-skeleton')).toHaveCount(0);
    await expect(page.getByText('No campaigns yet')).toBeVisible();
  });

  test('keeps the legacy dashboard creator route on the same editor', async ({ page }) => {
    await page.goto('/dashboard/content-studio');

    await expect(page.getByTestId('creator-preview-notice')).toBeVisible();
    await expect(page.getByTestId('content-studio-tabs')).toBeVisible();
  });
});
