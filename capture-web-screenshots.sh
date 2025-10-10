#!/bin/bash
# Quick web screenshots using Chrome headless

echo "📸 Capturing screenshots from web app..."
echo "=========================================="
echo ""

# Check if chromium-browser is installed
if ! command -v chromium-browser &> /dev/null && ! command -v google-chrome &> /dev/null; then
    echo "⚠️  Chrome/Chromium not found. Please install:"
    echo "   sudo apt install chromium-browser"
    exit 1
fi

# Create screenshots directory
mkdir -p screenshots/web

# Set Chrome command
CHROME="chromium-browser"
if command -v google-chrome &> /dev/null; then
    CHROME="google-chrome"
fi

echo "Using: $CHROME"
echo ""

# Capture homepage
echo "📱 Capturing homepage..."
$CHROME --headless --disable-gpu \
  --window-size=1080,1920 \
  --screenshot=screenshots/web/01-home.png \
  https://moving-planner-ke.vercel.app

echo "✅ Homepage captured"
echo ""

echo "🎉 Screenshot saved to: screenshots/web/01-home.png"
echo ""
echo "📋 Manual steps for more screenshots:"
echo "1. Open https://moving-planner-ke.vercel.app in browser"
echo "2. Press F12 → Toggle device toolbar (phone icon)"
echo "3. Set device to 'Pixel 5' or similar"
echo "4. Navigate to each page and take screenshots"
echo ""
