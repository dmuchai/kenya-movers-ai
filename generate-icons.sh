#!/bin/bash

# Exit immediately if any command fails
set -e

# Determine project root directory with multiple fallback methods
determine_project_root() {
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    local project_root=""
    
    # Method 1: Use git repository root if available
    if command -v git &> /dev/null && git rev-parse --show-toplevel &> /dev/null; then
        project_root="$(git rev-parse --show-toplevel)"
        echo "📍 Using git repository root: $project_root" >&2
    # Method 2: Use script directory as fallback
    elif [[ -n "$script_dir" ]]; then
        project_root="$script_dir"
        echo "📍 Using script directory as project root: $project_root" >&2
    else
        echo "❌ Error: Cannot determine project root directory" >&2
        echo "💡 Please run this script from the project root or ensure git is available" >&2
        exit 1
    fi
    
    # Validate project root has expected structure
    if [[ ! -d "$project_root" ]]; then
        echo "❌ Error: Project root directory does not exist: $project_root" >&2
        exit 1
    fi
    
    echo "$project_root"
}

# Get the project root directory with robust detection
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(determine_project_root)"

# Define paths relative to project root
SOURCE_ICON="$PROJECT_ROOT/app-icon.svg"
ANDROID_DIR="$PROJECT_ROOT/android/app/src/main/res"
PUBLIC_DIR="$PROJECT_ROOT/public"

# Validate expected project structure
validate_project_structure() {
    local missing_dirs=()
    
    # Check for android directory structure
    if [[ ! -d "$PROJECT_ROOT/android" ]]; then
        missing_dirs+=("android/")
    fi
    
    if [[ ! -d "$PROJECT_ROOT/android/app" ]] && [[ -d "$PROJECT_ROOT/android" ]]; then
        missing_dirs+=("android/app/")
    fi
    
    # Check for public directory (for web builds)
    if [[ ! -d "$PUBLIC_DIR" ]]; then
        echo "📁 Creating public directory: $PUBLIC_DIR"
        mkdir -p "$PUBLIC_DIR" || {
            echo "❌ Error: Failed to create public directory: $PUBLIC_DIR" >&2
            exit 1
        }
    fi
    
    # Report missing critical directories
    if [[ ${#missing_dirs[@]} -gt 0 ]]; then
        echo "⚠️  Warning: Missing expected project directories:" >&2
        for dir in "${missing_dirs[@]}"; do
            echo "   - $PROJECT_ROOT/$dir" >&2
        done
        echo "💡 This might not be a React Native/Capacitor project root." >&2
        echo "🔍 Current project root: $PROJECT_ROOT" >&2
        
        # Don't exit - just warn, as the script might still work for web icons
        echo "📝 Continuing anyway - some icon generation may fail..." >&2
    fi
}

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

# Validate project structure before proceeding
validate_project_structure

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