# Scripts

This directory contains automation scripts for the project.

## Icon Generation

### Quick Start

To regenerate application icons after updating `resources/images/icon.png`:

```bash
npm run generate-icons
```

Or run the script directly:

```bash
./scripts/generate-icons.sh
```

### What It Does

The `generate-icons.sh` script automatically:

1. ✅ Validates source icon exists (`resources/images/icon.png`)
2. ✅ Cleans up old icon files
3. ✅ Generates 10 different sizes for macOS (16x16 to 1024x1024)
4. ✅ Converts to `.icns` format for macOS
5. ✅ Provides detailed progress output

### Requirements

- **macOS only**: Uses native `sips` and `iconutil` commands
- Source icon should be at least 1024x1024 pixels
- PNG format with transparency support recommended

### Generated Files

```
resources/images/
├── icon.png         # Source (you provide)
├── icon.icns        # macOS app icon (generated)
└── icon.iconset/    # Intermediate files (generated)
    ├── icon_16x16.png
    ├── icon_16x16@2x.png
    ├── icon_32x32.png
    ├── icon_32x32@2x.png
    ├── icon_128x128.png
    ├── icon_128x128@2x.png
    ├── icon_256x256.png
    ├── icon_256x256@2x.png
    ├── icon_512x512.png
    └── icon_512x512@2x.png
```

### When to Run

Run this script whenever you:

- 🎨 Update the app icon design
- 📦 Prepare for a new release
- 🔄 Need to regenerate corrupted icon files

### Integration with Build Process

The icon generation is **not** automatic during build. This is intentional to:

- Avoid rebuilding icons on every development iteration
- Give you control over when icons are regenerated
- Keep build times fast

If you want to automate it before packaging, you can add it to the `prepackage` script in `package.json`:

```json
{
  "scripts": {
    "prepackage": "npm run generate-icons"
  }
}
```

### Troubleshooting

**Error: Source icon not found**
- Ensure `resources/images/icon.png` exists
- Check the file path is correct

**Error: Command not found: sips or iconutil**
- These are macOS-only tools
- For Linux/Windows, use alternative tools like ImageMagick

**Icons not updating in app**
- Restart the Electron app after regenerating
- Clear system icon cache: `sudo rm -rf /Library/Caches/com.apple.iconservices.store`
