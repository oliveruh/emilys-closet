// --- Favorites Functions ---

/**
 * Loads the list of favorited items from the localStorage.
 */
function loadFavorites() {
    const storedFavorites = localStorage.getItem(FAVORITES_KEY);

    try {
        favorites = storedFavorites ? JSON.parse(storedFavorites) : [];

        if (!Array.isArray(favorites)) {
            console.warn("Stored favorites data was not an array. Resetting.");
            favorites = [];
        }
    } catch (e) {
         console.error("Error parsing favorites from localStorage:", e);
         favorites = [];
    }
    console.log("Favorites loaded:", favorites.length); 
}

/** Saves the current `favorites` array to localStorage. */
function saveFavorites() {
     try {
         localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
     } catch (e) {
         console.error("Error saving favorites to localStorage:", e);
     }
}

/**
 * Checks if a specific clothing item (by key) is in the favorites list.
 * @param {string} clothingKey - The unique key ("Name [Type]") of the clothing item.
 * @returns {boolean} True if the item is favorited, false if not.
 */
function isFavorite(clothingKey) {
    return favorites.includes(clothingKey);
}

/**
 * Adds a clothing item to the favorites list if it's not already present.
 * @param {string} clothingKey - The unique key ("Name [Type]") of the clothing item.
 * @returns {boolean} True if the item was successfully added, false if not.
 */
function addFavorite(clothingKey) {
    if (typeof clothingKey === 'string' && !isFavorite(clothingKey)) {
        favorites.push(clothingKey); 
        saveFavorites(); 
        console.log(`Added favorite: ${clothingKey}`);
        return true; 
    }
    return false; 
}

/**
 * Removes a clothing item from the favorites list if it exists.
 * @param {string} clothingKey - The unique key ("Name [Type]") of the clothing item.
 * @returns {boolean} True if the item was successfully removed, false otherwise.
 */
function removeFavorite(clothingKey) {
    const index = favorites.indexOf(clothingKey);
    if (index > -1) {
        favorites.splice(index, 1); 
        saveFavorites();
         console.log(`Removed favorite: ${clothingKey}`);
        return true; 
    }
    return false;
}

/**
 * Toggles the favorite status of an item (adds if not favorite, removes if favorite).
 * Updates the UI of the clicked button and potentially other related buttons.
 * @param {string} clothingKey - The key of the item to toggle.
 * @param {HTMLButtonElement} buttonElement - The favorite button element that was clicked.
 */
function toggleFavorite(clothingKey, buttonElement) {
     if (!clothingKey || typeof clothingKey !== 'string') {
         console.warn("Attempted to toggle favorite with invalid key:", clothingKey);
         return;
     }

     const wasFavorite = isFavorite(clothingKey); 
     let success = false; 

     if (wasFavorite) {
         success = removeFavorite(clothingKey);
     } else {
         success = addFavorite(clothingKey);
     }

     if (success) {
         if (buttonElement) {
            syncFavoriteButtonState(buttonElement, clothingKey);
         }

         syncOtherFavoriteButtons(clothingKey, buttonElement);

         if (currentMode === 'favorites') {
             displayFavoritesList();
         }
     }
}

/**
 * Updates the visual appearance (star icon, title attribute) of a favorite button
 * based on whether the associated item is currently favorited.
 * @param {HTMLButtonElement} buttonElement - The button element to update.
 * @param {string} clothingKey - The item key associated with the button.
 */
function syncFavoriteButtonState(buttonElement, clothingKey) {
    if (!buttonElement) return;
    const favoriteStatus = isFavorite(clothingKey); 

    buttonElement.classList.toggle('is-favorite', favoriteStatus);

    buttonElement.textContent = favoriteStatus ? '★' : '☆';

    buttonElement.title = favoriteStatus ? 'Remove from Favorites' : 'Add to Favorites';
}

/**
 * Finds and updates the visual state of all favorite buttons associated with a specific item key,
 * excluding the button that might have triggered the initial toggle event.
 * @param {string} clothingKey - The item key whose buttons need syncing.
 * @param {HTMLButtonElement | null} excludeButton - The button to exclude from the update (optional).
 */
function syncOtherFavoriteButtons(clothingKey, excludeButton) {
    const otherButtons = document.querySelectorAll(`.favorite-button[data-item-key="${CSS.escape(clothingKey)}"]`);
    otherButtons.forEach(btn => {
        if (btn !== excludeButton) {
            syncFavoriteButtonState(btn, clothingKey);
        }
    });
}

console.log("Favorites module loaded."); 
