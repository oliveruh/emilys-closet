// --- Global Data Variables ---
// These variables store the processed data used throughout the application.

// Raw data loaded from JSON files
let allClothingData = {}; // Stores raw clothing data by cloth_id
let allSpoolData = {};    // Stores raw spool data by spool_id
let allDyeData = {};      // Stores raw dye info by dye_id

// Processed data structures for easier access
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

// --- DOM Elements ---
// Cache frequently accessed DOM elements for performance.
const loadingIndicator = document.getElementById('loading-indicator');
const gameCard = document.querySelector('.game-card');

// Columns & Modes Containers
const leftColMode1 = document.getElementById('left-col-mode1');
const leftColMode2 = document.getElementById('left-col-mode2');
const rightColMode1 = document.getElementById('right-col-mode1');
const rightColMode2 = document.getElementById('right-col-mode2');

// Display Areas for items and results
const selectedSpoolDisplay = document.getElementById('selected-spool-display');
const spoolItemGrid = document.getElementById('spool-item-grid');
const clothingItemGrid = document.getElementById('clothing-item-grid');
const resultDisplay = document.getElementById('result-display');
const requiredSpoolList = document.getElementById('required-spool-list');
const featuredContainer = document.getElementById('featured-combinations');
const favoritesPanel = document.getElementById('favorites-panel');
const dyeItemsGrid = document.getElementById('dye-items-grid');

// Main Content Area Containers
const mainContentArea = document.getElementById('main-content-area');
const simulatorContent = document.getElementById('tailoring-simulator-content');
const favoritesContent = document.getElementById('favorites-content');
const dyeingInfoContent = document.getElementById('dyeing-info-content');

// Tab Buttons
const tabSpoolToResult = document.getElementById('tab-spool-to-result');
const tabResultToSpool = document.getElementById('tab-result-to-spool');
const tabFavorites = document.getElementById('tab-favorites');
const tabDyeingInfo = document.getElementById('tab-dyeing-info');

// Search & Filter Input Elements
const spoolSearchBar = document.getElementById('spool-search-bar');
const clothingSearchBar = document.getElementById('clothing-search-bar');
const clothingFilterType = document.getElementById('clothing-filter-type');
const clothingSortOrder = document.getElementById('clothing-sort-order');

// --- State Variables ---
// These variables track the current state of the UI (selections, filters, mode).
let selectedSpoolItemElement = null; 
let selectedClothingItemElement = null;
let currentMode = 'spoolToResult'; 
let currentClothingFilter = 'all';
let currentClothingSort = 'az';
let currentDyeSearch = ''; 
let currentDyeColor = 'all';
let currentDyeStrength = 'all';
let currentDyeSort = 'az';

console.log("State initialized."); 
