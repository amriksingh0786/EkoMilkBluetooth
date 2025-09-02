#!/usr/bin/env node

/**
 * Patch script for react-native-bluetooth-classic library
 * This script fixes compatibility issues with Android Gradle Plugin 8.0+
 */

const fs = require('fs');
const path = require('path');

const buildGradlePath = path.join(__dirname, 'node_modules/react-native-bluetooth-classic/android/build.gradle');
const manifestPath = path.join(__dirname, 'node_modules/react-native-bluetooth-classic/android/src/main/AndroidManifest.xml');

if (fs.existsSync(buildGradlePath)) {
  console.log('🔧 Patching react-native-bluetooth-classic for AGP 8.0+ compatibility...');
  
  let content = fs.readFileSync(buildGradlePath, 'utf8');
  
  // Add namespace if not present
  if (!content.includes('namespace')) {
    content = content.replace(
      /android\s*\{/,
      `android {
    compileSdkVersion 34
    buildToolsVersion "33.0.0"
    namespace 'io.github.kenjdavidson.bluetooth'`
    );
    
    // Update SDK versions
    content = content.replace(/compileSdkVersion 29/, 'compileSdkVersion 34');
    content = content.replace(/targetSdkVersion 29/, 'targetSdkVersion 34');
    content = content.replace(/minSdkVersion 16/, 'minSdkVersion 21');
    content = content.replace(/buildToolsVersion "28.0.3"/, 'buildToolsVersion "33.0.0"');
    
    // Update Java compatibility
    content = content.replace(
      /sourceCompatibility = '1\.8'/,
      'sourceCompatibility JavaVersion.VERSION_11'
    );
    content = content.replace(
      /targetCompatibility = '1\.8'/,
      'targetCompatibility JavaVersion.VERSION_11'
    );
    
    fs.writeFileSync(buildGradlePath, content);
    console.log('✅ Successfully patched react-native-bluetooth-classic');
  } else {
    console.log('✅ react-native-bluetooth-classic already patched');
  }
} else {
  console.log('⚠️  react-native-bluetooth-classic build.gradle not found');
}

// Patch AndroidManifest.xml to remove deprecated package attribute
if (fs.existsSync(manifestPath)) {
  console.log('🔧 Patching AndroidManifest.xml to remove deprecated package attribute...');
  
  let manifestContent = fs.readFileSync(manifestPath, 'utf8');
  
  // Check if already patched
  if (!manifestContent.includes('package="kjd.reactnative.bluetooth"')) {
    console.log('✅ AndroidManifest.xml already patched');
  } else {
    // Remove the package attribute from the manifest tag
    manifestContent = manifestContent.replace(
      /package="[^"]*"/g,
      ''
    );
    
    // Clean up any double spaces or trailing spaces in the manifest tag
    manifestContent = manifestContent.replace(
      /<manifest\s+([^>]*)\s*>/,
      (match, attributes) => {
        // Clean up whitespace in attributes
        const cleanAttributes = attributes.replace(/\s+/g, ' ').trim();
        return `<manifest ${cleanAttributes}>`;
      }
    );
    
    fs.writeFileSync(manifestPath, manifestContent, 'utf8');
    console.log('✅ AndroidManifest.xml patched successfully!');
  }
} else {
  console.warn('⚠️ react-native-bluetooth-classic AndroidManifest.xml not found. Skipping manifest patch.');
}
