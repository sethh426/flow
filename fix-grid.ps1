# Fix MUI Grid v7 Syntax - Automated Script
# This script updates all Grid components from v5 syntax to v7 syntax

Write-Host "🔧 Starting MUI Grid v7 Automated Fix..." -ForegroundColor Cyan
Write-Host ""

$files = @(
    "client\src\app\social-media\page.tsx",
    "client\src\components\social-media\AutoMessenger.tsx",
    "client\src\components\social-media\SmartEngagement.tsx",
    "client\src\components\social-media\Analytics.tsx",
    "client\src\components\social-media\AutoFollow.tsx"
)

$totalReplacements = 0

foreach ($file in $files) {
    $filePath = Join-Path $PSScriptRoot $file
    
    if (Test-Path $filePath) {
        Write-Host "📝 Processing: $file" -ForegroundColor Yellow
        
        $content = Get-Content $filePath -Raw
        $originalContent = $content
        
        # Pattern 1: <Grid item xs={12}> → <Grid size={{ xs: 12 }}>
        $content = $content -replace '<Grid\s+item\s+xs=\{(\d+)\}>', '<Grid size={{ xs: $1 }}>'
        
        # Pattern 2: <Grid item xs={12} md={6}> → <Grid size={{ xs: 12, md: 6 }}>
        $content = $content -replace '<Grid\s+item\s+xs=\{(\d+)\}\s+md=\{(\d+)\}>', '<Grid size={{ xs: $1, md: $2 }}>'
        
        # Pattern 3: <Grid item xs={12} sm={6} md={4}> → <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        $content = $content -replace '<Grid\s+item\s+xs=\{(\d+)\}\s+sm=\{(\d+)\}\s+md=\{(\d+)\}>', '<Grid size={{ xs: $1, sm: $2, md: $3 }}>'
        
        # Pattern 4: <Grid item xs={12} sm={6} md={4} lg={2}> → <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
        $content = $content -replace '<Grid\s+item\s+xs=\{(\d+)\}\s+sm=\{(\d+)\}\s+md=\{(\d+)\}\s+lg=\{(\d+)\}>', '<Grid size={{ xs: $1, sm: $2, md: $3, lg: $4 }}>'
        
        # Pattern 5: <Grid item xs={12} md={6} key={...}> → <Grid size={{ xs: 12, md: 6 }} key={...}>
        $content = $content -replace '<Grid\s+item\s+xs=\{(\d+)\}\s+md=\{(\d+)\}\s+key=', '<Grid size={{ xs: $1, md: $2 }} key='
        
        # Pattern 6: <Grid item xs={12} sm={6} key={...}> → <Grid size={{ xs: 12, sm: 6 }} key={...}>
        $content = $content -replace '<Grid\s+item\s+xs=\{(\d+)\}\s+sm=\{(\d+)\}\s+key=', '<Grid size={{ xs: $1, sm: $2 }} key='
        
        # Pattern 7: <Grid item xs={12} sm={6} md={4} lg={2} key={...}> → <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={...}>
        $content = $content -replace '<Grid\s+item\s+xs=\{(\d+)\}\s+sm=\{(\d+)\}\s+md=\{(\d+)\}\s+lg=\{(\d+)\}\s+key=', '<Grid size={{ xs: $1, sm: $2, md: $3, lg: $4 }} key='
        
        # Count changes
        if ($content -ne $originalContent) {
            $changes = ($originalContent.Length - $content.Length)
            Set-Content -Path $filePath -Value $content -NoNewline
            $replacements = ([regex]::Matches($originalContent, '<Grid\s+item')).Count
            $totalReplacements += $replacements
            Write-Host "   ✅ Fixed $replacements Grid components" -ForegroundColor Green
        } else {
            Write-Host "   ℹ️  No changes needed" -ForegroundColor Gray
        }
        
        Write-Host ""
    } else {
        Write-Host "   ❌ File not found: $filePath" -ForegroundColor Red
        Write-Host ""
    }
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✨ Grid Fix Complete!" -ForegroundColor Green
Write-Host "   Total Grid components updated: $totalReplacements" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next: Fix ListItem components manually in AutoMessenger.tsx" -ForegroundColor Yellow

