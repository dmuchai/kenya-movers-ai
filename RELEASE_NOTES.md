# MoveLink Android Release Package

## 📦 Release Files

### Play Store Release (AAB)
**Location:** `android/app/build/outputs/bundle/release/app-release.aab`
- **File Size:** 3.4 MB
- **Build Date:** October 10, 2025
- **Version:** 1.0.0 (Version Code: 1)
- **Format:** Android App Bundle (AAB) - **Upload this to Google Play Store**

### Testing Release (APK)
**Location:** `android/app/build/outputs/apk/release/app-release.apk`
- **File Size:** 2.6 MB
- **Build Date:** October 10, 2025
- **Version:** 1.0.0 (Version Code: 1)
- **Format:** Signed APK - Use for testing before Play Store submission

---

## 🔐 Release Signing Information

### Keystore Details
- **Keystore File:** `movelink-release-key.keystore` (project root)
- **Keystore Type:** PKCS12
- **Key Alias:** `movelink-key-alias`
- **Validity:** 10,000 days (expires ~2052)
- **Key Algorithm:** RSA 2048-bit
- **Certificate:** Self-signed

### Organization Details
- **CN:** MoveLink
- **OU:** MoveLink
- **O:** MoveLink
- **L:** Nairobi
- **ST:** Nairobi
- **C:** KE (Kenya)

### ⚠️ IMPORTANT - SECURE THESE CREDENTIALS
The keystore passwords are stored in `android/keystore.properties`:
- Store Password: `movelink2025`
- Key Password: `movelink2025`

**NEVER commit keystore.properties or the .keystore file to public repositories!**

---

## 📱 App Information

### Application ID
- **Production:** `com.movingplanner.app`
- **Debug:** `com.movingplanner.app.debug`

### Version Information
- **Version Name:** 1.0.0
- **Version Code:** 1
- **Target SDK:** 34 (Android 14)
- **Min SDK:** 22 (Android 5.1)

### Namespace
- `com.movingplanner.app`

---

## 🚀 What's Included in This Release

### Features
✅ **Complete MoveLink Rebrand**
- New MoveLink branded icons (all densities)
- Updated app name and branding throughout
- New color scheme (orange/cream/teal)

✅ **Core Functionality**
- Customer quote request system
- Mover registration and profiles
- Authentication and authorization
- Role-based access control
- File upload (profile images, documents)
- Location-based services (PostGIS)
- Real-time notifications

✅ **Bug Fixes**
- Fixed authentication loading states
- Fixed sign out hanging issue
- Fixed duplicate registrations
- Fixed storage bucket permissions
- Fixed role assignment logic

✅ **Performance Optimizations**
- Code minification enabled (R8)
- Resource shrinking enabled
- ProGuard optimization
- Asset compression

---

## 📤 Uploading to Google Play Store

### Step 1: Prepare Play Console
1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app or select existing app
3. Fill in app details:
   - **App Name:** MoveLink - Kenya Moving Planner
   - **Short Description:** Connect with trusted movers in Kenya
   - **Full Description:** (See STORE_LISTING.md for full text)
   - **App Category:** Business
   - **Tags:** Moving, Logistics, Kenya, Movers, Transportation

### Step 2: Upload Release Bundle
1. Navigate to: **Release** → **Production** → **Create new release**
2. Upload: `android/app/build/outputs/bundle/release/app-release.aab`
3. Release name: `1.0.0 - Initial Release`
4. Release notes:
   ```
   🎉 Welcome to MoveLink!
   
   - Find and compare trusted moving companies in Kenya
   - Get instant quotes from multiple movers
   - Secure online booking and payment
   - Real-time tracking and notifications
   - Rate and review your moving experience
   ```

### Step 3: Store Listing
1. Upload app icon: `play-store-icon.png` (512x512)
2. Upload screenshots (required):
   - Take screenshots of key features
   - Minimum 2 screenshots per device type
3. Upload feature graphic (1024x500, optional but recommended)
4. Set content rating questionnaire
5. Set pricing: Free
6. Select countries: Kenya (primary), can expand later

### Step 4: Review and Publish
1. Complete all sections (marked with red exclamation marks)
2. Review app content declarations
3. Submit for review
4. Google typically reviews within 1-3 days

---

## 🧪 Testing Before Submission

### Install Signed APK
```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

### Test Checklist
- [ ] App icon displays correctly
- [ ] Splash screen shows properly
- [ ] User registration works
- [ ] User login works
- [ ] Mover registration works
- [ ] Quote request works
- [ ] File uploads work
- [ ] Notifications work
- [ ] Sign out works
- [ ] No crashes or freezes

### Common Issues
- **Installation blocked:** Enable "Install from unknown sources"
- **Sign-in issues:** Check Supabase configuration
- **Upload failures:** Verify storage bucket permissions
- **Location errors:** Verify PostGIS and Google Maps API

---

## 🔄 Future Releases

### To Build New Release (Version 1.0.1):

1. **Update version** in `android/app/build.gradle`:
   ```gradle
   versionCode 2
   versionName "1.0.1"
   ```

2. **Build and sync**:
   ```bash
   npm run build
   npx cap sync android
   ```

3. **Build release bundle**:
   ```bash
   cd android
   ./gradlew bundleRelease
   ```

4. **Upload to Play Console** as new release

### Version Increment Rules
- **Patch (1.0.X):** Bug fixes, minor changes
- **Minor (1.X.0):** New features, non-breaking changes
- **Major (X.0.0):** Breaking changes, major redesigns

---

## 📞 Support

For issues or questions:
- Email: support@movelink.co.ke
- GitHub: https://github.com/dmuchai/kenya-movers-ai

---

## 📄 License

Copyright © 2025 MoveLink. All rights reserved.
