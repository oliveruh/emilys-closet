// =============================================================================
// Main Application Entry Point
// =============================================================================

// =============================================================================
// Debounced Search Handlers
// =============================================================================

const DEBOUNCE_DELAY = 250;

/**
 * Debounced handler for spool item search.
 * Repopulates the grid and clears selection when search changes.
 */
const debouncedSpoolSearch = debounce((searchValue) => {
    if (currentMode !== 'spoolToResult') {
        return;
    }

    const spoolDataExtractor = (key) => ({
        name: key,
        imageUrl: spoolItemImages[key]
    });

    populateGrid(
        spoolItemGrid,
        allSpoolItems,
        searchValue,
        handleSpoolItemClick,
        spoolDataExtractor,
        'all',
        'az'
    );

    // Clear selection when search changes
    if (selectedSpoolItemElement) {
        selectedSpoolItemElement.classList.remove('selected');
        selectedSpoolItemElement = null;
        updateSelectedSpoolDisplay(null);
        resultDisplay.innerHTML = '<p class="empty-state-message">Select an item from the filtered grid.</p>';
        resultDisplay.classList.remove('animate-result-pulse');
    }
}, DEBOUNCE_DELAY);

/**
 * Debounced handler for clothing item search.
 */
const debouncedClothingSearch = debounce(() => {
    if (currentMode === 'resultToSpool') {
        handleClothingFilterSortChange();
    }
}, DEBOUNCE_DELAY);

/**
 * Debounced handler for dye item search (reserved for future use).
 */
const debouncedDyeSearch = debounce(() => {
    if (currentMode === 'dyeing') {
        handleDyeFilterSortChange();
    }
}, DEBOUNCE_DELAY);

// =============================================================================
// Filter and Sort Handlers
// =============================================================================

/**
 * Handles changes to clothing filter or sort controls.
 * Repopulates the grid and clears selection.
 */
function handleClothingFilterSortChange() {
    currentClothingFilter = clothingFilterType.value;
    currentClothingSort = clothingSortOrder.value;

    const clothingDataExtractor = (key) => ({
        name: getClothingDisplayName(key),
        imageUrl: clothingItemImages[key],
        type: getClothingType(key)
    });

    populateGrid(
        clothingItemGrid,
        sortedClothingItems,
        clothingSearchBar.value,
        handleClothingItemClick,
        clothingDataExtractor,
        currentClothingFilter,
        currentClothingSort
    );

    // Clear selection when filters change
    if (selectedClothingItemElement) {
        selectedClothingItemElement.classList.remove('selected');
        selectedClothingItemElement = null;
        resultDisplay.innerHTML = '<p class="empty-state-message">Select desired clothing from the filtered results.</p>';
        resultDisplay.classList.remove('animate-result-pulse');
        requiredSpoolList.innerHTML = '<li class="empty-state-message">Select desired clothing first...</li>';
    }
}

// =============================================================================
// Event Listeners Setup
// =============================================================================

/**
 * Sets up all event listeners for the application.
 */
function setupEventListeners() {
    // Search input listeners
    spoolSearchBar.addEventListener('input', (e) => debouncedSpoolSearch(e.target.value));
    clothingSearchBar.addEventListener('input', debouncedClothingSearch);

    // Filter and sort listeners
    clothingFilterType.addEventListener('change', handleClothingFilterSortChange);
    clothingSortOrder.addEventListener('change', handleClothingFilterSortChange);

    // Tab navigation listeners
    tabSpoolToResult.addEventListener('click', () => updateUIMode('spoolToResult'));
    tabResultToSpool.addEventListener('click', () => updateUIMode('resultToSpool'));
    tabFavorites.addEventListener('click', () => updateUIMode('favorites'));

    console.log('Event listeners set up.');
}

// =============================================================================
// Application Bootstrap
// =============================================================================

/**
 * Initializes the application when DOM is ready.
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded. Starting application.');
    setupEventListeners();
    loadTailoringData();
});

console.log('Main module loaded.'); 
