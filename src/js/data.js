// --- Data Fetching and Processing ---

/**
 * Fetches data from the three JSON files (clothing, spool, dye).
 * Processes the data and initializes the application UI upon success.
 */
async function loadTailoringData() {
    console.log(`Fetching DATA from: ${CLOTHING_DATA_URL}, ${SPOOL_DATA_URL}, ${DYE_DATA_URL}`);

    loadingIndicator.style.display = 'flex';
    gameCard.classList.add('hidden');

    try {
        const [clothingResponse, spoolResponse, dyeResponse] = await Promise.all([
            fetch(CLOTHING_DATA_URL),
            fetch(SPOOL_DATA_URL),
            fetch(DYE_DATA_URL)
        ]);

        // Check if requests were successful
        if (!clothingResponse.ok) throw new Error(`HTTP error! Status: ${clothingResponse.status} - Could not fetch ${CLOTHING_DATA_URL}`);
        if (!spoolResponse.ok) throw new Error(`HTTP error! Status: ${spoolResponse.status} - Could not fetch ${SPOOL_DATA_URL}`);
        if (!dyeResponse.ok) throw new Error(`HTTP error! Status: ${dyeResponse.status} - Could not fetch ${DYE_DATA_URL}`);

        // Parse the JSON
        const clothingJson = await clothingResponse.json();
        const spoolJson = await spoolResponse.json();
        const dyeJson = await dyeResponse.json();

        console.log("All DATA fetched successfully.");

        // Process the fetched JSON data 
        processJsonData(clothingJson, spoolJson, dyeJson);

        // Load user's favorites from localStorage
        loadFavorites();

        // Initialize the main application UI
        initializeAppUI();

    } catch (error) {
        console.error("Failed to load or process DATA:", error);

        loadingIndicator.innerHTML = `
            <span>Error loading DATA.</span>
            <br>
            <span>Please check file paths or try refreshing.</span>
            <p style="font-size: 0.8rem; margin-top: 10px; color: #6b3e23;">(${error.message})</p>`;

        loadingIndicator.style.display = 'flex';

        gameCard.classList.add('hidden');
    }
}

/**
 * Processes the raw JSON data from the three files into structured maps and arrays
 * stored in the global variables defined in `state.js`.
 * @param {object} clothingData - Raw data from clothing_items.json (by cloth_id).
 * @param {object} spoolData - Raw data from spool_items.json (by spool_id).
 * @param {object} dyeData - Raw data from dye_info.json (by dye_id).
 */
function processJsonData(clothingData, spoolData, dyeData) {
    // Store raw data
    allClothingData = clothingData;
    allSpoolData = spoolData;
    allDyeData = dyeData;

    tailoringRecipes = {};
    clothingToSpoolMap = {};
    spoolItemImages = {};
    clothingItemImages = {};
    clothingTypes.clear(); 
    dyeItems = []; 
    dyeColors.clear(); 
    const uniqueClothingItems = new Set(); 
    const uniqueSpoolItems = new Set(); 

    // --- Process Clothing Items and Recipes ---
    console.log("Processing clothing data...");
    for (const clothId in allClothingData) {
        const clothingItem = allClothingData[clothId];

        if (!clothingItem || !clothingItem.name || !clothingItem.type) {
            console.warn(`Skipping invalid clothing item with ID ${clothId}: Missing name or type.`);
            continue; 
        }

        // Formatting the clothing item name and type
        const itemTypeCapitalized = clothingItem.type.charAt(0).toUpperCase() + clothingItem.type.slice(1);
        const clothingKey = `${clothingItem.name} [${itemTypeCapitalized}]`;

        // Store unique clothing key, type, and image URL
        uniqueClothingItems.add(clothingKey);
        clothingTypes.add(itemTypeCapitalized);
        clothingItemImages[clothingKey] = getPrimaryImageUrl(clothingItem.imageUrl); 

        // Initialize the list of required spool items for this clothing item
        clothingToSpoolMap[clothingKey] = [];

        // Process the required spool items for this clothing item
        if (clothingItem.requiredSpoolIds && Array.isArray(clothingItem.requiredSpoolIds)) {
            clothingItem.requiredSpoolIds.forEach(spoolId => {
                const spoolItem = allSpoolData[spoolId];

                if (!spoolItem || !spoolItem.name) {
                    console.warn(`Item with ID ${spoolId} required by ${clothingKey} not found or invalid in spool_items.json.`);
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

                if (spoolName !== "Prismatic Shard") {

                    if (tailoringRecipes[spoolName] && tailoringRecipes[spoolName].resultName !== clothingItem.name) {
                        console.warn(`Spool item '${spoolName}' maps to multiple clothing items ('${tailoringRecipes[spoolName].resultName}' and '${clothingItem.name}'). Overwriting with the latter.`);
                    }

                    tailoringRecipes[spoolName] = {
                        type: itemTypeCapitalized,
                        resultName: clothingItem.name,
                        description: clothingItem.description || "No description available.",
                        dyeable: clothingItem.dyeable, 
                        specialNotes: clothingItem.notes, 
                        resultImage: clothingItemImages[clothingKey] 
                    };
                }
            });
        }
    }

    // --- Process Spool Items for Dye Info ---
    console.log("Processing spool and dye data...");
    for (const spoolId in allSpoolData) {
        const spoolItem = allSpoolData[spoolId];
        if (!spoolItem || !spoolItem.name) continue; // Skip if invalid

        const spoolName = spoolItem.name;
        const spoolImageUrl = getPrimaryImageUrl(spoolItem.imageUrl);
        uniqueSpoolItems.add(spoolName); 

        if (!spoolItemImages[spoolName]) {
            spoolItemImages[spoolName] = spoolImageUrl;
        }

        if (spoolItem.dyeInfoId) {
            const dyeInfo = allDyeData[spoolItem.dyeInfoId];

            if (dyeInfo && dyeInfo.colorName && dyeInfo.rgbCode) {
                dyeItems.push({
                    name: spoolName,
                    image_url: spoolImageUrl,
                    color_name: dyeInfo.colorName,
                    rgb_code: dyeInfo.rgbCode,
                    dye_strength: dyeInfo.strength ? dyeInfo.strength.toLowerCase() : "unknown"
                });
                dyeColors.add(dyeInfo.colorName); 
            } else {
                console.warn(`Dye info with ID ${spoolItem.dyeInfoId} referenced by item '${spoolName}' not found or invalid in dye_info.json.`);
            }
        }
    }

    sortedClothingItems = Array.from(uniqueClothingItems).sort((a, b) => a.localeCompare(b));
    allSpoolItems = Array.from(uniqueSpoolItems).sort((a, b) => a.localeCompare(b));

    populateClothingTypeFilter();

    console.log(`Data processed: ${sortedClothingItems.length} clothing items, ${allSpoolItems.length} spool items, ${dyeItems.length} dye items.`);
}


/** Populates the clothing type filter dropdown based on processed data. */
function populateClothingTypeFilter() {
    while (clothingFilterType.options.length > 1) {
        clothingFilterType.remove(1);
    }

    const sortedTypes = Array.from(clothingTypes).sort();

    sortedTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type; 
        option.textContent = type; 
        clothingFilterType.appendChild(option);
    });
    console.log("Clothing type filter populated.");
}

console.log("Data module loaded."); 
