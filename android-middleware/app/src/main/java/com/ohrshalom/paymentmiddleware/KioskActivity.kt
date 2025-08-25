package com.ohrshalom.paymentmiddleware

import android.annotation.SuppressLint
import android.app.Activity
import android.app.ActivityManager
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.PowerManager
import android.view.*
import android.webkit.*
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.ohrshalom.paymentmiddleware.service.HttpServerService
import java.util.*

/**
 * Kiosk Activity - Provides true Android kiosk mode functionality
 * - Complete system lockdown
 * - Full screen web view
 * - Disabled hardware buttons
 * - Wake lock (no sleep)
 * - Admin exit mechanism
 */
class KioskActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private var wakeLock: PowerManager.WakeLock? = null
    private var isKioskMode = false
    private var adminTapCount = 0
    private var lastAdminTapTime = 0L
    private val adminTapHandler = Handler(Looper.getMainLooper())
    private val adminTapRunnable = Runnable { adminTapCount = 0 }
    
    companion object {
        const val KIOSK_URL = "https://ohr-shalom-kiosk.pages.dev"
        const val ADMIN_TAP_SEQUENCE = 7 // Number of taps needed
        const val ADMIN_TAP_TIMEOUT = 2000L // 2 seconds between taps
        const val TAG = "KioskActivity"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Start HTTP server service if not running
        startHttpServerService()
        
        // Enable kiosk mode
        enableKioskMode()
        
        // Setup WebView
        setupWebView()
        
        // Acquire wake lock to prevent sleep
        acquireWakeLock()
        
        isKioskMode = true
    }

    private fun startHttpServerService() {
        val serviceIntent = Intent(this, HttpServerService::class.java)
        startForegroundService(serviceIntent)
    }

    private fun enableKioskMode() {
        // Hide system UI completely
        hideSystemUI()
        
        // Set as home activity (launcher replacement)
        setTaskDescription(ActivityManager.TaskDescription("Ohr Shalom Kiosk"))
        
        // Prevent status bar expansion
        window.addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        window.addFlags(WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD)
        window.addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED)
        
        // Set window to cover everything
        window.decorView.setOnSystemUiVisibilityChangeListener { visibility ->
            if (visibility and View.SYSTEM_UI_FLAG_FULLSCREEN == 0) {
                hideSystemUI()
            }
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        webView = WebView(this)
        
        // Configure WebView settings for kiosk
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            setAppCacheEnabled(true)
            cacheMode = WebSettings.LOAD_DEFAULT
            
            // Prevent zoom and selection
            setSupportZoom(false)
            builtInZoomControls = false
            displayZoomControls = false
            
            // Security settings
            allowFileAccess = false
            allowContentAccess = false
            allowFileAccessFromFileURLs = false
            allowUniversalAccessFromFileURLs = false
            
            // Media settings
            mediaPlaybackRequiresUserGesture = false
        }

        // WebView client to handle navigation
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                // Only allow navigation within the kiosk domain
                val url = request?.url?.toString() ?: return false
                return if (url.startsWith("https://ohr-shalom-kiosk.pages.dev") || 
                          url.startsWith("http://localhost")) {
                    false // Allow navigation
                } else {
                    true // Block external navigation
                }
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                // Ensure UI stays hidden after page loads
                hideSystemUI()
            }
        }

        // Chrome client for handling alerts, etc.
        webView.webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                android.util.Log.d(TAG, "WebView Console: ${consoleMessage?.message()}")
                return true
            }
        }

        // Block context menu (long press)
        webView.setOnLongClickListener { true }
        
        // Add admin exit tap detection
        webView.setOnTouchListener { _, event ->
            if (event.action == MotionEvent.ACTION_DOWN) {
                handleAdminTap(event.x, event.y)
            }
            false
        }

        // Load the kiosk URL
        webView.loadUrl(KIOSK_URL)
        
        // Set WebView as content view
        setContentView(webView)
    }

    private fun handleAdminTap(x: Float, y: Float) {
        val currentTime = System.currentTimeMillis()
        
        // Check if tap is in the top-left corner (admin area)
        val isAdminArea = x < 200 && y < 200
        
        if (isAdminArea) {
            if (currentTime - lastAdminTapTime < ADMIN_TAP_TIMEOUT) {
                adminTapCount++
                adminTapHandler.removeCallbacks(adminTapRunnable)
                adminTapHandler.postDelayed(adminTapRunnable, ADMIN_TAP_TIMEOUT)
                
                if (adminTapCount >= ADMIN_TAP_SEQUENCE) {
                    showAdminExitDialog()
                    adminTapCount = 0
                }
            } else {
                adminTapCount = 1
                adminTapHandler.postDelayed(adminTapRunnable, ADMIN_TAP_TIMEOUT)
            }
            lastAdminTapTime = currentTime
        }
    }

    private fun showAdminExitDialog() {
        // Simple toast for admin feedback
        Toast.makeText(this, "Admin access detected - Tap ${ADMIN_TAP_SEQUENCE} times again in top-left to exit kiosk", Toast.LENGTH_LONG).show()
        
        // If they tap the sequence again, exit kiosk mode
        adminTapHandler.postDelayed({
            if (adminTapCount >= ADMIN_TAP_SEQUENCE) {
                exitKioskMode()
            }
        }, 3000)
    }

    private fun exitKioskMode() {
        Toast.makeText(this, "Exiting kiosk mode...", Toast.LENGTH_SHORT).show()
        isKioskMode = false
        
        // Show system UI
        showSystemUI()
        
        // Launch admin activity
        val intent = Intent(this, MainActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        startActivity(intent)
        
        // Finish kiosk activity
        finish()
    }

    private fun hideSystemUI() {
        window.decorView.systemUiVisibility = (
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            or View.SYSTEM_UI_FLAG_FULLSCREEN
            or View.SYSTEM_UI_FLAG_LOW_PROFILE
            or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        )
    }

    private fun showSystemUI() {
        window.decorView.systemUiVisibility = (
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
        )
    }

    private fun acquireWakeLock() {
        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(
            PowerManager.SCREEN_BRIGHT_WAKE_LOCK or PowerManager.ACQUIRE_CAUSES_WAKEUP,
            "PaymentMiddleware:KioskWakeLock"
        )
        wakeLock?.acquire(24 * 60 * 60 * 1000L) // 24 hours max
    }

    private fun releaseWakeLock() {
        wakeLock?.let { wl ->
            if (wl.isHeld) {
                wl.release()
            }
        }
        wakeLock = null
    }

    // Block hardware buttons
    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        return when (keyCode) {
            KeyEvent.KEYCODE_BACK,
            KeyEvent.KEYCODE_HOME,
            KeyEvent.KEYCODE_MENU,
            KeyEvent.KEYCODE_SEARCH,
            KeyEvent.KEYCODE_RECENT_APPS,
            KeyEvent.KEYCODE_POWER,
            KeyEvent.KEYCODE_VOLUME_UP,
            KeyEvent.KEYCODE_VOLUME_DOWN,
            KeyEvent.KEYCODE_VOLUME_MUTE -> {
                // Block all hardware buttons in kiosk mode
                if (isKioskMode) {
                    return true // Consume the event
                }
                super.onKeyDown(keyCode, event)
            }
            else -> super.onKeyDown(keyCode, event)
        }
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus && isKioskMode) {
            hideSystemUI()
        }
    }

    override fun onResume() {
        super.onResume()
        if (isKioskMode) {
            hideSystemUI()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        releaseWakeLock()
        adminTapHandler.removeCallbacks(adminTapRunnable)
    }

    // Prevent activity from being finished
    override fun onBackPressed() {
        if (isKioskMode) {
            // Do nothing - block back button
            return
        }
        super.onBackPressed()
    }

    override fun onUserLeaveHint() {
        // Prevent app from going to background in kiosk mode
        if (isKioskMode) {
            val activityManager = getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
            val tasks = activityManager.appTasks
            tasks.forEach { task ->
                task.moveToFront()
            }
        }
    }
}