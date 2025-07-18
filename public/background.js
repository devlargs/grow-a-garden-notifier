// Background service worker for Grow a Garden Stock Notifications

// API endpoints
const API_ENDPOINTS = {
  seeds: "https://gagapi.onrender.com/seeds",
  gears: "https://gagapi.onrender.com/gear",
  eggs: "https://gagapi.onrender.com/eggs",
};

// Stock data cache
let stockCache = {
  seeds: {},
  gears: {},
  eggs: {},
};

// Initialize the extension
chrome.runtime.onInstalled.addListener(() => {
  console.log("Grow a Garden Stock Notifications extension installed");

  // Set up alarms for periodic checks
  chrome.alarms.create("checkSeeds", { periodInMinutes: 5 }); // Seeds update every 5 minutes
  chrome.alarms.create("checkGears", { periodInMinutes: 5 }); // Gears update every 5 minutes
  chrome.alarms.create("checkEggs", { periodInMinutes: 30 }); // Eggs update every 30 minutes

  // Initial fetch
  fetchAllStock();
});

// Handle alarm events
chrome.alarms.onAlarm.addListener((alarm) => {
  console.log("Alarm triggered:", alarm.name);

  switch (alarm.name) {
    case "checkSeeds":
      fetchStock("seeds");
      break;
    case "checkGears":
      fetchStock("gears");
      break;
    case "checkEggs":
      fetchStock("eggs");
      break;
  }
});

// Fetch all stock data
async function fetchAllStock() {
  await Promise.all([
    fetchStock("seeds"),
    fetchStock("gears"),
    fetchStock("eggs"),
  ]);
}

// Fetch stock data for a specific category
async function fetchStock(category) {
  try {
    console.log(`Fetching ${category} stock...`);

    const response = await fetch(API_ENDPOINTS[category]);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const currentStock = await response.json();
    const previousStock = stockCache[category] || {};

    // Check for restocks
    checkForRestocks(category, currentStock, previousStock);

    // Update cache
    stockCache[category] = {};
    currentStock.forEach((item) => {
      stockCache[category][item.name] = item.quantity;
    });

    console.log(`${category} stock updated:`, currentStock);
  } catch (error) {
    console.error(`Error fetching ${category} stock:`, error);
  }
}

// Check for restocked items and send notifications
function checkForRestocks(category, currentStock, previousStock) {
  // Get notification preferences from storage
  chrome.storage.local.get(["NOTIFY_LIST"], (result) => {
    const notificationList = result.NOTIFY_LIST || {};

    currentStock.forEach((item) => {
      const previousQuantity = previousStock[item.name] || 0;
      const currentQuantity = item.quantity;

      // Check if quantity increased and item is in notification list
      if (
        currentQuantity > previousQuantity &&
        isItemInNotificationList(item.name, notificationList)
      ) {
        const increase = currentQuantity - previousQuantity;
        const itemName = item.name.includes("Seeds")
          ? item.name
          : `${item.name} Seeds`;

        console.log(`Restock detected: ${itemName} +${increase}`);

        // Send notification
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icon.png",
          title: "Item Restocked!",
          message: `${itemName} has been restocked! +${increase} available.`,
          priority: 1,
        });
      }
    });
  });
}

// Check if an item is in the notification list (handles name variations)
function isItemInNotificationList(itemName, notificationList) {
  // Direct match
  if (notificationList[itemName]) {
    return true;
  }

  // For seeds, check both with and without "Seeds" suffix
  if (itemName.includes("Seeds")) {
    const baseName = itemName.replace(" Seeds", "");
    return notificationList[baseName] || false;
  } else {
    // Check if the item name with "Seeds" suffix is in the list
    return notificationList[`${itemName} Seeds`] || false;
  }
}

// Handle notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
  // Focus the extension popup when notification is clicked
  chrome.action.openPopup();
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getStockData") {
    sendResponse(stockCache);
  } else if (request.action === "forceCheck") {
    fetchAllStock();
    sendResponse({ success: true });
  }
});

// Keep service worker alive
chrome.runtime.onStartup.addListener(() => {
  console.log("Extension started");
  fetchAllStock();
});
