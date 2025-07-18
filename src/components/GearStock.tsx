import React, { useEffect, useRef } from "react";
import { GEARS } from "../constants/gears";
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
      <div className="bg-gray-800 rounded-lg p-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-bold text-sm">GEARS STOCK</h2>
          <div className="text-gray-300 text-xs">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-3 h-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white font-bold text-sm">GEARS STOCK</h2>
        <div className="flex items-center text-gray-300 text-xs">
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
            className={`bg-gray-700 rounded p-2 flex items-center justify-between ${getGearBorderClasses(
              gear.name
            )}`}
          >
            <div className="flex items-center">
              <img
                src={getGearImage(gear.name)}
                alt={gear.name}
                className="w-6 h-6 mr-2"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/gears/watering-can.webp";
                }}
              />
              <span className="text-white text-sm">{gear.name}</span>
            </div>
            <span className="text-gray-300 text-xs">x{gear.quantity}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GearStock;
