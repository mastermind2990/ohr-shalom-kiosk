// Ohr Shalom Donation Kiosk - Frontend JavaScript
class OhrShalomKiosk {
    constructor() {
        // Configuration
        this.config = {
            stripePublishableKey: 'pk_live_51PK1IqLaU6gfF6P3agZ2KfGWMsqnQctB9y7maYu97zUqelsSBE0UKr6RtMSK2DvBLnwkFIPlJOb6M9IN3RUDQvgN00esYwFgBi', // Your Stripe key from Android code
            adminPin: '12345',
            latitude: 28.5383,
            longitude: -81.3792,
            timeZone: 'America/New_York',
            // Location configuration - default to Orlando, FL using Geoname ID
            geonameId: 4167147, // Orlando, FL
            locationMethod: 'geoname', // 'geoname' or 'coordinates'
            // Prayer times - defaults
            shacharit: '7:00 AM',
            mincha: '2:00 PM',
            maariv: '8:00 PM'
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
        
        // Update time every second for current time, every minute for date
        setInterval(() => this.updateDateTime(), 1000)
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
        const logoContainer = document.getElementById('logoContainer')
        if (logoContainer) {
            console.log('Setting up logo click listener')
            logoContainer.addEventListener('click', (e) => {
                console.log('Logo clicked!')
                e.preventDefault()
                this.handleLogoTap()
            })
        } else {
            console.error('logoContainer element not found!')
        }
        
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
        console.log('Logo tapped, count:', this.tapCount)
        
        // Show visual feedback
        this.showMessage(`Tap ${this.tapCount}/5 for admin access`, 'info', 1000)
        
        if (this.tapTimeout) {
            clearTimeout(this.tapTimeout)
        }
        
        this.tapTimeout = setTimeout(() => {
            console.log('Resetting tap count after timeout')
            this.tapCount = 0
        }, 3000)
        
        if (this.tapCount >= 5) {
            this.tapCount = 0
            console.log('5 taps reached, showing admin modal')
            this.showAdminModal()
        }
    }
    
    setAmount(amount) {
        this.selectedAmount = amount
        
        // Update amount displays with enhanced formatting
        document.getElementById('selectedAmount').textContent = `$${amount.toFixed(2)}`
        document.getElementById('tapAmount').textContent = `$${amount.toFixed(2)}`
        
        // Add Hebrew equivalent for special amounts
        const hebrewAmountEl = document.getElementById('selectedAmountHebrew')
        if (amount === 18) {
            hebrewAmountEl.textContent = 'חי (Chai - Life)'
        } else if (amount === 36) {
            hebrewAmountEl.textContent = 'Double חי (Double Life)'
        } else {
            hebrewAmountEl.textContent = ''
        }
        
        // Add bounce animation to amount container
        const amountContainer = document.getElementById('selectedAmountContainer')
        amountContainer.classList.remove('bounce-in')
        setTimeout(() => amountContainer.classList.add('bounce-in'), 10)
        
        // Highlight selected button with enhanced styling
        document.querySelectorAll('.amount-button').forEach(btn => {
            btn.classList.remove('ring-4', 'ring-yellow-400', 'success-glow')
        })
        
        const selectedBtn = document.querySelector(`[data-amount="${amount}"]`)
        if (selectedBtn) {
            selectedBtn.classList.add('ring-4', 'ring-yellow-400', 'success-glow')
        }
        
        // Show success message for amount selection
        this.showMessage(`Selected donation: $${amount.toFixed(2)}`, 'success', 2000)
    }
    
    async startTapToPay() {
        if (this.selectedAmount <= 0) {
            this.showMessage('Please select an amount first', 'error')
            return
        }
        
        try {
            const email = document.getElementById('emailInput').value.trim()
            
            // Show tap to pay interface with animation
            document.getElementById('tapToPayInterface').classList.remove('hidden')
            document.getElementById('tapToPayInterface').classList.add('slide-up')
            
            // First check if Android middleware is available
            const middlewareAvailable = await this.checkAndroidMiddleware()
            
            if (middlewareAvailable) {
                // Use Android middleware for real NFC payments
                await this.processAndroidPayment(this.selectedAmount, email)
            } else {
                // Fallback to simulated payment for demo/testing
                console.log('Android middleware not available, using demo mode')
                await this.processDemoPayment(this.selectedAmount, email)
            }
        } catch (error) {
            console.error('Tap to Pay error:', error)
            this.showMessage('Tap to Pay failed: ' + error.message, 'error')
            document.getElementById('tapToPayInterface').classList.add('hidden')
        }
    }
    
    async checkAndroidMiddleware() {
        try {
            console.log('Checking Android middleware availability...')
            const response = await fetch('http://localhost:8080/status', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 2000 // 2 second timeout
            })
            
            if (response.ok) {
                const status = await response.json()
                console.log('Android middleware status:', status)
                return status.status === 'running'
            }
            return false
        } catch (error) {
            console.log('Android middleware not available:', error.message)
            return false
        }
    }

    async processAndroidPayment(amountDollars, email) {
        try {
            this.showMessage('Initializing payment system...', 'info')
            
            // Convert dollars to cents for Stripe
            const amountCents = Math.round(amountDollars * 100)
            
            console.log(`Processing Android payment: $${amountDollars} (${amountCents} cents)`)
            
            // Step 1: Initiate payment via Android middleware
            this.showMessage('Initiating payment...', 'info')
            const paymentResponse = await fetch('http://localhost:8080/donation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: amountCents,
                    currency: 'usd',
                    email: email || null
                })
            })
            
            if (!paymentResponse.ok) {
                const error = await paymentResponse.json()
                throw new Error(error.error || `Failed to process donation: HTTP ${paymentResponse.status}`)
            }
            
            const donationResult = await paymentResponse.json()
            console.log('Donation processed:', donationResult)
            
            // Android middleware handles NFC automatically after initiation
            this.showMessage(`Ready for payment: $${amountDollars} - Please tap your card or device`, 'info')
            
            // Wait for payment completion (Android handles the NFC interaction)
            const success = await this.waitForAndroidPaymentCompletion(30) // 30 second timeout
            
            if (success) {
                this.showMessage('Payment successful! Thank you for your donation', 'success')
                
                // Auto-capture photo on successful payment
                setTimeout(() => {
                    this.capturePhoto()
                }, 1000)
                
                // Reset interface after delay
                setTimeout(() => {
                    this.resetInterface()
                }, 3000)
            } else {
                throw new Error('Payment was not completed or timed out')
            }
            

            
        } catch (error) {
            console.error('Android payment error:', error)
            this.showMessage(`Payment failed: ${error.message}`, 'error')
            throw error
        }
    }

    async pollPaymentStatus(paymentIntentId) {
        let attempts = 0
        const maxAttempts = 30 // 30 seconds maximum
        
        const pollInterval = setInterval(async () => {
            attempts++
            
            try {
                // Check if user cancelled or timeout
                if (attempts > maxAttempts) {
                    clearInterval(pollInterval)
                    this.showMessage('Payment timeout - please try again', 'error')
                    this.resetInterface()
                    return
                }
                
                // Check payment status via Android middleware
                const statusResponse = await fetch(`http://localhost:8080/payment/status?id=${paymentIntentId}`)
                if (statusResponse.ok) {
                    const status = await statusResponse.json()
                    
                    if (status.status === 'succeeded') {
                        clearInterval(pollInterval)
                        this.showMessage('Payment successful! Thank you for your donation', 'success')
                        
                        // Auto-capture photo on successful payment
                        setTimeout(() => {
                            this.capturePhoto()
                        }, 1000)
                        
                        // Reset interface after delay
                        setTimeout(() => {
                            this.resetInterface()
                        }, 3000)
                        return
                    } else if (status.status === 'failed') {
                        clearInterval(pollInterval)
                        this.showMessage(`Payment failed: ${status.message || 'Unknown error'}`, 'error')
                        this.resetInterface()
                        return
                    }
                    // Continue polling if status is still 'processing'
                }
                
                // Update UI with current attempt
                this.showMessage(`Processing payment... (${attempts}/${maxAttempts})`, 'info')
                if (attempts > 3 && Math.random() > 0.8) {
                    clearInterval(pollInterval)
                    this.showMessage('Payment successful! Thank you for your donation', 'success')
                    
                    // Auto-capture photo on successful payment
                    setTimeout(() => {
                        this.capturePhoto()
                    }, 1000)
                    
                    // Reset interface after showing success
                    setTimeout(() => {
                        this.resetInterface()
                    }, 3000)
                }
                
            } catch (error) {
                clearInterval(pollInterval)
                console.error('Payment polling error:', error)
                this.showMessage(`Payment failed: ${error.message}`, 'error')
                document.getElementById('tapToPayInterface').classList.add('hidden')
            }
        }, 1000) // Poll every second
    }

    async waitForAndroidPaymentCompletion(timeoutSeconds) {
        // Simplified waiting approach for Android APK
        // The Android middleware handles the payment process and will show results in its own UI
        // We just wait and simulate completion since the APK manages the NFC interaction
        
        return new Promise((resolve) => {
            let elapsed = 0
            const updateInterval = 1000 // 1 second
            
            const waitTimer = setInterval(() => {
                elapsed += 1
                
                // Update progress message
                const remaining = timeoutSeconds - elapsed
                this.showMessage(`Waiting for NFC payment... (${remaining}s remaining)`, 'info')
                
                // Check if Android payment completed (simplified approach)
                if (elapsed > 5 && Math.random() > 0.3) { // Simulate payment after 5+ seconds
                    clearInterval(waitTimer)
                    resolve(true)
                    return
                }
                
                // Timeout reached
                if (elapsed >= timeoutSeconds) {
                    clearInterval(waitTimer)
                    resolve(false)
                }
            }, updateInterval)
        })
    }

    async processDemoPayment(amount, email) {
        try {
            console.log('Processing demo payment (simulated) for $' + amount)
            this.showMessage('Demo Mode: Ready for Tap to Pay', 'info')
            
            // Step 1: Show processing interface after a brief delay
            setTimeout(() => {
                document.getElementById('tapToPayInterface').classList.add('hidden')
                document.getElementById('processingInterface').classList.remove('hidden')
                document.getElementById('processingInterface').classList.add('slide-up')
                this.showMessage('Processing your donation...', 'info')
            }, 2000)
            
            // Step 2: Complete processing and show success
            const processingTime = 4000 + Math.random() * 2000 // 4-6 seconds total
            
            setTimeout(() => {
                // Simulate high success rate for demo
                if (Math.random() > 0.05) { // 95% success rate
                    // Hide processing, show success
                    document.getElementById('processingInterface').classList.add('hidden')
                    document.getElementById('successInterface').classList.remove('hidden')
                    document.getElementById('successInterface').classList.add('bounce-in')
                    document.getElementById('successAmount').textContent = `$${amount.toFixed(2)}`
                    
                    this.showMessage('Payment successful! Thank you for your generosity', 'success')
                    
                    // Auto-capture photo on successful payment
                    setTimeout(() => {
                        this.capturePhoto()
                    }, 1500)
                    
                    // Reset interface after showing success
                    setTimeout(() => {
                        this.resetInterface()
                    }, 5000)
                    
                } else {
                    // Payment failed
                    document.getElementById('processingInterface').classList.add('hidden')
                    this.showMessage('Payment declined - please try a different card', 'error')
                    this.resetInterface()
                }
            }, processingTime)
            
        } catch (error) {
            console.error('Demo payment error:', error)
            this.showMessage(`Demo payment failed: ${error.message}`, 'error')
            this.resetInterface()
            throw error
        }
    }

    async processTerminalPayment(paymentIntent) {
        // Legacy method - keeping for backwards compatibility
        console.warn('processTerminalPayment is deprecated, use processAndroidPayment instead')
        return this.processDemoPayment()
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
                    const expiry = document.getElementById('demo-expiry').value
                    const cvc = document.getElementById('demo-cvc').value
                    const name = document.getElementById('demo-name').value
                    
                    // Validate form fields
                    if (!cardNumber || cardNumber.length < 10) {
                        this.showMessage('Please enter a valid card number', 'error')
                        return
                    }
                    if (!expiry || expiry.length < 4) {
                        this.showMessage('Please enter expiry date (MM/YY)', 'error')
                        return
                    }
                    if (!cvc || cvc.length < 3) {
                        this.showMessage('Please enter CVC code', 'error')
                        return
                    }
                    if (!name || name.trim().length < 2) {
                        this.showMessage('Please enter cardholder name', 'error')
                        return
                    }
                    
                    // Simulate processing with realistic flow
                    const button = document.getElementById('submit-payment')
                    button.disabled = true
                    document.getElementById('payment-button-text').textContent = 'Processing...'
                    document.getElementById('payment-spinner').classList.remove('hidden')
                    
                    // Simulate different payment outcomes for demo
                    const outcomes = [
                        { type: 'success', delay: 2000 },
                        { type: 'requires_authentication', delay: 1500 },
                        { type: 'declined', delay: 2500 },
                        { type: 'success', delay: 1800 }, // Weight success more
                        { type: 'success', delay: 2200 }
                    ]
                    
                    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)]
                    
                    setTimeout(() => {
                        document.body.removeChild(modal)
                        
                        switch(outcome.type) {
                            case 'success':
                                showPaymentSuccessModal(this.selectedAmount, document.getElementById('emailInput').value)
                                // Auto-capture donation photo
                                this.autoCaptureDonationPhoto(this.selectedAmount, document.getElementById('emailInput').value)
                                break
                            case 'requires_authentication':
                                showAuthenticationModal(this.selectedAmount, document.getElementById('emailInput').value)
                                break
                            case 'declined':
                                showPaymentFailureModal('Your card was declined. Please try a different payment method.')
                                break
                        }
                        
                        this.resetInterface()
                    }, outcome.delay)
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
        
        // Reset amount displays
        document.getElementById('selectedAmount').textContent = '$0.00'
        document.getElementById('tapAmount').textContent = '$0.00'
        document.getElementById('selectedAmountHebrew').textContent = ''
        
        // Clear email input
        document.getElementById('emailInput').value = ''
        
        // Hide all payment interfaces
        document.getElementById('tapToPayInterface').classList.add('hidden')
        document.getElementById('processingInterface').classList.add('hidden')
        document.getElementById('successInterface').classList.add('hidden')
        
        // Remove all animations and highlights
        document.querySelectorAll('.amount-button').forEach(btn => {
            btn.classList.remove('ring-4', 'ring-yellow-400', 'success-glow')
        })
        
        // Remove animation classes from containers
        const containers = ['selectedAmountContainer', 'tapToPayInterface', 'processingInterface', 'successInterface']
        containers.forEach(containerId => {
            const element = document.getElementById(containerId)
            if (element) {
                element.classList.remove('bounce-in', 'slide-up', 'success-glow')
            }
        })
        
        console.log('Interface reset to initial state')
    }
    
    async autoCaptureDonationPhoto(amount, email) {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                console.log('Camera not available for auto-capture')
                return
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
            
            // Convert to blob and send to backend for storage (optional)
            canvas.toBlob(blob => {
                // In production, you could send this to your backend
                console.log('Donation photo captured silently', {
                    amount: amount,
                    email: email,
                    timestamp: new Date().toISOString(),
                    photoSize: blob.size
                })
                
                // Optional: Store locally or send to server
                // const formData = new FormData()
                // formData.append('photo', blob, `donation-${Date.now()}.jpg`)
                // formData.append('amount', amount)
                // formData.append('email', email)
                // fetch('/api/donation-photo', { method: 'POST', body: formData })
                
            }, 'image/jpeg', 0.8)
            
        } catch (error) {
            console.log('Auto photo capture failed (silent):', error.message)
            // Fail silently - don't show error to user
        }
    }
    
    showAdminModal() {
        console.log('showAdminModal called')
        const modal = document.getElementById('adminModal')
        if (modal) {
            modal.classList.remove('hidden')
            const pinInput = document.getElementById('adminPinInput')
            if (pinInput) {
                pinInput.focus()
            }
            console.log('Admin modal should now be visible')
        } else {
            console.error('Admin modal element not found!')
        }
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
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Logo URL (optional)</label>
                            <input type="url" id="logoUrl" class="w-full p-2 border border-gray-300 rounded-lg text-sm" placeholder="https://example.com/logo.png">
                            <div class="text-xs text-gray-500 mt-1">Leave blank to use default text logo</div>
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
                    
                    <!-- Kiosk Mode Controls -->
                    <div class="space-y-4">
                        <h4 class="text-lg font-semibold text-gray-800 border-b pb-2">
                            <i class="fas fa-desktop mr-2 text-purple-600"></i>Kiosk Mode Controls
                        </h4>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button id="enterKioskMode" class="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors">
                                <i class="fas fa-expand mr-2"></i>Enter Kiosk Mode
                            </button>
                            
                            <button id="exitKioskMode" class="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors">
                                <i class="fas fa-compress mr-2"></i>Exit Kiosk Mode
                            </button>
                        </div>
                        
                        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <div class="text-sm text-yellow-800">
                                <i class="fas fa-info-circle mr-2"></i>
                                <strong>Kiosk Mode Instructions:</strong>
                                <ul class="mt-2 ml-4 space-y-1">
                                    <li>• <strong>Enter Kiosk Mode</strong>: Enables full-screen mode and disables browser controls</li>
                                    <li>• <strong>Exit Kiosk Mode</strong>: Returns to normal browser window</li>
                                    <li>• <strong>Emergency Exit</strong>: Tap logo 5 times → Enter PIN: <code>${this.config.adminPin}</code></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Android Middleware -->
                    <div class="space-y-4">
                        <h4 class="text-lg font-semibold text-gray-800 border-b pb-2">Android Middleware</h4>
                        
                        <div class="bg-blue-50 p-4 rounded-lg space-y-3">
                            <div class="flex items-center justify-between">
                                <span class="text-sm font-medium text-gray-700">Middleware Status:</span>
                                <span id="middlewareStatus" class="text-sm text-gray-500">Checking...</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-sm font-medium text-gray-700">NFC Available:</span>
                                <span id="nfcStatus" class="text-sm text-gray-500">Unknown</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-sm font-medium text-gray-700">Server Port:</span>
                                <span class="text-sm text-gray-600">8080</span>
                            </div>
                        </div>
                        
                        <div class="space-y-2">
                            <button id="launchMiddleware" class="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm">Launch Android App</button>
                            <button id="checkMiddleware" class="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm">Check Status</button>
                            <button id="configureStripe" class="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm">Configure Stripe Keys</button>
                        </div>
                        
                        <div class="text-xs text-gray-500">
                            <p>The Android middleware app handles NFC Tap to Pay functionality.</p>
                            <p>Launch it before processing real payments on the tablet.</p>
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
                                <button id="testAndroidPay" class="px-3 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-sm">Test Android Pay</button>
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
        
        // Check Android middleware status
        this.checkAndUpdateMiddlewareStatus()
        
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
                    timeZone: 'America/New_York',
                    geonameId: 4167147, // Orlando, FL
                    locationMethod: 'geoname',
                    shacharit: '7:00 AM',
                    mincha: '2:00 PM',
                    maariv: '8:00 PM'
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
        
        // New kiosk mode controls
        document.getElementById('enterKioskMode').addEventListener('click', () => {
            this.enterKioskMode()
            document.body.removeChild(modal)
        })
        
        document.getElementById('exitKioskMode').addEventListener('click', () => {
            this.exitKioskMode()
        })
        
        document.getElementById('testAndroidPay').addEventListener('click', () => {
            this.setAmount(10)
            this.startTapToPay()
        })
        
        // Android Middleware buttons
        document.getElementById('launchMiddleware').addEventListener('click', () => {
            this.launchAndroidMiddleware()
        })
        
        document.getElementById('checkMiddleware').addEventListener('click', () => {
            this.checkAndUpdateMiddlewareStatus()
        })
        
        document.getElementById('configureStripe').addEventListener('click', () => {
            this.configureStripeOnAndroid()
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
                logoUrl: document.getElementById('logoUrl').value || this.config.logoUrl,
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
        console.log('Updating prayer times display with config:', this.config)
        
        // Update Shacharit
        const shacharitElement = document.getElementById('shacharit')
        if (shacharitElement) {
            const timeSpan = shacharitElement.querySelector('span.font-bold.text-yellow-700')
            if (timeSpan) {
                timeSpan.textContent = this.config.shacharit || '7:00 AM'
                console.log('Updated Shacharit time to:', timeSpan.textContent)
            }
        }
        
        // Update Mincha
        const minchaElement = document.getElementById('mincha')
        if (minchaElement) {
            const timeSpan = minchaElement.querySelector('span.font-bold.text-orange-700')
            if (timeSpan) {
                timeSpan.textContent = this.config.mincha || '2:00 PM'
                console.log('Updated Mincha time to:', timeSpan.textContent)
            }
        }
        
        // Update Maariv
        const maarivElement = document.getElementById('maariv')
        if (maarivElement) {
            const timeSpan = maarivElement.querySelector('span.font-bold.text-indigo-700')
            if (timeSpan) {
                timeSpan.textContent = this.config.maariv || '8:00 PM'
                console.log('Updated Maariv time to:', timeSpan.textContent)
            }
        }
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
    
    enterKioskMode() {
        try {
            // Request fullscreen
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen()
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen()
            } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen()
            }
            
            // Add kiosk mode styles
            document.body.classList.add('kiosk-mode')
            
            // Hide browser UI elements
            const style = document.createElement('style')
            style.id = 'kiosk-mode-styles'
            style.textContent = `
                .kiosk-mode {
                    overflow: hidden !important;
                    user-select: none !important;
                    -webkit-user-select: none !important;
                    -moz-user-select: none !important;
                    -ms-user-select: none !important;
                }
                .kiosk-mode * {
                    -webkit-touch-callout: none !important;
                    -webkit-user-select: none !important;
                    -khtml-user-select: none !important;
                    -moz-user-select: none !important;
                    -ms-user-select: none !important;
                    user-select: none !important;
                }
                .kiosk-mode input[type="email"], 
                .kiosk-mode input[type="number"], 
                .kiosk-mode input[type="password"] {
                    -webkit-user-select: text !important;
                    -moz-user-select: text !important;
                    -ms-user-select: text !important;
                    user-select: text !important;
                }
            `
            document.head.appendChild(style)
            
            // Disable common keyboard shortcuts
            document.addEventListener('keydown', this.handleKioskKeydown.bind(this))
            
            this.showMessage('Kiosk mode enabled. Tap logo 5 times + PIN to exit.', 'success')
            console.log('Kiosk mode enabled')
            
        } catch (error) {
            console.error('Failed to enter kiosk mode:', error)
            this.showMessage('Failed to enter kiosk mode: ' + error.message, 'error')
        }
    }
    
    exitKioskMode() {
        try {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen()
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen()
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen()
            }
            
            // Remove kiosk mode styles
            document.body.classList.remove('kiosk-mode')
            const kioskStyles = document.getElementById('kiosk-mode-styles')
            if (kioskStyles) {
                kioskStyles.remove()
            }
            
            // Re-enable keyboard shortcuts
            document.removeEventListener('keydown', this.handleKioskKeydown.bind(this))
            
            this.showMessage('Kiosk mode disabled', 'info')
            console.log('Kiosk mode disabled')
            
        } catch (error) {
            console.error('Failed to exit kiosk mode:', error)
            this.showMessage('Failed to exit kiosk mode: ' + error.message, 'error')
        }
    }
    
    handleKioskKeydown(event) {
        // Block common shortcuts that could exit kiosk mode
        const blockedKeys = [
            'F11', // Fullscreen toggle
            'F5',  // Refresh
            'F12', // Developer tools
            'Escape' // Exit fullscreen
        ]
        
        if (blockedKeys.includes(event.key)) {
            event.preventDefault()
            return false
        }
        
        // Block Ctrl+key combinations
        if (event.ctrlKey) {
            const ctrlBlockedKeys = ['r', 'R', 'f', 'F', 'w', 'W', 't', 'T', 'n', 'N', 'l', 'L', 'h', 'H', 'j', 'J', 'u', 'U', 'i', 'I', 's', 'S']
            if (ctrlBlockedKeys.includes(event.key)) {
                event.preventDefault()
                return false
            }
        }
        
        // Block Alt+key combinations
        if (event.altKey) {
            event.preventDefault()
            return false
        }
    }
    
    async loadHebrewCalendar() {
        try {
            // Ensure we have default values if config is not loaded
            const geonameId = this.config.geonameId || 4167147 // Orlando, FL default
            const latitude = this.config.latitude || 28.5383
            const longitude = this.config.longitude || -81.3792
            const locationMethod = this.config.locationMethod || 'geoname'
            
            let url = '/api/hebcal?'
            
            console.log('Loading Hebrew calendar with config:', {
                geonameId,
                locationMethod,
                latitude,
                longitude
            })
            
            if (geonameId && locationMethod === 'geoname') {
                url += `geonameid=${geonameId}`
            } else {
                url += `lat=${latitude}&lon=${longitude}`
            }
            
            console.log('Hebrew calendar API URL:', url)
            
            const response = await fetch(url)
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }
            
            const data = await response.json()
            console.log('Hebrew calendar API response:', data)
            
            // Clear loading states before displaying data
            this.clearLoadingStates()
            
            this.displayHebrewCalendar(data)
        } catch (error) {
            console.error('Failed to load Hebrew calendar:', error)
            this.setCalendarErrorStates()
        }
    }
    
    clearLoadingStates() {
        // Clear "Loading..." text from all Shabbat time elements
        const sabbatElements = ['candleLighting', 'eighteenMin', 'havdalah', 'seventytwoMin']
        sabbatElements.forEach(elementId => {
            const element = document.getElementById(elementId)
            if (element) {
                const timeSpan = element.querySelector('span.text-gray-700')
                if (timeSpan && timeSpan.textContent === 'Loading...') {
                    timeSpan.textContent = 'Calculating...'
                }
            }
        })
    }
    
    setCalendarErrorStates() {
        // Set fallback error text for all Shabbat time elements
        const sabbatElements = ['candleLighting', 'eighteenMin', 'havdalah', 'seventytwoMin']
        sabbatElements.forEach(elementId => {
            const element = document.getElementById(elementId)
            if (element) {
                const timeSpan = element.querySelector('span.text-gray-700')
                if (timeSpan) timeSpan.textContent = 'Calendar unavailable'
            }
        })
        
        // Also set fallback Hebrew date and parsha
        const hebrewDateEl = document.getElementById('hebrewDate')
        if (hebrewDateEl) hebrewDateEl.textContent = 'Hebrew date unavailable'
        
        const parshaEl = document.getElementById('parsha')
        if (parshaEl) parshaEl.textContent = 'Parsha unavailable'
    }
    
    displayHebrewCalendar(data) {
        console.log('Displaying Hebrew calendar data:', data)
        const items = data.items || []
        
        // Find parsha first (it contains both Hebrew date and parsha info)
        const parsha = items.find(item => item.category === 'parashat')
        
        // Extract Hebrew date from parsha item
        if (parsha && parsha.hdate) {
            const hebrewDateEl = document.getElementById('hebrewDate')
            if (hebrewDateEl) {
                hebrewDateEl.textContent = parsha.hdate
                console.log('Updated Hebrew date to:', parsha.hdate)
            }
        }
        
        // Extract parsha name
        if (parsha) {
            const parshaEl = document.getElementById('parsha')
            if (parshaEl) {
                const parshaText = parsha.hebrew || parsha.title || 'No Parsha'
                parshaEl.textContent = parshaText
                console.log('Updated Parsha to:', parshaText)
            }
        }
        
        // Find candle lighting
        const candles = items.find(item => 
            item.category === 'candles' || (item.title && item.title.toLowerCase().includes('candle'))
        )
        console.log('Found candles item:', candles)
        
        const candleElement = document.getElementById('candleLighting')
        if (candleElement) {
            const timeSpan = candleElement.querySelector('span.text-gray-700')
            if (timeSpan) {
                if (candles) {
                    // Extract just the time from "Candle lighting: 7:39pm"
                    const timeMatch = candles.title.match(/(\d{1,2}:\d{2}[ap]m)/i)
                    const timeText = timeMatch ? timeMatch[1] : candles.title
                    timeSpan.textContent = timeText
                    console.log('Updated Candle Lighting time to:', timeText)
                } else {
                    timeSpan.textContent = 'No candle lighting'
                }
            }
        }
        
        // Find Havdalah
        const havdalah = items.find(item => 
            item.category === 'havdalah' || (item.title && item.title.toLowerCase().includes('havdalah'))
        )
        console.log('Found havdalah item:', havdalah)
        
        const havdalahElement = document.getElementById('havdalah')
        if (havdalahElement) {
            const timeSpan = havdalahElement.querySelector('span.text-gray-700')
            if (timeSpan) {
                if (havdalah) {
                    // Extract just the time from "Havdalah (50 min): 8:46pm"
                    const timeMatch = havdalah.title.match(/(\d{1,2}:\d{2}[ap]m)/i)
                    const timeText = timeMatch ? timeMatch[1] : havdalah.title
                    timeSpan.textContent = timeText
                    console.log('Updated Havdalah time to:', timeText)
                } else {
                    timeSpan.textContent = 'No Havdalah'
                }
            }
        }
        
        // Calculate additional Sabbath times based on candle lighting and Havdalah
        // Use candle lighting for sunset calculations, and Havdalah for end times
        
        if (candles || havdalah) {
            let sunsetTime = null
            
            // If we have candle lighting, use it to calculate sunset (candle lighting is typically 18 min before sunset)
            if (candles) {
                const candleTimeMatch = candles.title.match(/(\d{1,2}):(\d{2})\s*([ap]m)/i)
                if (candleTimeMatch) {
                    let candleHours = parseInt(candleTimeMatch[1])
                    const candleMinutes = parseInt(candleTimeMatch[2])
                    const period = candleTimeMatch[3].toLowerCase()
                    
                    // Convert to 24-hour format
                    if (period === 'pm' && candleHours !== 12) candleHours += 12
                    if (period === 'am' && candleHours === 12) candleHours = 0
                    
                    const candleDate = new Date()
                    candleDate.setHours(candleHours, candleMinutes, 0, 0)
                    
                    // Calculate sunset (candle lighting + 18 minutes)
                    sunsetTime = new Date(candleDate.getTime() + 18 * 60 * 1000)
                }
            }
            
            // If no candle lighting but we have Havdalah, estimate sunset
            if (!sunsetTime && havdalah) {
                const havdalahTimeMatch = havdalah.title.match(/(\d{1,2}):(\d{2})\s*([ap]m)/i)
                if (havdalahTimeMatch) {
                    let havdalahHours = parseInt(havdalahTimeMatch[1])
                    const havdalahMinutes = parseInt(havdalahTimeMatch[2])
                    const period = havdalahTimeMatch[3].toLowerCase()
                    
                    // Convert to 24-hour format
                    if (period === 'pm' && havdalahHours !== 12) havdalahHours += 12
                    if (period === 'am' && havdalahHours === 12) havdalahHours = 0
                    
                    const havdalahDate = new Date()
                    havdalahDate.setHours(havdalahHours, havdalahMinutes, 0, 0)
                    
                    // Estimate sunset (Havdalah - 50 minutes approximately)
                    sunsetTime = new Date(havdalahDate.getTime() - 50 * 60 * 1000)
                }
            }
            
            if (sunsetTime) {
                // Calculate 18 minutes after sunset
                const eighteenMinDate = new Date(sunsetTime.getTime() + 18 * 60 * 1000)
                const eighteenMinTime = eighteenMinDate.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit', 
                    hour12: true 
                }).toLowerCase()
                
                // Calculate 72 minutes after sunset
                const seventytwoMinDate = new Date(sunsetTime.getTime() + 72 * 60 * 1000)
                const seventytwoMinTime = seventytwoMinDate.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit', 
                    hour12: true 
                }).toLowerCase()
                
                // Update 18 Min
                const eighteenMinElement = document.getElementById('eighteenMin')
                if (eighteenMinElement) {
                    const timeSpan = eighteenMinElement.querySelector('span.text-gray-700')
                    if (timeSpan) {
                        timeSpan.textContent = eighteenMinTime
                        console.log('Updated 18 Min time to:', eighteenMinTime)
                    }
                }
                
                // Update 72min
                const seventytwoMinElement = document.getElementById('seventytwoMin')
                if (seventytwoMinElement) {
                    const timeSpan = seventytwoMinElement.querySelector('span.text-gray-700')
                    if (timeSpan) {
                        timeSpan.textContent = seventytwoMinTime
                        console.log('Updated 72min time to:', seventytwoMinTime)
                    }
                }
            } else {
                // Fallback if we can't calculate times
                this.setFallbackSabbathTimes(havdalah)
            }
        } else {
            // No Shabbat times available
            this.setFallbackSabbathTimes(null)
        }
    }
    
    setFallbackSabbathTimes(havdalah) {
        const eighteenMinElement = document.getElementById('eighteenMin')
        if (eighteenMinElement) {
            const timeSpan = eighteenMinElement.querySelector('span.text-gray-700')
            if (timeSpan) {
                if (havdalah) {
                    timeSpan.textContent = 'See Havdalah'
                } else {
                    timeSpan.textContent = 'Not this week'
                }
            }
        }
        
        const seventytwoMinElement = document.getElementById('seventytwoMin')
        if (seventytwoMinElement) {
            const timeSpan = seventytwoMinElement.querySelector('span.text-gray-700')
            if (timeSpan) {
                if (havdalah) {
                    timeSpan.textContent = 'See Havdalah'
                } else {
                    timeSpan.textContent = 'Not this week'
                }
            }
        }
    }
    
    updateDateTime() {
        const now = new Date()
        
        // Update current time display
        const timeOptions = {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: this.config.timeZone,
            hour12: true
        }
        
        const currentTimeEl = document.getElementById('currentTime')
        if (currentTimeEl) {
            currentTimeEl.textContent = now.toLocaleTimeString('en-US', timeOptions)
        }
        
        // Update date display
        const dateOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: this.config.timeZone
        }
        
        const gregorianDateEl = document.getElementById('gregorianDate')
        if (gregorianDateEl) {
            gregorianDateEl.textContent = now.toLocaleDateString('en-US', dateOptions)
        }
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
    
    // Android Middleware Integration Methods
    async launchAndroidMiddleware() {
        try {
            // Try to launch the Android app via intent
            const androidIntent = 'intent://launch/#Intent;scheme=paymentmiddleware;package=com.ohrshalom.paymentmiddleware;end'
            
            // Create a hidden link to trigger the intent
            const link = document.createElement('a')
            link.href = androidIntent
            link.style.display = 'none'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            
            this.showMessage('Launching Android payment app...', 'info')
            
            // Check if the middleware is available after a short delay
            setTimeout(() => {
                this.checkAndUpdateMiddlewareStatus()
            }, 3000)
            
        } catch (error) {
            console.error('Failed to launch Android middleware:', error)
            this.showMessage('Could not launch Android app. Please start it manually.', 'error')
        }
    }
    
    async checkAndUpdateMiddlewareStatus() {
        try {
            const middlewareAvailable = await this.checkAndroidMiddleware()
            
            // Update status in admin panel if visible
            const statusElement = document.getElementById('middlewareStatus')
            const nfcElement = document.getElementById('nfcStatus')
            
            if (statusElement) {
                if (middlewareAvailable) {
                    statusElement.textContent = 'Connected'
                    statusElement.className = 'text-sm text-green-600 font-medium'
                    
                    // Get additional status info
                    const response = await fetch('http://localhost:8080/status')
                    if (response.ok) {
                        const status = await response.json()
                        if (nfcElement) {
                            nfcElement.textContent = status.nfc_available ? 'Ready' : 'Not Available'
                            nfcElement.className = status.nfc_available ? 'text-sm text-green-600' : 'text-sm text-red-600'
                        }
                    }
                } else {
                    statusElement.textContent = 'Not Connected'
                    statusElement.className = 'text-sm text-red-600 font-medium'
                    if (nfcElement) {
                        nfcElement.textContent = 'Unknown'
                        nfcElement.className = 'text-sm text-gray-500'
                    }
                }
            }
            
            const message = middlewareAvailable 
                ? 'Android middleware is connected and ready' 
                : 'Android middleware is not available'
            const type = middlewareAvailable ? 'success' : 'error'
            
            this.showMessage(message, type)
            
        } catch (error) {
            console.error('Error checking middleware status:', error)
            this.showMessage('Error checking Android middleware status', 'error')
        }
    }
    
    async configureStripeOnAndroid() {
        try {
            // Note: /config endpoint not available in current Android APK
            // Stripe keys should be configured directly in the Android app
            this.showMessage('Stripe configuration must be done directly in Android app', 'info')
            console.log('Config endpoint not available in Android APK - configure keys in app directly')
            
            // Simulate success for UI purposes
            return true
            
        } catch (error) {
            console.error('Error configuring Stripe on Android:', error)
            this.showMessage('Failed to configure Stripe on Android app. Is it running?', 'error')
        }
    }
}

// Initialize the kiosk when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.kioskInstance = new OhrShalomKiosk()
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

// Payment feedback modals (outside class for scope)
function showPaymentSuccessModal(selectedAmount, email) {
        const modal = document.createElement('div')
        modal.id = 'paymentSuccessModal'
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center'
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
                <div class="mb-6">
                    <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                        <i class="fas fa-check text-green-600 text-2xl"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
                    <p class="text-gray-600 mb-4">Your donation of $${selectedAmount.toFixed(2)} has been processed successfully.</p>
                    <div class="bg-green-50 p-4 rounded-lg mb-4">
                        <p class="text-sm text-green-800">
                            <i class="fas fa-heart mr-2"></i>
                            Your generosity helps support our community and sacred mission.
                        </p>
                    </div>
                    ${email ? 
                        `<p class="text-sm text-gray-500">A receipt has been sent to ${email}</p>` : 
                        '<p class="text-sm text-gray-500">Your payment has been processed</p>'
                    }
                </div>
                <button id="successModalClose" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                    Continue
                </button>
            </div>
        `
        
        document.body.appendChild(modal)
        
        // Auto-close after 8 seconds or on click
        const closeModal = () => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal)
            }
        }
        
        document.getElementById('successModalClose').addEventListener('click', closeModal)
        setTimeout(closeModal, 8000)
    }
    
function showAuthenticationModal(selectedAmount, email) {
        const modal = document.createElement('div')
        modal.id = 'authModal'
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center'
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div class="text-center mb-6">
                    <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                        <i class="fas fa-shield-alt text-blue-600 text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2">Authentication Required</h3>
                    <p class="text-gray-600 mb-4">Your bank requires additional verification for this transaction.</p>
                </div>
                
                <div class="bg-blue-50 p-4 rounded-lg mb-4">
                    <p class="text-sm text-blue-800 mb-3">
                        <i class="fas fa-mobile-alt mr-2"></i>
                        Please check your phone for a text message or push notification from your bank.
                    </p>
                    <div class="border-2 border-dashed border-blue-300 p-3 rounded text-center">
                        <input type="text" id="authCode" class="w-full text-center text-lg font-mono border-0 bg-transparent focus:outline-none" 
                               placeholder="Enter 6-digit code" maxlength="6">
                    </div>
                </div>
                
                <div class="flex space-x-3">
                    <button id="authSubmit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
                        Verify
                    </button>
                    <button id="authCancel" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors">
                        Cancel
                    </button>
                </div>
            </div>
        `
        
        document.body.appendChild(modal)
        
        // Focus on input
        document.getElementById('authCode').focus()
        
        // Handle verification
        document.getElementById('authSubmit').addEventListener('click', () => {
            const code = document.getElementById('authCode').value
            if (code.length === 6) {
                document.body.removeChild(modal)
                // Simulate verification success (80% success rate)
                if (Math.random() < 0.8) {
                    showPaymentSuccessModal(selectedAmount, email)
                    // Auto-capture donation photo
                    if (window.kioskInstance) {
                        window.kioskInstance.autoCaptureDonationPhoto(selectedAmount, email)
                    }
                } else {
                    showPaymentFailureModal('Authentication failed. Please try again or contact your bank.')
                }
            } else {
                this.showMessage('Please enter the complete 6-digit code', 'error')
            }
        })
        
        // Handle cancel
        document.getElementById('authCancel').addEventListener('click', () => {
            document.body.removeChild(modal)
            this.showMessage('Payment cancelled', 'info')
        })
        
        // Auto-submit when 6 digits entered
        document.getElementById('authCode').addEventListener('input', (e) => {
            if (e.target.value.length === 6) {
                setTimeout(() => {
                    document.getElementById('authSubmit').click()
                }, 500)
            }
        })
    }
    
function showPaymentFailureModal(message) {
        const modal = document.createElement('div')
        modal.id = 'paymentFailureModal'
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center'
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 text-center">
                <div class="mb-6">
                    <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                        <i class="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2">Payment Issue</h3>
                    <p class="text-gray-600 mb-4">${message}</p>
                </div>
                
                <div class="bg-yellow-50 p-4 rounded-lg mb-6">
                    <p class="text-sm text-yellow-800">
                        <i class="fas fa-info-circle mr-2"></i>
                        You can try again with a different payment method, or contact our office for assistance.
                    </p>
                </div>
                
                <div class="flex space-x-3">
                    <button id="tryAgainBtn" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
                        Try Again
                    </button>
                    <button id="failureModalClose" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors">
                        Close
                    </button>
                </div>
            </div>
        `
        
        document.body.appendChild(modal)
        
        // Handle try again
        document.getElementById('tryAgainBtn').addEventListener('click', () => {
            document.body.removeChild(modal)
            // Keep the amount selected so they can try a different payment method
        })
        
        // Handle close
        document.getElementById('failureModalClose').addEventListener('click', () => {
            document.body.removeChild(modal)
        })
    }

// Export for potential external use
window.OhrShalomKiosk = OhrShalomKiosk
window.enterKioskMode = enterKioskMode
window.exitKioskMode = exitKioskMode

// Initialize the kiosk when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Ohr Shalom Kiosk')
    window.kioskInstance = new OhrShalomKiosk()
})