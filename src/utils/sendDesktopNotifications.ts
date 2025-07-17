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
  if (typeof window !== "undefined" && window.chrome?.notifications) {
    try {
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

  if (!("Notification" in window)) {
    console.error("This browser does not support desktop notifications.");
    alert("This browser does not support desktop notifications.");
    return false;
  }

  try {
    if (Notification.permission === "granted") {
      const notification = new Notification(title, options);

      notification.onclick = () => {
        window.focus();
      };

      notification.onclose = () => {};

      return true;
    } else if (Notification.permission === "denied") {
      console.error("Notification permission denied by user");
      alert(
        "Please enable notifications in your browser settings to receive garden reminders."
      );
      return false;
    } else {
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        const notification = new Notification(title, options);

        notification.onclick = () => {
          window.focus();
        };

        notification.onclose = () => {};

        return true;
      } else {
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
