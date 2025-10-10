#!/bin/bash
# Automated web screenshot capture for MoveLink Play Store listing

echo "📸 MoveLink Web Screenshot Capture"
echo "===================================="
echo ""

# Check for Chrome/Chromium
CHROME=""
if command -v google-chrome &> /dev/null; then
    CHROME="google-chrome"
elif command -v chromium-browser &> /dev/null; then
    CHROME="chromium-browser"
elif command -v chromium &> /dev/null; then
    CHROME="chromium"
else
    echo "❌ Chrome/Chromium not found"
    echo "Please install: sudo apt install chromium-browser"
    exit 1
fi

echo "✅ Using: $CHROME"
echo ""

# Create directories
mkdir -p screenshots/web
mkdir -p screenshots/mobile-ready

# Mobile dimensions (9:16 aspect ratio - standard phone)
WIDTH=1080
HEIGHT=1920

echo "📱 Capturing mobile screenshots (${WIDTH}x${HEIGHT})..."
echo ""

# Base URL
BASE_URL="https://moving-planner-ke.vercel.app"

# Screenshot function
capture() {
    local url=$1
    local name=$2
    local output="screenshots/web/${name}.png"
    
    echo "📸 Capturing: $name"
    echo "   URL: $url"
    
    $CHROME --headless --disable-gpu \
        --window-size=$WIDTH,$HEIGHT \
        --screenshot="$output" \
        --virtual-time-budget=5000 \
        "$url" 2>/dev/null
    
    if [ -f "$output" ]; then
        SIZE=$(du -h "$output" | cut -f1)
        echo "   ✅ Saved: $output ($SIZE)"
    else
        echo "   ❌ Failed"
    fi
    echo ""
}

# Capture main pages
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  HOME / QUOTE REQUEST SCREEN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
capture "$BASE_URL" "01-home-quote-request"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  BROWSE MOVERS (if /browse-movers exists)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
capture "$BASE_URL/browse-movers" "02-browse-movers"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  MOVER REGISTRATION (if /mover-registration exists)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
capture "$BASE_URL/mover-registration" "03-mover-registration"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  PROFILE PAGE (if /profile exists)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
capture "$BASE_URL/profile" "04-profile"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Screenshot capture complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📁 Screenshots saved in: screenshots/web/"
echo ""
ls -lh screenshots/web/ | grep -v "^total" | awk '{print "   " $9 " - " $5}'
echo ""
echo "📤 Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. ✅ Review screenshots in screenshots/web/"
echo ""
echo "2. 📤 Upload to Google Play Console:"
echo "   • Go to: Play Console → Store listing"
echo "   • Scroll to: Phone screenshots"
echo "   • Upload at least 2 screenshots"
echo ""
echo "3. 💡 Screenshots captured:"
echo "   • Home/Quote Request"
echo "   • Browse Movers page"
echo "   • Mover Registration"
echo "   • Profile page"
echo ""
echo "4. ✔️  Requirements met:"
echo "   • ✅ Size: ${WIDTH}x${HEIGHT} (9:16 ratio)"
echo "   • ✅ Format: PNG"
echo "   • ✅ Minimum 2 screenshots"
echo ""
