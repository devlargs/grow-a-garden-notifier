import React, { useEffect, useRef } from "react";
import { SEEDS } from "../constants/seeds";
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
      checkForRestocks("seeds", seeds);
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
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">Seeds</h2>
          <div className="flex items-center text-gray-400 text-sm">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <polyline points="12,6 12,12 16,14" strokeWidth="2" />
            </svg>
            Loading...
          </div>
        </div>
        <div className="animate-pulse space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-white">Seeds</h2>
        <div className="flex items-center text-gray-400 text-sm">
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
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
            className={`flex items-center justify-between p-3 rounded-lg border-2 ${getSeedBorderClasses(
              seed.name
            )} bg-gray-700`}
          >
            <div className="flex items-center space-x-3">
              <img
                src={getSeedImage(seed.name)}
                alt={seed.name}
                className="w-8 h-8 rounded"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/seeds/default-seed.png";
                }}
              />
              <span
                className={`text-sm font-medium ${getSeedBorderClasses(
                  seed.name
                ).replace("border-", "text-")}`}
              >
                {seed.name}
              </span>
            </div>
            <span className="text-white font-semibold">{seed.quantity}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeedsStock;
