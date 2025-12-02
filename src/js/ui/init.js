// =============================================================================
// Init Module - Application Initialization
// =============================================================================

/**
 * Initializes the main application UI after data has been loaded and processed.
 * Sets up initial state, displays featured items, and reveals the game card.
 */
function initializeAppUI() {
     try {
        updateUIMode('spoolToResult'); 
        displayFeaturedCombinations(2);
        loadingIndicator.style.display = 'none'; 
        gameCard.classList.remove('hidden'); 
         console.log("UI Initialized successfully.");
     } catch (uiError) {
         // Log error if any part of UI initialization fails
         console.error("Error initializing UI components:", uiError);

         loadingIndicator.innerHTML = `
            <span>Error setting up the interface.</span>
            <br>
            <span>Please try refreshing.</span>
            <p style="font-size: 0.8rem; margin-top: 10px; color: #6b3e23;">(${uiError.message})</p>`;
         loadingIndicator.style.display = 'flex'; 
         gameCard.classList.add('hidden'); 
     }
}

console.log("Init module loaded.");
