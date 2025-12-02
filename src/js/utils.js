// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Handles image loading errors by replacing the src with a placeholder.
 * Prevents infinite loops if the placeholder itself fails.
 * @param {HTMLImageElement} imgElement - The image element that failed to load.
 */
function handleImageError(imgElement) {
    const originalSrc = imgElement.dataset.originalSrc || imgElement.src;

    if (imgElement.src !== placeholderImgUrl) {
        console.warn(`Image failed to load: '${originalSrc}'. Falling back to placeholder: '${placeholderImgUrl}'`);
        imgElement.src = placeholderImgUrl;
        imgElement.onerror = null;
    }
}

/**
 * Extracts the display name from a clothing key.
 * @param {string} clothingKey - Format: "Item Name [Type]"
 * @returns {string} The display name (e.g., "Sailor Shirt")
 * @example getClothingDisplayName("Sailor Shirt [Shirt]") // "Sailor Shirt"
 */
function getClothingDisplayName(clothingKey) {
    if (!clothingKey || typeof clothingKey !== 'string') {
        return '';
    }

    const bracketIndex = clothingKey.lastIndexOf(' [');
    return bracketIndex === -1 
        ? clothingKey 
        : clothingKey.substring(0, bracketIndex).trim();
}

/**
 * Extracts the type from a clothing key.
 * @param {string} clothingKey - Format: "Item Name [Type]"
 * @returns {string|null} The clothing type (e.g., "Shirt") or null
 * @example getClothingType("Sailor Shirt [Shirt]") // "Shirt"
 */
function getClothingType(clothingKey) {
    if (!clothingKey || typeof clothingKey !== 'string') {
        return null;
    }

    const match = clothingKey.match(/\[([^\]]+)\]$/);
    return match ? match[1] : null;
}

/**
 * Safely processes an image URL, handling decoding and fallback to placeholder.
 * @param {string|null|undefined} imageUrl - The image URL from JSON data
 * @returns {string} The processed URL or placeholder URL
 */
function getPrimaryImageUrl(imageUrl) {
    if (typeof imageUrl !== 'string' || !imageUrl) {
        return placeholderImgUrl;
    }

    try {
        return decodeURIComponent(imageUrl);
    } catch (error) {
        console.error(`Error decoding URL: ${imageUrl}`, error);
        return imageUrl;
    }
}

/**
 * Formats an item name for use in Stardew Valley Wiki URLs.
 * @param {string} itemName - The item name to format
 * @returns {string} URL-formatted name with underscores
 * @example formatNameForWikiUrl("Ancient Fruit") // "Ancient_Fruit"
 */
function formatNameForWikiUrl(itemName) {
    if (!itemName || typeof itemName !== 'string') {
        return '';
    }
    return itemName.replace(/ /g, '_');
}

/**
 * Formats a string for analytics tracking.
 * Removes brackets, converts to lowercase, replaces spaces with hyphens.
 * @param {string} input - The input string to format
 * @returns {string} Formatted tracking string
 * @example formatItemNameForTracking("Sailor Shirt [Shirt]") // "sailor-shirt"
 */
function formatItemNameForTracking(input) {
    return input
        .replace(/\[.*?\]/g, '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-');
}

/**
 * Creates a debounced version of a function that delays execution.
 * Useful for rate-limiting search input handlers.
 * @param {Function} func - The function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, delay) {
    let timeoutId;

    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

console.log('Utils loaded.'); 
