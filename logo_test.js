// Test script to debug logo tap functionality
console.log('=== LOGO TAP TEST STARTING ===');

// Check if kiosk instance exists
if (window.OhrShalomKiosk) {
    console.log('✓ OhrShalomKioskClass found in window');
} else {
    console.log('✗ OhrShalomKiosk class not found in window');
}

// Check if logo container exists
const logoContainer = document.getElementById('logoContainer');
if (logoContainer) {
    console.log('✓ Logo container found');
    console.log('Logo container HTML:', logoContainer.outerHTML.substring(0, 200));
    
    // Check event listeners
    const listeners = getEventListeners ? getEventListeners(logoContainer) : 'DevTools method not available';
    console.log('Event listeners on logo container:', listeners);
    
    // Simulate 5 clicks with debugging
    console.log('Simulating 5 logo clicks...');
    for (let i = 0; i < 5; i++) {
        console.log(`Click ${i + 1}:`);
        logoContainer.click();
        
        // Brief delay between clicks
        setTimeout(() => {
            console.log(`After click ${i + 1} - current tapCount should be ${i + 1}`);
        }, 100 * (i + 1));
    }
    
    // Check admin modal after clicks
    setTimeout(() => {
        const adminModal = document.getElementById('adminModal');
        console.log('Admin modal element:', adminModal);
        if (adminModal) {
            console.log('Admin modal classes:', adminModal.className);
            console.log('Admin modal visible:', !adminModal.classList.contains('hidden'));
        }
    }, 2000);
    
} else {
    console.log('✗ Logo container not found');
    console.log('Available elements with id:', Array.from(document.querySelectorAll('[id]')).map(el => el.id));
}

console.log('=== LOGO TAP TEST COMPLETE ===');