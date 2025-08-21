# 🚀 GitHub Actions Setup for Automated Android APK Building

## Quick Setup Instructions

### Step 1: Create Workflow Directory
In your repository on GitHub.com:
1. Navigate to your repository: `https://github.com/mastermind2990/ohr-shalom-kiosk`
2. Click **"Create new file"**
3. Type: `.github/workflows/android-build.yml`
4. GitHub will automatically create the directory structure

### Step 2: Copy Workflow Content
Paste this exact content into the file:

```yaml
name: Android Build

on:
  push:
    branches: [ main ]
    paths: [ 'android-middleware/**' ]
  pull_request:
    branches: [ main ]
    paths: [ 'android-middleware/**' ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout repository
      uses: actions/checkout@v4
      
    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'
        
    - name: Setup Android SDK
      uses: android-actions/setup-android@v3
      
    - name: Cache Gradle packages
      uses: actions/cache@v4
      with:
        path: |
          ~/.gradle/caches
          ~/.gradle/wrapper
        key: ${{ runner.os }}-gradle-${{ hashFiles('**/*.gradle*', '**/gradle-wrapper.properties') }}
        restore-keys: |
          ${{ runner.os }}-gradle-
          
    - name: Grant execute permission for gradlew
      run: chmod +x android-middleware/gradlew
      
    - name: Build debug APK
      run: |
        cd android-middleware
        ./gradlew assembleDebug --stacktrace
        
    - name: Build release APK (unsigned)
      run: |
        cd android-middleware
        ./gradlew assembleRelease --stacktrace
        
    - name: Upload Debug APK
      uses: actions/upload-artifact@v4
      with:
        name: payment-middleware-debug-apk
        path: android-middleware/app/build/outputs/apk/debug/app-debug.apk
        
    - name: Upload Release APK
      uses: actions/upload-artifact@v4
      with:
        name: payment-middleware-release-apk
        path: android-middleware/app/build/outputs/apk/release/app-release-unsigned.apk

    - name: Create Release
      if: github.ref == 'refs/heads/main' && github.event_name == 'push'
      uses: softprops/action-gh-release@v1
      with:
        tag_name: v${{ github.run_number }}
        name: Payment Middleware v${{ github.run_number }}
        body: |
          Automated build of Payment Middleware Android app
          
          **Changes:**
          ${{ github.event.head_commit.message }}
          
          **Download APK Files:**
          - Debug APK: For testing and development
          - Release APK: Production version (unsigned)
        files: |
          android-middleware/app/build/outputs/apk/debug/app-debug.apk
          android-middleware/app/build/outputs/apk/release/app-release-unsigned.apk
        draft: false
        prerelease: false
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Step 3: Commit the Workflow
1. Add commit message: `Add GitHub Actions workflow for Android APK building`
2. Click **"Commit new file"**

## 🎯 How It Works

### Automatic Triggers
- **On Push**: Builds APK whenever you push changes to `android-middleware/` folder
- **On Pull Request**: Builds APK to test proposed changes
- **Manual**: You can trigger builds manually from Actions tab

### Build Process
1. **Setup Environment**: Ubuntu runner with JDK 17 and Android SDK
2. **Cache Dependencies**: Speeds up subsequent builds
3. **Build APKs**: Creates both debug and release versions
4. **Upload Artifacts**: Makes APKs downloadable from GitHub
5. **Create Release**: Automatically creates GitHub release with APK files

### Download Your APKs

#### Method 1: From Actions Tab
1. Go to **Actions** tab in GitHub
2. Click on latest workflow run
3. Scroll down to **Artifacts** section
4. Download:
   - `payment-middleware-debug-apk`
   - `payment-middleware-release-apk`

#### Method 2: From Releases
1. Go to **Releases** section in GitHub
2. Download APK files from latest release

## 🔧 Build Details

- **Debug APK**: `app-debug.apk` - For testing, includes debug symbols
- **Release APK**: `app-release-unsigned.apk` - Production build, unsigned
- **Build Time**: ~5-10 minutes depending on dependencies
- **GitHub Storage**: APKs stored for 90 days by default

## 🚀 Next Steps

1. **Set up the workflow** using instructions above
2. **Test it**: Make any small change to `android-middleware/` and push
3. **Monitor build**: Check Actions tab to watch the build progress
4. **Download APK**: Get your built APK from artifacts or releases

The workflow is designed to be robust and handle all the configuration issues we fixed. It should build successfully on the first run!