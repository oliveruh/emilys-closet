// =============================================================================
// Featured Module - Featured Combinations Display
// =============================================================================

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

console.log("Featured module loaded.");
