#!/bin/bash

# EkoMilk Bluetooth Reader APK Builder
# This script helps build the APK for direct installation on Android devices

echo "🔨 EkoMilk Bluetooth Reader APK Builder"
echo "======================================="

# Check if Android SDK is installed
if [ -z "$ANDROID_HOME" ]; then
    echo "❌ Android SDK not found!"
    echo ""
    echo "📋 QUICK SOLUTIONS:"
    echo ""
    echo "1️⃣  EASIEST: Use GitHub Actions (recommended)"
    echo "   - Push this code to GitHub"
    echo "   - GitHub will automatically build APK"
    echo "   - Download APK from Actions tab"
    echo ""
    echo "2️⃣  CLOUD BUILD: Use online services"
    echo "   - expo.dev build service"
    echo "   - Firebase App Distribution"
    echo "   - CodeMagic CI/CD"
    echo ""
    echo "3️⃣  LOCAL SETUP: Install Android SDK"
    echo "   - Download Android Studio"
    echo "   - Set ANDROID_HOME environment variable"
    echo "   - Run this script again"
    echo ""
    echo "4️⃣  COPY TO ANOTHER MACHINE:"
    echo "   - Copy project to machine with Android Studio"
    echo "   - Run: cd android && ./gradlew assembleDebug"
    echo "   - APK will be in: android/app/build/outputs/apk/debug/"
    echo ""
    exit 1
fi

echo "✅ Android SDK found at: $ANDROID_HOME"
echo "📦 Installing dependencies..."

npm install --legacy-peer-deps

echo "🔨 Building debug APK..."
cd android
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 BUILD SUCCESS!"
    echo "================"
    echo ""
    echo "📱 APK Location:"
    echo "   android/app/build/outputs/apk/debug/app-debug.apk"
    echo ""
    echo "📲 Installation Instructions:"
    echo "   1. Transfer APK to your Android device"
    echo "   2. Enable 'Install from Unknown Sources' in device settings"
    echo "   3. Open APK file on device to install"
    echo "   4. Pair with HC-05 Bluetooth module (PIN: 1234 or 0000)"
    echo "   5. Launch 'EkoMilk Bluetooth Reader' app"
    echo "   6. Connect to HC-05 and start reading data!"
    echo ""
else
    echo ""
    echo "❌ BUILD FAILED!"
    echo "==============="
    echo ""
    echo "💡 Try these solutions:"
    echo "   1. Use GitHub Actions (push to GitHub)"
    echo "   2. Use a machine with complete Android setup"
    echo "   3. Check Android SDK installation"
    echo ""
fi
