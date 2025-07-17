import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import { sendDesktopNotification } from "./utils/sendDesktopNotifications";

function App() {
  const handleNotification = async () => {
    console.log("Attempting to send notification...");
    const result = await sendDesktopNotification("Garden Reminder", {
      body: "Time to check your garden!",
    });
    console.log("Notification result:", result);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="mx-auto">
        {/* Title */}
        <h1 className="text-white font-bold text-3xl mb-8 text-center">
          Grow a Garden Stock Notifications
        </h1>

        {/* Notification Button */}
        <div className="text-center mb-8">
          <button
            onClick={handleNotification}
            className="bg-gray-700 border border-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Send Notification
          </button>
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Gear Stock Column */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-xl">GEAR STOCK</h2>
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
                UPDATES IN: 02m 21s
              </div>
            </div>

            <div className="space-y-3">
              {/* Cleaning Spray */}
              <div className="bg-gray-700 rounded p-3 flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src="/images/apple.png"
                    alt="Cleaning Spray"
                    className="w-8 h-8 mr-3"
                  />
                  <span className="text-white">Cleaning Spray</span>
                </div>
                <span className="text-gray-300">x2</span>
              </div>

              {/* Trowel */}
              <div className="bg-gray-700 rounded p-3 flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src="/images/carrot.png"
                    alt="Trowel"
                    className="w-8 h-8 mr-3"
                  />
                  <span className="text-white">Trowel</span>
                </div>
                <span className="text-gray-300">x2</span>
              </div>

              {/* Watering Can */}
              <div className="bg-gray-700 rounded p-3 flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src="/images/blueberry.png"
                    alt="Watering Can"
                    className="w-8 h-8 mr-3"
                  />
                  <span className="text-white">Watering Can</span>
                </div>
                <span className="text-gray-300">x2</span>
              </div>

              {/* Recall Wrench */}
              <div className="bg-gray-700 rounded p-3 flex items-center justify-between border-2 border-green-500">
                <div className="flex items-center">
                  <img
                    src="/images/corn.png"
                    alt="Recall Wrench"
                    className="w-8 h-8 mr-3"
                  />
                  <span className="text-white">Recall Wrench</span>
                </div>
                <span className="text-gray-300">x1</span>
              </div>

              {/* Favorite Tool */}
              <div className="bg-gray-700 rounded p-3 flex items-center justify-between border-2 border-purple-500">
                <div className="flex items-center">
                  <img
                    src="/images/strawberry.png"
                    alt="Favorite Tool"
                    className="w-8 h-8 mr-3"
                  />
                  <span className="text-white">Favorite Tool</span>
                </div>
                <span className="text-gray-300">x1</span>
              </div>

              {/* Harvest Tool */}
              <div className="bg-gray-700 rounded p-3 flex items-center justify-between border-2 border-green-500">
                <div className="flex items-center">
                  <img
                    src="/images/tomato.png"
                    alt="Harvest Tool"
                    className="w-8 h-8 mr-3"
                  />
                  <span className="text-white">Harvest Tool</span>
                </div>
                <span className="text-gray-300">x1</span>
              </div>
            </div>
          </div>

          {/* Egg Stock Column */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-xl">EGG STOCK</h2>
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
                UPDATES IN: 00h 22m 21s
              </div>
            </div>

            <div className="space-y-3">
              {/* Common Egg */}
              <div className="bg-gray-700 rounded p-3 flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src="/images/mango.png"
                    alt="Common Egg"
                    className="w-8 h-8 mr-3"
                  />
                  <span className="text-white">Common Egg</span>
                </div>
                <span className="text-gray-300">x1</span>
              </div>

              {/* Common Egg */}
              <div className="bg-gray-700 rounded p-3 flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src="/images/mango.png"
                    alt="Common Egg"
                    className="w-8 h-8 mr-3"
                  />
                  <span className="text-white">Common Egg</span>
                </div>
                <span className="text-gray-300">x1</span>
              </div>

              {/* Common Egg */}
              <div className="bg-gray-700 rounded p-3 flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src="/images/mango.png"
                    alt="Common Egg"
                    className="w-8 h-8 mr-3"
                  />
                  <span className="text-white">Common Egg</span>
                </div>
                <span className="text-gray-300">x1</span>
              </div>
            </div>
          </div>

          {/* Seeds Stock Column */}
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
                UPDATES IN: 02m 21s
              </div>
            </div>

            <div className="space-y-3">
              {/* Carrot */}
              <div className="bg-gray-700 rounded p-3 flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src="/images/carrot.png"
                    alt="Carrot"
                    className="w-8 h-8 mr-3"
                  />
                  <span className="text-white">Carrot</span>
                </div>
                <span className="text-gray-300">x20</span>
              </div>

              {/* Corn */}
              <div className="bg-gray-700 rounded p-3 flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src="/images/corn.png"
                    alt="Corn"
                    className="w-8 h-8 mr-3"
                  />
                  <span className="text-white">Corn</span>
                </div>
                <span className="text-gray-300">x2</span>
              </div>

              {/* Daffodil */}
              <div className="bg-gray-700 rounded p-3 flex items-center justify-between border-2 border-green-500">
                <div className="flex items-center">
                  <img
                    src="/images/daffodil.png"
                    alt="Daffodil"
                    className="w-8 h-8 mr-3"
                  />
                  <span className="text-white">Daffodil</span>
                </div>
                <span className="text-gray-300">x4</span>
              </div>

              {/* Strawberry */}
              <div className="bg-gray-700 rounded p-3 flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src="/images/strawberry.png"
                    alt="Strawberry"
                    className="w-8 h-8 mr-3"
                  />
                  <span className="text-white">Strawberry</span>
                </div>
                <span className="text-gray-300">x3</span>
              </div>

              {/* Tomato */}
              <div className="bg-gray-700 rounded p-3 flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src="/images/tomato.png"
                    alt="Tomato"
                    className="w-8 h-8 mr-3"
                  />
                  <span className="text-white">Tomato</span>
                </div>
                <span className="text-gray-300">x2</span>
              </div>

              {/* Blueberry */}
              <div className="bg-gray-700 rounded p-3 flex items-center justify-between border-2 border-green-500">
                <div className="flex items-center">
                  <img
                    src="/images/blueberry.png"
                    alt="Blueberry"
                    className="w-8 h-8 mr-3"
                  />
                  <span className="text-white">Blueberry</span>
                </div>
                <span className="text-gray-300">x4</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
