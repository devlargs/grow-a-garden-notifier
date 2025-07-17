import ReactDOM from "react-dom/client";
import GearStock from "./components/GearStock";
import SeedsStock from "./components/SeedsStock";
import "./style.css";
import { sendDesktopNotification } from "./utils/sendDesktopNotifications";

function App() {
  const handleNotification = async () => {
    await sendDesktopNotification("Garden Reminder", {
      body: "Time to check your garden!",
    });
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
          <GearStock />

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
                    src="/images/seeds/mango.png"
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
                    src="/images/seeds/mango.png"
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
                    src="/images/seeds/mango.png"
                    alt="Common Egg"
                    className="w-8 h-8 mr-3"
                  />
                  <span className="text-white">Common Egg</span>
                </div>
                <span className="text-gray-300">x1</span>
              </div>
            </div>
          </div>

          <SeedsStock />
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
