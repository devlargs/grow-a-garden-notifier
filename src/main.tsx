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
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Title */}
        <h1 className="text-black font-bold text-2xl mb-4">
          Grow a Garden Stock Notifications
        </h1>

        {/* Notification Button */}
        <button
          onClick={handleNotification}
          className="bg-gray-100 border border-black text-black px-4 py-2 rounded mb-6"
        >
          Send Notification
        </button>

        {/* Section Heading */}
        <h2 className="text-black font-bold text-xl mb-8">GEAR STOCK</h2>

        {/* Large Clock Icon */}
        <div className="flex justify-center">
          <svg
            className="w-96 h-96"
            fill="none"
            stroke="black"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" strokeWidth="3" />
            <line
              x1="12"
              y1="12"
              x2="9"
              y2="12"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1="12"
              y1="12"
              x2="15"
              y2="12"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
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
