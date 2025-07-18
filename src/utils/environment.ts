// Utility to detect if we're running as a Chrome extension
export const isChromeExtension = (): boolean => {
  return typeof chrome !== "undefined" && chrome.runtime && !!chrome.runtime.id;
};

// Get the appropriate layout classes based on environment
export const getLayoutClasses = () => {
  if (isChromeExtension()) {
    // Chrome extension popup layout - compact
    return {
      container: "w-[800px] h-[600px] bg-gray-900 p-4 overflow-hidden",
      grid: "flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden",
      stockContainer: "overflow-y-auto custom-scrollbar",
    };
  } else {
    // Local development layout - spacious
    return {
      container: "min-h-screen bg-gray-900 p-8",
      grid: "grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-7xl mx-auto mt-8",
      stockContainer: "",
    };
  }
};

// Get the appropriate stock component classes based on environment
export const getStockComponentClasses = () => {
  if (isChromeExtension()) {
    // Chrome extension popup layout - compact
    return {
      container: "bg-gray-800 rounded-lg p-3 h-full",
      header: "text-white font-bold text-sm",
      timer: "text-gray-300 text-xs",
      itemContainer:
        "bg-gray-700 rounded p-2 flex items-center justify-between",
      itemImage: "w-6 h-6 mr-2",
      itemText: "text-white text-sm",
      itemQuantity: "text-gray-300 text-xs",
    };
  } else {
    // Local development layout - spacious
    return {
      container: "bg-gray-800 rounded-xl p-8 shadow-lg",
      header: "text-white font-bold text-2xl mb-6",
      timer: "text-gray-400 text-lg",
      itemContainer:
        "bg-gray-700 rounded-lg p-6 flex items-center justify-between mb-4 shadow-md hover:bg-gray-650 transition-colors",
      itemImage: "w-12 h-12 mr-4",
      itemText: "text-white text-lg font-medium",
      itemQuantity: "text-gray-300 text-lg font-semibold",
    };
  }
};
