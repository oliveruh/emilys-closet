// --- UI Update Functions ---

/**
 * Populates a grid element (spool, clothing, or dye items) with items
 * based on current filters and sorting.
 * @param {HTMLElement} gridElement - The container element for the grid items (e.g., spoolItemGrid).
 * @param {Array<string>} items - Array of item keys (spool names, clothing keys, or dye item objects).
 * @param {string} filterText - Text from the relevant search bar.
 * @param {Function | null} clickHandler - Function to call when an item is clicked (null for dye grid).
 * @param {Function} itemDataExtractor - Function to get {name, imageUrl, type, ...} for an item key/object.
 * @param {string} [typeFilter='all'] - Type filter value (for clothing grid).
 * @param {string} [sortOrder='az'] - Sort order ('az', 'za', 'color', 'strength').
 */
function populateGrid(gridElement, items, filterText, clickHandler, itemDataExtractor, typeFilter = 'all', sortOrder = 'az') {
    gridElement.innerHTML = ''; 
    const filterLower = filterText.toLowerCase().trim();
    let filteredItems = items; 

    // --- Filtering ---
    // Filter by Type 
    if (typeFilter !== 'all' && gridElement === clothingItemGrid) {
        filteredItems = filteredItems.filter(itemKey => {
            const itemData = itemDataExtractor(itemKey);
            return itemData?.type === typeFilter;
        });
    }

    // Filter by Search Text (name)
    if (filterLower) {
        filteredItems = filteredItems.filter(itemKeyOrObject => {
            const itemData = itemDataExtractor(itemKeyOrObject);
            return itemData?.name?.toLowerCase().includes(filterLower);
        });
    }

    // --- Grid Population ---
    if (filteredItems.length === 0) {
        const message = filterText || typeFilter !== 'all' ? `No items match the current filters.` : 'No items available.';
        gridElement.innerHTML = `<p class="empty-state-message col-span-full">${message}</p>`;
        return; 
    }

    // Create and append grid items
    filteredItems.forEach(itemKeyOrObject => {
        const itemData = itemDataExtractor(itemKeyOrObject);
        if (!itemData?.name) return;

        const gridItem = document.createElement('div');
        gridItem.className = gridElement === dyeItemsGrid ? 'dye-item' : 'grid-item';
        if (clickHandler) {
            gridItem.dataset.itemName = itemKeyOrObject; 
        }
        gridItem.title = itemData.name; 
        gridItem.setAttribute('data-umami-event', `Selected a ${gridElement === clothingItemGrid ? 'CLOTH' : 'ITEM'} on the grid`);
        gridItem.setAttribute(`data-umami-event-${gridElement === clothingItemGrid ? 'cloth' : 'item'}_name`, formatItemNameForTracking(itemData.name));

        // Create image element
        const img = document.createElement('img');
        const imageUrl = itemData.imageUrl || placeholderImgUrl; 
        img.src = imageUrl;
        img.alt = itemData.name;
        img.dataset.originalSrc = imageUrl;
        img.onerror = () => handleImageError(img); 

        // Create name label/span
        const nameLabel = document.createElement('span');
        nameLabel.textContent = itemData.name;

        // Use specific class for dye item names if needed
        nameLabel.className = gridElement === dyeItemsGrid ? 'dye-item-name' : 'item-name-label';

        // Create a link to the wiki page for this item
        const wikiLink = document.createElement('a');
        if (gridElement === clothingItemGrid) {
            wikiLink.className = 'wiki-link-grid-clothing'; 
        } else {
            wikiLink.className = 'wiki-link-grid-item'; 
        }
        
        const wikiItemName = formatNameForWikiUrl(itemData.name);
        wikiLink.setAttribute('data-umami-event', `Clicked the STARDEW WIKI link`);
        wikiLink.setAttribute('data-umami-event-click_source', 'item-grid');
        wikiLink.setAttribute(`data-umami-event-item_name`, formatItemNameForTracking(itemData.name));
        wikiLink.setAttribute('data-umami-event-link', `${WIKI_BASE_URL}${wikiItemName}`);
        wikiLink.href = `${WIKI_BASE_URL}${wikiItemName}`; 
        wikiLink.target = '_blank'; 
        wikiLink.rel = 'noopener noreferrer'; 
        wikiLink.title = `View ${itemData.name} on Stardew Valley Wiki`; 
        wikiLink.innerHTML = `
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12,1A11,11,0,1,0,23,12,11.013,11.013,0,0,0,12,1Zm0,20a9,9,0,1,1,9-9A9.011,9.011,0,0,1,12,21Zm1-3H11V16h2Zm0-4H11V6h2Z" />
            </svg>`; 

        gridItem.appendChild(wikiLink);

        gridItem.appendChild(img);
        gridItem.appendChild(nameLabel);

        if (clickHandler) {
            gridItem.addEventListener('click', (e) => {
                if (e.target.closest('.favorite-button')) return;
                clickHandler(itemKeyOrObject, gridItem);
            });

            if (gridElement === clothingItemGrid) {
                const favButton = createFavoriteButton(itemKeyOrObject); 
                gridItem.appendChild(favButton);
            }
        }

        gridElement.appendChild(gridItem);
    });
}

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

/**
 * Displays the result of tailoring with a selected spool item in the main result panel (Mode 1).
 * Handles special cases like Prismatic Shard.
 * @param {string} spoolItemName - The name of the selected spool item.
 */
function displaySpoolResult(spoolItemName) {
    resultDisplay.innerHTML = '';
    resultDisplay.classList.remove('animate-result-pulse'); 

    if (!spoolItemName) {
        resultDisplay.innerHTML = '<p class="empty-state-message">Select a item from the right grid.</p>';
        return;
    }

    // --- Special case: Prismatic Shard ---
    if (spoolItemName === "Prismatic Shard") {
         const spoolImage = spoolItemImages[spoolItemName] || placeholderImgUrl;
         // Display specific info for Prismatic Shard
         resultDisplay.innerHTML = `
             <div class="text-center w-full px-2 py-4">
                  <img src="${spoolImage}" alt="${spoolItemName}" class="w-16 h-16 mx-auto mb-3 opacity-90 rounded border border-gray-300 animate-pulse" style="animation-duration: 2s; image-rendering: pixelated;" onerror="handleImageError(this)" data-original-src="${spoolImage}">
                  <h3 class="text-purple-700 font-bold">${spoolItemName}</h3>
                  <p class="description-text mt-2 text-sm">Creates a random sequence of dyeable clothing items.</p>
                  <p class="italic-note mt-1">The clothing item changes daily!</p>
              </div>`;
         return; 
    }

    // Get recipe details for the selected spool item from the processed tailoringRecipes map
    const recipe = tailoringRecipes[spoolItemName];
    const spoolImage = spoolItemImages[spoolItemName] || placeholderImgUrl;

    if (!recipe) {
        resultDisplay.innerHTML = `
            <div class="text-center w-full px-2 py-4">
                 <img src="${spoolImage}" alt="${spoolItemName}" class="w-12 h-12 mx-auto mb-3 opacity-80 rounded border border-gray-300" style="image-rendering: pixelated;" onerror="handleImageError(this)" data-original-src="${spoolImage}">
                 <p class="font-semibold text-amber-800">${spoolItemName}</p>
                 <p class="text-sm text-gray-600 mt-2">This item doesn't seem to create unique clothing when used as the main spool item with Cloth.</p>
                 <p class="italic-note mt-1">It might be used in other recipes or be a dye item.</p>
             </div>`;
        return; 
    }

    const clothingKey = `${recipe.resultName} [${recipe.type}]`; 

     const resultContainer = document.createElement('div');
     resultContainer.className = 'text-center w-full px-2 py-4 relative'; 

     const resultImageUrl = recipe.resultImage || placeholderImgUrl;
     resultContainer.innerHTML = `
         <p class="text-xs text-slate-600 mb-2 uppercase tracking-wider">Result [${recipe.type}]</p>
         <img id="result-image" src="${resultImageUrl}" alt="${recipe.resultName}" class="w-16 h-16 mx-auto mb-2 rounded border border-gray-300" style="image-rendering: pixelated;" onerror="handleImageError(this)" data-original-src="${resultImageUrl}">
         <h3>${recipe.resultName}</h3>
         <div id="info-boxes-container" class="mt-3 flex flex-col gap-2"></div> `;

     const infoContainer = resultContainer.querySelector('#info-boxes-container');

     // --- Add Info Boxes Dynamically ---
     // 1. Dyeable Status Box
     if (recipe.dyeable !== undefined) { 
         const dyeableBox = document.createElement('div');
         dyeableBox.className = 'info-box';
         const dyeIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
         dyeIcon.setAttribute('viewBox', "0 0 24 24");
         dyeIcon.classList.add('info-icon', 'dye-icon'); 
         if (recipe.dyeable) dyeIcon.classList.add('dyeable-yes'); 
         if (recipe.dyeable) dyeableBox.classList.add('info-dyeable-yes'); 
         dyeIcon.innerHTML = `
            <path d="M9.44444 4.44444L12.3917 0.760432C12.7762 0.279794 13.3583 0 13.9738 0C15.0929 0 16 0.907148 16 2.02617C16 2.64169 15.7202 3.22383 15.2396 3.60835L11.5556 6.55556L12.2454 7.24538C12.7286 7.72855 13 8.38388 13 9.0672C13 9.66992 12.7887 10.2536 12.4028 10.7166L11.8246 11.4104L4.58957 4.17536L5.2834 3.59717C5.74643 3.21131 6.33008 3 6.9328 3C7.61612 3 8.27145 3.27145 8.75462 3.75462L9.44444 4.44444Z" />
            <path d="M0 8L3.04679 5.46101L10.539 12.9532L8 16L0 8Z" />`; 
         dyeableBox.appendChild(dyeIcon);
         const dyeText = document.createElement('span');
         dyeText.textContent = recipe.dyeable ? 'Dyeable' : 'Not Dyeable';
         dyeableBox.appendChild(dyeText);
         infoContainer.appendChild(dyeableBox); 
     }

     // 2. Description Box
     // Only show if description exists and is not the default placeholder text
     const descriptionText = recipe.description && recipe.description !== "No description available." ? recipe.description : null;
     if (descriptionText) {
         const descBox = document.createElement('div');
         descBox.className = 'info-box';
         const descIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
         descIcon.setAttribute('viewBox', "0 0 24 24");
         descIcon.classList.add('info-icon', 'desc-icon');
         descIcon.innerHTML = `<path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>`; // SVG path
         descBox.appendChild(descIcon);
         const descTextSpan = document.createElement('span');
         descTextSpan.textContent = descriptionText;
         descBox.appendChild(descTextSpan);
         infoContainer.appendChild(descBox);
     }

     // 3. Special Notes Box (e.g., for boots defense/immunity)
     if (recipe.specialNotes) {
         const noteBox = document.createElement('div');
         noteBox.className = 'info-box';
         const noteIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
         noteIcon.setAttribute('viewBox', "0 0 24 24");
         noteIcon.classList.add('info-icon', 'note-icon');
         noteIcon.innerHTML = `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>`; // SVG path
         noteBox.appendChild(noteIcon);
         const noteTextSpan = document.createElement('span');
         noteTextSpan.textContent = recipe.specialNotes;
         noteBox.appendChild(noteTextSpan);
         infoContainer.appendChild(noteBox);
     }

     // Add Favorite Button to the result container
     const favButton = createFavoriteButton(clothingKey); 
     resultContainer.appendChild(favButton); 

     resultDisplay.appendChild(resultContainer);

    void resultDisplay.offsetWidth; 
    resultDisplay.classList.add('animate-result-pulse');
}

/**
 * Displays the selected clothing item in the result panel (Mode 2).
 * Includes details like dye status, description, and notes if available.
 * @param {string} clothingKey - The key of the selected clothing item ("Name (Type)").
 */
function displayRequiredSpoolsConfirmation(clothingKey) {
    resultDisplay.innerHTML = ''; 
    resultDisplay.classList.remove('animate-result-pulse');

    if (!clothingKey) {
        resultDisplay.innerHTML = '<p class="empty-state-message">Select desired clothing from the right grid.</p>';
        return;
    }

    const clothingName = getClothingDisplayName(clothingKey);
    const recipeType = getClothingType(clothingKey) || 'Unknown';
    const clothingImage = clothingItemImages[clothingKey] || placeholderImgUrl; 

    // --- Attempt to find original clothing details (dyeable, description, notes) ---
    // This requires looking back at the raw `allClothingData` as `tailoringRecipes` is keyed by spool item
    let clothingItemData = null;
    for (const id in allClothingData) {
        const item = allClothingData[id];
        if (item.name === clothingName && (item.type.charAt(0).toUpperCase() + item.type.slice(1)) === recipeType) {
            clothingItemData = item;
            break;
        }
    }

    // Extract details if found, otherwise use defaults or undefined
    let isDyeable = undefined;
    let description = "No description available.";
    let specialNotes = null;

    if (clothingItemData) {
        isDyeable = clothingItemData.dyeable;
        description = clothingItemData.description || description;
        specialNotes = clothingItemData.notes; 
    } else {
        // Log a warning if the original data couldn't be found (should be rare)
        console.warn(`Could not find original data for clothing key: ${clothingKey}`);
    }

     const resultContainer = document.createElement('div');
     resultContainer.className = 'text-center w-full px-2 py-4 relative';

     resultContainer.innerHTML = `
         <p class="text-xs text-slate-600 mb-2 uppercase tracking-wider">Selected Clothing [${recipeType}]:</p>
         <img id="result-image" src="${clothingImage}" alt="${clothingName}" class="w-16 h-16 mx-auto mb-2 rounded border border-gray-300" style="image-rendering: pixelated;" onerror="handleImageError(this)" data-original-src="${clothingImage}">
         <h3> ${clothingName}</h3>
         <div id="info-boxes-container" class="mt-3 flex flex-col gap-2"></div>`; 

     const infoContainer = resultContainer.querySelector('#info-boxes-container');

     // --- Add Info Boxes Dynamically ---
     // 1. Recipe Availability Box (Indicates if it can be crafted with Cloth)
     const recipeBox = document.createElement('div');

     infoContainer.appendChild(recipeBox);

     // 2. Dyeable Status Box (only if status is known)
     if (isDyeable !== undefined) {
         const dyeableBox = document.createElement('div');
         dyeableBox.className = 'info-box';
         const dyeIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
         dyeIcon.setAttribute('viewBox', "0 0 24 24");
         dyeIcon.classList.add('info-icon', 'dye-icon');
         if (isDyeable) dyeIcon.classList.add('dyeable-yes'); 
         if (isDyeable) dyeableBox.classList.add('info-dyeable-yes');
         dyeIcon.innerHTML = `<path d="M9.44444 4.44444L12.3917 0.760432C12.7762 0.279794 13.3583 0 13.9738 0C15.0929 0 16 0.907148 16 2.02617C16 2.64169 15.7202 3.22383 15.2396 3.60835L11.5556 6.55556L12.2454 7.24538C12.7286 7.72855 13 8.38388 13 9.0672C13 9.66992 12.7887 10.2536 12.4028 10.7166L11.8246 11.4104L4.58957 4.17536L5.2834 3.59717C5.74643 3.21131 6.33008 3 6.9328 3C7.61612 3 8.27145 3.27145 8.75462 3.75462L9.44444 4.44444Z" /> <path d="M0 8L3.04679 5.46101L10.539 12.9532L8 16L0 8Z" />`; // SVG path
         dyeableBox.appendChild(dyeIcon);
         const dyeText = document.createElement('span');
         dyeText.textContent = isDyeable ? 'Dyeable' : 'Not Dyeable';
         dyeableBox.appendChild(dyeText);
         infoContainer.appendChild(dyeableBox);
     }

     // 3. Description/Notes Box (Combine if both exist, prioritize notes icon)
     const hasDescription = description && description !== "No description available.";
     if (hasDescription || specialNotes) {
         const descBox = document.createElement('div');
         descBox.className = 'info-box';
         const iconSVG = specialNotes
            ? `<svg class="info-icon note-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`
            : `<svg class="info-icon desc-icon" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`;
         descBox.innerHTML = iconSVG; 

         const textSpan = document.createElement('span');
         let contentHTML = ''; 
         if (hasDescription) {
             contentHTML += description; 
         }
         if (specialNotes) {
              if (contentHTML) contentHTML += ` <span class="italic-note" style="margin:0; display:inline;">(${specialNotes})</span>`;
             else contentHTML += specialNotes; 
         }
         textSpan.innerHTML = contentHTML; 
         descBox.appendChild(textSpan);
         infoContainer.appendChild(descBox);
     }

     // Add Favorite Button to the container
     const favButton = createFavoriteButton(clothingKey);
     resultContainer.appendChild(favButton);

     resultDisplay.appendChild(resultContainer);
     void resultDisplay.offsetWidth; 
     resultDisplay.classList.add('animate-result-pulse');
}

/**
 * Populates the left panel (Mode 2) with the list of spool items required
 * to craft the selected clothing item. Adds a wiki link button to each item.
 * @param {string} clothingKey - The key of the selected clothing item ("Name (Type)").
 */
function populateRequiredSpoolPanel(clothingKey) {
    requiredSpoolList.innerHTML = '';

    if (!clothingKey) {
         requiredSpoolList.innerHTML = '<li class="empty-state-message">Select desired clothing first...</li>';
         return;
    }

    const requiredSpools = clothingToSpoolMap[clothingKey];

    if (!requiredSpools || !Array.isArray(requiredSpools) || requiredSpools.length === 0) {
        requiredSpoolList.innerHTML = '<li class="empty-state-message">No known spool items make this with Cloth.</li>';
        return;
    }

    requiredSpools.sort((a, b) => a.localeCompare(b));

    requiredSpools.forEach(spoolItemName => {
        const li = document.createElement('li');
        li.className = 'required-spool-item'; 

        const img = document.createElement('img');
        const spoolImgUrl = spoolItemImages[spoolItemName] || placeholderImgUrl;
        img.src = spoolImgUrl;
        img.alt = spoolItemName;
        img.dataset.originalSrc = spoolImgUrl; 
        img.onerror = () => handleImageError(img); 

        const span = document.createElement('span');
        span.textContent = spoolItemName;

        li.appendChild(img);
        li.appendChild(span);

         // --- Prismatic Shard Note (Special case handling) ---
         if (spoolItemName === "Prismatic Shard") {
             const note = document.createElement('span');
             note.className = 'prismatic-note';
             note.textContent = '(Random Clothing)';
             li.appendChild(note);
         }

         // --- Wiki Link Button ---
         const wikiLink = document.createElement('a');
         wikiLink.className = 'wiki-link-button';
         const wikiItemName = formatNameForWikiUrl(spoolItemName);
         wikiLink.setAttribute('data-umami-event', `Clicked the STARDEW WIKI link`);
         wikiLink.setAttribute('data-umami-event-click_source', 'required-item-list');
         wikiLink.setAttribute('data-umami-event-item_name', formatItemNameForTracking(spoolItemName));
         wikiLink.setAttribute('data-umami-event-link', `${WIKI_BASE_URL}${wikiItemName}`);
         wikiLink.href = `${WIKI_BASE_URL}${wikiItemName}`; 
         wikiLink.target = '_blank'; 
         wikiLink.rel = 'noopener noreferrer'; 
         wikiLink.title = `View ${spoolItemName} on Stardew Valley Wiki`; 
         wikiLink.innerHTML = `
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12,1A11,11,0,1,0,23,12,11.013,11.013,0,0,0,12,1Zm0,20a9,9,0,1,1,9-9A9.011,9.011,0,0,1,12,21Zm1-3H11V16h2Zm0-4H11V6h2Z" />
            </svg>`; 
         li.appendChild(wikiLink); 

        requiredSpoolList.appendChild(li);
    });
}

/** Displays the list of favorited items in the Favorites tab panel. */
function displayFavoritesList() {
    favoritesPanel.innerHTML = ''; 

    if (favorites.length === 0) {
        favoritesPanel.innerHTML = '<p class="empty-state-message">No favorites saved yet. Click the star (☆) on an item to save it!</p>';
        return;
    }

    const sortedFavorites = [...favorites].sort((aKey, bKey) => {
         const aName = getClothingDisplayName(aKey); 
         const bName = getClothingDisplayName(bKey);
         return aName.localeCompare(bName);
    });

    sortedFavorites.forEach(clothingKey => {
        const clothingName = getClothingDisplayName(clothingKey);
        const clothingImage = clothingItemImages[clothingKey] || placeholderImgUrl;
        const clothingType = getClothingType(clothingKey) || 'Item'; 

        const div = document.createElement('div');
        div.className = 'favorite-item';
        div.title = `View recipe for ${clothingName}`;
        div.dataset.itemKey = clothingKey; 

        const img = document.createElement('img');
        img.src = clothingImage;
        img.alt = clothingName;
        img.onerror = () => handleImageError(img); 
        img.dataset.originalSrc = clothingImage; 

        const span = document.createElement('span');
        span.textContent = `${clothingName} [${clothingType}]`; 

        const removeBtn = document.createElement('button');
        removeBtn.textContent = '×'; 
        removeBtn.className = 'remove-favorite-button'; 
        removeBtn.title = 'Remove from Favorites'; 
        removeBtn.onclick = (e) => {
            e.stopPropagation(); 
            removeFavorite(clothingKey); 
            displayFavoritesList(); 

            syncOtherFavoriteButtons(clothingKey, null); 
        };

        div.appendChild(img);
        div.appendChild(span);
        div.appendChild(removeBtn);

         // --- Add click listener to the entire favorite item div ---
         div.addEventListener('click', () => {
             updateUIMode('resultToSpool');
             clothingSearchBar.value = clothingName;
             handleClothingFilterSortChange();
             setTimeout(() => {
                 const gridItem = clothingItemGrid.querySelector(`.grid-item[data-item-name="${CSS.escape(clothingKey)}"]`);
                 if (gridItem) {
                     handleClothingItemClick(clothingKey, gridItem);
                     gridItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                 } else {
                      console.warn("Could not find favorite item in grid after switching tabs:", clothingKey);
                      displayRequiredSpoolsConfirmation(clothingKey);
                      populateRequiredSpoolPanel(clothingKey);
                 }
             }, 100); 
         });

        favoritesPanel.appendChild(div);
    });
}

/**
 * Updates the UI to reflect the selected mode (tab).
 * Hides/shows relevant content areas and resets simulator state if needed.
 * @param {string} mode - The mode to switch to ('spoolToResult', 'resultToSpool', 'favorites', 'dyeing').
 */
function updateUIMode(mode) {
    const currentActiveTab = document.querySelector('.tab-button.active');
    if (currentActiveTab) currentActiveTab.classList.remove('active');

    if (currentMode !== mode && !['favorites', 'dyeing'].includes(currentMode) && !['favorites', 'dyeing'].includes(mode)) {
         resetSimulatorState();
    }

    currentMode = mode;

    const newActiveTab = document.querySelector(`.tab-button[data-mode="${mode}"]`);
    if (newActiveTab) newActiveTab.classList.add('active');

    simulatorContent.classList.add('hidden');
    favoritesContent.classList.add('hidden');

    if (mode === 'favorites') {
        favoritesContent.classList.remove('hidden');
        displayFavoritesList(); 
    } else {
        simulatorContent.classList.remove('hidden');

         const spoolDataExtractor = (itemKey) => ({ name: itemKey, imageUrl: spoolItemImages[itemKey] });
         const clothingDataExtractor = (itemKey) => ({ name: getClothingDisplayName(itemKey), imageUrl: clothingItemImages[itemKey], type: getClothingType(itemKey) });

        if (mode === 'spoolToResult') {
            // Show Mode 1 elements (left/right columns), hide Mode 2 elements
            leftColMode1.classList.remove('hidden');
            leftColMode2.classList.add('hidden');
            rightColMode1.classList.remove('hidden');
            rightColMode2.classList.add('hidden');
            populateGrid(spoolItemGrid, allSpoolItems, spoolSearchBar.value, handleSpoolItemClick, spoolDataExtractor, 'all', 'az');
            if (!selectedSpoolItemElement) {
                resultDisplay.innerHTML = '<p class="empty-state-message">Select a item from the right grid.</p>';
                updateSelectedSpoolDisplay(null);
            } else {
                 displaySpoolResult(selectedSpoolItemElement.dataset.itemName);
                 updateSelectedSpoolDisplay(selectedSpoolItemElement.dataset.itemName);
            }
        } else { 
            leftColMode1.classList.add('hidden');
            leftColMode2.classList.remove('hidden');
            rightColMode1.classList.add('hidden');
            rightColMode2.classList.remove('hidden');
             populateGrid(clothingItemGrid, sortedClothingItems, clothingSearchBar.value, handleClothingItemClick, clothingDataExtractor, currentClothingFilter, currentClothingSort);
            if (!selectedClothingItemElement) {
                resultDisplay.innerHTML = '<p class="empty-state-message">Select desired clothing from the right grid.</p>';
                requiredSpoolList.innerHTML = '<li class="empty-state-message">Select desired clothing first...</li>';
            } else {
                displayRequiredSpoolsConfirmation(selectedClothingItemElement.dataset.itemName);
                populateRequiredSpoolPanel(selectedClothingItemElement.dataset.itemName);
            }
        }
    }
    console.log(`UI Mode updated to: ${mode}`);
}

 /** Resets search bars, selections, and display panels in the main simulator modes. */
 function resetSimulatorState() {
     spoolSearchBar.value = '';
     clothingSearchBar.value = '';
     resultDisplay.innerHTML = '<p class="empty-state-message">Select an item...</p>';
     resultDisplay.classList.remove('animate-result-pulse'); 
     requiredSpoolList.innerHTML = '<li class="empty-state-message">Select desired clothing first...</li>';
     updateSelectedSpoolDisplay(null); 
     if (selectedSpoolItemElement) selectedSpoolItemElement.classList.remove('selected');
     if (selectedClothingItemElement) selectedClothingItemElement.classList.remove('selected');
     selectedSpoolItemElement = null;
     selectedClothingItemElement = null;
     console.log("Simulator state reset.");
 }

/** Displays a few random featured tailoring combinations in the dedicated panel. */
function displayFeaturedCombinations(count = 4) {
     featuredContainer.innerHTML = ''; 

     const allSpoolItemsWithRecipes = Object.keys(tailoringRecipes);

     const eligibleItems = allSpoolItemsWithRecipes.filter(spoolName => {
         const recipe = tailoringRecipes[spoolName];
         return recipe?.resultName &&
                !['Boots', 'Special', 'Pants', 'Ring'].includes(recipe.type) &&
                spoolName !== 'Cloth';
     });

     if (eligibleItems.length === 0 && allSpoolItemsWithRecipes.length > 0) {
          console.warn("No 'eligible' featured items found after filtering, using all recipes.");
          eligibleItems.push(...allSpoolItemsWithRecipes.filter(spoolName => spoolName !== 'Cloth'));
     }

     if (eligibleItems.length === 0) {
         featuredContainer.innerHTML = '<p class="empty-state-message col-span-full">No featured combinations available.</p>';
         return;
     }

     // --- Select Random Items ---
     const featuredItems = []; 
     const usedIndices = new Set(); 
     const maxAttempts = eligibleItems.length * 3; 
     let attempts = 0;

     while (featuredItems.length < count && usedIndices.size < eligibleItems.length && attempts < maxAttempts) {
         const randomIndex = Math.floor(Math.random() * eligibleItems.length); 
         if (!usedIndices.has(randomIndex)) { 
             usedIndices.add(randomIndex);
             const spoolItemName = eligibleItems[randomIndex];

             if (tailoringRecipes[spoolItemName]) {
                 featuredItems.push({ spool: spoolItemName, result: tailoringRecipes[spoolItemName] });
             }
         }
         attempts++;
     }

     if (featuredItems.length === 0) {
         featuredContainer.innerHTML = '<p class="empty-state-message col-span-full">Could not load featured items.</p>';
         return;
     }

     featuredItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'featured-item'; 
        const spoolImgUrl = spoolItemImages[item.spool] || placeholderImgUrl;
        const resultImgUrl = item.result.resultImage || placeholderImgUrl;
        const clothImgUrl = spoolItemImages['Cloth'] || 'assets/Cloth.png';

        const spoolName = item.spool;
        const resultName = item.result.resultName;
        const resultType = item.result.type;
        div.innerHTML = `
            <img src="${spoolImgUrl}" alt="${spoolName}" title="${spoolName}" style="image-rendering: pixelated;" onerror="handleImageError(this)" data-original-src="${spoolImgUrl}">
            <span>${spoolName}</span>
            <span class="arrow mx-1"> + </span>
            <img src="${clothImgUrl}" alt="Cloth" title="Cloth" class="cloth-icon" style="image-rendering: pixelated;" onerror="handleImageError(this)" data-original-src="${clothImgUrl}">
            <span class="arrow mx-1"> → </span>
            <img src="${resultImgUrl}" alt="${resultName}" title="${resultName}" style="image-rendering: pixelated;" onerror="handleImageError(this)" data-original-src="${resultImgUrl}">
            <span>${resultName} [${resultType}]</span>`;
        featuredContainer.appendChild(div); 
     });
     console.log("Featured combinations displayed.");
}

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


console.log("UI module loaded."); 
