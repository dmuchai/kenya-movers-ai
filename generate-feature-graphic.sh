#!/bin/bash

# Google Play Feature Graphic Generator
# Creates a 1024x500 feature graphic using the existing app icon

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎨 Google Play Feature Graphic Generator${NC}"
echo "=========================================="
echo ""

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo -e "${RED}Error: ImageMagick is not installed.${NC}"
    echo "Please install it with: sudo apt-get install imagemagick"
    exit 1
fi

# Check if app icon exists
if [ ! -f "play-store-icon.png" ]; then
    echo -e "${RED}Error: play-store-icon.png not found.${NC}"
    echo "Please ensure the app icon exists in the current directory."
    exit 1
fi

echo -e "${YELLOW}📱 Using app icon: play-store-icon.png${NC}"

# Feature graphic specifications
FEATURE_WIDTH=1024
FEATURE_HEIGHT=500

# App branding colors (matching your app theme)
BACKGROUND_COLOR="#F0F9FF"      # Light blue background
ACCENT_COLOR="#F97316"          # Orange accent
TEXT_COLOR="#1F2937"            # Dark gray text
SECONDARY_TEXT="#6B7280"        # Light gray text

echo -e "${BLUE}🎯 Creating feature graphic with:${NC}"
echo "   • Dimensions: ${FEATURE_WIDTH}x${FEATURE_HEIGHT}"
echo "   • Background: $BACKGROUND_COLOR"
echo "   • Accent: $ACCENT_COLOR"
echo "   • Text: $TEXT_COLOR"
echo ""

# Create the feature graphic
echo -e "${YELLOW}🔨 Generating feature graphic...${NC}"

# Method 1: Modern design with icon, text, and gradient
convert -size ${FEATURE_WIDTH}x${FEATURE_HEIGHT} \
    gradient:"$BACKGROUND_COLOR"-"#EBF8FF" \
    \( -clone 0 -fill "$ACCENT_COLOR" -colorize 5% \) \
    -compose multiply -composite \
    \( play-store-icon.png -resize 180x180 \) \
    -geometry +80+160 -composite \
    \( -background none -fill "$TEXT_COLOR" -font Arial-Bold -pointsize 64 \
       label:"MoveLink" \) \
    -geometry +300+140 -composite \
    \( -background none -fill "$SECONDARY_TEXT" -font Arial -pointsize 28 \
       label:"Kenya Moving Planner" \) \
    -geometry +300+220 -composite \
    \( -background none -fill "$ACCENT_COLOR" -font Arial -pointsize 24 \
       label:"• Get instant quotes from verified movers" \) \
    -geometry +300+280 -composite \
    \( -background none -fill "$ACCENT_COLOR" -font Arial -pointsize 24 \
       label:"• Compare prices and services easily" \) \
    -geometry +300+320 -composite \
    \( -background none -fill "$ACCENT_COLOR" -font Arial -pointsize 24 \
       label:"• Plan your move with confidence" \) \
    -geometry +300+360 -composite \
    feature-graphic.png

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Feature graphic created successfully!${NC}"
else
    echo -e "${RED}❌ Failed to create feature graphic with text. Trying simpler version...${NC}"
    
    # Method 2: Simpler version if fonts fail
    convert -size ${FEATURE_WIDTH}x${FEATURE_HEIGHT} \
        gradient:"$BACKGROUND_COLOR"-"#EBF8FF" \
        \( play-store-icon.png -resize 200x200 \) \
        -gravity west -geometry +100+0 -composite \
        \( -background none -fill "$TEXT_COLOR" -pointsize 72 \
           label:"MoveLink" \) \
        -gravity center -geometry +150+0 -composite \
        feature-graphic.png
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Simple feature graphic created successfully!${NC}"
    else
        echo -e "${RED}❌ Failed to create simple version. Trying basic version...${NC}"
        
        # Method 3: Most basic version
        convert -size ${FEATURE_WIDTH}x${FEATURE_HEIGHT} \
            xc:"$BACKGROUND_COLOR" \
            \( play-store-icon.png -resize 240x240 \) \
            -gravity center -composite \
            feature-graphic.png
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Basic feature graphic created successfully!${NC}"
        else
            echo -e "${RED}❌ All methods failed. Please check ImageMagick installation.${NC}"
            exit 1
        fi
    fi
fi

echo ""

# Validate the created feature graphic
echo -e "${BLUE}🔍 Validating created feature graphic...${NC}"

if [ -f "feature-graphic.png" ]; then
    # Get file info
    file_info=$(file feature-graphic.png)
    file_size=$(du -h feature-graphic.png | cut -f1)
    dimensions=$(identify -format "%wx%h" feature-graphic.png)
    
    echo "📁 File: feature-graphic.png"
    echo "📏 Size: $file_size"
    echo "📐 Dimensions: $dimensions"
    echo "🔍 Type: $file_info"
    
    # Check compliance
    if [ "$dimensions" = "${FEATURE_WIDTH}x${FEATURE_HEIGHT}" ]; then
        echo -e "${GREEN}✅ Dimensions: Correct (${FEATURE_WIDTH}x${FEATURE_HEIGHT})${NC}"
        
        if [[ "$file_info" == *"PNG"* ]]; then
            echo -e "${GREEN}✅ Format: PNG (correct)${NC}"
            
            file_size_mb=$(du -m feature-graphic.png | cut -f1)
            if [ "$file_size_mb" -le 15 ]; then
                echo -e "${GREEN}✅ Size: ${file_size_mb}MB ≤ 15MB (correct)${NC}"
                echo ""
                echo -e "${GREEN}🎉 Feature graphic is ready for Google Play Store!${NC}"
                
                # Show preview info
                echo ""
                echo -e "${BLUE}📋 Upload Instructions:${NC}"
                echo "1. Go to Google Play Console → Store listing → Graphics"
                echo "2. Upload feature-graphic.png in the 'Feature graphic' section"
                echo "3. The graphic will appear prominently on your app's store page"
                echo ""
                echo -e "${YELLOW}💡 Design Features:${NC}"
                echo "• Uses your app icon as the focal point"
                echo "• Professional gradient background"
                echo "• Brand-consistent colors"
                echo "• Optimized for Google Play display"
                
            else
                echo -e "${RED}❌ Size: ${file_size_mb}MB > 15MB (too large)${NC}"
            fi
        else
            echo -e "${RED}❌ Format: Not PNG${NC}"
        fi
    else
        echo -e "${RED}❌ Dimensions: Expected ${FEATURE_WIDTH}x${FEATURE_HEIGHT}, got $dimensions${NC}"
    fi
else
    echo -e "${RED}❌ Feature graphic was not created${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}✨ Feature graphic generation complete!${NC}"