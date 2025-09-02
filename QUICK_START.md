# 🚀 EkoMilk Bluetooth Reader - Quick Start

## 📱 Get APK in 5 Minutes

### ⭐ **Method 1: GitHub Actions (Recommended)**

1. **Create GitHub Repository**:

   - Go to GitHub.com
   - Create new repository: `ekomilk-bluetooth`

2. **Upload Code**:

   ```bash
   git init
   git add .
   git commit -m "Initial EkoMilk Bluetooth Reader"
   git remote add origin https://github.com/YOURUSERNAME/ekomilk-bluetooth.git
   git push -u origin main
   ```

3. **Download APK**:
   - GitHub will automatically build the APK (3-5 minutes)
   - Go to: **Actions** tab → Click latest build → Download artifact
   - Extract and get `app-debug.apk`

### 🖥️ **Method 2: Machine with Android Studio**

If you have access to a computer with Android Studio:

```bash
# Copy this entire folder to that machine
cd android
./gradlew assembleDebug
```

APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

## 📲 Install on Your Phone

1. **Transfer APK** to your Android device (email, USB, cloud storage)
2. **Enable Unknown Sources**:
   - Settings → Security → Unknown Sources → Enable
   - Or Settings → Apps → Special Access → Install Unknown Apps
3. **Install APK** by tapping the file
4. **Pair HC-05** in Bluetooth settings (PIN: 1234 or 0000)
5. **Launch app** and enjoy!

## 🎯 **Test with EkoMilk Device**

1. **Power on** EkoMilk device with HC-05 connected
2. **Open app** → Tap HC-05 device to connect
3. **Start reading** milk analysis data in real-time!

## 🔧 **No EkoMilk Device? Test with Simulator**

Use "Serial Bluetooth Terminal" app:

1. Connect to HC-05
2. Send test data: `FAT=3.5% SNF=8.2% DENSITY=1.028 TEMP=25C`
3. Watch the app parse and display the data!

---

**🎉 Your native React Native app with full Bluetooth functionality is ready!**

No Expo limitations, no development server needed, works 100% offline!
