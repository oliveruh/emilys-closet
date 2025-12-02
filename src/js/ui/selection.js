// =============================================================================
// Selection Module - Item Selection Handlers
// =============================================================================

/**
 * Creates a favorite button element (star icon) for a clothing item.
 * @param {string} clothingKey - The item key ("Name (Type)") associated with this button.
 * @returns {HTMLButtonElement} The configured favorite button.
 */
function createFavoriteButton(clothingKey) {
     const favButton = document.createElement('button');
     favButton.className = 'favorite-button'; 
     favButton.dataset.itemKey = clothingKey; 
     favButton.setAttribute('data-umami-event', `Added to the FAVORITES`);
     favButton.setAttribute('data-umami-event-cloth_name', formatItemNameForTracking(clothingKey));
     syncFavoriteButtonState(favButton, clothingKey);

     favButton.addEventListener('click', (e) => {
         e.stopPropagation(); 
         toggleFavorite(clothingKey, favButton); 
     });
     return favButton;
}

/**
 * Handles clicking on a spool item in the grid (Mode 1).
 * Updates selection state, selected spool display, and the result panel.
 * @param {string} spoolItemName - The name of the clicked spool item.
 * @param {HTMLElement} gridElement - The clicked grid item element.
 */
function handleSpoolItemClick(spoolItemName, gridElement) {
    if (selectedSpoolItemElement) {
        selectedSpoolItemElement.classList.remove('selected');
    }
    gridElement.classList.add('selected');
    selectedSpoolItemElement = gridElement; 

    updateSelectedSpoolDisplay(spoolItemName);
    displaySpoolResult(spoolItemName);
}

/**
 * Updates the display area showing the currently selected spool item (Mode 1 Left Panel).
 * @param {string|null} spoolItemName - Name of the selected item, or null to clear display.
 */
function updateSelectedSpoolDisplay(spoolItemName) {
    selectedSpoolDisplay.innerHTML = ''; 
    if (spoolItemName) {
        // Create image element
        const img = document.createElement('img');
        const imgUrl = spoolItemImages[spoolItemName] || placeholderImgUrl; 
        img.src = imgUrl;
        img.alt = spoolItemName;
        img.onerror = () => handleImageError(img); 
        img.dataset.originalSrc = imgUrl;

        const span = document.createElement('span');
        span.textContent = spoolItemName;

        selectedSpoolDisplay.appendChild(img);
        selectedSpoolDisplay.appendChild(span);
    } else {
        selectedSpoolDisplay.innerHTML = '<span class="placeholder-text">Select item from right grid</span>';
    }
}

/**
 * Handles clicking on a clothing item in the grid (Mode 2).
 * Updates selection state, displays confirmation in result panel, and shows required spools.
 * @param {string} clothingKey - The key of the clicked clothing item ("Name (Type)").
 * @param {HTMLElement} gridElement - The clicked grid item element.
 */
function handleClothingItemClick(clothingKey, gridElement) {
    if (selectedClothingItemElement) {
        selectedClothingItemElement.classList.remove('selected');
    }
    gridElement.classList.add('selected');
    selectedClothingItemElement = gridElement; 

    displayRequiredSpoolsConfirmation(clothingKey);
    populateRequiredSpoolPanel(clothingKey);
}

console.log("Selection module loaded.");
