// =============================================================================
// Mode Module - UI Mode Management
// =============================================================================

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

console.log("Mode module loaded.");
