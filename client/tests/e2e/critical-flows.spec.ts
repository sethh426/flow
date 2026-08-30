import { test, expect } from '@playwright/test';

/**
 * Critical User Flows - End-to-End Tests
 * Tests the most important user journeys through the application
 */

test.describe('Critical User Flows', () => {
  
  // ============================================
  // Flow 1: New User Onboarding
  // ============================================
  test('complete new user onboarding flow', async ({ page }) => {
    await page.goto('/');
    
    // Click Get Started
    await page.click('text=Get Started');
    
    // Should redirect to onboarding or dashboard
    await expect(page).toHaveURL(/\/(onboarding|dashboard)/);
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/onboarding-flow.png' });
  });

  // ============================================
  // Flow 2: Create Campaign
  // ============================================
  test('create new campaign', async ({ page }) => {
    await page.goto('/dashboard/campaigns');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Click new campaign button using test ID
    const newCampaignBtn = page.getByTestId('create-campaign-button');
    if (await newCampaignBtn.isVisible()) {
      await newCampaignBtn.click();
      
      // Verify modal appears using test ID
      await expect(page.getByTestId('campaign-dialog')).toBeVisible();
      
      // Verify form fields are present
      await expect(page.getByTestId('campaign-name-input')).toBeVisible();
      await expect(page.getByTestId('campaign-description-input')).toBeVisible();
      
      // Take screenshot
      await page.screenshot({ path: 'test-results/create-campaign.png' });
    }
  });

  // ============================================
  // Flow 3: Add Product
  // ============================================
  test('add new product', async ({ page }) => {
    await page.goto('/dashboard/products');
    
    await page.waitForLoadState('networkidle');
    
    // Look for add product button using text (ProductAddForm is the form itself)
    const addProductBtn = page.locator('button:has-text("Add Product"), button:has-text("New Product")').first();
    if (await addProductBtn.isVisible()) {
      await addProductBtn.click();
      
      // Verify form appears with test IDs
      await expect(page.getByTestId('product-name-input')).toBeVisible();
      await expect(page.getByTestId('product-description-input')).toBeVisible();
      await expect(page.getByTestId('upload-image-button')).toBeVisible();
      
      await page.screenshot({ path: 'test-results/add-product.png' });
    }
  });

  // ============================================
  // Flow 4: Navigate All Dashboard Tabs
  // ============================================
  test('navigate through all dashboard sections', async ({ page }) => {
    await page.goto('/dashboard');
    
    const sections = [
      '/dashboard/campaigns',
      '/dashboard/products',
      '/dashboard/trends',
      '/dashboard/content-studio',
      '/dashboard/analytics',
      '/dashboard/workflows'
    ];
    
    for (const section of sections) {
      await page.goto(section);
      await page.waitForLoadState('networkidle');
      
      // Verify no error page
      await expect(page.locator('text=Error')).not.toBeVisible();
      await expect(page.locator('text=404')).not.toBeVisible();
      
      // Take screenshot
      const sectionName = section.split('/').pop();
      await page.screenshot({ path: `test-results/${sectionName}-section.png` });
    }
  });

  // ============================================
  // Flow 5: Content Studio Workflow
  // ============================================
  // ============================================
  // Flow 5: Content Studio Workflow
  // ============================================
  test('use content studio to create content', async ({ page }) => {
    await page.goto('/dashboard/content-studio');
    
    await page.waitForLoadState('networkidle');
    
    // Wait for content studio to load using test IDs
    await page.waitForSelector('[data-testid="content-studio-tabs"]', { timeout: 10000 });
    
    // Verify key elements are present using test IDs
    await expect(page.getByTestId('content-studio-tabs')).toBeVisible();
    await expect(page.getByTestId('content-tab')).toBeVisible();
    
    // Check for formatting toolbar
    const hasFormatBold = await page.getByTestId('format-bold-button').isVisible();
    expect(hasFormatBold).toBeTruthy();
    
    await page.screenshot({ path: 'test-results/content-studio.png' });
  });

  // ============================================
  // Flow 6: FlowBot Interaction
  // ============================================
  test('interact with FlowBot assistant', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Look for FlowBot button (FAB)
    const flowbotBtn = page.locator('[aria-label*="FlowBot"], [data-testid="flowbot-button"]').first();
    
    // Wait a bit for FlowBot to render
    await page.waitForTimeout(2000);
    
    if (await flowbotBtn.isVisible()) {
      await flowbotBtn.click();
      
      // Verify chat interface appears
      await expect(page.locator('[data-testid="flowbot-chat"], [role="dialog"]').first()).toBeVisible({ timeout: 5000 });
      
      await page.screenshot({ path: 'test-results/flowbot-open.png' });
    }
  });

  // ============================================
  // Flow 7: Trend Discovery
  // ============================================
  test('discover trends', async ({ page }) => {
    await page.goto('/dashboard/trends');
    
    await page.waitForLoadState('networkidle');
    
    // Look for search or discover button
    const searchInput = page.locator('input[placeholder*="trend"], input[placeholder*="search"]').first();
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('viral products');
      await searchInput.press('Enter');
      
      // Wait for results
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: 'test-results/trend-search.png' });
    }
  });

  // ============================================
  // Flow 8: Analytics Dashboard
  // ============================================
  test('view analytics dashboard', async ({ page }) => {
    await page.goto('/dashboard/analytics');
    
    await page.waitForLoadState('networkidle');
    
    // Wait for charts to render
    await page.waitForTimeout(2000);
    
    // Check for chart elements (SVG, Canvas, or Chart containers)
    const hasCharts = await page.locator('svg, canvas, [class*="chart"]').count() > 0;
    
    expect(hasCharts).toBeTruthy();
    
    await page.screenshot({ path: 'test-results/analytics-dashboard.png', fullPage: true });
  });

  // ============================================
  // Flow 9: Quick Actions
  // ============================================
  test('use quick action buttons', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.waitForLoadState('networkidle');
    
    // Click "AI Content" quick action
    const aiContentBtn = page.locator('button:has-text("AI Content")').first();
    
    if (await aiContentBtn.isVisible()) {
      await aiContentBtn.click();
      
      // Should navigate to content studio
      await expect(page).toHaveURL(/\/content-studio/);
      
      await page.screenshot({ path: 'test-results/quick-action-ai-content.png' });
    }
  });

  // ============================================
  // Flow 10: Workflow Builder
  // ============================================
  test('access workflow builder', async ({ page }) => {
    await page.goto('/dashboard/workflows');
    
    await page.waitForLoadState('networkidle');
    
    // Wait for workflow canvas/builder to load
    await page.waitForTimeout(2000);
    
    // Check for workflow nodes or builder elements
    const hasWorkflowUI = await page.locator('[class*="react-flow"], canvas, svg').count() > 0;
    
    expect(hasWorkflowUI).toBeTruthy();
    
    await page.screenshot({ path: 'test-results/workflow-builder.png', fullPage: true });
  });
});
