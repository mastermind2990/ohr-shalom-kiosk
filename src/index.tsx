import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// Enable CORS for frontend-backend communication
app.use('/api/*', cors())

// Serve static files from public directory
app.use('/static/*', serveStatic({ root: './public' }))

// API route for creating Stripe payment intent
app.post('/api/create-payment-intent', async (c) => {
  try {
    const { amountCents, currency = 'usd', email, enableTapToPay = false } = await c.req.json()
    
    // Validate amount
    if (!amountCents || amountCents < 50) { // Minimum $0.50
      return c.json({ error: 'Invalid amount. Minimum $0.50 required.' }, 400)
    }
    
    // For production deployment, you would use your Stripe secret key like this:
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: amountCents,
    //   currency: currency,
    //   receipt_email: email || undefined,
    //   metadata: {
    //     source: 'ohr_shalom_kiosk',
    //     enable_tap_to_pay: enableTapToPay.toString()
    //   }
    // })
    // return c.json({ clientSecret: paymentIntent.client_secret })
    
    // For demo purposes, return a properly formatted mock response
    const response = {
      clientSecret: 'pi_mock_client_secret_' + Math.random().toString(36).substring(7),
      paymentIntentId: 'pi_mock_' + Math.random().toString(36).substring(7),
      amount: amountCents,
      currency,
      email,
      enableTapToPay
    }
    
    return c.json(response)
  } catch (error) {
    console.error('Payment intent creation error:', error)
    return c.json({ error: 'Failed to create payment intent' }, 500)
  }
})

// API route for Stripe Terminal readers (Tap to Pay)
app.get('/api/terminal/readers', async (c) => {
  try {
    // Mock response for available readers
    // In production, this would call Stripe's Terminal API
    return c.json({
      readers: [
        {
          id: 'tmr_mock_reader',
          device_type: 'mobile_phone_reader',
          location: 'mock_location',
          status: 'online',
          label: 'Android Tap to Pay'
        }
      ]
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch readers' }, 500)
  }
})

// API route for Hebrew calendar data
app.get('/api/hebcal', async (c) => {
  try {
    const { lat = 28.5383, lon = -81.3792, geonameid } = c.req.query()
    
    let url = 'https://www.hebcal.com/shabbat?cfg=json&m=50'
    if (geonameid) {
      url += `&geonameid=${geonameid}`
    } else {
      url += `&latitude=${lat}&longitude=${lon}`
    }
    
    const response = await fetch(url)
    const data = await response.json()
    
    return c.json(data)
  } catch (error) {
    console.error('Hebcal API error:', error)
    return c.json({ error: 'Failed to fetch Hebrew calendar data' }, 500)
  }
})

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

// Admin configuration endpoints
app.get('/api/config', (c) => {
  // Return default configuration
  return c.json({
    backendUrl: 'https://donations.unmannedunited.com',
    paymentEndpoint: '/create-payment-intent',
    adminPin: '12345',
    locationId: null,
    latitude: 28.5383,
    longitude: -81.3792,
    timeZoneId: 'America/New_York',
    shacharit: '7:00 AM',
    mincha: '2:00 PM',
    maariv: '8:00 PM'
  })
})

app.post('/api/config', async (c) => {
  try {
    const config = await c.req.json()
    // In production, this would save to a database or KV store
    console.log('Config saved:', config)
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Failed to save configuration' }, 500)
  }
})

// Main kiosk interface
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
        <title>Ohr Shalom Donation Kiosk</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://js.stripe.com/v3/"></script>
        <style>
            /* Kiosk optimizations */
            html, body {
                height: 100vh;
                overflow: hidden;
                user-select: none;
                -webkit-user-select: none;
                -webkit-touch-callout: none;
            }
            
            /* Prevent zoom and selection */
            * {
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
            }
            
            input[type="email"], input[type="number"], input[type="password"] {
                -webkit-user-select: text;
                -moz-user-select: text;
                -ms-user-select: text;
                user-select: text;
            }
            
            /* Tablet optimized buttons */
            .kiosk-button {
                min-height: 60px;
                font-size: 18px;
                font-weight: bold;
                touch-action: manipulation;
            }
            
            .amount-button {
                min-height: 80px;
                font-size: 24px;
                font-weight: bold;
            }
            
            /* Hide scrollbars but allow scrolling */
            .scroll-container {
                scrollbar-width: none;
                -ms-overflow-style: none;
            }
            .scroll-container::-webkit-scrollbar {
                display: none;
            }
            
            /* Pulse animation for tap to pay */
            .pulse-animation {
                animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: .5; }
            }
            
            /* Hebrew text support */
            .hebrew-text {
                font-family: 'Noto Sans Hebrew', 'David', 'Times New Roman', serif;
                direction: rtl;
                text-align: right;
            }
        </style>
    </head>
    <body class="bg-gradient-to-br from-blue-50 to-indigo-100">
        <div class="min-h-screen p-4 scroll-container overflow-y-auto">
            <div class="max-w-4xl mx-auto">
                <!-- Header with Logo -->
                <div class="text-center mb-6">
                    <div id="logoContainer" class="cursor-pointer inline-block">
                        <div class="w-64 h-20 mx-auto bg-white rounded-lg shadow-lg flex items-center justify-center border-2 border-blue-200">
                            <h1 class="text-2xl font-bold text-blue-800">
                                <i class="fas fa-star-of-david mr-2"></i>
                                אור שלום
                            </h1>
                        </div>
                    </div>
                    <p class="text-sm text-gray-600 mt-2">Tap logo 5× for admin</p>
                </div>

                <!-- Date and Calendar Information -->
                <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 class="text-lg font-semibold text-gray-800 mb-3">
                                <i class="fas fa-calendar mr-2"></i>Today
                            </h3>
                            <div id="dateInfo" class="space-y-2 text-gray-700">
                                <div id="gregorianDate"></div>
                                <div id="hebrewDate" class="hebrew-text"></div>
                                <div id="parsha" class="hebrew-text font-bold text-blue-800"></div>
                            </div>
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold text-gray-800 mb-3">
                                <i class="fas fa-clock mr-2"></i>Times
                            </h3>
                            <div id="timesInfo" class="space-y-2 text-gray-700">
                                <div id="candleLighting"></div>
                                <div id="havdalah"></div>
                                <div class="border-t pt-2 mt-2">
                                    <div id="shacharit">Shacharit: 7:00 AM</div>
                                    <div id="mincha">Mincha: 2:00 PM</div>
                                    <div id="maariv">Maariv: 8:00 PM</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Donation Interface -->
                <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">
                        <i class="fas fa-heart mr-2 text-red-500"></i>
                        Make a Donation
                    </h2>
                    
                    <!-- Preset Amount Buttons -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <button class="amount-button bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors" data-amount="5">
                            $5
                        </button>
                        <button class="amount-button bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors" data-amount="18">
                            $18<br><small>חי</small>
                        </button>
                        <button class="amount-button bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors" data-amount="36">
                            $36<br><small>Double חי</small>
                        </button>
                        <button class="amount-button bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors" id="customAmountBtn">
                            Custom<br>Amount
                        </button>
                    </div>
                    
                    <!-- Selected Amount Display -->
                    <div class="text-center mb-6">
                        <div class="text-3xl font-bold text-gray-800" id="selectedAmount">
                            Amount: $0.00
                        </div>
                    </div>
                    
                    <!-- Email Input -->
                    <div class="mb-6">
                        <label for="emailInput" class="block text-sm font-medium text-gray-700 mb-2">
                            Email for receipt (optional)
                        </label>
                        <input 
                            type="email" 
                            id="emailInput" 
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                            placeholder="your.email@example.com"
                        >
                    </div>
                    
                    <!-- Payment Method Selection -->
                    <div class="mb-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-3">Payment Method</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button id="tapToPayBtn" class="kiosk-button bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg transition-colors flex items-center justify-center">
                                <i class="fas fa-mobile-alt mr-2 text-2xl"></i>
                                <div>
                                    <div class="font-bold">Tap to Pay</div>
                                    <div class="text-sm">Touch your card or phone</div>
                                </div>
                            </button>
                            <button id="cardPaymentBtn" class="kiosk-button bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-lg transition-colors flex items-center justify-center">
                                <i class="fas fa-credit-card mr-2 text-2xl"></i>
                                <div>
                                    <div class="font-bold">Online Payment</div>
                                    <div class="text-sm">Card details</div>
                                </div>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Tap to Pay Interface -->
                    <div id="tapToPayInterface" class="hidden">
                        <div class="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center bg-blue-50">
                            <div class="text-6xl mb-4">
                                <i class="fas fa-wifi pulse-animation text-blue-500"></i>
                            </div>
                            <h3 class="text-2xl font-bold text-blue-800 mb-2">Ready for Tap to Pay</h3>
                            <p class="text-blue-600 mb-4">Hold your contactless card or mobile device near the screen</p>
                            <div class="text-lg font-semibold text-blue-800" id="tapAmount">Amount: $0.00</div>
                            <button id="cancelTapToPay" class="mt-4 px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Camera Interface -->
                <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">
                        <i class="fas fa-camera mr-2"></i>Photo Capture
                    </h3>
                    <div class="flex items-center space-x-4">
                        <button id="takePhotoBtn" class="kiosk-button bg-gray-500 hover:bg-gray-600 text-white rounded-lg px-6">
                            Take Photo
                        </button>
                        <div id="photoPreview" class="w-20 h-20 border-2 border-gray-300 rounded-lg overflow-hidden hidden">
                            <img id="photoImg" class="w-full h-full object-cover" alt="Photo Preview">
                        </div>
                    </div>
                </div>

                <!-- Status Messages -->
                <div id="statusMessage" class="hidden fixed top-4 right-4 z-50"></div>
            </div>
        </div>

        <!-- Admin Modal -->
        <div id="adminModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 class="text-xl font-bold mb-4">Admin Access</h3>
                <input type="password" id="adminPinInput" class="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4" placeholder="Enter PIN">
                <div class="flex space-x-4">
                    <button id="adminSubmit" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg">Submit</button>
                    <button id="adminCancel" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg">Cancel</button>
                </div>
            </div>
        </div>

        <!-- Custom Amount Modal -->
        <div id="customAmountModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 class="text-xl font-bold mb-4">Custom Amount</h3>
                <input type="number" id="customAmountInput" class="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4" placeholder="Enter amount in USD" min="1" step="0.01">
                <div class="flex space-x-4">
                    <button id="customAmountSubmit" class="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg">Set Amount</button>
                    <button id="customAmountCancel" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg">Cancel</button>
                </div>
            </div>
        </div>

        <script src="/static/kiosk.js"></script>
    </body>
    </html>
  `)
})

export default app