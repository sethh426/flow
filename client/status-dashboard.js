#!/usr/bin/env node

/**
 * Interactive Status Dashboard
 * Real-time app health monitoring
 */

const readline = require('readline');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Clear console
console.clear();

// Color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function printHeader() {
  console.log(colors.cyan + '┌─────────────────────────────────────────────────────────┐');
  console.log('│  🚀 AFFILIATE FLOW - SYSTEM STATUS DASHBOARD           │');
  console.log('└─────────────────────────────────────────────────────────┘' + colors.reset);
  console.log('');
}

function checkStatus(label, condition, details = '') {
  const status = condition ? 
    `${colors.green}✅ ${label}${colors.reset}` : 
    `${colors.red}❌ ${label}${colors.reset}`;
  console.log(`  ${status}`);
  if (details) {
    console.log(`     ${colors.gray}${details}${colors.reset}`);
  }
}

function printSection(title) {
  console.log('');
  console.log(colors.bright + title + colors.reset);
  console.log('─'.repeat(60));
}

// Check if server is running
function checkServer(callback) {
  exec('curl -s http://localhost:3001 > /dev/null 2>&1', (error) => {
    callback(error === null);
  });
}

// Check TypeScript
function checkTypeScript(callback) {
  exec('cd client && npx tsc --noEmit', (error, stdout, stderr) => {
    callback(error === null, stdout + stderr);
  });
}

// Main status check
async function runStatusCheck() {
  printHeader();
  
  printSection('📦 PROJECT FILES');
  
  // Check critical files
  const criticalFiles = [
    { path: 'client/package.json', label: 'package.json' },
    { path: 'client/next.config.ts', label: 'Next.js config' },
    { path: 'client/tsconfig.json', label: 'TypeScript config' },
    { path: 'client/src/app/layout.tsx', label: 'Root layout' },
    { path: 'client/src/app/dashboard/page.tsx', label: 'Dashboard page' },
  ];
  
  criticalFiles.forEach(({ path: filePath, label }) => {
    const exists = fs.existsSync(path.join(__dirname, '..', filePath));
    checkStatus(label, exists, filePath);
  });
  
  printSection('🎨 UI COMPONENTS');
  
  const components = [
    'client/src/core/layout/DashboardLayoutFlowbite.tsx',
    'client/src/core/layout/DashboardContentFlowbite.tsx',
    'client/src/features/campaigns/CampaignManagerFlowbite.tsx',
    'client/src/features/products/ProductsPageFlowbite.tsx',
    'client/src/features/trends/TrendFinderFlowbite.tsx',
  ];
  
  components.forEach(comp => {
    const exists = fs.existsSync(path.join(__dirname, '..', comp));
    const name = path.basename(comp, '.tsx');
    checkStatus(name, exists);
  });
  
  printSection('🎨 STYLES');
  
  const styles = [
    'client/src/app/globals.css',
    'client/src/styles/neumorphism.css',
    'client/src/styles/flowbite-theme-override.css',
  ];
  
  styles.forEach(style => {
    const exists = fs.existsSync(path.join(__dirname, '..', style));
    const name = path.basename(style);
    checkStatus(name, exists);
  });
  
  printSection('🌐 ROUTES');
  
  const routes = [
    '/dashboard',
    '/dashboard/campaigns',
    '/dashboard/products',
    '/dashboard/trends',
    '/dashboard/analytics',
    '/dashboard/workflows',
  ];
  
  routes.forEach(route => {
    const pagePath = `client/src/app${route}/page.tsx`;
    const exists = fs.existsSync(path.join(__dirname, '..', pagePath));
    checkStatus(route, exists);
  });
  
  printSection('⚙️  RUNTIME STATUS');
  
  console.log('  Checking server...');
  checkServer((isRunning) => {
    checkStatus('Dev Server (localhost:3001)', isRunning);
    
    console.log('');
    printSection('📊 QUICK STATS');
    
    // Count files
    const srcPath = path.join(__dirname, 'src');
    let tsxCount = 0;
    let cssCount = 0;
    
    function countFiles(dir) {
      if (!fs.existsSync(dir)) return;
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          countFiles(filePath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
          tsxCount++;
        } else if (file.endsWith('.css')) {
          cssCount++;
        }
      });
    }
    
    countFiles(srcPath);
    
    console.log(`  ${colors.cyan}📄 TypeScript Files:${colors.reset} ${tsxCount}`);
    console.log(`  ${colors.cyan}🎨 CSS Files:${colors.reset} ${cssCount}`);
    
    // Check package.json
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    const depCount = Object.keys(packageJson.dependencies || {}).length;
    console.log(`  ${colors.cyan}📦 Dependencies:${colors.reset} ${depCount}`);
    
    console.log('');
    printSection('🔧 ACTIONS');
    console.log('');
    console.log('  Run health check:  npm run health-check');
    console.log('  Type check:        npm run type-check');
    console.log('  Build test:        npm run build');
    console.log('  E2E tests:         npm run test:e2e');
    console.log('  Full check:        cd .. && .\\run-all-checks.ps1');
    console.log('');
    console.log(colors.gray + '  Press Ctrl+C to exit' + colors.reset);
    console.log('');
  });
}

// Run the status check
runStatusCheck();
