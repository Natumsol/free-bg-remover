const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('❌ Sharp is not installed. Please run npm install.');
  process.exit(1);
}

const PROJECT_ROOT = path.resolve(__dirname, '..');
const ICON_DIR = path.join(PROJECT_ROOT, 'resources', 'images');
const SOURCE_ICON = path.join(ICON_DIR, 'icon.png');
const ICONSET_DIR = path.join(ICON_DIR, 'icon.iconset');
const OUTPUT_ICNS = path.join(ICON_DIR, 'icon.icns');

const SIZES = [
  { size: 16, name: 'icon_16x16.png' },
  { size: 32, name: 'icon_16x16@2x.png' },
  { size: 32, name: 'icon_32x32.png' },
  { size: 64, name: 'icon_32x32@2x.png' },
  { size: 128, name: 'icon_128x128.png' },
  { size: 256, name: 'icon_128x128@2x.png' },
  { size: 256, name: 'icon_256x256.png' },
  { size: 512, name: 'icon_256x256@2x.png' },
  { size: 512, name: 'icon_512x512.png' },
  { size: 1024, name: 'icon_512x512@2x.png' }
];

async function main() {
  console.log('🎨 Generating application icons...');

  if (!fs.existsSync(SOURCE_ICON)) {
    console.error(`❌ Error: Source icon not found at ${SOURCE_ICON}`);
    process.exit(1);
  }

  // Clean and create iconset directory
  if (fs.existsSync(ICONSET_DIR)) {
    fs.rmSync(ICONSET_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(ICONSET_DIR, { recursive: true });

  console.log('⚙️  Generating icon sizes...');
  
  try {
    for (const { size, name } of SIZES) {
      console.log(`  ✓ Generating ${name} (${size}x${size})`);
      await sharp(SOURCE_ICON)
        .resize(size, size)
        .toFile(path.join(ICONSET_DIR, name));
    }
  } catch (error) {
     console.error('❌ Error generating icons with sharp:', error);
     process.exit(1);
  }

  // Convert to .icns (macOS only)
  if (process.platform === 'darwin') {
    try {
      console.log('\n🔄 Converting to .icns format...');
      execSync(`iconutil -c icns "${ICONSET_DIR}" -o "${OUTPUT_ICNS}"`);
      console.log('✅ Successfully generated icon.icns');
    } catch (error) {
      console.error('❌ Failed to generate .icns file:', error.message);
    }
  } else {
    console.log('\n⚠️  Skipping .icns generation (requires macOS iconutil)');
  }

  console.log('\n🎉 Icon generation complete!');
}

main();
