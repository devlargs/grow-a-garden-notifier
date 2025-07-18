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
      const itemName = item.name.includes("Seeds")
        ? item.name
        : `${item.name} Seeds`;

      try {
        await sendDesktopNotification("Item Restocked!", {
          body: `${itemName} has been restocked! +${increase} available.`,
          icon: "/icon.png",
          tag: `restock-${item.name}-${Date.now()}`, // Unique tag to prevent duplicate notifications
        });
      } catch (error) {}
    }
  }

  // Save current state for next comparison
  await saveCurrentStock(category, currentItems);
};

// Initialize stock tracking for a category
export const initializeStockTracking = async (
  category: string,
  items: StockItem[]
) => {
  await saveCurrentStock(category, items);
};
