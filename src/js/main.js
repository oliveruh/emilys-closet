// --- Event Handlers & Setup ---

const debouncedSpoolSearch = debounce((searchValue) => {
    if (currentMode === 'spoolToResult') {
         const spoolDataExtractor = (key) => ({ name: key, imageUrl: spoolItemImages[key] });
         populateGrid(spoolItemGrid, allSpoolItems, searchValue, handleSpoolItemClick, spoolDataExtractor, 'all', 'az');
        if (selectedSpoolItemElement) {
            selectedSpoolItemElement.classList.remove('selected');
            selectedSpoolItemElement = null; 
            updateSelectedSpoolDisplay(null); 
            resultDisplay.innerHTML = '<p class="empty-state-message">Select an item from the filtered grid.</p>';
            resultDisplay.classList.remove('animate-result-pulse'); 
        }
    }
}, 250); 

const debouncedClothingSearch = debounce(() => {
    if (currentMode === 'resultToSpool') {
         handleClothingFilterSortChange();
    }
}, 250); 

const debouncedDyeSearch = debounce(() => {
     if (currentMode === 'dyeing') {
        handleDyeFilterSortChange();
     }
}, 250); 


function handleClothingFilterSortChange() {
     currentClothingFilter = clothingFilterType.value;
     currentClothingSort = clothingSortOrder.value;
     const clothingDataExtractor = (key) => ({ name: getClothingDisplayName(key), imageUrl: clothingItemImages[key], type: getClothingType(key) });
     populateGrid(clothingItemGrid, sortedClothingItems, clothingSearchBar.value, handleClothingItemClick, clothingDataExtractor, currentClothingFilter, currentClothingSort);
     if (selectedClothingItemElement) {
         selectedClothingItemElement.classList.remove('selected');
         selectedClothingItemElement = null;
         resultDisplay.innerHTML = '<p class="empty-state-message">Select desired clothing from the filtered results.</p>';
         resultDisplay.classList.remove('animate-result-pulse'); 
         requiredSpoolList.innerHTML = '<li class="empty-state-message">Select desired clothing first...</li>';
     }
}

// --- Event Listeners Setup ---
function setupEventListeners() {
    // Search Input Listeners (using debounced handlers)
    spoolSearchBar.addEventListener('input', (event) => debouncedSpoolSearch(event.target.value));
    clothingSearchBar.addEventListener('input', debouncedClothingSearch);

    // Clothing Filter/Sort Listeners
    clothingFilterType.addEventListener('change', handleClothingFilterSortChange);
    clothingSortOrder.addEventListener('change', handleClothingFilterSortChange);

    // Tab Button Click Listeners
    tabSpoolToResult.addEventListener('click', () => updateUIMode('spoolToResult'));
    tabResultToSpool.addEventListener('click', () => updateUIMode('resultToSpool'));
    tabFavorites.addEventListener('click', () => updateUIMode('favorites'));

    console.log("Event listeners set up.");
}

// --- App Start ---
// Wait until the DOM is fully loaded before trying to fetch data and set up listeners.
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded. Starting application.");
    setupEventListeners(); 
    loadTailoringData(); 
});

console.log("Main module loaded."); 
