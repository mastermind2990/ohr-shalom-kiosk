package com.ohrshalom.paymentmiddleware

import android.util.Log
import com.stripe.stripeterminal.external.callable.TerminalListener
import com.stripe.stripeterminal.external.models.ConnectionStatus
import com.stripe.stripeterminal.external.models.PaymentStatus
import com.stripe.stripeterminal.external.models.Reader

class TerminalEventListener : TerminalListener {
    
    companion object {
        const val TAG = "TerminalEventListener"
    }

    override fun onConnectionStatusChange(status: ConnectionStatus) {
        Log.d(TAG, "Connection status changed to: $status")
        when (status) {
            ConnectionStatus.CONNECTED -> {
                Log.i(TAG, "Terminal connected successfully")
            }
            ConnectionStatus.CONNECTING -> {
                Log.i(TAG, "Terminal connecting...")
            }
            ConnectionStatus.NOT_CONNECTED -> {
                Log.w(TAG, "Terminal not connected")
            }
        }
    }

    override fun onPaymentStatusChange(status: PaymentStatus) {
        Log.d(TAG, "Payment status changed to: $status")
        when (status) {
            PaymentStatus.NOT_READY -> {
                Log.i(TAG, "Payment not ready")
            }
            PaymentStatus.READY -> {
                Log.i(TAG, "Payment ready")
            }
            PaymentStatus.WAITING_FOR_INPUT -> {
                Log.i(TAG, "Waiting for customer input (tap card)")
            }
            PaymentStatus.PROCESSING -> {
                Log.i(TAG, "Processing payment...")
            }
        }
    }

    override fun onUnexpectedReaderDisconnect(reader: Reader) {
        Log.w(TAG, "Reader unexpectedly disconnected: ${reader.serialNumber}")
        // Handle unexpected disconnection
        // You might want to notify the web kiosk that payments are temporarily unavailable
    }
}