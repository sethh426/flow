import { test, expect } from '@playwright/test';

test.describe('Content Studio', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/content-studio');
  });

  test('should load content studio', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Use test ID for content studio tabs
    await expect(page.getByTestId('content-studio-tabs')).toBeVisible();
    await expect(page.getByTestId('content-tab')).toBeVisible();
  });

  test('should have canvas editor', async ({ page }) => {
    // Look for canvas editor button using test ID
    const canvasEditor = page.getByTestId('canvas-editor-button');
    await expect(canvasEditor).toBeVisible();
  });

  test('should allow text input', async ({ page }) => {
    // Find text input field
    const textInput = page.locator('input[type="text"], textarea').first();
    
    if (await textInput.isVisible()) {
      await textInput.fill('Test content');
      await expect(textInput).toHaveValue('Test content');
    }
  });

  test('should have toolbar controls', async ({ page }) => {
    // Check for toolbar elements using test IDs
    await expect(page.getByTestId('format-bold-button')).toBeVisible();
    await expect(page.getByTestId('align-center-button')).toBeVisible();
    await expect(page.getByTestId('auto-enhance-image-button')).toBeVisible();
  });
});
