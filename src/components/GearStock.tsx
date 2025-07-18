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

  const previousGearsRef = useRef<typeof gears>([]);
  const isInitializedRef = useRef(false);

  // Initialize stock tracking on first load
  useEffect(() => {
    if (!loading && gears.length > 0 && !isInitializedRef.current) {
      initializeStockTracking("gears", gears);
      isInitializedRef.current = true;
    }
  }, [loading, gears]);

  // Check for restocks when items update
  useEffect(() => {
    if (!loading && gears.length > 0 && previousGearsRef.current.length > 0) {
      checkForRestocks("gears", gears);
    }
    previousGearsRef.current = gears;
  }, [gears, loading]);

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
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-xl">GEARS STOCK</h2>
          <div className="text-gray-300 text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-bold text-xl">GEARS STOCK</h2>
        <div className="flex items-center text-gray-300 text-sm">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <polyline points="12,6 12,12 16,14" strokeWidth="2" />
          </svg>
          UPDATES IN: {timeUntilUpdate}
        </div>
      </div>

      {isUpdating && (
        <div className="mb-4 bg-yellow-900 border border-yellow-500 rounded-lg p-3">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500 mr-3"></div>
            <span className="text-yellow-200">Updating... please wait.</span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {gears.map((gear) => (
          <div
            key={gear.name}
            className={`bg-gray-700 rounded p-3 flex items-center justify-between ${getGearBorderClasses(
              gear.name
            )}`}
          >
            <div className="flex items-center">
              <img
                src={getGearImage(gear.name)}
                alt={gear.name}
                className="w-8 h-8 mr-3"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/gears/watering-can.webp";
                }}
              />
              <span className="text-white">{gear.name}</span>
            </div>
            <span className="text-gray-300">x{gear.quantity}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GearStock;
