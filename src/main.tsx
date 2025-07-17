import React from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import { sendDesktopNotification } from "./utils/sendDesktopNotifications";

function Counter() {
  const handleNotification = async () => {
    console.log("Attempting to send notification...");
    console.log(
      "Chrome API available:",
      typeof window !== "undefined" && !!window.chrome
    );
    console.log(
      "Chrome notifications available:",
      typeof window !== "undefined" && !!window.chrome?.notifications
    );
    console.log("Web notifications available:", "Notification" in window);
    console.log("Web notification permission:", Notification.permission);

    const result = await sendDesktopNotification("Garden Reminder", {
      body: "Time to check your garden!",
    });
    console.log("Notification result:", result);
  };

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold mb-4">
        Grow a Garden Stock Notifications
      </h1>
      <button
        onClick={handleNotification}
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
      >
        Send Notification
      </button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Counter />
  </React.StrictMode>
);
