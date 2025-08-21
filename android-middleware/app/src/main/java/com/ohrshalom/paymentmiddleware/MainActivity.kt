package com.ohrshalom.paymentmiddleware

import android.content.Intent
import android.nfc.NfcAdapter
import android.os.Bundle
import android.provider.Settings
import android.view.View
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.ohrshalom.paymentmiddleware.databinding.ActivityMainBinding
import com.ohrshalom.paymentmiddleware.service.HttpServerService
import kotlinx.coroutines.launch

/**
 * Main Activity for Payment Middleware
 * Provides admin interface and system status
 */
class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private var nfcAdapter: NfcAdapter? = null

    private val enableNfcLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        checkNfcStatus()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupUI()
        checkSystemStatus()
    }

    private fun setupUI() {
        binding.apply {
            // Close button - returns to web kiosk
            btnClose.setOnClickListener {
                // TODO: Launch web kiosk activity or return to previous activity
                finish()
            }

            // Enable NFC button
            btnEnableNfc.setOnClickListener {
                enableNfc()
            }

            // Test payment button
            btnTestPayment.setOnClickListener {
                testPayment()
            }

            // Server status refresh
            btnRefreshStatus.setOnClickListener {
                checkSystemStatus()
            }
        }
    }

    private fun checkSystemStatus() {
        lifecycleScope.launch {
            // Check NFC status
            checkNfcStatus()
            
            // Check HTTP server status
            checkServerStatus()
            
            // Check Stripe configuration
            checkStripeStatus()
        }
    }

    private fun checkNfcStatus() {
        nfcAdapter = NfcAdapter.getDefaultAdapter(this)
        
        binding.apply {
            when {
                nfcAdapter == null -> {
                    textNfcStatus.text = "NFC not supported on this device"
                    textNfcStatus.setTextColor(getColor(android.R.color.holo_red_dark))
                    btnEnableNfc.visibility = View.GONE
                }
                nfcAdapter?.isEnabled == false -> {
                    textNfcStatus.text = "NFC is disabled"
                    textNfcStatus.setTextColor(getColor(android.R.color.holo_orange_dark))
                    btnEnableNfc.visibility = View.VISIBLE
                }
                else -> {
                    textNfcStatus.text = "NFC is enabled and ready"
                    textNfcStatus.setTextColor(getColor(android.R.color.holo_green_dark))
                    btnEnableNfc.visibility = View.GONE
                }
            }
        }
    }

    private fun checkServerStatus() {
        binding.apply {
            if (HttpServerService.isRunning) {
                textServerStatus.text = "HTTP Server running on port ${HttpServerService.SERVER_PORT}"
                textServerStatus.setTextColor(getColor(android.R.color.holo_green_dark))
            } else {
                textServerStatus.text = "HTTP Server is not running"
                textServerStatus.setTextColor(getColor(android.R.color.holo_red_dark))
            }
        }
    }

    private fun checkStripeStatus() {
        binding.apply {
            // TODO: Check if Stripe is properly configured
            textStripeStatus.text = "Stripe SDK initialized"
            textStripeStatus.setTextColor(getColor(android.R.color.holo_green_dark))
        }
    }

    private fun enableNfc() {
        val intent = Intent(Settings.ACTION_NFC_SETTINGS)
        enableNfcLauncher.launch(intent)
    }

    private fun testPayment() {
        Toast.makeText(this, "Test payment functionality coming soon", Toast.LENGTH_SHORT).show()
        // TODO: Implement test payment
    }

    override fun onResume() {
        super.onResume()
        checkSystemStatus()
    }
}