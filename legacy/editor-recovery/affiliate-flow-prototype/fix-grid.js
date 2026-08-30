// Quick Grid Fix Script for MUI v7
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const files = [
  'client/src/components/social-media/AutoMessenger.tsx',
  'client/src/components/social-media/SmartEngagement.tsx',
  'client/src/components/social-media/Analytics.tsx',
  'client/src/components/social-media/AutoFollow.tsx'
];

console.log('🔧 Fixing MUI Grid v7 syntax...\n');

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    
    // Replace all Grid item patterns
    content = content.replace(/<Grid\s+item\s+xs=\{(\d+)\}\s+md=\{(\d+)\}>/g, '<Grid size={{ xs: $1, md: $2 }}>');
    content = content.replace(/<Grid\s+item\s+xs=\{(\d+)\}\s+sm=\{(\d+)\}\s+md=\{(\d+)\}>/g, '<Grid size={{ xs: $1, sm: $2, md: $3 }}>');
    content = content.replace(/<Grid\s+item\s+xs=\{(\d+)\}\s+sm=\{(\d+)\}>/g, '<Grid size={{ xs: $1, sm: $2 }}>');
    content = content.replace(/<Grid\s+item\s+xs=\{(\d+)\}>/g, '<Grid size={{ xs: $1 }}>');
    
    // With key prop
    content = content.replace(/<Grid\s+item\s+xs=\{(\d+)\}\s+sm=\{(\d+)\}\s+key=/g, '<Grid size={{ xs: $1, sm: $2 }} key=');
    content = content.replace(/<Grid\s+item\s+xs=\{(\d+)\}\s+md=\{(\d+)\}\s+key=/g, '<Grid size={{ xs: $1, md: $2 }} key=');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${file}`);
    } else {
      console.log(`ℹ️  No changes: ${file}`);
    }
  } catch (err) {
    console.log(`❌ Error with ${file}:`, err.message);
  }
});

console.log('\n✨ Grid fixes complete!');
