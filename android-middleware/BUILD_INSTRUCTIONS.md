# Android Build Instructions

## Prerequisites

### System Requirements
- **Memory**: Minimum 4GB RAM, 8GB+ recommended
- **Storage**: At least 10GB free space
- **Java**: JDK 17 (OpenJDK or Oracle)
- **Android Studio**: Latest stable version (optional but recommended)

### Option 1: Build with Android Studio (Recommended)

1. **Install Android Studio**:
   - Download from: https://developer.android.com/studio
   - Install with default settings including Android SDK

2. **Open Project**:
   ```bash
   # Clone the repository
   git clone https://github.com/mastermind2990/ohr-shalom-kiosk.git
   cd ohr-shalom-kiosk
   
   # Open android-middleware folder in Android Studio
   ```

3. **Sync Project**:
   - Click "Sync Project with Gradle Files" when prompted
   - Wait for dependencies to download

4. **Build APK**:
   - **Debug**: `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
   - **Release**: `Build` → `Generate Signed Bundle / APK` → `APK`

### Option 2: Command Line Build

1. **Install Java 17**:
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install openjdk-17-jdk
   
   # macOS (with Homebrew)
   brew install openjdk@17
   
   # Windows (with Chocolatey)
   choco install openjdk17
   ```

2. **Install Android SDK**:
   ```bash
   # Download Android Studio or just Command Line Tools
   # Set environment variables:
   export ANDROID_HOME=/path/to/android/sdk
   export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

3. **Clone and Build**:
   ```bash
   git clone https://github.com/mastermind2990/ohr-shalom-kiosk.git
   cd ohr-shalom-kiosk/android-middleware
   
   # Make gradlew executable
   chmod +x gradlew
   
   # Build debug APK
   ./gradlew assembleDebug
   
   # Build release APK (unsigned)
   ./gradlew assembleRelease
   ```

## Build Outputs

### APK Locations
- **Debug APK**: `app/build/outputs/apk/debug/app-debug.apk`
- **Release APK**: `app/build/outputs/apk/release/app-release-unsigned.apk`

### Installation
```bash
# Install debug APK to connected device
adb install app/build/outputs/apk/debug/app-debug.apk

# Install release APK to connected device  
adb install app/build/outputs/apk/release/app-release-unsigned.apk
```

## Troubleshooting

### Memory Issues
If you encounter out-of-memory errors:

1. **Increase Gradle Memory**:
   ```properties
   # In gradle.properties
   org.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=1g
   ```

2. **Close Other Applications**: Free up system memory

3. **Use Gradle Daemon**: Remove `org.gradle.daemon=false` from gradle.properties

### Build Errors

1. **Clean Build**:
   ```bash
   ./gradlew clean
   ./gradlew assembleDebug
   ```

2. **Update Dependencies**:
   ```bash
   ./gradlew --refresh-dependencies assembleDebug
   ```

3. **Check Java Version**:
   ```bash
   java -version  # Should show Java 17
   ```

## GitHub Actions (Automated Building)

The repository includes GitHub Actions that automatically build APKs when you push changes:

1. **Trigger Build**: Push to main branch or create pull request
2. **Download APK**: Go to Actions tab → Select workflow run → Download artifacts
3. **Release**: APKs are automatically attached to GitHub releases

## Development Notes

- **Target SDK**: 34 (Android 14)
- **Min SDK**: 24 (Android 7.0)
- **Build Tools**: 34.0.0
- **Kotlin**: 1.9.25
- **Gradle Plugin**: 8.7.0

The app is configured for payment middleware functionality with Stripe integration and NFC capabilities.