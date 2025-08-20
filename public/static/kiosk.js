// Ohr Shalom Donation Kiosk - Frontend JavaScript
class OhrShalomKiosk {
    constructor() {
        // Configuration
        this.config = {
            stripePublishableKey: 'pk_live_51PK1IqLaU6gfF6P3agZ2KfGWMsqnQctB9y7maYu97zUqelsSBE0UKr6RtMSK2DvBLnwkFIPlJOb6M9IN3RUDQvgN00esYwFgBi', // Your Stripe key from Android code
            adminPin: '12345',
            latitude: 28.5383,
            longitude: -81.3792,
            timeZone: 'America/New_York'
        }
        
        // State
        this.selectedAmount = 0
        this.tapCount = 0
        this.tapTimeout = null
        this.stripe = null
        this.elements = null
        this.terminal = null
        
        this.init()
    }
    
    async init() {
        // Load saved configuration first
        this.loadConfigurationFromStorage()
        
        // Initialize Stripe
        this.stripe = Stripe(this.config.stripePublishableKey)
        
        // Initialize Stripe Terminal for Tap to Pay
        try {
            // Check if device supports Stripe Terminal
            if ('StripeTerminal' in window) {
                this.terminal = StripeTerminal.create({
                    onFetchConnectionToken: this.fetchConnectionToken.bind(this),
                    onUnexpectedReaderDisconnect: this.unexpectedDisconnect.bind(this)
                })
            }
        } catch (error) {
            console.log('Stripe Terminal not available:', error)
        }
        
        this.setupEventListeners()
        this.loadHebrewCalendar()
        this.updateDateTime()
        this.updatePrayerTimesDisplay()
        
        // Update time every minute
        setInterval(() => this.updateDateTime(), 60000)
    }
    
    loadConfigurationFromStorage() {
        const saved = localStorage.getItem('ohrShalomKioskConfig')
        if (saved) {
            try {
                const savedConfig = JSON.parse(saved)
                this.config = { ...this.config, ...savedConfig }
                console.log('Loaded saved configuration:', this.config)
            } catch (error) {
                console.error('Error loading saved configuration:', error)
            }
        }
    }
    
    setupEventListeners() {
        // Logo tap for admin access
        document.getElementById('logoContainer').addEventListener('click', () => {
            this.handleLogoTap()
        })
        
        // Amount selection buttons
        document.querySelectorAll('.amount-button[data-amount]').forEach(button => {
            button.addEventListener('click', (e) => {
                const amount = parseFloat(e.currentTarget.dataset.amount)
                this.setAmount(amount)
            })
        })
        
        // Custom amount button
        document.getElementById('customAmountBtn').addEventListener('click', () => {
            this.showCustomAmountModal()
        })
        
        // Payment method buttons
        document.getElementById('tapToPayBtn').addEventListener('click', () => {
            this.startTapToPay()
        })
        
        document.getElementById('cardPaymentBtn').addEventListener('click', () => {
            this.startCardPayment()
        })
        
        // Camera functionality
        document.getElementById('takePhotoBtn').addEventListener('click', () => {
            this.takePhoto()
        })
        
        // Modal handlers
        this.setupModalHandlers()
        
        // Prevent right-click and other kiosk optimizations
        document.addEventListener('contextmenu', e => e.preventDefault())
        document.addEventListener('selectstart', e => e.preventDefault())
        
        // Disable certain keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.altKey || e.metaKey) {
                if (['r', 'f5', 'f11', 'f12', 'i', 'j', 'u', 's'].includes(e.key.toLowerCase())) {
                    e.preventDefault()
                }
            }
        })
    }
    
    setupModalHandlers() {
        // Admin modal
        document.getElementById('adminSubmit').addEventListener('click', () => {
            this.checkAdminPin()
        })
        
        document.getElementById('adminCancel').addEventListener('click', () => {
            this.hideAdminModal()
        })
        
        document.getElementById('adminPinInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkAdminPin()
            }
        })
        
        // Custom amount modal
        document.getElementById('customAmountSubmit').addEventListener('click', () => {
            this.setCustomAmount()
        })
        
        document.getElementById('customAmountCancel').addEventListener('click', () => {
            this.hideCustomAmountModal()
        })
        
        document.getElementById('customAmountInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.setCustomAmount()
            }
        })
        
        // Cancel tap to pay
        document.getElementById('cancelTapToPay').addEventListener('click', () => {
            this.cancelTapToPay()
        })
    }
    
    handleLogoTap() {
        this.tapCount++
        
        if (this.tapTimeout) {
            clearTimeout(this.tapTimeout)
        }
        
        this.tapTimeout = setTimeout(() => {
            this.tapCount = 0
        }, 3000)
        
        if (this.tapCount >= 5) {
            this.tapCount = 0
            this.showAdminModal()
        }
    }
    
    setAmount(amount) {
        this.selectedAmount = amount
        document.getElementById('selectedAmount').textContent = `Amount: $${amount.toFixed(2)}`
        document.getElementById('tapAmount').textContent = `Amount: $${amount.toFixed(2)}`
        
        // Highlight selected button
        document.querySelectorAll('.amount-button').forEach(btn => {
            btn.classList.remove('ring-4', 'ring-yellow-400')
        })
        
        const selectedBtn = document.querySelector(`[data-amount="${amount}"]`)
        if (selectedBtn) {
            selectedBtn.classList.add('ring-4', 'ring-yellow-400')
        }
    }
    
    async startTapToPay() {
        if (this.selectedAmount <= 0) {
            this.showMessage('Please select an amount first', 'error')
            return
        }
        
        try {
            // Create payment intent
            const email = document.getElementById('emailInput').value.trim()
            const paymentIntent = await this.createPaymentIntent(this.selectedAmount * 100, email, true)
            
            // Show tap to pay interface
            document.getElementById('tapToPayInterface').classList.remove('hidden')
            
            // Simulate tap to pay for demo (in production, this would use Stripe Terminal)
            if (this.terminal) {
                await this.processTerminalPayment(paymentIntent)
            } else {
                // Fallback to simulated tap to pay
                this.showMessage('Tap to Pay ready - Touch your card or device to the screen', 'info')
                
                // Simulate payment after 3 seconds for demo
                setTimeout(() => {
                    this.showMessage('Payment successful! Thank you for your donation', 'success')
                    this.resetInterface()
                }, 3000)
            }
        } catch (error) {
            console.error('Tap to Pay error:', error)
            this.showMessage('Tap to Pay failed: ' + error.message, 'error')
        }
    }
    
    async processTerminalPayment(paymentIntent) {
        try {
            // Discover readers
            const readers = await this.terminal.discoverReaders({
                simulated: false,
                location: 'your_location_id' // Configure in Stripe Dashboard
            })
            
            if (readers.length === 0) {
                throw new Error('No card readers found')
            }
            
            // Connect to first available reader
            const reader = await this.terminal.connectReader(readers[0])
            
            // Create payment
            const payment = await this.terminal.collectPaymentMethod(paymentIntent.client_secret)
            
            if (payment.error) {
                throw new Error(payment.error.message)
            }
            
            // Confirm payment
            const result = await this.stripe.confirmCardPayment(paymentIntent.client_secret)
            
            if (result.error) {
                throw new Error(result.error.message)
            }
            
            this.showMessage('Payment successful! Thank you for your donation', 'success')
            this.resetInterface()
            
        } catch (error) {
            throw error
        }
    }
    
    async startCardPayment() {
        console.log('startCardPayment called, amount:', this.selectedAmount)
        
        if (this.selectedAmount <= 0) {
            this.showMessage('Please select an amount first', 'error')
            return
        }
        
        try {
            const email = document.getElementById('emailInput').value.trim()
            console.log('Creating payment intent for amount:', this.selectedAmount * 100)
            
            // Show loading message
            this.showMessage('Preparing payment form...', 'info')
            
            // Create payment intent
            const paymentIntent = await this.createPaymentIntent(this.selectedAmount * 100, email, false)
            console.log('Payment intent created:', paymentIntent)
            
            // Show card payment form
            this.showCardPaymentForm(paymentIntent.clientSecret, email)
            
        } catch (error) {
            console.error('Card payment error:', error)
            this.showMessage('Card payment failed: ' + error.message, 'error')
        }
    }
    
    showCardPaymentForm(clientSecret, email) {
        console.log('showCardPaymentForm called with clientSecret:', clientSecret)
        
        // Create modal for card payment
        const modal = document.createElement('div')
        modal.id = 'cardPaymentModal'
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center'
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 class="text-xl font-bold mb-4">Enter Card Details</h3>
                <div class="mb-4">
                    <div class="text-lg font-semibold text-gray-800">Amount: $${(this.selectedAmount).toFixed(2)}</div>
                    ${email ? `<div class="text-sm text-gray-600">Receipt to: ${email}</div>` : ''}
                </div>
                <div class="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <div class="text-sm text-yellow-800">
                        <strong>Demo Mode:</strong> This is a test payment form. No real charges will occur.
                    </div>
                </div>
                <div id="card-element" class="p-3 border border-gray-300 rounded-lg mb-4 min-h-[40px]">
                    <!-- Stripe Elements will create form fields here -->
                </div>
                <div id="card-errors" class="text-red-600 text-sm mb-4 hidden"></div>
                <div class="flex space-x-4">
                    <button id="submit-payment" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg">
                        <span id="payment-button-text">Pay $${(this.selectedAmount).toFixed(2)}</span>
                        <div id="payment-spinner" class="hidden inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                    </button>
                    <button id="cancel-payment" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg">Cancel</button>
                </div>
            </div>
        `
        
        document.body.appendChild(modal)
        
        try {
            // For demo mode with mock client secret, show a simplified form
            if (clientSecret.includes('mock')) {
                console.log('Demo mode detected, showing simplified form')
                document.getElementById('card-element').innerHTML = `
                    <div class="space-y-3">
                        <input type="text" placeholder="Card number (e.g., 4242 4242 4242 4242)" class="w-full p-2 border rounded" id="demo-card-number">
                        <div class="grid grid-cols-2 gap-3">
                            <input type="text" placeholder="MM/YY" class="p-2 border rounded" id="demo-expiry">
                            <input type="text" placeholder="CVC" class="p-2 border rounded" id="demo-cvc">
                        </div>
                        <input type="text" placeholder="Cardholder name" class="w-full p-2 border rounded" id="demo-name">
                    </div>
                `
                
                // Handle demo payment submission
                document.getElementById('submit-payment').addEventListener('click', async () => {
                    const cardNumber = document.getElementById('demo-card-number').value
                    if (!cardNumber || cardNumber.length < 10) {
                        this.showMessage('Please enter a valid card number', 'error')
                        return
                    }
                    
                    // Simulate processing
                    const button = document.getElementById('submit-payment')
                    button.disabled = true
                    document.getElementById('payment-button-text').textContent = 'Processing...'
                    document.getElementById('payment-spinner').classList.remove('hidden')
                    
                    setTimeout(() => {
                        document.body.removeChild(modal)
                        this.showMessage('Demo payment successful! (No real charge made)', 'success')
                        this.resetInterface()
                    }, 2000)
                })
            } else {
                // Real Stripe Elements (for production)
                console.log('Production mode, initializing Stripe Elements')
                const elements = this.stripe.elements({
                    clientSecret: clientSecret,
                    appearance: {
                        theme: 'stripe',
                        variables: {
                            colorPrimary: '#3B82F6',
                            colorBackground: '#ffffff',
                            colorText: '#374151',
                            colorDanger: '#EF4444',
                            fontFamily: 'system-ui, sans-serif',
                            spacingUnit: '4px',
                            borderRadius: '6px'
                        }
                    }
                })
                
                const cardElement = elements.create('payment', {
                    layout: 'tabs'
                })
                cardElement.mount('#card-element')
                
                // Handle form submission
                document.getElementById('submit-payment').addEventListener('click', async () => {
                    this.processCardPayment(elements, clientSecret)
                })
                
                // Handle real-time validation errors
                cardElement.on('change', ({error}) => {
                    const errorElement = document.getElementById('card-errors')
                    if (error) {
                        errorElement.textContent = error.message
                        errorElement.classList.remove('hidden')
                    } else {
                        errorElement.classList.add('hidden')
                    }
                })
            }
        } catch (error) {
            console.error('Error setting up payment form:', error)
            document.getElementById('card-element').innerHTML = `
                <div class="text-red-600 p-4">
                    Error setting up payment form: ${error.message}
                </div>
            `
        }
        
        // Handle cancel
        document.getElementById('cancel-payment').addEventListener('click', () => {
            document.body.removeChild(modal)
        })
    }
    
    async processCardPayment(elements, clientSecret) {
        const submitButton = document.getElementById('submit-payment')
        const buttonText = document.getElementById('payment-button-text')
        const spinner = document.getElementById('payment-spinner')
        
        // Disable button and show spinner
        submitButton.disabled = true
        buttonText.textContent = 'Processing...'
        spinner.classList.remove('hidden')
        
        try {
            const {error, paymentIntent} = await this.stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: window.location.origin + '?payment=success'
                },
                redirect: 'if_required'
            })
            
            if (error) {
                throw error
            }
            
            if (paymentIntent.status === 'succeeded') {
                // Payment successful
                document.body.removeChild(document.getElementById('cardPaymentModal'))
                this.showMessage('Payment successful! Thank you for your donation', 'success')
                this.resetInterface()
            }
            
        } catch (error) {
            console.error('Payment failed:', error)
            this.showMessage('Payment failed: ' + error.message, 'error')
            
            // Re-enable button
            submitButton.disabled = false
            buttonText.textContent = `Pay $${this.selectedAmount.toFixed(2)}`
            spinner.classList.add('hidden')
        }
    }
    
    async createPaymentIntent(amountCents, email, enableTapToPay = false) {
        const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amountCents,
                currency: 'usd',
                email: email || null,
                enableTapToPay
            })
        })
        
        if (!response.ok) {
            throw new Error('Failed to create payment intent')
        }
        
        return await response.json()
    }
    
    async fetchConnectionToken() {
        // In production, this would fetch a connection token from your backend
        // For now, return a mock token
        return 'pst_test_mock_connection_token'
    }
    
    unexpectedDisconnect() {
        console.log('Reader disconnected unexpectedly')
        this.showMessage('Card reader disconnected', 'error')
    }
    
    cancelTapToPay() {
        document.getElementById('tapToPayInterface').classList.add('hidden')
        this.showMessage('Tap to Pay cancelled', 'info')
    }
    
    resetInterface() {
        this.selectedAmount = 0
        document.getElementById('selectedAmount').textContent = 'Amount: $0.00'
        document.getElementById('tapAmount').textContent = 'Amount: $0.00'
        document.getElementById('emailInput').value = ''
        document.getElementById('tapToPayInterface').classList.add('hidden')
        
        // Remove button highlights
        document.querySelectorAll('.amount-button').forEach(btn => {
            btn.classList.remove('ring-4', 'ring-yellow-400')
        })
    }
    
    async takePhoto() {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Camera not supported')
            }
            
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' }
            })
            
            // Create video element for capture
            const video = document.createElement('video')
            video.srcObject = stream
            video.autoplay = true
            
            // Wait for video to be ready
            await new Promise(resolve => {
                video.onloadedmetadata = resolve
            })
            
            // Create canvas for capture
            const canvas = document.createElement('canvas')
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            
            const ctx = canvas.getContext('2d')
            ctx.drawImage(video, 0, 0)
            
            // Stop camera stream
            stream.getTracks().forEach(track => track.stop())
            
            // Convert to blob and display preview
            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob)
                document.getElementById('photoImg').src = url
                document.getElementById('photoPreview').classList.remove('hidden')
                this.showMessage('Photo captured successfully', 'success')
            }, 'image/jpeg', 0.8)
            
        } catch (error) {
            console.error('Camera error:', error)
            this.showMessage('Camera unavailable: ' + error.message, 'error')
        }
    }
    
    showAdminModal() {
        document.getElementById('adminModal').classList.remove('hidden')
        document.getElementById('adminPinInput').focus()
    }
    
    hideAdminModal() {
        document.getElementById('adminModal').classList.add('hidden')
        document.getElementById('adminPinInput').value = ''
    }
    
    checkAdminPin() {
        const pin = document.getElementById('adminPinInput').value
        if (pin === this.config.adminPin) {
            this.hideAdminModal()
            this.showAdminConfig()
        } else {
            this.showMessage('Invalid PIN', 'error')
            document.getElementById('adminPinInput').value = ''
        }
    }
    
    showAdminConfig() {
        // Create comprehensive admin configuration modal
        const modal = document.createElement('div')
        modal.id = 'adminConfigModal'
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto'
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 my-8">
                <h3 class="text-2xl font-bold mb-6">Admin Configuration</h3>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Location Settings -->
                    <div class="space-y-4">
                        <h4 class="text-lg font-semibold text-gray-800 border-b pb-2">Location Settings</h4>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Location Method</label>
                            <select id="locationMethod" class="w-full p-2 border border-gray-300 rounded-lg">
                                <option value="coordinates">Latitude/Longitude</option>
                                <option value="geoname">Hebcal Geoname ID</option>
                            </select>
                        </div>
                        
                        <div id="coordinatesSection">
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                                    <input type="number" id="latitude" step="0.0001" class="w-full p-2 border border-gray-300 rounded-lg" value="${this.config.latitude}" placeholder="28.5383">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                                    <input type="number" id="longitude" step="0.0001" class="w-full p-2 border border-gray-300 rounded-lg" value="${this.config.longitude}" placeholder="-81.3792">
                                </div>
                            </div>
                        </div>
                        
                        <div id="geonameSection" class="hidden">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Hebcal Geoname ID</label>
                            <input type="number" id="geonameId" class="w-full p-2 border border-gray-300 rounded-lg" placeholder="4167147 (Orlando, FL)">
                            <div class="text-xs text-gray-500 mt-1">
                                Find your city ID at <a href="https://hebcal.com/home/195/jewish-calendar-rest-api#cities" target="_blank" class="text-blue-600">hebcal.com</a>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                            <select id="timezone" class="w-full p-2 border border-gray-300 rounded-lg">
                                <option value="America/New_York" ${this.config.timeZone === 'America/New_York' ? 'selected' : ''}>Eastern Time</option>
                                <option value="America/Chicago" ${this.config.timeZone === 'America/Chicago' ? 'selected' : ''}>Central Time</option>
                                <option value="America/Denver" ${this.config.timeZone === 'America/Denver' ? 'selected' : ''}>Mountain Time</option>
                                <option value="America/Los_Angeles" ${this.config.timeZone === 'America/Los_Angeles' ? 'selected' : ''}>Pacific Time</option>
                                <option value="America/Anchorage" ${this.config.timeZone === 'America/Anchorage' ? 'selected' : ''}>Alaska Time</option>
                                <option value="Pacific/Honolulu" ${this.config.timeZone === 'Pacific/Honolulu' ? 'selected' : ''}>Hawaii Time</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- Prayer Times Settings -->
                    <div class="space-y-4">
                        <h4 class="text-lg font-semibold text-gray-800 border-b pb-2">Prayer Times</h4>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Shacharit (Morning)</label>
                            <input type="time" id="shacharitTime" class="w-full p-2 border border-gray-300 rounded-lg" value="07:00">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Mincha (Afternoon)</label>
                            <input type="time" id="minchaTime" class="w-full p-2 border border-gray-300 rounded-lg" value="14:00">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Maariv (Evening)</label>
                            <input type="time" id="maarivTime" class="w-full p-2 border border-gray-300 rounded-lg" value="20:00">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                            <input type="text" id="organizationName" class="w-full p-2 border border-gray-300 rounded-lg" value="Ohr Shalom" placeholder="Your synagogue name">
                        </div>
                    </div>
                    
                    <!-- Security Settings -->
                    <div class="space-y-4">
                        <h4 class="text-lg font-semibold text-gray-800 border-b pb-2">Security Settings</h4>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Admin PIN</label>
                            <input type="password" id="adminPin" class="w-full p-2 border border-gray-300 rounded-lg" value="${this.config.adminPin}" placeholder="Enter 4-6 digit PIN">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Stripe Publishable Key</label>
                            <input type="text" id="stripePublishableKey" class="w-full p-2 border border-gray-300 rounded-lg text-sm" value="${this.config.stripePublishableKey}" placeholder="pk_live_...">
                            <div class="text-xs text-gray-500 mt-1">Get from Stripe Dashboard → Developers → API keys</div>
                        </div>
                    </div>
                    
                    <!-- System Status -->
                    <div class="space-y-4">
                        <h4 class="text-lg font-semibold text-gray-800 border-b pb-2">System Status</h4>
                        
                        <div class="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                            <div><strong>Selected Amount:</strong> $${this.selectedAmount.toFixed(2)}</div>
                            <div><strong>Stripe Mode:</strong> ${this.config.stripePublishableKey.includes('test') ? 'Test' : 'Live'}</div>
                            <div><strong>Terminal Ready:</strong> ${this.terminal ? 'Yes' : 'No'}</div>
                            <div><strong>Current Location:</strong> ${this.config.latitude}, ${this.config.longitude}</div>
                            <div><strong>Timezone:</strong> ${this.config.timeZone}</div>
                        </div>
                        
                        <div>
                            <h5 class="font-medium text-gray-800 mb-2">Quick Actions</h5>
                            <div class="grid grid-cols-2 gap-2">
                                <button id="testPayment" class="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">Test Payment ($5)</button>
                                <button id="testCamera" class="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm">Test Camera</button>
                                <button id="refreshCalendar" class="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm">Refresh Calendar</button>
                                <button id="enterKiosk" class="px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm">Kiosk Mode</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="flex justify-between items-center mt-8 pt-6 border-t">
                    <div class="text-sm text-gray-500">
                        Changes are saved automatically to browser storage
                    </div>
                    <div class="flex space-x-4">
                        <button id="resetDefaults" class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg">Reset to Defaults</button>
                        <button id="saveConfig" class="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg">Save Changes</button>
                        <button id="adminConfigClose" class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg">Close</button>
                    </div>
                </div>
            </div>
        `
        
        document.body.appendChild(modal)
        
        // Load saved configuration
        this.loadSavedConfig()
        
        // Add event listeners
        this.setupAdminEventListeners(modal)
    }
    
    loadSavedConfig() {
        // Load configuration from localStorage
        const saved = localStorage.getItem('ohrShalomKioskConfig')
        if (saved) {
            try {
                const config = JSON.parse(saved)
                this.config = { ...this.config, ...config }
                
                // Update form fields
                document.getElementById('latitude').value = this.config.latitude || 28.5383
                document.getElementById('longitude').value = this.config.longitude || -81.3792
                document.getElementById('timezone').value = this.config.timeZone || 'America/New_York'
                document.getElementById('adminPin').value = this.config.adminPin || '12345'
                document.getElementById('organizationName').value = this.config.organizationName || 'Ohr Shalom'
                
                // Update prayer times
                if (this.config.shacharit) {
                    const time = this.parseTimeToInput(this.config.shacharit)
                    document.getElementById('shacharitTime').value = time
                }
                if (this.config.mincha) {
                    const time = this.parseTimeToInput(this.config.mincha)
                    document.getElementById('minchaTime').value = time
                }
                if (this.config.maariv) {
                    const time = this.parseTimeToInput(this.config.maariv)
                    document.getElementById('maarivTime').value = time
                }
                
                if (this.config.geonameId) {
                    document.getElementById('locationMethod').value = 'geoname'
                    document.getElementById('geonameId').value = this.config.geonameId
                    this.toggleLocationMethod('geoname')
                }
            } catch (error) {
                console.error('Error loading saved config:', error)
            }
        }
    }
    
    parseTimeToInput(timeString) {
        // Convert "7:00 AM" to "07:00" format
        const match = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
        if (match) {
            let hours = parseInt(match[1])
            const minutes = match[2]
            const period = match[3].toUpperCase()
            
            if (period === 'PM' && hours !== 12) hours += 12
            if (period === 'AM' && hours === 12) hours = 0
            
            return `${hours.toString().padStart(2, '0')}:${minutes}`
        }
        return timeString
    }
    
    setupAdminEventListeners(modal) {
        // Location method toggle
        document.getElementById('locationMethod').addEventListener('change', (e) => {
            this.toggleLocationMethod(e.target.value)
        })
        
        // Save configuration
        document.getElementById('saveConfig').addEventListener('click', () => {
            this.saveConfiguration()
        })
        
        // Reset to defaults
        document.getElementById('resetDefaults').addEventListener('click', () => {
            if (confirm('Reset all settings to defaults? This cannot be undone.')) {
                localStorage.removeItem('ohrShalomKioskConfig')
                this.config = {
                    stripePublishableKey: 'pk_live_51PK1IqLaU6gfF6P3agZ2KfGWMsqnQctB9y7maYu97zUqelsSBE0UKr6RtMSK2DvBLnwkFIPlJOb6M9IN3RUDQvgN00esYwFgBi',
                    adminPin: '12345',
                    latitude: 28.5383,
                    longitude: -81.3792,
                    timeZone: 'America/New_York'
                }
                this.showMessage('Settings reset to defaults', 'success')
                document.body.removeChild(modal)
                setTimeout(() => location.reload(), 1000)
            }
        })
        
        // Close modal
        document.getElementById('adminConfigClose').addEventListener('click', () => {
            document.body.removeChild(modal)
        })
        
        // Quick action buttons
        document.getElementById('testPayment').addEventListener('click', () => {
            this.setAmount(5)
            this.showMessage('Test amount set to $5', 'info')
        })
        
        document.getElementById('testCamera').addEventListener('click', () => {
            this.takePhoto()
        })
        
        document.getElementById('refreshCalendar').addEventListener('click', () => {
            this.loadHebrewCalendar()
            this.showMessage('Calendar refreshed', 'success')
        })
        
        document.getElementById('enterKiosk').addEventListener('click', () => {
            enterKioskMode()
            document.body.removeChild(modal)
            this.showMessage('Entering kiosk mode', 'info')
        })
    }
    
    toggleLocationMethod(method) {
        const coordSection = document.getElementById('coordinatesSection')
        const geonameSection = document.getElementById('geonameSection')
        
        if (method === 'geoname') {
            coordSection.classList.add('hidden')
            geonameSection.classList.remove('hidden')
        } else {
            coordSection.classList.remove('hidden')
            geonameSection.classList.add('hidden')
        }
    }
    
    saveConfiguration() {
        try {
            // Collect all form data
            const newConfig = {
                latitude: parseFloat(document.getElementById('latitude').value) || this.config.latitude,
                longitude: parseFloat(document.getElementById('longitude').value) || this.config.longitude,
                timeZone: document.getElementById('timezone').value || this.config.timeZone,
                adminPin: document.getElementById('adminPin').value || this.config.adminPin,
                organizationName: document.getElementById('organizationName').value || 'Ohr Shalom',
                stripePublishableKey: document.getElementById('stripePublishableKey').value || this.config.stripePublishableKey,
                geonameId: document.getElementById('geonameId').value ? parseInt(document.getElementById('geonameId').value) : null,
                locationMethod: document.getElementById('locationMethod').value,
                shacharit: this.formatTimeFromInput(document.getElementById('shacharitTime').value),
                mincha: this.formatTimeFromInput(document.getElementById('minchaTime').value),
                maariv: this.formatTimeFromInput(document.getElementById('maarivTime').value)
            }
            
            // Update current config
            this.config = { ...this.config, ...newConfig }
            
            // Save to localStorage
            localStorage.setItem('ohrShalomKioskConfig', JSON.stringify(newConfig))
            
            // Update display
            this.updatePrayerTimesDisplay()
            this.loadHebrewCalendar()
            
            this.showMessage('Configuration saved successfully!', 'success')
            
            // Close modal after short delay
            setTimeout(() => {
                const modal = document.getElementById('adminConfigModal')
                if (modal) document.body.removeChild(modal)
            }, 1500)
            
        } catch (error) {
            console.error('Error saving configuration:', error)
            this.showMessage('Error saving configuration: ' + error.message, 'error')
        }
    }
    
    formatTimeFromInput(timeInput) {
        // Convert "07:00" to "7:00 AM" format
        const [hours, minutes] = timeInput.split(':')
        const hourNum = parseInt(hours)
        const period = hourNum >= 12 ? 'PM' : 'AM'
        const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum
        return `${displayHour}:${minutes} ${period}`
    }
    
    updatePrayerTimesDisplay() {
        document.getElementById('shacharit').textContent = `Shacharit: ${this.config.shacharit || '7:00 AM'}`
        document.getElementById('mincha').textContent = `Mincha: ${this.config.mincha || '2:00 PM'}`
        document.getElementById('maariv').textContent = `Maariv: ${this.config.maariv || '8:00 PM'}`
    }
    
    showCustomAmountModal() {
        document.getElementById('customAmountModal').classList.remove('hidden')
        document.getElementById('customAmountInput').focus()
    }
    
    hideCustomAmountModal() {
        document.getElementById('customAmountModal').classList.add('hidden')
        document.getElementById('customAmountInput').value = ''
    }
    
    setCustomAmount() {
        const amount = parseFloat(document.getElementById('customAmountInput').value)
        if (isNaN(amount) || amount <= 0) {
            this.showMessage('Please enter a valid amount', 'error')
            return
        }
        
        this.setAmount(amount)
        this.hideCustomAmountModal()
    }
    
    async loadHebrewCalendar() {
        try {
            let url = '/api/hebcal?'
            
            if (this.config.geonameId && this.config.locationMethod === 'geoname') {
                url += `geonameid=${this.config.geonameId}`
            } else {
                url += `lat=${this.config.latitude}&lon=${this.config.longitude}`
            }
            
            const response = await fetch(url)
            const data = await response.json()
            
            this.displayHebrewCalendar(data)
        } catch (error) {
            console.error('Failed to load Hebrew calendar:', error)
        }
    }
    
    displayHebrewCalendar(data) {
        const items = data.items || []
        
        // Find parsha
        const parsha = items.find(item => item.category === 'parashat')
        if (parsha && parsha.hebrew) {
            document.getElementById('parsha').textContent = parsha.hebrew
        }
        
        // Find Hebrew date
        const hebrewDate = items.find(item => item.hebrew && !item.category)
        if (hebrewDate) {
            document.getElementById('hebrewDate').textContent = hebrewDate.hebrew
        }
        
        // Find candle lighting
        const candles = items.find(item => 
            item.title && item.title.toLowerCase().includes('candle')
        )
        if (candles) {
            document.getElementById('candleLighting').innerHTML = 
                `<i class="fas fa-candle-holder mr-1"></i>${candles.title}`
        }
        
        // Find Havdalah
        const havdalah = items.find(item => 
            item.title && item.title.toLowerCase().includes('havdalah')
        )
        if (havdalah) {
            document.getElementById('havdalah').innerHTML = 
                `<i class="fas fa-wine-glass mr-1"></i>${havdalah.title}`
        }
    }
    
    updateDateTime() {
        const now = new Date()
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: this.config.timeZone
        }
        
        document.getElementById('gregorianDate').textContent = 
            now.toLocaleDateString('en-US', options)
    }
    
    showMessage(message, type = 'info') {
        const messageEl = document.getElementById('statusMessage')
        
        // Set styling based on type
        const styles = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            info: 'bg-blue-500 text-white',
            warning: 'bg-yellow-500 text-black'
        }
        
        messageEl.className = `px-4 py-2 rounded-lg shadow-lg ${styles[type] || styles.info}`
        messageEl.textContent = message
        messageEl.classList.remove('hidden')
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            messageEl.classList.add('hidden')
        }, 5000)
    }
}

// Initialize the kiosk when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new OhrShalomKiosk()
})

// Kiosk mode helpers
function enterKioskMode() {
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen()
    }
    
    // Lock orientation to landscape if possible
    if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape')
    }
}

function exitKioskMode() {
    if (document.exitFullscreen) {
        document.exitFullscreen()
    }
}

// Export for potential external use
window.OhrShalomKiosk = OhrShalomKiosk
window.enterKioskMode = enterKioskMode
window.exitKioskMode = exitKioskMode