#!/usr/bin/env node

/**
 * Comprehensive App Health Check
 * Validates routing, imports, components, and configuration
 */

const fs = require('fs');
const path = require('path');

const results = {
  passed: [],
  failed: [],
  warnings: [],
};

console.log('🔍 Running Comprehensive App Health Checks...\n');

// ============================================
// 1. Check All Dashboard Routes Exist
// ============================================
console.log('📍 Checking Dashboard Routes...');
const requiredRoutes = [
  'src/app/dashboard/page.tsx',
  'src/app/dashboard/campaigns/page.tsx',
  'src/app/dashboard/products/page.tsx',
  'src/app/dashboard/trends/page.tsx',
  'src/app/dashboard/content-studio/page.tsx',
  'src/app/dashboard/analytics/page.tsx',
  'src/app/dashboard/ab-testing/page.tsx',
  'src/app/dashboard/flowchart/page.tsx',
  'src/app/dashboard/flowcoins/page.tsx',
  'src/app/dashboard/workflows/page.tsx',
  'src/app/dashboard/scheduler/page.tsx',
  'src/app/dashboard/printify/page.tsx',
];

requiredRoutes.forEach(route => {
  const filePath = path.join(__dirname, route);
  if (fs.existsSync(filePath)) {
    results.passed.push(`✅ Route exists: ${route}`);
  } else {
    results.failed.push(`❌ Missing route: ${route}`);
  }
});

// ============================================
// 2. Check Component Imports
// ============================================
console.log('📦 Checking Component Imports...');
const componentChecks = [
  { file: 'src/features/campaigns/CampaignManagerFlowbite.tsx', name: 'CampaignManagerFlowbite' },
  { file: 'src/features/products/ProductsPageFlowbite.tsx', name: 'ProductsPageFlowbite' },
  { file: 'src/features/trends/TrendFinderFlowbite.tsx', name: 'TrendFinderFlowbite' },
  { file: 'src/features/analytics/AnalyticsDashboardFlowbite.tsx', name: 'AnalyticsDashboardFlowbite' },
  { file: 'src/features/analytics/ABTestingFlowbite.tsx', name: 'ABTestingFlowbite' },
  { file: 'src/features/workflow/FlowChartFlowbite.tsx', name: 'FlowChartFlowbite' },
  { file: 'src/features/workflow/FlowCoinsFlowbite.tsx', name: 'FlowCoinsFlowbite' },
  { file: 'src/features/workflow/WorkflowBuilderFlowbite.tsx', name: 'WorkflowBuilderFlowbite' },
  { file: 'src/features/content-studio/ContentSchedulerFlowbite.tsx', name: 'ContentSchedulerFlowbite' },
  { file: 'src/features/printify-studio/PrintifyStudioFlowbite.tsx', name: 'PrintifyStudioFlowbite' },
  { file: 'src/core/layout/DashboardLayoutFlowbite.tsx', name: 'DashboardLayoutFlowbite' },
  { file: 'src/core/layout/DashboardContentFlowbite.tsx', name: 'DashboardContentFlowbite' },
];

componentChecks.forEach(({ file, name }) => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    results.passed.push(`✅ Component exists: ${name}`);
  } else {
    results.failed.push(`❌ Missing component: ${name} (${file})`);
  }
});

// ============================================
// 3. Check Config Files
// ============================================
console.log('⚙️  Checking Configuration Files...');
const configFiles = [
  'package.json',
  'next.config.ts',
  'next.config.mjs',
  'tsconfig.json',
  'postcss.config.mjs',
  '.env.local',
];

configFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    results.passed.push(`✅ Config exists: ${file}`);
  } else {
    if (file === '.env.local') {
      results.warnings.push(`⚠️  Missing optional config: ${file}`);
    } else {
      results.failed.push(`❌ Missing config: ${file}`);
    }
  }
});

// ============================================
// 4. Check Style Files
// ============================================
console.log('🎨 Checking Style Files...');
const styleFiles = [
  'src/app/globals.css',
  'src/styles/neumorphism.css',
  'src/styles/flowbite-theme-override.css',
  'src/styles/mobile-optimizations.css',
  'src/styles/ui-fixes.css',
];

styleFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    results.passed.push(`✅ Style file exists: ${file}`);
  } else {
    results.failed.push(`❌ Missing style file: ${file}`);
  }
});

// ============================================
// 5. Check for Common Anti-Patterns
// ============================================
console.log('🔎 Checking for Anti-Patterns...');

// Check for console.logs in production code
const srcDir = path.join(__dirname, 'src');
let consoleLogCount = 0;
let todoCount = 0;

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      scanDirectory(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = fs.readFileSync(filePath, 'utf8');
      const consoleMatches = content.match(/console\.(log|warn|error)/g);
      const todoMatches = content.match(/\/\/\s*TODO/gi);
      
      if (consoleMatches) consoleLogCount += consoleMatches.length;
      if (todoMatches) todoCount += todoMatches.length;
    }
  });
}

scanDirectory(srcDir);

if (consoleLogCount > 0) {
  results.warnings.push(`⚠️  Found ${consoleLogCount} console.log statements`);
} else {
  results.passed.push('✅ No console.log statements found');
}

if (todoCount > 0) {
  results.warnings.push(`⚠️  Found ${todoCount} TODO comments`);
}

// ============================================
// 6. Check Package Dependencies
// ============================================
console.log('📚 Checking Dependencies...');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));

const requiredDeps = [
  'next',
  'react',
  'react-dom',
  'flowbite',
  'flowbite-react',
  '@mui/material',
  '@emotion/react',
  '@emotion/styled',
  'recharts',
  'firebase',
];

requiredDeps.forEach(dep => {
  if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
    results.passed.push(`✅ Dependency installed: ${dep}`);
  } else {
    results.failed.push(`❌ Missing dependency: ${dep}`);
  }
});

// ============================================
// 7. Check Navigation Mapping
// ============================================
console.log('🧭 Checking Navigation Mapping...');

const layoutFile = path.join(__dirname, 'src/core/layout/DashboardLayoutFlowbite.tsx');
if (fs.existsSync(layoutFile)) {
  const content = fs.readFileSync(layoutFile, 'utf8');
  
  // Check for proper route mapping
  const hasRouteMapping = content.includes('/dashboard/campaigns') &&
                          content.includes('/dashboard/products') &&
                          content.includes('/dashboard/trends');
  
  if (hasRouteMapping) {
    results.passed.push('✅ Navigation routes properly mapped');
  } else {
    results.failed.push('❌ Navigation routes not properly mapped');
  }
}

// ============================================
// 8. Check Quick Actions
// ============================================
console.log('⚡ Checking Quick Actions...');

const dashboardContent = path.join(__dirname, 'src/core/layout/DashboardContentFlowbite.tsx');
if (fs.existsSync(dashboardContent)) {
  const content = fs.readFileSync(dashboardContent, 'utf8');
  
  // Check that quick actions don't use query params
  const hasQueryParams = content.includes('/dashboard?tab=');
  
  if (!hasQueryParams) {
    results.passed.push('✅ Quick actions use proper routes');
  } else {
    results.failed.push('❌ Quick actions still using query parameters');
  }
}

// ============================================
// 9. Check for Duplicate Files
// ============================================
console.log('🔄 Checking for Duplicates...');

const duplicatePatterns = [
  { pattern: 'DashboardContent', dir: 'src/core/layout' },
  { pattern: 'CampaignManager', dir: 'src/features/campaigns' },
  { pattern: 'ProductsPage', dir: 'src/features/products' },
];

duplicatePatterns.forEach(({ pattern, dir }) => {
  const dirPath = path.join(__dirname, dir);
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath).filter(f => f.includes(pattern));
    if (files.length > 3) {
      results.warnings.push(`⚠️  Multiple ${pattern} variants found: ${files.length} files`);
    }
  }
});

// ============================================
// 10. Check Error Handling
// ============================================
console.log('🛡️  Checking Error Boundaries...');

const errorBoundaries = [
  'src/core/providers/ErrorBoundary.tsx',
  'src/components/ErrorBoundary.tsx',
];

let errorBoundaryFound = false;
errorBoundaries.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    errorBoundaryFound = true;
  }
});

if (errorBoundaryFound) {
  results.passed.push('✅ Error boundary implementation found');
} else {
  results.warnings.push('⚠️  No error boundary found');
}

// ============================================
// Print Results
// ============================================
console.log('\n' + '='.repeat(60));
console.log('📊 HEALTH CHECK RESULTS');
console.log('='.repeat(60) + '\n');

console.log('✅ PASSED CHECKS:\n');
results.passed.forEach(item => console.log(`   ${item}`));

if (results.warnings.length > 0) {
  console.log('\n⚠️  WARNINGS:\n');
  results.warnings.forEach(item => console.log(`   ${item}`));
}

if (results.failed.length > 0) {
  console.log('\n❌ FAILED CHECKS:\n');
  results.failed.forEach(item => console.log(`   ${item}`));
}

// ============================================
// Summary
// ============================================
console.log('\n' + '='.repeat(60));
console.log('📈 SUMMARY');
console.log('='.repeat(60));
console.log(`✅ Passed: ${results.passed.length}`);
console.log(`⚠️  Warnings: ${results.warnings.length}`);
console.log(`❌ Failed: ${results.failed.length}`);
console.log('='.repeat(60) + '\n');

if (results.failed.length === 0) {
  console.log('🎉 All critical checks passed! App is healthy.\n');
  process.exit(0);
} else {
  console.log('⚠️  Some checks failed. Please review and fix issues.\n');
  process.exit(1);
}
