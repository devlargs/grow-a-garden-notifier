// Chrome extension types
declare global {
  interface Window {
    chrome?: {
      notifications?: {
        create: (options: {
          type: string;
          iconUrl: string;
          title: string;
          message: string;
          priority: number;
        }) => Promise<string>;
      };
    };
  }
}

export async function sendDesktopNotification(
  title: string,
  options: NotificationOptions = {}
): Promise<boolean> {
  // Check if we're in a browser extension context
  if (typeof window !== "undefined" && window.chrome?.notifications) {
    try {
      // Use Chrome extension notifications API
      await window.chrome.notifications.create({
        type: "basic",
        iconUrl: "/icon.png",
        title: title,
        message: options.body || "",
        priority: 1,
      });
      return true;
    } catch (error) {
      console.error("Error sending Chrome extension notification:", error);
      return false;
    }
  }

  // Fallback to web notifications for regular web pages
  // Check if the browser supports notifications
  if (!("Notification" in window)) {
    console.error("This browser does not support desktop notifications.");
    alert("This browser does not support desktop notifications.");
    return false;
  }

  try {
    // Check current permission status
    if (Notification.permission === "granted") {
      // Permission already granted, send notification immediately
      const notification = new Notification(title, options);

      // Optional: Add event listeners for notification interactions
      notification.onclick = () => {
        console.log("Notification clicked");
        window.focus();
      };

      notification.onclose = () => {
        console.log("Notification closed");
      };

      return true;
    } else if (Notification.permission === "denied") {
      // Permission denied, cannot send notifications
      console.error("Notification permission denied by user");
      alert(
        "Please enable notifications in your browser settings to receive garden reminders."
      );
      return false;
    } else {
      // Permission not determined, request it
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        // Permission granted, send notification
        const notification = new Notification(title, options);

        // Optional: Add event listeners for notification interactions
        notification.onclick = () => {
          console.log("Notification clicked");
          window.focus();
        };

        notification.onclose = () => {
          console.log("Notification closed");
        };

        return true;
      } else {
        // Permission denied after request
        console.error("Notification permission denied after request");
        alert(
          "Notification permission denied. You won't receive garden reminders."
        );
        return false;
      }
    }
  } catch (error) {
    console.error("Error sending desktop notification:", error);
    return false;
  }
}
