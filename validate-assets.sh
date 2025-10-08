#!/bin/bash

# Google Play Store Asset Validator
# Checks if play-store-icon.png and feature-graphic meet Google Play requirements

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Google Play Store Asset Validator${NC}"
echo "====================================="
echo ""

# Check if ImageMagick is installed for SVG conversion
if ! command -v convert &> /dev/null; then
    echo -e "${YELLOW}⚠ Warning: ImageMagick not found. SVG conversion will be skipped.${NC}"
    echo "Install with: sudo apt-get install imagemagick"
    IMAGEMAGICK_AVAILABLE=false
else
    IMAGEMAGICK_AVAILABLE=true
fi

# Function to validate file requirements
validate_asset() {
    local file="$1"
    local asset_type="$2"
    local required_format="$3"
    local required_dimensions="$4"
    local max_size_mb="$5"
    
    echo -e "${YELLOW}📋 Validating $asset_type: $(basename "$file")${NC}"
    echo "================================================"
    
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ File not found: $file${NC}"
        return 1
    fi
    
    # Get file info
    file_info=$(file "$file")
    file_size=$(du -h "$file" | cut -f1)
    file_size_mb=$(du -m "$file" | cut -f1)
    
    echo "📁 File: $(basename "$file")"
    echo "📏 Size: $file_size (${file_size_mb}MB)"
    echo "🔍 Type: $file_info"
    
    # Check file format
    if [[ "$file_info" == *"$required_format"* ]]; then
        echo -e "${GREEN}✅ Format: $required_format (correct)${NC}"
        format_ok=true
    else
        echo -e "${RED}❌ Format: Expected $required_format${NC}"
        format_ok=false
    fi
    
    # Check file size
    if [ "$file_size_mb" -le "$max_size_mb" ]; then
        echo -e "${GREEN}✅ Size: ${file_size_mb}MB ≤ ${max_size_mb}MB (correct)${NC}"
        size_ok=true
    else
        echo -e "${RED}❌ Size: ${file_size_mb}MB > ${max_size_mb}MB (too large)${NC}"
        size_ok=false
    fi
    
    # Check dimensions for image files
    if [[ "$file_info" == *"image data"* ]]; then
        if command -v identify &> /dev/null; then
            dimensions=$(identify -format "%wx%h" "$file" 2>/dev/null)
            if [ $? -eq 0 ]; then
                echo "📐 Dimensions: $dimensions"
                if [ "$dimensions" = "$required_dimensions" ]; then
                    echo -e "${GREEN}✅ Dimensions: $dimensions (correct)${NC}"
                    dimensions_ok=true
                else
                    echo -e "${RED}❌ Dimensions: Expected $required_dimensions, got $dimensions${NC}"
                    dimensions_ok=false
                fi
            else
                echo -e "${YELLOW}⚠ Could not read dimensions${NC}"
                dimensions_ok=false
            fi
        else
            echo -e "${YELLOW}⚠ ImageMagick not available - cannot check dimensions${NC}"
            dimensions_ok=true  # Assume OK if we can't check
        fi
    else
        echo -e "${BLUE}ℹ Dimensions: SVG - scalable vector format${NC}"
        dimensions_ok=true
    fi
    
    # Overall status
    if [ "$format_ok" = true ] && [ "$size_ok" = true ] && [ "$dimensions_ok" = true ]; then
        echo -e "${GREEN}🎉 Overall: COMPLIANT${NC}"
        return 0
    else
        echo -e "${RED}❌ Overall: NON-COMPLIANT${NC}"
        return 1
    fi
}

# Google Play Store Requirements
echo -e "${BLUE}📋 Google Play Store Requirements:${NC}"
echo ""
echo "🎯 App Icon:"
echo "   • Format: PNG (required)"
echo "   • Dimensions: 512 x 512 pixels (required)"
echo "   • Max Size: 1 MB"
echo ""
echo "🎨 Feature Graphic:"
echo "   • Format: PNG or JPEG (required)"
echo "   • Dimensions: 1024 x 500 pixels (required)"
echo "   • Max Size: 15 MB"
echo ""

# Validate App Icon
if [ -f "play-store-icon.png" ]; then
    validate_asset "play-store-icon.png" "App Icon" "PNG" "512x512" 1
    icon_status=$?
else
    echo -e "${RED}❌ App Icon: play-store-icon.png not found${NC}"
    icon_status=1
fi

echo ""

# Check for Feature Graphic PNG
feature_png_found=false
if [ -f "feature-graphic.png" ]; then
    validate_asset "feature-graphic.png" "Feature Graphic" "PNG" "1024x500" 15
    feature_status=$?
    feature_png_found=true
elif [ -f "feature-graphic-updated.png" ]; then
    validate_asset "feature-graphic-updated.png" "Feature Graphic" "PNG" "1024x500" 15
    feature_status=$?
    feature_png_found=true
fi

# If no PNG found, check SVG and offer conversion
if [ "$feature_png_found" = false ]; then
    echo ""
    if [ -f "feature-graphic.svg" ]; then
        echo -e "${YELLOW}🎨 Feature Graphic: Found SVG version${NC}"
        echo "================================================"
        validate_asset "feature-graphic.svg" "Feature Graphic (SVG)" "SVG" "1024x500" 15
        svg_status=$?
        
        if [ "$IMAGEMAGICK_AVAILABLE" = true ]; then
            echo ""
            echo -e "${BLUE}🔄 Converting SVG to PNG for Google Play...${NC}"
            
            # Convert SVG to PNG
            if convert "feature-graphic.svg" -background none -density 300 "feature-graphic.png"; then
                echo -e "${GREEN}✅ Converted: feature-graphic.svg → feature-graphic.png${NC}"
                
                # Validate the new PNG
                echo ""
                validate_asset "feature-graphic.png" "Feature Graphic (Converted)" "PNG" "1024x500" 15
                feature_status=$?
            else
                echo -e "${RED}❌ SVG conversion failed${NC}"
                feature_status=1
            fi
        else
            echo -e "${YELLOW}⚠ Cannot convert SVG to PNG without ImageMagick${NC}"
            echo "Install with: sudo apt-get install imagemagick"
            feature_status=1
        fi
    else
        echo -e "${RED}❌ Feature Graphic: No PNG or SVG found${NC}"
        feature_status=1
    fi
fi

# Final Summary
echo ""
echo -e "${BLUE}📊 Validation Summary${NC}"
echo "===================="

if [ $icon_status -eq 0 ]; then
    echo -e "${GREEN}✅ App Icon: Ready for Google Play${NC}"
else
    echo -e "${RED}❌ App Icon: Needs fixes${NC}"
fi

if [ $feature_status -eq 0 ]; then
    echo -e "${GREEN}✅ Feature Graphic: Ready for Google Play${NC}"
else
    echo -e "${RED}❌ Feature Graphic: Needs fixes${NC}"
fi

echo ""

# Provide actionable recommendations
if [ $icon_status -ne 0 ] || [ $feature_status -ne 0 ]; then
    echo -e "${YELLOW}🔧 Recommended Actions:${NC}"
    echo ""
    
    if [ $icon_status -ne 0 ]; then
        echo "📱 App Icon Issues:"
        echo "   • Ensure play-store-icon.png exists"
        echo "   • Verify dimensions are exactly 512x512 pixels"
        echo "   • Ensure file is PNG format"
        echo "   • Keep file size under 1MB"
        echo ""
    fi
    
    if [ $feature_status -ne 0 ]; then
        echo "🎨 Feature Graphic Issues:"
        echo "   • Create feature-graphic.png with dimensions 1024x500"
        echo "   • Use PNG or JPEG format"
        echo "   • Keep file size under 15MB"
        if [ -f "feature-graphic.svg" ] && [ "$IMAGEMAGICK_AVAILABLE" = false ]; then
            echo "   • Install ImageMagick to convert SVG: sudo apt-get install imagemagick"
        fi
        echo ""
    fi
else
    echo -e "${GREEN}🎉 All assets are ready for Google Play Store upload!${NC}"
fi

# Show current assets
echo -e "${BLUE}📁 Current Assets:${NC}"
find . -maxdepth 1 \( -name "play-store-icon.*" -o -name "feature-graphic*" \) -type f | sort | while read file; do
    if [ -f "$file" ]; then
        size=$(du -h "$file" | cut -f1)
        echo "   📄 $(basename "$file") ($size)"
    fi
done