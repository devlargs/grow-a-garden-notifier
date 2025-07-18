import { sendDesktopNotification } from "./sendDesktopNotifications";

interface StockItem {
  quantity: number;
  name: string;
}

interface PreviousStock {
  [key: string]: number;
}

// Load saved notification preferences
const getNotificationList = (): { [key: string]: boolean } => {
  try {
    const saved = localStorage.getItem("NOTIFY_LIST");
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

// Load previous stock state
const getPreviousStock = (category: string): PreviousStock => {
  try {
    const saved = localStorage.getItem(
      `PREVIOUS_${category.toUpperCase()}_STOCK`
    );
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

// Save current stock state
const saveCurrentStock = (category: string, items: StockItem[]) => {
  try {
    const stockState: PreviousStock = {};
    items.forEach((item) => {
      stockState[item.name] = item.quantity;
    });
    localStorage.setItem(
      `PREVIOUS_${category.toUpperCase()}_STOCK`,
      JSON.stringify(stockState)
    );
  } catch (error) {
    console.error(`Failed to save ${category} stock state:`, error);
  }
};

// Check for restocked items and send notifications
export const checkForRestocks = (
  category: string,
  currentItems: StockItem[]
) => {
  const notificationList = getNotificationList();
  const previousStock = getPreviousStock(category);

  // Check each item for restocks
  currentItems.forEach((item) => {
    const previousQuantity = previousStock[item.name] || 0;
    const currentQuantity = item.quantity;

    // If quantity increased and item is in notification list
    if (currentQuantity > previousQuantity && notificationList[item.name]) {
      const increase = currentQuantity - previousQuantity;
      const itemName = item.name.includes("Seeds")
        ? item.name
        : `${item.name} Seeds`;

      sendDesktopNotification("Item Restocked!", {
        body: `${itemName} has been restocked! +${increase} available.`,
        icon: "/icon.png",
        tag: `restock-${item.name}-${Date.now()}`, // Unique tag to prevent duplicate notifications
      });
    }
  });

  // Save current state for next comparison
  saveCurrentStock(category, currentItems);
};

// Initialize stock tracking for a category
export const initializeStockTracking = (
  category: string,
  items: StockItem[]
) => {
  saveCurrentStock(category, items);
};
