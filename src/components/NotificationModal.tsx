import React, { useEffect, useState } from "react";
import { EGGS } from "../constants/eggs";
import { GEARS } from "../constants/gears";
import { SEEDS } from "../constants/seeds";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedItems: string[]) => void;
}

interface ItemSelection {
  [key: string]: boolean;
}

// Get item variant from constants
const getItemVariant = <T extends { name: string; variant: string }>(
  itemName: string,
  definedItems: T[]
): string => {
  const item = definedItems.find((i) => i.name === itemName);
  return item ? item.variant : "Common";
};

// Get text color based on variant
const getItemTextColor = (variant: string): string => {
  switch (variant) {
    case "Common":
      return "text-white";
    case "Uncommon":
      return "text-green-400";
    case "Rare":
      return "text-blue-400";
    case "Legendary":
      return "text-yellow-400";
    case "Mythical":
      return "text-purple-400";
    case "Divine":
      return "text-orange-400";
    case "Prismatic":
      return "bg-gradient-to-r from-red-400 via-purple-400 to-blue-400 bg-clip-text text-transparent";
    default:
      return "text-white";
  }
};

// Load saved selections from localStorage
const loadSavedSelections = (): ItemSelection => {
  try {
    const saved = localStorage.getItem("NOTIFY_LIST");
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

// Save selections to localStorage
const saveSelections = (selections: ItemSelection) => {
  try {
    localStorage.setItem("NOTIFY_LIST", JSON.stringify(selections));
  } catch (error) {
    console.error("Failed to save selections to localStorage:", error);
  }
};

const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [selectedItems, setSelectedItems] = useState<ItemSelection>({});
  const [gearSelections, setGearSelections] = useState<ItemSelection>({});
  const [seedSelections, setSeedSelections] = useState<ItemSelection>({});
  const [eggSelections, setEggSelections] = useState<ItemSelection>({});

  // Load saved selections on component mount
  useEffect(() => {
    const savedSelections = loadSavedSelections();
    setSelectedItems(savedSelections);

    // Split saved selections by category
    const gearItems = GEARS.map((item) => item.name);
    const seedItems = SEEDS.map((item) => item.name);
    const eggItems = EGGS.map((item) => item.name);

    const gearSelections: ItemSelection = {};
    const seedSelections: ItemSelection = {};
    const eggSelections: ItemSelection = {};

    Object.keys(savedSelections).forEach((itemName) => {
      if (gearItems.includes(itemName)) {
        gearSelections[itemName] = savedSelections[itemName];
      } else if (seedItems.includes(itemName)) {
        seedSelections[itemName] = savedSelections[itemName];
      } else if (eggItems.includes(itemName)) {
        eggSelections[itemName] = savedSelections[itemName];
      }
    });

    setGearSelections(gearSelections);
    setSeedSelections(seedSelections);
    setEggSelections(eggSelections);
  }, []);

  // Combine all selections
  useEffect(() => {
    setSelectedItems({
      ...gearSelections,
      ...seedSelections,
      ...eggSelections,
    });
  }, [gearSelections, seedSelections, eggSelections]);

  const handleItemToggle = (
    itemName: string,
    category: "gear" | "seed" | "egg"
  ) => {
    const setterMap = {
      gear: setGearSelections,
      seed: setSeedSelections,
      egg: setEggSelections,
    };

    setterMap[category]((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
    }));
  };

  const handleSelectAll = (category: "gear" | "seed" | "egg") => {
    const items =
      category === "gear" ? GEARS : category === "seed" ? SEEDS : EGGS;
    const setterMap = {
      gear: setGearSelections,
      seed: setSeedSelections,
      egg: setEggSelections,
    };

    const allSelected = items.every((item) => {
      const selections =
        category === "gear"
          ? gearSelections
          : category === "seed"
          ? seedSelections
          : eggSelections;
      return selections[item.name];
    });

    const newSelections: ItemSelection = {};
    items.forEach((item) => {
      newSelections[item.name] = !allSelected;
    });

    setterMap[category](newSelections);
  };

  const handleClearAll = () => {
    setGearSelections({});
    setSeedSelections({});
    setEggSelections({});
  };

  const handleConfirm = () => {
    const selectedItemNames = Object.keys(selectedItems).filter(
      (key) => selectedItems[key]
    );

    // Save to localStorage
    saveSelections(selectedItems);

    onConfirm(selectedItemNames);
    onClose();
  };

  const getSelectedCount = (category: "gear" | "seed" | "egg") => {
    const selections =
      category === "gear"
        ? gearSelections
        : category === "seed"
        ? seedSelections
        : eggSelections;
    const items =
      category === "gear" ? GEARS : category === "seed" ? SEEDS : EGGS;
    return items.filter((item) => selections[item.name]).length;
  };

  const getTotalSelectedCount = () => {
    return Object.values(selectedItems).filter(Boolean).length;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <svg
              className="w-6 h-6 text-green-500 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <h2 className="text-white text-xl font-bold">Send Notification</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <p className="text-gray-300 mb-6">
          Select Items where you want to be notified of.{" "}
          {getTotalSelectedCount()} items selected.
        </p>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Gear Column */}
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-gray-400 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-white font-semibold">Gear</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-300 text-sm">
                  {getSelectedCount("gear")}/{GEARS.length}
                </span>
                <button
                  onClick={() => handleSelectAll("gear")}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Select All
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {GEARS.map((gear) => {
                const variant = getItemVariant(gear.name, GEARS);
                const textColor = getItemTextColor(variant);
                return (
                  <div
                    key={gear.name}
                    className="flex items-center justify-between p-2 rounded hover:bg-gray-600"
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={gearSelections[gear.name] || false}
                        onChange={() => handleItemToggle(gear.name, "gear")}
                        className="mr-3"
                      />
                      <span className={textColor}>{gear.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Seeds Column */}
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-gray-400 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <span className="text-white font-semibold">Seeds</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-300 text-sm">
                  {getSelectedCount("seed")}/{SEEDS.length}
                </span>
                <button
                  onClick={() => handleSelectAll("seed")}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Select All
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {SEEDS.map((seed) => {
                const variant = getItemVariant(seed.name, SEEDS);
                const textColor = getItemTextColor(variant);
                return (
                  <div
                    key={seed.name}
                    className="flex items-center justify-between p-2 rounded hover:bg-gray-600"
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={seedSelections[seed.name] || false}
                        onChange={() => handleItemToggle(seed.name, "seed")}
                        className="mr-3"
                      />
                      <span className={textColor}>{seed.name} Seeds</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Eggs Column */}
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-gray-400 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
                <span className="text-white font-semibold">Eggs</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-300 text-sm">
                  {getSelectedCount("egg")}/{EGGS.length}
                </span>
                <button
                  onClick={() => handleSelectAll("egg")}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Select All
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {EGGS.map((egg) => {
                const variant = getItemVariant(egg.name, EGGS);
                const textColor = getItemTextColor(variant);
                return (
                  <div
                    key={egg.name}
                    className="flex items-center justify-between p-2 rounded hover:bg-gray-600"
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={eggSelections[egg.name] || false}
                        onChange={() => handleItemToggle(egg.name, "egg")}
                        className="mr-3"
                      />
                      <span className={textColor}>{egg.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleClearAll}
              className="text-gray-400 hover:text-white"
            >
              Clear All
            </button>
            <span className="text-gray-300">
              {getTotalSelectedCount()} items selected
            </span>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Confirm Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
