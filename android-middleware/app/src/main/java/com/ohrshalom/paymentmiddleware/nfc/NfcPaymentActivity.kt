package com.ohrshalom.paymentmiddleware.nfc

import android.app.Activity
import android.content.Intent
import android.nfc.NdefMessage
import android.nfc.NfcAdapter
import android.os.Bundle
import android.util.Log
import androidx.appcompat.app.AppCompatActivity

/**
 * Transparent activity that handles NFC payment intents
 * Processes tap-to-pay interactions and returns results to web kiosk
 */
class NfcPaymentActivity : AppCompatActivity() {

    companion object {
        const val EXTRA_PAYMENT_AMOUNT = "payment_amount"
        const val EXTRA_CLIENT_SECRET = "client_secret"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Make activity transparent and handle NFC intent
        handleNfcIntent(intent)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleNfcIntent(intent)
    }

    private fun handleNfcIntent(intent: Intent) {
        Log.d("NfcPaymentActivity", "Handling NFC intent: ${intent.action}")

        when (intent.action) {
            NfcAdapter.ACTION_NDEF_DISCOVERED -> {
                processNfcPayment(intent)
            }
            else -> {
                Log.w("NfcPaymentActivity", "Unknown NFC action: ${intent.action}")
                finish()
            }
        }
    }

    private fun processNfcPayment(intent: Intent) {
        try {
            // Extract NFC data
            val rawMessages = intent.getParcelableArrayExtra(NfcAdapter.EXTRA_NDEF_MESSAGES)
            val ndefMessages = rawMessages?.map { it as NdefMessage }

            Log.d("NfcPaymentActivity", "Processing NFC payment with ${ndefMessages?.size} messages")

            // TODO: Implement actual Stripe payment processing
            // For now, simulate successful payment
            simulatePaymentProcessing()

        } catch (e: Exception) {
            Log.e("NfcPaymentActivity", "Error processing NFC payment", e)
            setResult(Activity.RESULT_CANCELED)
            finish()
        }
    }

    private fun simulatePaymentProcessing() {
        // TODO: Replace with actual Stripe payment confirmation
        // This should:
        // 1. Use the client_secret from intent extras
        // 2. Confirm payment with Stripe SDK
        // 3. Handle payment result (success/failure)
        // 4. Return result to calling activity/web kiosk

        Log.i("NfcPaymentActivity", "Simulating payment processing...")

        // Simulate processing delay
        android.os.Handler(mainLooper).postDelayed({
            // Return success result
            val resultIntent = Intent().apply {
                putExtra("payment_status", "succeeded")
                putExtra("payment_method", "contactless")
            }

            setResult(Activity.RESULT_OK, resultIntent)
            finish()
        }, 2000) // 2 second delay to simulate processing
    }
}