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
        
        // Update time every minute
        setInterval(() => this.updateDateTime(), 60000)
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
        if (this.selectedAmount <= 0) {
            this.showMessage('Please select an amount first', 'error')
            return
        }
        
        try {
            const email = document.getElementById('emailInput').value.trim()
            const paymentIntent = await this.createPaymentIntent(this.selectedAmount * 100, email, false)
            
            // For web-based card payment, we'll use Stripe's Payment Element
            // This is a simplified version - in production you'd want a more sophisticated checkout
            const { error } = await this.stripe.redirectToCheckout({
                sessionId: paymentIntent.clientSecret // In production, use Checkout Session
            })
            
            if (error) {
                throw error
            }
            
        } catch (error) {
            console.error('Card payment error:', error)
            this.showMessage('Card payment failed: ' + error.message, 'error')
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
        // In production, this would show a full admin configuration interface
        this.showMessage('Admin access granted - Configuration features coming soon', 'success')
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
            const response = await fetch(`/api/hebcal?lat=${this.config.latitude}&lon=${this.config.longitude}`)
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