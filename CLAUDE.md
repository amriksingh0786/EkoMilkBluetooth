# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EkoMilk Bluetooth Reader - A React Native application for reading milk analysis data from EkoMilk devices via HC-05 Bluetooth module. This is a pure React Native CLI project without Expo dependencies.

## Architecture

### Core Technology Stack
- **React Native**: 0.72.6 (pure CLI, no Expo)
- **Bluetooth Library**: react-native-bluetooth-classic v1.60.0-rc.5
- **TypeScript**: 4.8.4
- **Android Target**: API 34 (Android 14)

### Key Components

**App.tsx** (Main Application):
- Handles Bluetooth device discovery and pairing
- Manages HC-05 connection state
- Parses EkoMilk data format (FAT, SNF, DENSITY, PROTEIN, etc.)
- Real-time data streaming and visualization
- Maintains connection persistence and auto-reconnection

**Data Parsing Pattern**:
The app parses milk parameters using regex patterns for:
- Fat, SNF, Density, Protein, Lactose, Water, Temperature
- Format: `FAT=3.5% SNF=8.2% DENSITY=1.028`

### Android Configuration

**Bluetooth Compatibility Patch**:
The project includes `patch-bluetooth-library.js` which automatically fixes:
- Android Gradle Plugin 8.0+ compatibility issues
- BuildConfig namespace corrections for react-native-bluetooth-classic
- Runs as postinstall script

## Development Commands

```bash
# Install dependencies (with compatibility patches)
npm install --legacy-peer-deps

# Run on Android device
npx react-native run-android

# Start Metro bundler
npm start

# Run tests
npm test

# Lint code
npm run lint

# Build APK locally
cd android && ./gradlew assembleDebug
# APK location: android/app/build/outputs/apk/debug/app-debug.apk

# Build Release APK
cd android && ./gradlew assembleRelease
# APK location: android/app/build/outputs/apk/release/app-release.apk

# Clean build
cd android && ./gradlew clean
```

## Testing Bluetooth Functionality

1. **Device Setup**: Pair HC-05 module in Android Settings first (PIN: 1234 or 0000)
2. **Launch App**: Device list will show paired Bluetooth devices
3. **Connect**: Tap HC-05 to establish connection
4. **Verify Data**: Monitor real-time milk analysis parameters and raw data stream

## CI/CD

**GitHub Actions** (`.github/workflows/build-apk.yml`):
- Automatically builds APK on push to main/master
- Uses JDK 17 and Android SDK 34
- Uploads release APK as artifact
- Build time: ~3-5 minutes

## Project Structure Notes

- **Native Android Modules**: Direct access without Expo limitations
- **Bluetooth Classic Support**: Full HC-05 compatibility (not BLE)
- **Offline Operation**: No development server dependency after installation
- **Production Ready**: Configured for Play Store deployment

## Common Development Tasks

### Modifying Bluetooth Data Parsing
Edit regex patterns in `App.tsx:114-122` to support new EkoMilk data formats.

### Adding New Milk Parameters
1. Add pattern to `patterns` object in `parseEkoMilkData()`
2. Add display component using `renderMilkParameter()`

### Debugging Connection Issues
- Check `messages` state for raw Bluetooth data
- Verify HC-05 pairing status in Android Settings
- Monitor `connectedDevice` state and `isConnecting` flag

### Building for Production
Ensure signing configuration is added to `android/app/build.gradle` before release builds.