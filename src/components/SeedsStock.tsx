import React, { useEffect, useRef, useState } from "react";
import { SEEDS } from "../constants/seeds";

interface Seed {
  quantity: number;
  name: string;
}

const SeedsStock: React.FC = () => {
  const [seeds, setSeeds] = useState<Seed[]>([]);
  const [previousSeeds, setPreviousSeeds] = useState<Seed[]>([]);
  const [timeUntilUpdate, setTimeUntilUpdate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const updateIntervalRef = useRef<number | null>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const hasInitialLoadedRef = useRef<boolean>(false);
  const previousSeedsRef = useRef<Seed[]>([]);

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

  // Function to check if we should fetch at a 5-minute interval
  const shouldFetchAtFiveMinuteMark = (): boolean => {
    const now = new Date();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // Check if we're at a 5-minute mark (0, 5, 10, 15, etc.) and within the first 5 seconds
    const isAtMark = minutes % 5 === 0 && seconds <= 5;

    if (isAtMark) {
      // Get the current 5-minute interval timestamp
      const currentInterval = getCurrentFiveMinuteInterval();

      // Only fetch if we haven't fetched for this interval yet
      if (currentInterval !== lastFetchTimeRef.current) {
        console.log(
          `5-minute mark detected: minutes=${minutes}, seconds=${seconds}`
        );
        lastFetchTimeRef.current = currentInterval;
        return true;
      }
    }

    return false;
  };

  // Function to compare if two seed arrays are the same
  const areSeedsEqual = (seeds1: Seed[], seeds2: Seed[]): boolean => {
    if (seeds1.length !== seeds2.length) return false;

    // Sort both arrays by name for comparison
    const sorted1 = [...seeds1].sort((a, b) => a.name.localeCompare(b.name));
    const sorted2 = [...seeds2].sort((a, b) => a.name.localeCompare(b.name));

    console.log(sorted1, sorted2);

    return JSON.stringify(sorted1) === JSON.stringify(sorted2);
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

  // Function to clear the update interval
  const clearUpdateInterval = (): void => {
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
  };

  // Function to start the 15-second update interval
  const startUpdateInterval = (): void => {
    clearUpdateInterval();
    updateIntervalRef.current = setInterval(() => {
      fetchSeeds(true);
    }, 15000);
  };

  // Function to fetch seeds from API
  const fetchSeeds = async (isRetry: boolean = false): Promise<void> => {
    console.log(
      `fetchSeeds called - isRetry: ${isRetry}, hasInitialLoaded: ${hasInitialLoadedRef.current}`
    );
    try {
      if (!isRetry && hasInitialLoadedRef.current) {
        setIsUpdating(true);
      }

      const response = await fetch("https://gagapi.onrender.com/seeds");
      if (response.ok) {
        const data: Seed[] = await response.json();
        console.log("Fetched data:", data);

        if (!hasInitialLoadedRef.current) {
          // Initial load - save data as baseline for future comparisons
          const sortedSeeds = sortSeedsByDefinedOrder(data);
          setSeeds(sortedSeeds);
          setPreviousSeeds(data); // Keep state in sync for UI
          previousSeedsRef.current = data; // Store in ref for reliable comparison
          hasInitialLoadedRef.current = true;
          setIsInitialLoad(false);
          console.log("Initial load - data saved as baseline");
        } else {
          // Compare new data with previous data using ref
          const hasChanged = !areSeedsEqual(data, previousSeedsRef.current);
          console.log(
            "Comparing with previous data:",
            hasChanged ? "Changed" : "Same",
            { previousSeeds: previousSeedsRef.current, newSeeds: data }
          );

          if (hasChanged) {
            // Data has changed, update everything
            const sortedSeeds = sortSeedsByDefinedOrder(data);
            setSeeds(sortedSeeds);
            setPreviousSeeds(data); // Keep state in sync for UI
            previousSeedsRef.current = data; // Update ref with new data
            setIsUpdating(false);
            clearUpdateInterval();
            console.log(
              "Data changed - updated seeds and cleared retry interval"
            );
          } else {
            // Data is the same as previous
            if (!isRetry) {
              // This is a 5-minute fetch with same data, start retrying every 15 seconds
              console.log(
                "5-min fetch: same as previous - starting retry interval"
              );
              startUpdateInterval();
            } else {
              // This is a 15-second retry with same data, keep retrying
              console.log(
                "15s retry: still same as previous - continuing to retry"
              );
              // Keep the updating indicator and interval running
            }
          }
        }
      } else {
        console.error("Failed to fetch seeds:", response.status);
        if (hasInitialLoadedRef.current) {
          // On error during update, try again in 15 seconds
          startUpdateInterval();
        }
      }
    } catch (error) {
      console.error("Error fetching seeds:", error);
      if (hasInitialLoadedRef.current) {
        // On error during update, try again in 15 seconds
        startUpdateInterval();
      }
    } finally {
      if (loading) {
        setLoading(false);
      }
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
    fetchSeeds();

    // Set up interval to check every second
    const interval = setInterval(() => {
      const now = new Date();
      const nextUpdate = getNextFiveMinuteInterval();
      const timeRemaining = nextUpdate - now.getTime();

      setTimeUntilUpdate(formatTimeRemaining(timeRemaining));

      // Fetch data if we should fetch for the current 5-minute interval
      if (shouldFetchAtFiveMinuteMark()) {
        console.log("5-minute mark detected - calling fetchSeeds()");
        fetchSeeds();
      }
    }, 1000);

    // Set initial countdown
    const initialNext = getNextFiveMinuteInterval();
    const initialRemaining = initialNext - Date.now();
    setTimeUntilUpdate(formatTimeRemaining(initialRemaining));

    return () => {
      clearInterval(interval);
      clearUpdateInterval();
    };
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
