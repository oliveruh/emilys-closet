// =============================================================================
// Application State Management
// =============================================================================

// -----------------------------------------------------------------------------
// Raw Data Storage (loaded from JSON files)
// -----------------------------------------------------------------------------
let allClothingData = {};
let allSpoolData = {};
let allDyeData = {};

// -----------------------------------------------------------------------------
// Processed Data Structures
// -----------------------------------------------------------------------------
let tailoringRecipes = {};
let clothingToSpoolMap = {};
let sortedClothingItems = [];
let allSpoolItems = [];
let spoolItemImages = {};
let clothingItemImages = {};
let clothingTypes = new Set();
let favorites = [];
let dyeItems = [];
let dyeColors = new Set();

// -----------------------------------------------------------------------------
// DOM Element References (cached for performance)
// -----------------------------------------------------------------------------
const DOM = {
    // Main containers
    loadingIndicator: document.getElementById('loading-indicator'),
    gameCard: document.querySelector('.game-card'),

    // Layout columns (mode-specific)
    columns: {
        leftMode1: document.getElementById('left-col-mode1'),
        leftMode2: document.getElementById('left-col-mode2'),
        rightMode1: document.getElementById('right-col-mode1'),
        rightMode2: document.getElementById('right-col-mode2')
    },

    // Display areas
    displays: {
        selectedSpool: document.getElementById('selected-spool-display'),
        result: document.getElementById('result-display'),
        featured: document.getElementById('featured-combinations'),
        favorites: document.getElementById('favorites-panel')
    },

    // Item grids
    grids: {
        spool: document.getElementById('spool-item-grid'),
        clothing: document.getElementById('clothing-item-grid'),
        dye: document.getElementById('dye-items-grid'),
        requiredSpool: document.getElementById('required-spool-list')
    },

    // Content sections
    content: {
        main: document.getElementById('main-content-area'),
        simulator: document.getElementById('tailoring-simulator-content'),
        favorites: document.getElementById('favorites-content'),
        dyeing: document.getElementById('dyeing-info-content')
    },

    // Tab buttons
    tabs: {
        spoolToResult: document.getElementById('tab-spool-to-result'),
        resultToSpool: document.getElementById('tab-result-to-spool'),
        favorites: document.getElementById('tab-favorites'),
        dyeingInfo: document.getElementById('tab-dyeing-info')
    },

    // Search and filter inputs
    inputs: {
        spoolSearch: document.getElementById('spool-search-bar'),
        clothingSearch: document.getElementById('clothing-search-bar'),
        clothingFilter: document.getElementById('clothing-filter-type'),
        clothingSort: document.getElementById('clothing-sort-order')
    }
};

// Legacy DOM element aliases for backward compatibility
const loadingIndicator = DOM.loadingIndicator;
const gameCard = DOM.gameCard;
const leftColMode1 = DOM.columns.leftMode1;
const leftColMode2 = DOM.columns.leftMode2;
const rightColMode1 = DOM.columns.rightMode1;
const rightColMode2 = DOM.columns.rightMode2;
const selectedSpoolDisplay = DOM.displays.selectedSpool;
const spoolItemGrid = DOM.grids.spool;
const clothingItemGrid = DOM.grids.clothing;
const resultDisplay = DOM.displays.result;
const requiredSpoolList = DOM.grids.requiredSpool;
const featuredContainer = DOM.displays.featured;
const favoritesPanel = DOM.displays.favorites;
const dyeItemsGrid = DOM.grids.dye;
const mainContentArea = DOM.content.main;
const simulatorContent = DOM.content.simulator;
const favoritesContent = DOM.content.favorites;
const dyeingInfoContent = DOM.content.dyeing;
const tabSpoolToResult = DOM.tabs.spoolToResult;
const tabResultToSpool = DOM.tabs.resultToSpool;
const tabFavorites = DOM.tabs.favorites;
const tabDyeingInfo = DOM.tabs.dyeingInfo;
const spoolSearchBar = DOM.inputs.spoolSearch;
const clothingSearchBar = DOM.inputs.clothingSearch;
const clothingFilterType = DOM.inputs.clothingFilter;
const clothingSortOrder = DOM.inputs.clothingSort;

// -----------------------------------------------------------------------------
// UI State Variables
// -----------------------------------------------------------------------------
let selectedSpoolItemElement = null;
let selectedClothingItemElement = null;
let currentMode = 'spoolToResult';
let currentClothingFilter = 'all';
let currentClothingSort = 'az';
let currentDyeSearch = '';
let currentDyeColor = 'all';
let currentDyeStrength = 'all';
let currentDyeSort = 'az';

console.log('State initialized.'); 
