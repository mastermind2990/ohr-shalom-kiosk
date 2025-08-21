package com.ohrshalom.paymentmiddleware

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.gson.Gson
import com.google.gson.JsonObject
import fi.iki.elonen.NanoHTTPD
import fi.iki.elonen.NanoHTTPD.Response.Status
import java.io.IOException

class HttpServerService : Service() {
    
    companion object {
        const val TAG = "HttpServerService"
        const val PORT = 8080
        const val CHANNEL_ID = "PaymentMiddlewareChannel"
        const val NOTIFICATION_ID = 1
    }

    private var httpServer: PaymentHttpServer? = null
    private val gson = Gson()

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        startForeground(NOTIFICATION_ID, createNotification())
        startHttpServer()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        return START_STICKY // Restart if killed
    }

    override fun onDestroy() {
        super.onDestroy()
        stopHttpServer()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun startHttpServer() {
        try {
            httpServer = PaymentHttpServer(PORT)
            httpServer?.start()
            Log.i(TAG, "HTTP Server started on port $PORT")
        } catch (e: IOException) {
            Log.e(TAG, "Failed to start HTTP server", e)
        }
    }

    private fun stopHttpServer() {
        httpServer?.stop()
        Log.i(TAG, "HTTP Server stopped")
    }

    private fun createNotificationChannel() {
        val channel = NotificationChannel(
            CHANNEL_ID,
            "Payment Middleware Service",
            NotificationManager.IMPORTANCE_LOW
        )
        val manager = getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(channel)
    }

    private fun createNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Ohr Shalom Payment Service")
            .setContentText("Ready to accept donations")
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .build()
    }

    inner class PaymentHttpServer(port: Int) : NanoHTTPD(port) {

        override fun serve(session: IHTTPSession): Response {
            val uri = session.uri
            val method = session.method
            
            Log.d(TAG, "Request: $method $uri")

            // Enable CORS for web kiosk communication
            val response = when {
                method == Method.OPTIONS -> handleCorsPreFlight()
                uri == "/status" && method == Method.GET -> handleStatus()
                uri == "/initiate-payment" && method == Method.POST -> handleInitiatePayment(session)
                uri == "/cancel-payment" && method == Method.POST -> handleCancelPayment(session)
                else -> newFixedLengthResponse(Status.NOT_FOUND, MIME_JSON, 
                    gson.toJson(mapOf("error" to "Endpoint not found")))
            }

            // Add CORS headers
            response.addHeader("Access-Control-Allow-Origin", "*")
            response.addHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            response.addHeader("Access-Control-Allow-Headers", "Content-Type")
            
            return response
        }

        private fun handleCorsPreFlight(): Response {
            return newFixedLengthResponse(Status.OK, MIME_JSON, "{}")
        }

        private fun handleStatus(): Response {
            val status = mapOf(
                "status" to "ready",
                "service" to "payment-middleware",
                "version" to "1.0",
                "terminal_connected" to PaymentManager.isTerminalConnected(),
                "timestamp" to System.currentTimeMillis()
            )
            return newFixedLengthResponse(Status.OK, MIME_JSON, gson.toJson(status))
        }

        private fun handleInitiatePayment(session: IHTTPSession): Response {
            try {
                // Parse request body
                val files = HashMap<String, String>()
                session.parseBody(files)
                val requestBody = files["postData"] ?: "{}"
                val requestJson = gson.fromJson(requestBody, JsonObject::class.java)
                
                val amount = requestJson.get("amount")?.asLong ?: return errorResponse("Amount is required")
                val currency = requestJson.get("currency")?.asString ?: "usd"
                val email = requestJson.get("email")?.asString
                
                Log.i(TAG, "Initiating payment: amount=$amount, currency=$currency, email=$email")
                
                // Start payment process
                PaymentManager.initiatePayment(
                    amount = amount,
                    currency = currency,
                    email = email,
                    callback = object : PaymentCallback {
                        override fun onPaymentSuccess(paymentIntent: String) {
                            Log.i(TAG, "Payment successful: $paymentIntent")
                        }
                        
                        override fun onPaymentError(error: String) {
                            Log.e(TAG, "Payment failed: $error")
                        }
                        
                        override fun onPaymentCancelled() {
                            Log.i(TAG, "Payment cancelled")
                        }
                    }
                )
                
                val response = mapOf(
                    "status" to "initiated",
                    "message" to "Please tap your card or device",
                    "amount" to amount,
                    "currency" to currency
                )
                
                return newFixedLengthResponse(Status.OK, MIME_JSON, gson.toJson(response))
                
            } catch (e: Exception) {
                Log.e(TAG, "Error initiating payment", e)
                return errorResponse("Failed to initiate payment: ${e.message}")
            }
        }

        private fun handleCancelPayment(session: IHTTPSession): Response {
            try {
                PaymentManager.cancelPayment()
                val response = mapOf("status" to "cancelled")
                return newFixedLengthResponse(Status.OK, MIME_JSON, gson.toJson(response))
            } catch (e: Exception) {
                Log.e(TAG, "Error cancelling payment", e)
                return errorResponse("Failed to cancel payment: ${e.message}")
            }
        }

        private fun errorResponse(message: String): Response {
            val error = mapOf("error" to message)
            return newFixedLengthResponse(Status.BAD_REQUEST, MIME_JSON, gson.toJson(error))
        }

        companion object {
            const val MIME_JSON = "application/json"
        }
    }
}