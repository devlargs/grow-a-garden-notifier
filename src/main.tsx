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
    await sendDesktopNotification("Garden Reminder", {
      body: `Notifications set for: ${selectedItems.join(", ")}`,
    });
  };

  return (
    <div className="w-[800px] h-[600px] bg-gray-900 p-4 overflow-hidden">
      <div className="h-full flex flex-col">
        <h1 className="text-white font-bold text-xl mb-4 text-center">
          Grow a Garden Stock Notifications
        </h1>

        <div className="text-center mb-4">
          <button
            onClick={handleNotification}
            className="bg-gray-700 border border-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm"
          >
            Create Notification
          </button>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden">
          <div className="overflow-y-auto custom-scrollbar">
            <SeedsStock />
          </div>
          <div className="overflow-y-auto custom-scrollbar">
            <GearStock />
          </div>
          <div className="overflow-y-auto custom-scrollbar">
            <EggStock />
          </div>
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
