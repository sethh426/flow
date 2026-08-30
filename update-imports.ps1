# Update all import paths in app directory
$appPath = "c:\Users\sethp\Downloads\Affiliate-Flow-Prototype\client\src\app"

Write-Host "Updating import paths in app directory..." -ForegroundColor Cyan

# Get all TypeScript files in app directory
$files = Get-ChildItem -Path $appPath -Filter "*.tsx" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $updated = $false
    
    # Update all component imports
    $replacements = @{
        "@/components/DashboardLayout" = "@/core/layout/DashboardLayout"
        "@/components/DashboardContent" = "@/core/layout/DashboardContent"
        "@/components/DashboardOverview" = "@/core/layout/DashboardOverview"
        "@/components/Header" = "@/core/layout/Header"
        "@/components/Footer" = "@/core/layout/Footer"
        "@/components/AppNavigation" = "@/core/layout/AppNavigation"
        
        "@/components/ContentStudio" = "@/features/content-studio/ContentStudio"
        "@/components/ContentStudioPremium" = "@/features/content-studio/ContentStudioPremium"
        "@/components/ContentScheduler" = "@/features/content-studio/ContentScheduler"
        "@/components/CanvasEditor" = "@/features/content-studio/CanvasEditor"
        "@/components/ImageEditor" = "@/features/content-studio/ImageEditor"
        "@/components/StockPhotoGallery" = "@/features/content-studio/StockPhotoGallery"
        
        "@/components/WorkflowBuilder" = "@/features/workflow/WorkflowBuilder"
        "@/components/FlowChart" = "@/features/workflow/FlowChart"
        "@/components/FlowBot" = "@/features/workflow/FlowBot"
        "@/components/FlowBotDialog" = "@/features/workflow/FlowBotDialog"
        "@/components/FlowAssistant" = "@/features/workflow/FlowAssistant"
        "@/components/FlowAutopilot" = "@/features/workflow/FlowAutopilot"
        "@/components/FlowCoins" = "@/features/workflow/FlowCoins"
        
        "@/components/AnalyticsDashboard" = "@/features/analytics/AnalyticsDashboard"
        "@/components/AnalyticsDashboardPremium" = "@/features/analytics/AnalyticsDashboardPremium"
        "@/components/AdvancedAnalyticsDashboard" = "@/features/analytics/AdvancedAnalyticsDashboard"
        "@/components/ABTestingDashboard" = "@/features/analytics/ABTestingDashboard"
        "@/components/ABTestingPremium" = "@/features/analytics/ABTestingPremium"
        
        "@/components/CampaignManager" = "@/features/campaigns/CampaignManager"
        "@/components/CampaignManagerPremium" = "@/features/campaigns/CampaignManagerPremium"
        
        "@/components/TrendFinder" = "@/features/trends/TrendFinder"
        "@/components/TrendFinderPremium" = "@/features/trends/TrendFinderPremium"
        
        "@/components/ProductCard" = "@/features/products/ProductCard"
        "@/components/ProductList" = "@/features/products/ProductList"
        "@/components/ProductAddForm" = "@/features/products/ProductAddForm"
        "@/components/ProductEditForm" = "@/features/products/ProductEditForm"
        "@/components/ProductsPagePremium" = "@/features/products/ProductsPagePremium"
        
        "@/components/AuthDialog" = "@/features/auth/AuthDialog"
        "@/components/ProtectedRoute" = "@/features/auth/ProtectedRoute"
        
        "@/components/IntegrationHub" = "@/features/integrations/IntegrationHub"
        "@/components/AffiliateConnectionForm" = "@/features/integrations/AffiliateConnectionForm"
        "@/components/SchedulerSheet" = "@/features/integrations/SchedulerSheet"
        "@/components/InstagramScheduler" = "@/features/integrations/InstagramScheduler"
        
        "@/components/ThemeProvider" = "@/core/providers/ThemeProvider"
        "@/components/QueryProvider" = "@/core/providers/QueryProvider"
        "@/components/ToastProvider" = "@/core/providers/ToastProvider"
        "@/components/ErrorBoundary" = "@/core/providers/ErrorBoundary"
        "@/components/SuspenseWrapper" = "@/core/providers/SuspenseWrapper"
        
        "@/components/ThemeToggle" = "@/core/components/ThemeToggle"
        
        "@/components/social-media/" = "@/features/social-media/"
        "@/components/examples/" = "@/core/examples/"
        "@/components/displays/" = "@/core/displays/"
        "@/components/ui/" = "@/core/ui/"
    }
    
    foreach ($old in $replacements.Keys) {
        if ($content -match [regex]::Escape($old)) {
            $content = $content -replace [regex]::Escape($old), $replacements[$old]
            $updated = $true
        }
    }
    
    if ($updated) {
        $content | Set-Content $file.FullName -NoNewline
        Write-Host "  Updated $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "`nImport paths updated!" -ForegroundColor Green
