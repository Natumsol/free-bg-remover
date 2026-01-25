#!/bin/bash

# Generate application icons from source PNG
# Usage: ./scripts/generate-icons.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ICON_DIR="$PROJECT_ROOT/resources/images"
SOURCE_ICON="$ICON_DIR/icon.png"
ICONSET_DIR="$ICON_DIR/icon.iconset"
OUTPUT_ICNS="$ICON_DIR/icon.icns"

echo "🎨 Generating application icons..."
echo ""

# Check if source icon exists
if [ ! -f "$SOURCE_ICON" ]; then
    echo "❌ Error: Source icon not found at $SOURCE_ICON"
    exit 1
fi

# Get source icon size
SOURCE_SIZE=$(sips -g pixelWidth "$SOURCE_ICON" | tail -1 | awk '{print $2}')
echo "📐 Source icon size: ${SOURCE_SIZE}x${SOURCE_SIZE}"
echo ""

# Clean up old iconset
if [ -d "$ICONSET_DIR" ]; then
    echo "🗑️  Removing old iconset..."
    rm -rf "$ICONSET_DIR"
fi

# Create iconset directory
mkdir -p "$ICONSET_DIR"
echo "📁 Created iconset directory"
echo ""

# Generate icon sizes for macOS
echo "⚙️  Generating icon sizes..."
declare -a sizes=(
    "16:icon_16x16.png"
    "32:icon_16x16@2x.png"
    "32:icon_32x32.png"
    "64:icon_32x32@2x.png"
    "128:icon_128x128.png"
    "256:icon_128x128@2x.png"
    "256:icon_256x256.png"
    "512:icon_256x256@2x.png"
    "512:icon_512x512.png"
    "1024:icon_512x512@2x.png"
)

for item in "${sizes[@]}"; do
    IFS=':' read -r size filename <<< "$item"
    echo "  ✓ Generating ${filename} (${size}x${size})"
    sips -z "$size" "$size" "$SOURCE_ICON" --out "$ICONSET_DIR/$filename" > /dev/null 2>&1
done

echo ""

# Convert to .icns
echo "🔄 Converting to .icns format..."
iconutil -c icns "$ICONSET_DIR" -o "$OUTPUT_ICNS"

if [ -f "$OUTPUT_ICNS" ]; then
    ICNS_SIZE=$(ls -lh "$OUTPUT_ICNS" | awk '{print $5}')
    echo "✅ Successfully generated icon.icns ($ICNS_SIZE)"
else
    echo "❌ Failed to generate .icns file"
    exit 1
fi

echo ""
echo "📊 Generated files:"
echo "  - icon.icns (macOS)"
echo "  - icon.iconset/ (10 PNG files)"
echo ""
echo "🎉 Icon generation complete!"
