import { sendDesktopNotification } from "./sendDesktopNotifications";

interface StockItem {
  quantity: number;
  name: string;
}

interface PreviousStock {
  [key: string]: number;
}

// Check if running in Chrome extension
const isChromeExtension = typeof chrome !== "undefined" && chrome.storage;

// Load saved notification preferences
const getNotificationList = (): Promise<{ [key: string]: boolean }> => {
  if (isChromeExtension) {
    return new Promise((resolve) => {
      chrome.storage.local.get(["NOTIFY_LIST"], (result) => {
        resolve(result.NOTIFY_LIST || {});
      });
    });
  } else {
    // Fallback to localStorage for development
    try {
      const saved = localStorage.getItem("NOTIFY_LIST");
      return Promise.resolve(saved ? JSON.parse(saved) : {});
    } catch {
      return Promise.resolve({});
    }
  }
};

// Load previous stock state
const getPreviousStock = (category: string): Promise<PreviousStock> => {
  if (isChromeExtension) {
    return new Promise((resolve) => {
      chrome.storage.local.get(
        [`PREVIOUS_${category.toUpperCase()}_STOCK`],
        (result) => {
          resolve(result[`PREVIOUS_${category.toUpperCase()}_STOCK`] || {});
        }
      );
    });
  } else {
    // Fallback to localStorage for development
    try {
      const saved = localStorage.getItem(
        `PREVIOUS_${category.toUpperCase()}_STOCK`
      );
      return Promise.resolve(saved ? JSON.parse(saved) : {});
    } catch {
      return Promise.resolve({});
    }
  }
};

// Save current stock state
const saveCurrentStock = (
  category: string,
  items: StockItem[]
): Promise<void> => {
  if (isChromeExtension) {
    return new Promise((resolve, reject) => {
      const stockState: PreviousStock = {};
      items.forEach((item) => {
        stockState[item.name] = item.quantity;
      });

      chrome.storage.local.set(
        {
          [`PREVIOUS_${category.toUpperCase()}_STOCK`]: stockState,
        },
        () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        }
      );
    });
  } else {
    // Fallback to localStorage for development
    try {
      const stockState: PreviousStock = {};
      items.forEach((item) => {
        stockState[item.name] = item.quantity;
      });
      localStorage.setItem(
        `PREVIOUS_${category.toUpperCase()}_STOCK`,
        JSON.stringify(stockState)
      );
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }
};

// Check if an item is in the notification list (handles name variations)
const isItemInNotificationList = (
  itemName: string,
  notificationList: { [key: string]: boolean }
): boolean => {
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
};

// Check for restocked items and send notifications
export const checkForRestocks = async (
  category: string,
  currentItems: StockItem[]
) => {
  const notificationList = await getNotificationList();
  const previousStock = await getPreviousStock(category);

  // Collect restocked items for this category
  const restockedItems: { name: string; increase: number }[] = [];

  // Check each item for restocks
  for (const item of currentItems) {
    const previousQuantity = previousStock[item.name] || 0;
    const currentQuantity = item.quantity;
    const isInNotificationList = isItemInNotificationList(
      item.name,
      notificationList
    );
    const hasIncreased = currentQuantity > previousQuantity;

    // If quantity increased and item is in notification list
    if (hasIncreased && isInNotificationList) {
      const increase = currentQuantity - previousQuantity;
      restockedItems.push({ name: item.name, increase });
    }
  }

  // Save current state for next comparison
  await saveCurrentStock(category, currentItems);

  // Return restocked items for this category (will be handled by the main notification sender)
  return restockedItems;
};

// Global restock tracker
let globalRestockTracker: {
  seeds: { name: string; increase: number }[];
  gears: { name: string; increase: number }[];
  eggs: { name: string; increase: number }[];
} = {
  seeds: [],
  gears: [],
  eggs: [],
};

// Check for restocks and collect them globally
export const checkForRestocksAndCollect = async (
  category: string,
  currentItems: StockItem[]
) => {
  const restockedItems = await checkForRestocks(category, currentItems);

  if (restockedItems.length > 0) {
    globalRestockTracker[category as keyof typeof globalRestockTracker] =
      restockedItems;
  }
};

// Send combined notification with all restocked items
export const sendCombinedRestockNotification = async () => {
  const totalRestocked =
    globalRestockTracker.seeds.length +
    globalRestockTracker.gears.length +
    globalRestockTracker.eggs.length;

  if (totalRestocked === 0) return;

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

  try {
    await sendDesktopNotification("Grow a Garden - Stock Update!", {
      body: message.trim(),
      icon: "/icon.png",
      tag: `restock-combined-${Date.now()}`, // Unique tag to prevent duplicate notifications
    });
  } catch (error) {
    console.error("Failed to send combined notification:", error);
  }

  // Clear the tracker after sending
  globalRestockTracker = { seeds: [], gears: [], eggs: [] };
};

// Initialize stock tracking for a category
export const initializeStockTracking = async (
  category: string,
  items: StockItem[]
) => {
  await saveCurrentStock(category, items);
};
