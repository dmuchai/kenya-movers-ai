#!/bin/bash
# Corrected screenshot capture for MoveLink with actual working routes

echo "📸 MoveLink Screenshot Capture (Fixed)"
echo "======================================="
echo ""

# Check for Chrome
CHROME=""
if command -v google-chrome &> /dev/null; then
    CHROME="google-chrome"
elif command -v chromium-browser &> /dev/null; then
    CHROME="chromium-browser"
else
    echo "❌ Chrome not found"
    exit 1
fi

# Create directory
mkdir -p screenshots/playstore
cd screenshots/playstore

# Mobile dimensions
WIDTH=1080
HEIGHT=1920
BASE_URL="https://moving-planner-ke.vercel.app"

echo "📱 Capturing corrected screenshots..."
echo ""

# Capture function
capture() {
    local url=$1
    local name=$2
    echo "📸 $name"
    echo "   URL: $url"
    
    $CHROME --headless --disable-gpu \
        --window-size=$WIDTH,$HEIGHT \
        --screenshot="$name.png" \
        --virtual-time-budget=8000 \
        "$url" 2>/dev/null
    
    if [ -f "$name.png" ]; then
        SIZE=$(du -h "$name.png" | cut -f1)
        echo "   ✅ Saved: $name.png ($SIZE)"
    else
        echo "   ❌ Failed"
    fi
    echo ""
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  HOME PAGE (Main screenshot)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
capture "$BASE_URL" "01-home"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  FIND MOVERS PAGE (Correct route)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
capture "$BASE_URL/find-movers" "02-find-movers"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  MOVER REGISTRATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
capture "$BASE_URL/mover-registration" "03-mover-registration"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  AUTH/LOGIN PAGE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
capture "$BASE_URL/auth" "04-auth"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Screenshot capture complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📁 Screenshots saved in: screenshots/playstore/"
echo ""
ls -lh *.png 2>/dev/null | awk '{print "   " $9 " - " $5}'
echo ""
echo "✅ Use these screenshots for Play Store:"
echo "   1. 01-home.png - Main functionality"
echo "   2. 02-find-movers.png - Browse movers"
echo "   3. 03-mover-registration.png - Mover sign-up"
echo "   4. 04-auth.png - User authentication"
echo ""
echo "🗑️  Delete old screenshots if needed:"
echo "   rm ../web/*.png"
echo ""
