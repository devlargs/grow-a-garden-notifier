import React, { useEffect, useRef } from "react";
import { SEEDS } from "../constants/seeds";
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

const SeedsStock: React.FC = () => {
  const {
    items: seeds,
    timeUntilUpdate,
    loading,
    isUpdating,
  } = useStockManager(
    "https://gagapi.onrender.com/seeds",
    SEEDS,
    false // Use 5-minute intervals for seeds
  );

  const isInitializedRef = useRef(false);
  const classes = getStockComponentClasses();

  // Initialize stock tracking on first load
  useEffect(() => {
    if (!loading && seeds.length > 0 && !isInitializedRef.current) {
      initializeStockTracking("seeds", seeds);
      isInitializedRef.current = true;
    }
  }, [loading, seeds]);

  // Check for restocks when data changes
  useEffect(() => {
    if (seeds.length > 0) {
      checkForRestocksAndCollect("seeds", seeds).then(() => {
        // Send combined notification after checking all categories
        sendCombinedRestockNotification();
      });
    }
  }, [seeds]);

  const getSeedImage = (seedName: string): string => {
    return getItemImage(seedName, "/images/seeds", "png");
  };

  const getSeedVariant = (seedName: string): string => {
    return getItemVariant(seedName, SEEDS);
  };

  const getSeedBorderClasses = (seedName: string): string => {
    const variant = getSeedVariant(seedName);
    return getItemBorderClasses(variant);
  };

  if (loading) {
    return (
      <div className={classes.container}>
        <div className="flex items-center justify-between mb-3">
          <h2 className={classes.header}>SEEDS STOCK</h2>
          <div className={classes.timer}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <div className="flex items-center justify-between mb-3">
        <h2 className={classes.header}>SEEDS STOCK</h2>
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
        {seeds.map((seed) => (
          <div
            key={seed.name}
            className={`${classes.itemContainer} ${getSeedBorderClasses(
              seed.name
            )}`}
          >
            <div className="flex items-center">
              <img
                src={getSeedImage(seed.name)}
                alt={seed.name}
                className={classes.itemImage}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/seeds/default-seed.png";
                }}
              />
              <span className={classes.itemText}>{seed.name}</span>
            </div>
            <span className={classes.itemQuantity}>x{seed.quantity}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeedsStock;
