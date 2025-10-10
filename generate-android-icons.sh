#!/bin/bash

# Generate Android launcher icons from MoveLink icon
# This script creates all required icon sizes for Android

set -e

# Check for source icon - try multiple names
if [ -f "movelink-icon.png" ]; then
    SOURCE_ICON="movelink-icon.png"
elif [ -f "play-store-icon.png" ]; then
    SOURCE_ICON="play-store-icon.png"
elif [ -f "app-icon.png" ]; then
    SOURCE_ICON="app-icon.png"
else
    echo "❌ Error: No source icon found!"
    echo "Please provide one of: movelink-icon.png, play-store-icon.png, or app-icon.png"
    exit 1
fi

ANDROID_RES="android/app/src/main/res"

# Check if source icon exists
if [ ! -f "$SOURCE_ICON" ]; then
    echo "❌ Error: $SOURCE_ICON not found!"
    exit 1
fi

echo "🎨 Generating Android launcher icons from $SOURCE_ICON..."

# Define icon sizes for each density
# Format: density:size
declare -A SIZES=(
    ["mdpi"]=48
    ["hdpi"]=72
    ["xhdpi"]=96
    ["xxhdpi"]=144
    ["xxxhdpi"]=192
)

# Generate icons for each density
for density in "${!SIZES[@]}"; do
    size=${SIZES[$density]}
    output_dir="$ANDROID_RES/mipmap-$density"
    
    echo "  📱 Generating ${density} icons (${size}x${size})..."
    
    # Create directory if it doesn't exist
    mkdir -p "$output_dir"
    
    # Generate square launcher icon
    convert "$SOURCE_ICON" \
        -resize ${size}x${size} \
        "$output_dir/ic_launcher.png"
    
    # Generate round launcher icon
    convert "$SOURCE_ICON" \
        -resize ${size}x${size} \
        \( +clone -threshold -1 -negate -fill white -draw "circle $((size/2)),$((size/2)) $((size/2)),0" \) \
        -alpha off -compose copy_opacity -composite \
        "$output_dir/ic_launcher_round.png"
    
    # Generate foreground icon (for adaptive icons)
    convert "$SOURCE_ICON" \
        -resize ${size}x${size} \
        "$output_dir/ic_launcher_foreground.png"
    
    echo "  ✅ ${density} icons created"
done

# Generate adaptive icon XML (if needed)
ADAPTIVE_DIR="$ANDROID_RES/mipmap-anydpi-v26"
mkdir -p "$ADAPTIVE_DIR"

# Create ic_launcher.xml for adaptive icon
cat > "$ADAPTIVE_DIR/ic_launcher.xml" << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
EOF

# Create ic_launcher_round.xml for adaptive icon
cat > "$ADAPTIVE_DIR/ic_launcher_round.xml" << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
EOF

echo "  📄 Adaptive icon XMLs created"

# Update colors.xml with launcher background color
COLORS_FILE="$ANDROID_RES/values/colors.xml"
if [ ! -f "$COLORS_FILE" ]; then
    mkdir -p "$ANDROID_RES/values"
    cat > "$COLORS_FILE" << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#FFFFFF</color>
</resources>
EOF
    echo "  🎨 colors.xml created with white background"
else
    echo "  ℹ️  colors.xml already exists, please add:"
    echo "     <color name=\"ic_launcher_background\">#FFFFFF</color>"
fi

echo ""
echo "✅ All Android launcher icons generated successfully!"
echo ""
echo "📋 Icons created in:"
echo "   • mipmap-mdpi (48x48)"
echo "   • mipmap-hdpi (72x72)"
echo "   • mipmap-xhdpi (96x96)"
echo "   • mipmap-xxhdpi (144x144)"
echo "   • mipmap-xxxhdpi (192x192)"
echo "   • mipmap-anydpi-v26 (adaptive icons)"
echo ""
echo "🔧 Next steps:"
echo "   1. Rebuild your app: cd android && ./gradlew assembleDebug"
echo "   2. Or sync with Capacitor: npx cap sync android"
echo ""
