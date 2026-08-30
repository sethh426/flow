const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function optimizeImages() {
    console.log('🖼️  Starting image optimization...');
    
    const publicDir = path.join(__dirname, 'public');
    const outputDir = path.join(publicDir, 'src', 'assets', 'images');
    
    // Check if flow-logo.png exists in public directory
    const logoPath = path.join(publicDir, 'flow-logo.png');
    
    try {
        await fs.access(logoPath);
    } catch {
        console.warn('⚠️  flow-logo.png not found in public directory');
        console.log('ℹ️  Skipping image optimization');
        return;
    }
    
    const images = [
        { input: logoPath, output: path.join(outputDir, 'flow-logo.webp'), width: 180, height: 180 },
        { input: logoPath, output: path.join(outputDir, 'flow-logo-64.webp'), width: 64, height: 64 },
        { input: logoPath, output: path.join(outputDir, 'flow-logo-32.webp'), width: 32, height: 32 }
    ];

    for (const image of images) {
        try {
            await sharp(image.input)
                .resize(image.width, image.height, {
                    fit: 'contain',
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                })
                .webp({ quality: 85 })
                .toFile(image.output);
            console.log(`✅ Optimized: ${path.basename(image.output)}`);
        } catch (error) {
            console.error(`❌ Failed to optimize ${image.output}:`, error.message);
        }
    }
    
    console.log('✨ Image optimization completed!');
}

optimizeImages().catch(error => {
    console.error('❌ Image optimization failed:', error);
    process.exit(1);
});
