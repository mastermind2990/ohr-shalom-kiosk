# Ohr Shalom Payment Middleware

🚀 **GitHub Actions Ready**: Automated APK building configured - see GITHUB_ACTIONS_SETUP.md - Android App

This Android application serves as a payment middleware for the Ohr Shalom Donation Kiosk, enabling NFC Tap to Pay functionality using the Stripe Android SDK.

## Overview

The app runs as a background service on the H101 Android tablet, providing a local HTTP server that the web kiosk can communicate with to process contactless payments.

### Architecture
- **Web Kiosk** (Browser) ↔ **HTTP API** (localhost:8080) ↔ **Android App** (Stripe SDK + NFC)

## Features

- ✅ Local HTTP server for web-to-Android communication
- ✅ Stripe Android SDK integration for payment processing
- ✅ NFC Tap to Pay support for contactless cards/devices
- ✅ Automatic startup on device boot
- ✅ Admin interface for configuration and testing
- ✅ Foreground service for reliable operation
- ✅ Landscape orientation optimized for tablets

## Requirements

### Development Environment
- **Android Studio** (Latest version)
- **Android JDK 21** (Compatible with your setup)
- **Gradle 8.5.2** (Configured in project)
- **Android SDK** with API level 34 (Android 14)

### Hardware Requirements
- **H101 Android Tablet** (Android 14)
- **Built-in NFC reader** (For Tap to Pay)
- **Internet connection** (For Stripe API calls)

### Stripe Configuration
- **Stripe Account** with API access
- **Stripe Publishable Key** (For SDK initialization)
- **Stripe Secret Key** (For payment intent creation)

## Project Structure

```
android-middleware/
├── app/
│   ├── src/main/
│   │   ├── java/com/ohrshalom/paymentmiddleware/
│   │   │   ├── MainActivity.kt                    # Admin interface
│   │   │   ├── PaymentMiddlewareApplication.kt    # App initialization
│   │   │   ├── service/HttpServerService.kt       # HTTP server service
│   │   │   ├── payment/StripePaymentManager.kt    # Stripe integration
│   │   │   ├── nfc/NfcPaymentActivity.kt         # NFC payment handling
│   │   │   └── receiver/BootReceiver.kt          # Auto-start on boot
│   │   ├── res/                                  # Android resources
│   │   └── AndroidManifest.xml                   # App configuration
│   └── build.gradle                              # App dependencies
├── build.gradle                                  # Project configuration
├── settings.gradle                               # Project settings
└── README.md                                     # This file
```

## Setup Instructions

### 1. Import Project in Android Studio

1. Open Android Studio
2. Choose "Open an existing project"
3. Navigate to the `android-middleware` folder
4. Click "Open"
5. Wait for Gradle sync to complete

### 2. Configure Stripe Keys

Edit `PaymentMiddlewareApplication.kt` and add your Stripe keys:

```kotlin
private fun getStripePublishableKey(): String {
    // Replace with your actual Stripe publishable key
    return "pk_test_your_publishable_key_here"
}
```

Or configure via the HTTP API (recommended):
```bash
curl -X POST http://localhost:8080/config \\
  -H "Content-Type: application/json" \\
  -d '{
    "stripe_publishable_key": "pk_test_your_key",
    "stripe_secret_key": "sk_test_your_secret_key"
  }'
```

### 3. Build and Install

1. Connect your H101 tablet via USB
2. Enable Developer Options and USB Debugging
3. In Android Studio: **Build > Make Project**
4. Run: **Run > Run 'app'** or click the green play button

### 4. Grant Permissions

On first run, grant the following permissions:
- **NFC Access** (Required for Tap to Pay)
- **Network Access** (Required for Stripe API calls)
- **Foreground Service** (Required for HTTP server)

## API Endpoints

The HTTP server provides the following endpoints for web kiosk communication:

### GET /status
Returns server and system status
```json
{
  "status": "running",
  "port": 8080,
  "nfc_available": true,
  "stripe_configured": true
}
```

### POST /payment/create
Creates a new payment intent
```json
{
  "amount": 2500,  // Amount in cents ($25.00)
  "currency": "usd",
  "email": "donor@example.com"
}
```

### POST /payment/confirm
Confirms payment with NFC
```json
{
  "client_secret": "pi_xxx_secret_xxx",
  "payment_method": "contactless"
}
```

### POST /config
Configure Stripe keys
```json
{
  "stripe_publishable_key": "pk_test_xxx",
  "stripe_secret_key": "sk_test_xxx"
}
```

## Usage Workflow

### 1. Web Kiosk Integration

The web kiosk should communicate with the Android app as follows:

```javascript
// Check if Android middleware is available
const response = await fetch('http://localhost:8080/status');
if (response.ok) {
  const status = await response.json();
  console.log('Middleware available:', status);
}

// Create payment intent
const paymentResponse = await fetch('http://localhost:8080/payment/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 2500, // $25.00
    currency: 'usd',
    email: 'donor@example.com'
  })
});

// Confirm payment with NFC
const confirmResponse = await fetch('http://localhost:8080/payment/confirm', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    client_secret: paymentIntent.client_secret
  })
});
```

### 2. Admin Access

- App runs in background automatically
- Access admin interface by launching the app manually
- Check NFC status, server status, and Stripe configuration
- Test payment functionality

### 3. Kiosk Mode

- App automatically starts HTTP server on boot
- Runs as foreground service (persistent notification)
- Web kiosk remains in full-screen mode
- Admin can exit kiosk mode to access Android app when needed

## Testing

### Test NFC Functionality
1. Open the Android app
2. Ensure NFC is enabled
3. Tap "Test Payment"
4. Hold NFC card/device near tablet

### Test Web Integration
1. Ensure HTTP server is running (check notification)
2. Open web kiosk in browser
3. Initiate donation with amount
4. Process payment via NFC

## Troubleshooting

### Common Issues

**HTTP Server Not Starting:**
- Check if port 8080 is already in use
- Verify foreground service permissions
- Restart the app or device

**NFC Not Working:**
- Ensure NFC is enabled in Android settings
- Check if H101 tablet NFC hardware is functional
- Verify app has NFC permissions

**Stripe Errors:**
- Verify publishable and secret keys are correct
- Check internet connection for API calls
- Review Android logs for detailed error messages

**Web Kiosk Communication:**
- Ensure both web kiosk and Android app are on same device
- Check firewall settings (shouldn't apply to localhost)
- Verify CORS headers in HTTP responses

### Debug Logs

View Android logs for troubleshooting:
```bash
adb logcat -s PaymentMiddleware
```

## Production Deployment

### Security Considerations
- Store Stripe keys securely (Android Keystore)
- Implement request authentication between web and Android
- Use HTTPS for external API calls
- Validate all payment amounts and data

### Performance Optimization
- Minimize HTTP server overhead
- Cache Stripe configuration
- Handle NFC detection efficiently
- Manage battery usage with foreground service

## Support

For technical support or questions:
- Review Android logs for error details
- Check Stripe Dashboard for payment status
- Verify H101 tablet NFC functionality
- Test with Stripe test mode first

## Version History

- **v1.0.0** - Initial release with basic HTTP server and Stripe integration
- Android 14 (API 34) support
- JDK 21 compatibility
- Gradle 8.5.2 build system