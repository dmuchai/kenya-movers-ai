#!/bin/bash
# Capture MoveLink screenshots for multiple device sizes
# Pages: Hero Landing (/) and Contact Form (/contact)

echo "📸 MoveLink Multi-Device Screenshot Capture"
echo "==========================================="
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

BASE_URL="https://moving-planner-ke.vercel.app"

# Device specifications
declare -A DEVICES=(
    ["phone"]="1080x1920"
    ["tablet-7inch"]="1200x1920"
    ["tablet-10inch"]="1600x2560"
)

# Pages to capture
declare -A PAGES=(
    ["01-hero-landing"]="/"
    ["04-contact-form"]="/contact"
)

# Create directories
for device in "${!DEVICES[@]}"; do
    mkdir -p "screenshots/$device"
done

echo "🎯 Devices: phone (1080x1920), tablet-7inch (1200x1920), tablet-10inch (1600x2560)"
echo "📄 Pages: Hero Landing, Contact Form"
echo ""

# Capture function
capture() {
    local device=$1
    local dimensions=$2
    local page_name=$3
    local page_url=$4
    local width=$(echo $dimensions | cut -d'x' -f1)
    local height=$(echo $dimensions | cut -d'x' -f2)
    local output_file="screenshots/$device/${page_name}.png"
    
    echo "📸 $page_name on $device ($dimensions)"
    echo "   URL: $BASE_URL$page_url"
    
    $CHROME --headless --disable-gpu \
        --window-size=$width,$height \
        --screenshot="$output_file" \
        --virtual-time-budget=8000 \
        "$BASE_URL$page_url" 2>/dev/null
    
    if [ -f "$output_file" ]; then
        SIZE=$(du -h "$output_file" | cut -f1)
        DIMS=$(identify "$output_file" 2>/dev/null | awk '{print $3}')
        echo "   ✅ Saved: $output_file ($SIZE, $DIMS)"
    else
        echo "   ❌ Failed"
    fi
    echo ""
}

# Main capture loop
for device in phone tablet-7inch tablet-10inch; do
    dimensions=${DEVICES[$device]}
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📱 Capturing for: $device ($dimensions)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    for page_name in "${!PAGES[@]}"; do
        page_url=${PAGES[$page_name]}
        capture "$device" "$dimensions" "$page_name" "$page_url"
    done
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 All screenshots captured successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Summary
echo "📊 Summary:"
echo ""
for device in phone tablet-7inch tablet-10inch; do
    echo "📱 $device:"
    ls -lh "screenshots/$device/"*.png 2>/dev/null | awk '{print "   " $9 " - " $5}'
    echo ""
done

echo "✅ Screenshots ready for Play Store upload:"
echo "   📱 Phone: screenshots/phone/"
echo "   📱 7-inch Tablet: screenshots/tablet-7inch/"
echo "   📱 10-inch Tablet: screenshots/tablet-10inch/"
echo ""
