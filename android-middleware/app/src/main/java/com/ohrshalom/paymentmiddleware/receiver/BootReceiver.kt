package com.ohrshalom.paymentmiddleware.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import com.ohrshalom.paymentmiddleware.service.HttpServerService

/**
 * Boot receiver to start HTTP server service on device boot
 * Ensures the payment middleware is always available
 */
class BootReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        Log.d("BootReceiver", "Received intent: ${intent.action}")
        
        when (intent.action) {
            Intent.ACTION_BOOT_COMPLETED,
            Intent.ACTION_MY_PACKAGE_REPLACED,
            Intent.ACTION_PACKAGE_REPLACED -> {
                Log.i("BootReceiver", "Starting HttpServerService on boot")
                
                val serviceIntent = Intent(context, HttpServerService::class.java)
                context.startForegroundService(serviceIntent)
            }
        }
    }
}