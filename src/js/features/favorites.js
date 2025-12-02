// =============================================================================
// Favorites Management
// =============================================================================

/**
 * Loads favorites from localStorage into the favorites array.
 */
function loadFavorites() {
    const storedData = localStorage.getItem(FAVORITES_KEY);

    if (!storedData) {
        favorites = [];
        console.log('Favorites loaded: 0');
        return;
    }

    try {
        const parsed = JSON.parse(storedData);
        favorites = Array.isArray(parsed) ? parsed : [];

        if (!Array.isArray(parsed)) {
            console.warn('Stored favorites data was not an array. Resetting.');
        }
    } catch (error) {
        console.error('Error parsing favorites from localStorage:', error);
        favorites = [];
    }

    console.log('Favorites loaded:', favorites.length);
}

/**
 * Saves the current favorites array to localStorage.
 */
function saveFavorites() {
    try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
        console.error('Error saving favorites to localStorage:', error);
    }
}

/**
 * Checks if a clothing item is in the favorites list.
 * @param {string} clothingKey - The item key (format: "Name [Type]")
 * @returns {boolean} True if favorited
 */
function isFavorite(clothingKey) {
    return favorites.includes(clothingKey);
}

/**
 * Adds a clothing item to favorites.
 * @param {string} clothingKey - The item key to add
 * @returns {boolean} True if successfully added
 */
function addFavorite(clothingKey) {
    if (typeof clothingKey !== 'string' || isFavorite(clothingKey)) {
        return false;
    }

    favorites.push(clothingKey);
    saveFavorites();
    console.log(`Added favorite: ${clothingKey}`);
    return true;
}

/**
 * Removes a clothing item from favorites.
 * @param {string} clothingKey - The item key to remove
 * @returns {boolean} True if successfully removed
 */
function removeFavorite(clothingKey) {
    const index = favorites.indexOf(clothingKey);

    if (index === -1) {
        return false;
    }

    favorites.splice(index, 1);
    saveFavorites();
    console.log(`Removed favorite: ${clothingKey}`);
    return true;
}

/**
 * Toggles the favorite status of an item and updates UI.
 * @param {string} clothingKey - The item key to toggle
 * @param {HTMLButtonElement} buttonElement - The clicked button element
 */
function toggleFavorite(clothingKey, buttonElement) {
    if (!clothingKey || typeof clothingKey !== 'string') {
        console.warn('Attempted to toggle favorite with invalid key:', clothingKey);
        return;
    }

    const wasFavorite = isFavorite(clothingKey);
    const success = wasFavorite ? removeFavorite(clothingKey) : addFavorite(clothingKey);

    if (!success) {
        return;
    }

    // Update UI
    if (buttonElement) {
        syncFavoriteButtonState(buttonElement, clothingKey);
    }

    syncOtherFavoriteButtons(clothingKey, buttonElement);

    if (currentMode === 'favorites') {
        displayFavoritesList();
    }
}

/**
 * Updates a favorite button's visual state based on favorite status.
 * @param {HTMLButtonElement} buttonElement - The button to update
 * @param {string} clothingKey - The associated item key
 */
function syncFavoriteButtonState(buttonElement, clothingKey) {
    if (!buttonElement) {
        return;
    }

    const isFav = isFavorite(clothingKey);

    buttonElement.classList.toggle('is-favorite', isFav);
    buttonElement.textContent = isFav ? '★' : '☆';
    buttonElement.title = isFav ? 'Remove from Favorites' : 'Add to Favorites';
}

/**
 * Syncs all favorite buttons for a specific item (excluding the trigger button).
 * @param {string} clothingKey - The item key
 * @param {HTMLButtonElement|null} excludeButton - Button to exclude from sync
 */
function syncOtherFavoriteButtons(clothingKey, excludeButton) {
    const selector = `.favorite-button[data-item-key="${CSS.escape(clothingKey)}"]`;
    const buttons = document.querySelectorAll(selector);

    buttons.forEach(btn => {
        if (btn !== excludeButton) {
            syncFavoriteButtonState(btn, clothingKey);
        }
    });
}

console.log('Favorites module loaded.'); 
