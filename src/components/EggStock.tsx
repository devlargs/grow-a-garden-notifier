import React, { useEffect, useRef } from "react";
import { EGGS } from "../constants/eggs";
import { getStockComponentClasses } from "../utils/environment";
import {
  checkForRestocksAndCollect,
  initializeStockTracking,
  sendCombinedRestockNotification,
} from "../utils/notificationChecker";
import {
  getItemBorderClasses,
  getItemImage,
  getItemVariant,
  useStockManager,
} from "../utils/stockUtils";

const EggStock: React.FC = () => {
  const {
    items: eggs,
    timeUntilUpdate,
    loading,
    isUpdating,
  } = useStockManager(
    "https://gagapi.onrender.com/eggs",
    EGGS,
    true // Use 30-minute intervals for eggs
  );

  const isInitializedRef = useRef(false);
  const classes = getStockComponentClasses();

  // Initialize stock tracking on first load
  useEffect(() => {
    if (!loading && eggs.length > 0 && !isInitializedRef.current) {
      initializeStockTracking("eggs", eggs);
      isInitializedRef.current = true;
    }
  }, [loading, eggs]);

  // Check for restocks when data changes
  useEffect(() => {
    if (eggs.length > 0) {
      checkForRestocksAndCollect("eggs", eggs).then(() => {
        // Send combined notification after checking all categories
        sendCombinedRestockNotification();
      });
    }
  }, [eggs]);

  const getEggImage = (eggName: string): string => {
    return getItemImage(eggName, "/images/eggs", "webp");
  };

  const getEggVariant = (eggName: string): string => {
    return getItemVariant(eggName, EGGS);
  };

  const getEggBorderClasses = (eggName: string): string => {
    const variant = getEggVariant(eggName);
    return getItemBorderClasses(variant);
  };

  if (loading) {
    return (
      <div className={classes.container}>
        <div className="flex items-center justify-between mb-3">
          <h2 className={classes.header}>EGGS STOCK</h2>
          <div className={classes.timer}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <div className="flex items-center justify-between mb-3">
        <h2 className={classes.header}>EGGS STOCK</h2>
        <div className={`flex items-center ${classes.timer}`}>
          <svg
            className="w-3 h-3 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <polyline points="12,6 12,12 16,14" strokeWidth="2" />
          </svg>
          {timeUntilUpdate}
        </div>
      </div>

      {isUpdating && (
        <div className="mb-3 bg-yellow-900 border border-yellow-500 rounded-lg p-2">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-500 mr-2"></div>
            <span className="text-yellow-200 text-xs">Updating...</span>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {eggs.map((egg) => (
          <div
            key={egg.name}
            className={`${classes.itemContainer} ${getEggBorderClasses(
              egg.name
            )}`}
          >
            <div className="flex items-center">
              <img
                src={getEggImage(egg.name)}
                alt={egg.name}
                className={classes.itemImage}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/eggs/common-egg.webp";
                }}
              />
              <span className={classes.itemText}>{egg.name}</span>
            </div>
            <span className={classes.itemQuantity}>x{egg.quantity}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EggStock;
