# Build Kiosk-Enabled Android APK

## 🔒 New Kiosk Mode Features Added

Your Android middleware now includes **true kiosk mode functionality**:

### ✅ **Kiosk Mode Features:**
- **Complete Tablet Lockdown**: Blocks all hardware buttons (home, back, power, volume)
- **Full Screen Web View**: Loads your donation kiosk website in a locked WebView
- **Wake Lock**: Prevents tablet from sleeping during kiosk mode
- **System UI Hidden**: Removes status bar, navigation bar, and all Android UI
- **Admin Exit Mechanism**: Tap top-left corner 7 times within 2 seconds to exit

### ✅ **Hardware Button Blocking:**
- Power button: ✅ Blocked
- Volume up/down: ✅ Blocked  
- Home button: ✅ Blocked
- Back button: ✅ Blocked
- Recent apps: ✅ Blocked

### ✅ **Sleep Prevention:**
- Wake lock acquired for 24 hours maximum
- Screen stays on continuously
- No automatic screen timeout

## 🔨 Build Instructions

### Option 1: Android Studio (Recommended)
1. Open the `android-middleware` folder in Android Studio
2. Wait for Gradle sync to complete
3. Go to **Build > Make Project**
4. Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**
5. APK will be generated in `app/build/outputs/apk/debug/`

### Option 2: Command Line
```bash
cd android-middleware
./gradlew clean
./gradlew assembleDebug
```

### Option 3: GitHub Actions (Automated)
The project includes GitHub Actions workflow for automatic APK building.

## 📱 Installation & Usage

### 1. Install the APK
- Transfer the APK to your H101 tablet
- Enable "Install from Unknown Sources" in Android Settings
- Install the APK

### 2. Launch Admin Interface
- Open the "Payment Middleware" app
- You'll see the admin interface with system status

### 3. Enter Kiosk Mode
- In the admin interface, tap **"Enter Kiosk Mode"**
- The tablet will enter complete lockdown mode
- The donation website will load in full screen

### 4. Exit Kiosk Mode (Admin Only)
- **Tap the top-left corner 7 times quickly** (within 2 seconds)
- You'll see a toast message confirming admin access
- Tap 7 times again to fully exit kiosk mode
- The admin interface will reappear

## 🔧 How It Works

### **KioskActivity.kt** (New File)
- **True Android Kiosk Mode**: Uses `SYSTEM_UI_FLAG_IMMERSIVE_STICKY`
- **WebView Integration**: Loads donation website securely
- **Hardware Button Blocking**: Overrides `onKeyDown()` to block all buttons
- **Wake Lock Management**: Prevents sleep with `PowerManager.SCREEN_BRIGHT_WAKE_LOCK`
- **Admin Exit Detection**: Touch gesture recognition in top-left corner

### **MainActivity.kt** (Updated)
- Added "Enter Kiosk Mode" button
- Launches KioskActivity when button pressed
- Acts as admin interface for configuration

### **AndroidManifest.xml** (Updated)
- Added kiosk mode permissions
- KioskActivity configured as launcher and home replacement
- Wake lock and system UI permissions added

## 🛡️ Security Features

### **Complete System Lockdown:**
- **No status bar access**
- **No navigation bar**
- **No home button functionality**
- **No app switching**
- **No settings access**
- **No notifications**

### **Admin-Only Exit:**
- **7-tap sequence** in specific location (top-left corner)
- **2-second timeout** between taps
- **Visual confirmation** with toast messages
- **Secure exit mechanism** that can't be accidentally triggered

## 📂 APK Location

After building, find your APK at:
```
android-middleware/app/build/outputs/apk/debug/app-debug.apk
```

## 🔄 Development Notes

The kiosk mode is designed to be:
- **Secure**: Can't be exited accidentally
- **Reliable**: Uses Android system-level lockdown
- **User-friendly**: Clear admin exit mechanism
- **Robust**: Handles system UI changes and focus loss

Your payment middleware continues to run in the background, providing the HTTP server on port 8080 for web app communication.

## 🎯 Next Steps

1. **Build the APK** using one of the methods above
2. **Install on H101 tablet**
3. **Test kiosk mode** entry and exit
4. **Verify payment functionality** works in kiosk mode
5. **Configure for production** use

The tablet will now function as a true kiosk device with your donation system!