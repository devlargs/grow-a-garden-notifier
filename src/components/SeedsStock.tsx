import React, { useEffect, useState } from "react";

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

  // Function to check if current time is at a 5-minute interval
  const isAtFiveMinuteInterval = (): boolean => {
    const now = new Date();
    return now.getMinutes() % 5 === 0 && now.getSeconds() === 0;
  };

  // Function to check if the last request was within the past 5 minutes
  const isLastRequestWithinFiveMinutes = (): boolean => {
    const lastRequestTime = localStorage.getItem("SEEDS_STOCK_LAST_REQUEST");
    if (!lastRequestTime) {
      return false;
    }

    const lastRequestTimestamp = parseInt(lastRequestTime);
    const now = Date.now();
    const fiveMinutesInMs = 5 * 60 * 1000; // 5 minutes in milliseconds

    return now - lastRequestTimestamp < fiveMinutesInMs;
  };

  // Function to fetch seeds from API
  const fetchSeeds = async (): Promise<void> => {
    try {
      const response = await fetch("https://gagapi.onrender.com/seeds");
      if (response.ok) {
        const data: Seed[] = await response.json();
        console.log(data);
        setSeeds(data);
        localStorage.setItem("SEEDS_STOCK", JSON.stringify(data));
        localStorage.setItem("SEEDS_STOCK_LAST_REQUEST", Date.now().toString());
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
        setSeeds(parsedSeeds);
      } catch (error) {
        console.error("Error parsing stored seeds:", error);
      }
    }
    setLoading(false);
  };

  // Function to initialize seeds data
  const initializeSeedsData = (): void => {
    // Check if we have a recent request within 5 minutes
    if (isLastRequestWithinFiveMinutes()) {
      // Use existing data from localStorage
      loadSeedsFromStorage();
    } else {
      // Make a new API request
      fetchSeeds();
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

      // Fetch data if we're at a 5-minute interval and last request was more than 5 minutes ago
      if (isAtFiveMinuteInterval() && !isLastRequestWithinFiveMinutes()) {
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
        {seeds.map((seed, index) => (
          <div
            key={index}
            className={`bg-gray-700 rounded p-3 flex items-center justify-between ${
              seed.quantity >= 4 ? "border-2 border-green-500" : ""
            }`}
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
