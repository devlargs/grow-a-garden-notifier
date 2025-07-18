import { useState } from "react";
import ReactDOM from "react-dom/client";
import EggStock from "./components/EggStock";
import GearStock from "./components/GearStock";
import NotificationModal from "./components/NotificationModal";
import SeedsStock from "./components/SeedsStock";
import "./style.css";
import { getLayoutClasses, isChromeExtension } from "./utils/environment";
import { sendDesktopNotification } from "./utils/sendDesktopNotifications";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const layoutClasses = getLayoutClasses();
  const isExtension = isChromeExtension();

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
    <div className={layoutClasses.container}>
      <div className={isExtension ? "h-full flex flex-col" : ""}>
        <h1
          className={`text-white font-bold text-center ${
            isExtension ? "text-xl mb-4" : "text-4xl mb-8"
          }`}
        >
          Grow a Garden Stock Notifications
        </h1>

        <div className={`text-center ${isExtension ? "mb-4" : "mb-8"}`}>
          <button
            onClick={handleNotification}
            className={`bg-gray-700 border border-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors ${
              isExtension ? "text-sm" : "text-lg px-6 py-3"
            }`}
          >
            Create Notification
          </button>
        </div>

        <div className={layoutClasses.grid}>
          <div className={layoutClasses.stockContainer}>
            <SeedsStock />
          </div>
          <div className={layoutClasses.stockContainer}>
            <GearStock />
          </div>
          <div className={layoutClasses.stockContainer}>
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
