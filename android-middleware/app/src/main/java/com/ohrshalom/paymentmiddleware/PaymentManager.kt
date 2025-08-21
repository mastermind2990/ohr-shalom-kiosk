package com.ohrshalom.paymentmiddleware

import android.util.Log
import com.stripe.stripeterminal.Terminal
import com.stripe.stripeterminal.external.callable.*
import com.stripe.stripeterminal.external.models.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException

object PaymentManager {
    
    private const val TAG = "PaymentManager"
    private var currentCallback: PaymentCallback? = null
    private var currentCollectPaymentMethodCancelable: Cancelable? = null
    private var currentProcessPaymentCancelable: Cancelable? = null
    
    // TODO: Replace with your actual backend endpoint
    private const val BACKEND_URL = "https://your-cloudflare-worker.pages.dev/api/stripe"

    fun isTerminalConnected(): Boolean {
        return Terminal.getInstance().connectedReader != null
    }

    fun initiatePayment(amount: Long, currency: String = "usd", email: String?, callback: PaymentCallback) {
        Log.d(TAG, "Initiating payment for amount: $amount cents")
        currentCallback = callback
        
        // First ensure we have a connected reader
        if (!isTerminalConnected()) {
            Log.i(TAG, "No reader connected, attempting to discover and connect...")
            discoverAndConnectReader { success ->
                if (success) {
                    createPaymentIntent(amount, currency, email)
                } else {
                    callback.onPaymentError("Failed to connect to card reader")
                }
            }
        } else {
            Log.i(TAG, "Reader already connected, proceeding with payment...")
            createPaymentIntent(amount, currency, email)
        }
    }

    fun cancelPayment() {
        Log.d(TAG, "Cancelling current payment...")
        currentCollectPaymentMethodCancelable?.cancel(object : Callback {
            override fun onSuccess() {
                Log.i(TAG, "Payment collection cancelled successfully")
                currentCallback?.onPaymentCancelled()
            }
            override fun onFailure(e: TerminalException) {
                Log.e(TAG, "Failed to cancel payment collection", e)
            }
        })
        currentProcessPaymentCancelable?.cancel(object : Callback {
            override fun onSuccess() {
                Log.i(TAG, "Payment processing cancelled successfully")
            }
            override fun onFailure(e: TerminalException) {
                Log.e(TAG, "Failed to cancel payment processing", e)
            }
        })
    }

    private fun discoverAndConnectReader(callback: (Boolean) -> Unit) {
        Log.d(TAG, "Discovering readers...")
        
        val config = DiscoveryConfiguration.TapToPay.Builder()
            .setSimulated(false) // Set to true for testing without hardware
            .build()

        Terminal.getInstance().discoverReaders(
            config,
            object : DiscoveryListener {
                override fun onUpdateDiscoveredReaders(readers: List<Reader>) {
                    Log.d(TAG, "Discovered ${readers.size} readers")
                    if (readers.isNotEmpty()) {
                        val reader = readers.first()
                        Log.i(TAG, "Connecting to reader: ${reader.serialNumber}")
                        connectToReader(reader, callback)
                    } else {
                        Log.w(TAG, "No readers discovered")
                        callback(false)
                    }
                }
            },
            object : Callback {
                override fun onSuccess() {
                    Log.d(TAG, "Reader discovery completed successfully")
                }

                override fun onFailure(e: TerminalException) {
                    Log.e(TAG, "Reader discovery failed", e)
                    callback(false)
                }
            }
        )
    }

    private fun connectToReader(reader: Reader, callback: (Boolean) -> Unit) {
        Terminal.getInstance().connectTapToPayReader(
            reader,
            object : ReaderCallback {
                override fun onSuccess(connectedReader: Reader) {
                    Log.i(TAG, "Successfully connected to reader: ${connectedReader.serialNumber}")
                    callback(true)
                }

                override fun onFailure(e: TerminalException) {
                    Log.e(TAG, "Failed to connect to reader", e)
                    callback(false)
                }
            }
        )
    }

    private fun createPaymentIntent(amount: Long, currency: String, email: String?) {
        Log.d(TAG, "Creating payment intent for $amount cents")
        
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val client = OkHttpClient()
                val requestBody = mapOf(
                    "amount" to amount,
                    "currency" to currency,
                    "email" to email,
                    "automatic_payment_methods" to mapOf("enabled" to true)
                )
                
                val json = com.google.gson.Gson().toJson(requestBody)
                val body = json.toRequestBody("application/json".toMediaType())
                
                val request = Request.Builder()
                    .url("$BACKEND_URL/payment-intents")
                    .post(body)
                    .addHeader("Content-Type", "application/json")
                    .build()

                client.newCall(request).enqueue(object : okhttp3.Callback {
                    override fun onFailure(call: Call, e: IOException) {
                        Log.e(TAG, "Failed to create payment intent", e)
                        currentCallback?.onPaymentError("Network error: ${e.message}")
                    }

                    override fun onResponse(call: Call, response: Response) {
                        if (response.isSuccessful) {
                            val responseBody = response.body?.string()
                            Log.d(TAG, "Payment intent created: $responseBody")
                            
                            try {
                                val gson = com.google.gson.Gson()
                                val jsonResponse = gson.fromJson(responseBody, Map::class.java)
                                val clientSecret = jsonResponse["client_secret"] as? String
                                
                                if (clientSecret != null) {
                                    collectPaymentMethod(clientSecret)
                                } else {
                                    currentCallback?.onPaymentError("Invalid response from server")
                                }
                            } catch (e: Exception) {
                                Log.e(TAG, "Failed to parse payment intent response", e)
                                currentCallback?.onPaymentError("Failed to parse server response")
                            }
                        } else {
                            Log.e(TAG, "Server returned error: ${response.code}")
                            currentCallback?.onPaymentError("Server error: ${response.code}")
                        }
                    }
                })
            } catch (e: Exception) {
                Log.e(TAG, "Exception creating payment intent", e)
                currentCallback?.onPaymentError("Failed to create payment intent: ${e.message}")
            }
        }
    }

    private fun collectPaymentMethod(clientSecret: String) {
        Log.d(TAG, "Collecting payment method...")
        
        val paymentIntent = PaymentIntent.Builder()
            .setAmount(0) // Amount is already set in the payment intent
            .setCurrency("usd")
            .build()

        val collectConfig = CollectConfiguration.Builder()
            .setSkipTipping(true)
            .setUpdatePaymentIntent(true)
            .build()

        currentCollectPaymentMethodCancelable = Terminal.getInstance().collectPaymentMethod(
            paymentIntent,
            object : PaymentIntentCallback {
                override fun onSuccess(paymentIntent: PaymentIntent) {
                    Log.i(TAG, "Payment method collected successfully")
                    processPayment(paymentIntent)
                }

                override fun onFailure(e: TerminalException) {
                    Log.e(TAG, "Failed to collect payment method", e)
                    currentCallback?.onPaymentError("Payment collection failed: ${e.errorMessage}")
                }
            },
            collectConfig
        )
    }

    private fun processPayment(paymentIntent: PaymentIntent) {
        Log.d(TAG, "Processing payment...")
        
        currentProcessPaymentCancelable = Terminal.getInstance().processPayment(
            paymentIntent,
            object : PaymentIntentCallback {
                override fun onSuccess(processedPaymentIntent: PaymentIntent) {
                    Log.i(TAG, "Payment processed successfully: ${processedPaymentIntent.id}")
                    currentCallback?.onPaymentSuccess(processedPaymentIntent.id ?: "unknown")
                }

                override fun onFailure(e: TerminalException) {
                    Log.e(TAG, "Payment processing failed", e)
                    currentCallback?.onPaymentError("Payment processing failed: ${e.errorMessage}")
                }
            }
        )
    }
}