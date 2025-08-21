package com.ohrshalom.paymentmiddleware

import android.util.Log
import com.stripe.stripeterminal.external.callable.ConnectionTokenCallback
import com.stripe.stripeterminal.external.callable.ConnectionTokenProvider
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException

class ConnectionTokenProvider : ConnectionTokenProvider {
    
    companion object {
        const val TAG = "ConnectionTokenProvider"
        // TODO: Replace with your actual backend endpoint
        const val BACKEND_URL = "https://your-cloudflare-worker.pages.dev/api/stripe/connection-token"
    }

    override fun fetchConnectionToken(callback: ConnectionTokenCallback) {
        Log.d(TAG, "Fetching connection token from backend...")
        
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val client = OkHttpClient()
                val request = Request.Builder()
                    .url(BACKEND_URL)
                    .post("{}".toRequestBody("application/json".toMediaType()))
                    .addHeader("Content-Type", "application/json")
                    .build()

                client.newCall(request).enqueue(object : Callback {
                    override fun onFailure(call: Call, e: IOException) {
                        Log.e(TAG, "Failed to fetch connection token", e)
                        callback.onFailure(
                            com.stripe.stripeterminal.external.models.ConnectionTokenException(
                                "Failed to fetch connection token: ${e.message}"
                            )
                        )
                    }

                    override fun onResponse(call: Call, response: Response) {
                        if (response.isSuccessful) {
                            val responseBody = response.body?.string()
                            Log.d(TAG, "Connection token response: $responseBody")
                            
                            // Parse the connection token from response
                            // Expected format: {"secret": "pst_test_..."}
                            try {
                                val token = parseConnectionToken(responseBody)
                                callback.onSuccess(token)
                            } catch (e: Exception) {
                                Log.e(TAG, "Failed to parse connection token", e)
                                callback.onFailure(
                                    com.stripe.stripeterminal.external.models.ConnectionTokenException(
                                        "Failed to parse connection token"
                                    )
                                )
                            }
                        } else {
                            Log.e(TAG, "Backend returned error: ${response.code}")
                            callback.onFailure(
                                com.stripe.stripeterminal.external.models.ConnectionTokenException(
                                    "Backend error: ${response.code}"
                                )
                            )
                        }
                    }
                })
            } catch (e: Exception) {
                Log.e(TAG, "Exception while fetching connection token", e)
                callback.onFailure(
                    com.stripe.stripeterminal.external.models.ConnectionTokenException(
                        "Exception: ${e.message}"
                    )
                )
            }
        }
    }

    private fun parseConnectionToken(responseBody: String?): String {
        // Simple JSON parsing - in production you might want to use Gson
        val tokenPattern = "\"secret\"\\s*:\\s*\"([^\"]+)\"".toRegex()
        val matchResult = tokenPattern.find(responseBody ?: "")
        return matchResult?.groupValues?.get(1) 
            ?: throw IllegalArgumentException("No connection token found in response")
    }
}