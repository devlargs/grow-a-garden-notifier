import React, { useEffect, useRef, useState } from "react";

export interface StockItem {
  quantity: number;
  name: string;
}

export const getNextFiveMinuteInterval = (): number => {
  const now = new Date();
  const minutes = now.getMinutes();
  const nextInterval = Math.ceil(minutes / 5) * 5;

  const nextUpdate = new Date(now);
  nextUpdate.setMinutes(nextInterval, 0, 0);

  if (nextUpdate.getTime() <= now.getTime()) {
    nextUpdate.setMinutes(nextUpdate.getMinutes() + 5);
  }

  return nextUpdate.getTime();
};

export const getNextThirtyMinuteInterval = (): number => {
  const now = new Date();
  const minutes = now.getMinutes();
  const nextInterval = Math.ceil(minutes / 30) * 30;

  const nextUpdate = new Date(now);
  nextUpdate.setMinutes(nextInterval, 0, 0);

  if (nextUpdate.getTime() <= now.getTime()) {
    nextUpdate.setMinutes(nextUpdate.getMinutes() + 30);
  }

  return nextUpdate.getTime();
};

export const getCurrentFiveMinuteInterval = (): number => {
  const now = new Date();
  const minutes = now.getMinutes();
  const currentInterval = Math.floor(minutes / 5) * 5;

  const currentUpdate = new Date(now);
  currentUpdate.setMinutes(currentInterval, 0, 0);

  return currentUpdate.getTime();
};

export const getCurrentThirtyMinuteInterval = (): number => {
  const now = new Date();
  const minutes = now.getMinutes();
  const currentInterval = Math.floor(minutes / 30) * 30;

  const currentUpdate = new Date(now);
  currentUpdate.setMinutes(currentInterval, 0, 0);

  return currentUpdate.getTime();
};

export const shouldFetchAtFiveMinuteMark = (
  lastFetchTimeRef: React.MutableRefObject<number>
): boolean => {
  const now = new Date();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  const isAtMark = minutes % 5 === 0 && seconds <= 5;

  if (isAtMark) {
    const currentInterval = getCurrentFiveMinuteInterval();

    if (currentInterval !== lastFetchTimeRef.current) {
      lastFetchTimeRef.current = currentInterval;
      return true;
    }
  }

  return false;
};

export const shouldFetchAtThirtyMinuteMark = (
  lastFetchTimeRef: React.MutableRefObject<number>
): boolean => {
  const now = new Date();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  const isAtMark = minutes % 30 === 0 && seconds <= 5;

  if (isAtMark) {
    const currentInterval = getCurrentThirtyMinuteInterval();

    if (currentInterval !== lastFetchTimeRef.current) {
      lastFetchTimeRef.current = currentInterval;
      return true;
    }
  }

  return false;
};

export const areItemsEqual = <T extends StockItem>(
  items1: T[],
  items2: T[]
): boolean => {
  if (items1.length !== items2.length) return false;

  const sorted1 = [...items1].sort((a, b) => a.name.localeCompare(b.name));
  const sorted2 = [...items2].sort((a, b) => a.name.localeCompare(b.name));

  return JSON.stringify(sorted1) === JSON.stringify(sorted2);
};

export const sortItemsByDefinedOrder = <T extends StockItem>(
  itemsArray: T[],
  definedOrder: Array<{ name: string }>
): T[] => {
  const orderMap = new Map<string, number>();
  definedOrder.forEach((item, index) => {
    orderMap.set(item.name, index);
  });

  return itemsArray.sort((a, b) => {
    const orderA = orderMap.get(a.name) ?? Number.MAX_SAFE_INTEGER;
    const orderB = orderMap.get(b.name) ?? Number.MAX_SAFE_INTEGER;
    return orderA - orderB;
  });
};

export const clearUpdateInterval = (
  updateIntervalRef: React.MutableRefObject<number | null>
): void => {
  if (updateIntervalRef.current) {
    clearInterval(updateIntervalRef.current);
    updateIntervalRef.current = null;
  }
};

export const startUpdateInterval = (
  updateIntervalRef: React.MutableRefObject<number | null>,
  fetchFunction: (isRetry: boolean) => Promise<void>
): void => {
  clearUpdateInterval(updateIntervalRef);
  updateIntervalRef.current = setInterval(() => {
    fetchFunction(true);
  }, 15000);
};

export const formatTimeRemaining = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}m ${seconds
    .toString()
    .padStart(2, "0")}s`;
};

export const getItemImage = (
  itemName: string,
  imagePath: string,
  fileExtension: string
): string => {
  const imageName = itemName.toLowerCase().replace(/\s+/g, "-");
  return `${imagePath}/${imageName}.${fileExtension}`;
};

export const getItemVariant = <T extends { name: string; variant: string }>(
  itemName: string,
  definedItems: T[]
): string => {
  const item = definedItems.find((i) => i.name === itemName);
  return item ? item.variant : "Common";
};

export const getItemBorderClasses = (variant: string): string => {
  switch (variant) {
    case "Common":
      return "";
    case "Uncommon":
      return "border-2 border-green-500";
    case "Rare":
      return "border-2 border-blue-500";
    case "Legendary":
      return "border-2 border-yellow-500";
    case "Mythical":
      return "border-2 border-purple-500";
    case "Divine":
      return "border-2 border-orange-500";
    case "Prismatic":
      return "border-2 border-transparent relative prismatic-seed";
    default:
      return "";
  }
};

// Custom hook for stock management
export const useStockManager = (
  apiEndpoint: string,
  definedOrder: Array<{ name: string }>,
  useThirtyMinuteInterval: boolean = false
) => {
  const [items, setItems] = useState<StockItem[]>([]);
  const [timeUntilUpdate, setTimeUntilUpdate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const updateIntervalRef = useRef<number | null>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const hasInitialLoadedRef = useRef<boolean>(false);
  const previousItemsRef = useRef<StockItem[]>([]);

  const getNextInterval = useThirtyMinuteInterval
    ? getNextThirtyMinuteInterval
    : getNextFiveMinuteInterval;

  const shouldFetchAtMark = useThirtyMinuteInterval
    ? shouldFetchAtThirtyMinuteMark
    : shouldFetchAtFiveMinuteMark;

  const fetchItems = async (isRetry: boolean = false): Promise<void> => {
    try {
      if (!isRetry && hasInitialLoadedRef.current) {
        setIsUpdating(true);
      }

      const response = await fetch(apiEndpoint);
      if (response.ok) {
        const data: StockItem[] = await response.json();

        if (!hasInitialLoadedRef.current) {
          const sortedItems = sortItemsByDefinedOrder(data, definedOrder);
          setItems(sortedItems);
          previousItemsRef.current = data;
          hasInitialLoadedRef.current = true;
        } else {
          const hasChanged = !areItemsEqual(data, previousItemsRef.current);

          if (hasChanged) {
            const sortedItems = sortItemsByDefinedOrder(data, definedOrder);
            setItems(sortedItems);
            previousItemsRef.current = data;
            setIsUpdating(false);
            clearUpdateInterval(updateIntervalRef);
          } else {
            if (!isRetry) {
              startUpdateInterval(updateIntervalRef, fetchItems);
            }
          }
        }
      } else {
        if (hasInitialLoadedRef.current) {
          startUpdateInterval(updateIntervalRef, fetchItems);
        }
      }
    } catch (error) {
      if (hasInitialLoadedRef.current) {
        startUpdateInterval(updateIntervalRef, fetchItems);
      }
    } finally {
      if (loading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchItems();

    const interval = setInterval(() => {
      const now = new Date();
      const nextUpdate = getNextInterval();
      const timeRemaining = nextUpdate - now.getTime();

      setTimeUntilUpdate(formatTimeRemaining(timeRemaining));

      if (shouldFetchAtMark(lastFetchTimeRef)) {
        fetchItems();
      }
    }, 1000);

    const initialNext = getNextInterval();
    const initialRemaining = initialNext - Date.now();
    setTimeUntilUpdate(formatTimeRemaining(initialRemaining));

    return () => {
      clearInterval(interval);
      clearUpdateInterval(updateIntervalRef);
    };
  }, [apiEndpoint, definedOrder, useThirtyMinuteInterval]);

  return {
    items,
    timeUntilUpdate,
    loading,
    isUpdating,
    fetchItems,
  };
};
