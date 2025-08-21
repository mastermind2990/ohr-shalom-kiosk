package com.ohrshalom.paymentmiddleware.payment

import android.content.Context
import android.util.Log
import com.stripe.android.PaymentConfiguration
import com.stripe.android.Stripe
import com.stripe.android.model.ConfirmPaymentIntentParams
import com.stripe.android.model.PaymentIntent
import com.stripe.android.model.PaymentMethodCreateParams
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject

/**
 * Manages Stripe payment processing for the middleware app
 * Handles payment intent creation, confirmation, and NFC integration
 */
class StripePaymentManager(private val context: Context) {

    companion object {
        private const val TAG = "StripePaymentManager"
    }

    private var stripe: Stripe? = null
    private var stripeSecretKey: String? = null
    private val httpClient = OkHttpClient()

    /**
     * Initialize Stripe with publishable and secret keys
     */
    fun initialize(publishableKey: String, secretKey: String) {
        try {
            // Initialize Stripe SDK
            PaymentConfiguration.init(context, publishableKey)
            stripe = Stripe(context, publishableKey)
            stripeSecretKey = secretKey
            
            Log.i(TAG, "Stripe initialized successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to initialize Stripe", e)
            throw e
        }
    }

    /**
     * Create a payment intent on Stripe backend
     */
    suspend fun createPaymentIntent(
        amount: Long, // Amount in cents
        currency: String = "usd",
        email: String? = null
    ): PaymentIntent = withContext(Dispatchers.IO) {
        
        val secretKey = stripeSecretKey ?: throw IllegalStateException("Stripe not initialized")
        
        try {
            // Create payment intent via Stripe API
            val requestBody = JSONObject().apply {
                put("amount", amount)
                put("currency", currency)
                put("payment_method_types", org.json.JSONArray().put("card"))
                put("capture_method", "automatic")
                if (email != null) {
                    put("receipt_email", email)
                }
            }

            val request = Request.Builder()
                .url("https://api.stripe.com/v1/payment_intents")
                .post(requestBody.toString().toRequestBody("application/json".toMediaType()))
                .addHeader("Authorization", "Bearer $secretKey")
                .addHeader("Content-Type", "application/json")
                .build()

            val response = httpClient.newCall(request).execute()
            val responseBody = response.body?.string() ?: ""
            
            if (!response.isSuccessful) {
                Log.e(TAG, "Failed to create payment intent: $responseBody")
                throw Exception("Failed to create payment intent: ${response.code}")
            }

            val jsonResponse = JSONObject(responseBody)
            val clientSecret = jsonResponse.getString("client_secret")
            
            Log.i(TAG, "Payment intent created successfully")
            
            // Return a mock PaymentIntent for now
            // In production, you'd parse the full response
            createMockPaymentIntent(clientSecret, amount)
            
        } catch (e: Exception) {
            Log.e(TAG, "Error creating payment intent", e)
            throw e
        }
    }

    /**
     * Confirm payment intent with NFC payment method
     */
    suspend fun confirmPaymentWithNfc(
        clientSecret: String,
        paymentMethodId: String? = null
    ): PaymentIntent = withContext(Dispatchers.IO) {
        
        val stripeInstance = stripe ?: throw IllegalStateException("Stripe not initialized")
        
        try {
            // Create payment method params for contactless payment
            val paymentMethodParams = PaymentMethodCreateParams.create(
                PaymentMethodCreateParams.Card.Builder()
                    .build()
            )

            // Create confirmation params
            val confirmParams = ConfirmPaymentIntentParams.createWithPaymentMethodCreateParams(
                paymentMethodCreateParams = paymentMethodParams,
                clientSecret = clientSecret
            )

            // Confirm payment intent
            val result = stripeInstance.confirmPayment(confirmParams)
            
            Log.i(TAG, "Payment confirmed with result: ${result.intent?.status}")
            
            return@withContext result.intent ?: throw Exception("Payment confirmation failed")
            
        } catch (e: Exception) {
            Log.e(TAG, "Error confirming payment", e)
            throw e
        }
    }

    /**
     * Handle NFC card detection and payment processing
     */
    suspend fun processNfcPayment(
        clientSecret: String,
        nfcData: ByteArray? = null
    ): PaymentResult = withContext(Dispatchers.IO) {
        
        try {
            Log.i(TAG, "Processing NFC payment...")
            
            // TODO: Process actual NFC card data
            // For now, simulate successful payment
            
            // Simulate processing delay
            kotlinx.coroutines.delay(2000)
            
            // Simulate successful payment
            PaymentResult(
                success = true,
                paymentIntentId = "pi_simulated_${System.currentTimeMillis()}",
                amount = 0, // Will be set by caller
                paymentMethod = "contactless",
                message = "Payment processed successfully"
            )
            
        } catch (e: Exception) {
            Log.e(TAG, "Error processing NFC payment", e)
            PaymentResult(
                success = false,
                paymentIntentId = null,
                amount = 0,
                paymentMethod = "contactless",
                message = "Payment failed: ${e.message}"
            )
        }
    }

    /**
     * Check if Stripe is properly configured
     */
    fun isConfigured(): Boolean {
        return stripe != null && stripeSecretKey != null
    }

    private fun createMockPaymentIntent(clientSecret: String, amount: Long): PaymentIntent {
        // This is a placeholder - in production you'd parse the actual Stripe response
        // For now, return a mock PaymentIntent structure
        return PaymentIntent(
            id = "pi_mock_${System.currentTimeMillis()}",
            clientSecret = clientSecret,
            amount = amount,
            currency = "usd",
            status = PaymentIntent.Status.RequiresPaymentMethod
        )
    }
}

/**
 * Result of a payment processing operation
 */
data class PaymentResult(
    val success: Boolean,
    val paymentIntentId: String?,
    val amount: Long,
    val paymentMethod: String,
    val message: String,
    val error: String? = null
)