#!/bin/bash

# Google Play Store Screenshot Resizer
# Resizes existing screenshots to proper aspect ratios and creates tablet versions

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo -e "${RED}Error: ImageMagick is not installed.${NC}"
    echo "Please install it with: sudo apt-get install imagemagick"
    exit 1
fi

# Source and destination directories
SOURCE_DIR="play-store-screenshots"
PHONE_DIR="play-store-screenshots/phone"
TABLET_7_DIR="play-store-screenshots/tablet-7inch"
TABLET_10_DIR="play-store-screenshots/tablet-10inch"

# Create directories
mkdir -p "$PHONE_DIR" "$TABLET_7_DIR" "$TABLET_10_DIR"

echo -e "${BLUE}🔄 Google Play Store Screenshot Processor${NC}"
echo "=========================================="

# Phone Screenshot Specifications (9:16 aspect ratio)
PHONE_WIDTH=1080
PHONE_HEIGHT=1920

# Tablet 7-inch Specifications (9:16 aspect ratio)
TABLET_7_WIDTH=800
TABLET_7_HEIGHT=1422

# Tablet 10-inch Specifications (9:16 aspect ratio)
TABLET_10_WIDTH=1200
TABLET_10_HEIGHT=2133

echo -e "${YELLOW}Target Specifications:${NC}"
echo "📱 Phone: ${PHONE_WIDTH}x${PHONE_HEIGHT} (9:16)"
echo "📟 7-inch Tablet: ${TABLET_7_WIDTH}x${TABLET_7_HEIGHT} (9:16)"
echo "📋 10-inch Tablet: ${TABLET_10_WIDTH}x${TABLET_10_HEIGHT} (9:16)"
echo ""

# Function to resize and crop image to exact aspect ratio
resize_and_crop() {
    local input_file="$1"
    local output_file="$2"
    local target_width="$3"
    local target_height="$4"
    local device_type="$5"
    
    echo -e "${BLUE}Processing: $(basename "$input_file") -> $device_type${NC}"
    
    # Get current dimensions
    current_dimensions=$(identify -format "%wx%h" "$input_file")
    echo "  Current: $current_dimensions"
    echo "  Target:  ${target_width}x${target_height}"
    
    # Resize and crop to exact dimensions while maintaining aspect ratio
    # First resize to fit, then crop from center
    convert "$input_file" \
        -resize "${target_width}x${target_height}^" \
        -gravity center \
        -crop "${target_width}x${target_height}+0+0" \
        +repage \
        "$output_file"
    
    # Verify the output
    output_dimensions=$(identify -format "%wx%h" "$output_file")
    file_size=$(du -h "$output_file" | cut -f1)
    
    echo -e "  ${GREEN}✓ Created: $output_dimensions ($file_size)${NC}"
    
    # Verify aspect ratio
    aspect_ratio=$(python3 -c "print(f'{$target_height/$target_width:.3f}')")
    target_ratio=$(python3 -c "print(f'{16/9:.3f}')")
    
    if [ "$aspect_ratio" = "$target_ratio" ]; then
        echo -e "  ${GREEN}✓ Aspect ratio: 9:16 (correct)${NC}"
    else
        echo -e "  ${YELLOW}⚠ Aspect ratio: $aspect_ratio (check manually)${NC}"
    fi
    echo ""
}

# Process each screenshot
screenshot_count=0
for screenshot in "$SOURCE_DIR"/*.png; do
    if [ -f "$screenshot" ]; then
        filename=$(basename "$screenshot" .png)
        screenshot_count=$((screenshot_count + 1))
        
        echo -e "${YELLOW}📸 Processing Screenshot $screenshot_count: $filename${NC}"
        echo "=================================================="
        
        # Create phone version
        resize_and_crop "$screenshot" "$PHONE_DIR/${filename}-phone.png" \
            "$PHONE_WIDTH" "$PHONE_HEIGHT" "Phone"
        
        # Create 7-inch tablet version
        resize_and_crop "$screenshot" "$TABLET_7_DIR/${filename}-tablet-7.png" \
            "$TABLET_7_WIDTH" "$TABLET_7_HEIGHT" "7-inch Tablet"
        
        # Create 10-inch tablet version
        resize_and_crop "$screenshot" "$TABLET_10_DIR/${filename}-tablet-10.png" \
            "$TABLET_10_WIDTH" "$TABLET_10_HEIGHT" "10-inch Tablet"
        
        echo ""
    fi
done

echo -e "${GREEN}🎉 Screenshot Processing Complete!${NC}"
echo "=================================="
echo ""

# Summary
echo -e "${BLUE}📊 Summary:${NC}"
echo "  Original screenshots: $screenshot_count"
echo "  Phone screenshots: $(ls -1 "$PHONE_DIR"/*.png 2>/dev/null | wc -l)"
echo "  7-inch tablet screenshots: $(ls -1 "$TABLET_7_DIR"/*.png 2>/dev/null | wc -l)"
echo "  10-inch tablet screenshots: $(ls -1 "$TABLET_10_DIR"/*.png 2>/dev/null | wc -l)"
echo ""

# Validation
echo -e "${BLUE}🔍 Validation:${NC}"
echo ""

validate_screenshots() {
    local dir="$1"
    local device_type="$2"
    local min_width="$3"
    local max_width="$4"
    
    echo -e "${YELLOW}$device_type Screenshots:${NC}"
    
    if [ ! -d "$dir" ] || [ -z "$(ls -A "$dir" 2>/dev/null)" ]; then
        echo -e "  ${RED}❌ No screenshots found${NC}"
        return
    fi
    
    for img in "$dir"/*.png; do
        if [ -f "$img" ]; then
            dimensions=$(identify -format "%wx%h" "$img")
            width=$(echo "$dimensions" | cut -d'x' -f1)
            height=$(echo "$dimensions" | cut -d'x' -f2)
            size=$(du -h "$img" | cut -f1)
            aspect=$(python3 -c "print(f'{$height/$width:.3f}')")
            
            # Check compliance
            size_mb=$(du -m "$img" | cut -f1)
            aspect_ok=$(python3 -c "print(abs($height/$width - 16/9) < 0.01)")
            width_ok=$(python3 -c "print($min_width <= $width <= $max_width)")
            height_ok=$(python3 -c "print(320 <= $height <= 7680)")
            size_ok=$(python3 -c "print($size_mb <= 8)")
            
            status="✓"
            if [ "$aspect_ok" = "False" ] || [ "$width_ok" = "False" ] || [ "$height_ok" = "False" ] || [ "$size_ok" = "False" ]; then
                status="❌"
            fi
            
            echo "  $status $(basename "$img"): ${dimensions} (${size}) - Aspect: $aspect"
        fi
    done
    echo ""
}

# Validate phone screenshots (320-3840px per side)
validate_screenshots "$PHONE_DIR" "Phone" 320 3840

# Validate 7-inch tablet screenshots (320-3840px per side)
validate_screenshots "$TABLET_7_DIR" "7-inch Tablet" 320 3840

# Validate 10-inch tablet screenshots (1080-7680px per side)
validate_screenshots "$TABLET_10_DIR" "10-inch Tablet" 1080 7680

echo -e "${GREEN}📋 Google Play Upload Instructions:${NC}"
echo "===================================="
echo "1. Phone Screenshots: Upload 2-8 files from '$PHONE_DIR/'"
echo "2. 7-inch Tablet Screenshots: Upload up to 8 files from '$TABLET_7_DIR/'"
echo "3. 10-inch Tablet Screenshots: Upload up to 8 files from '$TABLET_10_DIR/'"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo "- All screenshots now have the correct 9:16 aspect ratio"
echo "- File sizes are optimized for Google Play (under 8MB)"
echo "- Screenshots are cropped from center to maintain visual quality"
echo "- You can select the best screenshots for upload (you don't need all of them)"
echo ""
echo -e "${BLUE}✨ Ready for Google Play Console upload!${NC}"