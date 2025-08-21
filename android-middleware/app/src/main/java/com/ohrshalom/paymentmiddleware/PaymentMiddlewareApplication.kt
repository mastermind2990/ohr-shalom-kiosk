package com.ohrshalom.paymentmiddleware

import android.app.Application
import android.content.Intent
import com.ohrshalom.paymentmiddleware.service.HttpServerService
import com.stripe.android.PaymentConfiguration

/**
 * Application class for Ohr Shalom Payment Middleware
 * Initializes Stripe SDK and starts HTTP server service
 */
class PaymentMiddlewareApplication : Application() {

    companion object {
        lateinit var instance: PaymentMiddlewareApplication
            private set
    }

    override fun onCreate() {
        super.onCreate()
        instance = this
        
        // Initialize Stripe SDK
        initializeStripe()
        
        // Start HTTP server service
        startHttpServerService()
    }

    private fun initializeStripe() {
        // TODO: Replace with your actual Stripe publishable key
        // You can set this via environment variables or secure storage
        val stripePublishableKey = getStripePublishableKey()
        
        if (stripePublishableKey.isNotEmpty()) {
            PaymentConfiguration.init(
                applicationContext = this,
                publishableKey = stripePublishableKey
            )
        }
    }

    private fun getStripePublishableKey(): String {
        // TODO: Implement secure key retrieval
        // Options:
        // 1. Android Keystore
        // 2. Encrypted SharedPreferences
        // 3. Environment variables
        // 4. Remote configuration
        
        // For now, return empty string - will be set via HTTP API
        return ""
    }

    private fun startHttpServerService() {
        val serviceIntent = Intent(this, HttpServerService::class.java)
        startForegroundService(serviceIntent)
    }
}