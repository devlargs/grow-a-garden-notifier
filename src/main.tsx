import ReactDOM from "react-dom/client";
import EggStock from "./components/EggStock";
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
        <h1 className="text-white font-bold text-3xl mb-8 text-center mt-10">
          Grow a Garden Stock Notifications
        </h1>

        <div className="text-center mb-8">
          <button
            onClick={handleNotification}
            className="bg-gray-700 border border-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Send Notification
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GearStock />
          <EggStock />
          <SeedsStock />
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
