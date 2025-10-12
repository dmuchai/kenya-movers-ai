# Quick Upload Guide - Version 1.0.1 to Closed Testing

## 📦 Files Ready to Upload

**Location:** `android/app/build/outputs/bundle/release/app-release.aab`
**Size:** ~3.4 MB
**Version:** 1.0.1 (Build 2)

---

## 🚀 Upload Steps

### 1. Go to Play Console
- URL: https://play.google.com/console
- Select your MoveLink app

### 2. Navigate to Closed Testing
```
Testing → Closed testing → Releases
```

### 3. Create New Release
Click **"Create new release"** button

### 4. Upload AAB
- Click **"Upload"** button
- Select: `android/app/build/outputs/bundle/release/app-release.aab`
- Wait for upload and processing (~1-2 minutes)

### 5. Add Release Name (Optional)
```
1.0.1 - Navigation & UX Improvements
```

### 6. Add Release Notes

**Copy this into the "Release notes" field:**

```
What's New in v1.0.1:

Navigation Improvements:
• Fixed Android back button - now navigates between pages properly
• Enhanced mobile menu with better sign-out button visibility

Form Experience:
• Specific validation messages show exactly what needs fixing
• Keyboard automatically scrolls input fields into view
• Forms work better on all screen sizes

Bug Fixes:
• Profile page now loads correctly
• Quote History displays your quotes properly
• Fixed status bar overlap on newer phones

We appreciate your feedback!
```

### 7. Review and Rollout
- Click **"Save"**
- Click **"Review release"**
- Verify everything looks correct
- Click **"Start rollout to Closed testing"**

### 8. Notify Testers
- Update should be available within 15-30 minutes
- Testers with auto-update will receive it automatically
- You can also send them a notification from Play Console

---

## 📧 Suggested Tester Notification

**Subject:** MoveLink v1.0.1 Update Available - Please Test!

**Message:**
```
Hi Team,

A new version (1.0.1) of MoveLink is now available in closed testing! 

This update fixes all the issues you reported:
✅ Back button now works properly
✅ Better keyboard handling
✅ Clear error messages on forms
✅ Profile and History pages load correctly
✅ Sign-out button is more visible

Please update the app and test especially:
1. Back button navigation
2. Filling out the quote form (try leaving fields empty)
3. Profile and History tabs
4. Finding the sign-out button in the menu

Your feedback is invaluable! Please report any new issues.

Thank you!
```

---

## ⏱️ Timeline

- **Upload & Processing:** 2-5 minutes
- **Available to Testers:** 15-30 minutes after rollout
- **Auto-update (if enabled):** Within 24 hours

---

## 📱 How Testers Get the Update

### Option 1: Manual Update
1. Open Google Play Store
2. Go to "My apps & games" or "Manage apps & device"
3. Find MoveLink
4. Tap "Update"

### Option 2: Auto-Update (If Enabled)
- App will update automatically within 24 hours
- Usually happens when device is on WiFi and charging

### Option 3: Via Testing Link
- Testers can visit their original testing opt-in link
- Should show the new version available

---

## ✅ Post-Upload Checklist

After uploading, verify in Play Console:

- [ ] Version code shows as 2
- [ ] Version name shows as 1.0.1
- [ ] Release notes are displayed correctly
- [ ] Status shows as "Rolling out" or "Available"
- [ ] No errors or warnings in the release
- [ ] Testers group is still active

---

## 🔍 Monitoring After Release

### Check These in Play Console:

1. **Crashes & ANRs**
   - Release → Closed testing → Track summary
   - Should see 0 crashes if everything works

2. **User Feedback**
   - Testing → Closed testing → Feedback
   - Monitor for any new issues

3. **Install Metrics**
   - Check how many testers have updated
   - Target: 80%+ within 48 hours

---

## 🆘 If Something Goes Wrong

### You Can:
1. **Stop Rollout** - Halts distribution immediately
2. **Create New Release** - Upload a fixed version
3. **Rollback** - Return to previous version (1.0.0)

### Common Issues:
- **"Version code must be greater"** - You already uploaded v2, increment to v3
- **"Signature mismatch"** - Using different keystore, ensure using movelink-release-key.keystore
- **"Processing failed"** - Re-build the AAB and upload again

---

## 📞 Need Help?

- Play Console Help: https://support.google.com/googleplay/android-developer
- Your keystore: `movelink-release-key.keystore` (keep this safe!)
- Keystore password: `movelink2025`

---

## 🎯 Success Criteria

Before promoting to Production:
- [ ] All critical bugs fixed
- [ ] No crashes reported by testers
- [ ] Positive feedback from at least 3 testers
- [ ] All key features tested (quote, profile, history, sign-out)
- [ ] Tested on at least 3 different Android devices
- [ ] Works on Android 5.1 - Android 14

---

**Ready to upload!** 🚀

Your AAB is signed, built, and ready at:
`android/app/build/outputs/bundle/release/app-release.aab`
