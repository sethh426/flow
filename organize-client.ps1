# Client Code Organization Script
Write-Host "Organizing client/src into feature-based structure..." -ForegroundColor Cyan

$srcPath = "c:\Users\sethp\Downloads\Affiliate-Flow-Prototype\client\src"

# Create feature-based directory structure
Write-Host "`nCreating feature directories..." -ForegroundColor Yellow
$features = @(
    "features/content-studio",
    "features/workflow",
    "features/analytics",
    "features/campaigns",
    "features/trends",
    "features/products",
    "features/auth",
    "features/integrations",
    "features/social-media",
    "core/components",
    "core/layout",
    "core/providers"
)

foreach ($feature in $features) {
    $fullPath = Join-Path $srcPath $feature
    New-Item -ItemType Directory -Force -Path $fullPath | Out-Null
    Write-Host "  Created $feature" -ForegroundColor Green
}

# Move components to features
Write-Host "`nOrganizing components into features..." -ForegroundColor Yellow

# Content Studio feature
$contentStudioFiles = @(
    "ContentStudio.tsx",
    "ContentStudioPremium.tsx",
    "ContentScheduler.tsx",
    "CanvasEditor.tsx",
    "ImageEditor.tsx",
    "StockPhotoGallery.tsx",
    "BrandedEmojiPicker.tsx"
)
foreach ($file in $contentStudioFiles) {
    $src = Join-Path "$srcPath\components" $file
    if (Test-Path $src) {
        Move-Item -Path $src -Destination "$srcPath\features\content-studio\" -Force
        Write-Host "  Moved $file to content-studio" -ForegroundColor Green
    }
}

# Workflow feature
$workflowFiles = @(
    "WorkflowBuilder.tsx",
    "FlowChart.tsx",
    "NodeConfigPanel.tsx",
    "FlowBot.tsx",
    "FlowBotDialog.tsx",
    "FlowBotEnhanced.tsx",
    "FlowAssistant.tsx",
    "FlowAutopilot.tsx",
    "FlowCoins.tsx"
)
foreach ($file in $workflowFiles) {
    $src = Join-Path "$srcPath\components" $file
    if (Test-Path $src) {
        Move-Item -Path $src -Destination "$srcPath\features\workflow\" -Force
        Write-Host "  Moved $file to workflow" -ForegroundColor Green
    }
}

# Analytics feature
$analyticsFiles = @(
    "Analytics.tsx",
    "AnalyticsDashboard.tsx",
    "AnalyticsDashboardPremium.tsx",
    "AdvancedAnalyticsDashboard.tsx",
    "ABTestingDashboard.tsx",
    "ABTestingPremium.tsx",
    "UsageChart.tsx",
    "CategoryBreakdown.tsx",
    "StatCard.tsx",
    "StatsDisplay.tsx",
    "ProductStatusChart.tsx"
)
foreach ($file in $analyticsFiles) {
    $src = Join-Path "$srcPath\components" $file
    if (Test-Path $src) {
        Move-Item -Path $src -Destination "$srcPath\features\analytics\" -Force
        Write-Host "  Moved $file to analytics" -ForegroundColor Green
    }
}

# Campaign feature
$campaignFiles = @(
    "CampaignManager.tsx",
    "CampaignManagerPremium.tsx"
)
foreach ($file in $campaignFiles) {
    $src = Join-Path "$srcPath\components" $file
    if (Test-Path $src) {
        Move-Item -Path $src -Destination "$srcPath\features\campaigns\" -Force
        Write-Host "  Moved $file to campaigns" -ForegroundColor Green
    }
}

# Trends feature
$trendFiles = @(
    "TrendFinder.tsx",
    "TrendFinderPremium.tsx"
)
foreach ($file in $trendFiles) {
    $src = Join-Path "$srcPath\components" $file
    if (Test-Path $src) {
        Move-Item -Path $src -Destination "$srcPath\features\trends\" -Force
        Write-Host "  Moved $file to trends" -ForegroundColor Green
    }
}

# Products feature
$productFiles = @(
    "ProductCard.tsx",
    "ProductList.tsx",
    "ProductAddForm.tsx",
    "ProductEditForm.tsx",
    "ProductsPagePremium.tsx"
)
foreach ($file in $productFiles) {
    $src = Join-Path "$srcPath\components" $file
    if (Test-Path $src) {
        Move-Item -Path $src -Destination "$srcPath\features\products\" -Force
        Write-Host "  Moved $file to products" -ForegroundColor Green
    }
}

# Auth feature
$authFiles = @(
    "AuthDialog.tsx",
    "ProtectedRoute.tsx"
)
foreach ($file in $authFiles) {
    $src = Join-Path "$srcPath\components" $file
    if (Test-Path $src) {
        Move-Item -Path $src -Destination "$srcPath\features\auth\" -Force
        Write-Host "  Moved $file to auth" -ForegroundColor Green
    }
}

# Integrations feature
$integrationFiles = @(
    "IntegrationHub.tsx",
    "AffiliateConnectionForm.tsx",
    "SchedulerSheet.tsx",
    "InstagramScheduler.tsx"
)
foreach ($file in $integrationFiles) {
    $src = Join-Path "$srcPath\components" $file
    if (Test-Path $src) {
        Move-Item -Path $src -Destination "$srcPath\features\integrations\" -Force
        Write-Host "  Moved $file to integrations" -ForegroundColor Green
    }
}

# Move social-media folder
if (Test-Path "$srcPath\components\social-media") {
    Move-Item -Path "$srcPath\components\social-media\*" -Destination "$srcPath\features\social-media\" -Force -ErrorAction SilentlyContinue
    Remove-Item -Path "$srcPath\components\social-media" -Force -ErrorAction SilentlyContinue
    Write-Host "  Moved social-media folder" -ForegroundColor Green
}

# Core layout components
$layoutFiles = @(
    "Header.tsx",
    "Footer.tsx",
    "DashboardLayout.tsx",
    "DashboardContent.tsx",
    "DashboardOverview.tsx",
    "AppNavigation.tsx"
)
foreach ($file in $layoutFiles) {
    $src = Join-Path "$srcPath\components" $file
    if (Test-Path $src) {
        Move-Item -Path $src -Destination "$srcPath\core\layout\" -Force
        Write-Host "  Moved $file to core/layout" -ForegroundColor Green
    }
}

# Core providers
$providerFiles = @(
    "ThemeProvider.tsx",
    "QueryProvider.tsx",
    "ToastProvider.tsx",
    "ErrorBoundary.tsx",
    "SuspenseWrapper.tsx"
)
foreach ($file in $providerFiles) {
    $src = Join-Path "$srcPath\components" $file
    if (Test-Path $src) {
        Move-Item -Path $src -Destination "$srcPath\core\providers\" -Force
        Write-Host "  Moved $file to core/providers" -ForegroundColor Green
    }
}

# Core components (shared)
$coreFiles = @(
    "ThemeToggle.tsx"
)
foreach ($file in $coreFiles) {
    $src = Join-Path "$srcPath\components" $file
    if (Test-Path $src) {
        Move-Item -Path $src -Destination "$srcPath\core\components\" -Force
        Write-Host "  Moved $file to core/components" -ForegroundColor Green
    }
}

# Move ui and displays folders
if (Test-Path "$srcPath\components\ui") {
    Move-Item -Path "$srcPath\components\ui" -Destination "$srcPath\core\" -Force
    Write-Host "  Moved ui folder to core" -ForegroundColor Green
}

if (Test-Path "$srcPath\components\displays") {
    Move-Item -Path "$srcPath\components\displays" -Destination "$srcPath\core\" -Force
    Write-Host "  Moved displays folder to core" -ForegroundColor Green
}

if (Test-Path "$srcPath\components\examples") {
    Move-Item -Path "$srcPath\components\examples" -Destination "$srcPath\core\" -Force
    Write-Host "  Moved examples folder to core" -ForegroundColor Green
}

# Create index files for easy imports
Write-Host "`nCreating barrel exports..." -ForegroundColor Yellow

# Content Studio index
@"
export { default as ContentStudio } from './ContentStudio';
export { default as ContentStudioPremium } from './ContentStudioPremium';
export { default as CanvasEditor } from './CanvasEditor';
export { default as ImageEditor } from './ImageEditor';
export { default as StockPhotoGallery } from './StockPhotoGallery';
"@ | Out-File -FilePath "$srcPath\features\content-studio\index.ts" -Encoding UTF8

# Workflow index
@"
export { default as WorkflowBuilder } from './WorkflowBuilder';
export { default as FlowChart } from './FlowChart';
export { default as FlowBot } from './FlowBot';
export { default as FlowAssistant } from './FlowAssistant';
"@ | Out-File -FilePath "$srcPath\features\workflow\index.ts" -Encoding UTF8

# Analytics index
@"
export { default as AnalyticsDashboard } from './AnalyticsDashboard';
export { default as AnalyticsDashboardPremium } from './AnalyticsDashboardPremium';
export { default as AdvancedAnalyticsDashboard } from './AdvancedAnalyticsDashboard';
"@ | Out-File -FilePath "$srcPath\features\analytics\index.ts" -Encoding UTF8

Write-Host "  Created barrel export files" -ForegroundColor Green

Write-Host "`nClient organization complete!" -ForegroundColor Green
Write-Host "Next: Update imports in app/ directory" -ForegroundColor Yellow
