// =============================================================================
// Display Module - Result Display Functions
// =============================================================================

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

console.log("Display module loaded.");
