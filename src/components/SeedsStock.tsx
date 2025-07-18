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

  const previousSeedsRef = useRef<typeof seeds>([]);
  const isInitializedRef = useRef(false);

  // Initialize stock tracking on first load
  useEffect(() => {
    if (!loading && seeds.length > 0 && !isInitializedRef.current) {
      initializeStockTracking("seeds", seeds);
      isInitializedRef.current = true;
    }
  }, [loading, seeds]);

  // Check for restocks when items update
  useEffect(() => {
    if (!loading && seeds.length > 0 && previousSeedsRef.current.length > 0) {
      checkForRestocks("seeds", seeds).catch((error) => {
        console.error("Error checking for restocks:", error);
      });
    }
    previousSeedsRef.current = seeds;
  }, [seeds, loading]);

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
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-xl">SEEDS STOCK</h2>
          <div className="text-gray-300 text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-bold text-xl">SEEDS STOCK</h2>
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
        {seeds.map((seed) => (
          <div
            key={seed.name}
            className={`bg-gray-700 rounded p-3 flex items-center justify-between ${getSeedBorderClasses(
              seed.name
            )}`}
          >
            <div className="flex items-center">
              <img
                src={getSeedImage(seed.name)}
                alt={seed.name}
                className="w-8 h-8 mr-3"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/seeds/default-seed.png";
                }}
              />
              <span className="text-white">{seed.name}</span>
            </div>
            <span className="text-gray-300">x{seed.quantity}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeedsStock;
