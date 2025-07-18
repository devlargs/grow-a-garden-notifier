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

// Global restock tracker
let globalRestockTracker = {
  seeds: [],
  gears: [],
  eggs: [],
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

    // Send combined notification if there are restocked items
    setTimeout(() => {
      sendCombinedRestockNotification();
    }, 1000); // Small delay to ensure all categories are processed
  } catch (error) {
    console.error(`Error fetching ${category} stock:`, error);
  }
}

// Fetch all stock data
async function fetchAllStock() {
  console.log("Fetching all stock data...");

  // Clear the tracker before fetching
  globalRestockTracker = { seeds: [], gears: [], eggs: [] };

  await Promise.all([
    fetchStock("seeds"),
    fetchStock("gears"),
    fetchStock("eggs"),
  ]);

  // Send combined notification after all categories are checked
  setTimeout(() => {
    sendCombinedRestockNotification();
  }, 2000);
}

// Check for restocked items and collect them
function checkForRestocks(category, currentStock, previousStock) {
  // Get notification preferences from storage
  chrome.storage.local.get(["NOTIFY_LIST"], (result) => {
    const notificationList = result.NOTIFY_LIST || {};

    // Collect restocked items for this category
    const restockedItems = [];

    currentStock.forEach((item) => {
      const previousQuantity = previousStock[item.name] || 0;
      const currentQuantity = item.quantity;

      // Check if quantity increased and item is in notification list
      if (
        currentQuantity > previousQuantity &&
        isItemInNotificationList(item.name, notificationList)
      ) {
        const increase = currentQuantity - previousQuantity;
        restockedItems.push({ name: item.name, increase });
        console.log(`Restock detected: ${item.name} +${increase}`);
      }
    });

    // Add to global tracker if there are restocked items
    if (restockedItems.length > 0) {
      globalRestockTracker[category] = restockedItems;
      console.log(
        `Added ${restockedItems.length} restocked items to ${category} tracker`
      );
    }
  });
}

// Send combined notification with all restocked items
function sendCombinedRestockNotification() {
  const totalRestocked =
    globalRestockTracker.seeds.length +
    globalRestockTracker.gears.length +
    globalRestockTracker.eggs.length;

  if (totalRestocked === 0) {
    console.log("No restocked items to notify about");
    return;
  }

  console.log(
    `Sending combined notification for ${totalRestocked} restocked items`
  );

  // Build notification message
  let message = "Items have been restocked!\n\n";

  if (globalRestockTracker.seeds.length > 0) {
    message += "🌱 Restocked Seeds:\n";
    globalRestockTracker.seeds.forEach((item) => {
      const itemName = item.name.includes("Seeds")
        ? item.name
        : `${item.name} Seeds`;
      message += `  • ${itemName} (+${item.increase})\n`;
    });
    message += "\n";
  }

  if (globalRestockTracker.gears.length > 0) {
    message += "🔧 Restocked Gears:\n";
    globalRestockTracker.gears.forEach((item) => {
      message += `  • ${item.name} (+${item.increase})\n`;
    });
    message += "\n";
  }

  if (globalRestockTracker.eggs.length > 0) {
    message += "🥚 Restocked Eggs:\n";
    globalRestockTracker.eggs.forEach((item) => {
      message += `  • ${item.name} (+${item.increase})\n`;
    });
  }

  // Send notification
  chrome.notifications.create(
    {
      type: "basic",
      iconUrl: "icon.png",
      title: "Grow a Garden - Stock Update!",
      message: message.trim(),
      priority: 1,
    },
    (notificationId) => {
      if (chrome.runtime.lastError) {
        console.error(
          "Failed to create notification:",
          chrome.runtime.lastError
        );
      } else {
        console.log("Combined notification sent successfully:", notificationId);
      }
    }
  );

  // Clear the tracker after sending
  globalRestockTracker = { seeds: [], gears: [], eggs: [] };
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

// Note: Notifications are sent when restocks are detected, not periodically
