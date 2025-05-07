// --- Utility Functions ---

/**
 * Handles image loading errors by replacing the src with a placeholder.
 * Prevents infinite loops if the placeholder itself fails.
 * @param {HTMLImageElement} imgElement - The image element that failed to load.
 */
function handleImageError(imgElement) {
    const originalSrc = imgElement.dataset.originalSrc || imgElement.src;
    if (imgElement.src !== placeholderImgUrl) {
         console.warn(`Image failed: ${originalSrc}. Using placeholder: ${placeholderImgUrl}`);
         imgElement.src = placeholderImgUrl;
         imgElement.onerror = null;
    }
}

/**
 * Extracts the display name from a clothing key (e.g., "Sailor Shirt [Shirt]" -> "Sailor Shirt").
 * @param {string} clothingKey - The clothing key string.
 * @returns {string} The display name, or an empty string if input is invalid.
 */
function getClothingDisplayName(clothingKey) {
    if (!clothingKey || typeof clothingKey !== 'string') return '';
    const lastParen = clothingKey.lastIndexOf(' [');
    return lastParen === -1 ? clothingKey : clothingKey.substring(0, lastParen).trim();
}

/**
 * Extracts the type from a clothing key (e.g., "Sailor Shirt [Shirt]" -> "Shirt").
 * @param {string} clothingKey - The clothing key string.
 * @returns {string|null} The clothing type or null if not found or input is invalid.
 */
function getClothingType(clothingKey) {
     if (!clothingKey || typeof clothingKey !== 'string') return null;
     const match = clothingKey.match(/\[([^\]]+)\]$/);
     return match ? match[1] : null;
}

/**
 * Safely gets the image URL from the data, handling potential decoding. Falls back to placeholder.
 * Assumes the input is a string based on the JSON structure.
 * @param {string|null|undefined} imageUrl - The image URL string from JSON.
 * @returns {string} The processed image URL or placeholder URL.
 */
function getPrimaryImageUrl(imageUrl) {
    let url = placeholderImgUrl; 
    if (typeof imageUrl === 'string' && imageUrl) {
        url = imageUrl;
    }

    if (url !== placeholderImgUrl) {
        try {
            const decodedUrl = decodeURIComponent(url);
            return decodedUrl;
        } catch (e) {
            console.error(`Error decoding URL: ${url}`, e);
            return url;
        }
    }
    return url;
}

/**
 * Formats an item name for use in a Stardew Valley Wiki URL (replaces spaces with underscores).
 * @param {string} itemName - The item name.
 * @returns {string} The formatted item name for the URL, or empty string if input is invalid.
 */
function formatNameForWikiUrl(itemName) {
    if (!itemName || typeof itemName !== 'string') return '';
    return itemName.replace(/ /g, '_');
}

/**
 * Formats a string by removing brackets and their contents, trimming whitespace,
 * converting to lowercase, and replacing spaces with hyphens.
 * @param {string} input - The input string to format.
 * @returns {string} The formatted string.
 * */
function formatItemNameForTracking(input) {
    return input
      .replace(/\[.*?\]/g, '')     
      .trim()                      
      .toLowerCase()               
      .replace(/\s+/g, '-');       
  }

/**
 * Debounce function: Limits the rate at which a function can fire.
 * Useful for event listeners like search input to prevent excessive calls.
 * @param {Function} func - The function to debounce.
 * @param {number} delay - The delay in milliseconds.
 * @returns {Function} A debounced version of the function.
 */
function debounce(func, delay) {
    let timeoutId; 
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

console.log("Utils loaded."); 
