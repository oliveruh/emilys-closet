// =============================================================================
// Panels Module - Panel Management (Spool List, Favorites)
// =============================================================================

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

console.log("Panels module loaded.");
