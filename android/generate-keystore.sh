#!/bin/bash

# MoveEasy Release Keystore Generation Script
# This creates the keystore needed to sign your production app

echo "=========================================="
echo "MoveEasy Release Keystore Generator"
echo "=========================================="
echo ""
echo "⚠️  IMPORTANT: Save the passwords and information you enter!"
echo "    You'll need them every time you update the app."
echo ""
echo "Generating keystore with:"
echo "  - Keystore name: moveeasy-release-key.keystore"
echo "  - Alias: moveeasy-key-alias"
echo "  - Validity: 10,000 days (27+ years)"
echo ""
echo "You will be prompted for:"
echo "  1. Keystore password (choose a strong password)"
echo "  2. Key password (can be same as keystore password)"
echo "  3. Your details (name, organization, city, country)"
echo ""
read -p "Press Enter to continue..."

keytool -genkeypair \
  -v \
  -storetype PKCS12 \
  -keystore moveeasy-release-key.keystore \
  -alias moveeasy-key-alias \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Keystore generated successfully!"
    echo ""
    echo "📁 Location: $(pwd)/moveeasy-release-key.keystore"
    echo ""
    echo "🔒 CRITICAL: Back up this file and passwords securely!"
    echo "   - Store keystore in a safe location (outside of git)"
    echo "   - Save passwords in a password manager"
    echo "   - If you lose these, you can't update the app!"
    echo ""
else
    echo ""
    echo "❌ Keystore generation failed!"
    exit 1
fi
