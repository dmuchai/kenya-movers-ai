#!/bin/bash

# Install imagemagick if not already installed
if ! command -v convert &> /dev/null; then
    echo "Installing ImageMagick..."
    sudo apt-get update && sudo apt-get install -y imagemagick
fi

# Create the directories for different icon sizes
ANDROID_DIR="/home/dennis-muchai/kenya-movers-ai/android/app/src/main/res"

# Android launcher icon sizes (mipmap directories)
declare -A SIZES=(
    ["mdpi"]="48"
    ["hdpi"]="72"
    ["xhdpi"]="96"
    ["xxhdpi"]="144"
    ["xxxhdpi"]="192"
)

# Create directories if they don't exist
for density in "${!SIZES[@]}"; do
    mkdir -p "$ANDROID_DIR/mipmap-$density"
done

echo "Generating Android launcher icons..."

# Generate standard launcher icons
for density in "${!SIZES[@]}"; do
    size=${SIZES[$density]}
    echo "Generating ${density} icons (${size}x${size}px)..."
    
    # Standard launcher icon
    convert "/home/dennis-muchai/kenya-movers-ai/app-icon.svg" -resize "${size}x${size}" "$ANDROID_DIR/mipmap-$density/ic_launcher.png"
    
    # Round launcher icon (same as standard for now)
    convert "/home/dennis-muchai/kenya-movers-ai/app-icon.svg" -resize "${size}x${size}" "$ANDROID_DIR/mipmap-$density/ic_launcher_round.png"
    
    # Foreground icon (for adaptive icons)
    convert "/home/dennis-muchai/kenya-movers-ai/app-icon.svg" -resize "${size}x${size}" "$ANDROID_DIR/mipmap-$density/ic_launcher_foreground.png"
done

# Generate Play Store icon (512x512)
echo "Generating Play Store icon (512x512px)..."
convert "/home/dennis-muchai/kenya-movers-ai/app-icon.svg" -resize "512x512" "/home/dennis-muchai/kenya-movers-ai/play-store-icon.png"

# Generate web favicon
echo "Generating web favicon..."
convert "/home/dennis-muchai/kenya-movers-ai/app-icon.svg" -resize "32x32" "/home/dennis-muchai/kenya-movers-ai/public/favicon.ico"

# Generate notification icon (monochrome for status bar)
echo "Generating notification icon..."
mkdir -p "$ANDROID_DIR/drawable"
convert "/home/dennis-muchai/kenya-movers-ai/app-icon.svg" -colorspace Gray -resize "24x24" "$ANDROID_DIR/drawable/ic_stat_notify.png"

echo "✅ All icons generated successfully!"
echo ""
echo "Generated files:"
echo "📱 Android launcher icons: android/app/src/main/res/mipmap-*/"
echo "🏪 Play Store icon: play-store-icon.png (512x512)"
echo "🌐 Web favicon: public/favicon.ico"
echo "🔔 Notification icon: android/app/src/main/res/drawable/ic_stat_notify.png"