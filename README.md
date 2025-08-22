# Ohr Shalom Donation Kiosk - Full Stack Solution

## Project Overview
- **Name**: Ohr Shalom Donation Kiosk  
- **Goal**: Complete donation kiosk solution with web interface + Android middleware for NFC Tap to Pay
- **Architecture**: Web kiosk (browser) ↔ HTTP API (localhost:8080) ↔ Android app (Stripe SDK + NFC)

## 🌟 Key Features

### ✅ Currently Implemented

#### Web Kiosk Interface
- **Enhanced UI/UX** - Smooth animations, visual feedback, and modern design
- **Hebrew Calendar & Prayer Times** - Real-time data with live clock from Hebcal API using Orlando, FL location
- **Tablet-Optimized Interface** - Landscape orientation, touch-friendly design with interactive hover effects
- **Admin Access System** - PIN-protected configuration (5 logo taps → PIN: 12345)
- **Auto Photo Capture** - Silent photo capture on successful donations
- **Hebrew Text Support** - RTL text rendering with proper fonts and chai value displays
- **Preset Donation Amounts** - $5, $18 (חי/Chai), $36 (Double חי), Custom with Hebrew significance
- **Email Receipt Collection** - Optional email input for receipts
- **Progressive Payment Flow** - Dedicated interfaces for selection, processing, and success states

#### Android Middleware App
- **Native Android Application** - Kotlin with Android 14 support
- **Stripe Android SDK Integration** - Real NFC Tap to Pay processing
- **Local HTTP Server** - Port 8080 for web communication
- **Foreground Service** - Reliable background operation
- **Auto-Start on Boot** - Always available for payments
- **Admin Interface** - Configuration and testing tools

#### Payment Processing
- **Dual-Mode Operation** - Android middleware for real NFC + fallback demo mode
- **Enhanced Payment Flow** - Visual progress indicators with processing, success, and error states
- **Two-Step Payment Flow** - Create payment intent → Confirm with NFC
- **Real-Time Status Updates** - Payment polling and feedback with animations
- **Multiple Payment Methods** - NFC Tap to Pay + traditional card input
- **Visual Feedback** - Success animations, glow effects, and congratulatory messages

### 🔧 Technical Architecture

#### Web Application (Frontend)
- **Framework**: Hono + TypeScript + Cloudflare Pages
- **UI**: TailwindCSS + FontAwesome icons
- **APIs**: Stripe.js, Hebcal API integration
- **Storage**: LocalStorage for configuration

#### Android Middleware (NFC Processing)
- **Platform**: Android 14, JDK 21, Gradle 8.5.2
- **SDK**: Stripe Android SDK 20.37.2
- **Server**: NanoHTTPD for local communication
- **NFC**: Built-in reader support (H101 tablet)

## 📱 Hardware Requirements

### H101 Android Tablet
- **Android 14** operating system
- **Built-in NFC reader** for contactless payments
- **Landscape orientation** optimized
- **WiFi connectivity** for Stripe API calls

### Payment Methods Supported
- Contactless credit/debit cards (Visa, Mastercard, Amex, Discover)
- Mobile wallets (Apple Pay, Google Pay, Samsung Pay)
- Traditional card input via web interface

## 🌐 Live URLs
- **Production**: https://ohr-shalom-kiosk.pages.dev
- **Development**: https://3000-icgy6i2trcgm5190jdfl7-6532622b.e2b.dev
- **GitHub**: https://github.com/mastermind2990/ohr-shalom-kiosk

## 📊 API Architecture

### Web Kiosk Endpoints (Cloudflare Pages)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/` | GET | Main kiosk interface |
| `/api/hebcal` | GET | Hebrew calendar data |
| `/api/create-payment-intent` | POST | Stripe payment creation |

### Android Middleware Endpoints (localhost:8080)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/status` | GET | Middleware health check |
| `/payment/create` | POST | Create payment intent |
| `/payment/confirm` | POST | Process NFC payment |
| `/payment/status` | GET | Check payment status |
| `/config` | POST | Configure Stripe keys |

## 🗂️ Data Flow

### Payment Processing Flow
1. **User Selection**: Donor selects amount on web kiosk
2. **Middleware Check**: Web app checks if Android middleware is available
3. **Payment Creation**: Android app creates Stripe payment intent
4. **NFC Processing**: Android app handles contactless card tap
5. **Status Polling**: Web app polls for payment completion
6. **Confirmation**: Success message and photo capture

### Admin Workflow
1. **Exit Kiosk Mode**: Admin taps logo 5 times
2. **Launch Android App**: Use admin panel to open middleware
3. **Configure Stripe**: Set API keys via web interface
4. **Return to Kiosk**: Auto-return to full-screen kiosk mode

## 👥 User Guide

### For Donors (End Users)
1. **Select Amount**: Tap preset buttons or enter custom amount
2. **Enter Email** (optional): For digital receipts
3. **Tap to Pay**: Touch contactless card/phone to tablet
4. **Confirmation**: Receive success message and photo capture

### For Administrators
1. **Access Admin**: Tap logo 5 times → Enter PIN (12345)
2. **Android Setup**: 
   - Launch Android middleware app
   - Configure Stripe API keys
   - Test NFC functionality
3. **Monitor Status**: Check middleware connection and NFC availability
4. **Manage Settings**: Location, prayer times, organization details

## 🚀 Deployment Guide

### Web Kiosk Deployment (Cloudflare Pages)
```bash
# Build and deploy web interface
npm run build
npm run deploy:prod
```

### Android App Installation (H101 Tablet)
1. **Import Project**: Open `android-middleware/` in Android Studio
2. **Configure Gradle**: JDK 21, Gradle 8.5.2 (pre-configured)
3. **Add Stripe Keys**: Update `PaymentMiddlewareApplication.kt`
4. **Build & Install**: Connect tablet → Build → Run
5. **Grant Permissions**: NFC, Network, Foreground Service

### First-Time Setup
1. **Install Android App** on H101 tablet
2. **Enable NFC** in Android settings
3. **Launch Web Kiosk** in Chrome/browser
4. **Access Admin Panel** (5 logo taps → PIN: 12345)
5. **Launch Android Middleware** via admin panel
6. **Configure Stripe Keys** via admin interface
7. **Test Payment Flow** with test card/device

## 🔐 Security Configuration

### Default Settings
- **Admin PIN**: `12345` (change in production)
- **Stripe Mode**: Test keys included (replace with live keys)
- **Location**: Orlando, FL (Geoname ID: 4167147)
- **Prayer Times**: Configurable via admin panel

### Production Security
- **Stripe API Keys**: Store securely in Android app
- **Network Security**: HTTPS for all external calls
- **Local Communication**: HTTP on localhost (secure by default)
- **Permissions**: Minimal Android permissions required

## 🛠️ Development Setup

### Web Development
```bash
# Web kiosk development
npm install
npm run build
npm run dev:sandbox
```

### Android Development
```bash
# Open in Android Studio
# File → Open → android-middleware/
# Sync project with Gradle files
# Build → Make Project
```

## 📞 Troubleshooting

### Common Issues

**Android Middleware Not Connecting:**
- Ensure Android app is running (check notification)
- Verify NFC is enabled in Android settings
- Check firewall/network settings

**NFC Payments Failing:**
- Test with different contactless cards
- Verify H101 tablet NFC hardware
- Check Stripe API key configuration

**Web Kiosk Issues:**
- Clear browser cache and cookies
- Check network connectivity
- Verify admin PIN (default: 12345)

### Debug Information
- **Android Logs**: `adb logcat -s PaymentMiddleware`
- **Web Console**: F12 Developer Tools
- **Network**: Check localhost:8080 availability

## 🎯 Next Steps

### Immediate Tasks
1. **Production Stripe Keys** - Replace test keys with live credentials
2. **Custom Domain** - Set up custom domain for web kiosk
3. **Receipt System** - Implement email receipt delivery
4. **Transaction Logging** - Store payment records

### Future Enhancements
1. **Multi-Language Support** - Full Hebrew interface
2. **Offline Mode** - Queue payments when network unavailable
3. **Analytics Dashboard** - Payment statistics and reporting
4. **Custom Branding** - Upload logos and themes

## 📁 Project Structure

```
webapp/
├── src/index.tsx                 # Web kiosk main app
├── public/static/kiosk.js        # Frontend JavaScript
├── android-middleware/           # Android payment app
│   ├── app/src/main/
│   │   ├── java/.../            # Kotlin source files
│   │   ├── res/                 # Android resources
│   │   └── AndroidManifest.xml  # App configuration
│   ├── build.gradle             # Android build config
│   └── README.md                # Android setup guide
├── package.json                 # Web dependencies
└── README.md                    # This file
```

## 📄 Documentation

- **Web Kiosk**: Complete Hono + Cloudflare Pages setup
- **Android App**: Full Android Studio project with setup instructions
- **API Integration**: RESTful communication between components
- **User Guides**: Step-by-step instructions for admins and donors

---

*Complete donation kiosk solution optimized for H101 Android tablets with professional NFC Tap to Pay integration.*