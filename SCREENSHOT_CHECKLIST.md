# 📸 MoveLink Screenshot Quick Reference

## 🚀 Your App is Running
**URL**: http://localhost:8080 ✅

## 📱 Chrome Setup (Do First)
1. **Open Chrome** → Navigate to http://localhost:8080
2. **Press F12** → Open Developer Tools  
3. **Click 📱 icon** → Toggle device toolbar
4. **Select device**: iPhone 12 Pro (390x844) or Pixel 5 (393x851)
5. **Set zoom**: 100%

## 📸 Screenshots to Take

### 1️⃣ HERO LANDING PAGE ⭐ PRIORITY
- **URL**: http://localhost:8080/
- **Focus**: Hero section, headline, navigation
- **Save as**: `01-hero-landing.png`

### 2️⃣ QUOTE FORM - EMPTY ⭐ PRIORITY  
- **URL**: http://localhost:8080/
- **Focus**: Clean form interface, all fields visible
- **Save as**: `02-quote-form-empty.png`

### 3️⃣ QUOTE FORM - FILLED ⭐ PRIORITY
- **URL**: http://localhost:8080/
- **Fill with**:
  - From: "Nairobi CBD, Kenya"
  - To: "Mombasa, Kenya"  
  - Type: "3 Bedroom House"
- **Save as**: `03-quote-form-filled.png`

### 4️⃣ CONTACT FORM
- **URL**: http://localhost:8080/
- **Action**: Submit quote form to see contact step
- **Save as**: `04-contact-form.png`

### 5️⃣ RESULTS/SUCCESS
- **URL**: http://localhost:8080/
- **Action**: Complete contact form to see results
- **Save as**: `05-results.png`

## 🎯 Screenshot Method
1. **Right-click** in mobile viewport
2. **Select**: "Capture screenshot" OR
3. **Use**: Ctrl+Shift+P → "Capture screenshot"
4. **Save to**: `./play-store-screenshots/`

## ✅ Quality Checklist
- [ ] Text is readable and crisp
- [ ] No loading states or errors shown
- [ ] Professional appearance
- [ ] Brand colors visible
- [ ] Mobile layout looks good
- [ ] All UI elements properly aligned

## 🚀 Run Interactive Helper
```bash
./screenshot-helper.sh
```

## 📁 Save Location
```
play-store-screenshots/
├── 01-hero-landing.png
├── 02-quote-form-empty.png  
├── 03-quote-form-filled.png
├── 04-contact-form.png
└── 05-results.png
```

## 🎨 Files Ready for Upload
- ✅ Screenshots (what you're creating now)
- ✅ App icon: `play-store-icon.png` (512x512)
- ✅ Feature graphic: `feature-graphic.png` (1024x500)
- ✅ AAB file: `android/app/build/outputs/bundle/release/app-release.aab`