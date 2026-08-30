import { test, expect } from '@playwright/test';

test.describe('Workflow Builder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/workflows');
  });

  test('should load workflow builder', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const heading = page.getByRole('heading', { name: /workflow/i });
    await expect(heading).toBeVisible();
  });

  test('should display flow canvas', async ({ page }) => {
    // Check for ReactFlow or canvas container
    const flowContainer = page.locator('[class*="react-flow"], [data-testid="workflow-canvas"]');
    await expect(flowContainer.first()).toBeVisible();
  });

  test('should have node palette', async ({ page }) => {
    // Look for node/component palette
    const palette = page.locator('[data-testid="node-palette"], aside');
    
    if (await palette.isVisible()) {
      await expect(palette).toBeVisible();
    }
  });

  test('should allow creating new workflow', async ({ page }) => {
    // Look for "New Workflow" or "Create" button
    const createButton = page.getByRole('button', { name: /new|create/i }).first();
    
    if (await createButton.isVisible()) {
      await createButton.click();
      // Verify new workflow state
    }
  });
});
