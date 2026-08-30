# 🎯 Playwright Test Locators Reference

Complete guide to all `data-testid` attributes and accessibility locators in the Affiliate Flow application.

---

## 📋 Quick Reference

### Locator Priority (Best → Fallback):
1. **Role-based**: `page.getByRole('button', { name: 'Save' })`
2. **Label-based**: `page.getByLabel('Email Address')`
3. **Test ID**: `page.getByTestId('submit-btn')`
4. **Text content**: `page.getByText('Click here')`

---

## 🎨 **CampaignManager** (`/campaigns`)

### Actions
| Element | data-testid | aria-label | Usage |
|---------|-------------|------------|-------|
| Create Button | `create-campaign-button` | "Create new campaign" | `page.getByTestId('create-campaign-button')` |
| Status Filter | `campaign-status-filter` | "Filter campaigns by status" | `page.getByTestId('campaign-status-filter')` |
| Sort Dropdown | `campaign-sort-dropdown` | "Sort campaigns" | `page.getByTestId('campaign-sort-dropdown')` |

### Campaign Cards
| Element | data-testid | Pattern | Usage |
|---------|-------------|---------|-------|
| Card Container | `campaign-card-{id}` | Dynamic ID | `page.getByTestId('campaign-card-abc123')` |
| Campaign Name | `campaign-name` | Static | Inside card |
| Campaign Description | `campaign-description` | Static | Inside card |
| Status Chip | `campaign-status-{id}` | Dynamic ID | `page.getByTestId('campaign-status-abc123')` |
| Toggle Button | `toggle-campaign-{id}` | Pause/Activate | `page.getByTestId('toggle-campaign-abc123')` |
| Duplicate Button | `duplicate-campaign-{id}` | Duplicate campaign | `page.getByTestId('duplicate-campaign-abc123')` |
| Edit Button | `edit-campaign-{id}` | Edit campaign {name} | `page.getByTestId('edit-campaign-abc123')` |
| Delete Button | `delete-campaign-{id}` | Delete campaign {name} | `page.getByTestId('delete-campaign-abc123')` |

### Dialog Form
| Element | data-testid | aria-label | Usage |
|---------|-------------|------------|-------|
| Dialog Container | `campaign-dialog` | - | `page.getByTestId('campaign-dialog')` |
| Form Container | `campaign-dialog-form` | - | `page.getByTestId('campaign-dialog-form')` |
| Name Input | `campaign-name-input` | "Campaign name" | `page.getByTestId('campaign-name-input')` |
| Description Input | `campaign-description-input` | "Campaign description" | `page.getByTestId('campaign-description-input')` |
| Category Select | `campaign-category-select` | "Campaign category" | `page.getByTestId('campaign-category-select')` |
| Network Select | `campaign-network-select` | "Affiliate network" | `page.getByTestId('campaign-network-select')` |
| Cancel Button | `cancel-campaign-button` | - | `page.getByTestId('cancel-campaign-button')` |
| Save Button | `save-campaign-button` | Update/Create campaign | `page.getByTestId('save-campaign-button')` |

### Example Test:
```typescript
// Create new campaign
await page.getByTestId('create-campaign-button').click();
await page.getByTestId('campaign-name-input').fill('Summer Sale');
await page.getByTestId('campaign-category-select').selectOption('fashion');
await page.getByTestId('save-campaign-button').click();

// Verify campaign appears
await expect(page.getByTestId('campaign-card-summer-sale')).toBeVisible();
await expect(page.getByTestId('campaign-name')).toHaveText('Summer Sale');

// Edit campaign
await page.getByTestId('edit-campaign-summer-sale').click();
await page.getByTestId('campaign-description-input').fill('Updated description');
await page.getByTestId('save-campaign-button').click();
```

---

## 📦 **ProductAddForm** (`/products/add`)

### Image Upload Section
| Element | data-testid | aria-label | Usage |
|---------|-------------|------------|-------|
| Image Preview | `product-image-preview` | - | `page.getByTestId('product-image-preview')` |
| File Input | `product-image-file-input` | "Upload product image file" | `page.getByTestId('product-image-file-input')` |
| Upload Button | `upload-image-button` | "Upload product image" | `page.getByTestId('upload-image-button')` |
| Generate Button | `generate-from-image-button` | "Generate product details from image" | `page.getByTestId('generate-from-image-button')` |
| Error Alert | `generation-error-alert` | - | `page.getByTestId('generation-error-alert')` |

### Form Fields
| Element | data-testid | aria-label | Usage |
|---------|-------------|------------|-------|
| Name Input | `product-name-input` | "Product name" | `page.getByTestId('product-name-input')` |
| Name Error | `product-name-error` | - | `page.getByTestId('product-name-error')` |
| Description Textarea | `product-description-input` | "Product description" | `page.getByTestId('product-description-input')` |
| Description Error | `product-description-error` | - | `page.getByTestId('product-description-error')` |
| Image URL Input | `product-image-url-input` | "Product image URL" | `page.getByTestId('product-image-url-input')` |
| Image URL Error | `product-image-url-error` | - | `page.getByTestId('product-image-url-error')` |
| Affiliate URL Input | `product-affiliate-url-input` | "Affiliate link URL" | `page.getByTestId('product-affiliate-url-input')` |
| Affiliate URL Error | `product-affiliate-url-error` | - | `page.getByTestId('product-affiliate-url-error')` |
| Item Number Input | `product-item-number-input` | "Product item number" | `page.getByTestId('product-item-number-input')` |
| Status Select | `product-status-select` | "Product status" | `page.getByTestId('product-status-select')` |

### Actions
| Element | data-testid | aria-label | Usage |
|---------|-------------|------------|-------|
| Cancel Button | `cancel-product-button` | "Cancel and return to products" | `page.getByTestId('cancel-product-button')` |
| Submit Button | `submit-product-button` | "Save product" | `page.getByTestId('submit-product-button')` |

### Example Test:
```typescript
// Upload image and generate
await page.getByTestId('upload-image-button').click();
await page.getByTestId('product-image-file-input').setInputFiles('product.jpg');
await expect(page.getByTestId('product-image-preview')).toBeVisible();
await page.getByTestId('generate-from-image-button').click();

// Wait for AI generation
await expect(page.getByTestId('generate-from-image-button')).toBeDisabled();
await page.waitForSelector('[data-testid="generate-from-image-button"]:not([disabled])');

// Fill remaining fields
await page.getByTestId('product-affiliate-url-input').fill('https://example.com/product');
await page.getByTestId('product-status-select').selectOption('approved_for_posting');

// Submit
await page.getByTestId('submit-product-button').click();
await expect(page).toHaveURL('/products');
```

---

## 📊 **DashboardOverview** (`/dashboard`)

### StatCard Component
Each StatCard generates test IDs based on its title (lowercased, spaces→hyphens):

| Element | data-testid Pattern | Usage |
|---------|---------------------|-------|
| Card Container | `stat-card-{title}` | `page.getByTestId('stat-card-total-revenue')` |
| Header Box | `{title}-header` | `page.getByTestId('total-revenue-header')` |
| Icon Avatar | `{title}-icon` | `page.getByTestId('total-revenue-icon')` |
| Menu Button | `{title}-menu-button` | `page.getByTestId('total-revenue-menu-button')` |
| Value Typography | `{title}-value` | `page.getByTestId('total-revenue-value')` |
| Label Typography | `{title}-label` | `page.getByTestId('total-revenue-label')` |
| Change Indicator | `{title}-change-indicator` | `page.getByTestId('total-revenue-change-indicator')` |
| Progress Bar | `{title}-progress` | `page.getByTestId('total-revenue-progress')` |

### StatCard Instances (Default):
1. **Total Revenue**: `stat-card-total-revenue`
2. **Active Campaigns**: `stat-card-active-campaigns`
3. **Total Products**: `stat-card-total-products`
4. **Conversions**: `stat-card-conversions`

### Activity Section
| Element | data-testid | aria-label | Usage |
|---------|-------------|------------|-------|
| Activity Item | `activity-item-{index}` | "Activity: {title}" | `page.getByTestId('activity-item-0')` |
| Activity Title | `activity-title` | - | Inside activity item |
| Activity Description | `activity-description` | - | Inside activity item |
| Activity Time | `activity-time` | - | Inside activity item |
| Back to Stats Button | `back-to-stats-button` | "Back to statistics" | `page.getByTestId('back-to-stats-button')` |
| View Performers Button | `view-top-performers-button` | "View top performers" | `page.getByTestId('view-top-performers-button')` |

### Top Performers Section
| Element | data-testid | aria-label | Usage |
|---------|-------------|------------|-------|
| Performer Item | `top-performer-{index}` | "Top performer {n}: {name}" | `page.getByTestId('top-performer-0')` |
| Performer Name | `performer-name` | - | Inside performer item |

### Example Test:
```typescript
// Verify stat cards
await expect(page.getByTestId('stat-card-total-revenue')).toBeVisible();
await expect(page.getByTestId('total-revenue-value')).toHaveText(/\$[\d,]+/);
await expect(page.getByTestId('total-revenue-change-indicator')).toContainText('%');

// Check progress
const progress = await page.getByTestId('total-revenue-progress').getAttribute('aria-valuenow');
expect(Number(progress)).toBeGreaterThan(0);

// Navigate to activities
await page.getByTestId('view-top-performers-button').click();
await expect(page.getByTestId('top-performer-0')).toBeVisible();

// Click activity item
await page.getByTestId('activity-item-0').click();
await expect(page.getByTestId('activity-title')).toBeVisible();
```

---

## 🎨 **ContentStudio** (`/content-studio`)

### Template Selection
| Element | data-testid | aria-label | Usage |
|---------|-------------|------------|-------|
| Template Card | `template-{id}` | "Select {name} template" | `page.getByTestId('template-instagram-post')` |

### Preview Controls
| Element | data-testid | aria-label | Usage |
|---------|-------------|------------|-------|
| Canvas Editor Button | `canvas-editor-button` | "Edit in canvas editor" | `page.getByTestId('canvas-editor-button')` |
| Refresh Button | `refresh-preview-button` | "Refresh preview" | `page.getByTestId('refresh-preview-button')` |
| Fullscreen Button | `fullscreen-preview-button` | "View full screen" | `page.getByTestId('fullscreen-preview-button')` |

### Tab Navigation
| Element | data-testid | aria-label | Usage |
|---------|-------------|------------|-------|
| Tabs Container | `content-studio-tabs` | "Content studio navigation tabs" | `page.getByTestId('content-studio-tabs')` |
| Content Tab | `content-tab` | - | `page.getByTestId('content-tab')` |

### Formatting Toolbar
| Element | data-testid | aria-label | aria-pressed |
|---------|-------------|------------|--------------|
| Bold Button | `format-bold-button` | "Toggle bold text" | true/false |
| Align Left Button | `align-left-button` | "Align text left" | true/false |
| Align Center Button | `align-center-button` | "Align text center" | true/false |

### Header Actions
| Element | data-testid | aria-label | Usage |
|---------|-------------|------------|-------|
| Pro Tools Button | `pro-tools-button` | "Open professional tools" | `page.getByTestId('pro-tools-button')` |
| Brand Kit Button | `brand-kit-button` | "Open brand kit" | `page.getByTestId('brand-kit-button')` |

### AI Enhancement Buttons
| Element | data-testid | aria-label | Usage |
|---------|-------------|------------|-------|
| Auto-Enhance Image | `auto-enhance-image-button` | "Auto-enhance image" | `page.getByTestId('auto-enhance-image-button')` |
| Professional Typography | `professional-typography-button` | "Apply professional typography" | `page.getByTestId('professional-typography-button')` |
| Apply Gradient | `apply-gradient-button` | "Apply gradient background" | `page.getByTestId('apply-gradient-button')` |
| Add Animation | `add-animation-button` | "Add animation" | `page.getByTestId('add-animation-button')` |

### Example Test:
```typescript
// Select template
await page.getByTestId('template-instagram-post').click();
await expect(page.getByTestId('template-instagram-post')).toHaveAttribute('aria-pressed', 'true');

// Switch to Content tab
await page.getByTestId('content-tab').click();

// Format text
await page.getByTestId('format-bold-button').click();
await expect(page.getByTestId('format-bold-button')).toHaveAttribute('aria-pressed', 'true');

await page.getByTestId('align-center-button').click();
await expect(page.getByTestId('align-center-button')).toHaveAttribute('aria-pressed', 'true');

// Open canvas editor
await page.getByTestId('canvas-editor-button').click();

// Apply AI enhancements
await page.getByTestId('auto-enhance-image-button').click();
await page.getByTestId('apply-gradient-button').click();
```

---

## 🧭 **Navigation** (All Pages)

### DashboardLayout Components
Already well-labeled with aria-labels:

```typescript
// Use role-based locators (preferred)
await page.getByRole('button', { name: 'Open navigation menu' }).click();
await page.getByRole('button', { name: 'View notifications' }).click();
await page.getByRole('button', { name: 'User profile menu' }).click();

// Navigation links
await page.getByRole('link', { name: 'Navigate to Dashboard' }).click();
await page.getByRole('link', { name: 'Navigate to Campaigns' }).click();
await page.getByRole('link', { name: 'Navigate to Products' }).click();

// Mobile navigation
await page.getByLabel('Go to Dashboard').click();
await page.getByLabel('Go to Campaigns').click();
await page.getByLabel('Go to AI Tools').click();
await page.getByLabel('Go to Analytics').click();
```

---

## 🎯 **Best Practices**

### 1. Use Role-Based Locators When Possible
```typescript
// ✅ BEST - Semantic, resilient
await page.getByRole('button', { name: 'Save campaign' }).click();

// 🟡 OK - Fallback for dynamic content
await page.getByTestId('save-campaign-button').click();

// ❌ AVOID - Brittle
await page.locator('.MuiButton-root').nth(3).click();
```

### 2. Combine Locators for Specificity
```typescript
// Find button within a specific campaign card
const campaignCard = page.getByTestId('campaign-card-abc123');
await campaignCard.getByTestId('edit-campaign-abc123').click();

// Or use role within test ID
await page.getByTestId('campaign-dialog').getByRole('button', { name: /save/i }).click();
```

---

## 🤖 **FlowBot** (AI Assistant)

### Main FAB Button
| Element | data-testid | aria-label | Usage |
|---------|-------------|------------|-------|
| FAB Button | `flowbot-fab-button` | "Open FlowBot AI assistant" | `page.getByTestId('flowbot-fab-button')` |

### Chat Panel
| Element | data-testid | aria-label | Usage |
|---------|-------------|------------|-------|
| Chat Panel | `flowbot-chat-panel` | - | `page.getByTestId('flowbot-chat-panel')` |
| Close Button | `flowbot-close-button` | "Close FlowBot" | `page.getByTestId('flowbot-close-button')` |
| Message Input | `flowbot-message-input` | "Type your message to FlowBot" | `page.getByTestId('flowbot-message-input')` |
| Send Button | `flowbot-send-button` | "Send message" | `page.getByTestId('flowbot-send-button')` |
| Messages Container | `flowbot-messages-container` | - | `page.getByTestId('flowbot-messages-container')` |

### Navigation Menu
| Element | data-testid | Usage |
|---------|-------------|-------|
| Nav Menu Container | `flowbot-nav-menu` | `page.getByTestId('flowbot-nav-menu')` |
| Nav Item (Dynamic) | `flowbot-nav-{href}` | `page.getByTestId('flowbot-nav-flow-finder')` |
| Nav Label | `flowbot-nav-label-{href}` | `page.getByTestId('flowbot-nav-label-workflows')` |

### States
- **Loading**: `aria-busy="true"` on send button
- **Disabled**: Input disabled while thinking
- **Message Roles**: User messages vs model responses distinguished by role attribute

### Example Test:
```typescript
// Open FlowBot
await page.getByTestId('flowbot-fab-button').click();
await expect(page.getByTestId('flowbot-chat-panel')).toBeVisible();

// Send message
await page.getByTestId('flowbot-message-input').fill('Help me create a campaign');
await page.getByTestId('flowbot-send-button').click();

// Wait for response
await expect(page.getByTestId('flowbot-send-button')).toHaveAttribute('aria-busy', 'true');
await expect(page.getByTestId('flowbot-send-button')).toHaveAttribute('aria-busy', 'false');

// Navigate using FlowBot menu
await page.getByTestId('flowbot-nav-workflows').click();
await expect(page).toHaveURL(/\/workflows/);

// Close FlowBot
await page.getByTestId('flowbot-close-button').click();
await expect(page.getByTestId('flowbot-chat-panel')).not.toBeVisible();
```

---

## 🧪 **Best Practices**

### 3. Use Assertions with aria-labels
```typescript
// Verify state using aria attributes
await expect(page.getByTestId('format-bold-button')).toHaveAttribute('aria-pressed', 'true');
await expect(page.getByTestId('generate-from-image-button')).toHaveAttribute('aria-busy', 'true');
```

### 4. Dynamic ID Patterns
```typescript
// Campaign cards use actual IDs from database
const campaignId = 'summer-sale-2025';
await page.getByTestId(`campaign-card-${campaignId}`).click();
await page.getByTestId(`edit-campaign-${campaignId}`).click();

// StatCards use title-based IDs
const statTitle = 'Total Revenue';
const testId = statTitle.toLowerCase().replace(/\s+/g, '-');
await expect(page.getByTestId(`stat-card-${testId}-value`)).toBeVisible();
```

### 5. Wait for State Changes
```typescript
// Wait for disabled→enabled
await page.getByTestId('generate-from-image-button').click();
await expect(page.getByTestId('generate-from-image-button')).toBeDisabled();
await page.waitForSelector('[data-testid="generate-from-image-button"]:not([disabled])');

// Wait for aria-busy
await expect(page.getByTestId('submit-product-button')).toHaveAttribute('aria-busy', 'false');
```

---

## 📚 **Related Documentation**

- [PLAYWRIGHT_TESTING_GUIDE.md](./PLAYWRIGHT_TESTING_GUIDE.md) - Complete testing guide
- [PLAYWRIGHT_QUICK_REF.md](./PLAYWRIGHT_QUICK_REF.md) - Quick reference card
- [PLAYWRIGHT_CODE_ANALYSIS.md](./PLAYWRIGHT_CODE_ANALYSIS.md) - Code testability analysis

---

**Last Updated**: After implementing comprehensive test IDs across all major components  
**Coverage**: CampaignManager, ProductAddForm, DashboardOverview, ContentStudio, Navigation
