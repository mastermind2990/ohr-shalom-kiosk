package com.ohrshalom.paymentmiddleware.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import com.ohrshalom.paymentmiddleware.MainActivity
import com.ohrshalom.paymentmiddleware.R
import fi.iki.elonen.NanoHTTPD
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import java.io.IOException

/**
 * Foreground service that runs HTTP server for web-to-Android communication
 */
class HttpServerService : Service() {

    companion object {
        const val SERVER_PORT = 8080
        const val NOTIFICATION_ID = 1001
        const val CHANNEL_ID = "payment_middleware_channel"
        
        var isRunning = false
            private set
    }

    private var httpServer: PaymentHttpServer? = null
    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        startHttpServer()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startForeground(NOTIFICATION_ID, createNotification())
        return START_STICKY // Restart service if killed
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        stopHttpServer()
        serviceScope.cancel()
        isRunning = false
    }

    private fun startHttpServer() {
        try {
            httpServer = PaymentHttpServer(SERVER_PORT)
            httpServer?.start()
            isRunning = true
            Log.i("HttpServerService", "HTTP Server started on port $SERVER_PORT")
        } catch (e: IOException) {
            Log.e("HttpServerService", "Failed to start HTTP server", e)
            isRunning = false
        }
    }

    private fun stopHttpServer() {
        httpServer?.stop()
        httpServer = null
        isRunning = false
        Log.i("HttpServerService", "HTTP Server stopped")
    }

    private fun createNotificationChannel() {
        val channel = NotificationChannel(
            CHANNEL_ID,
            "Payment Middleware Service",
            NotificationManager.IMPORTANCE_LOW
        ).apply {
            description = "Handles payment requests from web kiosk"
            setShowBadge(false)
        }

        val notificationManager = getSystemService(NotificationManager::class.java)
        notificationManager.createNotificationChannel(channel)
    }

    private fun createNotification(): Notification {
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Payment Middleware Active")
            .setContentText("HTTP Server running on port $SERVER_PORT")
            .setSmallIcon(R.drawable.ic_payment)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setAutoCancel(false)
            .build()
    }
}

/**
 * NanoHTTPD-based HTTP server for handling web kiosk requests
 */
class PaymentHttpServer(port: Int) : NanoHTTPD(port) {

    override fun serve(session: IHTTPSession): Response {
        val uri = session.uri
        val method = session.method
        
        Log.d("PaymentHttpServer", "Request: $method $uri")

        // Add CORS headers for web kiosk communication
        val response = when {
            uri == "/status" && method == Method.GET -> handleStatus()
            uri == "/payment/create" && method == Method.POST -> handleCreatePayment(session)
            uri == "/payment/confirm" && method == Method.POST -> handleConfirmPayment(session)
            uri.startsWith("/payment/status") && method == Method.GET -> handlePaymentStatus(session)
            uri == "/config" && method == Method.POST -> handleConfig(session)
            else -> newFixedLengthResponse(Response.Status.NOT_FOUND, MIME_PLAINTEXT, "Not found")
        }

        // Add CORS headers
        response.addHeader("Access-Control-Allow-Origin", "*")
        response.addHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        response.addHeader("Access-Control-Allow-Headers", "Content-Type")

        return response
    }

    private fun handleStatus(): Response {
        val status = mapOf(
            "status" to "running",
            "port" to SERVER_PORT,
            "nfc_available" to true, // TODO: Check actual NFC status
            "stripe_configured" to true // TODO: Check actual Stripe status
        )
        
        return newFixedLengthResponse(
            Response.Status.OK,
            "application/json",
            com.google.gson.Gson().toJson(status)
        )
    }

    private fun handleCreatePayment(session: IHTTPSession): Response {
        // TODO: Implement payment intent creation
        val response = mapOf(
            "client_secret" to "pi_test_123_secret_456",
            "status" to "requires_payment_method"
        )
        
        return newFixedLengthResponse(
            Response.Status.OK,
            "application/json",
            com.google.gson.Gson().toJson(response)
        )
    }

    private fun handleConfirmPayment(session: IHTTPSession): Response {
        // TODO: Implement payment confirmation with NFC
        val response = mapOf(
            "status" to "succeeded",
            "payment_method" to "card_tap"
        )
        
        return newFixedLengthResponse(
            Response.Status.OK,
            "application/json",
            com.google.gson.Gson().toJson(response)
        )
    }

    private fun handlePaymentStatus(session: IHTTPSession): Response {
        // Extract payment intent ID from query parameter
        val uri = session.uri
        val queryParams = session.parms
        val paymentId = queryParams["id"] ?: "unknown"
        
        // TODO: Implement actual payment status checking
        // For now, simulate different statuses for demo
        val response = mapOf(
            "payment_intent_id" to paymentId,
            "status" to "succeeded", // or "processing", "failed"
            "message" to "Payment completed successfully"
        )
        
        return newFixedLengthResponse(
            Response.Status.OK,
            "application/json",
            com.google.gson.Gson().toJson(response)
        )
    }
    
    private fun handleConfig(session: IHTTPSession): Response {
        // TODO: Handle Stripe key configuration
        val response = mapOf(
            "status" to "configured"
        )
        
        return newFixedLengthResponse(
            Response.Status.OK,
            "application/json",
            com.google.gson.Gson().toJson(response)
        )
    }
}