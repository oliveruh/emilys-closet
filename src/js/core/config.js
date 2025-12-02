// =============================================================================
// Configuration Constants
// =============================================================================

const CONFIG = {
    // Image placeholder for failed loads
    PLACEHOLDER_IMAGE_URL: 'https://placehold.co/36x36/e0d6b3/8b4513?text=?',

    // Data file paths
    DATA_URLS: {
        CLOTHING: 'data/clothing_items.json',
        SPOOL: 'data/spool_items.json',
        DYE: 'data/dye_info.json'
    },

    // LocalStorage keys
    STORAGE_KEYS: {
        FAVORITES: 'emilysClosetFavorites'
    },

    // External URLs
    WIKI_BASE_URL: 'https://stardewvalleywiki.com/'
};

// Legacy constant aliases for backward compatibility
const placeholderImgUrl = CONFIG.PLACEHOLDER_IMAGE_URL;
const CLOTHING_DATA_URL = CONFIG.DATA_URLS.CLOTHING;
const SPOOL_DATA_URL = CONFIG.DATA_URLS.SPOOL;
const DYE_DATA_URL = CONFIG.DATA_URLS.DYE;
const FAVORITES_KEY = CONFIG.STORAGE_KEYS.FAVORITES;
const WIKI_BASE_URL = CONFIG.WIKI_BASE_URL;

console.log('Config loaded.'); 
