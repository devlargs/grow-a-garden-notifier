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
  const notificationList = getNotificationList();
  const previousStock = getPreviousStock(category);

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
  saveCurrentStock(category, currentItems);
};

// Initialize stock tracking for a category
export const initializeStockTracking = (
  category: string,
  items: StockItem[]
) => {
  saveCurrentStock(category, items);
};
