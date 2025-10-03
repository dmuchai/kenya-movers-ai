#!/bin/bash

# Exit immediately if any command fails
set -e

# Get the project root directory (same as script directory since script is in project root)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"

# Define paths relative to project root
SOURCE_ICON="$PROJECT_ROOT/app-icon.svg"
ANDROID_DIR="$PROJECT_ROOT/android/app/src/main/res"
PUBLIC_DIR="$PROJECT_ROOT/public"

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ Error: ImageMagick 'convert' command not found." >&2
    echo "📦 Please install ImageMagick using your package manager:" >&2
    echo "  - Ubuntu/Debian: sudo apt-get install imagemagick" >&2
    echo "  - macOS: brew install imagemagick" >&2
    echo "  - RHEL/Fedora: sudo dnf install ImageMagick" >&2
    echo "  - Windows: Download from https://imagemagick.org/script/download.php" >&2
    exit 1
fi

# Function to run convert with comprehensive error handling
run_convert() {
    local input_file="$1"
    local output_file="${@: -1}"  # Last argument is output file
    local output_dir="$(dirname "$output_file")"
    
    # Ensure input file exists
    if [[ ! -f "$input_file" ]]; then
        echo "❌ Error: Input file does not exist: $input_file" >&2
        exit 1
    fi
    
    # Create output directory if it doesn't exist
    if [[ ! -d "$output_dir" ]]; then
        echo "📁 Creating directory: $output_dir"
        mkdir -p "$output_dir" || {
            echo "❌ Error: Failed to create directory: $output_dir" >&2
            exit 1
        }
    fi
    
    # Run convert command with quoted arguments
    echo "🔄 Converting: $(basename "$input_file") → $(basename "$output_file")"
    if ! convert "$@"; then
        echo "❌ Error: ImageMagick convert failed with exit code $?" >&2
        echo "💡 Command: convert $*" >&2
        echo "📂 Input: $input_file" >&2
        echo "📂 Output: $output_file" >&2
        exit 1
    fi
}

# Verify source icon exists with detailed error messaging
if [[ ! -f "$SOURCE_ICON" ]]; then
    echo "❌ Error: Source SVG icon not found!" >&2
    echo "📂 Expected location: $SOURCE_ICON" >&2
    echo "💡 Please ensure your app-icon.svg file exists in the project root." >&2
    echo "📋 You can create one or place your existing SVG icon file there." >&2
    exit 1
fi

# Validate source icon is readable
if [[ ! -r "$SOURCE_ICON" ]]; then
    echo "❌ Error: Source icon file is not readable: $SOURCE_ICON" >&2
    echo "💡 Check file permissions and try again." >&2
    exit 1
fi

echo "Using project root: $PROJECT_ROOT"
echo "Source icon: $SOURCE_ICON"

# Android launcher icon sizes (mipmap directories)
declare -A SIZES=(
    ["mdpi"]="48"
    ["hdpi"]="72"
    ["xhdpi"]="96"
    ["xxhdpi"]="144"
    ["xxxhdpi"]="192"
)

echo "Generating Android launcher icons..."

# Generate Android launcher icons
for density in "${!SIZES[@]}"; do
    size=${SIZES[$density]}
    echo "📱 Creating ${density} density (${size}x${size}px)..."
    
    # Use variable for target directory
    target_dir="$ANDROID_DIR/mipmap-$density"
    
    # Standard launcher icon
    run_convert "$SOURCE_ICON" -resize "${size}x${size}" "$target_dir/ic_launcher.png"
    
    # Round launcher icon
    run_convert "$SOURCE_ICON" -resize "${size}x${size}" "$target_dir/ic_launcher_round.png"
    
    # Foreground icon (for adaptive icons)
    run_convert "$SOURCE_ICON" -resize "${size}x${size}" "$target_dir/ic_launcher_foreground.png"
done

# Generate Play Store icon (512x512)
echo "🏪 Generating Play Store icon (512x512px)..."
play_store_icon="$PROJECT_ROOT/play-store-icon.png"
run_convert "$SOURCE_ICON" -resize "512x512" "$play_store_icon"

# Generate web favicon
echo "🌐 Generating web favicon..."
favicon_file="$PUBLIC_DIR/favicon.ico"
run_convert "$SOURCE_ICON" -resize "32x32" "$favicon_file"

# Generate notification icon (monochrome for status bar)
echo "🔔 Generating notification icon..."
notification_dir="$ANDROID_DIR/drawable"
notification_icon="$notification_dir/ic_stat_notify.png"
# Convert to white silhouette on transparent background for notification icon
run_convert "$SOURCE_ICON" -resize "24x24" -alpha extract -background white -alpha shape "$notification_icon"

echo "✅ All icons generated successfully!"
echo ""
echo "Generated files:"
echo "📱 Android launcher icons: android/app/src/main/res/mipmap-*/"
echo "🏪 Play Store icon: play-store-icon.png (512x512)"
echo "🌐 Web favicon: public/favicon.ico"
echo "🔔 Notification icon: android/app/src/main/res/drawable/ic_stat_notify.png"
echo ""
echo "Project structure:"
echo "📁 $PROJECT_ROOT/"
echo "   ├── app-icon.svg (source)"
echo "   ├── play-store-icon.png"
echo "   ├── public/favicon.ico"
echo "   └── android/app/src/main/res/"
echo "       ├── mipmap-*/ (launcher icons)"
echo "       └── drawable/ (notification icon)"