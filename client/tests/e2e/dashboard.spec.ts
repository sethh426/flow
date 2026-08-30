import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
  });

  test('should display dashboard title', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /dashboard/i });
    await expect(heading).toBeVisible();
  });

  test('should show metrics cards', async ({ page }) => {
    // Wait for dashboard to load
    await page.waitForLoadState('networkidle');
    
    // Check for stat cards using test IDs from DashboardOverview
    const revenueCard = page.getByTestId('stat-card-Total Revenue');
    await expect(revenueCard).toBeVisible();
    
    // Verify card has value
    await expect(page.getByTestId('Total Revenue-value')).toBeVisible();
  });

  test('should navigate to different sections', async ({ page }) => {
    // Test navigation
    await page.click('text=Workflows');
    await expect(page).toHaveURL(/\/workflows/);
    
    await page.goto('/dashboard');
    await page.click('text=Content Studio');
    await expect(page).toHaveURL(/\/content-studio/);
  });
});
