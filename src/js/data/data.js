// =============================================================================
// Data Fetching and Processing
// =============================================================================

/**
 * Fetches all tailoring data from JSON files and initializes the application.
 */
async function loadTailoringData() {
    console.log(`Fetching data from: ${CLOTHING_DATA_URL}, ${SPOOL_DATA_URL}, ${DYE_DATA_URL}`);

    showLoadingState();

    try {
        const [clothingData, spoolData, dyeData] = await fetchAllData();
        
        console.log('All data fetched successfully.');

        processJsonData(clothingData, spoolData, dyeData);
        loadFavorites();
        initializeAppUI();

    } catch (error) {
        console.error('Failed to load or process data:', error);
        showErrorState(error.message);
    }
}

/**
 * Shows the loading indicator and hides the main content.
 */
function showLoadingState() {
    loadingIndicator.style.display = 'flex';
    gameCard.classList.add('hidden');
}

/**
 * Shows an error message in the loading indicator.
 * @param {string} errorMessage - The error message to display
 */
function showErrorState(errorMessage) {
    loadingIndicator.innerHTML = `
        <span>Error loading data.</span>
        <br>
        <span>Please check file paths or try refreshing.</span>
        <p style="font-size: 0.8rem; margin-top: 10px; color: #6b3e23;">(${errorMessage})</p>`;
    loadingIndicator.style.display = 'flex';
    gameCard.classList.add('hidden');
}

/**
 * Fetches all data files in parallel.
 * @returns {Promise<[Object, Object, Object]>} Array of [clothing, spool, dye] data
 * @throws {Error} If any fetch fails
 */
async function fetchAllData() {
    const [clothingResponse, spoolResponse, dyeResponse] = await Promise.all([
        fetch(CLOTHING_DATA_URL),
        fetch(SPOOL_DATA_URL),
        fetch(DYE_DATA_URL)
    ]);

    validateResponse(clothingResponse, CLOTHING_DATA_URL);
    validateResponse(spoolResponse, SPOOL_DATA_URL);
    validateResponse(dyeResponse, DYE_DATA_URL);

    return Promise.all([
        clothingResponse.json(),
        spoolResponse.json(),
        dyeResponse.json()
    ]);
}

/**
 * Validates a fetch response.
 * @param {Response} response - The fetch response
 * @param {string} url - The URL that was fetched
 * @throws {Error} If response is not ok
 */
function validateResponse(response, url) {
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status} - Could not fetch ${url}`);
    }
}

/**
 * Processes raw JSON data into structured maps and arrays for the application.
 * @param {Object} clothingData - Raw clothing data from JSON
 * @param {Object} spoolData - Raw spool data from JSON
 * @param {Object} dyeData - Raw dye data from JSON
 */
function processJsonData(clothingData, spoolData, dyeData) {
    // Store raw data
    allClothingData = clothingData;
    allSpoolData = spoolData;
    allDyeData = dyeData;

    // Reset processed structures
    resetProcessedData();

    // Track unique items
    const uniqueClothingItems = new Set();
    const uniqueSpoolItems = new Set();

    // Process clothing and recipes
    console.log('Processing clothing data...');
    processClothingData(uniqueClothingItems, uniqueSpoolItems);

    // Process spool items and dye info
    console.log('Processing spool and dye data...');
    processSpoolAndDyeData(uniqueSpoolItems);

    // Create sorted arrays
    sortedClothingItems = Array.from(uniqueClothingItems).sort((a, b) => a.localeCompare(b));
    allSpoolItems = Array.from(uniqueSpoolItems).sort((a, b) => a.localeCompare(b));

    populateClothingTypeFilter();

    console.log(`Data processed: ${sortedClothingItems.length} clothing items, ${allSpoolItems.length} spool items, ${dyeItems.length} dye items.`);
}

/**
 * Resets all processed data structures to empty state.
 */
function resetProcessedData() {
    tailoringRecipes = {};
    clothingToSpoolMap = {};
    spoolItemImages = {};
    clothingItemImages = {};
    clothingTypes.clear();
    dyeItems = [];
    dyeColors.clear();
}

/**
 * Processes clothing data and builds recipe mappings.
 * @param {Set} uniqueClothingItems - Set to track unique clothing items
 * @param {Set} uniqueSpoolItems - Set to track unique spool items
 */
function processClothingData(uniqueClothingItems, uniqueSpoolItems) {
    for (const clothId in allClothingData) {
        const clothingItem = allClothingData[clothId];

        if (!isValidClothingItem(clothingItem)) {
            console.warn(`Skipping invalid clothing item with ID ${clothId}: Missing name or type.`);
            continue;
        }

        const itemType = capitalizeFirst(clothingItem.type);
        const clothingKey = `${clothingItem.name} [${itemType}]`;

        // Store clothing metadata
        uniqueClothingItems.add(clothingKey);
        clothingTypes.add(itemType);
        clothingItemImages[clothingKey] = getPrimaryImageUrl(clothingItem.imageUrl);
        clothingToSpoolMap[clothingKey] = [];

        // Process required spool items
        if (Array.isArray(clothingItem.requiredSpoolIds)) {
            processRequiredSpools(clothingItem, clothingKey, itemType, uniqueSpoolItems);
        }
    }
}

/**
 * Validates that a clothing item has required fields.
 * @param {Object} item - The clothing item to validate
 * @returns {boolean} True if valid
 */
function isValidClothingItem(item) {
    return item && item.name && item.type;
}

/**
 * Capitalizes the first letter of a string.
 * @param {string} str - The string to capitalize
 * @returns {string} Capitalized string
 */
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Processes required spool items for a clothing item.
 * @param {Object} clothingItem - The clothing item data
 * @param {string} clothingKey - The clothing item key
 * @param {string} itemType - The capitalized item type
 * @param {Set} uniqueSpoolItems - Set to track unique spool items
 */
function processRequiredSpools(clothingItem, clothingKey, itemType, uniqueSpoolItems) {
    clothingItem.requiredSpoolIds.forEach(spoolId => {
        const spoolItem = allSpoolData[spoolId];

        if (!spoolItem || !spoolItem.name) {
            console.warn(`Item with ID ${spoolId} required by ${clothingKey} not found in spool_items.json.`);
            return;
        }

        const spoolName = spoolItem.name;
        const spoolImageUrl = getPrimaryImageUrl(spoolItem.imageUrl);

        uniqueSpoolItems.add(spoolName);

        if (!spoolItemImages[spoolName]) {
            spoolItemImages[spoolName] = spoolImageUrl;
        }

        if (!clothingToSpoolMap[clothingKey].includes(spoolName)) {
            clothingToSpoolMap[clothingKey].push(spoolName);
        }

        // Create recipe mapping (skip Prismatic Shard as it's random)
        if (spoolName !== 'Prismatic Shard') {
            createRecipeMapping(spoolName, clothingItem, clothingKey, itemType);
        }
    });
}

/**
 * Creates a tailoring recipe mapping for a spool item.
 * @param {string} spoolName - The spool item name
 * @param {Object} clothingItem - The clothing item data
 * @param {string} clothingKey - The clothing item key
 * @param {string} itemType - The capitalized item type
 */
function createRecipeMapping(spoolName, clothingItem, clothingKey, itemType) {
    if (tailoringRecipes[spoolName] && tailoringRecipes[spoolName].resultName !== clothingItem.name) {
        console.warn(`Spool item '${spoolName}' maps to multiple clothing items. Overwriting '${tailoringRecipes[spoolName].resultName}' with '${clothingItem.name}'.`);
    }

    tailoringRecipes[spoolName] = {
        type: itemType,
        resultName: clothingItem.name,
        description: clothingItem.description || 'No description available.',
        dyeable: clothingItem.dyeable,
        specialNotes: clothingItem.notes,
        resultImage: clothingItemImages[clothingKey]
    };
}

/**
 * Processes spool items and extracts dye information.
 * @param {Set} uniqueSpoolItems - Set to track unique spool items
 */
function processSpoolAndDyeData(uniqueSpoolItems) {
    for (const spoolId in allSpoolData) {
        const spoolItem = allSpoolData[spoolId];

        if (!spoolItem || !spoolItem.name) {
            continue;
        }

        const spoolName = spoolItem.name;
        const spoolImageUrl = getPrimaryImageUrl(spoolItem.imageUrl);

        uniqueSpoolItems.add(spoolName);

        if (!spoolItemImages[spoolName]) {
            spoolItemImages[spoolName] = spoolImageUrl;
        }

        // Process dye info if present
        if (spoolItem.dyeInfoId) {
            processDyeInfo(spoolName, spoolImageUrl, spoolItem.dyeInfoId);
        }
    }
}

/**
 * Processes dye information for a spool item.
 * @param {string} spoolName - The spool item name
 * @param {string} spoolImageUrl - The spool item image URL
 * @param {string} dyeInfoId - The dye info ID to look up
 */
function processDyeInfo(spoolName, spoolImageUrl, dyeInfoId) {
    const dyeInfo = allDyeData[dyeInfoId];

    if (!dyeInfo || !dyeInfo.colorName || !dyeInfo.rgbCode) {
        console.warn(`Dye info with ID '${dyeInfoId}' for item '${spoolName}' not found or invalid in dye_info.json.`);
        return;
    }

    dyeItems.push({
        name: spoolName,
        image_url: spoolImageUrl,
        color_name: dyeInfo.colorName,
        rgb_code: dyeInfo.rgbCode,
        dye_strength: dyeInfo.strength ? dyeInfo.strength.toLowerCase() : 'unknown'
    });

    dyeColors.add(dyeInfo.colorName);
}

/**
 * Populates the clothing type filter dropdown with available types.
 */
function populateClothingTypeFilter() {
    // Remove existing options except the first (All Types)
    while (clothingFilterType.options.length > 1) {
        clothingFilterType.remove(1);
    }

    // Add sorted type options
    const sortedTypes = Array.from(clothingTypes).sort();

    sortedTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        clothingFilterType.appendChild(option);
    });

    console.log('Clothing type filter populated.');
}

console.log('Data module loaded.'); 
