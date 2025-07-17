import React, { useEffect, useRef, useState } from "react";
import { SEEDS } from "../constants/seeds";

interface Seed {
  quantity: number;
  name: string;
}

const SeedsStock: React.FC = () => {
  const [seeds, setSeeds] = useState<Seed[]>([]);
  const [timeUntilUpdate, setTimeUntilUpdate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const updateIntervalRef = useRef<number | null>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const hasInitialLoadedRef = useRef<boolean>(false);
  const previousSeedsRef = useRef<Seed[]>([]);

  const getNextFiveMinuteInterval = (): number => {
    const now = new Date();
    const minutes = now.getMinutes();
    const nextInterval = Math.ceil(minutes / 5) * 5;

    const nextUpdate = new Date(now);
    nextUpdate.setMinutes(nextInterval, 0, 0);

    if (nextUpdate.getTime() <= now.getTime()) {
      nextUpdate.setMinutes(nextUpdate.getMinutes() + 5);
    }

    return nextUpdate.getTime();
  };

  const getCurrentFiveMinuteInterval = (): number => {
    const now = new Date();
    const minutes = now.getMinutes();
    const currentInterval = Math.floor(minutes / 5) * 5;

    const currentUpdate = new Date(now);
    currentUpdate.setMinutes(currentInterval, 0, 0);

    return currentUpdate.getTime();
  };

  const shouldFetchAtFiveMinuteMark = (): boolean => {
    const now = new Date();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const isAtMark = minutes % 5 === 0 && seconds <= 5;

    if (isAtMark) {
      const currentInterval = getCurrentFiveMinuteInterval();

      if (currentInterval !== lastFetchTimeRef.current) {
        lastFetchTimeRef.current = currentInterval;
        return true;
      }
    }

    return false;
  };

  const areSeedsEqual = (seeds1: Seed[], seeds2: Seed[]): boolean => {
    if (seeds1.length !== seeds2.length) return false;

    const sorted1 = [...seeds1].sort((a, b) => a.name.localeCompare(b.name));
    const sorted2 = [...seeds2].sort((a, b) => a.name.localeCompare(b.name));

    return JSON.stringify(sorted1) === JSON.stringify(sorted2);
  };

  const sortSeedsByDefinedOrder = (seedsArray: Seed[]): Seed[] => {
    const seedOrderMap = new Map<string, number>();
    SEEDS.forEach((seed, index) => {
      seedOrderMap.set(seed.name, index);
    });

    return seedsArray.sort((a, b) => {
      const orderA = seedOrderMap.get(a.name) ?? Number.MAX_SAFE_INTEGER;
      const orderB = seedOrderMap.get(b.name) ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
  };

  const clearUpdateInterval = (): void => {
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
  };

  const startUpdateInterval = (): void => {
    clearUpdateInterval();
    updateIntervalRef.current = setInterval(() => {
      fetchSeeds(true);
    }, 15000);
  };

  const fetchSeeds = async (isRetry: boolean = false): Promise<void> => {
    try {
      if (!isRetry && hasInitialLoadedRef.current) {
        setIsUpdating(true);
      }

      const response = await fetch("https://gagapi.onrender.com/seeds");
      if (response.ok) {
        const data: Seed[] = await response.json();

        if (!hasInitialLoadedRef.current) {
          const sortedSeeds = sortSeedsByDefinedOrder(data);
          setSeeds(sortedSeeds);
          previousSeedsRef.current = data;
          hasInitialLoadedRef.current = true;
        } else {
          const hasChanged = !areSeedsEqual(data, previousSeedsRef.current);

          if (hasChanged) {
            const sortedSeeds = sortSeedsByDefinedOrder(data);
            setSeeds(sortedSeeds);
            previousSeedsRef.current = data;
            setIsUpdating(false);
            clearUpdateInterval();
          } else {
            if (!isRetry) {
              startUpdateInterval();
            }
          }
        }
      } else {
        if (hasInitialLoadedRef.current) {
          startUpdateInterval();
        }
      }
    } catch (error) {
      if (hasInitialLoadedRef.current) {
        startUpdateInterval();
      }
    } finally {
      if (loading) {
        setLoading(false);
      }
    }
  };

  const formatTimeRemaining = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}m ${seconds
      .toString()
      .padStart(2, "0")}s`;
  };

  const getSeedImage = (seedName: string): string => {
    const imageName = seedName.toLowerCase().replace(/\s+/g, "-");
    return `/images/seeds/${imageName}.png`;
  };

  const getSeedVariant = (seedName: string): string => {
    const seed = SEEDS.find((s) => s.name === seedName);
    return seed ? seed.variant : "Common";
  };

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

  useEffect(() => {
    fetchSeeds();

    const interval = setInterval(() => {
      const now = new Date();
      const nextUpdate = getNextFiveMinuteInterval();
      const timeRemaining = nextUpdate - now.getTime();

      setTimeUntilUpdate(formatTimeRemaining(timeRemaining));

      if (shouldFetchAtFiveMinuteMark()) {
        fetchSeeds();
      }
    }, 1000);

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
