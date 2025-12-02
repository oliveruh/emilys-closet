// =============================================================================
// Grid Module - Grid Population and Item Display
// =============================================================================

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
        if (gridElement != clothingItemGrid) {
            const wikiLink = document.createElement('a');
            wikiLink.className = 'wiki-link-grid-item';

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
            
        }

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

console.log("Grid module loaded.");
