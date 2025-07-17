import React, { useEffect, useState } from "react";
import { SEEDS } from "../constants/seeds";

interface Seed {
  quantity: number;
  name: string;
}

const SeedsStock: React.FC = () => {
  const [seeds, setSeeds] = useState<Seed[]>([]);
  const [timeUntilUpdate, setTimeUntilUpdate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // Function to get the next 5-minute interval timestamp
  const getNextFiveMinuteInterval = (): number => {
    const now = new Date();
    const minutes = now.getMinutes();
    const nextInterval = Math.ceil(minutes / 5) * 5;

    const nextUpdate = new Date(now);
    nextUpdate.setMinutes(nextInterval, 0, 0); // Set seconds and milliseconds to 0

    // If we're already at a 5-minute mark, go to the next one
    if (nextUpdate.getTime() <= now.getTime()) {
      nextUpdate.setMinutes(nextUpdate.getMinutes() + 5);
    }

    return nextUpdate.getTime();
  };

  // Function to get the current 5-minute interval timestamp
  const getCurrentFiveMinuteInterval = (): number => {
    const now = new Date();
    const minutes = now.getMinutes();
    const currentInterval = Math.floor(minutes / 5) * 5;

    const currentUpdate = new Date(now);
    currentUpdate.setMinutes(currentInterval, 0, 0); // Set seconds and milliseconds to 0

    return currentUpdate.getTime();
  };

  // Function to check if we should fetch data for the current 5-minute interval
  const shouldFetchForCurrentInterval = (): boolean => {
    const currentInterval = getCurrentFiveMinuteInterval();
    const lastFetchedInterval = localStorage.getItem(
      "SEEDS_STOCK_LAST_INTERVAL"
    );

    if (!lastFetchedInterval) {
      return true;
    }

    const lastFetchedTimestamp = parseInt(lastFetchedInterval);
    return currentInterval > lastFetchedTimestamp;
  };

  // Function to sort seeds based on the order defined in constants/seeds.ts
  const sortSeedsByDefinedOrder = (seedsArray: Seed[]): Seed[] => {
    // Create a map of seed names to their index in the SEEDS constant
    const seedOrderMap = new Map<string, number>();
    SEEDS.forEach((seed, index) => {
      seedOrderMap.set(seed.name, index);
    });

    // Sort the seeds array based on the order defined in SEEDS
    return seedsArray.sort((a, b) => {
      const orderA = seedOrderMap.get(a.name) ?? Number.MAX_SAFE_INTEGER;
      const orderB = seedOrderMap.get(b.name) ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
  };

  // Function to fetch seeds from API
  const fetchSeeds = async (): Promise<void> => {
    try {
      const response = await fetch("https://gagapi.onrender.com/seeds");
      if (response.ok) {
        const data: Seed[] = await response.json();
        console.log(data);
        const sortedSeeds = sortSeedsByDefinedOrder(data);
        setSeeds(sortedSeeds);
        localStorage.setItem("SEEDS_STOCK", JSON.stringify(sortedSeeds));
        localStorage.setItem("SEEDS_STOCK_LAST_REQUEST", Date.now().toString());
        localStorage.setItem(
          "SEEDS_STOCK_LAST_INTERVAL",
          getCurrentFiveMinuteInterval().toString()
        );
      }
    } catch (error) {
      console.error("Error fetching seeds:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to load seeds from localStorage
  const loadSeedsFromStorage = (): void => {
    const storedSeeds = localStorage.getItem("SEEDS_STOCK");
    if (storedSeeds) {
      try {
        const parsedSeeds: Seed[] = JSON.parse(storedSeeds);
        const sortedSeeds = sortSeedsByDefinedOrder(parsedSeeds);
        setSeeds(sortedSeeds);
      } catch (error) {
        console.error("Error parsing stored seeds:", error);
      }
    }
    setLoading(false);
  };

  // Function to initialize seeds data
  const initializeSeedsData = (): void => {
    // Check if we should fetch data for the current 5-minute interval
    if (shouldFetchForCurrentInterval()) {
      // Make a new API request for the current interval
      fetchSeeds();
    } else {
      // Use existing data from localStorage
      loadSeedsFromStorage();
    }
  };

  // Function to format time remaining
  const formatTimeRemaining = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}m ${seconds
      .toString()
      .padStart(2, "0")}s`;
  };

  // Function to get image path for seed
  const getSeedImage = (seedName: string): string => {
    const imageName = seedName.toLowerCase().replace(/\s+/g, "-");
    return `/images/${imageName}.png`;
  };

  // Function to get variant for a seed
  const getSeedVariant = (seedName: string): string => {
    const seed = SEEDS.find((s) => s.name === seedName);
    return seed ? seed.variant : "Common";
  };

  // Function to get border classes based on variant
  const getSeedBorderClasses = (seedName: string): string => {
    const variant = getSeedVariant(seedName);

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

  // Initialize component
  useEffect(() => {
    // Initialize seeds data (either from cache or API)
    initializeSeedsData();

    // Set up interval to check every second
    const interval = setInterval(() => {
      const now = new Date();
      const nextUpdate = getNextFiveMinuteInterval();
      const timeRemaining = nextUpdate - now.getTime();

      setTimeUntilUpdate(formatTimeRemaining(timeRemaining));

      // Fetch data if we should fetch for the current 5-minute interval
      if (shouldFetchForCurrentInterval()) {
        fetchSeeds();
      }
    }, 1000);

    // Set initial countdown
    const initialNext = getNextFiveMinuteInterval();
    const initialRemaining = initialNext - Date.now();
    setTimeUntilUpdate(formatTimeRemaining(initialRemaining));

    return () => clearInterval(interval);
  }, []);

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
                  // Fallback to a default image if specific image doesn't exist
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/default-seed.png";
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
