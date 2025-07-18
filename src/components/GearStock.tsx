import React, { useEffect, useRef } from "react";
import { GEARS } from "../constants/gears";
import { getStockComponentClasses } from "../utils/environment";
import {
  checkForRestocks,
  initializeStockTracking,
} from "../utils/notificationChecker";
import {
  getItemBorderClasses,
  getItemImage,
  getItemVariant,
  useStockManager,
} from "../utils/stockUtils";

const GearStock: React.FC = () => {
  const {
    items: gears,
    timeUntilUpdate,
    loading,
    isUpdating,
  } = useStockManager(
    "https://gagapi.onrender.com/gear",
    GEARS,
    false // Use 5-minute intervals for gears
  );

  const isInitializedRef = useRef(false);
  const classes = getStockComponentClasses();

  // Initialize stock tracking on first load
  useEffect(() => {
    if (!loading && gears.length > 0 && !isInitializedRef.current) {
      initializeStockTracking("gears", gears);
      isInitializedRef.current = true;
    }
  }, [loading, gears]);

  // Check for restocks when data changes
  useEffect(() => {
    if (gears.length > 0) {
      checkForRestocks("gears", gears);
    }
  }, [gears]);

  const getGearImage = (gearName: string): string => {
    return getItemImage(gearName, "/images/gears", "webp");
  };

  const getGearVariant = (gearName: string): string => {
    return getItemVariant(gearName, GEARS);
  };

  const getGearBorderClasses = (gearName: string): string => {
    const variant = getGearVariant(gearName);
    return getItemBorderClasses(variant);
  };

  if (loading) {
    return (
      <div className={classes.container}>
        <div className="flex items-center justify-between mb-3">
          <h2 className={classes.header}>GEARS STOCK</h2>
          <div className={classes.timer}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <div className="flex items-center justify-between mb-3">
        <h2 className={classes.header}>GEARS STOCK</h2>
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
        {gears.map((gear) => (
          <div
            key={gear.name}
            className={`${classes.itemContainer} ${getGearBorderClasses(
              gear.name
            )}`}
          >
            <div className="flex items-center">
              <img
                src={getGearImage(gear.name)}
                alt={gear.name}
                className={classes.itemImage}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/gears/watering-can.webp";
                }}
              />
              <span className={classes.itemText}>{gear.name}</span>
            </div>
            <span className={classes.itemQuantity}>x{gear.quantity}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GearStock;
