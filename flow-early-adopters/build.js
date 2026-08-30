const fs = require('fs-extra');
const { minify } = require('terser');
const CleanCSS = require('clean-css');
const path = require('path');

async function build() {
    console.log('🚀 Starting build process...');
    
    try {
        // Create dist directory
        const distDir = path.join(__dirname, 'public', 'dist');
        await fs.ensureDir(distDir);
        
        // Minify CSS if exists
        const cssPath = path.join(__dirname, 'public', 'src', 'styles', 'touch.css');
        if (await fs.pathExists(cssPath)) {
            const css = await fs.readFile(cssPath, 'utf8');
            const minifiedCSS = new CleanCSS().minify(css).styles;
            await fs.writeFile(path.join(distDir, 'touch.min.css'), minifiedCSS);
            console.log('✅ CSS minified');
        }
        
        // Minify JS files
        const jsFiles = [
            'src/utils/performance.js',
            'src/components/mobile-nav.js',
            'src/utils/firebase-service.js'
        ];
        
        for (const file of jsFiles) {
            const filePath = path.join(__dirname, 'public', file);
            if (await fs.pathExists(filePath)) {
                const code = await fs.readFile(filePath, 'utf8');
                const minified = await minify(code, {
                    compress: true,
                    mangle: true
                });
                const filename = path.basename(file).replace('.js', '.min.js');
                await fs.writeFile(path.join(distDir, filename), minified.code);
                console.log(`✅ ${file} minified`);
            }
        }
        
        console.log('✨ Build completed successfully!');
    } catch (error) {
        console.error('❌ Build failed:', error);
        process.exit(1);
    }
}

build();
