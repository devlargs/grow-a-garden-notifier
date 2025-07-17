import React from "react";
import { EGGS } from "../constants/eggs";
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
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-xl">EGGS STOCK</h2>
          <div className="text-gray-300 text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-bold text-xl">EGGS STOCK</h2>
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
        {eggs.map((egg) => (
          <div
            key={egg.name}
            className={`bg-gray-700 rounded p-3 flex items-center justify-between ${getEggBorderClasses(
              egg.name
            )}`}
          >
            <div className="flex items-center">
              <img
                src={getEggImage(egg.name)}
                alt={egg.name}
                className="w-8 h-8 mr-3"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/eggs/common-egg.webp";
                }}
              />
              <span className="text-white">{egg.name}</span>
            </div>
            <span className="text-gray-300">x{egg.quantity}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EggStock;
