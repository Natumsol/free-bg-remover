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
node scripts/generate-icons.js
```

### What It Does

The `generate-icons.js` script automatically:

1. ✅ Validates source icon exists (`resources/images/icon.png`)
2. ✅ Cleans up old icon files
3. ✅ Generates 10 different sizes (16x16 to 1024x1024) using `sharp`
4. ✅ Converts to `.icns` format if running on macOS (using `iconutil`)
5. ✅ Provides detailed progress output

### Requirements

- **Cross-platform**: Works on Windows, macOS, and Linux
- Requires `sharp` (installed via `npm install`)
- Source icon should be at least 1024x1024 pixels
- PNG format with transparency support recommended
- **macOS only**: `.icns` generation requires `iconutil` (built-in on macOS)

### Generated Files

```
resources/images/
├── icon.png         # Source (you provide)
├── icon.icns        # macOS app icon (generated if on macOS)
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

## Model Download

### Quick Start

To download the required AI models:

```bash
npm run download-models
```

Or run the script directly:

```bash
node scripts/download-models.js
```

### What It Does

The `download-models.js` script automatically:

1. ✅ Creates necessary model directories
2. ✅ Downloads model configuration files
3. ✅ Downloads the ONNX model file (approx. 84MB)
4. ✅ Handles redirects and errors gracefully

### Troubleshooting

**Error: Sharp is not installed**
- Run `npm install` to install dependencies including `sharp`.

**Error: Failed to download file**
- Check your internet connection.
- Ensure you have write permissions in the project directory.

**Icons not updating in app**
- Restart the Electron app after regenerating.
