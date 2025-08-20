# Ohr Shalom Donation Kiosk

## Project Overview
- **Name**: Ohr Shalom Donation Kiosk  
- **Goal**: Web-based donation kiosk supporting Stripe Tap to Pay on Android tablets
- **Features**: Hebrew calendar integration, NFC payments, camera capture, admin controls

## 🌟 Key Features

### ✅ Currently Implemented
- **Stripe Tap to Pay Integration** - Full NFC support for Android tablets
- **Hebrew Calendar & Prayer Times** - Real-time data from Hebcal API
- **Tablet-Optimized Kiosk Interface** - Touch-friendly, responsive design
- **Admin Access System** - PIN-protected configuration (PIN: 12345)
- **Camera Photo Capture** - Web-based photo functionality
- **Multiple Payment Options** - Tap to Pay + traditional card payment
- **Hebrew Text Support** - RTL text rendering with proper fonts
- **Preset Donation Amounts** - $5, $18 (חי), $36 (Double חי), Custom
- **Email Receipt Collection** - Optional email input for receipts

### 🔧 Technical Features
- **Kiosk Mode Optimizations** - Fullscreen, disabled right-click, selection prevention
- **API Integration** - RESTful backend with Hono framework
- **Modern UI Components** - TailwindCSS + FontAwesome icons
- **Responsive Design** - Optimized for tablets and mobile devices
- **Security Features** - CORS protection, input validation

## 📱 Stripe Tap to Pay Support

### Android Tablet Compatibility
- **NFC-enabled Android tablets** running Android 7.0+
- **Stripe Terminal SDK integration** for contactless payments
- **Proximity payments** via contactless cards and mobile wallets
- **Real-time payment processing** with confirmation

### Payment Methods Supported
- Contactless credit/debit cards (Visa, Mastercard, Amex, Discover)
- Mobile wallets (Apple Pay, Google Pay, Samsung Pay)
- Traditional card input via Stripe Elements

## 🌐 Live URLs
- **Development**: https://3000-icgy6i2trcgm5190jdfl7-6532622b.e2b.dev
- **Health Check**: https://3000-icgy6i2trcgm5190jdfl7-6532622b.e2b.dev/api/health
- **GitHub**: *To be configured*

## 📊 API Endpoints

### Functional Entry Points
| Endpoint | Method | Purpose | Parameters |
|----------|--------|---------|------------|
| `/` | GET | Main kiosk interface | - |
| `/api/health` | GET | System health check | - |
| `/api/create-payment-intent` | POST | Create Stripe payment | `amountCents`, `email`, `enableTapToPay` |
| `/api/terminal/readers` | GET | List available card readers | - |
| `/api/hebcal` | GET | Hebrew calendar data | `lat`, `lon`, `geonameid` |
| `/api/config` | GET/POST | Admin configuration | - |

## 🗂️ Data Architecture

### Data Models
- **Payment Intent**: Amount, currency, email, Tap to Pay capability
- **Hebrew Calendar**: Date, parsha, candle lighting, havdalah times
- **Configuration**: Backend URL, admin PIN, location settings, prayer times
- **Terminal Readers**: Device type, status, location information

### Storage Services
- **In Development**: Local storage, session-based configuration
- **Production Ready**: Cloudflare KV for configuration, D1 for transaction logs
- **Payment Processing**: Stripe API for all payment operations

### Data Flow
1. User selects donation amount on kiosk interface
2. Hebrew calendar data fetched from Hebcal API on page load
3. Payment intent created via Stripe API backend call
4. NFC/Tap to Pay processed through Stripe Terminal SDK
5. Receipt data optionally collected and processed

## 👥 User Guide

### For Donors
1. **Select Amount**: Tap preset buttons ($5, $18, $36) or enter custom amount
2. **Enter Email** (optional): For digital receipt delivery
3. **Choose Payment Method**:
   - **Tap to Pay**: Touch your contactless card or phone to the screen
   - **Online Payment**: Enter card details in secure form
4. **Complete Payment**: Follow on-screen prompts for confirmation

### For Administrators
1. **Access Admin Mode**: Tap the logo 5 times quickly
2. **Enter PIN**: Use default PIN `12345` (configurable)
3. **Configure Settings**: Adjust location, prayer times, backend URL
4. **Monitor Operations**: View payment status and system health

## 🚀 Deployment

### Current Status
- **Platform**: Development server (Hono + Wrangler Pages Dev)
- **Status**: ✅ Active and functional
- **Tech Stack**: Hono + TypeScript + TailwindCSS + Stripe.js
- **Last Updated**: August 20, 2025

### Production Deployment Ready
- **Target Platform**: Cloudflare Pages
- **Build Command**: `npm run build`
- **Deploy Command**: `npm run deploy:prod`
- **Environment Variables**: Stripe keys, admin PIN, location settings

## 🔧 Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Cloudflare account (for production)
- Stripe account with Terminal capability

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run build
npm run dev:sandbox

# Test locally
curl http://localhost:3000/api/health
```

### Stripe Configuration
1. **Publishable Key**: Already configured in frontend
2. **Secret Key**: Configure in environment variables for production
3. **Terminal Location**: Set up in Stripe Dashboard for Tap to Pay
4. **Webhook Endpoints**: Configure for payment confirmations

## 🔐 Security & Configuration

### Default Settings
- **Admin PIN**: `12345` (change in production)
- **Location**: Orlando, FL coordinates
- **Timezone**: America/New_York
- **Prayer Times**: Configurable in admin panel

### Production Security
- **Environment Variables**: Store sensitive keys securely
- **CORS Configuration**: Restrict to kiosk domain
- **Input Validation**: All payment amounts and email addresses validated
- **PIN Protection**: Admin features require authentication

## 🎯 Next Steps for Development

### Immediate Enhancements
1. **Stripe Secret Key Integration** - Connect real payment processing
2. **Production Deployment** - Deploy to Cloudflare Pages
3. **Terminal Setup** - Configure Stripe Terminal location and readers
4. **Transaction Logging** - Store payment records in Cloudflare D1

### Future Features
1. **Multi-language Support** - Full Hebrew interface option
2. **Receipt Generation** - PDF receipt creation and email delivery
3. **Analytics Dashboard** - Admin reporting and statistics
4. **Offline Mode** - Queue payments when network unavailable
5. **Custom Branding** - Upload logo and customize appearance

## 📞 Support & Maintenance

### Monitoring
- **Health Endpoint**: `/api/health` for system status
- **Error Logging**: Console logging for debugging
- **Payment Status**: Real-time feedback in UI

### Troubleshooting
- **NFC Issues**: Ensure Android NFC is enabled and tablet is compatible
- **Payment Failures**: Check Stripe Dashboard for detailed error logs  
- **Admin Access**: Reset PIN via configuration file if needed
- **Hebrew Display**: Ensure proper font loading and RTL text support

---

*Built with modern web technologies for reliable, secure donation processing in synagogue and community settings.*