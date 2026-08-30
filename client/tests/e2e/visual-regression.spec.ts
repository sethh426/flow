import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests
 * Captures screenshots and compares them to detect visual changes
 */

test.describe('Visual Regression', () => {
  
  test('homepage visual snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('dashboard visual snapshot', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Wait for animations
    
    await expect(page).toHaveScreenshot('dashboard.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('campaigns page visual snapshot', async ({ page }) => {
    await page.goto('/dashboard/campaigns');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('campaigns.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('products page visual snapshot', async ({ page }) => {
    await page.goto('/dashboard/products');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('products.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('content studio visual snapshot', async ({ page }) => {
    await page.goto('/dashboard/content-studio');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await expect(page).toHaveScreenshot('content-studio.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('analytics visual snapshot', async ({ page }) => {
    await page.goto('/dashboard/analytics');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for charts to render
    
    await expect(page).toHaveScreenshot('analytics.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('workflows visual snapshot', async ({ page }) => {
    await page.goto('/dashboard/workflows');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await expect(page).toHaveScreenshot('workflows.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('mobile viewport - homepage', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('mobile viewport - dashboard', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('dashboard-mobile.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('tablet viewport - dashboard', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('dashboard-tablet.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });
});
