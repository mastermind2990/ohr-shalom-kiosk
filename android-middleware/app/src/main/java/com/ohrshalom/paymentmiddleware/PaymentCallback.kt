package com.ohrshalom.paymentmiddleware

/**
 * Callback interface for payment operations
 */
interface PaymentCallback {
    /**
     * Called when payment is successful
     * @param paymentIntent The successful payment intent ID
     */
    fun onPaymentSuccess(paymentIntent: String)
    
    /**
     * Called when payment fails
     * @param error Error message describing the failure
     */
    fun onPaymentError(error: String)
    
    /**
     * Called when payment is cancelled by user or system
     */
    fun onPaymentCancelled()
}