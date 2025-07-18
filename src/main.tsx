import { useState } from "react";
import ReactDOM from "react-dom/client";
import EggStock from "./components/EggStock";
import GearStock from "./components/GearStock";
import NotificationModal from "./components/NotificationModal";
import SeedsStock from "./components/SeedsStock";
import "./style.css";
import { sendDesktopNotification } from "./utils/sendDesktopNotifications";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNotification = async () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleModalConfirm = async (selectedItems: string[]) => {
    console.log("Selected items:", selectedItems);
    // Here you can implement the notification logic for selected items
    await sendDesktopNotification("Garden Reminder", {
      body: `Notifications set for: ${selectedItems.join(", ")}`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="mx-auto max-w-7xl">
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
          <SeedsStock />
          <GearStock />
          <EggStock />
        </div>
      </div>

      <NotificationModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
      />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
