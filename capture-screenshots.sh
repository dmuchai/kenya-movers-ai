#!/bin/bash

# MoveLink Screenshot Capture Script for Google Play Store
# This script helps capture screenshots from your Android device

set -e

echo "🎬 MoveLink Screenshot Capture Tool"
echo "===================================="
echo ""

# Check if adb is installed
if ! command -v adb &> /dev/null; then
    echo "❌ Error: ADB not found. Please install Android SDK Platform Tools."
    echo "   Download from: https://developer.android.com/studio/releases/platform-tools"
    exit 1
fi

# Check if device is connected
echo "🔍 Checking for connected devices..."
DEVICES=$(adb devices | grep -w "device" | wc -l)

if [ "$DEVICES" -eq 0 ]; then
    echo "❌ No Android devices connected."
    echo ""
    echo "Please:"
    echo "1. Connect your Android device via USB"
    echo "2. Enable USB Debugging on your device"
    echo "3. Accept USB debugging prompt on device"
    echo ""
    exit 1
fi

echo "✅ Device connected!"
echo ""

# Create screenshots directory
SCREENSHOT_DIR="./play-store-assets/screenshots"
mkdir -p "$SCREENSHOT_DIR"

echo "📸 Screenshots will be saved to: $SCREENSHOT_DIR"
echo ""
echo "Recommended screenshots to capture:"
echo "1. Home screen with quote request form"
echo "2. Browse movers listing page"
echo "3. Mover profile details page"
echo "4. Quote results/comparison page"
echo "5. User profile/dashboard"
echo "6. Review submission page"
echo ""

# Function to take screenshot
take_screenshot() {
    local name=$1
    local filename="${SCREENSHOT_DIR}/${name}.png"
    
    echo "📸 Taking screenshot: $name"
    echo "   Press Enter when ready..."
    read
    
    # Capture screenshot
    adb shell screencap -p /sdcard/temp_screenshot.png
    adb pull /sdcard/temp_screenshot.png "$filename"
    adb shell rm /sdcard/temp_screenshot.png
    
    echo "✅ Saved: $filename"
    echo ""
}

# Capture each screenshot
echo "Let's capture your screenshots!"
echo "Make sure the MoveLink app is open on your device."
echo ""

take_screenshot "01-home-quote-form"
take_screenshot "02-browse-movers"
take_screenshot "03-mover-profile"
take_screenshot "04-quote-results"
take_screenshot "05-user-dashboard"
take_screenshot "06-reviews"

# Optional: Capture additional screenshots
echo "Do you want to capture more screenshots? (y/n)"
read -r response

counter=7
while [[ "$response" =~ ^[Yy]$ ]]; do
    echo "Enter screenshot name (e.g., 'settings-page'):"
    read -r screenshot_name
    
    if [ -n "$screenshot_name" ]; then
        formatted_name=$(printf "%02d-%s" $counter "$screenshot_name")
        take_screenshot "$formatted_name"
        ((counter++))
    fi
    
    echo "Capture another? (y/n)"
    read -r response
done

echo ""
echo "✅ Screenshot capture complete!"
echo ""
echo "📁 Screenshots saved in: $SCREENSHOT_DIR"
echo ""
echo "Next steps:"
echo "1. Review and select the best screenshots"
echo "2. Optionally edit/crop screenshots for better presentation"
echo "3. Upload to Google Play Console (minimum 2, maximum 8)"
echo ""
echo "Play Store Requirements:"
echo "- Aspect ratio: 16:9 or 9:16"
echo "- Min dimension: 320px"
echo "- Max dimension: 3840px"
echo "- Format: PNG or JPEG"
echo ""
echo "📄 See PLAY_STORE_SUBMISSION_GUIDE.md for detailed instructions"
echo ""
